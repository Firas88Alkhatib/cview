import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { issueToI18n, VALIDATION_KEYS } from '~/utils/validation'
import en from '~~/i18n/locales/en.json'

const firstIssue = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value)
  if (result.success) throw new Error('expected a validation issue')
  return issueToI18n(result.error.issues[0]!)
}

describe('issueToI18n', () => {
  it('maps an empty required string to "required" without params', () => {
    expect(firstIssue(z.string().min(1), '')).toEqual({ key: 'validation.required' })
  })

  it('passes length limits as params for interpolation', () => {
    expect(firstIssue(z.string().min(3), 'a')).toEqual({
      key: 'validation.tooShort',
      params: { min: 3 },
    })
    expect(firstIssue(z.string().max(2), 'abc')).toEqual({
      key: 'validation.tooLong',
      params: { max: 2 },
    })
  })

  it('distinguishes arrays and numbers from strings', () => {
    expect(firstIssue(z.array(z.string()).max(1), ['a', 'b']).key).toBe('validation.tooMany')
    expect(firstIssue(z.array(z.string()).min(1), []).key).toBe('validation.tooFew')
    expect(firstIssue(z.number().max(5), 6).key).toBe('validation.tooHigh')
    expect(firstIssue(z.number().min(1), 0).key).toBe('validation.tooLow')
  })

  it('maps known string formats', () => {
    expect(firstIssue(z.email(), 'x').key).toBe('validation.invalidEmail')
    expect(firstIssue(z.url(), 'x').key).toBe('validation.invalidUrl')
    expect(firstIssue(z.uuid(), 'x').key).toBe('validation.invalidId')
  })

  it('uses the key a schema attached to a custom check', () => {
    const schema = z.string().refine(() => false, { params: { i18nKey: 'validation.periodOrder' } })
    expect(firstIssue(schema, 'x')).toEqual({ key: 'validation.periodOrder' })
  })

  it('falls back for unknown custom keys instead of leaking them to the UI', () => {
    const schema = z.string().refine(() => false, { params: { i18nKey: 'not.a.key' } })
    expect(firstIssue(schema, 'x')).toEqual({ key: 'validation.invalid' })
  })

  it('treats a missing value as required and a wrong type as invalid', () => {
    expect(issueToI18n({ code: 'invalid_type', input: undefined }).key).toBe('validation.required')
    expect(issueToI18n({ code: 'invalid_type', input: 42 }).key).toBe('validation.invalidType')
  })

  it('has an English message for every key it can return', () => {
    const messages = en.validation as Record<string, string>
    for (const key of VALIDATION_KEYS) {
      expect(messages[key.replace('validation.', '')], key).toBeTypeOf('string')
    }
  })
})
