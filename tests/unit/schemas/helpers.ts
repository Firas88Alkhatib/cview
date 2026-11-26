import type { z } from 'zod'
import { issueToI18n } from '~/utils/validation'

/** Parses `value` and returns `[path, i18nKey]` for each issue, or [] when valid. */
export function issuesOf(schema: z.ZodType, value: unknown): Array<[string, string]> {
  const result = schema.safeParse(value)
  if (result.success) return []
  return result.error.issues.map((issue) => [issue.path.join('.'), issueToI18n(issue).key])
}

export const ID = '0f8fad5b-d9cb-469f-a165-70867728950e'
export const ID_2 = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
