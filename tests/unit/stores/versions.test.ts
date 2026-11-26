import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toRaw } from 'vue'
import type { StorageAdapter } from '~/services/persistence/types'
import { createWebStorageAdapter } from '~/services/persistence/webStorageAdapter'
import { SAVE_DELAY_MS, useVersionsStore } from '~/stores/versions'
import { makeVersion } from '~~/tests/fixtures/cv'
import { MemoryStorage } from '~~/tests/fixtures/storage'

let storage: MemoryStorage
let adapter: StorageAdapter

beforeEach(() => {
  setActivePinia(createPinia())
  storage = new MemoryStorage()
  adapter = createWebStorageAdapter({ getStorage: () => storage })
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

async function hydrated() {
  const store = useVersionsStore()
  await store.hydrate({ adapter })
  return store
}

describe('versions store: hydrate', () => {
  it('gives a first-time guest an example CV and makes it active (D-41)', async () => {
    const store = await hydrated()
    expect(store.status).toBe('ready')
    expect(store.versions).toHaveLength(1)
    expect(store.active?.name).toBe('My CV')
    expect(store.active?.data.profile.firstName).toBeTruthy()
  })

  it('persists the example CV after the save delay', async () => {
    const store = await hydrated()
    expect((await adapter.listVersions()).versions).toEqual([])
    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS)
    expect((await adapter.listVersions()).versions).toEqual([store.active])
  })

  it('restores saved versions and the stored active id', async () => {
    const [a, b] = [makeVersion({ name: 'A' }), makeVersion({ name: 'B' })]
    await adapter.saveVersion(a)
    await adapter.saveVersion(b)
    await adapter.setActiveId(b.id)
    const store = await hydrated()
    expect(store.versions.map((v) => v.name)).toEqual(['A', 'B'])
    expect(store.activeId).toBe(b.id)
  })

  it('falls back to the first version when the stored active id is stale', async () => {
    const a = makeVersion()
    await adapter.saveVersion(a)
    await adapter.setActiveId('gone')
    const store = await hydrated()
    expect(store.activeId).toBe(a.id)
    expect(await adapter.getActiveId()).toBe(a.id)
  })

  it('exposes quarantined versions so the UI can warn (D-39)', async () => {
    storage.setItem('cview:index', JSON.stringify(['broken']))
    storage.setItem('cview:version:broken', '{not json')
    const store = await hydrated()
    expect(store.skipped).toEqual([{ id: 'broken', reason: 'corrupt' }])
  })
})

describe('versions store: commit (D-38)', () => {
  it('applies a valid edit, bumps updatedAt and saves it later', async () => {
    const store = await hydrated()
    const id = store.activeId!
    const before = store.active!.updatedAt
    vi.setSystemTime(new Date(Date.parse(before) + 60_000))

    expect(store.commit(id, (v) => (v.data.profile.title = 'Senior Software Developer'))).toBe(true)
    expect(store.active!.data.profile.title).toBe('Senior Software Developer')
    expect(store.active!.updatedAt).not.toBe(before)

    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS)
    expect((await adapter.loadVersion(id))?.data.profile.title).toBe('Senior Software Developer')
  })

  it('rejects an edit that would make the version invalid and changes nothing', async () => {
    const store = await hydrated()
    const snapshot = structuredClone(toRaw(store.active))
    expect(store.commit(store.activeId!, (v) => (v.data.profile.firstName = ''))).toBe(false)
    expect(store.active).toEqual(snapshot)
  })

  it('rejects edits that throw or target an unknown version', async () => {
    const store = await hydrated()
    expect(
      store.commit(store.activeId!, () => {
        throw new Error('bad')
      }),
    ).toBe(false)
    expect(store.commit('nope', () => {})).toBe(false)
  })

  it('batches rapid edits into one write per version', async () => {
    const store = await hydrated()
    await store.flush()
    const save = vi.spyOn(adapter, 'saveVersion')
    for (const name of ['F', 'Fi', 'Fir']) {
      store.commit(store.activeId!, (v) => (v.data.profile.firstName = name))
      await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS / 2)
    }
    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS)
    expect(save).toHaveBeenCalledTimes(1)
    expect(save.mock.calls[0]![0].data.profile.firstName).toBe('Fir')
  })

  it('records a failed save for the UI and clears it after the next success', async () => {
    const store = await hydrated()
    storage.failWrites = true
    await store.flush()
    expect(store.saveError).toBe('quota')

    storage.failWrites = false
    store.commit(store.activeId!, (v) => (v.data.profile.firstName = 'Firas'))
    await store.flush()
    expect(store.saveError).toBeNull()
  })
})

describe('versions store: managing versions', () => {
  it('creates, duplicates and renames versions', async () => {
    const store = await hydrated()
    const created = store.create('Team lead')!
    const copy = store.duplicate(created, 'Team lead (copy)')!

    expect(store.versions.map((v) => v.name)).toEqual(['My CV', 'Team lead', 'Team lead (copy)'])
    const source = store.versions.find((v) => v.id === created)!
    const duplicated = store.versions.find((v) => v.id === copy)!
    expect(duplicated.data).toEqual(source.data)
    expect(duplicated.id).not.toBe(source.id)

    expect(store.rename(copy, '  Lead CV  ')).toBe(true)
    expect(duplicated.name).toBe('Team lead (copy)') // the old object is untouched
    expect(store.versions.find((v) => v.id === copy)!.name).toBe('Lead CV')
  })

  it('rejects invalid names', async () => {
    const store = await hydrated()
    expect(store.create('')).toBeNull()
    expect(store.rename(store.activeId!, '   ')).toBe(false)
    expect(store.rename(store.activeId!, 'x'.repeat(store.maxNameLength + 1))).toBe(false)
  })

  it('switches the active version and persists the choice', async () => {
    const store = await hydrated()
    const other = store.create('Other')!
    expect(await store.setActive(other)).toBe(true)
    expect(store.active?.name).toBe('Other')
    expect(await adapter.getActiveId()).toBe(other)
    expect(await store.setActive('nope')).toBe(false)
  })

  it('removes a version from memory and storage, moving active to a neighbour', async () => {
    const store = await hydrated()
    const other = store.create('Other')!
    await store.flush()
    await store.setActive(other)

    expect(await store.remove(other)).toBe(true)
    expect(store.versions.map((v) => v.name)).toEqual(['My CV'])
    expect(store.active?.name).toBe('My CV')
    expect(await adapter.loadVersion(other)).toBeNull()
  })

  it('never removes the last version', async () => {
    const store = await hydrated()
    expect(await store.remove(store.activeId!)).toBe(false)
    expect(store.versions).toHaveLength(1)
  })
})
