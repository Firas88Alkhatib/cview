import { z } from 'zod'
import {
  idSchema,
  LIMITS,
  optionalText,
  periodSchema,
  requiredText,
  skillListSchema,
} from '~/schemas/shared'

/** A project inside an experience entry (shown as an expandable card under the company tab). */
export const projectSchema = z.object({
  id: idSchema,
  name: requiredText(LIMITS.shortText),
  role: optionalText(LIMITS.shortText),
  period: periodSchema.optional(),
  description: optionalText(LIMITS.description),
  skills: skillListSchema,
})
