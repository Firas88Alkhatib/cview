import type {
  CvData,
  CvVersion,
  Education,
  Experience,
  Language,
  Link,
  Profile,
  Project,
  Skill,
  Theme,
} from '~/types'

// Test data factories. Every factory returns a fresh, schema-valid object (tested in
// tests/unit/fixtures/cv.test.ts). Pass overrides for the fields a test cares about.
// Invalid data: spread and override, e.g. `{ ...makeExperience(), workModel: 'office' }`.

let counter = 0

/** Deterministic, valid UUID v4. Reproducible across runs, unlike crypto.randomUUID(). */
export function fixtureId(): string {
  counter += 1
  return `00000000-0000-4000-8000-${counter.toString(16).padStart(12, '0')}`
}

export const makeLink = (overrides: Partial<Link> = {}): Link => ({
  id: fixtureId(),
  label: 'GitHub',
  url: 'https://github.com/Firas88Alkhatib',
  ...overrides,
})

export const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  firstName: 'Firas',
  lastName: 'Alkhatib',
  links: [],
  ...overrides,
})

export const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: fixtureId(),
  name: 'Customer portal',
  skills: [],
  ...overrides,
})

export const makeExperience = (overrides: Partial<Experience> = {}): Experience => ({
  id: fixtureId(),
  company: 'Reaktor',
  role: 'Software Developer',
  period: { start: '2022-01' },
  skills: [],
  projects: [],
  ...overrides,
})

export const makeEducation = (overrides: Partial<Education> = {}): Education => ({
  id: fixtureId(),
  institution: 'University of Helsinki',
  degree: 'BSc Computer Science',
  period: { start: '2017-09', end: '2021-06' },
  ...overrides,
})

export const makeSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: fixtureId(),
  name: 'TypeScript',
  ...overrides,
})

export const makeLanguage = (overrides: Partial<Language> = {}): Language => ({
  id: fixtureId(),
  name: 'English',
  level: 'native',
  ...overrides,
})

export const makeTheme = (overrides: Partial<Theme> = {}): Theme => ({
  colors: { primary: '#1E40AF', background: '#FFFFFF', text: '#111827' },
  font: 'Inter',
  ...overrides,
})

export const makeCvData = (overrides: Partial<CvData> = {}): CvData => ({
  profile: makeProfile(),
  experience: [],
  education: [],
  skills: [],
  languages: [],
  ...overrides,
})

export const makeVersion = (overrides: Partial<CvVersion> = {}): CvVersion => ({
  id: fixtureId(),
  name: 'Main CV',
  templateId: 'classic',
  theme: makeTheme(),
  pdfLocale: 'en',
  data: makeCvData(),
  createdAt: '2026-11-26T10:00:00.000Z',
  updatedAt: '2026-11-26T10:00:00.000Z',
  ...overrides,
})

// ── Presets ────────────────────────────────────────────────────────────────

/** Only the required fields. Templates must render it without empty headings. */
export const minimalCvData = (): CvData => makeCvData()

/** Every optional field filled, at least one entry per section. */
export const fullCvData = (): CvData =>
  makeCvData({
    profile: makeProfile({
      title: 'Software Developer',
      summary: 'Software developer who enjoys building fast, accessible and well-tested web apps.',
      // Fake contact details: this repo is public.
      email: 'firas.alkhatib@example.com',
      phone: '+358 40 000 0000',
      dateOfBirth: '1990-01-01',
      address: {
        country: 'Finland',
        city: 'Lahti',
        street: 'Example street 1',
        postalCode: '15100',
      },
      links: [makeLink(), makeLink({ label: 'Website', url: 'https://example.com' })],
    }),
    experience: [
      makeExperience({
        location: 'Lahti, Finland',
        workModel: 'hybrid',
        description: 'Building web applications for clients across several industries.',
        skills: ['TypeScript', 'Vue', 'Nuxt'],
        projects: [
          makeProject({
            role: 'Frontend lead',
            period: { start: '2023-02', end: '2024-05' },
            description: 'Self-service portal with a shared component library.',
            skills: ['Vue', 'Accessibility'],
          }),
        ],
      }),
      makeExperience({
        company: 'Previous Company',
        role: 'Junior Developer',
        period: { start: '2021-06', end: '2021-12' },
      }),
    ],
    education: [
      makeEducation({
        major: 'Software Engineering',
        location: 'Helsinki, Finland',
        description: 'Thesis on web application performance.',
      }),
    ],
    skills: [makeSkill({ level: 5 }), makeSkill({ name: 'Vue & Nuxt', level: 4 })],
    languages: [makeLanguage({ level: 'C1' }), makeLanguage({ name: 'Finnish', level: 'B1' })],
  })

/** Enough content to overflow one A4 page (page-break and layout tests). */
export const longCvData = (): CvData => {
  const paragraph = 'Designed, built and documented a complex system end to end. '.repeat(12).trim()
  return makeCvData({
    profile: makeProfile({ title: 'Engineer', summary: paragraph.slice(0, 900) }),
    experience: Array.from({ length: 8 }, (_, i) =>
      makeExperience({
        company: `Company ${i + 1}`,
        role: 'Senior engineer',
        period: {
          start: `20${String(10 + i).padStart(2, '0')}-01`,
          end: `20${String(11 + i).padStart(2, '0')}-01`,
        },
        description: paragraph,
        skills: ['TypeScript', 'Vue', 'Nuxt', 'PostgreSQL'],
        projects: [makeProject({ name: `Project ${i + 1}`, description: paragraph })],
      }),
    ),
    education: Array.from({ length: 3 }, (_, i) =>
      makeEducation({ institution: `University ${i + 1}` }),
    ),
    skills: Array.from({ length: 12 }, (_, i) =>
      makeSkill({ name: `Skill ${i + 1}`, level: (i % 5) + 1 }),
    ),
    languages: [makeLanguage(), makeLanguage({ name: 'German', level: 'B2' })],
  })
}
