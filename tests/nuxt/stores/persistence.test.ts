import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useCvStore } from '~/stores/cv'
import { UI_STORAGE_KEY, useUiStore } from '~/stores/ui'
import { useVersionsStore } from '~/stores/versions'

/** Simulates a page reload: fresh Pinia and stores, same sessionStorage. */
function reload() {
  setActivePinia(createPinia())
}

beforeEach(() => {
  window.sessionStorage.clear()
  reload()
})
afterEach(() => window.sessionStorage.clear())

describe('store persistence (real sessionStorage)', () => {
  it('keeps CV edits and versions across a reload', async () => {
    const versions = useVersionsStore()
    await versions.hydrate()
    await versions.flush() // start clean, so the edits below must schedule their own save
    const cv = useCvStore()
    cv.updateProfile({ title: 'Senior Software Developer', summary: 'Edited after reload test.' })
    const jobId = cv.addExperience({
      company: 'Previous Company',
      role: 'Junior Developer',
      period: { start: '2021-06', end: '2021-12' },
      skills: ['JavaScript'],
      projects: [],
    })!
    const second = versions.create('Second CV')!
    await versions.setActive(second)
    await versions.flush()

    reload()
    const restored = useVersionsStore()
    await restored.hydrate()

    expect(restored.versions.map((v) => v.name)).toEqual(['My CV', 'Second CV'])
    expect(restored.activeId).toBe(second)
    const first = restored.versions[0]!.data
    expect(first.profile).toMatchObject({
      title: 'Senior Software Developer',
      summary: 'Edited after reload test.',
    })
    expect(first.experience.find((e) => e.id === jobId)?.company).toBe('Previous Company')
  })

  it('does not create a second example CV on reload', async () => {
    await useVersionsStore().hydrate()
    await useVersionsStore().flush()
    reload()
    await useVersionsStore().hydrate()
    expect(useVersionsStore().versions).toHaveLength(1)
  })

  it('keeps layout and navigation state across a reload', async () => {
    const ui = useUiStore()
    ui.setPreviewSize(0.35)
    ui.collapsePreview()
    ui.navigate('experience', 'job-1')
    await nextTick() // useStorage writes on the next tick

    expect(JSON.parse(window.sessionStorage.getItem(UI_STORAGE_KEY)!)).toMatchObject({
      previewCollapsed: true,
    })

    reload()
    const restored = useUiStore()
    expect(restored.previewCollapsed).toBe(true)
    expect(restored.editor).toEqual({ mainId: 'experience', subId: 'job-1' })
    restored.expandPreview()
    expect(restored.previewSize).toBe(0.35)
  })

  it('ignores tampered layout state field by field', () => {
    window.sessionStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({ previewSize: 'huge', previewCollapsed: true }),
    )
    const ui = useUiStore()
    expect(ui.previewSize).toBe(0.5)
    expect(ui.previewCollapsed).toBe(true)
  })
})
