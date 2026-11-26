import { describe, expect, it } from 'vitest'
import AppTopbar from '~/components/AppTopbar.vue'
import enRaw from '~~/i18n/locales/en.json?raw'
import { mountInApp } from '~~/tests/nuxt/helpers/mountInApp'

// The i18n module compiles imported locale JSON into message ASTs inside the Nuxt runtime,
// so read the raw file to get the plain strings.
const en = JSON.parse(enRaw)

describe('AppTopbar', () => {
  it('renders navigation labels from the en locale', async () => {
    const wrapper = await mountInApp(AppTopbar)
    expect(wrapper.text()).toContain(en.topbar.nav.about)
  })

  it('gives the icon-only GitHub button a translated accessible name', async () => {
    const wrapper = await mountInApp(AppTopbar)
    expect(wrapper.find(`[aria-label="${en.topbar.github.label}"]`).exists()).toBe(true)
  })
})
