import * as z from 'zod'

// Building blocks for every CV schema. Schemas carry NO user-facing text: generic issues are
// translated by issueToI18n (app/utils/validation.ts), and custom checks attach an i18n key via
// `params` (D-3, D-20).

/** Max lengths, shared with the forms (maxlength attributes, counters). */
export const LIMITS = {
  name: 50,
  title: 80,
  shortText: 100,
  label: 40,
  skill: 40,
  summary: 1000,
  description: 2000,
  phone: 30,
  font: 50,
  versionName: 60,
  links: 10,
  skills: 30,
  projects: 20,
} as const

/** Attaches an i18n key to a custom refinement issue. */
export const withKey = (i18nKey: string) => ({ params: { i18nKey } })

/** Stable id for list items (tabs, animation keys, reordering). Generate with crypto.randomUUID(). */
export const idSchema = z.uuid()

export const requiredText = (max: number) => z.string().trim().min(1).max(max)

/** Optional free text. An empty string is allowed, because forms produce '' for cleared inputs. */
export const optionalText = (max: number) => z.string().trim().max(max).optional()

export const emailSchema = z.union([z.literal(''), z.email()]).optional()

/** http(s) links only, so no javascript: or other schemes end up in the PDF. */
export const urlSchema = z.url({ protocol: /^https?$/ })

const PHONE_RE = /^[+\d\s().-]*$/
export const phoneSchema = optionalText(LIMITS.phone).refine(
  (v) => v === undefined || PHONE_RE.test(v),
  withKey('validation.invalidPhone'),
)

/** Full calendar date (date of birth). */
export const isoDateSchema = z.union([z.literal(''), z.iso.date()]).optional()

/** CV month, `YYYY-MM` (Q-3 → D-33). */
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
export const monthSchema = z
  .string()
  .refine((v) => MONTH_RE.test(v), withKey('validation.invalidMonth'))

/** `end` omitted means "present". `end` may not be before `start`. */
export const periodSchema = z
  .object({ start: monthSchema, end: monthSchema.optional() })
  .refine((p) => p.end === undefined || p.end >= p.start, {
    ...withKey('validation.periodOrder'),
    path: ['end'],
  })

export const skillListSchema = z.array(requiredText(LIMITS.skill)).max(LIMITS.skills)

const HEX_RE = /^#[0-9a-fA-F]{6}$/
export const hexColorSchema = z
  .string()
  .refine((v) => HEX_RE.test(v), withKey('validation.invalidColor'))

/** BCP 47 language tag subset, e.g. `en`, `de`, `en-US`. */
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/
export const localeSchema = z
  .string()
  .refine((v) => LOCALE_RE.test(v), withKey('validation.invalidLocale'))
