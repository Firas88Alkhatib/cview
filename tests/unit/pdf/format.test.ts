import { describe, expect, it } from 'vitest'
import { en } from '~/pdf/locales/en'
import { formatMonth, formatPeriod, joinParts } from '~/pdf/shared/format'

describe('formatMonth', () => {
  it('formats YYYY-MM for the PDF language', () => {
    expect(formatMonth('2021-03', 'en')).toBe('Mar 2021')
    expect(formatMonth('2017-12', 'en')).toBe('Dec 2017')
  })

  it('uses UTC, so the month never shifts with the time zone', () => {
    expect(formatMonth('2022-01', 'en')).toBe('Jan 2022')
  })

  it('returns malformed input unchanged instead of throwing', () => {
    expect(formatMonth('soon', 'en')).toBe('soon')
  })
})

describe('formatPeriod', () => {
  it('shows "Present" for an ongoing period', () => {
    expect(formatPeriod({ start: '2022-01' }, 'en', en)).toBe('Jan 2022 – Present')
  })

  it('shows both ends for a finished period', () => {
    expect(formatPeriod({ start: '2017-09', end: '2021-06' }, 'en', en)).toBe('Sep 2017 – Jun 2021')
  })
})

describe('joinParts', () => {
  it('skips empty parts, so optional fields never leave dangling separators', () => {
    expect(joinParts(['Lahti', undefined, '', '  ', 'Finland'])).toBe('Lahti · Finland')
    expect(joinParts([undefined, null])).toBe('')
    expect(joinParts(['Lahti', 'Finland'], ', ')).toBe('Lahti, Finland')
  })
})
