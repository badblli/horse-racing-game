import { describe, it, expect } from 'vitest'

import type { Horse } from '@/features/horses/model/horse'
import type { Round } from '@/features/schedule/model/round'
import { createRng } from '@/shared/lib/random'

import type { RoundSimulation } from '../model/race'
import { simulateRound } from '../model/simulate-round'
import { distanceAt, leaderAt, placingsOf, rankAt } from '../model/standings'

/** Ten horses with conditions 10, 20, … 100, running in that lane order. */
const horses: Horse[] = Array.from({ length: 10 }, (_, i) => ({
  id: `horse-${String(i + 1).padStart(2, '0')}`,
  name: `Horse ${i + 1}`,
  color: { name: 'Gray', hex: '#8E8E93' },
  condition: (i + 1) * 10,
}))
const horsesById = new Map(horses.map((horse) => [horse.id, horse]))
const round: Round = { number: 3, distance: 1600, horseIds: horses.map((horse) => horse.id) }

describe('simulateRound', () => {
  const simulation = simulateRound(round, horsesById, createRng(1923))

  it('keeps the round number, distance and lane order', () => {
    expect(simulation.roundNumber).toBe(3)
    expect(simulation.distance).toBe(1600)
    expect(simulation.runners.map((runner) => runner.horseId)).toEqual(round.horseIds)
    expect(simulation.runners.map((runner) => runner.lane)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('records a checkpoint every 100 m with strictly increasing times', () => {
    for (const runner of simulation.runners) {
      expect(runner.checkpoints).toHaveLength(17)
      expect(runner.checkpoints[0]).toBe(0)
      for (let i = 1; i < runner.checkpoints.length; i++) {
        expect(runner.checkpoints[i]).toBeGreaterThan(runner.checkpoints[i - 1] as number)
      }
      expect(runner.finishTime).toBe(runner.checkpoints[runner.checkpoints.length - 1])
    }
  })

  it('lasts until the last horse finishes', () => {
    expect(simulation.duration).toBe(
      Math.max(...simulation.runners.map((runner) => runner.finishTime)),
    )
  })

  it('gives the same result for the same seed', () => {
    expect(simulateRound(round, horsesById, createRng(1923))).toEqual(simulation)
  })

  it('rejects unknown horses and distances off the 100 m grid', () => {
    expect(() =>
      simulateRound({ ...round, horseIds: ['horse-99'] }, horsesById, createRng(1)),
    ).toThrow('Unknown horse')
    expect(() => simulateRound({ ...round, distance: 1250 }, horsesById, createRng(1))).toThrow(
      RangeError,
    )
  })

  it('lets higher condition win more often', () => {
    const wins = new Map<number, number>()
    const races = 2_000
    for (let seed = 0; seed < races; seed++) {
      const [winner] = placingsOf(simulateRound(round, horsesById, createRng(seed)))
      const condition = horsesById.get(winner!.horseId)!.condition
      wins.set(condition, (wins.get(condition) ?? 0) + 1)
    }
    const share = (condition: number) => (wins.get(condition) ?? 0) / races
    const lowerHalf = [10, 20, 30, 40, 50].reduce((sum, condition) => sum + share(condition), 0)

    // Measured: about 0.41 for condition 100 and 0.02 for the lower half combined.
    expect(share(100)).toBeGreaterThan(0.3)
    expect(lowerHalf).toBeLessThan(0.05)
    expect(lowerHalf).toBeGreaterThan(0)
  })
})

describe('distanceAt', () => {
  const runner = simulateRound(round, horsesById, createRng(7)).runners[0]!

  it('clamps to the start and the finish line', () => {
    expect(distanceAt(runner, -5)).toBe(0)
    expect(distanceAt(runner, 0)).toBe(0)
    expect(distanceAt(runner, runner.finishTime)).toBe(1600)
    expect(distanceAt(runner, runner.finishTime + 30)).toBe(1600)
  })

  it('is exact at every checkpoint', () => {
    runner.checkpoints.forEach((time, index) => {
      expect(distanceAt(runner, time)).toBeCloseTo(index * 100, 9)
    })
  })

  it('interpolates inside a segment', () => {
    const [start, end] = [runner.checkpoints[4]!, runner.checkpoints[5]!]
    expect(distanceAt(runner, (start + end) / 2)).toBeCloseTo(450, 9)
  })

  it('never moves backwards', () => {
    let previous = 0
    for (let time = 0; time <= runner.finishTime + 1; time += 0.25) {
      const distance = distanceAt(runner, time)
      expect(distance).toBeGreaterThanOrEqual(previous)
      previous = distance
    }
  })
})

describe('placingsOf', () => {
  it('orders runners by finish time and numbers the positions', () => {
    const simulation = simulateRound(round, horsesById, createRng(1923))
    const placings = placingsOf(simulation)
    const times = placings.map((placing) => placing.finishTime)

    expect(placings.map((placing) => placing.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(new Set(placings.map((placing) => placing.horseId)).size).toBe(10)
  })

  it('breaks an exact tie by lane', () => {
    const runner = (horseId: string, lane: number, finishTime: number) => ({
      horseId,
      lane,
      checkpoints: [0, finishTime],
      finishTime,
    })
    const simulation: RoundSimulation = {
      roundNumber: 1,
      distance: 100,
      runners: [runner('a', 1, 6.2), runner('b', 2, 6), runner('c', 3, 6)],
      duration: 6.2,
    }

    expect(placingsOf(simulation).map((placing) => placing.horseId)).toEqual(['b', 'c', 'a'])
  })
})

describe('rankAt', () => {
  const simulation = simulateRound(round, horsesById, createRng(5))

  it('orders the runners by distance covered at any moment', () => {
    for (const time of [1, simulation.duration / 3, simulation.duration / 2]) {
      const distances = rankAt(simulation, time).map((runner) => distanceAt(runner, time))
      expect(distances).toEqual([...distances].sort((a, b) => b - a))
      expect(distances).toHaveLength(10)
    }
  })

  it('ends in the finishing order and starts with the eventual winner', () => {
    const ids = (runners: readonly { horseId: string }[]) => runners.map((runner) => runner.horseId)
    const placings = placingsOf(simulation)

    expect(ids(rankAt(simulation, simulation.duration))).toEqual(ids(placings))
    expect(rankAt(simulation, 0)[0]!.horseId).toBe(placings[0]!.horseId)
  })

  it('keeps a finished runner ahead of those still running', () => {
    const [first, second] = placingsOf(simulation)
    const justAfter = first!.finishTime + (second!.finishTime - first!.finishTime) / 2

    expect(rankAt(simulation, justAfter)[0]!.horseId).toBe(first!.horseId)
  })

  it('leaves the simulation untouched', () => {
    const lanes = simulation.runners.map((runner) => runner.lane)
    rankAt(simulation, simulation.duration / 2)
    expect(simulation.runners.map((runner) => runner.lane)).toEqual(lanes)
  })
})

describe('leaderAt', () => {
  const simulation = simulateRound(round, horsesById, createRng(1923))

  it('picks the runner furthest ahead', () => {
    for (const time of [5, 30, 60, 90]) {
      const leader = leaderAt(simulation, time)!
      const best = Math.max(...simulation.runners.map((runner) => distanceAt(runner, time)))
      expect(distanceAt(leader, time)).toBe(best)
    }
  })

  it('names the eventual winner when the field is level', () => {
    const [winner] = placingsOf(simulation)
    expect(leaderAt(simulation, 0)!.horseId).toBe(winner!.horseId)
    expect(leaderAt(simulation, simulation.duration)!.horseId).toBe(winner!.horseId)
  })
})
