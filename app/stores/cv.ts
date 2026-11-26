import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useVersionsStore } from '~/stores/versions'
import type {
  CvData,
  Education,
  Experience,
  Language,
  Link,
  Profile,
  Project,
  Skill,
} from '~/types'
import { newId } from '~/utils/id'
import { moveItem, removeItem, updateItem } from '~/utils/list'

// Editing actions for the active CV version. Every action goes through versions.commit(),
// which validates the whole version and commits only valid results (D-38). Actions return
// true/false, or the new id/null for adds. Callers (forms) pass already-valid values.

type ItemInput<T> = Omit<T, 'id'>
type ItemPatch<T> = Partial<Omit<T, 'id'>>

export const useCvStore = defineStore('cv', () => {
  const versions = useVersionsStore()

  const data = computed<CvData | null>(() => versions.active?.data ?? null)

  function edit(mutate: (draft: CvData) => void): boolean {
    const id = versions.activeId
    return id !== null && versions.commit(id, (version) => mutate(version.data))
  }

  /** add/update/remove/move for one id-keyed list inside the CV. */
  function listActions<T extends { id: string }>(select: (draft: CvData) => T[]) {
    return {
      add(input: ItemInput<T>): string | null {
        const id = newId()
        return edit((d) => void select(d).push({ ...input, id } as T)) ? id : null
      },
      update: (id: string, patch: ItemPatch<T>) => edit((d) => updateItem(select(d), id, patch)),
      remove: (id: string) => edit((d) => removeItem(select(d), id)),
      move: (from: number, to: number) => edit((d) => moveItem(select(d), from, to)),
    }
  }

  const links = listActions<Link>((d) => d.profile.links)
  const experience = listActions<Experience>((d) => d.experience)
  const education = listActions<Education>((d) => d.education)
  const skills = listActions<Skill>((d) => d.skills)
  const languages = listActions<Language>((d) => d.languages)

  const projectsOf = (experienceId: string) =>
    listActions<Project>((d) => {
      const entry = d.experience.find((e) => e.id === experienceId)
      if (!entry) throw new Error(`Experience not found: ${experienceId}`)
      return entry.projects
    })

  return {
    data,

    updateProfile: (patch: Partial<Omit<Profile, 'links'>>) =>
      edit((d) => void Object.assign(d.profile, patch)),

    addLink: links.add,
    updateLink: links.update,
    removeLink: links.remove,
    moveLink: links.move,

    addExperience: experience.add,
    updateExperience: experience.update,
    removeExperience: experience.remove,
    moveExperience: experience.move,

    addProject: (experienceId: string, input: ItemInput<Project>) =>
      projectsOf(experienceId).add(input),
    updateProject: (experienceId: string, id: string, patch: ItemPatch<Project>) =>
      projectsOf(experienceId).update(id, patch),
    removeProject: (experienceId: string, id: string) => projectsOf(experienceId).remove(id),
    moveProject: (experienceId: string, from: number, to: number) =>
      projectsOf(experienceId).move(from, to),

    addEducation: education.add,
    updateEducation: education.update,
    removeEducation: education.remove,
    moveEducation: education.move,

    addSkill: skills.add,
    updateSkill: skills.update,
    removeSkill: skills.remove,
    moveSkill: skills.move,

    addLanguage: languages.add,
    updateLanguage: languages.update,
    removeLanguage: languages.remove,
    moveLanguage: languages.move,
  }
})
