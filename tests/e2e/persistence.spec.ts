import { expect, test } from '@playwright/test'

/** Ids of the saved versions (the store writes them after its save delay). */
const savedIds = (page: import('@playwright/test').Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem('cview:index') ?? '[]') as string[])

test.describe('guest persistence', () => {
  test('saves the example CV for a first-time guest and keeps it across a reload', async ({
    page,
  }) => {
    await page.goto('/')
    await expect.poll(() => savedIds(page)).toHaveLength(1)
    const [id] = await savedIds(page)

    await page.reload()
    await expect.poll(() => savedIds(page)).toEqual([id])
    expect(await page.evaluate(() => sessionStorage.getItem('cview:active'))).toBe(id)
  })

  test('warns when a saved version is damaged, and still loads', async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      sessionStorage.setItem('cview:index', JSON.stringify(['broken']))
      sessionStorage.setItem('cview:version:broken', '{not json')
    })
    await page.goto('/')

    // Toasts live in the "Notifications" region. A duplicate copy for screen-reader announcement
    // exists in the DOM but not in the accessibility tree, so scope to the region.
    const notifications = page.getByRole('region', { name: /notifications/i })
    await expect(notifications).toContainText("Some CV versions couldn't be loaded")
    await expect(notifications).toContainText('1 saved version was damaged')
    // The damaged entry is quarantined and a fresh example CV is created instead.
    await expect.poll(() => savedIds(page)).toHaveLength(1)
    expect(await page.evaluate(() => sessionStorage.getItem('cview:quarantine:broken'))).toBe(
      '{not json',
    )
  })
})
