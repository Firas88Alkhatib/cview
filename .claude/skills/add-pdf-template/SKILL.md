---
name: add-pdf-template
description: Create a new CV PDF template for CView using @ceereals/vue-pdf, registered in the template registry with a default theme and tests. Use when the user asks for a new CV template/layout/design.
---

# Add a PDF template

**Ask the developer first:** a design reference or description (columns, header style, section
order), fonts, default colours, and whether a photo is supported.

1. Create `app/pdf/templates/<id>/`:
   - `meta.ts` exports `{ id, name, description, defaultTheme }`, where `defaultTheme` satisfies `themeSchema`.
   - `Template.vue` takes props `{ data: CvData; theme: Theme }` and uses vue-pdf primitives only
     (see `.claude/rules/pdf.md`). Reuse blocks from `app/pdf/shared/`.
2. Register the template in `app/pdf/registry.ts`.
3. Fonts go in `public/fonts/` and are registered in `app/pdf/shared/fonts.ts` (ask about the licence or source).
4. Handle edge cases: all optional fields empty, very long text, many entries (page breaks; use `wrap` and
   `break` props as the vue-pdf docs describe), and non-Latin characters if the font supports them.
5. Tests:
   - unit: the registry resolves `<id>`, `meta.defaultTheme` passes `themeSchema`, and the mappers work
   - e2e: select the template, the preview renders (a new `blob:` URL), and the download works
6. Visual check: render with the `makeCvData()` full and minimal fixtures and show the developer
   (screenshot via Playwright) before marking the task done.
