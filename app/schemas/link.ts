import * as z from 'zod'
import { idSchema, LIMITS, requiredText, urlSchema } from '~/schemas/shared'

export const linkSchema = z.object({
  id: idSchema,
  label: requiredText(LIMITS.label),
  url: urlSchema,
})
