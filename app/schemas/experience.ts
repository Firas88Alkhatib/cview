import { z } from 'zod'
import { projectSchema } from '~/schemas/project'
import {
  idSchema,
  LIMITS,
  optionalText,
  periodSchema,
  requiredText,
  skillListSchema,
} from '~/schemas/shared'

export const WORK_MODELS = ['onsite', 'remote', 'hybrid'] as const
export const workModelSchema = z.enum(WORK_MODELS)

/** One role at one company. A promotion is a second entry for the same company (D-35). */
export const experienceSchema = z.object({
  id: idSchema,
  company: requiredText(LIMITS.shortText),
  role: requiredText(LIMITS.shortText),
  period: periodSchema,
  location: optionalText(LIMITS.shortText),
  workModel: workModelSchema.optional(),
  description: optionalText(LIMITS.description),
  skills: skillListSchema,
  projects: z.array(projectSchema).max(LIMITS.projects),
})
