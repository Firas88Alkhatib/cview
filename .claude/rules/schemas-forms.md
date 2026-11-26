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
- **No messages in schemas** (D-37). Generic issues are mapped by `issueToI18n` (`app/utils/validation.ts`).
  A custom `.refine()` attaches its key with `withKey('validation.x')`. Add new keys to `VALIDATION_KEYS` **and**
  `en.json` (a unit test checks both). `zod-i18n.client.ts` translates messages at validation time.
- Build fields from `app/schemas/shared.ts` (`requiredText`, `optionalText`, `periodSchema`, `idSchema`, …) and `LIMITS`.
  Optional text accepts `''`, because cleared inputs produce it.
- Test schemas with `issuesOf(schema, value)` (`tests/unit/schemas/helpers.ts`), which returns `[path, i18nKey]` pairs.
- Dates: `YYYY-MM` periods (`monthSchema`, `periodSchema`), never `Date` (D-33).
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
