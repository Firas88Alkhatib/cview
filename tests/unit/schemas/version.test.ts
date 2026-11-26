import { describe, expect, it } from 'vitest'
import { cvDataSchema, cvVersionSchema } from '~/schemas'
import { makeCvData, makeProfile, makeVersion } from '~~/tests/fixtures/cv'
import { issuesOf } from '~~/tests/unit/schemas/helpers'

const data = makeCvData()
const version = makeVersion({ name: 'Frontend role', pdfLocale: 'de', data })

describe('cvDataSchema', () => {
  it('accepts a CV with only a name', () => {
    expect(issuesOf(cvDataSchema, data)).toEqual([])
  })

  it('requires every section to be present (empty lists are fine)', () => {
    const { languages: _omitted, ...withoutLanguages } = data
    expect(issuesOf(cvDataSchema, withoutLanguages)).toEqual([['languages', 'validation.required']])
  })
})

describe('cvVersionSchema', () => {
  it('accepts a complete version', () => {
    expect(issuesOf(cvVersionSchema, version)).toEqual([])
  })

  it('keeps the PDF language independent of the UI language (any valid tag)', () => {
    expect(issuesOf(cvVersionSchema, { ...version, pdfLocale: 'ar' })).toEqual([])
  })

  it('requires ISO timestamps', () => {
    expect(issuesOf(cvVersionSchema, { ...version, createdAt: '26/11/2026' })).toHaveLength(1)
  })

  it('reports nested content errors with the full path', () => {
    const bad = makeVersion({ data: makeCvData({ profile: makeProfile({ firstName: '' }) }) })
    expect(issuesOf(cvVersionSchema, bad)).toEqual([
      ['data.profile.firstName', 'validation.required'],
    ])
  })
})
