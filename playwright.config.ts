import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const port = 4174

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${port}`,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      testIgnore: /(visual|a11y)\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      testIgnore: /(visual|a11y)\.spec\.ts/,
    },
    /* A real phone profile for the phone layout: touch, Safari's engine and its viewport units. */
    {
      name: 'iphone',
      use: {
        ...devices['iPhone 15'],
      },
      testMatch: /layout\.spec\.ts/,
      grep: /phone/,
    },
    /* Screenshots differ between operating systems, so the baselines are made and checked in the
       Playwright Linux image only: `npm run test:visual` locally, and the visual job in CI. */
    {
      name: 'visual',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /visual\.spec\.ts/,
    },
  ],

  /* Tests run against the e2e build, the only build that honours the ?seed and ?rate hooks. */
  webServer: {
    command: 'npm run build:e2e && npm run preview:e2e',
    port,
    reuseExistingServer: false,
  },
})
