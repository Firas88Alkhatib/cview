import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import SplitPane from '~/components/preview/SplitPane.vue'
import { useUiStore } from '~/stores/ui'

// happy-dom has no layout, so give the container a fixed 1280px width.
const WIDTH = 1280

beforeEach(() => {
  useUiStore().reset()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    width: WIDTH,
    right: WIDTH,
    top: 0,
    bottom: 720,
    height: 720,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
})
afterEach(() => vi.restoreAllMocks())

const mountPane = () =>
  mountSuspended(SplitPane, {
    slots: { start: () => h('p', 'editor'), end: () => h('p', 'preview') },
  })

describe('SplitPane', () => {
  it('renders both panes and an accessible separator controlling the preview', async () => {
    const wrapper = await mountPane()
    const separator = wrapper.get('[role="separator"]')
    expect(wrapper.text()).toContain('editor')
    expect(wrapper.text()).toContain('preview')
    expect(separator.attributes()).toMatchObject({
      'aria-orientation': 'vertical',
      'aria-label': 'Resize preview',
      'aria-valuenow': '50',
      tabindex: '0',
    })
    const controlled = wrapper.find(`#${separator.attributes('aria-controls')}`)
    expect(controlled.text()).toBe('preview')
  })

  it('grows the preview with ArrowLeft and stores the size', async () => {
    const wrapper = await mountPane()
    await wrapper.get('[role="separator"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(useUiStore().previewSize * WIDTH).toBeCloseTo(0.5 * WIDTH + 24)
  })

  it('jumps to the limits with Home and End', async () => {
    const wrapper = await mountPane()
    const separator = wrapper.get('[role="separator"]')
    await separator.trigger('keydown', { key: 'End' })
    expect(useUiStore().previewSize * WIDTH).toBeCloseTo(360)
    await separator.trigger('keydown', { key: 'Home' })
    expect(useUiStore().previewSize * WIDTH).toBeCloseTo(WIDTH - 400)
  })

  it('applies the stored size to the preview pane', async () => {
    useUiStore().setPreviewSize(0.4)
    const wrapper = await mountPane()
    const preview = wrapper.get(`#${wrapper.get('[role="separator"]').attributes('aria-controls')}`)
    expect(preview.attributes('style')).toContain('flex-basis: 40%')
  })
})
