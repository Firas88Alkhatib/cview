// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

// Nuxt's generated config (Vue + TS + auto-import aware). Prettier owns formatting, so its
// config goes last to switch off any stylistic rules that would conflict.
export default withNuxt(
  {
    // No parent-relative imports: use ~/ (app/) or ~~/ (project root). Same-folder ./ is fine (D-32).
    rules: {
      'no-restricted-imports': [
        'error',
        {
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
