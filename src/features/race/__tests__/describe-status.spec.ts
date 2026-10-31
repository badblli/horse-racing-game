import { describe, it, expect } from 'vitest'

import {
  describeRaceAnnouncement,
  describeRaceStatus,
  type RaceStatusInput,
  type StatusMessage,
} from '../model/describe-status'

const text = (message: StatusMessage) => message.map((part) => part.text).join('')
const strong = (message: StatusMessage) =>
  message.filter((part) => part.strong).map((part) => part.text)

const base: RaceStatusInput = { status: 'running', roundNumber: 3, leaderName: null, winner: null }
const winner = { name: 'Fırtına', finishTime: 90.12 }

describe('describeRaceStatus', () => {
  it.each<[string, RaceStatusInput, string]>([
    [
      'idle',
      { ...base, status: 'idle', roundNumber: null },
      'Generate a schedule to draw ten horses for each of the six rounds.',
    ],
    ['ready', { ...base, status: 'ready', roundNumber: 1 }, 'Ready. Ten horses are at the start.'],
    ['racing', { ...base, leaderName: 'Uludağ' }, 'Racing · Uludağ leads'],
    ['paused', { ...base, status: 'paused', leaderName: 'Uludağ' }, 'Paused · Uludağ leads'],
    ['round won', { ...base, winner }, 'Fırtına wins round 3 in 1:30.12. Round 4 lines up next.'],
    [
      'round won while paused',
      { ...base, status: 'paused', winner },
      'Fırtına wins round 3 in 1:30.12. Round 4 lines up next.',
    ],
    [
      'last round won',
      { ...base, roundNumber: 6, winner },
      'Fırtına wins the final round in 1:30.12.',
    ],
    [
      'finished',
      { ...base, status: 'finished', roundNumber: 6, winner },
      'Fırtına wins the final round. All six rounds are complete; generate a new schedule to race again.',
    ],
  ])('%s', (_, input, expected) => {
    expect(text(describeRaceStatus(input))).toBe(expected)
  })

  it('emphasises only the horse name', () => {
    expect(strong(describeRaceStatus({ ...base, leaderName: 'Uludağ' }))).toEqual(['Uludağ'])
    expect(strong(describeRaceStatus({ ...base, winner }))).toEqual(['Fırtına'])
    expect(strong(describeRaceStatus({ ...base, status: 'ready', roundNumber: 1 }))).toEqual([])
  })
})

describe('describeRaceAnnouncement', () => {
  it.each<[string, RaceStatusInput, string]>([
    ['idle', { ...base, status: 'idle', roundNumber: null }, ''],
    [
      'ready',
      { ...base, status: 'ready', roundNumber: 1 },
      'Schedule generated. Round 1 is ready to start.',
    ],
    ['running', base, 'Round 3 is running.'],
    ['paused', { ...base, status: 'paused' }, 'Round 3 paused.'],
    ['round won', { ...base, winner }, 'Fırtına wins round 3 in 1:30.12.'],
    [
      'finished',
      { ...base, status: 'finished', roundNumber: 6, winner },
      'All six rounds are complete.',
    ],
  ])('%s', (_, input, expected) => {
    expect(describeRaceAnnouncement(input)).toBe(expected)
  })

  it('does not change when the leader changes', () => {
    expect(describeRaceAnnouncement({ ...base, leaderName: 'Uludağ' })).toBe(
      describeRaceAnnouncement({ ...base, leaderName: 'Poyraz' }),
    )
  })
})
