import { expect, test } from '@playwright/test'

// Plain-http access by IP (LAN, WSL, phones) is not a secure context, so browsers don't provide
// crypto.randomUUID, and vue-pdf calls it unguarded. Simulate that by removing it before the app loads.
test('the preview still renders where crypto.randomUUID is unavailable (D-46)', async ({
  page,
}) => {
  await page.addInitScript(() => {
    // @ts-expect-error: simulating an insecure context
    delete Crypto.prototype.randomUUID
  })
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')

  await expect(page.getByTitle('CV preview')).toHaveAttribute('src', /^blob:/)
  expect(errors).toEqual([])
})
