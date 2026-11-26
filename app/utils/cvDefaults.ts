import type { CvData, CvVersion, Theme } from '~/types'
import { newId } from '~/utils/id'

// Defaults for new CV versions. The template id and theme are placeholders until the template
// system (P1-T09) provides real ones.
export const DEFAULT_TEMPLATE_ID = 'classic'
export const DEFAULT_PDF_LOCALE = 'en'
export const DEFAULT_THEME: Theme = {
  colors: { primary: '#0369A1', background: '#FFFFFF', text: '#111827' },
  font: 'Helvetica',
}

/**
 * Example CV for first-time guests (D-41). It's valid from the first moment, so the preview
 * looks good immediately, and the user overwrites it. English content for now; per-PDF-locale
 * samples can follow once PDF languages exist (Q-13).
 */
export function createSampleCvData(): CvData {
  // Persona: the project author. Contact details stay fake (public repo). Dates, degree, skills
  // and languages are placeholders.
  return {
    profile: {
      firstName: 'Firas',
      lastName: 'Alkhatib',
      title: 'Software Developer',
      summary: 'Software developer who enjoys building fast, accessible and well-tested web apps.',
      email: 'firas.alkhatib@example.com',
      address: { country: 'Finland', city: 'Lahti' },
      links: [{ id: newId(), label: 'GitHub', url: 'https://github.com/Firas88Alkhatib' }],
    },
    experience: [
      {
        id: newId(),
        company: 'Reaktor',
        role: 'Software Developer',
        period: { start: '2022-01' },
        location: 'Lahti, Finland',
        workModel: 'hybrid',
        description: 'Building web applications for clients across several industries.',
        skills: ['TypeScript', 'Vue', 'Nuxt'],
        projects: [
          {
            id: newId(),
            name: 'Customer portal',
            description: 'Self-service portal with a shared component library.',
            skills: ['Vue', 'Accessibility'],
          },
        ],
      },
    ],
    education: [
      {
        id: newId(),
        institution: 'University of Helsinki',
        degree: 'BSc Computer Science',
        period: { start: '2017-09', end: '2021-06' },
      },
    ],
    skills: [
      { id: newId(), name: 'TypeScript', level: 5 },
      { id: newId(), name: 'Vue & Nuxt', level: 5 },
      { id: newId(), name: 'PostgreSQL', level: 4 },
    ],
    languages: [
      { id: newId(), name: 'English', level: 'C1' },
      { id: newId(), name: 'Finnish', level: 'B1' },
    ],
  }
}

export function createVersion(name: string, data: CvData, now = new Date()): CvVersion {
  const timestamp = now.toISOString()
  return {
    id: newId(),
    name,
    templateId: DEFAULT_TEMPLATE_ID,
    theme: structuredClone(DEFAULT_THEME),
    pdfLocale: DEFAULT_PDF_LOCALE,
    data,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
