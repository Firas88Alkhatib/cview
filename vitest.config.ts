import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

// Same aliases as Nuxt (~ = app/, ~~ = project root), so unit tests never need ../ imports.
// Keep in sync with typescript.nodeTsConfig.compilerOptions.paths in nuxt.config.ts.
const alias = {
  '~~': fileURLToPath(new URL('./', import.meta.url)),
  '~': fileURLToPath(new URL('./app', import.meta.url)),
}

// Two projects (docs/TESTING.md):
// - unit: pure TS in plain Node, so it's fast and has no Nuxt runtime or auto-imports
// - nuxt: components, composables and integration tests inside a real Nuxt runtime
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: { nuxt: { domEnvironment: 'happy-dom' } },
        },
      }),
    ],
  },
})
