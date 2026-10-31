export interface Round {
  /** 1 to 6, in running order. */
  readonly number: number
  /** Meters. */
  readonly distance: number
  /** Runners in lane order: the first id runs in lane 1. */
  readonly horseIds: readonly string[]
}

export const ROUND_DISTANCES: readonly number[] = Object.freeze([
  1200, 1400, 1600, 1800, 2000, 2200,
])
export const RUNNERS_PER_ROUND = 10
