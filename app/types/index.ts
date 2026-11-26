export interface Period {
  start: Date
  end?: string
}

export interface Address {
  country: string
  city?: string
  street?: string
  postalCode?: string
}

export type WorkModel = 'Onsite' | 'Remote' | 'Hybrid'

export interface Link {
  name: string
  url: string
}

export interface Template {
  name: string
  primaryColor: string
  secondaryColor?: string
  backgroundColor: string
  font: string
}

export interface User {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  title?: string
  dateOfBirth?: Date
  address?: Address
}

export interface ExperienceBase {
  role: string
  period: Period
  description: string
  skills: string[]
  location?: string
  workModel?: WorkModel
  projects?: Project[]
}
export interface Education {
  institution: string
  degree: string
  period: Period
  major?: string
  description?: string
}

export interface Skill {
  name: string
  level: number
  description?: string
}

export interface Project extends ExperienceBase {
  projectName: string
}
export interface ExperienceItem extends ExperienceBase {
  company: string
}
