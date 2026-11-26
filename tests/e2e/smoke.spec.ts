import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('home page renders the app shell without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')

    await expect(page.getByRole('banner')).toContainText('CView')
    await expect(page.getByTitle('CV preview')).toBeVisible()
    expect(errors).toEqual([])
  })
})
