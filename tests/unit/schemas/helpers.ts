import type { z } from 'zod'
import { issueToI18n } from '~/utils/validation'

/** Parses `value` and returns `[path, i18nKey]` for each issue, or [] when valid. */
export function issuesOf(schema: z.ZodType, value: unknown): Array<[string, string]> {
  const result = schema.safeParse(value)
  if (result.success) return []
  return result.error.issues.map((issue) => [issue.path.join('.'), issueToI18n(issue).key])
}
