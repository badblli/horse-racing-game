import { test, expect, type Page } from '@playwright/test'

// One test per item of the assessment brief, in its order. A fixed seed gives the same day every
// run; rate 60 plays a round in about two seconds. "Use Vue" and "clean code" are about the source.
const URL = '/?seed=1923&rate=60'
const DISTANCES = ['1,200 m', '1,400 m', '1,600 m', '1,800 m', '2,000 m', '2,200 m']

const region = (page: Page, name: string) => page.getByRole('region', { name })
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const horseNames = (page: Page) => region(page, 'Horses').locator('.name').allTextContents()
const roundRows = (page: Page) => region(page, 'Schedule').locator('ol > li > button')
const status = (page: Page) => page.getByTestId('race-status')

test.describe('assessment brief', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL)
  })

  test('generates a random list of horses', async ({ page }) => {
    const names = await horseNames(page)
    expect(names).toHaveLength(20)

    await page.goto('/?seed=1924&rate=60')
    expect(await horseNames(page)).not.toEqual(names)
  })

  test('Generate creates a schedule of six rounds', async ({ page }) => {
    await expect(roundRows(page)).toHaveCount(0)

    await button(page, 'Generate schedule').click()
    await expect(roundRows(page)).toHaveCount(6)
  })

  test('Start runs the rounds one at a time', async ({ page }) => {
    const state = (round: number) => roundRows(page).nth(round).locator('.state')

    await button(page, 'Generate schedule').click()
    await button(page, 'Start race').click()
    await expect(state(0)).toHaveText('Racing')
    for (const later of [1, 2, 3, 4, 5]) await expect(state(later)).toHaveText('Upcoming')

    await expect(state(0)).toContainText('won', { timeout: 10_000 })
    await expect(state(1)).toHaveText(/Next|Racing/)
    await expect(state(2)).toHaveText('Upcoming')
  })

  test('posts each result to Results as its round ends, in order', async ({ page }) => {
    test.setTimeout(60_000)
    const results = region(page, 'Results')

    await button(page, 'Generate schedule').click()
    await button(page, 'Start race').click()
    for (let round = 1; round <= 6; round++) {
      await expect(results.getByText(`${round} of 6`)).toBeVisible({ timeout: 10_000 })
    }

    await expect(status(page)).toContainText('All six rounds are complete')
    for (let round = 1; round <= 6; round++) {
      await results.getByRole('button', { name: `Round ${round}`, exact: true }).click()
      await expect(results.locator('.meta')).toHaveText(`Round ${round} · ${DISTANCES[round - 1]}`)
      await expect(results.getByTestId('winner')).toBeVisible()
      await expect(results.locator('.places li')).toHaveCount(9)
    }
  })

  test('moves the horses across the track', async ({ page }) => {
    const leftOf = (lane: number) =>
      page
        .locator(`[data-lane="${lane}"] .mover`)
        .evaluate((mover) => new DOMMatrix(getComputedStyle(mover).transform).m41)

    await button(page, 'Generate schedule').click()
    expect(await leftOf(1)).toBe(0)

    await button(page, 'Start race').click()
    for (const lane of [1, 5, 10]) await expect.poll(() => leftOf(lane)).toBeGreaterThan(0)
    await expect(page.locator('svg.galloping').first()).toBeVisible()
  })

  test('rule: 20 horses with unique colors and a condition from 1 to 100', async ({ page }) => {
    const rows = region(page, 'Horses').locator('tbody tr')
    await expect(rows).toHaveCount(20)

    const colors = await rows
      .locator('.chip')
      .evaluateAll((chips) => chips.map((chip) => getComputedStyle(chip).backgroundColor))
    expect(new Set(colors).size).toBe(20)

    const conditions = (await rows.locator('.condition').allTextContents()).map(Number)
    expect(conditions).toHaveLength(20)
    for (const condition of conditions) {
      expect(Number.isInteger(condition)).toBe(true)
      expect(condition).toBeGreaterThanOrEqual(1)
      expect(condition).toBeLessThanOrEqual(100)
    }
  })

  test('rule: six rounds at the set distances, each with ten different horses', async ({
    page,
  }) => {
    const roster = await horseNames(page)
    await button(page, 'Generate schedule').click()

    for (const [index, distance] of DISTANCES.entries()) {
      const row = roundRows(page).nth(index)
      await expect(row).toContainText(`Round ${index + 1}`)
      await expect(row).toContainText(distance)

      await row.click()
      const lineup = page.getByRole('list', { name: `Round ${index + 1} lineup` })
      await expect(lineup.locator('li')).toHaveCount(10)
      const names = await lineup.locator('.horse').allTextContents()
      expect(new Set(names).size).toBe(10)
      expect(names.every((name) => roster.includes(name))).toBe(true)
    }
  })
})
