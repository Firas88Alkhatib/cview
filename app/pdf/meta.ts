// Pure PDF metadata: ids and lists only, no components or font files, so stores and the
// plain-node unit tests can import it. Components live in app/pdf/registry.ts.

export const TEMPLATE_IDS = ['basic'] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]
/** Placeholder until the designed template #1 (P1-T10, Q-6). */
export const DEFAULT_TEMPLATE_ID: TemplateId = 'basic'

/** PDF content languages (D-23). English only for now, no RTL (D-45). */
export const PDF_LOCALES = { en: 'English' } as const
export type PdfLocale = keyof typeof PDF_LOCALES
export const DEFAULT_PDF_LOCALE: PdfLocale = 'en'

/** Curated, bundled fonts (D-45). All SIL OFL, latin subset (covers ä/ö/å). */
export const FONT_FAMILIES = [
  { id: 'Inter', category: 'sans' },
  { id: 'Lora', category: 'serif' },
  { id: 'Poppins', category: 'sans' },
] as const
export type FontFamily = (typeof FONT_FAMILIES)[number]['id']
export const DEFAULT_FONT: FontFamily = 'Inter'

const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  (list as readonly string[]).includes(value)

/** Stored data may name an unknown template/font/locale (old versions). Fall back to defaults. */
export const resolveTemplateId = (id: string): TemplateId =>
  isOneOf(TEMPLATE_IDS, id) ? id : DEFAULT_TEMPLATE_ID

export const resolveFontFamily = (font: string): FontFamily =>
  isOneOf(
    FONT_FAMILIES.map((f) => f.id),
    font,
  )
    ? font
    : DEFAULT_FONT

export const resolvePdfLocale = (locale: string): PdfLocale =>
  locale in PDF_LOCALES ? (locale as PdfLocale) : DEFAULT_PDF_LOCALE
