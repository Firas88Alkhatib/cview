// https://nuxt.com/docs/api/configuration/nuxt-config
import { presetDirectives } from './app/utils/motion'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: [
    'nuxt-elysia',
    'motion-v/nuxt',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
  ],
  // UI language only. PDF content language is separate (D-23). Files: i18n/locales/*.json (D-20, D-31).
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [{ code: 'en', language: 'en-US', name: 'English', file: 'en.json' }],
    detectBrowserLanguage: { useCookie: true, cookieKey: 'cview_locale', fallbackLocale: 'en' },
    // Key autocompletion in the editor only. t() still accepts any string, so missing keys are
    // caught by tests/unit/i18n/keys.test.ts instead.
    experimental: { typedOptionsAndMessages: 'default' },
  },
  // Components + named preset directives (v-fade-up, v-fade-in). Raw v-motion stays off (D-28).
  motionV: { directives: false, presets: presetDirectives },
  css: ['~/assets/css/main.css'],
  icon: { clientBundle: { scan: true } },
  typescript: {
    strict: true,
    // Unit tests are plain Node code. Nuxt already type-checks tests/nuxt/** (app context).
    nodeTsConfig: {
      // Nuxt-style aliases for unit/e2e code. Keep in sync with `alias` in vitest.config.ts.
      compilerOptions: { paths: { '~/*': ['../app/*'], '~~/*': ['../*'] } },
      include: [
        '../tests/unit/**/*',
        '../tests/e2e/**/*',
        '../vitest.config.ts',
        '../playwright.config.ts',
      ],
    },
  },
  nitro: { preset: 'Bun' },
  nuxtElysia: { path: '/api' },
  devtools: { enabled: true },
})
