// Maps Zod issues to UI i18n keys and params. Schemas stay language-agnostic, and the
// zod-i18n client plugin feeds this into z.config({ customError }) (D-20).

/** Every key this mapper can return. Each must exist in i18n/locales/en.json (tested). */
export const VALIDATION_KEYS = [
  'validation.required',
  'validation.tooShort',
  'validation.tooLong',
  'validation.tooFew',
  'validation.tooMany',
  'validation.tooLow',
  'validation.tooHigh',
  'validation.invalidEmail',
  'validation.invalidUrl',
  'validation.invalidDate',
  'validation.invalidId',
  'validation.invalidFormat',
  'validation.invalidOption',
  'validation.invalidType',
  'validation.invalid',
  // Custom keys attached by schemas through withKey():
  'validation.invalidPhone',
  'validation.invalidMonth',
  'validation.periodOrder',
  'validation.invalidColor',
  'validation.invalidLocale',
] as const

export type ValidationKey = (typeof VALIDATION_KEYS)[number]

/** Structural subset of a Zod issue (raw or final), so tests can pass real issues. */
export interface IssueLike {
  code: string
  origin?: string
  format?: string
  minimum?: number | bigint
  maximum?: number | bigint
  params?: Record<string, unknown>
  input?: unknown
}

export interface I18nMessage {
  key: ValidationKey
  params?: Record<string, number>
}

const isValidationKey = (value: unknown): value is ValidationKey =>
  typeof value === 'string' && (VALIDATION_KEYS as readonly string[]).includes(value)

const FORMAT_KEYS: Partial<Record<string, ValidationKey>> = {
  email: 'validation.invalidEmail',
  url: 'validation.invalidUrl',
  date: 'validation.invalidDate',
  uuid: 'validation.invalidId',
}

export function issueToI18n(issue: IssueLike): I18nMessage {
  switch (issue.code) {
    case 'custom':
      return {
        key: isValidationKey(issue.params?.i18nKey) ? issue.params.i18nKey : 'validation.invalid',
      }
    case 'too_small': {
      const min = Number(issue.minimum)
      if (issue.origin === 'string')
        return min <= 1
          ? { key: 'validation.required' }
          : { key: 'validation.tooShort', params: { min } }
      if (issue.origin === 'array') return { key: 'validation.tooFew', params: { min } }
      return { key: 'validation.tooLow', params: { min } }
    }
    case 'too_big': {
      const max = Number(issue.maximum)
      if (issue.origin === 'string') return { key: 'validation.tooLong', params: { max } }
      if (issue.origin === 'array') return { key: 'validation.tooMany', params: { max } }
      return { key: 'validation.tooHigh', params: { max } }
    }
    case 'invalid_format':
      return { key: FORMAT_KEYS[issue.format ?? ''] ?? 'validation.invalidFormat' }
    case 'invalid_value':
      return { key: 'validation.invalidOption' }
    // Raw issues (the customError path) carry `input`. Final issues from safeParse don't, so
    // there every invalid_type reads as "required", which is right for empty form fields.
    case 'invalid_type':
      return { key: issue.input === undefined ? 'validation.required' : 'validation.invalidType' }
    default:
      return { key: 'validation.invalid' }
  }
}
