---
name: add-cv-section
description: Add or extend a CV section (e.g. certifications, volunteering) end to end in CView, covering Zod schema, types, store actions, persistence version, editor form, PDF template rendering, and tests. Use when the user asks for a new CV section or new fields on a section.
---

# Add a CV section

**Ask the developer first:** the fields, which are required, limits, list or single, ordering, and how
the section should look in the editor and in each template. A new section is a data-model change.

Steps, in order:
1. **Schema.** `app/schemas/<section>.ts` (`<section>Schema`). Add it to `cvDataSchema`. Export the type in `app/types/`.
2. **Persistence.** Bump `schemaVersion` and add a migration that defaults the new section for existing data.
3. **Store.** Add actions to the `cv` store (`add…`, `update…(id, patch)`, `remove…`, `reorder…` for lists).
4. **Fixtures.** Extend `makeCvData()` in `tests/fixtures/`.
5. **Editor.** `app/components/editor/Editor<Section>.vue` with `UForm` + `UFormField`, the store actions
   and the agreed animations for list add/remove. Register it in the editor shell.
6. **PDF.** Render the section in **every** template under `app/pdf/templates/*`. Empty means hidden. Put any
   formatting logic in a pure mapper.
7. **Tests.**
   - unit: schema valid and invalid cases, store actions, migration, mapper
   - nuxt: form validation messages and store updates
   - e2e: fill the section, then the preview updates
8. Run the checks from `AGENTS.md` and update the docs (`PROJECT.md` section list) if the scope changed.
