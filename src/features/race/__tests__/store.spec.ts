import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useHorsesStore } from '@/features/horses/store'

import { placingsOf } from '../model/standings'
import { useRaceStore } from '../store'

function sessionStore(seed = 1923) {
  const race = useRaceStore()
  race.startSession(seed)
  return race
}

/** Runs the current round to its result and moves on, as the race clock will. */
function runRound(race: ReturnType<typeof useRaceStore>) {
  expect(race.completeRound(race.currentRoundIndex)).toBe(true)
  expect(race.advanceRound()).toBe(true)
}

describe('race store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts a session with a roster and no schedule', () => {
    const race = sessionStore()

    expect(useHorsesStore().roster).toHaveLength(20)
    expect(race.status).toBe('idle')
    expect(race.schedule).toEqual([])
    expect(race.currentRound).toBeNull()
  })

  it('refuses to generate before a session starts', () => {
    expect(() => useRaceStore().generate()).toThrow('Start a session')
  })

  it('generates a six-round schedule and becomes ready', () => {
    const race = sessionStore()

    expect(race.generate()).toBe(true)
    expect(race.status).toBe('ready')
    expect(race.schedule).toHaveLength(6)
    expect(race.currentRound).toBe(race.schedule[0])
    expect(race.currentSimulation?.roundNumber).toBe(1)
    expect(race.results).toEqual([])
  })

  it('keeps the same roster when a new schedule is generated', () => {
    const race = sessionStore()
    const horses = useHorsesStore()
    const roster = horses.roster

    race.generate()
    race.generate()

    expect(horses.roster).toBe(roster)
  })

  it('reproduces schedules and results for the same seed', () => {
    const first = sessionStore()
    first.generate()
    first.start()
    runRound(first)
    const [schedule, results] = [first.schedule, first.results]

    setActivePinia(createPinia())
    const second = sessionStore()
    second.generate()
    second.start()
    runRound(second)

    expect(second.schedule).toEqual(schedule)
    expect(second.results).toEqual(results)
  })

  it('ignores actions the lifecycle does not allow', () => {
    const race = sessionStore()

    expect(race.start()).toBe(false)
    expect(race.pause()).toBe(false)
    expect(race.status).toBe('idle')

    race.generate()
    race.start()
    expect(race.generate()).toBe(false)
    expect(race.status).toBe('running')
  })

  it('appends each result once, in order, and finishes after six rounds', () => {
    const race = sessionStore()
    race.generate()
    race.start()
    const expectedPlacings: ReturnType<typeof placingsOf>[] = []

    while (race.status === 'running') {
      expectedPlacings.push(placingsOf(race.currentSimulation!))
      expect(race.completeRound(race.currentRoundIndex)).toBe(true)
      expect(race.completeRound(race.currentRoundIndex)).toBe(false)
      expect(race.advanceRound()).toBe(true)
    }

    expect(race.status).toBe('finished')
    expect(race.results.map((result) => result.roundNumber)).toEqual([1, 2, 3, 4, 5, 6])
    expect(race.results.map((result) => result.distance)).toEqual([
      1200, 1400, 1600, 1800, 2000, 2200,
    ])
    expect(race.results.map((result) => result.placings)).toEqual(expectedPlacings)
  })

  it('rejects completing a round that is not on the track', () => {
    const race = sessionStore()
    race.generate()
    race.start()

    expect(race.completeRound(1)).toBe(false)
    expect(race.results).toEqual([])
  })

  it('pauses and resumes the current round', () => {
    const race = sessionStore()
    race.generate()
    race.start()
    runRound(race)

    expect(race.pause()).toBe(true)
    expect(race.status).toBe('paused')
    expect(race.completeRound(race.currentRoundIndex)).toBe(false)
    expect(race.resume()).toBe(true)
    expect(race.status).toBe('running')
    expect(race.currentRoundIndex).toBe(1)
  })

  it('clears the results when a new schedule is generated while paused', () => {
    const race = sessionStore()
    race.generate()
    race.start()
    runRound(race)
    race.pause()

    expect(race.generate()).toBe(true)
    expect(race.status).toBe('ready')
    expect(race.currentRoundIndex).toBe(0)
    expect(race.results).toEqual([])
  })
})
