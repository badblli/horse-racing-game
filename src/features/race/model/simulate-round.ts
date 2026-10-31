import type { Horse } from '@/features/horses/model/horse'
import type { Round } from '@/features/schedule/model/round'
import type { Rng } from '@/shared/lib/random'

import type { RoundSimulation, RunnerTrajectory } from './race'

/** Meters between checkpoints; each segment is run at its own pace, so horses can overtake. */
export const SEGMENT_LENGTH = 100
/** Meters per second for a horse with average form. */
export const BASE_SPEED = 16.5
/** Share of the speed decided by condition: condition 1 is about 10% slower than condition 100. */
export const CONDITION_WEIGHT = 0.1
/** How far a horse's form on the day can move its speed, up or down. */
export const FORM_SPREAD = 0.05
/** How far the pace can vary from one segment to the next. */
export const PACE_SPREAD = 0.06

/**
 * Runs a round ahead of time. The result is pure data: playback only reads it,
 * so pausing or redrawing can never change who wins.
 */
export function simulateRound(
  round: Round,
  horsesById: ReadonlyMap<string, Horse>,
  rng: Rng,
): RoundSimulation {
  if (round.distance <= 0 || round.distance % SEGMENT_LENGTH !== 0) {
    throw new RangeError(`Distance must be a positive multiple of ${SEGMENT_LENGTH} m`)
  }
  const segments = round.distance / SEGMENT_LENGTH

  const runners = round.horseIds.map((horseId, index): RunnerTrajectory => {
    const horse = horsesById.get(horseId)
    if (!horse) throw new Error(`Unknown horse: ${horseId}`)

    const speed =
      BASE_SPEED *
      (1 - CONDITION_WEIGHT + (CONDITION_WEIGHT * horse.condition) / 100) *
      vary(rng, FORM_SPREAD)

    const checkpoints = [0]
    let time = 0
    for (let segment = 0; segment < segments; segment++) {
      time += SEGMENT_LENGTH / (speed * vary(rng, PACE_SPREAD))
      checkpoints.push(time)
    }

    return Object.freeze({
      horseId,
      lane: index + 1,
      checkpoints: Object.freeze(checkpoints),
      finishTime: time,
    })
  })

  return Object.freeze({
    roundNumber: round.number,
    distance: round.distance,
    runners: Object.freeze(runners),
    duration: Math.max(...runners.map((runner) => runner.finishTime)),
  })
}

/** A factor in [1 - spread, 1 + spread). */
function vary(rng: Rng, spread: number): number {
  return 1 + (rng() * 2 - 1) * spread
}
