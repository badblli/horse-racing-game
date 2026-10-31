import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { createRng, deriveSeed } from '@/shared/lib/random'

import { createRoster } from './model/create-roster'
import type { Horse } from './model/horse'

export const useHorsesStore = defineStore('horses', () => {
  /** Frozen data, replaced as a whole, so a shallow ref is enough. */
  const roster = shallowRef<readonly Horse[]>([])

  const horsesById = computed<ReadonlyMap<string, Horse>>(
    () => new Map(roster.value.map((horse) => [horse.id, horse])),
  )

  /** Called once per session; schedules never change the roster. */
  function generateRoster(seed: number) {
    roster.value = createRoster(createRng(deriveSeed(seed, 'roster')))
  }

  return { roster, horsesById, generateRoster }
})
