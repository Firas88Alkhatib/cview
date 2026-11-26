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
  url: 'https://github.com/ada',
  ...overrides,
})

export const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  links: [],
  ...overrides,
})

export const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: fixtureId(),
  name: 'Analytical Engine notes',
  skills: [],
  ...overrides,
})

export const makeExperience = (overrides: Partial<Experience> = {}): Experience => ({
  id: fixtureId(),
  company: 'Babbage & Co',
  role: 'Engineer',
  period: { start: '1842-01' },
  skills: [],
  projects: [],
  ...overrides,
})

export const makeEducation = (overrides: Partial<Education> = {}): Education => ({
  id: fixtureId(),
  institution: 'University of London',
  degree: 'BSc Mathematics',
  period: { start: '1830-09', end: '1834-06' },
  ...overrides,
})

export const makeSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: fixtureId(),
  name: 'Mathematics',
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
      title: 'Mathematician & first programmer',
      summary: 'Wrote the first published algorithm intended for a machine.',
      email: 'ada@example.com',
      phone: '+44 20 1234 5678',
      dateOfBirth: '1815-12-10',
      address: { country: 'United Kingdom', city: 'London', street: 'St James', postalCode: 'SW1' },
      links: [makeLink(), makeLink({ label: 'Website', url: 'https://ada.example.com' })],
    }),
    experience: [
      makeExperience({
        location: 'London',
        workModel: 'hybrid',
        description: 'Translated and annotated Menabrea’s paper on the Analytical Engine.',
        skills: ['Algorithms', 'Technical writing'],
        projects: [
          makeProject({
            role: 'Author',
            period: { start: '1842-09', end: '1843-07' },
            description: 'Note G: an algorithm to compute Bernoulli numbers.',
            skills: ['Algorithms'],
          }),
        ],
      }),
      makeExperience({
        company: 'Royal Society',
        role: 'Correspondent',
        period: { start: '1835-01', end: '1841-12' },
      }),
    ],
    education: [
      makeEducation({
        major: 'Mathematics',
        location: 'London',
        description: 'Private tutoring by De Morgan.',
      }),
    ],
    skills: [makeSkill({ level: 5 }), makeSkill({ name: 'Poetical science', level: 4 })],
    languages: [makeLanguage(), makeLanguage({ name: 'French', level: 'C1' })],
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
