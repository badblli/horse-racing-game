// Runs the visual tests in the Playwright Linux image, the same one CI uses, so screenshots match
// the committed baselines on any machine. Extra arguments go to Playwright:
//   npm run test:visual -- --update-snapshots
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const { version } = JSON.parse(readFileSync('node_modules/@playwright/test/package.json', 'utf8'))
const image = `mcr.microsoft.com/playwright:v${version}-noble`
const playwrightArgs = process.argv.slice(2).join(' ')

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    '--volume',
    `${process.cwd()}:/work`,
    // The container installs its own Linux dependencies instead of using the host's.
    '--volume',
    '/work/node_modules',
    '--workdir',
    '/work',
    image,
    'sh',
    '-c',
    `npm ci --no-audit --no-fund && npx playwright test --project=visual ${playwrightArgs}`,
  ],
  { stdio: 'inherit' },
)

process.exit(result.status ?? 1)
