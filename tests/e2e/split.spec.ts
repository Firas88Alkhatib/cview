import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const widthOf = async (page: Page, name: string) =>
  (await page.getByRole('region', { name }).boundingBox())!.width

/** Drags the divider so its centre ends up at `x`. */
async function dragDividerTo(page: Page, x: number) {
  const box = (await page.getByRole('separator', { name: 'Resize preview' }).boundingBox())!
  const y = box.y + box.height / 3 // above the collapse chevron, which sits at the centre
  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(x, y, { steps: 8 })
  await page.mouse.up()
}

test.describe('resizable split (D-43)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.getByTitle('CV preview')).toBeVisible()
  })

  test('dragging the divider resizes the preview, including across the preview iframe', async ({
    page,
  }) => {
    await dragDividerTo(page, 400)
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(880, -1)
    await dragDividerTo(page, 900) // moves right across the PDF iframe
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(380, -1)
  })

  test('the preview never gets narrower than 360px', async ({ page }) => {
    await dragDividerTo(page, 1280 - 200) // past the minimum but before the snap point (D-44)
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(360, -1)
  })

  test('the editor never gets narrower than 400px', async ({ page }) => {
    await dragDividerTo(page, 10)
    expect(await widthOf(page, 'Editor')).toBeCloseTo(400, -1)
  })

  test('the divider is keyboard operable', async ({ page }) => {
    const separator = page.getByRole('separator', { name: 'Resize preview' })
    await separator.focus()
    const before = await widthOf(page, 'PDF preview')
    await page.keyboard.press('ArrowLeft')
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(before + 24, 0)
    await page.keyboard.press('End')
    await expect(separator).toHaveAttribute('aria-valuenow', String(Math.round((360 / 1280) * 100)))
  })

  test('the size survives a reload', async ({ page }) => {
    await dragDividerTo(page, 500)
    const width = await widthOf(page, 'PDF preview')
    await page.reload()
    await expect(page.getByTitle('CV preview')).toBeVisible()
    await expect.poll(() => widthOf(page, 'PDF preview')).toBeCloseTo(width, 0)
  })

  test('shrinking the window keeps the editor usable', async ({ page }) => {
    await dragDividerTo(page, 420) // big preview, editor near its minimum
    await page.setViewportSize({ width: 900, height: 720 })
    await expect.poll(() => widthOf(page, 'Editor')).toBeGreaterThanOrEqual(399)
  })
})
