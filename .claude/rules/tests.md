---
paths:
  - "tests/**"
  - "vitest.config.ts"
  - "playwright.config.ts"
---
# Test rules (full strategy: docs/TESTING.md)

- `tests/unit/`: node env, no Nuxt runtime. Import from source with explicit imports (no auto-imports here).
- `tests/nuxt/`: Nuxt env. Use `mountSuspended` and `mockNuxtImport` from `@nuxt/test-utils/runtime`.
- `tests/e2e/`: Playwright. Use role/label locators and web-first assertions (`await expect(locator)...`).
  Never use `waitForTimeout`. Clear storage per test.
- Build data with factories from `tests/fixtures/`, not inline object literals.
- Name tests `describe('<unit>')` + `it('<does what> when <condition>')`.
- Run the single file you changed first, then the project suite.
