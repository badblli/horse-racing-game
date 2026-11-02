import { onScopeDispose, type Ref } from 'vue'

import { parseSavedRace, type SavedRace } from '../model/saved-race'
import { useRaceStore } from '../store'

/*
 * sessionStorage, not localStorage: a refresh keeps the race, while a new tab or a later visit
 * starts over with a new random roster, as the game is meant to.
 */
const STORAGE_KEY = 'cumhuriyet-cup:race'

export function readSavedRace(): SavedRace | null {
  try {
    return parseSavedRace(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

/** Saves the race as the page goes away; once is enough, however long the race has been running. */
export function useSavedRace(time: Readonly<Ref<number>>) {
  const race = useRaceStore()

  function save() {
    try {
      const saved = race.savedRace(time.value)
      if (saved) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      // With no schedule yet there is nothing to keep, and a refresh draws new horses.
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage can be blocked or full; a refresh then simply starts over.
    }
  }

  window.addEventListener('pagehide', save)
  onScopeDispose(() => window.removeEventListener('pagehide', save))
}
