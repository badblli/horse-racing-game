import { test, expect, type Locator, type Page } from '@playwright/test'

// A fixed seed gives the same horses and results every run; rate 60 plays a round in about two seconds.
const URL = '/?seed=1923&rate=60'
const ROUNDS = 6

const region = (page: Page, name: string) => page.getByRole('region', { name })
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const status = (page: Page) => page.getByTestId('race-status')
const translateOf = (mover: Locator) =>
  mover.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41)
/** Lets the page paint a number of animation frames, about half a second for 30. */
const waitFrames = (page: Page, count: number) =>
  page.evaluate(
    (remaining) =>
      new Promise<void>((resolve) => {
        const step = () => (--remaining > 0 ? requestAnimationFrame(step) : resolve())
        requestAnimationFrame(step)
      }),
    count,
  )

test.describe('race flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL)
  })

  test('loads twenty horses and no schedule', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Cumhuriyet Cup')
    await expect(region(page, 'Horses').locator('tbody tr')).toHaveCount(20)
    await expect(page.getByRole('heading', { name: 'No race scheduled' })).toBeVisible()
    await expect(button(page, 'Start race')).toBeDisabled()
  })

  test('runs all six rounds and shows each result in order', async ({ page }) => {
    test.setTimeout(60_000)
    const results = region(page, 'Results')

    await button(page, 'Generate schedule').click()
    await expect(region(page, 'Schedule').locator('ol > li')).toHaveCount(ROUNDS)
    await expect(status(page)).toHaveText('Ready. Ten horses are at the start.')

    await button(page, 'Start race').click()
    const mover = page.locator('[data-lane="1"] .mover')
    await expect.poll(() => translateOf(mover)).toBeGreaterThan(0)

    // Each result arrives after the one before it, never early.
    for (let round = 1; round <= ROUNDS; round++) {
      await expect(results.getByText(`${round} of ${ROUNDS}`)).toBeVisible({ timeout: 10_000 })
    }

    await expect(status(page)).toContainText('All six rounds are complete')
    await expect(button(page, 'Start race')).toBeDisabled()
    await expect(button(page, 'Generate schedule')).toHaveClass(/primary/)
    for (let round = 1; round <= ROUNDS; round++) {
      await results.getByRole('button', { name: `Round ${round}`, exact: true }).click()
      await expect(results.locator('.meta')).toContainText(`Round ${round} · `)
      await expect(results.locator('.places li')).toHaveCount(9)
    }
  })

  test('shows the live order during a round and the result only after it', async ({ page }) => {
    await page.goto('/?seed=1923&rate=30')
    const results = region(page, 'Results')

    await button(page, 'Generate schedule').click()
    await button(page, 'Start race').click()

    await expect(results.locator('.meta')).toContainText('Live')
    await expect(results.locator('.order li')).toHaveCount(10)
    await expect(results.locator('.time')).toHaveCount(0)
    await expect(results.getByTestId('winner')).toHaveCount(0)

    await expect(results.getByTestId('winner')).toBeVisible({ timeout: 10_000 })
    await expect(results.locator('.order')).toHaveCount(0)
    await expect(results.locator('.time')).toHaveCount(10)
  })

  test('pause freezes the horses and resume carries on', async ({ page }) => {
    await button(page, 'Generate schedule').click()
    await button(page, 'Start race').click()
    const mover = page.locator('[data-lane="1"] .mover')
    await expect.poll(() => translateOf(mover)).toBeGreaterThan(0)

    await button(page, 'Pause').click()
    await expect(status(page)).toContainText('Paused')
    const paused = await translateOf(mover)
    await waitFrames(page, 30)
    expect(await translateOf(mover)).toBe(paused)

    await button(page, 'Resume').click()
    await expect(status(page)).toContainText('Racing')
    await expect.poll(() => translateOf(mover)).toBeGreaterThan(paused)
  })
})
