import * as z from 'zod'
import { hexColorSchema, LIMITS, requiredText } from '~/schemas/shared'

/** PDF theme, edited from the preview toolbar (D-24). Exact controls are decided in Q-12. */
export const themeSchema = z.object({
  colors: z.object({
    primary: hexColorSchema,
    secondary: hexColorSchema.optional(),
    background: hexColorSchema,
    text: hexColorSchema,
  }),
  font: requiredText(LIMITS.font),
})
