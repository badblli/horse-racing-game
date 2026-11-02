import { describe, it, expect } from 'vitest'

import { parseSavedRace, type SavedRace } from '../model/saved-race'

const valid: SavedRace = {
  seed: 1923,
  generation: 2,
  time: 40.5,
  state: { status: 'paused', currentRound: 3, completedRounds: 3 },
}
const withChanges = (changes: object) => JSON.stringify({ ...valid, ...changes })
const withState = (state: object) => withChanges({ state: { ...valid.state, ...state } })

describe('parseSavedRace', () => {
  it('reads a valid saved race', () => {
    expect(parseSavedRace(JSON.stringify(valid))).toEqual(valid)
  })

  it('brings a running race back paused', () => {
    expect(parseSavedRace(withState({ status: 'running' }))?.state.status).toBe('paused')
  })

  it('accepts a finished round holding the track and a finished programme', () => {
    expect(parseSavedRace(withState({ completedRounds: 4 }))).not.toBeNull()
    expect(
      parseSavedRace(withState({ status: 'finished', currentRound: 5, completedRounds: 6 })),
    ).not.toBeNull()
  })

  it.each([
    ['nothing', null],
    ['an empty string', ''],
    ['broken JSON', '{seed'],
    ['null', 'null'],
    ['a number', '5'],
    ['a fractional seed', withChanges({ seed: 1.5 })],
    ['a negative seed', withChanges({ seed: -1 })],
    ['a seed over 32 bits', withChanges({ seed: 2 ** 32 })],
    ['no schedule yet', withChanges({ generation: 0 })],
    ['a negative time', withChanges({ time: -1 })],
    ['a time that is not a number', withChanges({ time: 'soon' })],
    ['no state', withChanges({ state: undefined })],
    ['an unknown status', withState({ status: 'flying' })],
    ['an idle race', withState({ status: 'idle' })],
    ['a round past the last', withState({ currentRound: 6, completedRounds: 6 })],
    ['results out of step', withState({ completedRounds: 1 })],
    ['a ready race with results', withState({ status: 'ready', completedRounds: 4 })],
  ])('rejects %s', (_name, text) => {
    expect(parseSavedRace(text)).toBeNull()
  })
})
