import { onScopeDispose, readonly, shallowRef, watch } from 'vue'

import { useRaceStore } from '../store'

/** Race seconds shown per real second: 1,200 m takes about 7 s on screen. */
export const PLAYBACK_RATE = 10
/** Real seconds the finished round stays on show, long enough to read its result. */
export const HOLD_SECONDS = 4
/** Longest frame step in real seconds, so a background tab does not make horses jump. */
export const MAX_FRAME_SECONDS = 0.1

export interface RaceClockOptions {
  /** Race seconds per real second; tests raise it to finish quickly. */
  rate?: number
  /** Race seconds to resume the current round from. */
  startTime?: number
  requestFrame?: (callback: FrameRequestCallback) => number
  cancelFrame?: (id: number) => void
}

/**
 * Plays the race store's current round on a single animation-frame loop.
 * It runs only while the race is running, completes each round once,
 * waits HOLD_SECONDS, advances, and stops on pause, finish or dispose.
 */
export function useRaceClock({
  rate = PLAYBACK_RATE,
  startTime = 0,
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (id) => window.cancelAnimationFrame(id),
}: RaceClockOptions = {}) {
  const race = useRaceStore()

  /** Race seconds since the current round started. */
  const time = shallowRef(startTime)
  /** Race seconds spent holding a finished round; scaled with the rate so tests stay fast. */
  let held = 0
  let frameId: number | null = null
  let lastFrame: number | null = null

  function tick(seconds: number) {
    const simulation = race.currentSimulation
    if (!simulation) return
    const index = race.currentRoundIndex

    if (race.results.length <= index) {
      time.value = Math.min(time.value + seconds * rate, simulation.duration)
      if (time.value >= simulation.duration) race.completeRound(index)
    } else {
      held += seconds * rate
      if (held >= HOLD_SECONDS * PLAYBACK_RATE) race.advanceRound()
    }
  }

  function onFrame(now: number) {
    frameId = null
    if (race.status !== 'running') return
    // The first frame after a start or resume only sets the reference time.
    const seconds = lastFrame === null ? 0 : Math.min((now - lastFrame) / 1000, MAX_FRAME_SECONDS)
    lastFrame = now
    tick(seconds)
    if (race.status === 'running') frameId = requestFrame(onFrame)
  }

  function stop() {
    if (frameId !== null) cancelFrame(frameId)
    frameId = null
    lastFrame = null
  }

  watch(
    () => race.status,
    (status) => {
      if (status !== 'running') stop()
      else if (frameId === null) frameId = requestFrame(onFrame)
    },
    { immediate: true, flush: 'sync' },
  )

  // A new round, or a new schedule, starts from the gate.
  watch(
    () => race.currentSimulation,
    () => {
      time.value = 0
      held = 0
    },
    { flush: 'sync' },
  )

  onScopeDispose(stop)

  return { time: readonly(time) }
}
