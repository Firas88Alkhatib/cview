// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

// Nuxt's generated config (Vue + TS + auto-import aware). Prettier owns formatting, so its
// config goes last to switch off any stylistic rules that would conflict.
export default withNuxt(
  {
    rules: {
      // `import { z }` breaks dev SSR: Vite's module runner can evaluate Zod's circular internals
      // before the `z` alias is filled, so `z.uuid` is undefined (D-42). Production and tests hide it.
      // (no-restricted-imports' importNames would also block `import * as z`, hence a selector.)
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='zod'] > ImportSpecifier[imported.name='z']",
          message: "Use `import * as z from 'zod'` (named `z` breaks dev SSR, see D-42).",
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          // No parent-relative imports: use ~/ (app/) or ~~/ (project root). Same-folder ./ is fine (D-32).
          patterns: [
            {
              regex: '^\\.\\./',
              message:
                "Use an alias instead of '../': '~/…' for app/, '~~/…' for the project root.",
            },
          ],
        },
      ],
    },
  },
  prettier,
)
