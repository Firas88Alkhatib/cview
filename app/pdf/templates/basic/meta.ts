import type { TemplateMeta } from '~/pdf/registry'

/** Minimal placeholder template. P1-T10 adds the designed template #1 (Q-6). */
export const meta: TemplateMeta = {
  id: 'basic',
  name: 'Basic',
  defaultTheme: {
    colors: { primary: '#0369A1', background: '#FFFFFF', text: '#111827' },
    font: 'Inter',
  },
}
