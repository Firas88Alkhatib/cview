import { z } from 'zod'
import { linkSchema } from '~/schemas/link'
import {
  emailSchema,
  isoDateSchema,
  LIMITS,
  optionalText,
  phoneSchema,
  requiredText,
} from '~/schemas/shared'

export const addressSchema = z.object({
  country: optionalText(LIMITS.shortText),
  city: optionalText(LIMITS.shortText),
  street: optionalText(LIMITS.shortText),
  postalCode: optionalText(LIMITS.label),
})

/** Profile section (D-22): personal info, summary, contact, address, links. No sub-bar. */
export const profileSchema = z.object({
  firstName: requiredText(LIMITS.name),
  lastName: requiredText(LIMITS.name),
  title: optionalText(LIMITS.title),
  summary: optionalText(LIMITS.summary),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: isoDateSchema,
  address: addressSchema.optional(),
  links: z.array(linkSchema).max(LIMITS.links),
})
