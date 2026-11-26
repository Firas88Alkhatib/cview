import { describe, expect, it } from 'vitest'
import { getPdfLabels } from '~/pdf/locales'
import { en } from '~/pdf/locales/en'
import {
  DEFAULT_FONT,
  DEFAULT_PDF_LOCALE,
  DEFAULT_TEMPLATE_ID,
  FONT_FAMILIES,
  PDF_LOCALES,
  resolveFontFamily,
  resolvePdfLocale,
  resolveTemplateId,
  TEMPLATE_IDS,
} from '~/pdf/meta'
import { DEFAULT_THEME } from '~/utils/cvDefaults'

describe('pdf meta', () => {
  it('ships three bundled fonts with Inter as the default (D-45)', () => {
    expect(FONT_FAMILIES.map((f) => f.id)).toEqual(['Inter', 'Lora', 'Poppins'])
    expect(DEFAULT_FONT).toBe('Inter')
    expect(DEFAULT_THEME.font).toBe(DEFAULT_FONT)
  })

  it('ships English only for PDF content (D-45)', () => {
    expect(Object.keys(PDF_LOCALES)).toEqual(['en'])
    expect(DEFAULT_PDF_LOCALE).toBe('en')
  })

  it('has a default template that exists', () => {
    expect(TEMPLATE_IDS).toContain(DEFAULT_TEMPLATE_ID)
  })

  it.each([
    ['template', resolveTemplateId, 'classic', DEFAULT_TEMPLATE_ID],
    ['font', resolveFontFamily, 'Helvetica', DEFAULT_FONT],
    ['locale', resolvePdfLocale, 'de', DEFAULT_PDF_LOCALE],
  ] as const)(
    'falls back to the default %s for unknown stored values',
    (_, resolve, bad, fallback) => {
      expect(resolve(bad)).toBe(fallback)
    },
  )

  it('keeps known values', () => {
    expect(resolveFontFamily('Lora')).toBe('Lora')
    expect(resolveTemplateId('basic')).toBe('basic')
  })
})

describe('getPdfLabels', () => {
  it('returns English labels, also for unsupported locales', () => {
    expect(getPdfLabels('en')).toBe(en)
    expect(getPdfLabels('fi')).toBe(en)
  })

  it('has a non-empty label for every key', () => {
    const values = (obj: object): string[] =>
      Object.values(obj).flatMap((v) => (typeof v === 'string' ? [v] : values(v as object)))
    const all = values(en)
    expect(all.length).toBeGreaterThan(10)
    expect(all.every((v) => v.trim() !== '')).toBe(true)
  })
})
