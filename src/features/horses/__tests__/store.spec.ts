import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useHorsesStore } from '../store'

describe('horses store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    expect(useHorsesStore().roster).toEqual([])
  })

  it('generates 20 horses and indexes them by id', () => {
    const store = useHorsesStore()
    store.generateRoster(1923)

    expect(store.roster).toHaveLength(20)
    for (const horse of store.roster) {
      expect(store.horsesById.get(horse.id)).toBe(horse)
    }
  })

  it('gives the same roster for the same seed', () => {
    const first = useHorsesStore()
    first.generateRoster(1923)
    const roster = first.roster

    setActivePinia(createPinia())
    const second = useHorsesStore()
    second.generateRoster(1923)

    expect(second.roster).toEqual(roster)
  })
})
