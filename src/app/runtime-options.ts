import { PLAYBACK_RATE } from '@/features/race/composables/useRaceClock'
import { randomSeed } from '@/shared/lib/random'

export interface RuntimeOptions {
  /** Seeds every random stream of the session. */
  readonly seed: number
  /** Race seconds per real second. */
  readonly rate: number
  /** Whether a race saved before a refresh may come back. A test's fixed seed always wins. */
  readonly restore: boolean
}

/**
 * A fresh seed and the normal playback rate. Only the e2e build (VITE_TEST_HOOKS) honours
 * ?seed= and ?rate=, so the published site has no hidden debug switches.
 */
export function readRuntimeOptions(
  search = window.location.search,
  testHooks = import.meta.env.VITE_TEST_HOOKS === 'true',
): RuntimeOptions {
  const defaults = { seed: randomSeed(), rate: PLAYBACK_RATE, restore: true }
  if (!testHooks) return defaults

  const params = new URLSearchParams(search)
  // A missing or empty parameter must not read as 0.
  const seed = Number(params.get('seed') || Number.NaN)
  const rate = Number(params.get('rate') || Number.NaN)

  return {
    seed: Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff ? seed : defaults.seed,
    rate: Number.isFinite(rate) && rate > 0 ? rate : defaults.rate,
    restore: !params.has('seed'),
  }
}
