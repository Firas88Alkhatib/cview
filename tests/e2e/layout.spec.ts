import { expect, test } from '@playwright/test'

test.describe('workspace layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('the page never scrolls, even with very long editor content', async ({ page }) => {
    const editor = page.getByRole('region', { name: 'Editor' })
    await editor.locator('[data-scroll-container]').evaluate((el) => {
      for (let i = 0; i < 200; i++)
        el.append(Object.assign(document.createElement('p'), { textContent: `Line ${i}` }))
    })

    await editor.hover()
    await page.mouse.wheel(0, 4000)

    const page_ = await page.evaluate(() => ({
      scrollY: window.scrollY,
      overflows: document.scrollingElement!.scrollHeight > document.scrollingElement!.clientHeight,
    }))
    expect(page_).toEqual({ scrollY: 0, overflows: false })
  })

  test('the editor content scrolls inside its own panel', async ({ page }) => {
    const content = page.getByRole('region', { name: 'Editor' }).locator('[data-scroll-container]')
    await content.evaluate((el) => {
      for (let i = 0; i < 200; i++)
        el.append(Object.assign(document.createElement('p'), { textContent: `Line ${i}` }))
    })
    await content.hover()
    await page.mouse.wheel(0, 2000)
    await expect.poll(() => content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })

  test('the preview panel itself does not scroll', async ({ page }) => {
    const preview = page.getByRole('region', { name: 'PDF preview' })
    await expect(preview).toHaveCSS('overflow-y', 'hidden')
    await expect(preview.getByTitle('CV preview')).toBeVisible()
  })

  test('the top bar and both panels fill the viewport exactly', async ({ page }) => {
    const viewport = page.viewportSize()!
    const banner = (await page.getByRole('banner').boundingBox())!
    const editor = (await page.getByRole('region', { name: 'Editor' }).boundingBox())!
    const preview = (await page.getByRole('region', { name: 'PDF preview' }).boundingBox())!

    expect(Math.round(banner.height + editor.height)).toBe(viewport.height)
    expect(Math.round(editor.width + preview.width)).toBe(viewport.width)
  })
})
