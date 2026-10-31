export interface HorseColor {
  readonly name: string
  readonly hex: string
}

export interface Horse {
  /** Stable for the whole session and independent of the name: `horse-01` … `horse-20`. */
  readonly id: string
  readonly name: string
  readonly color: HorseColor
  /** Integer from 1 to 100; higher is faster. */
  readonly condition: number
}

export const ROSTER_SIZE = 20
export const MIN_CONDITION = 1
export const MAX_CONDITION = 100
