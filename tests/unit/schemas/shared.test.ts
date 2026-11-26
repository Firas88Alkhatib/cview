import { describe, expect, it } from 'vitest'
import {
  emailSchema,
  hexColorSchema,
  isoDateSchema,
  localeSchema,
  monthSchema,
  optionalText,
  periodSchema,
  phoneSchema,
  requiredText,
  urlSchema,
} from '~/schemas/shared'
import { issuesOf } from '~~/tests/unit/schemas/helpers'

describe('requiredText', () => {
  const schema = requiredText(5)

  it('accepts text up to the limit and trims it', () => {
    expect(schema.parse('  abcde  ')).toBe('abcde')
  })

  it('treats whitespace-only input as missing', () => {
    expect(issuesOf(schema, '   ')).toEqual([['', 'validation.required']])
  })

  it('rejects text over the limit', () => {
    expect(issuesOf(schema, 'abcdef')).toEqual([['', 'validation.tooLong']])
  })
})

describe('optionalText', () => {
  it('accepts empty and missing values from cleared inputs', () => {
    expect(issuesOf(optionalText(3), '')).toEqual([])
    expect(issuesOf(optionalText(3), undefined)).toEqual([])
  })

  it('still enforces the max length', () => {
    expect(issuesOf(optionalText(3), 'abcd')).toEqual([['', 'validation.tooLong']])
  })
})

describe('monthSchema', () => {
  it.each(['2021-01', '1999-12'])('accepts %s', (v) => {
    expect(issuesOf(monthSchema, v)).toEqual([])
  })

  it.each(['2021-13', '2021-00', '2021-1', '21-01', '2021-01-05', ''])('rejects %j', (v) => {
    expect(issuesOf(monthSchema, v)).toEqual([['', 'validation.invalidMonth']])
  })
})

describe('periodSchema', () => {
  it('treats a missing end as "present"', () => {
    expect(issuesOf(periodSchema, { start: '2021-03' })).toEqual([])
  })

  it('accepts a one-month period', () => {
    expect(issuesOf(periodSchema, { start: '2021-03', end: '2021-03' })).toEqual([])
  })

  it('reports an end before the start on the end field', () => {
    expect(issuesOf(periodSchema, { start: '2021-03', end: '2021-02' })).toEqual([
      ['end', 'validation.periodOrder'],
    ])
  })

  it('requires a start', () => {
    expect(issuesOf(periodSchema, {})).toEqual([['start', 'validation.required']])
  })
})

describe('contact fields', () => {
  it('allows an empty email but rejects a malformed one', () => {
    expect(issuesOf(emailSchema, '')).toEqual([])
    expect(issuesOf(emailSchema, 'ada@example.com')).toEqual([])
    expect(issuesOf(emailSchema, 'ada@')).toContainEqual(['', 'validation.invalidEmail'])
  })

  it('accepts common phone formats only', () => {
    expect(issuesOf(phoneSchema, '+49 (30) 123-45.67')).toEqual([])
    expect(issuesOf(phoneSchema, '')).toEqual([])
    expect(issuesOf(phoneSchema, 'call me')).toEqual([['', 'validation.invalidPhone']])
  })

  it('allows an empty date of birth but rejects impossible dates', () => {
    expect(issuesOf(isoDateSchema, '')).toEqual([])
    expect(issuesOf(isoDateSchema, '1990-02-28')).toEqual([])
    expect(issuesOf(isoDateSchema, '1990-13-01')).toContainEqual(['', 'validation.invalidDate'])
  })
})

describe('urlSchema', () => {
  it.each(['https://github.com/ada', 'http://example.com'])('accepts %s', (v) => {
    expect(issuesOf(urlSchema, v)).toEqual([])
  })

  it.each(['javascript:alert(1)', 'ftp://example.com', 'example.com'])('rejects %s', (v) => {
    expect(issuesOf(urlSchema, v)).toEqual([['', 'validation.invalidUrl']])
  })
})

describe('theme primitives', () => {
  it('accepts 6-digit hex colours only', () => {
    expect(issuesOf(hexColorSchema, '#1E40af')).toEqual([])
    expect(issuesOf(hexColorSchema, '#fff')).toEqual([['', 'validation.invalidColor']])
    expect(issuesOf(hexColorSchema, 'blue')).toEqual([['', 'validation.invalidColor']])
  })

  it('accepts language tags like en and en-US', () => {
    expect(issuesOf(localeSchema, 'de')).toEqual([])
    expect(issuesOf(localeSchema, 'en-US')).toEqual([])
    expect(issuesOf(localeSchema, 'english')).toEqual([['', 'validation.invalidLocale']])
  })
})
