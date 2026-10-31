import type { Horse } from '@/features/horses/model/horse'
import { sampleWithoutReplacement, type Rng } from '@/shared/lib/random'

import { ROUND_DISTANCES, RUNNERS_PER_ROUND, type Round } from './round'

/** Six rounds of increasing distance, each with 10 different horses drawn from the roster. */
export function createSchedule(roster: readonly Horse[], rng: Rng): readonly Round[] {
  return Object.freeze(
    ROUND_DISTANCES.map((distance, index) =>
      Object.freeze({
        number: index + 1,
        distance,
        horseIds: Object.freeze(
          sampleWithoutReplacement(roster, RUNNERS_PER_ROUND, rng).map((horse) => horse.id),
        ),
      }),
    ),
  )
}
