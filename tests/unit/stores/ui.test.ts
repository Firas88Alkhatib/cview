import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { UI_DEFAULTS, uiStateSchema } from '~/schemas/ui'
import { useUiStore } from '~/stores/ui'

// Plain node: no sessionStorage, so useStorage keeps state in memory. Persistence itself is
// covered in tests/nuxt/stores/persistence.test.ts.
beforeEach(() => setActivePinia(createPinia()))

describe('ui store', () => {
  it('starts with the defaults', () => {
    const ui = useUiStore()
    expect(ui.previewSize).toBe(UI_DEFAULTS.previewSize)
    expect(ui.previewCollapsed).toBe(false)
    expect(ui.editor).toEqual({ mainId: 'profile', subId: null })
  })

  it('clamps the preview size to 0–1', () => {
    const ui = useUiStore()
    ui.setPreviewSize(1.4)
    expect(ui.previewSize).toBe(1)
    ui.setPreviewSize(-1)
    expect(ui.previewSize).toBe(0)
  })

  it('expands to the last width after a collapse (click on the handle)', () => {
    const ui = useUiStore()
    ui.setPreviewSize(0.4)
    ui.collapsePreview()
    expect(ui.previewCollapsed).toBe(true)
    ui.expandPreview()
    expect(ui.previewCollapsed).toBe(false)
    expect(ui.previewSize).toBe(0.4)
  })

  it('restores the size given at collapse time, e.g. from before a drag', () => {
    const ui = useUiStore()
    ui.setPreviewSize(0.3) // the drag passed the minimum on its way to collapsing
    ui.collapsePreview(0.45) // the size when the drag started
    ui.expandPreview()
    expect(ui.previewSize).toBe(0.45)
  })

  it('ignores a second collapse, so the restore size is not overwritten', () => {
    const ui = useUiStore()
    ui.setPreviewSize(0.4)
    ui.collapsePreview()
    ui.collapsePreview(0.9)
    ui.expandPreview()
    expect(ui.previewSize).toBe(0.4)
  })

  it('expands to a dragged-to size when given one', () => {
    const ui = useUiStore()
    ui.collapsePreview()
    ui.expandPreview(0.6)
    expect(ui.previewSize).toBe(0.6)
  })

  it('records editor navigation and resets everything', () => {
    const ui = useUiStore()
    ui.navigate('experience', 'abc')
    expect(ui.editor).toEqual({ mainId: 'experience', subId: 'abc' })
    ui.reset()
    expect(ui.editor).toEqual({ mainId: 'profile', subId: null })
  })
})

describe('uiStateSchema', () => {
  it('falls back per field, so one bad value does not reset the rest', () => {
    const parsed = uiStateSchema.parse({
      previewSize: 0.3,
      previewCollapsed: 'yes',
      lastExpandedSize: 7,
      editor: { mainId: 'skills', subId: 42 },
    })
    expect(parsed).toEqual({
      previewSize: 0.3,
      previewCollapsed: false,
      lastExpandedSize: 0.5,
      editor: { mainId: 'skills', subId: null },
    })
  })

  it('recovers from a completely wrong shape', () => {
    expect(uiStateSchema.parse({})).toEqual(uiStateSchema.parse(UI_DEFAULTS))
  })
})
