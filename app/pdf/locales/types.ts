import type { LANGUAGE_LEVELS, WORK_MODELS } from '~/schemas'

/**
 * Fixed text inside the PDF, one dictionary per PDF language (D-23). Separate from the UI
 * i18n: templates never use useI18n. Records over the schema enums make a missing label a
 * type error.
 */
export interface PdfLabels {
  sections: {
    summary: string
    experience: string
    projects: string
    education: string
    skills: string
    languages: string
    links: string
  }
  period: { present: string }
  workModel: Record<(typeof WORK_MODELS)[number], string>
  languageLevel: Record<(typeof LANGUAGE_LEVELS)[number], string>
}
