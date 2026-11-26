import { en } from '~/pdf/locales/en'
import type { PdfLabels } from '~/pdf/locales/types'
import { resolvePdfLocale } from '~/pdf/meta'
import type { PdfLocale } from '~/pdf/meta'

const LABELS: Record<PdfLocale, PdfLabels> = { en }

/** Labels for a stored `pdfLocale`, falling back to the default language. */
export const getPdfLabels = (locale: string): PdfLabels => LABELS[resolvePdfLocale(locale)]

export type { PdfLabels }
