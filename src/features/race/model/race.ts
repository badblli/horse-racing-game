/** One horse's run through a round, as race-clock times at every checkpoint. */
export interface RunnerTrajectory {
  readonly horseId: string
  /** 1 to 10. */
  readonly lane: number
  /** Race seconds at each checkpoint, from 0 at the start to the finish line. */
  readonly checkpoints: readonly number[]
  readonly finishTime: number
}

export interface RoundSimulation {
  readonly roundNumber: number
  /** Meters. */
  readonly distance: number
  /** In lane order. */
  readonly runners: readonly RunnerTrajectory[]
  /** Race seconds until the last horse finishes. */
  readonly duration: number
}

export interface Placing {
  /** 1 for the winner. */
  readonly position: number
  readonly horseId: string
  readonly lane: number
  readonly finishTime: number
}
