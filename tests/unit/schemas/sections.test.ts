import { describe, expect, it } from 'vitest'
import {
  educationSchema,
  experienceSchema,
  languageSchema,
  LIMITS,
  linkSchema,
  profileSchema,
  projectSchema,
  skillSchema,
  themeSchema,
} from '~/schemas'
import {
  makeEducation,
  makeExperience,
  makeLanguage,
  makeLink,
  makeProfile,
  makeProject,
  makeSkill,
  makeTheme,
} from '~~/tests/fixtures/cv'
import { issuesOf } from '~~/tests/unit/schemas/helpers'

const link = makeLink()
const profile = makeProfile()
const project = makeProject()
const experience = makeExperience()
const education = makeEducation()
const theme = makeTheme()

describe('linkSchema', () => {
  it('accepts a labelled http(s) link', () => {
    expect(issuesOf(linkSchema, link)).toEqual([])
  })

  it('requires an id from crypto.randomUUID', () => {
    expect(issuesOf(linkSchema, { ...link, id: '1' })).toEqual([['id', 'validation.invalidId']])
  })
})

describe('profileSchema', () => {
  it('needs only first and last name', () => {
    expect(issuesOf(profileSchema, profile)).toEqual([])
  })

  it('reports each missing name on its own field', () => {
    expect(issuesOf(profileSchema, { ...profile, firstName: '', lastName: ' ' })).toEqual([
      ['firstName', 'validation.required'],
      ['lastName', 'validation.required'],
    ])
  })

  it('accepts a fully filled profile', () => {
    const full = {
      ...profile,
      title: 'Software Developer',
      summary: 'Builds web apps.',
      email: 'firas.alkhatib@example.com',
      phone: '+358 40 000 0000',
      dateOfBirth: '1990-01-01',
      address: {
        country: 'Finland',
        city: 'Lahti',
        street: 'Example street 1',
        postalCode: '15100',
      },
      links: [link],
    }
    expect(issuesOf(profileSchema, full)).toEqual([])
  })

  it(`caps links at ${LIMITS.links}`, () => {
    const links = Array.from({ length: LIMITS.links + 1 }, () => link)
    expect(issuesOf(profileSchema, { ...profile, links })).toEqual([
      ['links', 'validation.tooMany'],
    ])
  })

  it('caps the summary length', () => {
    const summary = 'x'.repeat(LIMITS.summary + 1)
    expect(issuesOf(profileSchema, { ...profile, summary })).toEqual([
      ['summary', 'validation.tooLong'],
    ])
  })
})

describe('experienceSchema', () => {
  it('accepts a current role with no end date', () => {
    expect(issuesOf(experienceSchema, experience)).toEqual([])
  })

  it('requires company, role and a start month', () => {
    expect(
      issuesOf(experienceSchema, { ...experience, company: '', role: '', period: { start: '' } }),
    ).toEqual([
      ['company', 'validation.required'],
      ['role', 'validation.required'],
      ['period.start', 'validation.invalidMonth'],
    ])
  })

  it('only allows the known work models', () => {
    expect(issuesOf(experienceSchema, { ...experience, workModel: 'remote' })).toEqual([])
    expect(issuesOf(experienceSchema, { ...experience, workModel: 'office' })).toEqual([
      ['workModel', 'validation.invalidOption'],
    ])
  })

  it('validates nested projects with their full path', () => {
    const bad = { ...experience, projects: [{ ...project, name: '' }] }
    expect(issuesOf(experienceSchema, bad)).toEqual([['projects.0.name', 'validation.required']])
  })

  it(`caps skills at ${LIMITS.skills} and each skill at ${LIMITS.skill} characters`, () => {
    const many = Array.from({ length: LIMITS.skills + 1 }, () => 'Vue')
    expect(issuesOf(experienceSchema, { ...experience, skills: many })).toEqual([
      ['skills', 'validation.tooMany'],
    ])
    const long = ['x'.repeat(LIMITS.skill + 1)]
    expect(issuesOf(experienceSchema, { ...experience, skills: long })).toEqual([
      ['skills.0', 'validation.tooLong'],
    ])
  })
})

describe('projectSchema', () => {
  it('needs only a name; the period is optional', () => {
    expect(issuesOf(projectSchema, project)).toEqual([])
  })

  it('still checks the period order when given', () => {
    const period = { start: '2020-05', end: '2020-01' }
    expect(issuesOf(projectSchema, { ...project, period })).toEqual([
      ['period.end', 'validation.periodOrder'],
    ])
  })
})

describe('educationSchema', () => {
  it('accepts a completed degree', () => {
    expect(issuesOf(educationSchema, education)).toEqual([])
  })

  it('requires institution and degree', () => {
    expect(issuesOf(educationSchema, { ...education, institution: '', degree: '' })).toEqual([
      ['institution', 'validation.required'],
      ['degree', 'validation.required'],
    ])
  })
})

describe('skillSchema', () => {
  it('accepts a skill with or without a level', () => {
    expect(issuesOf(skillSchema, makeSkill({ name: 'Vue' }))).toEqual([])
    expect(issuesOf(skillSchema, makeSkill({ name: 'Vue', level: 5 }))).toEqual([])
  })

  it.each([
    [0, 'validation.tooLow'],
    [6, 'validation.tooHigh'],
  ])('rejects level %i', (level, key) => {
    expect(issuesOf(skillSchema, { ...makeSkill(), level })).toEqual([['level', key]])
  })

  it('rejects fractional levels', () => {
    expect(issuesOf(skillSchema, { ...makeSkill(), level: 2.5 })).toHaveLength(1)
  })
})

describe('languageSchema', () => {
  it.each(['A1', 'C2', 'native'])('accepts CEFR/native level %s', (level) => {
    expect(issuesOf(languageSchema, { ...makeLanguage(), level })).toEqual([])
  })

  it('rejects free-text levels', () => {
    expect(issuesOf(languageSchema, { ...makeLanguage(), level: 'Fluent' })).toEqual([
      ['level', 'validation.invalidOption'],
    ])
  })
})

describe('themeSchema', () => {
  it('accepts a theme without a secondary colour', () => {
    expect(issuesOf(themeSchema, theme)).toEqual([])
  })

  it('reports an invalid colour on its exact path', () => {
    const bad = { ...theme, colors: { ...theme.colors, text: 'black' } }
    expect(issuesOf(themeSchema, bad)).toEqual([['colors.text', 'validation.invalidColor']])
  })
})
