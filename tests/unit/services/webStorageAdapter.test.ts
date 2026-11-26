import { beforeEach, describe, expect, it } from 'vitest'
import { PersistenceError } from '~/services/persistence/types'
import type { StorageAdapter } from '~/services/persistence/types'
import { createWebStorageAdapter } from '~/services/persistence/webStorageAdapter'
import type { CvVersion } from '~/types'
import { makeProfile, makeCvData, makeVersion } from '~~/tests/fixtures/cv'
import { MemoryStorage } from '~~/tests/fixtures/storage'

let storage: MemoryStorage
let adapter: StorageAdapter

beforeEach(() => {
  storage = new MemoryStorage()
  adapter = createWebStorageAdapter({ getStorage: () => storage })
})

/** Writes a raw entry the way an older or broken app version might have. */
function seedRaw(id: string, raw: string) {
  const index = JSON.parse(storage.getItem('cview:index') ?? '[]') as string[]
  storage.setItem('cview:index', JSON.stringify([...index, id]))
  storage.setItem(`cview:version:${id}`, raw)
}

describe('webStorageAdapter: round trip', () => {
  it('saves and loads a version unchanged', async () => {
    const version = makeVersion()
    await adapter.saveVersion(version)
    expect(await adapter.loadVersion(version.id)).toEqual(version)
  })

  it('lists versions in the order they were first saved, updating in place', async () => {
    const [a, b] = [makeVersion({ name: 'A' }), makeVersion({ name: 'B' })]
    await adapter.saveVersion(a)
    await adapter.saveVersion(b)
    await adapter.saveVersion({ ...a, name: 'A2' })
    const { versions, skipped } = await adapter.listVersions()
    expect(versions.map((v) => v.name)).toEqual(['A2', 'B'])
    expect(skipped).toEqual([])
  })

  it('stores data in a versioned envelope under namespaced keys', async () => {
    const version = makeVersion()
    await adapter.saveVersion(version)
    const envelope = JSON.parse(storage.getItem(`cview:version:${version.id}`)!)
    expect(envelope).toEqual({ schemaVersion: 1, version })
    expect(storage.keys().every((k) => k.startsWith('cview:'))).toBe(true)
  })

  it('removes a version and clears it as active', async () => {
    const version = makeVersion()
    await adapter.saveVersion(version)
    await adapter.setActiveId(version.id)
    await adapter.removeVersion(version.id)
    expect(await adapter.loadVersion(version.id)).toBeNull()
    expect((await adapter.listVersions()).versions).toEqual([])
    expect(await adapter.getActiveId()).toBeNull()
  })

  it('remembers and clears the active id', async () => {
    await adapter.setActiveId('abc')
    expect(await adapter.getActiveId()).toBe('abc')
    await adapter.setActiveId(null)
    expect(await adapter.getActiveId()).toBeNull()
  })
})

describe('webStorageAdapter: only valid data is persisted (D-38)', () => {
  it('rejects saving an invalid version and writes nothing', async () => {
    const invalid = makeVersion({ data: makeCvData({ profile: makeProfile({ firstName: '' }) }) })
    await expect(adapter.saveVersion(invalid)).rejects.toMatchObject({ code: 'invalid' })
    expect(storage.length).toBe(0)
  })
})

