import { test, expect, type Page } from '@playwright/test'

// A fixed seed and rate 600 reach the finished programme, the tallest state, in a few seconds.
const URL = '/?seed=1923&rate=600'

const screens = [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const pageScrolls = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)

for (const viewport of screens) {
  test.describe(`one screen at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    test('shows everything without scrolling the page', async ({ page }) => {
      await page.goto(URL)
      expect(await pageScrolls(page)).toBe(false)

      await button(page, 'Generate schedule').click()
      await button(page, 'Start race').click()
      await expect(page.getByTestId('race-status')).toContainText('All six rounds are complete', {
        timeout: 20_000,
      })

      expect(await pageScrolls(page)).toBe(false)
      await expect(page.locator('.lanes li').last()).toBeInViewport({ ratio: 1 })
      await expect(page.locator('.horses tbody tr').last()).toBeInViewport({ ratio: 1 })
      await expect(page.locator('.results .places li').last()).toBeInViewport({ ratio: 1 })
    })
  })
}
