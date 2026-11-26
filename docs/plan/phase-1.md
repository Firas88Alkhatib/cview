# Phase 1: Frontend MVP

Frontend only (D-7). Task format as in `phase-0.md`. Spec: `docs/PROJECT.md`.
All UI text goes through i18n keys (D-20), so every task adds its strings to `i18n/locales/en.json`.

| ID | Task | Status | Depends |
|---|---|---|---|
| P1-T01 | Zod schemas + inferred types for all CV sections | done | P0-T02 |
| P1-T02 | Test fixtures/factories (`makeCvData`, …) | done | P1-T01 |
| P1-T03 | Persistence: `StorageAdapter` + sessionStorage adapter | done | P1-T01 |
| P1-T04 | Stores: `cv`, `versions`, `ui` | done | P1-T03 |
| P1-T05 | App shell: full-height layout, top bar + split area, no page scroll | done | P0-T04 |
| P1-T06 | Split layout: resizable panels | done | P1-T05 |
| P1-T07 | Collapse to thin bar + click/drag handle | done | P1-T06, P0-T05 |
| P1-T08 | Mobile layout behaviour | blocked (Q-5) | P1-T07 |
| P1-T09 | Template system: registry, theme, fonts, PDF label locales | done | P0-T07, P1-T01 |
| P1-T10 | Template #1 | blocked (Q-6) | P1-T09 |
| P1-T11 | Live preview (`usePdfDocument`, debounce, viewer, PDF-only scroll) + download | todo | P1-T04, P1-T09, Q-14 |
| P1-T12 | `useDebouncedModel` + debounced input wrappers | todo | P0-T04 |
| P1-T13 | Section registry + `useEditorNav` | todo | P1-T04 |
| P1-T14 | `TabBar`: horizontal scroll + sliding `layoutId` indicator | todo | P0-T05 |
| P1-T15 | `EditorNav` (main + sub bars) + `EditorContent` transitions | todo | P1-T13, P1-T14 |
| P1-T16 | Section: Profile | todo | P1-T15, P1-T12 |
| P1-T17 | Section: Experience (per-company tabs + projects) | todo | P1-T15, P1-T12 |
| P1-T18 | Section: Education (per-institution tabs) | todo | P1-T15, P1-T12 |
| P1-T19 | Section: Skills & Languages | todo | P1-T15, P1-T12 |
| P1-T20 | Top bar: logo, colour toggle, avatar, hamburger menu | todo (contents deferred, D-21) | P1-T05 |
| P1-T21 | Menu: CV versions (create/duplicate/rename/delete/switch) | todo | P1-T20, P1-T04 |
| P1-T22 | Menu: Login placeholder, About; avatar → profile | deferred (D-21) | P1-T20 |
| P1-T23 | Guest mode notice (data lost on tab close) | todo | P1-T03 |
| P1-T24 | Phase 1 E2E suite + a11y + reduced-motion check | todo | all above |
| P1-T25 | Preview toolbar: colours, font, PDF language | todo | P1-T09, P1-T11, Q-12 |

---

### P1-T01: Zod schemas
**Ask first:** Q-3 (date format), Q-4 (fields, required/optional, max lengths). Show
the developer the proposed schema list before writing code.
**Do:** `app/schemas/{profile,experience,project,education,skill,language,link,theme,cv,version}.ts` plus
`index.ts`, following the section map in D-22. `version` includes `templateId`, `theme` and `pdfLocale` (D-23). Every list item has an `id`. Experience contains `projects[]`. Replace `app/types/index.ts`
with `z.infer` exports. The current draft mixes `Date` and `string` and uses `ExperienceBase` in place of
`ExperienceItem` in the store. Resolve both.
**Done when:** unit tests cover the valid and invalid boundaries of every schema, and typecheck passes.

### P1-T02: Fixtures
**Do:** move the inline samples from `tests/unit/schemas/*.test.ts` into factories in `tests/fixtures/cv.ts`: `makeCvData(overrides?)`, `makeVersion(overrides?)`, and `full`/`minimal`/
`long` presets. Fixtures must pass the schemas, and a test asserts this.

### P1-T03: Persistence
**Do:** `app/services/persistence/types.ts` (`StorageAdapter` with `listVersions`, `loadVersion`,
`saveVersion`, `removeVersion`, `getActiveId`, `setActiveId`). Add `sessionStorageAdapter.ts` with namespaced keys
and a `schemaVersion`. Data is validated with Zod on read, and invalid data is discarded with a warning (ask about migration policy).
**Done when:** unit tests cover round-trip, corrupt JSON, schema-invalid data and missing storage (SSR).

### P1-T04: Stores
**Do:** `cv` (active data plus section actions: add/update/remove/reorder per list, plus nested projects),
`versions` (list, active id, CRUD), and `ui` (preview width, collapsed, last expanded width, editor `mainId`/`subId`).
Saves through the adapter are debounced. Hydrate on the client only. Use `listVersions().skipped` to warn
the user about quarantined versions (D-39). Store actions only ever receive valid data (D-38). Handle
`PersistenceError` (`quota`/`unavailable`) with a toast instead of crashing.
**Done when:** every action has a unit test, and an integration test shows edits persisting across store re-creation.

