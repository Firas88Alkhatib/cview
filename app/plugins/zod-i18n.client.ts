import { z } from 'zod'
import { issueToI18n } from '~/utils/validation'

// Translates every Zod message into the current UI language at validation time.
// Client-only: z.config is global module state, so it must not be shared across SSR requests.
export default defineNuxtPlugin((nuxtApp) => {
  const { t } = nuxtApp.$i18n
  z.config({
    customError: (issue) => {
      const { key, params } = issueToI18n(issue)
      return t(key, params ?? {})
    },
  })
})
