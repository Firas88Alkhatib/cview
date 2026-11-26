import { describe, expect, it } from 'vitest'
import { cvDataSchema, cvVersionSchema } from '~/schemas'
import { ID, issuesOf } from '~~/tests/unit/schemas/helpers'

const data = {
  profile: { firstName: 'Ada', lastName: 'Lovelace', links: [] },
  experience: [],
  education: [],
  skills: [],
  languages: [],
}

const version = {
  id: ID,
  name: 'Frontend role',
  templateId: 'classic',
  theme: { colors: { primary: '#1E40AF', background: '#FFFFFF', text: '#111827' }, font: 'Inter' },
  pdfLocale: 'de',
  data,
  createdAt: '2026-11-26T10:00:00Z',
  updatedAt: '2026-11-26T10:05:00.123Z',
}

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
    const bad = { ...version, data: { ...data, profile: { ...data.profile, firstName: '' } } }
    expect(issuesOf(cvVersionSchema, bad)).toEqual([
      ['data.profile.firstName', 'validation.required'],
    ])
  })
})
