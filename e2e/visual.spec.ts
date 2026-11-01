import { test, expect, type Page } from '@playwright/test'

// A fixed seed gives the same horses every run; rate 600 plays the whole programme in a few seconds.
const URL = '/?seed=1923&rate=600'

// The layout depends on width only. The mobile viewport is tall enough for the whole page, because
// a full-page capture would otherwise draw the fixed action bar halfway down.
const sizes = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 1600 } },
] as const

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

/** Moves the pointer off the controls so no hover style ends up in the screenshot. */
const settle = (page: Page) => page.mouse.move(0, 0)

for (const { name, viewport } of sizes) {
  test.describe(`${name} at ${viewport.width}px`, () => {
    test.use({ viewport })

    test.beforeEach(async ({ page }) => {
      await page.goto(URL)
      await page.evaluate(() => document.fonts.ready)
    })

    test('initial', async ({ page }) => {
      await expect(page).toHaveScreenshot(`initial-${name}.png`, { fullPage: true })
    })

    test('scheduled', async ({ page }) => {
      await button(page, 'Generate schedule').click()
      await expect(page.getByTestId('race-status')).toHaveText(
        'Ready. Ten horses are at the start.',
      )
      await settle(page)

      await expect(page).toHaveScreenshot(`scheduled-${name}.png`, { fullPage: true })
    })

    test('finished', async ({ page }) => {
      await button(page, 'Generate schedule').click()
      await button(page, 'Start race').click()
      await expect(page.getByTestId('race-status')).toContainText('All six rounds are complete', {
        timeout: 20_000,
      })
      await settle(page)

      await expect(page).toHaveScreenshot(`finished-${name}.png`, { fullPage: true })
    })
  })
}