describe('webStorageAdapter: unusable stored data (D-39)', () => {
  it('quarantines corrupt JSON and still loads the other versions', async () => {
    const good = makeVersion()
    await adapter.saveVersion(good)
    seedRaw('broken', '{not json')

    const { versions, skipped } = await adapter.listVersions()

    expect(versions).toEqual([good])
    expect(skipped).toEqual([{ id: 'broken', reason: 'corrupt' }])
    expect(storage.getItem('cview:quarantine:broken')).toBe('{not json')
    expect(storage.getItem('cview:version:broken')).toBeNull()
  })

  it('quarantines JSON that is not an envelope', async () => {
    seedRaw('legacy', JSON.stringify({ name: 'no envelope' }))
    expect((await adapter.listVersions()).skipped).toEqual([{ id: 'legacy', reason: 'corrupt' }])
  })

  it('quarantines data that fails the schema', async () => {
    const bad = { ...makeVersion(), pdfLocale: 'english' }
    seedRaw(bad.id, JSON.stringify({ schemaVersion: 1, version: bad }))
    expect((await adapter.listVersions()).skipped).toEqual([{ id: bad.id, reason: 'invalid' }])
  })

  it('does not load data written by a newer app version', async () => {
    const version = makeVersion()
    seedRaw(version.id, JSON.stringify({ schemaVersion: 99, version }))
    expect((await adapter.listVersions()).skipped).toEqual([{ id: version.id, reason: 'future' }])
  })

  it('does not report the same broken entry twice', async () => {
    seedRaw('broken', '{not json')
    await adapter.listVersions()
    expect(await adapter.listVersions()).toEqual({ versions: [], skipped: [] })
  })

  it('heals index entries whose data disappeared', async () => {
    storage.setItem('cview:index', JSON.stringify(['ghost']))
    expect(await adapter.listVersions()).toEqual({ versions: [], skipped: [] })
    expect(storage.getItem('cview:index')).toBe('[]')
  })

  it('treats a corrupt index as empty', async () => {
    storage.setItem('cview:index', 'nope')
    expect(await adapter.listVersions()).toEqual({ versions: [], skipped: [] })
  })
})

describe('webStorageAdapter: migrations', () => {
  /** A v1 shape where the name lived under `title`, migrated by a v2 app. */
  function v1Payload(version: CvVersion) {
    const { name, ...rest } = version
    return { ...rest, title: name }
  }

  it('upgrades old data step by step and validates the result', async () => {
    const version = makeVersion({ name: 'Old name' })
    const v2 = createWebStorageAdapter({
      getStorage: () => storage,
      currentSchemaVersion: 2,
      registry: {
        1: (data) => {
          const { title, ...rest } = data as { title: string }
          return { ...rest, name: title }
        },
      },
    })
    seedRaw(version.id, JSON.stringify({ schemaVersion: 1, version: v1Payload(version) }))

    expect(await v2.listVersions()).toEqual({ versions: [version], skipped: [] })
  })

  it('skips data when a migration step is missing', async () => {
    const version = makeVersion()
    const v3 = createWebStorageAdapter({
      getStorage: () => storage,
      currentSchemaVersion: 3,
      registry: { 1: (d) => d },
    })
    seedRaw(version.id, JSON.stringify({ schemaVersion: 1, version }))
    expect((await v3.listVersions()).skipped).toEqual([
      { id: version.id, reason: 'migrationFailed' },
    ])
  })

  it('skips data when a migration step throws', async () => {
    const version = makeVersion()
    const v2 = createWebStorageAdapter({
      getStorage: () => storage,
      currentSchemaVersion: 2,
      registry: {
        1: () => {
          throw new Error('boom')
        },
      },
    })
    seedRaw(version.id, JSON.stringify({ schemaVersion: 1, version }))
    expect((await v2.listVersions()).skipped).toEqual([
      { id: version.id, reason: 'migrationFailed' },
    ])
  })
})

describe('webStorageAdapter: storage problems', () => {
  it('reports a full quota as a typed error', async () => {
    storage.failWrites = true
    const error = await adapter.saveVersion(makeVersion()).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(PersistenceError)
    expect(error).toMatchObject({ code: 'quota' })
  })

  it('works as an empty store when storage is unavailable (SSR)', async () => {
    const ssr = createWebStorageAdapter({ getStorage: () => undefined })
    expect(await ssr.listVersions()).toEqual({ versions: [], skipped: [] })
    expect(await ssr.loadVersion('x')).toBeNull()
    expect(await ssr.getActiveId()).toBeNull()
    await expect(ssr.saveVersion(makeVersion())).rejects.toMatchObject({ code: 'unavailable' })
  })

  it('survives browsers that throw when sessionStorage is accessed', async () => {
    const blocked = createWebStorageAdapter({
      getStorage: () => {
        throw new DOMException('denied', 'SecurityError')
      },
    })
    expect(await blocked.listVersions()).toEqual({ versions: [], skipped: [] })
  })
})
