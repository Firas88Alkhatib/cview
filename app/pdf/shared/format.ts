import type { PdfLabels } from '~/pdf/locales/types'
import type { Period } from '~/types'

// Pure formatting helpers for templates. Dates follow the CV's PDF language, not the UI (D-23).

/** `2021-03` → "Mar 2021" (or the PDF locale's equivalent). */
export function formatMonth(month: string, locale: string): string {
  const [year, m] = month.split('-').map(Number)
  if (!year || !m) return month
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(year, m - 1, 1))
}

/** "Mar 2021 – Present", or "Mar 2021 – Jun 2023". */
export function formatPeriod(period: Period, locale: string, labels: PdfLabels): string {
  const end = period.end ? formatMonth(period.end, locale) : labels.period.present
  return `${formatMonth(period.start, locale)} – ${end}`
}

/** Joins the non-empty parts: "Lahti · Finland". */
export function joinParts(parts: Array<string | undefined | null>, separator = ' · '): string {
  return parts.filter((p): p is string => !!p && p.trim() !== '').join(separator)
}
