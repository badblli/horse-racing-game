import { describe, it, expect } from 'vitest'

import {
  initialRaceState,
  transition,
  type RaceEvent,
  type RaceState,
  type RaceStatus,
} from '../model/lifecycle'

const states: Record<string, RaceState> = {
  idle: initialRaceState,
  ready: { status: 'ready', currentRound: 0, completedRounds: 0 },
  'running, round in progress': { status: 'running', currentRound: 2, completedRounds: 2 },
  'running, round finished': { status: 'running', currentRound: 2, completedRounds: 3 },
  paused: { status: 'paused', currentRound: 2, completedRounds: 2 },
  finished: { status: 'finished', currentRound: 5, completedRounds: 6 },
}

const events: Record<string, (state: RaceState) => RaceEvent> = {
  generate: () => ({ type: 'generate' }),
  start: () => ({ type: 'start' }),
  pause: () => ({ type: 'pause' }),
  resume: () => ({ type: 'resume' }),
  'completeRound (current)': (state) => ({ type: 'completeRound', round: state.currentRound }),
  advanceRound: () => ({ type: 'advanceRound' }),
}

type Outcome = RaceStatus | 'rejected'

/** Resulting status for every state × event pair. */
const table: Record<string, Record<string, Outcome>> = {
  idle: {
    generate: 'ready',
    start: 'rejected',
    pause: 'rejected',
    resume: 'rejected',
    'completeRound (current)': 'rejected',
    advanceRound: 'rejected',
  },
  ready: {
    generate: 'ready',
    start: 'running',
    pause: 'rejected',
    resume: 'rejected',
    'completeRound (current)': 'rejected',
    advanceRound: 'rejected',
  },
  'running, round in progress': {
    generate: 'rejected',
    start: 'rejected',
    pause: 'paused',
    resume: 'rejected',
    'completeRound (current)': 'running',
    advanceRound: 'rejected',
  },
  'running, round finished': {
    generate: 'rejected',
    start: 'rejected',
    pause: 'paused',
    resume: 'rejected',
    'completeRound (current)': 'rejected',
    advanceRound: 'running',
  },
  paused: {
    generate: 'ready',
    start: 'rejected',
    pause: 'rejected',
    resume: 'running',
    'completeRound (current)': 'rejected',
    advanceRound: 'rejected',
  },
  finished: {
    generate: 'ready',
    start: 'rejected',
    pause: 'rejected',
    resume: 'rejected',
    'completeRound (current)': 'rejected',
    advanceRound: 'rejected',
  },
}

const cases = Object.entries(table).flatMap(([stateName, row]) =>
  Object.entries(row).map(([eventName, outcome]) => [stateName, eventName, outcome] as const),
)

describe('transition table', () => {
  it('covers every state × event pair', () => {
    expect(cases).toHaveLength(Object.keys(states).length * Object.keys(events).length)
  })

  it.each(cases)('%s + %s → %s', (stateName, eventName, outcome) => {
    const state = states[stateName]!
    const next = transition(state, events[eventName]!(state))
    expect(next === null ? 'rejected' : next.status).toBe(outcome)
  })

  it('never mutates the given state', () => {
    for (const [stateName, eventName] of cases) {
      const state = Object.freeze({ ...states[stateName]! })
      expect(() => transition(state, events[eventName]!(state))).not.toThrow()
    }
  })
})

describe('round guards', () => {
  const running: RaceState = { status: 'running', currentRound: 2, completedRounds: 2 }

  it('completes only the round on the track', () => {
    expect(transition(running, { type: 'completeRound', round: 1 })).toBeNull()
    expect(transition(running, { type: 'completeRound', round: 3 })).toBeNull()
    expect(transition(running, { type: 'completeRound', round: 2 })).toEqual({
      ...running,
      completedRounds: 3,
    })
  })

  it('completes a round only once', () => {
    const completed = transition(running, { type: 'completeRound', round: 2 })!
    expect(transition(completed, { type: 'completeRound', round: 2 })).toBeNull()
  })

  it('advances only after the result exists', () => {
    expect(transition(running, { type: 'advanceRound' })).toBeNull()
  })

  it('resets to the first round on generate', () => {
    const paused: RaceState = { status: 'paused', currentRound: 4, completedRounds: 4 }
    expect(transition(paused, { type: 'generate' })).toEqual({
      status: 'ready',
      currentRound: 0,
      completedRounds: 0,
    })
  })
})

describe('a full programme', () => {
  it('runs six rounds in order and then finishes', () => {
    let state = transition(transition(initialRaceState, { type: 'generate' })!, {
      type: 'start',
    })!
    const visited: number[] = []

    while (state.status === 'running') {
      visited.push(state.currentRound)
      state = transition(state, { type: 'completeRound', round: state.currentRound })!
      state = transition(state, { type: 'advanceRound' })!
    }

    expect(visited).toEqual([0, 1, 2, 3, 4, 5])
    expect(state).toEqual({ status: 'finished', currentRound: 5, completedRounds: 6 })
  })
})
