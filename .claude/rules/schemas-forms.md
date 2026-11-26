---
paths:
  - "app/schemas/**"
  - "app/types/**"
  - "app/components/editor/**"
---
# Schemas & forms rules

- Zod v4 schemas in `app/schemas/` are the single source of truth. Types are `z.infer` only. Never
  hand-write a type that duplicates a schema.
- Name schemas `<thing>Schema` and types `<Thing>`, e.g. `export const linkSchema = z.object(...)` and `export type Link = z.infer<typeof linkSchema>`.
- Write user-facing error messages in the schema (`{ error: '...' }` in Zod v4; verify the syntax).
- Dates are ISO strings (see `docs/DECISIONS.md`), never `Date`.
- Changing a schema's shape is a data-model change. **Ask the developer first.** It also affects the
  storage schema version (migration) and, later, Drizzle.
- Forms: `<UForm :schema :state @submit>` with `<UFormField name label>` per input. Nuxt UI v4 accepts
  Zod (Standard Schema) directly. Use `validate-on` for live validation as agreed.
- Text inputs are **debounced** (300 ms, `useDebouncedModel`) before writing to the store. Flush pending
  values on blur and on section change so nothing is lost.
- Forms write to the `cv` store through store actions. They never touch storage or the PDF.
- Lists (experience, education, …) need stable `id`s (`crypto.randomUUID()`) for keys and animations, never array indexes.
- Look up Nuxt UI component APIs at https://ui.nuxt.com/llms.txt (or the Nuxt UI MCP if configured)
  instead of guessing props.
