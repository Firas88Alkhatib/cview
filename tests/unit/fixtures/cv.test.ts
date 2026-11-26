import { describe, expect, it } from 'vitest'
import {
  cvDataSchema,
  cvVersionSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  linkSchema,
  profileSchema,
  projectSchema,
  skillSchema,
  themeSchema,
} from '~/schemas'
import type { CvData } from '~/types'
import {
  fixtureId,
  fullCvData,
  longCvData,
  makeCvData,
  makeEducation,
  makeExperience,
  makeLanguage,
  makeLink,
  makeProfile,
  makeProject,
  makeSkill,
  makeTheme,
  makeVersion,
  minimalCvData,
} from '~~/tests/fixtures/cv'
import { issuesOf } from '~~/tests/unit/schemas/helpers'

/** All list-item ids in a CV, including nested projects and links. */
const idsOf = (cv: CvData) => [
  ...cv.profile.links.map((l) => l.id),
  ...cv.experience.flatMap((e) => [e.id, ...e.projects.map((p) => p.id)]),
  ...cv.education.map((e) => e.id),
  ...cv.skills.map((s) => s.id),
  ...cv.languages.map((l) => l.id),
]

describe('fixture factories', () => {
  it.each([
    ['makeLink', linkSchema, makeLink],
    ['makeProfile', profileSchema, makeProfile],
    ['makeProject', projectSchema, makeProject],
    ['makeExperience', experienceSchema, makeExperience],
    ['makeEducation', educationSchema, makeEducation],
    ['makeSkill', skillSchema, makeSkill],
    ['makeLanguage', languageSchema, makeLanguage],
    ['makeTheme', themeSchema, makeTheme],
    ['makeCvData', cvDataSchema, makeCvData],
    ['makeVersion', cvVersionSchema, makeVersion],
  ] as const)('%s returns schema-valid data', (_name, schema, factory) => {
    expect(issuesOf(schema, factory())).toEqual([])
  })

  it('applies overrides', () => {
    expect(makeExperience({ company: 'Acme' }).company).toBe('Acme')
  })

  it('returns fresh objects, so tests cannot leak mutations into each other', () => {
    const a = makeCvData()
    a.skills.push(makeSkill())
    expect(makeCvData().skills).toEqual([])
  })

  it('generates deterministic, unique, valid UUIDs', () => {
    const [a, b] = [fixtureId(), fixtureId()]
    expect(a).not.toBe(b)
    expect(a).toMatch(/^00000000-0000-4000-8000-[0-9a-f]{12}$/)
  })
})

describe('presets', () => {
  it.each([
    ['minimal', minimalCvData],
    ['full', fullCvData],
    ['long', longCvData],
  ] as const)('%s CV is schema-valid with unique ids', (_name, preset) => {
    const cv = preset()
    expect(issuesOf(cvDataSchema, cv)).toEqual([])
    const ids = idsOf(cv)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('minimal has only the required fields', () => {
    const cv = minimalCvData()
    expect(Object.keys(cv.profile).sort()).toEqual(['firstName', 'lastName', 'links'])
    expect(
      [cv.experience, cv.education, cv.skills, cv.languages].every((l) => l.length === 0),
    ).toBe(true)
  })

  it('full fills every optional profile field and every section', () => {
    const cv = fullCvData()
    const profileKeys = Object.keys(profileSchema.shape)
    expect(profileKeys.filter((k) => !(k in cv.profile))).toEqual([])
    expect(cv.experience[0]!.projects.length).toBeGreaterThan(0)
    expect([cv.education, cv.skills, cv.languages].every((l) => l.length > 0)).toBe(true)
  })

  it('long has enough content to need more than one page', () => {
    const cv = longCvData()
    const text = cv.experience
      .map((e) => `${e.description} ${e.projects[0]?.description}`)
      .join(' ')
    expect(cv.experience.length).toBeGreaterThanOrEqual(8)
    expect(text.length).toBeGreaterThan(8000)
  })
})