### P1-T05: App shell
**Do:** the layout fills the viewport (`h-dvh`): top bar, then the split area filling the rest. The **page
never scrolls**. The editor content area scrolls on its own. The preview panel doesn't scroll (D-17).
Replace the current `AppTopbar.vue`/default layout (keep `AppLogo`). **Wire the stores:** call
`useVersionsStore().hydrate()` once on the client (plugin or `onMounted`), `flush()` on `pagehide`, and show
`skipped`/`saveError` as toasts (or leave a TODO for P1-T23). Avoid SSR hydration mismatches from `ui` state
(it's read from sessionStorage on the client): render size-dependent layout after mount.
**Done when:** an E2E test asserts `document.scrollingElement` doesn't scroll with long editor content.

### P1-T06: Split layout
**Do:** `SplitPane.vue` in `app/components/preview/`. Drag the divider to resize the right panel between
`min` and `max` (ask the values). The `ui` store holds `previewSize` as a **fraction (0–1)** of the split area,
with `setPreviewSize`/`collapsePreview`/`expandPreview(size?)`. Convert px to a fraction in the component. Pointer events with pointer capture, keyboard resize (arrow keys on a
focusable `role="separator"` with `aria-valuenow`). The width is stored in the `ui` store.
**Done when:** integration tests cover the width clamp and keyboard resize, and an E2E test drags the divider.

### P1-T07: Collapse
**Builds on:** `PreviewSplitPane` (`app/components/preview/SplitPane.vue`) and `app/utils/splitPane.ts`. The `ui` store
already has `collapsePreview()` and `expandPreview(size?)`, which restores `lastExpandedSize`.
**Do:** dragging below `min` (snap threshold, ask) or clicking collapse turns the panel into a thin vertical
bar with a pop-out handle. **Click** the handle to restore the last width. **Drag** the handle to expand to
the drag position. Use a motion-v spring transition (reduced-motion aware).
**Done when:** E2E tests cover collapse by drag, collapse by button, expand by click and expand by drag. State survives reload.

### P1-T08: Mobile layout
**Ask first:** Q-5. Scope to be written after the answer.

### P1-T09: Template system
**Resolved (D-45):** English only, no RTL; fonts Inter/Lora/Poppins; no PDF content tests.
**Do:** `app/pdf/registry.ts`, the template contract (`props: { data, theme, labels, locale }`),
`app/pdf/shared/fonts.ts` (fonts in `public/fonts/`), shared blocks, and `app/pdf/locales/` with a typed
`PdfLabels` shape plus one dictionary per language. Dates in the PDF are formatted with `Intl` using `locale`.
**Done when:** unit tests check that the registry resolves by id with a default fallback, that every PDF
locale implements every label key (a type check plus a runtime test), and that dates format per locale.

### P1-T10: Template #1
**Context:** P1-T09 ships a minimal placeholder, `basic` (`app/pdf/templates/basic/BasicTemplate.vue`), which is the default.
Ask whether template #1 replaces it or is added beside it (and becomes the default).
**Ask first:** Q-6 (design reference). Use the `add-pdf-template` skill.
**Done when:** the developer has checked it visually in `bun run dev` with the `full`, `minimal` and `long` presets
(headless browsers can't show PDFs, Q-14; no PDF content tests, D-45).

### P1-T11: Live preview + download
**Do:** `usePdfDocument(data, templateId, theme)` wraps vue-pdf's `usePdf` (which already revokes old URLs)
with a debounce, and exposes `url`, `isRendering` and `error`. Replace `PdfPreviewSmoke.client.vue` and
`app/pdf/HelloDocument.vue` (D-30). **Lazy-load** the PDF engine (~668 KB gzipped) so the editor is usable
before it arrives, and measure that with a Playwright check or a bundle report (ask which). `PdfViewer.vue` fills the panel, and only the
document scrolls through its pages. It shows a subtle loading indicator and an error state. A Download
button saves `<name>-<version>.pdf`. Keep the scroll position across re-renders if feasible (investigate and report).
**Done when:** unit or integration tests cover the debounce, URL revocation and error state. An E2E test edits a field,
sees a new blob URL, and downloads a `.pdf`.

### P1-T12: Debounced inputs (D-15)
**Do:** `useDebouncedModel(source, write, { delay: 300 })` keeps the local value instant and writes to the
store after the delay, **only when the field's value is valid** (D-38). Invalid input stays local with its error. It flushes on blur, on unmount and on section change. Add thin wrappers if they
help (e.g. `DebouncedInput`, `DebouncedTextarea` around `UInput`/`UTextarea`). Ask before adding them.
**Done when:** unit tests use fake timers to cover the debounce, the flush on blur and unmount, and that
external store changes sync back without loops.

### P1-T13: Section registry + navigation (D-14)
**Do:** `app/editor/sections.ts` defines the section map (D-22). Each entry has `id`,
`label`, `icon`, `subnav: { kind: 'none' } | { kind: 'entries', source, labelOf, addLabel } | { kind: 'fixed', items }`
and `component`. `useEditorNav` holds `mainId` and `subId`, resolves the sub-tabs, handles deleting the
active entry, and is stored in the `ui` store.
**Done when:** unit tests cover tab resolution for each kind, the deletion fallback and restoring an unknown id.

### P1-T14: TabBar (D-16)
**Do:** a generic `TabBar.vue` with `role="tablist"`, arrow-key navigation and horizontal overflow scroll
(scrollbar hidden, edge fade, scroll the active tab into view). The active background and underline are a
motion-v element with a `layoutId` that is unique per bar, so it **slides** between tabs.
**Done when:** a nuxt test covers keyboard navigation, the ARIA state and the emits. An E2E test covers
overflow scrolling and the active tab scrolled into view.

### P1-T15: EditorNav + EditorContent (D-16)
**Do:** `EditorNav` stacks the main bar and the sub bar. The sub bar animates in and out when a section has
`subnav.kind === 'none'`. `EditorContent` is keyed by `mainId:subId`. The old content does a quick fade-out
(~120 ms), then the new content runs a staggered fade-up (presets from `app/utils/motion.ts`). Fast tab
switching must not queue animations. Move focus to the content heading after a switch (a11y).
**Done when:** a nuxt test covers rendering the right component per selection. An E2E test switches sections
and sees the content change. The reduced-motion path is tested.

### P1-T16 … P1-T19: Sections
Each uses the `add-cv-section` skill: `UForm` with its Zod schema, debounced inputs and store actions
(`useCvStore()`: `updateProfile`, `add/update/remove/move{Link,Experience,Education,Skill,Language}`,
`add/update/remove/moveProject(experienceId, …)`; they return `false`/`null` when the result would be invalid).
**＋ Add** tabs keep the new entry in local form state until it's valid, then call `add…` (D-41).
Stagger-item wrappers go on the form groups. Each gets integration tests (validation, store updates) and
an E2E test (the edit shows in the preview).
- **T16 Profile:** no sub-bar. Personal info, summary, contact, address, links (list).
- **T17 Experience:** one sub-tab per company plus "＋ Add company". Content shows the company/role/period/
  location/work-model fields, then that company's **projects** as expandable cards (add/remove/reorder with
  animation). Deleting a company needs confirmation. Ask: is reordering companies needed in phase 1?
- **T18 Education:** one sub-tab per institution plus "＋ Add".
- **T19 Skills & Languages:** fixed sub-tabs, Skills · Languages. Lists with a level (ask the level UI:
  slider, stars or select).

### P1-T20: Top bar (D-13)
**Ask first:** the menu/avatar contents are deferred (D-21). Confirm them with the developer before you build this; D-13 is only a draft.
**Do:** `AppTopbar` with the logo on the left. On the right, always visible: `UColorModeButton`,
`AppMenu` (hamburger, `UDropdownMenu`) and `UserAvatar` (`UAvatar` with a placeholder for guests).
Remove the current GitHub/About nav from the bar (About moves into the menu).
**Done when:** a nuxt test covers the menu items for the guest state. An E2E test opens the menu and toggles colour mode.

### P1-T21: Versions in the menu
**Do:** a menu section listing versions (active marked) with switch, plus actions for create (blank or duplicate),
rename (modal) and delete (confirm). Switching versions runs the content transition, and the preview updates.
**Done when:** integration tests cover each action, and an E2E test creates and switches a version and sees the preview change.

### P1-T22: Login placeholder, About, avatar
**Ask first:** Q-10 (login placeholder, GitHub link) and Q-11 (what the avatar opens for guests).
Guests see **Login** in the menu; logged-in users (phase 3) see **Settings** (UI language later, D-19).

### P1-T23: Guest notice
**Do:** a persistent but dismissible notice that guest data is lost when the tab closes. The dismissal is
remembered for the session.

### P1-T24: Phase 1 E2E + a11y
**Do:** a full happy-path spec (fill every section → preview → create version → switch → download).
Add `@axe-core/playwright` checks on the main page (ask before adding). Run one spec with reduced motion off
to make sure the animations don't break the flows.

### P1-T25: Preview toolbar (D-24)
**Ask first:** Q-12 (position, colour controls, font list, and whether the template picker and Download live here too).
**Do:** `PreviewToolbar.vue` in the preview panel. It doesn't scroll and is hidden when the panel is collapsed.
Controls for theme colours (Nuxt UI `UColorPicker`/popover, verify the API), font (`USelect` from the
registered fonts) and PDF language (`USelect` from `app/pdf/locales`). Changes update the active version's
`theme`/`pdfLocale` in the store and re-render the preview (debounce colour dragging). The toolbar's own
UI text uses the app i18n. Language *names* show in their own language (e.g. "Deutsch").
**Done when:** nuxt tests show each control updates the store. An E2E test changes the language and the
preview's blob URL changes. A unit test checks the theme passes `themeSchema` after edits.
