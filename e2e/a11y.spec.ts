import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page } from '@playwright/test'

// WCAG 2.1 A and AA in every state a visitor can reach. Chromium only (see playwright.config.ts):
// axe reads the page, and the markup and colors do not differ between browsers.
const URL = '/?seed=1923&rate=600'

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

async function violations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map((node) => node.target),
  }))
}

// A fade caught halfway would read as low contrast.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`at ${viewport.width}px`, () => {
    test.use({ viewport })

    test.beforeEach(async ({ page }) => {
      await page.goto(URL)
    })

    test('before a schedule', async ({ page }) => {
      expect(await violations(page)).toEqual([])
    })

    test('with a schedule', async ({ page }) => {
      await button(page, 'Generate schedule').click()
      expect(await violations(page)).toEqual([])
    })

    test('paused mid-race', async ({ page }) => {
      await page.goto('/?seed=1923&rate=30')
      await button(page, 'Generate schedule').click()
      await button(page, 'Start race').click()
      await button(page, 'Pause').click()
      await expect(page.getByTestId('race-status')).toContainText('Paused')
      expect(await violations(page)).toEqual([])
    })

    test('with all six rounds finished', async ({ page }) => {
      await button(page, 'Generate schedule').click()
      await button(page, 'Start race').click()
      await expect(page.getByTestId('race-status')).toContainText('All six rounds are complete', {
        timeout: 20_000,
      })
      expect(await violations(page)).toEqual([])
    })
  })
}

test.describe('phone tabs', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const tab of ['Schedule', 'Results', 'Horses']) {
    test(tab, async ({ page }) => {
      await page.goto(URL)
      await button(page, 'Generate schedule').click()
      await button(page, 'Start race').click()
      await expect(page.getByTestId('race-status')).toContainText('All six rounds are complete', {
        timeout: 20_000,
      })
      await page.getByRole('tab', { name: tab }).click()
      await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true')
      expect(await violations(page)).toEqual([])
    })
  }
})
