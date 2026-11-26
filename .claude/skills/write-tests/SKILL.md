---
name: write-tests
description: Decide the right test layer (unit / nuxt integration / Playwright E2E) for a CView change and write tests in project style. Use when adding tests, fixing a bug (regression test first), or when a task requires test coverage.
---

# Write tests

## 1. Choose the layer (lowest that proves the behaviour)
| Testing… | Layer | Location |
|---|---|---|
| Zod schema, pure util, mapper, store action, storage adapter | unit | `tests/unit/<area>/<name>.test.ts` |
| Component rendering/validation, component + store, Nuxt composable | nuxt | `tests/nuxt/<area>/<name>.test.ts` |
| User flow, drag and resize, real PDF preview/download, reload persistence | e2e | `tests/e2e/<feature>.spec.ts` |

For a bug, write the failing test first, then fix.

## 2. Patterns
```ts
// unit: schema
import { describe, it, expect } from 'vitest'
import { linkSchema } from '~/schemas/link'
describe('linkSchema', () => {
  it('rejects an invalid url', () => {
    expect(linkSchema.safeParse({ name: 'GH', url: 'nope' }).success).toBe(false)
  })
})
```
```ts
// nuxt: component
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EditorLinks from '~/components/editor/EditorLinks.vue'
it('shows an error when url is invalid', async () => {
  const wrapper = await mountSuspended(EditorLinks)
  // interact via labels/roles, assert visible messages + store state
})
```
```ts
// e2e
import { test, expect } from '@playwright/test'
test('editing name updates the preview', async ({ page }) => {
  await page.goto('/')
  const frame = page.getByTitle('CV preview')
  const before = await frame.getAttribute('src')
  await page.getByLabel('First name').fill('Ada')
  await expect(frame).not.toHaveAttribute('src', before!)
})
```
These are illustrative. Check the real component names, labels and APIs before you copy them.

## 3. Rules
Follow `.claude/rules/tests.md`. Use fixtures from `tests/fixtures/`. Don't use timeouts or
snapshot binary PDFs. Run the single file first, then the suite.
