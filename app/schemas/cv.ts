import * as z from 'zod'
import { educationSchema } from '~/schemas/education'
import { experienceSchema } from '~/schemas/experience'
import { profileSchema } from '~/schemas/profile'
import { languageSchema, skillSchema } from '~/schemas/skill'

/** The content of one CV, mirroring the editor section map (D-22). */
export const cvDataSchema = z.object({
  profile: profileSchema,
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
  languages: z.array(languageSchema),
})
