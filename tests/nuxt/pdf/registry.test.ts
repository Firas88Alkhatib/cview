import { describe, expect, it } from 'vitest'
import { DEFAULT_TEMPLATE_ID, FONT_FAMILIES, TEMPLATE_IDS } from '~/pdf/meta'
import { listTemplates, resolveTemplate } from '~/pdf/registry'
import { FONT_FILES } from '~/pdf/shared/fonts'
import { themeSchema } from '~/schemas'

// Nuxt project: the registry imports .vue templates, and fonts use Vite `?url` assets.
describe('template registry', () => {
  it('resolves a template by id', () => {
    expect(resolveTemplate('basic').meta.id).toBe('basic')
  })

  it('falls back to the default template for unknown ids (e.g. older saved versions)', () => {
    expect(resolveTemplate('classic').meta.id).toBe(DEFAULT_TEMPLATE_ID)
  })

  it('registers every id in TEMPLATE_IDS', () => {
    expect(listTemplates().map((t) => t.id)).toEqual([...TEMPLATE_IDS])
  })

  it.each(listTemplates())('$name has a valid default theme using a bundled font', (meta) => {
    expect(themeSchema.safeParse(meta.defaultTheme).success).toBe(true)
    expect(FONT_FAMILIES.map((f) => f.id)).toContain(meta.defaultTheme.font)
  })
})

describe('bundled fonts', () => {
  it('has regular, bold, italic and bold italic WOFF files for every family', () => {
    for (const { id } of FONT_FAMILIES) {
      const faces = Object.values(FONT_FILES[id])
      expect(faces, id).toHaveLength(4)
      for (const url of faces) expect(url, id).toMatch(/\.woff(\?.*)?$/)
    }
  })
})
