// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['nuxt-elysia', 'motion-v/nuxt', '@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  icon: { clientBundle: { scan: true } },
  nitro: { preset: 'Bun' },
  nuxtElysia: { path: '/api' },
  devtools: { enabled: true },
})
