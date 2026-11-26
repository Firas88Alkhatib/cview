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
- Build data with factories from `tests/fixtures/`, not inline object literals.
- Name tests `describe('<unit>')` + `it('<does what> when <condition>')`.
- Run the single file you changed first, then the project suite.
