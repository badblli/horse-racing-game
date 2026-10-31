import { describe, it, expect } from 'vitest'

import { createRoster } from '@/features/horses/model/create-roster'
import { createRng, deriveSeed } from '@/shared/lib/random'

import { createSchedule } from '../model/create-schedule'

const roster = createRoster(createRng(deriveSeed(1923, 'roster')))
const rosterIds = new Set(roster.map((horse) => horse.id))

function scheduleFor(seed: number, generation = 1) {
  return createSchedule(roster, createRng(deriveSeed(seed, `schedule:${generation}`)))
}

describe('createSchedule', () => {
  const schedule = scheduleFor(1923)

  it('creates six rounds numbered in running order', () => {
    expect(schedule.map((round) => round.number)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('uses the exact distances in order', () => {
    expect(schedule.map((round) => round.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
  })

  it('puts 10 different horses from the roster in every round', () => {
    for (const round of schedule) {
      expect(round.horseIds).toHaveLength(10)
      expect(new Set(round.horseIds).size).toBe(10)
      expect(round.horseIds.every((id) => rosterIds.has(id))).toBe(true)
    }
  })

  it('gives the same schedule for the same seed and generation', () => {
    expect(scheduleFor(1923)).toEqual(schedule)
  })

  it('leaves the roster unchanged when generated again', () => {
    const before = structuredClone(roster)
    scheduleFor(1923, 2)
    scheduleFor(1923, 3)
    expect(roster).toEqual(before)
  })

  it('freezes the schedule, its rounds and their lineups', () => {
    expect(Object.isFrozen(schedule)).toBe(true)
    expect(
      schedule.every((round) => Object.isFrozen(round) && Object.isFrozen(round.horseIds)),
    ).toBe(true)
  })
})
