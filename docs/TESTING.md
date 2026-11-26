# Testing Strategy

## Layers
| Layer | Tool | Location | What belongs here |
|---|---|---|---|
| Unit | Vitest (`unit` project, node env) | `tests/unit/**/*.test.ts` | Zod schemas, utils, stores (with `createPinia()`), storage adapters, PDF data mappers |
| Integration | Vitest (`nuxt` project, `@nuxt/test-utils`) | `tests/nuxt/**/*.test.ts` | Components with Nuxt runtime (`mountSuspended`), form + store + adapter together, composables using Nuxt APIs |
| E2E | Playwright | `tests/e2e/**/*.spec.ts` | Real user flows in a browser: fill form → preview updates, collapse/expand panel, versions, persistence across reload |

Pick the **lowest layer that can prove the behaviour**. E2E is only for flows that need a real browser.

## Rules
- Test behaviour, not implementation. Query by role, label or text (`getByRole`, `getByLabel`). Use
  `data-testid` only when no accessible handle exists.
- Every Zod schema gets valid and invalid cases (the boundaries of each rule).
- Every store action gets a unit test. Persistence covers hydrate, save, and corrupt-data handling.
- Every user-facing feature gets at least one E2E happy path, plus key edge cases.
- PDF: unit-test the mappers that shape template data. In E2E, assert the preview iframe gets a new blob
  URL after an edit and that Download produces a `.pdf`. Don't snapshot binary PDFs.
- Animations: E2E runs with `reducedMotion: 'reduce'` to keep tests deterministic.
- Clear `sessionStorage` between tests. Use fixtures/factories in `tests/fixtures/` (e.g. `makeCvData()`).
- No flaky waits (`waitForTimeout`). Wait on conditions or locators.

## Commands
```bash
bunx vitest run tests/unit/schemas/personal.test.ts   # one file (fastest feedback)
bun run test:unit
bun run test:nuxt
bun run test:e2e                                       # builds/serves the app via playwright webServer
bunx playwright test tests/e2e/preview.spec.ts --headed
```

## Definition of done (testing)
New or changed behaviour is covered at the right layer. `typecheck`, `lint`, `test` and the affected `test:e2e`
specs all pass.
