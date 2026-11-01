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
import type { SavedRace } from './model/saved-race'
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

  /** Lane of each horse in the round on the track; empty before a schedule and once all rounds are run. */
  const laneByHorse = computed<ReadonlyMap<string, number>>(() => {
    const round = currentRound.value
    if (!round || state.value.status === 'finished') return new Map()
    return new Map(round.horseIds.map((horseId, index) => [horseId, index + 1]))
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

  /** Builds schedule `n` of the session. The same seed and `n` always give the same programme. */
  function buildProgramme(sessionSeed: number, n: number) {
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
  }

  function generate(): boolean {
    if (seed.value === null) throw new Error('Start a session before generating a schedule')
    if (!dispatch({ type: 'generate' })) return false
    buildProgramme(seed.value, ++generation.value)
    return true
  }

  function resultOf(simulation: RoundSimulation): RoundResult {
    return Object.freeze({
      roundNumber: simulation.roundNumber,
      distance: simulation.distance,
      placings: placingsOf(simulation),
    })
  }

  /** What to save to rebuild this race later; null until there is a schedule to come back to. */
  function savedRace(time: number): SavedRace | null {
    return seed.value !== null && generation.value > 0
      ? { seed: seed.value, generation: generation.value, state: state.value, time }
      : null
  }

  /** Rebuilds a saved race from its seed; only the numbers were stored. */
  function restoreSession(saved: SavedRace) {
    startSession(saved.seed)
    generation.value = saved.generation
    buildProgramme(saved.seed, saved.generation)
    results.value = Object.freeze(
      simulations.value.slice(0, saved.state.completedRounds).map(resultOf),
    )
    state.value = saved.state
  }

  const start = () => dispatch({ type: 'start' })
  const pause = () => dispatch({ type: 'pause' })
  const resume = () => dispatch({ type: 'resume' })

  /** Commits the result of the round on the track; a second call for the same round is ignored. */
  function completeRound(index: number): boolean {
    const simulation = simulations.value[index]
    if (!simulation || !dispatch({ type: 'completeRound', round: index })) return false
    results.value = Object.freeze([...results.value, resultOf(simulation)])
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
    laneByHorse,
    winners,
    results,
    startSession,
    restoreSession,
    savedRace,
    generate,
    start,
    pause,
    resume,
    completeRound,
    advanceRound,
  }
})
