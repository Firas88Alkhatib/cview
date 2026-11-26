# Decisions

Settled decisions are binding. Changing one requires asking the developer.
Format: `D-<n> | date | decision | why`. Append new entries; don't rewrite history (mark superseded ones).

## Settled
- **D-1 | 2026-11-26 | Single Nuxt 4 app on Bun hosting UI and API (Elysia via nuxt-elysia at `/api`).** One deployable unit.
- **D-2 | 2026-11-26 | Nuxt UI v4 for all UI.** Consistent design system, built on Tailwind v4.
- **D-3 | 2026-11-26 | Zod v4 validates all inputs; schemas are the source of truth for types.** One definition for forms, storage, API and DB.
- **D-4 | 2026-11-26 | PDF generated in the browser with `@ceereals/vue-pdf` (component-based, react-pdf engine).** Live preview with no server.
- **D-5 | 2026-11-26 | Layout: forms left, PDF preview right; preview is resizable and collapses to a thin bar with a click-or-drag handle.** Developer requirement.
- **D-6 | 2026-11-26 | Guest data lives in `sessionStorage` (lost on tab close, user is warned).** Developer requirement.
- **D-7 | 2026-11-26 | Phase 1 is frontend only: no DB, auth or API work.** Developer requirement.
- **D-8 | 2026-11-26 | Future: PostgreSQL + Drizzle ORM.** Developer requirement.
- **D-9 | 2026-11-26 | Tests: Vitest + @nuxt/test-utils (projects `unit` and `nuxt`), Playwright for E2E.** Official Nuxt tooling.
- **D-10 | 2026-11-26 | Multiple templates supported by design; phase 1 ships one.** Developer requirement.
- **D-11 | 2026-11-26 | Extensive, purposeful animation; must respect `prefers-reduced-motion`.** Developer requirement.
- **D-12 | 2026-11-26 | Animation: `motion-v` (Motion for Vue, Nuxt module `motion-v/nuxt`) plus Vue `<Transition>`/`<TransitionGroup>` for trivial cases. No other animation library.** Shared-layout (`layoutId`) and stagger support; already installed.
- **D-13 | 2026-11-26 | Top bar spans both panels: logo left; colour-mode toggle + avatar always visible on the right; hamburger menu holds Login (guest) or Settings (logged in), CV versions, About.** Developer requirement.
- **D-14 | 2026-11-26 | Editor has two horizontally scrollable bars (main sections, sub-sections) above a content area; sections come from a registry with sub-bar kinds `none`, `entries`, `fixed`.** Developer requirement; flexible structure, ready for custom sections.
- **D-15 | 2026-11-26 | All text inputs are debounced before writing to the store (default 300 ms).** Developer requirement.
- **D-16 | 2026-11-26 | Tab change: sliding active background and underline (`layoutId`). Section change: quick fade-out (~120 ms), then staggered fade-up entrance.** Developer requirement.
- **D-17 | 2026-11-26 | Preview panel does not scroll; only the PDF document scrolls.** Developer requirement.
- **D-18 | 2026-11-26 | Custom sections and sub-sections are deferred to a later phase.** Developer requirement.
- **D-19 | 2026-11-26 | UI will be multilingual later (language choice in Settings).** Developer requirement.
- **D-20 | 2026-11-26 | `@nuxtjs/i18n` set up from the start (English only); every UI string goes through translation keys.** Adding languages later means adding locale files, with no retrofitting.
- **D-21 | 2026-11-26 | Top bar *contents* (menu items, avatar behaviour, login placeholder) are deferred; D-13 is the working draft.** Developer: "worry later".
- **D-22 | 2026-11-26 | Section map confirmed: Profile (no sub-bar) · Experience (sub-tab per company, projects inside) · Education (sub-tab per institution) · Skills & Languages (fixed sub-tabs).** Resolves Q-1.
- **D-23 | 2026-11-26 | The PDF content language is independent of the UI language, and is stored per CV version.** A CV can be in German while the app is in English.
- **D-24 | 2026-11-26 | The preview panel has a toolbar where the user picks the PDF template colours, font and language.** Developer requirement. Values are saved on the CV version.
- **D-25 | 2026-11-26 | TypeScript pinned to `^6.0.3` (matches Nuxt 4's bundled version).** TS 7 (native Go port) lacks the JS API that vue-tsc needs. Revisit when vue-tsc supports TS 7.
- **D-26 | 2026-11-26 | Linting: `@nuxt/eslint` (flat config) + Prettier, with `eslint-config-prettier` last. Prettier ignores `*.md`.** Resolves Q-7. ESLint catches code problems and Prettier formats. Markdown is agent-facing, and padded tables waste tokens.
- **D-27 | 2026-11-26 | Component names are multi-word (Vue style guide); app-wide components use the `App` prefix (`AppLogo`, `AppTopbar`).** Required by the `vue/multi-word-component-names` lint rule.
- **D-28 | 2026-11-26 | motion-v usage: components (`Motion`, `AnimatePresence`, `layoutId`) plus named preset directives (`v-fade-up`, `v-fade-in`) from `app/utils/motion.ts`; raw `v-motion` is disabled.** Developer choice. Components handle layout, exit and stagger, presets give one-line entrances, and all values stay in one place.

## Open questions (ask the developer before the related task)
- **Q-3 (P1-T01): date format.** Confirm ISO strings (`YYYY-MM`) for periods, and "present" = `end` omitted.
- **Q-4 (P1-T01): data model review.** Confirm the fields per section, required vs optional, and limits.
- **Q-5 (P1-T07): small screens.** How should the split layout behave on mobile (tabs, drawer, stacked)?
- **Q-6 (P1-T09): first template design.** Get a reference or description of template #1 (layout, fonts, colours).
- **Q-8 (phase 3): auth.** Provider and strategy (email/password, OAuth, magic link; library choice).
- **Q-10 (deferred, D-21): Login placeholder in phase 1.** Disabled "coming soon", or a stub page? Keep the GitHub link in the menu?
- **Q-11 (deferred, D-21): avatar for guests.** What does clicking it open in phase 1 (local name and photo stored with the CV, or a placeholder)?
- **Q-12 (P1-T25): preview toolbar details.** Where it sits (top or bottom of the preview), the colour
  controls (preset palettes, free picker or both; which colours: primary/secondary/background/text), the font
  list, and whether the template picker and the Download button also go in this toolbar.
- **Q-13 (P1-T09): PDF languages.** Which CV languages ship first (e.g. en, de, ar)? If Arabic or another RTL
  language is included, the template must support RTL and the fonts must cover the script.
