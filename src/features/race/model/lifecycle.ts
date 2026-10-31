import { ROUND_DISTANCES } from '@/features/schedule/model/round'

export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'

export interface RaceState {
  readonly status: RaceStatus
  /** Index of the round on the track, 0 to 5. */
  readonly currentRound: number
  /** Rounds with a result; one more than `currentRound` while the track holds a finished round. */
  readonly completedRounds: number
}

export type RaceEvent =
  | { readonly type: 'generate' }
  | { readonly type: 'start' }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' }
  | { readonly type: 'completeRound'; readonly round: number }
  | { readonly type: 'advanceRound' }

export const initialRaceState: RaceState = Object.freeze({
  status: 'idle',
  currentRound: 0,
  completedRounds: 0,
})

/** Statuses each event is accepted from; everything else is rejected. */
const acceptedFrom: Readonly<Record<RaceEvent['type'], readonly RaceStatus[]>> = {
  generate: ['idle', 'ready', 'paused', 'finished'],
  start: ['ready'],
  pause: ['running'],
  resume: ['paused'],
  completeRound: ['running'],
  advanceRound: ['running'],
}

/** The next state, or `null` when the event is not allowed now. Never mutates `state`. */
export function transition(state: RaceState, event: RaceEvent): RaceState | null {
  if (!acceptedFrom[event.type].includes(state.status)) return null
  const hasResult = state.completedRounds > state.currentRound

  switch (event.type) {
    case 'generate':
      return { status: 'ready', currentRound: 0, completedRounds: 0 }
    case 'start':
      return { ...state, status: 'running' }
    case 'pause':
      return { ...state, status: 'paused' }
    case 'resume':
      return { ...state, status: 'running' }
    case 'completeRound':
      // Only the round on the track, and only once.
      if (event.round !== state.currentRound || hasResult) return null
      return { ...state, completedRounds: state.completedRounds + 1 }
    case 'advanceRound':
      if (!hasResult) return null
      return state.currentRound + 1 < ROUND_DISTANCES.length
        ? { ...state, currentRound: state.currentRound + 1 }
        : { ...state, status: 'finished' }
  }
}
