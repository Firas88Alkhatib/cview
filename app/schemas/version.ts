import { z } from 'zod'
import { cvDataSchema } from '~/schemas/cv'
import { idSchema, LIMITS, localeSchema, requiredText } from '~/schemas/shared'
import { themeSchema } from '~/schemas/theme'

/** A named CV version: content plus its own template, theme and PDF language (D-23). */
export const cvVersionSchema = z.object({
  id: idSchema,
  name: requiredText(LIMITS.versionName),
  templateId: requiredText(LIMITS.label),
  theme: themeSchema,
  /** PDF content language. Independent of the UI locale (D-23). */
  pdfLocale: localeSchema,
  data: cvDataSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
