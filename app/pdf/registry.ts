import type { Component } from 'vue'
import type { PdfLabels } from '~/pdf/locales/types'
import { DEFAULT_TEMPLATE_ID, resolveTemplateId } from '~/pdf/meta'
import type { TemplateId } from '~/pdf/meta'
import BasicTemplate from '~/pdf/templates/basic/BasicTemplate.vue'
import { meta as basicMeta } from '~/pdf/templates/basic/meta'
import type { CvData, Theme } from '~/types'

/** The contract every template implements (ARCHITECTURE.md). Templates are pure. */
export interface TemplateProps {
  data: CvData
  theme: Theme
  labels: PdfLabels
  /** BCP 47 PDF language, used for Intl date formatting (D-23). */
  locale: string
}

export interface TemplateMeta {
  id: TemplateId
  name: string
  /** Applied to new versions using this template. Must pass themeSchema (tested). */
  defaultTheme: Theme
}

export interface TemplateEntry {
  meta: TemplateMeta
  component: Component
}

const TEMPLATES: Record<TemplateId, TemplateEntry> = {
  basic: { meta: basicMeta, component: BasicTemplate },
}

/** The template for a stored id. Unknown ids (e.g. from older versions) fall back to the default. */
export function resolveTemplate(id: string): TemplateEntry {
  return TEMPLATES[resolveTemplateId(id)]
}

export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATES).map((t) => t.meta)
}

export const defaultTemplate = (): TemplateEntry => TEMPLATES[DEFAULT_TEMPLATE_ID]
