import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { cvVersionSchema, LIMITS } from '~/schemas'
import { PersistenceError } from '~/services/persistence/types'
import type {
  PersistenceErrorCode,
  SkippedVersion,
  StorageAdapter,
} from '~/services/persistence/types'
import { sessionStorageAdapter } from '~/services/persistence/webStorageAdapter'
import type { CvVersion } from '~/types'
import { createSampleCvData, createVersion } from '~/utils/cvDefaults'
import { newId } from '~/utils/id'

// Explicit imports (not auto-imports) so this store runs in the plain-node unit project.

/** Delay before edits are written to storage. Inputs are debounced separately (D-15). */
export const SAVE_DELAY_MS = 500

export const useVersionsStore = defineStore('versions', () => {
  let adapter: StorageAdapter = sessionStorageAdapter

  const versions = ref<CvVersion[]>([])
  const activeId = ref<string | null>(null)
  const status = ref<'idle' | 'loading' | 'ready'>('idle')
  /** Versions that couldn't be loaded (quarantined, D-39). The UI warns about these. */
  const skipped = ref<SkippedVersion[]>([])
  /** Last save failure, so the UI can show a toast. Cleared by the next successful save. */
  const saveError = ref<PersistenceErrorCode | null>(null)

  const active = computed(() => versions.value.find((v) => v.id === activeId.value) ?? null)

  // ── persistence ────────────────────────────────────────────────────────
  const pending = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined

  function scheduleSave(id: string) {
    pending.add(id)
    clearTimeout(timer)
    timer = setTimeout(() => void flush(), SAVE_DELAY_MS)
  }

  /** Writes all pending versions now. Call before unload, and in tests. */
  async function flush() {
    clearTimeout(timer)
    const ids = [...pending]
    pending.clear()
    for (const id of ids) {
      const version = versions.value.find((v) => v.id === id)
      if (!version) continue
      try {
        await adapter.saveVersion(version)
        saveError.value = null
      } catch (error) {
        saveError.value = error instanceof PersistenceError ? error.code : 'unavailable'
      }
    }
  }

  async function persistActiveId() {
    try {
      await adapter.setActiveId(activeId.value)
    } catch (error) {
      saveError.value = error instanceof PersistenceError ? error.code : 'unavailable'
    }
  }

  // ── lifecycle ──────────────────────────────────────────────────────────
  /**
   * Loads versions from storage (client only). A first-time guest gets an editable
   * example CV (D-41). Pass an adapter in tests, or for the API adapter in phase 3.
   */
  async function hydrate(options: { adapter?: StorageAdapter; sampleName?: string } = {}) {
    if (options.adapter) adapter = options.adapter
    status.value = 'loading'
    const loaded = await adapter.listVersions()
    versions.value = loaded.versions
    skipped.value = loaded.skipped

    if (versions.value.length === 0) {
      const sample = createVersion(options.sampleName ?? 'My CV', createSampleCvData())
      versions.value = [sample]
      scheduleSave(sample.id)
    }

    const storedActive = await adapter.getActiveId()
    activeId.value = versions.value.some((v) => v.id === storedActive)
      ? storedActive
      : versions.value[0]!.id
    if (activeId.value !== storedActive) await persistActiveId()
    status.value = 'ready'
  }

  // ── editing ────────────────────────────────────────────────────────────
  /**
   * The only write path. It applies `mutate` to a copy, validates the whole version, and commits
   * only if it's valid (D-38). It returns false (and changes nothing) for invalid results, unknown
   * ids, or a mutation that throws.
   */
  function commit(id: string, mutate: (draft: CvVersion) => void): boolean {
    const index = versions.value.findIndex((v) => v.id === id)
    if (index < 0) return false
    // toRaw: structuredClone can't copy reactive proxies. Nested values are raw underneath.
    const draft = structuredClone(toRaw(versions.value[index]!))
    try {
      mutate(draft)
    } catch {
      return false
    }
    draft.updatedAt = new Date().toISOString()
    const parsed = cvVersionSchema.safeParse(draft)
    if (!parsed.success) return false
    versions.value[index] = parsed.data
    scheduleSave(id)
    return true
  }

  // ── version management ─────────────────────────────────────────────────
  function add(version: CvVersion): string | null {
    if (!cvVersionSchema.safeParse(version).success) return null
    versions.value.push(version)
    scheduleSave(version.id)
    return version.id
  }

  /** New version from the example CV. Returns its id, or null if the name is invalid. */
  function create(name: string): string | null {
    return add(createVersion(name, createSampleCvData()))
  }

  /** Copies a version (content, template, theme, language) under a new name. */
  function duplicate(sourceId: string, name: string): string | null {
    const source = versions.value.find((v) => v.id === sourceId)
    if (!source) return null
    const now = new Date().toISOString()
    return add({
      ...structuredClone(toRaw(source)),
      id: newId(),
      name,
      createdAt: now,
      updatedAt: now,
    })
  }

  function rename(id: string, name: string): boolean {
    return commit(id, (draft) => {
      draft.name = name.trim()
    })
  }

  /** Removes a version. The last remaining version can't be removed. */
  async function remove(id: string): Promise<boolean> {
    const index = versions.value.findIndex((v) => v.id === id)
    if (index < 0 || versions.value.length === 1) return false
    versions.value.splice(index, 1)
    pending.delete(id)
    if (activeId.value === id) {
      activeId.value = versions.value[Math.min(index, versions.value.length - 1)]!.id
      await persistActiveId()
    }
    try {
      await adapter.removeVersion(id)
    } catch (error) {
      saveError.value = error instanceof PersistenceError ? error.code : 'unavailable'
    }
    return true
  }

  async function setActive(id: string): Promise<boolean> {
    if (!versions.value.some((v) => v.id === id)) return false
    activeId.value = id
    await persistActiveId()
    return true
  }

  return {
    versions,
    activeId,
    active,
    status,
    skipped,
    saveError,
    maxNameLength: LIMITS.versionName,
    hydrate,
    flush,
    commit,
    create,
    duplicate,
    rename,
    remove,
    setActive,
  }
})
