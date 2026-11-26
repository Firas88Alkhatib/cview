// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

// Nuxt's generated config (Vue + TS + auto-import aware). Prettier owns formatting, so its
// config goes last to switch off any stylistic rules that would conflict.
export default withNuxt(prettier)
