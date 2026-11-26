---
paths:
  - "tests/**"
  - "vitest.config.ts"
  - "playwright.config.ts"
---
# Test rules (full strategy: docs/TESTING.md)

- `tests/unit/`: node env, no Nuxt runtime and no auto-imports. Import explicitly with the `~/` or `~~/` aliases
  (set in `vitest.config.ts` and `nodeTsConfig.compilerOptions.paths`; keep them in sync). Never `../`.
  Type-checked through `typescript.nodeTsConfig` in `nuxt.config.ts`.
- Shared test helpers are imported by alias too, e.g. `~~/tests/nuxt/helpers/mountInApp`.
- `tests/nuxt/`: Nuxt env. Use `mountSuspended` and `mockNuxtImport` from `@nuxt/test-utils/runtime`.
  Components that render Nuxt UI overlays (UTooltip, UModal, UDropdownMenu, toasts) need
  `mountInApp()` from `tests/nuxt/helpers/mountInApp.ts`, which wraps them in `<UApp>`.
- `tests/e2e/`: Playwright. Use role/label locators and web-first assertions (`await expect(locator)...`).
  Never use `waitForTimeout`. Clear storage per test. A running `bun run dev` on :3000 is reused, so
  stop it if you need to verify production-build behaviour. Chromium only (D-29).
- Build data with factories from `~~/tests/fixtures/cv`, not inline object literals:
  `make{Profile,Link,Experience,Project,Education,Skill,Language,Theme,CvData,Version}(overrides)` and the presets
  `minimalCvData()`, `fullCvData()` (every optional field) and `longCvData()` (overflows one A4 page).
  Ids are deterministic UUIDs (`fixtureId()`). For invalid data, spread and override: `{ ...makeSkill(), level: 9 }`.
- **Example persona** (fixtures, example CV, specs, screenshots): Firas Alkhatib, Software Developer at Reaktor,
  Lahti, Finland, GitHub `https://github.com/Firas88Alkhatib`, University of Helsinki. Keep email and phone
  **fake** (`@example.com`, `+358 40 000 0000`), because the repo is public. Don't invent other real people.
- When a schema changes, update the factories. `tests/unit/fixtures/cv.test.ts` fails if they stop being valid.
- Name tests `describe('<unit>')` + `it('<does what> when <condition>')`.
- Run the single file you changed first, then the project suite.
