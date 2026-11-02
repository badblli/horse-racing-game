import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, ref } from 'vue'

import { useHorsesStore } from '@/features/horses/store'

import { readSavedRace, useSavedRace } from '../composables/useSavedRace'
import { useRaceStore } from '../store'

function setup(time = 12.5) {
  const race = useRaceStore()
  race.startSession(1923)
  const scope = effectScope()
  scope.run(() => useSavedRace(ref(time)))
  return { race, scope }
}

const leavePage = () => window.dispatchEvent(new Event('pagehide'))

describe('saved race', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('saves the race and its time when the page goes away', () => {
    const { race, scope } = setup()
    race.generate()
    race.start()
    leavePage()
    scope.stop()

    expect(readSavedRace()).toEqual({
      seed: 1923,
      generation: 1,
      time: 12.5,
      state: { status: 'paused', currentRound: 0, completedRounds: 0 },
    })
  })

  it('keeps nothing before a schedule exists, so a refresh draws new horses', () => {
    const { race, scope } = setup()
    race.generate()
    leavePage()
    expect(readSavedRace()).not.toBeNull()

    race.startSession(7)
    leavePage()
    scope.stop()
    expect(readSavedRace()).toBeNull()
  })

  it('stops saving once disposed', () => {
    const { race, scope } = setup()
    race.generate()
    scope.stop()
    leavePage()
    expect(readSavedRace()).toBeNull()
  })

  it('survives blocked storage', () => {
    const { race, scope } = setup()
    race.generate()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(leavePage).not.toThrow()
    expect(readSavedRace()).toBeNull()
    scope.stop()
  })

  it('rebuilds the same race from the saved numbers', () => {
    const original = useRaceStore()
    original.startSession(1923)
    original.generate()
    original.generate()
    original.start()
    original.completeRound(0)
    original.advanceRound()
    original.completeRound(1)
    const saved = original.savedRace(30)!
    const roster = useHorsesStore().roster
    const schedule = original.schedule
    const results = original.results

    setActivePinia(createPinia())
    const restored = useRaceStore()
    restored.restoreSession(saved)

    expect(useHorsesStore().roster).toEqual(roster)
    expect(restored.schedule).toEqual(schedule)
    expect(restored.results).toEqual(results)
    expect(restored.currentRoundIndex).toBe(1)
    expect(restored.status).toBe('running')
  })
})
