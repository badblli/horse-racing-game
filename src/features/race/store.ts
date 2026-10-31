import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { useHorsesStore } from '@/features/horses/store'
import { createSchedule } from '@/features/schedule/model/create-schedule'
import type { Round, RoundState } from '@/features/schedule/model/round'
import { createRng, deriveSeed } from '@/shared/lib/random'

import {
  initialRaceState,
  transition,
  type RaceAction,
  type RaceEvent,
  type RaceState,
} from './model/lifecycle'
import type { Placing, RoundSimulation } from './model/race'
import { simulateRound } from './model/simulate-round'
import { placingsOf } from './model/standings'

export interface RoundResult {
  readonly roundNumber: number
  readonly distance: number
  readonly placings: readonly Placing[]
}

export const useRaceStore = defineStore('race', () => {
  const horses = useHorsesStore()

  const seed = shallowRef<number | null>(null)
  const state = shallowRef<RaceState>(initialRaceState)
  /** How many schedules this session has generated; names the random streams. */
  const generation = shallowRef(0)
  const schedule = shallowRef<readonly Round[]>([])
  const simulations = shallowRef<readonly RoundSimulation[]>([])
  const results = shallowRef<readonly RoundResult[]>([])

  const status = computed(() => state.value.status)
  const currentRoundIndex = computed(() => state.value.currentRound)
  const currentRound = computed(() => schedule.value[state.value.currentRound] ?? null)
  const currentSimulation = computed(() => simulations.value[state.value.currentRound] ?? null)

  /** Each round's place in the programme, for the schedule. */
  const roundStates = computed<RoundState[]>(() => {
    const { status, currentRound } = state.value
    const completed = results.value.length
    return schedule.value.map((_, index): RoundState => {
      if (index < completed) return 'done'
      if (index === currentRound) {
        if (status === 'running') return 'racing'
        if (status === 'paused') return 'paused'
        return 'next'
      }
      // While a finished round holds the track, the following one is next.
      return index === completed ? 'next' : 'upcoming'
    })
  })

  /** Winning horse id per completed round, in running order. */
  const winners = computed(() => results.value.map((result) => result.placings[0]?.horseId ?? null))

  // What the controls may offer comes from the transition table, not from the components.
  const can = (event: RaceEvent) => transition(state.value, event) !== null
  const canGenerate = computed(() => seed.value !== null && can({ type: 'generate' }))
  const primaryAction = computed<RaceAction | null>(
    () => (['start', 'pause', 'resume'] as const).find((type) => can({ type })) ?? null,
  )

  /** Applies a lifecycle event; returns false and changes nothing when it is not allowed. */
  function dispatch(event: RaceEvent): boolean {
    const next = transition(state.value, event)
    if (!next) return false
    state.value = next
    return true
  }

  /** Starts a session: the roster is generated once here, from the session seed. */
  function startSession(sessionSeed: number) {
    seed.value = sessionSeed
    horses.generateRoster(sessionSeed)
    state.value = initialRaceState
    generation.value = 0
    schedule.value = []
    simulations.value = []
    results.value = []
  }

  function generate(): boolean {
    if (seed.value === null) throw new Error('Start a session before generating a schedule')
    if (!dispatch({ type: 'generate' })) return false

    const sessionSeed = seed.value
    const n = ++generation.value
    const rounds = createSchedule(
      horses.roster,
      createRng(deriveSeed(sessionSeed, `schedule:${n}`)),
    )
    schedule.value = rounds
    // Every round is decided up front; playback only reveals it.
    simulations.value = Object.freeze(
      rounds.map((round, index) =>
        simulateRound(
          round,
          horses.horsesById,
          createRng(deriveSeed(sessionSeed, `round:${n}:${index}`)),
        ),
      ),
    )
    results.value = []
    return true
  }

  const start = () => dispatch({ type: 'start' })
  const pause = () => dispatch({ type: 'pause' })
  const resume = () => dispatch({ type: 'resume' })

  /** Commits the result of the round on the track; a second call for the same round is ignored. */
  function completeRound(index: number): boolean {
    const simulation = simulations.value[index]
    if (!simulation || !dispatch({ type: 'completeRound', round: index })) return false
    results.value = Object.freeze([
      ...results.value,
      Object.freeze({
        roundNumber: simulation.roundNumber,
        distance: simulation.distance,
        placings: placingsOf(simulation),
      }),
    ])
    return true
  }

  const advanceRound = () => dispatch({ type: 'advanceRound' })

  return {
    status,
    currentRoundIndex,
    currentRound,
    currentSimulation,
    canGenerate,
    primaryAction,
    schedule,
    roundStates,
    winners,
    results,
    startSession,
    generate,
    start,
    pause,
    resume,
    completeRound,
    advanceRound,
  }
})
