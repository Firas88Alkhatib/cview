# Phase 0: Tooling & Foundations

Task format: **Goal** · **Do** · **Done when** · **Ask first** (questions to resolve before coding).
Update `Status` in the table when you start or finish a task.

| ID | Task | Status | Depends |
|---|---|---|---|
| P0-T01 | Git init + README | done | none |
| P0-T02 | Add Zod, TS strict check, `typecheck` script | done | none |
| P0-T03 | Linting (ESLint + Prettier scripts) | done | none |
| P0-T04 | Vitest + @nuxt/test-utils (unit & nuxt projects) | done | P0-T02 |
| P0-T05 | motion-v setup + reduced motion + animation presets | done | P0-T04 |
| P0-T06 | Playwright E2E setup | done | P0-T04 |
| P0-T07 | Install `@ceereals/vue-pdf` + client-only smoke render | done | P0-T04 |
| P0-T08 | i18n setup (`@nuxtjs/i18n`, English only) | done | P0-T04 |

---

### P0-T01: Git init + README
**Goal:** version control and an accurate README.
**Do:** Replace the starter README with a project summary,
setup and commands (point to `AGENTS.md`/`docs/`). Check that `.gitignore` covers `test-results/` and `playwright-report/`.
**Done when:** the README is accurate (git is already initialised). The developer commits; never commit or push (AGENTS.md rule 7).

### P0-T02: Zod + typecheck
**Goal:** validation library available, type errors caught by a script.
**Do:** `bun add zod`. Add `"typecheck": "nuxi typecheck"` (needs `vue-tsc` as a dev dependency). Ensure
`typescript.strict` is on (Nuxt default; verify).
**Done when:** `bun run typecheck` passes on the current code (fix the existing type issues or report them).

### P0-T03: Linting
**Ask first:** Q-7 (`@nuxt/eslint` + Prettier, or Prettier only).
**Do:** install, configure flat config, add `lint` and `lint:fix` (and `format`) scripts.
**Done when:** `bun run lint` passes.

### P0-T04: Vitest + @nuxt/test-utils
**Goal:** both test projects runnable.
**Do:** `bun add -d vitest @nuxt/test-utils @vue/test-utils happy-dom`. Add `vitest.config.ts` with two
projects (`unit`: node env, `tests/unit/**`; `nuxt`: via `defineVitestProject` from
`@nuxt/test-utils/config`, `tests/nuxt/**`). **Verify** that the installed versions are compatible (check
the @nuxt/test-utils docs for supported Vitest majors before installing the latest). Add the `test`, `test:unit` and `test:nuxt` scripts.
Add one sample test per project (e.g. a trivial util, and `Logo.vue` mounting).
**Done when:** `bun run test` is green with both projects executing.

### P0-T05: motion-v setup (D-12)
**Do:** motion-v is installed and `motion-v/nuxt` is enabled. Verify the auto-imported component names
against the installed version. Create `app/utils/motion.ts` with shared presets: `fadeUpStagger` (container
plus item variants, ~40–60 ms stagger), `quickFadeOut` (~120 ms) and spring/tween defaults. Respect
reduced motion globally (MotionConfig `reducedMotion="user"` or equivalent; verify the API). Update
`.claude/rules/animations.md` if the real API differs from it.
**Done when:** a demo of the presets works, reduced motion disables movement, and a nuxt test covers the presets and reduced-motion config.

### P0-T06: Playwright
**Do:** `bun add -d @playwright/test`, `bunx playwright install chromium` (ask before adding
more browsers). `playwright.config.ts`: `testDir: tests/e2e`, `webServer` running `bun run build && bun run preview`
(or dev, so ask), `use.reducedMotion: 'reduce'`, `baseURL`. Add a `test:e2e` script and a smoke spec (home page loads).
**Done when:** `bun run test:e2e` passes locally.

### P0-T07: vue-pdf smoke test
**Goal:** prove client-side generation works in this stack before building on it.
**Do:** `bun add @ceereals/vue-pdf`. Read its types and docs (vue-pdf.org) to find the API for rendering
a document to a Blob/URL. Render a hello-world document inside `<ClientOnly>` on a temporary page or
component and show it in an iframe. Note any SSR or Bun or Vite config needed (e.g. `build.transpile`,
`optimizeDeps`) in `.claude/rules/pdf.md`.
**Done when:** the PDF shows in the browser and an E2E smoke spec asserts the iframe has a `blob:` src. Remove the temporary page or
fold it into P1 work (ask which).

### P0-T08: i18n setup
**Do (D-20):** `bun add @nuxtjs/i18n`, add it to `modules`. Config: `defaultLocale: 'en'`, locale file
`i18n/locales/en.json` (lazy), and strategy `no_prefix` unless the developer prefers URL prefixes (ask).
Verify the config keys against the installed version's docs. Move the existing UI strings (Topbar, pages)
to keys. Set up type-safe keys if the module supports it. Note: this is the **UI** language only.
The CV/PDF content language (e.g. section headings in the PDF) is a separate question, so ask when
building template #1.
**Done when:** existing UI strings are translated through keys, and a test asserts that a key renders.
