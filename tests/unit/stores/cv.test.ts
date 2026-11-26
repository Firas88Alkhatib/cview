import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { toRaw } from 'vue'
import { createWebStorageAdapter } from '~/services/persistence/webStorageAdapter'
import { useCvStore } from '~/stores/cv'
import { useVersionsStore } from '~/stores/versions'
import type { CvData } from '~/types'
import { makeCvData, makeVersion } from '~~/tests/fixtures/cv'
import { MemoryStorage } from '~~/tests/fixtures/storage'

/** A store whose active version holds `data` (an empty CV by default). */
async function storeWith(data: CvData = makeCvData()) {
  setActivePinia(createPinia())
  const storage = new MemoryStorage()
  const adapter = createWebStorageAdapter({ getStorage: () => storage })
  await adapter.saveVersion(makeVersion({ data }))
  await useVersionsStore().hydrate({ adapter })
  return useCvStore()
}

const job = {
  company: 'Acme',
  role: 'Engineer',
  period: { start: '2020-01' },
  skills: [],
  projects: [],
}

describe('cv store', () => {
  let cv: Awaited<ReturnType<typeof storeWith>>
  beforeEach(async () => {
    cv = await storeWith()
  })

  it('exposes the active version data', () => {
    expect(cv.data?.profile.firstName).toBe('Firas')
  })

  describe('profile', () => {
    it('updates profile fields', () => {
      expect(
        cv.updateProfile({ title: 'Senior Software Developer', email: 'firas@example.com' }),
      ).toBe(true)
      expect(cv.data?.profile).toMatchObject({
        title: 'Senior Software Developer',
        email: 'firas@example.com',
      })
    })

    it('rejects invalid values and keeps the last valid one (D-38)', () => {
      expect(cv.updateProfile({ email: 'not-an-email' })).toBe(false)
      expect(cv.data?.profile.email).toBeUndefined()
    })

    it('manages links', () => {
      const id = cv.addLink({ label: 'GitHub', url: 'https://github.com/Firas88Alkhatib' })!
      expect(cv.updateLink(id, { label: 'Code' })).toBe(true)
      expect(cv.data?.profile.links).toEqual([
        { id, label: 'Code', url: 'https://github.com/Firas88Alkhatib' },
      ])
      expect(cv.addLink({ label: 'Bad', url: 'javascript:alert(1)' })).toBeNull()
      expect(cv.removeLink(id)).toBe(true)
      expect(cv.data?.profile.links).toEqual([])
    })
  })

  describe('experience', () => {
    it('adds an entry with a fresh id and returns it', () => {
      const id = cv.addExperience(job)
      expect(id).toMatch(/^[0-9a-f-]{36}$/)
      expect(cv.data?.experience).toEqual([{ ...job, id }])
    })

    it('does not add an incomplete entry ("+ Add" stays local until valid)', () => {
      expect(cv.addExperience({ ...job, company: '' })).toBeNull()
      expect(cv.data?.experience).toEqual([])
    })

    it('updates, reorders and removes entries', () => {
      const a = cv.addExperience({ ...job, company: 'A' })!
      const b = cv.addExperience({ ...job, company: 'B' })!
      expect(cv.updateExperience(a, { workModel: 'remote' })).toBe(true)
      expect(cv.moveExperience(1, 0)).toBe(true)
      expect(cv.data?.experience.map((e) => e.company)).toEqual(['B', 'A'])
      expect(cv.removeExperience(b)).toBe(true)
      expect(cv.data?.experience.map((e) => [e.company, e.workModel])).toEqual([['A', 'remote']])
    })

    it('returns false for unknown ids and bad moves without changing anything', () => {
      cv.addExperience(job)
      const snapshot = structuredClone(toRaw(cv.data))
      expect(cv.updateExperience('nope', { role: 'X' })).toBe(false)
      expect(cv.removeExperience('nope')).toBe(false)
      expect(cv.moveExperience(0, 5)).toBe(false)
      expect(cv.data).toEqual(snapshot)
    })

    it('manages projects nested under one company', () => {
      const exp = cv.addExperience(job)!
      const p1 = cv.addProject(exp, { name: 'Engine', skills: [] })!
      const p2 = cv.addProject(exp, { name: 'Notes', skills: [] })!
      expect(cv.updateProject(exp, p1, { description: 'Built it' })).toBe(true)
      expect(cv.moveProject(exp, 1, 0)).toBe(true)
      expect(cv.removeProject(exp, p2)).toBe(true)
      expect(cv.data?.experience[0]!.projects).toEqual([
        { id: p1, name: 'Engine', skills: [], description: 'Built it' },
      ])
      expect(cv.addProject('unknown-company', { name: 'X', skills: [] })).toBeNull()
    })
  })

  it('manages education', () => {
    const id = cv.addEducation({ institution: 'UCL', degree: 'BSc', period: { start: '2010-09' } })!
    expect(cv.updateEducation(id, { major: 'Maths' })).toBe(true)
    expect(cv.updateEducation(id, { period: { start: '2010-09', end: '2009-01' } })).toBe(false)
    expect(cv.data?.education[0]).toMatchObject({ major: 'Maths', period: { start: '2010-09' } })
    expect(cv.removeEducation(id)).toBe(true)
  })

  it('manages skills and languages with their level rules', () => {
    const s = cv.addSkill({ name: 'Vue', level: 4 })!
    expect(cv.updateSkill(s, { level: 9 })).toBe(false)
    expect(cv.data?.skills[0]?.level).toBe(4)

    const l = cv.addLanguage({ name: 'German', level: 'B2' })!
    expect(cv.updateLanguage(l, { level: 'native' })).toBe(true)
    expect(cv.data?.languages[0]?.level).toBe('native')
    expect(cv.moveSkill(0, 0)).toBe(true)
    expect(cv.removeLanguage(l)).toBe(true)
  })

  it('edits only the active version', async () => {
    const versions = useVersionsStore()
    const other = versions.create('Other')!
    await versions.setActive(other)
    cv.updateProfile({ title: 'Only here' })
    const first = versions.versions.find((v) => v.id !== other)!
    expect(first.data.profile.title).toBeUndefined()
  })
})
