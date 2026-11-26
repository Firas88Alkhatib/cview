import * as z from 'zod'
import { idSchema, LIMITS, requiredText } from '~/schemas/shared'

export const SKILL_LEVEL = { min: 1, max: 5 } as const

export const skillSchema = z.object({
  id: idSchema,
  name: requiredText(LIMITS.skill),
  level: z.number().int().min(SKILL_LEVEL.min).max(SKILL_LEVEL.max).optional(),
})

/** CEFR levels plus native speaker (D-34). */
export const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const

export const languageSchema = z.object({
  id: idSchema,
  name: requiredText(LIMITS.skill),
  level: z.enum(LANGUAGE_LEVELS),
})
