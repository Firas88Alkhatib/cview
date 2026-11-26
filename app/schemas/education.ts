import * as z from 'zod'
import { idSchema, LIMITS, optionalText, periodSchema, requiredText } from '~/schemas/shared'

export const educationSchema = z.object({
  id: idSchema,
  institution: requiredText(LIMITS.shortText),
  degree: requiredText(LIMITS.shortText),
  major: optionalText(LIMITS.shortText),
  period: periodSchema,
  location: optionalText(LIMITS.shortText),
  description: optionalText(LIMITS.description),
})
