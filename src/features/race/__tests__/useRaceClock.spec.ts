import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'

import {
  HOLD_SECONDS,
  PLAYBACK_RATE,
  useRaceClock,
  type RaceClockOptions,
} from '../composables/useRaceClock'
import { useRaceStore } from '../store'

/** A manual stand-in for requestAnimationFrame. */
function fakeFrames() {
  let now = 0
  let nextId = 1
  const pending = new Map<number, FrameRequestCallback>()

  return {
    requestFrame: (callback: FrameRequestCallback) => {
      pending.set(nextId, callback)
      return nextId++
    },
    cancelFrame: (id: number) => {
      pending.delete(id)
    },
    get pending() {
      return pending.size
    },
    /** Moves time forward by `ms` and runs the frames that were waiting. */
    step(ms: number) {
      now += ms
      const callbacks = [...pending.values()]
      pending.clear()
      callbacks.forEach((callback) => callback(now))
    },
    /** Runs 60 fps frames for `seconds` of real time. */
    run(seconds: number) {
      for (let elapsed = 0; elapsed < seconds * 1000; elapsed += 1000 / 60) this.step(1000 / 60)
    },
  }
}

function setup(options: RaceClockOptions = {}) {
  const race = useRaceStore()
  race.startSession(1923)
  race.generate()
  const frames = fakeFrames()
  const scope = effectScope()
  const clock = scope.run(() => useRaceClock({ ...frames, ...options }))!
  return { race, frames, scope, clock }
}

describe('useRaceClock', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('waits until the race is started', () => {
    const { race, frames, clock } = setup()

    expect(frames.pending).toBe(0)
    race.start()
    expect(frames.pending).toBe(1)

    frames.step(0)
    frames.step(100)
    expect(clock.time.value).toBeCloseTo(0.1 * PLAYBACK_RATE, 9)
  })

  it('caps a long gap between frames', () => {
    const { race, frames, clock } = setup()
    race.start()
    frames.step(0)

    frames.step(5_000)

    expect(clock.time.value).toBeCloseTo(0.1 * PLAYBACK_RATE, 9)
  })

  it('stops on pause and resumes without a jump', () => {
    const { race, frames, clock } = setup()
    race.start()
    frames.run(1)
    const before = clock.time.value

    race.pause()
    expect(frames.pending).toBe(0)
    frames.run(3)
    expect(clock.time.value).toBe(before)

    race.resume()
    frames.step(10_000)
    expect(clock.time.value).toBe(before)
    frames.step(50)
    expect(clock.time.value).toBeCloseTo(before + 0.05 * PLAYBACK_RATE, 9)
  })

  it('completes the round once when the last horse finishes', () => {
    const { race, frames, clock } = setup()
    const duration = race.currentSimulation!.duration
    race.start()

    frames.run(duration / PLAYBACK_RATE + 1)

    expect(race.results).toHaveLength(1)
    expect(race.results[0]!.roundNumber).toBe(1)
    expect(clock.time.value).toBe(duration)
  })

  it('holds the finished round, then starts the next one from the gate', () => {
    const { race, frames, clock } = setup()
    race.start()
    frames.run(race.currentSimulation!.duration / PLAYBACK_RATE + 0.1)
    expect(race.currentRoundIndex).toBe(0)

    frames.run(HOLD_SECONDS - 0.5)
    expect(race.currentRoundIndex).toBe(0)

    frames.run(0.5)
    expect(race.currentRoundIndex).toBe(1)
    expect(clock.time.value).toBeLessThan(1)
  })

  it('pauses the hold between rounds as well', () => {
    const { race, frames } = setup()
    race.start()
    frames.run(race.currentSimulation!.duration / PLAYBACK_RATE + 0.1)

    race.pause()
    frames.run(HOLD_SECONDS * 2)
    expect(race.currentRoundIndex).toBe(0)

    race.resume()
    frames.run(HOLD_SECONDS + 0.1)
    expect(race.currentRoundIndex).toBe(1)
  })

  it('runs all six rounds and stops at the finish', () => {
    const { race, frames } = setup({ rate: 200 })
    race.start()

    frames.run(60)

    expect(race.status).toBe('finished')
    expect(race.results.map((result) => result.roundNumber)).toEqual([1, 2, 3, 4, 5, 6])
    expect(frames.pending).toBe(0)
  })

  it('returns to the gate when a new schedule is generated', () => {
    const { race, frames, clock } = setup()
    race.start()
    frames.run(2)
    race.pause()

    race.generate()

    expect(clock.time.value).toBe(0)
    expect(frames.pending).toBe(0)
  })

  it('cancels the pending frame when disposed', () => {
    const { race, frames, scope } = setup()
    race.start()
    expect(frames.pending).toBe(1)

    scope.stop()

    expect(frames.pending).toBe(0)
  })
})
