import { ROUND_DISTANCES } from '@/features/schedule/model/round'

import type { RaceState, RaceStatus } from './lifecycle'

/** All it takes to rebuild a race: the seed reproduces the horses, the schedule and every result. */
export interface SavedRace {
  readonly seed: number
  /** Which of the session's schedules is on. */
  readonly generation: number
  readonly state: RaceState
  /** Race seconds into the current round. */
  readonly time: number
}

const SAVED_STATUSES: readonly RaceStatus[] = ['ready', 'running', 'paused', 'finished']

function isValidState(state: Partial<RaceState> | undefined): state is RaceState {
  if (!state?.status || !SAVED_STATUSES.includes(state.status)) return false
  const { currentRound, completedRounds } = state
  return (
    Number.isInteger(currentRound) &&
    Number.isInteger(completedRounds) &&
    currentRound! >= 0 &&
    currentRound! < ROUND_DISTANCES.length &&
    // A round's result may be in while it still holds the track.
    (completedRounds === currentRound || completedRounds === currentRound! + 1) &&
    (state.status !== 'ready' || completedRounds === 0)
  )
}

/**
 * Reads a saved race, or null for anything else. The text comes from storage, so nothing about
 * it is trusted. A race that was running comes back paused: the visitor decides when it goes on.
 */
export function parseSavedRace(text: string | null): SavedRace | null {
  if (!text) return null
  let data: Partial<SavedRace> | null
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (
    !data ||
    !Number.isInteger(data.seed) ||
    data.seed! < 0 ||
    data.seed! > 0xffffffff ||
    !Number.isInteger(data.generation) ||
    data.generation! < 1 ||
    !Number.isFinite(data.time) ||
    data.time! < 0 ||
    !isValidState(data.state)
  ) {
    return null
  }
  return {
    seed: data.seed!,
    generation: data.generation!,
    time: data.time!,
    state: data.state.status === 'running' ? { ...data.state, status: 'paused' } : data.state,
  }
}
