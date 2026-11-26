import { afterEach, describe, expect, it } from 'vitest'
import { sessionStorageAdapter } from '~/services/persistence/webStorageAdapter'
import { makeVersion } from '~~/tests/fixtures/cv'

afterEach(() => window.sessionStorage.clear())

describe('sessionStorageAdapter', () => {
  it('persists guest versions in window.sessionStorage', async () => {
    const version = makeVersion()
    await sessionStorageAdapter.saveVersion(version)
    await sessionStorageAdapter.setActiveId(version.id)

    expect(window.sessionStorage.getItem(`cview:version:${version.id}`)).not.toBeNull()
    expect(await sessionStorageAdapter.listVersions()).toEqual({ versions: [version], skipped: [] })
    expect(await sessionStorageAdapter.getActiveId()).toBe(version.id)
  })
})
