---
name: add-pdf-template
description: Create a new CV PDF template for CView using @ceereals/vue-pdf, registered in the template registry with a default theme and tests. Use when the user asks for a new CV template/layout/design.
---

# Add a PDF template

**Ask the developer first:** a design reference or description (columns, header style, section
order), fonts, default colours, and whether a photo is supported.

1. Create `app/pdf/templates/<id>/`:
   - `meta.ts` exports `meta: TemplateMeta` (`{ id, name, defaultTheme }`), where `defaultTheme` satisfies `themeSchema`.
   - `<Name>Template.vue` (multi-word name, D-27) takes `TemplateProps` (`{ data, theme, labels, locale }` from
     `app/pdf/registry.ts`) and uses vue-pdf primitives only (see `.claude/rules/pdf.md`). Reuse
     `app/pdf/shared/format.ts`. Font: `resolveFontFamily(theme.font)`. Text: `labels`, never hard-coded.
   - Add the id to `TEMPLATE_IDS` in `app/pdf/meta.ts`.
2. Register the template in `TEMPLATES` in `app/pdf/registry.ts`.
3. Fonts: use the bundled families (`FONT_FAMILIES`, D-45). A new font is a Fontsource package plus `?url` imports in
   `app/pdf/shared/fonts.ts` and an entry in `FONT_FAMILIES` (ask first; check the licence).
4. Handle edge cases: all optional fields empty, very long text, many entries (page breaks; use `wrap` and
   `break` props as the vue-pdf docs describe), and non-Latin characters if the font supports them.
5. Tests (no PDF content testing, D-45): the registry resolves `<id>` and `meta.defaultTheme` passes `themeSchema`
   (`tests/nuxt/pdf/registry.test.ts`), unit tests for any new pure helpers, and E2E that the preview still produces a PDF.
6. Visual check: headless Chromium can't show PDFs (Q-14). Ask the developer to look at it in `bun run dev` with the
   full and minimal fixtures before marking the task done.
