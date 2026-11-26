import { expect, test } from '@playwright/test'

test.describe('PDF preview', () => {
  test('renders a PDF in the browser and shows it via a blob URL', async ({ page }) => {
    await page.goto('/')

    const preview = page.getByTitle('CV preview')
    await expect(preview).toHaveAttribute('src', /^blob:/)

    const src = await preview.getAttribute('src')
    const pdf = await page.evaluate(async (url) => {
      const blob = await (await fetch(url)).blob()
      const head = new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer())
      return { type: blob.type, head, size: blob.size }
    }, src!)

    expect(pdf.type).toBe('application/pdf')
    expect(pdf.head).toBe('%PDF-')
    expect(pdf.size).toBeGreaterThan(500)
  })
})
