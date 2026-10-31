import { describe, it, expect } from 'vitest'

import {
  createRng,
  deriveSeed,
  randomInt,
  randomSeed,
  sampleWithoutReplacement,
  shuffle,
  type Rng,
} from '../lib/random'

function draw(rng: Rng, count: number): number[] {
  return Array.from({ length: count }, () => rng())
}

describe('createRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(draw(createRng(1923), 50)).toEqual(draw(createRng(1923), 50))
  })

  it('gives different sequences for different seeds', () => {
    expect(draw(createRng(1), 10)).not.toEqual(draw(createRng(2), 10))
  })

  it('stays within [0, 1)', () => {
    const values = draw(createRng(7), 10_000)
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
  })
})

describe('deriveSeed', () => {
  it('is deterministic', () => {
    expect(deriveSeed(1923, 'roster')).toBe(deriveSeed(1923, 'roster'))
  })

  it('gives each stream its own seed', () => {
    const streams = ['roster', 'schedule:1', 'schedule:2', 'round:1:0', 'round:1:1', 'round:2:0']
    const seeds = streams.map((stream) => deriveSeed(1923, stream))
    expect(new Set(seeds).size).toBe(streams.length)
  })

  it('depends on the session seed', () => {
    expect(deriveSeed(1, 'roster')).not.toBe(deriveSeed(2, 'roster'))
  })

  it('keeps streams independent of each other', () => {
    const alone = draw(createRng(deriveSeed(1923, 'roster')), 20)

    const roster = createRng(deriveSeed(1923, 'roster'))
    const schedule = createRng(deriveSeed(1923, 'schedule:1'))
    const interleaved = Array.from({ length: 20 }, () => {
      draw(schedule, 3)
      return roster()
    })

    expect(interleaved).toEqual(alone)
  })

  it('returns an unsigned 32-bit integer', () => {
    const seed = deriveSeed(-5, 'roster')
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThanOrEqual(0xffffffff)
  })
})

describe('randomSeed', () => {
  it('returns an unsigned 32-bit integer', () => {
    const seed = randomSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThanOrEqual(0xffffffff)
  })
})

describe('randomInt', () => {
  it('returns integers that reach both inclusive bounds', () => {
    const rng = createRng(42)
    const values = Array.from({ length: 10_000 }, () => randomInt(rng, 1, 100))

    expect(values.every(Number.isInteger)).toBe(true)
    expect(Math.min(...values)).toBe(1)
    expect(Math.max(...values)).toBe(100)
  })

  it('handles a single-value range', () => {
    expect(randomInt(createRng(1), 5, 5)).toBe(5)
  })

  it('rejects invalid ranges', () => {
    expect(() => randomInt(createRng(1), 10, 1)).toThrow(RangeError)
    expect(() => randomInt(createRng(1), 0.5, 2)).toThrow(RangeError)
  })
})

describe('sampleWithoutReplacement', () => {
  const items = Array.from({ length: 36 }, (_, i) => `item-${i}`)

  it('picks the requested number of distinct items from the source', () => {
    const sample = sampleWithoutReplacement(items, 20, createRng(3))

    expect(sample).toHaveLength(20)
    expect(new Set(sample).size).toBe(20)
    expect(sample.every((item) => items.includes(item))).toBe(true)
  })

  it('is reproducible for the same seed', () => {
    expect(sampleWithoutReplacement(items, 10, createRng(9))).toEqual(
      sampleWithoutReplacement(items, 10, createRng(9)),
    )
  })

  it('does not change the source', () => {
    const before = [...items]
    sampleWithoutReplacement(items, 10, createRng(3))
    expect(items).toEqual(before)
  })

  it('allows an empty or full sample and rejects impossible counts', () => {
    expect(sampleWithoutReplacement(items, 0, createRng(1))).toEqual([])
    expect(sampleWithoutReplacement(items, 36, createRng(1))).toHaveLength(36)
    expect(() => sampleWithoutReplacement(items, 37, createRng(1))).toThrow(RangeError)
    expect(() => sampleWithoutReplacement(items, -1, createRng(1))).toThrow(RangeError)
  })

  it('can pick every item in every position', () => {
    const seen = new Set<string>()
    const rng = createRng(11)
    for (let i = 0; i < 2_000; i++) {
      seen.add(sampleWithoutReplacement(['a', 'b', 'c'], 3, rng).join(''))
    }
    expect(seen).toEqual(new Set(['abc', 'acb', 'bac', 'bca', 'cab', 'cba']))
  })
})

describe('shuffle', () => {
  it('returns a permutation of the source', () => {
    const items = Array.from({ length: 20 }, (_, i) => i)
    const shuffled = shuffle(items, createRng(5))

    expect(shuffled).not.toBe(items)
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items)
  })
})
