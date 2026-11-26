# Architecture

## Target folder layout
Folders are created by the tasks that need them. Don't create empty folders ahead of time.
```
app/
  schemas/            Zod schemas (one file per CV section) + index.ts re-exports. SOURCE OF TRUTH
  types/              Inferred types only: export type X = z.infer<typeof xSchema>
  stores/
    cv.ts             Active CV data and editing actions (Pinia, setup style)
    versions.ts       List of CV versions, active version id
    ui.ts             Layout state (preview width, collapsed)
  services/
    persistence/      StorageAdapter interface + sessionStorage adapter (API adapter in phase 3)
  composables/        usePdfDocument, useSplitPane, useDebouncedModel, useEditorNav, …
  utils/motion.ts     Shared motion-v presets (fadeUpStagger, quickFadeOut, springs)
  editor/
    sections.ts       Section registry: id, label, icon, subnav kind (none|entries|fixed), component
  components/
    layout/           AppTopbar.vue, AppMenu.vue (hamburger), UserAvatar.vue
    editor/           EditorNav.vue (both bars), TabBar.vue (scrollable, layoutId indicator),
                      EditorContent.vue (transition + stagger), sections/<Section>*.vue forms
    preview/          PreviewPanel.vue, PreviewToolbar.vue (colours/font/language), PdfViewer.vue,
                      SplitPane.vue, CollapseHandle.vue
    versions/         Version switcher / manager
  pdf/
    templates/<id>/   Template.vue (vue-pdf components) + meta.ts (id, name, default theme)
    shared/           Reusable vue-pdf blocks (SectionTitle, DateRange, …) + font registration
    locales/          PDF label dictionaries per CV language (en.ts, …), typed with one shared shape
    registry.ts       templateId → { meta, component }
  pages/              index.vue (editor), about.vue
api.ts                Elysia app (nuxt-elysia mounts it at /api). Phase 2 will split it into server modules
tests/
  unit/               Pure TS: schemas, utils, stores, adapters  (Vitest node env)
  nuxt/               Components + integration in Nuxt runtime   (Vitest nuxt env)
  e2e/                Playwright specs + fixtures
```

## Data model
- `CvData`: the content of one CV (sections). Defined by `cvDataSchema`.
- `CvVersion`: `{ id, name, templateId, theme, pdfLocale, data: CvData, createdAt, updatedAt }`.
- `Theme`: `{ colors: { primary, secondary?, background, text }, font }`. The exact keys are decided in Q-12.
- Dates are stored as **ISO strings** (`YYYY-MM` for periods), never `Date` objects, so they serialize
  cleanly to storage and JSON. *(Proposed. Confirm in P1-T01.)*
- The existing hand-written interfaces in `app/types/index.ts` are a draft. P1-T01 replaces them with
  Zod schemas plus inferred types.

## Data flow
```
Form input ─(debounce 300ms)─(UForm + Zod schema)─▶ cv store ─┬─▶ persistence adapter (debounced) ─▶ sessionStorage
                                              │
                                              └─▶ usePdfDocument (debounced) ─▶ vue-pdf ─▶ Blob URL ─▶ <iframe>
```
- **Single direction.** Forms write to the store. The preview reads from the store. PDF templates
  receive data **only via props** (`data: CvData`, `theme: Theme`) and never touch stores, which keeps them pure and testable.
- **Persistence boundary.** Stores call a `StorageAdapter` (`load/save/list/remove`) and never touch
  `sessionStorage` directly. Phase 3 adds an `ApiStorageAdapter` (Eden client) without store changes.
- **Validation.** The same Zod schemas validate forms (client), storage hydration (reject or migrate corrupt
  data) and, later, API request bodies (Elysia) and DB inserts.

## Editor navigation
- `useEditorNav` holds `{ mainId, subId }` and stores it in the `ui` store, so it survives reload.
  It resolves sub-tabs from the registry. For `entries` sections that means one tab per list item
  (by item `id`) plus "＋ Add".
- When the active entry is deleted, select its neighbour; if none is left, select "＋ Add".
- Content is keyed by `mainId:subId`. `<AnimatePresence mode="wait">` (or `<Transition mode="out-in">`)
  runs the quick fade-out, then the staggered fade-up. Interrupting must cancel cleanly, never queue.
- Custom sections (later) register at runtime in the same registry.

## PDF pipeline
- Rendered **client-side only** (`<ClientOnly>`). Re-render is debounced (~300–500 ms, tune later).
- Output is a Blob object URL shown in an `<iframe>`/`<object>`. Revoke old URLs to avoid leaks.
- Fonts are registered once in `app/pdf/shared/fonts.ts` and served from `public/fonts/`. A curated font list
  is exposed to the toolbar. Only registered fonts can be selected.
- **Two separate languages.** The UI uses `@nuxtjs/i18n` (the user's app locale). The PDF uses
  `app/pdf/locales/<pdfLocale>.ts`, passed to templates as a `labels` prop together with `locale` for `Intl`
  date formatting. Templates never read the UI locale.
- Template props: `{ data: CvData; theme: Theme; labels: PdfLabels; locale: string }`.
- If rendering becomes slow, move it to a Web Worker (future task, not phase 1).

## Backend (phase 2+, outline only)
- Elysia modules per domain (`auth`, `cv`), validated with Zod and typed client via Eden (`@elysia/eden`).
- Drizzle schema plus migrations, PostgreSQL. DB access only in the server layer.
- Auth provider/approach: **TBD**, to be asked when phase 3 starts.
