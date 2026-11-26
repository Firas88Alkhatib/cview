import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppLogo from '~/components/AppLogo.vue'

describe('AppLogo', () => {
  it('renders the brand name', async () => {
    const wrapper = await mountSuspended(AppLogo)
    expect(wrapper.text()).toBe('CView')
  })

  it('hides the decorative icon from assistive tech', async () => {
    const wrapper = await mountSuspended(AppLogo)
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })
})
