import type { Education, ExperienceBase, Link, Skill, Template, User } from '~/types'

export interface CVStore {
  user: User
  experiences: ExperienceBase[]
  education: Education[]
  skills: Skill[]
  languages: Skill[]
  links: Link[]
  template: Template
}
