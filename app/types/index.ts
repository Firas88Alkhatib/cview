import type * as z from 'zod'
import type {
  addressSchema,
  cvDataSchema,
  cvVersionSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  LANGUAGE_LEVELS,
  linkSchema,
  periodSchema,
  profileSchema,
  projectSchema,
  skillSchema,
  themeSchema,
  WORK_MODELS,
} from '~/schemas'
import type { uiStateSchema } from '~/schemas/ui'

// Inferred types only. Never hand-write a type that duplicates a schema (D-3).
export type Period = z.infer<typeof periodSchema>
export type Address = z.infer<typeof addressSchema>
export type Link = z.infer<typeof linkSchema>
export type Profile = z.infer<typeof profileSchema>
export type Project = z.infer<typeof projectSchema>
export type WorkModel = (typeof WORK_MODELS)[number]
export type Experience = z.infer<typeof experienceSchema>
export type Education = z.infer<typeof educationSchema>
export type Skill = z.infer<typeof skillSchema>
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number]
export type Language = z.infer<typeof languageSchema>
export type Theme = z.infer<typeof themeSchema>
export type CvData = z.infer<typeof cvDataSchema>
export type CvVersion = z.infer<typeof cvVersionSchema>
export type UiState = z.infer<typeof uiStateSchema>
