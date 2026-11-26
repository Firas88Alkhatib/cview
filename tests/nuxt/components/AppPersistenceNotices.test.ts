import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AppPersistenceNotices from '~/components/AppPersistenceNotices.vue'
import { useVersionsStore } from '~/stores/versions'
import { mountInApp } from '~~/tests/nuxt/helpers/mountInApp'

// Use the app's own Pinia: in the Nuxt runtime, components read the nuxtApp instance, so a
// fresh createPinia() here would be a different store from the one the component sees.
let versions: ReturnType<typeof useVersionsStore>
let toasts: ReturnType<typeof useToast>

beforeEach(() => {
  versions = useVersionsStore()
  versions.skipped = []
  versions.saveError = null
  toasts = useToast()
  toasts.clear()
})

const shown = () => toasts.toasts.value.map((t) => ({ title: t.title, description: t.description }))

describe('AppPersistenceNotices', () => {
  it('stays silent when everything loaded and saved', async () => {
    await mountInApp(AppPersistenceNotices)
    await flushPromises()
    expect(shown()).toEqual([])
  })

  it('warns about skipped versions with a pluralised count', async () => {
    versions.skipped = [
      { id: 'a', reason: 'corrupt' },
      { id: 'b', reason: 'future' },
    ]
    await mountInApp(AppPersistenceNotices)
    await flushPromises()
    expect(shown()).toEqual([
      {
        title: "Some CV versions couldn't be loaded",
        description: '2 saved versions were damaged or from a newer app version and were skipped.',
      },
    ])
  })

  it('uses the singular message for one skipped version', async () => {
    versions.skipped = [{ id: 'a', reason: 'corrupt' }]
    await mountInApp(AppPersistenceNotices)
    await flushPromises()
    expect(shown()[0]?.description).toBe(
      '1 saved version was damaged or from a newer app version and was skipped.',
    )
  })

  it('explains a full storage quota when a save fails later', async () => {
    await mountInApp(AppPersistenceNotices)
    versions.saveError = 'quota'
    await flushPromises()
    expect(shown()).toEqual([
      {
        title: "Couldn't save your changes",
        description: "Your browser's storage is full. Free some space or remove a CV version.",
      },
    ])
  })
})
