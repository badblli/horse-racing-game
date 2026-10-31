import { randomInt, sampleWithoutReplacement, shuffle, type Rng } from '@/shared/lib/random'

import { MAX_CONDITION, MIN_CONDITION, ROSTER_SIZE, type Horse, type HorseColor } from './horse'
import { HORSE_COLORS } from './horse-colors'
import { NAME_POOL } from './name-pool'

/**
 * Builds the session's 20 horses: names sampled from the pool without replacement,
 * a shuffled palette so every color is used once, and a random condition each.
 */
export function createRoster(rng: Rng): readonly Horse[] {
  const names = sampleWithoutReplacement(NAME_POOL, ROSTER_SIZE, rng)
  const colors = shuffle(HORSE_COLORS, rng)

  return Object.freeze(
    names.map((name, index) =>
      Object.freeze({
        id: `horse-${String(index + 1).padStart(2, '0')}`,
        name,
        color: colors[index] as HorseColor,
        condition: randomInt(rng, MIN_CONDITION, MAX_CONDITION),
      }),
    ),
  )
}
