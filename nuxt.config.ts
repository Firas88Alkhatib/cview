// https://nuxt.com/docs/api/configuration/nuxt-config
import { presetDirectives } from './app/utils/motion'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['nuxt-elysia', 'motion-v/nuxt', '@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint'],
  // Components + named preset directives (v-fade-up, v-fade-in). Raw v-motion stays off (D-28).
  motionV: { directives: false, presets: presetDirectives },
  css: ['~/assets/css/main.css'],
  icon: { clientBundle: { scan: true } },
  typescript: {
    strict: true,
    // Unit tests are plain Node code. Nuxt already type-checks tests/nuxt/** (app context).
    nodeTsConfig: { include: ['../tests/unit/**/*', '../vitest.config.ts'] },
  },
  nitro: { preset: 'Bun' },
  nuxtElysia: { path: '/api' },
  devtools: { enabled: true },
})
