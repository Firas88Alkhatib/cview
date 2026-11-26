import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const W = 1280
const BAR = 28
const preview = (page: Page) => page.getByRole('region', { name: 'PDF preview' })
const showButton = (page: Page) => page.getByRole('button', { name: 'Show preview' })
const widthOf = async (page: Page, name: string) =>
  (await page.getByRole('region', { name }).boundingBox())!.width

/** Presses on `from`'s centre, moves through `xs` (in order) and releases unless `hold`. */
async function drag(page: Page, from: { x: number; y: number }, xs: number[], hold = false) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (const x of xs) await page.mouse.move(x, from.y, { steps: 6 })
  if (!hold) await page.mouse.up()
}

async function dividerCentre(page: Page) {
  const box = (await page.getByRole('separator', { name: 'Resize preview' }).boundingBox())!
  return { x: box.x + box.width / 2, y: box.y + box.height / 3 } // above the chevron button
}

test.describe('collapsible preview (D-44)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: W, height: 720 })
    await page.goto('/')
    await expect(page.getByTitle('CV preview')).toBeVisible()
  })

  test('releasing between the minimum and the snap point keeps the preview at 360px', async ({
    page,
  }) => {
    await drag(page, await dividerCentre(page), [W - 200]) // preview would be 200px
    await expect(preview(page)).toBeVisible()
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(360, -1)
  })

  test('dragging past the snap point collapses the preview into the thin bar', async ({ page }) => {
    await drag(page, await dividerCentre(page), [W - 100])
    await expect(preview(page)).toBeHidden()
    await expect(showButton(page)).toBeVisible()
    expect(await widthOf(page, 'Editor')).toBeCloseTo(W - BAR, -1)
  })

  test('dragging back within the same gesture re-opens it', async ({ page }) => {
    await drag(page, await dividerCentre(page), [W - 100, W - 600], true)
    await expect(preview(page)).toBeVisible()
    await page.mouse.up()
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(600, -1)
  })

  test('clicking the handle restores the width from before the drag', async ({ page }) => {
    await drag(page, await dividerCentre(page), [W - 500]) // preview 500px
    await drag(page, await dividerCentre(page), [W - 50]) // collapse
    await showButton(page).click()
    await expect(preview(page)).toBeVisible()
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(500, -1)
  })

  test('dragging the handle pulls the preview out to the chosen width', async ({ page }) => {
    await drag(page, await dividerCentre(page), [W - 50])
    const box = (await showButton(page).boundingBox())!
    await drag(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, [W - 700])
    await expect(preview(page)).toBeVisible()
    expect(await widthOf(page, 'PDF preview')).toBeCloseTo(700, -1)
  })

  test('the chevron on the divider collapses it', async ({ page }) => {
    const centre = await dividerCentre(page)
    await page.mouse.move(centre.x, centre.y) // reveal the button on hover
    await page.getByRole('button', { name: 'Hide preview' }).click()
    await expect(preview(page)).toBeHidden()
  })

  test('keyboard: Enter collapses and focuses the handle, Enter on the handle restores', async ({
    page,
  }) => {
    await page.getByRole('separator', { name: 'Resize preview' }).focus()
    await page.keyboard.press('Enter')
    await expect(preview(page)).toBeHidden()
    await expect(showButton(page)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(preview(page)).toBeVisible()
    await expect(page.getByRole('separator', { name: 'Resize preview' })).toBeFocused()
  })

  test('the collapsed state survives a reload', async ({ page }) => {
    await drag(page, await dividerCentre(page), [W - 50])
    await page.reload()
    await expect(showButton(page)).toBeVisible()
    await expect(preview(page)).toBeHidden()
  })
})
