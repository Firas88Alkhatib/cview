import { cvVersionSchema } from '~/schemas'
import {
  CURRENT_SCHEMA_VERSION,
  isEnvelope,
  migrations,
  upgrade,
} from '~/services/persistence/migrations'
import type { MigrationRegistry, StoredEnvelope } from '~/services/persistence/migrations'
import { PersistenceError } from '~/services/persistence/types'
import type { LoadedVersions, SkippedVersion, StorageAdapter } from '~/services/persistence/types'
import type { CvVersion } from '~/types'

export interface WebStorageAdapterOptions {
  /** Returns undefined when storage isn't available (SSR, blocked by the browser). */
  getStorage: () => Storage | undefined
  prefix?: string
  registry?: MigrationRegistry
  currentSchemaVersion?: number
}

/**
 * StorageAdapter over the Web Storage API (sessionStorage for guests, D-6).
 * Layout: `<prefix>index` (ordered ids), `<prefix>version:<id>` (envelope), `<prefix>active`,
 * and `<prefix>quarantine:<id>` (raw data that couldn't be loaded, D-39).
 */
export function createWebStorageAdapter(options: WebStorageAdapterOptions): StorageAdapter {
  const {
    getStorage,
    prefix = 'cview:',
    registry = migrations,
    currentSchemaVersion = CURRENT_SCHEMA_VERSION,
  } = options

  const keys = {
    index: `${prefix}index`,
    active: `${prefix}active`,
    version: (id: string) => `${prefix}version:${id}`,
    quarantine: (id: string) => `${prefix}quarantine:${id}`,
  }

  function storageOrNull(): Storage | null {
    try {
      return getStorage() ?? null
    } catch {
      return null // Accessing sessionStorage itself can throw when site data is blocked.
    }
  }

  function write(storage: Storage, key: string, value: string) {
    try {
      storage.setItem(key, value)
    } catch (cause) {
      throw new PersistenceError('quota', { cause })
    }
  }

  function readIndex(storage: Storage): string[] {
    try {
      const parsed: unknown = JSON.parse(storage.getItem(keys.index) ?? '[]')
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : []
    } catch {
      return []
    }
  }

  function writeIndex(storage: Storage, ids: string[]) {
    write(storage, keys.index, JSON.stringify(ids))
  }

  type ReadResult =
    | { kind: 'ok'; version: CvVersion }
    | { kind: 'missing' }
    | { kind: 'skipped'; skipped: SkippedVersion }

  function readVersion(storage: Storage, id: string): ReadResult {
    const raw = storage.getItem(keys.version(id))
    if (raw === null) return { kind: 'missing' }

    let envelope: unknown
    try {
      envelope = JSON.parse(raw)
    } catch {
      envelope = undefined
    }
    if (!isEnvelope(envelope)) return quarantine(storage, id, raw, 'corrupt')

    const result = upgrade(envelope, registry, currentSchemaVersion)
    if (!result.ok) return quarantine(storage, id, raw, result.reason)
    return { kind: 'ok', version: result.version }
  }

  function quarantine(
    storage: Storage,
    id: string,
    raw: string,
    reason: SkippedVersion['reason'],
  ): ReadResult {
    // Best effort: keep the raw data for diagnosis, and never let quarantining break loading.
    try {
      storage.setItem(keys.quarantine(id), raw)
      storage.removeItem(keys.version(id))
      writeIndex(
        storage,
        readIndex(storage).filter((x) => x !== id),
      )
    } catch {
      /* ignore */
    }
    return { kind: 'skipped', skipped: { id, reason } }
  }

  return {
    async listVersions(): Promise<LoadedVersions> {
      const storage = storageOrNull()
      if (!storage) return { versions: [], skipped: [] }

      const versions: CvVersion[] = []
      const skipped: SkippedVersion[] = []
      const present: string[] = []
      for (const id of readIndex(storage)) {
        const result = readVersion(storage, id)
        if (result.kind === 'ok') {
          versions.push(result.version)
          present.push(id)
        } else if (result.kind === 'skipped') {
          skipped.push(result.skipped)
        }
      }
      // Drop ids whose data vanished, so the index heals itself.
      const index = readIndex(storage)
      if (index.some((id) => !present.includes(id))) {
        try {
          writeIndex(storage, present)
        } catch {
          /* ignore: a read must not fail on a write */
        }
      }
      return { versions, skipped }
    },

    async loadVersion(id) {
      const storage = storageOrNull()
      if (!storage) return null
      const result = readVersion(storage, id)
      return result.kind === 'ok' ? result.version : null
    },

    async saveVersion(version) {
      const parsed = cvVersionSchema.safeParse(version)
      if (!parsed.success) throw new PersistenceError('invalid', { cause: parsed.error })

      const storage = storageOrNull()
      if (!storage) throw new PersistenceError('unavailable')

      const envelope: StoredEnvelope = {
        schemaVersion: currentSchemaVersion,
        version: parsed.data,
      }
      write(storage, keys.version(version.id), JSON.stringify(envelope))
      const index = readIndex(storage)
      if (!index.includes(version.id)) writeIndex(storage, [...index, version.id])
    },

    async removeVersion(id) {
      const storage = storageOrNull()
      if (!storage) return
      storage.removeItem(keys.version(id))
      writeIndex(
        storage,
        readIndex(storage).filter((x) => x !== id),
      )
      if (storage.getItem(keys.active) === id) storage.removeItem(keys.active)
    },

    async getActiveId() {
      return storageOrNull()?.getItem(keys.active) ?? null
    },

    async setActiveId(id) {
      const storage = storageOrNull()
      if (!storage) return
      if (id === null) storage.removeItem(keys.active)
      else write(storage, keys.active, id)
    },
  }
}

/** Guest persistence (D-6). The data is gone when the tab closes. */
export const sessionStorageAdapter: StorageAdapter = createWebStorageAdapter({
  getStorage: () => (typeof window === 'undefined' ? undefined : window.sessionStorage),
})
