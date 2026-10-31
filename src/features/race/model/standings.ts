import type { Placing, RoundSimulation, RunnerTrajectory } from './race'
import { SEGMENT_LENGTH } from './simulate-round'

/** Meters covered at race time `time`, clamped to the start and the finish line. */
export function distanceAt(runner: RunnerTrajectory, time: number): number {
  const { checkpoints } = runner
  const last = checkpoints.length - 1
  if (time <= 0) return 0
  if (time >= runner.finishTime) return last * SEGMENT_LENGTH

  // Binary search for the segment that contains `time`, then interpolate inside it.
  let low = 0
  let high = last
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if ((checkpoints[middle] as number) <= time) low = middle
    else high = middle
  }
  const start = checkpoints[low] as number
  const end = checkpoints[high] as number
  return (low + (time - start) / (end - start)) * SEGMENT_LENGTH
}

/** Finishing order: fastest time first, and the lower lane on an exact tie. */
export function placingsOf(simulation: RoundSimulation): readonly Placing[] {
  return Object.freeze(
    [...simulation.runners]
      .sort((a, b) => a.finishTime - b.finishTime || a.lane - b.lane)
      .map((runner, index) =>
        Object.freeze({
          position: index + 1,
          horseId: runner.horseId,
          lane: runner.lane,
          finishTime: runner.finishTime,
        }),
      ),
  )
}
