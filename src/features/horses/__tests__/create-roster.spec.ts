import { describe, it, expect } from 'vitest'

import { contrastRatio, readableInk } from '@/shared/lib/color'
import { createRng, deriveSeed } from '@/shared/lib/random'

import { createRoster } from '../model/create-roster'
import { HORSE_COLORS } from '../model/horse-colors'
import { NAME_POOL } from '../model/name-pool'

function rosterFor(seed: number) {
  return createRoster(createRng(deriveSeed(seed, 'roster')))
}

describe('name pool and palette', () => {
  it('has 36 distinct, non-empty names', () => {
    expect(NAME_POOL).toHaveLength(36)
    expect(new Set(NAME_POOL).size).toBe(36)
    expect(NAME_POOL.every((name) => name.trim() === name && name.length > 0)).toBe(true)
  })

  it('has 20 distinct named colors', () => {
    expect(HORSE_COLORS).toHaveLength(20)
    expect(new Set(HORSE_COLORS.map((color) => color.hex)).size).toBe(20)
    expect(new Set(HORSE_COLORS.map((color) => color.name)).size).toBe(20)
    expect(HORSE_COLORS.every((color) => /^#[0-9A-F]{6}$/.test(color.hex))).toBe(true)
  })
})

describe('createRoster', () => {
  const roster = rosterFor(1923)

  it('creates exactly 20 horses', () => {
    expect(roster).toHaveLength(20)
  })

  it('numbers the ids from horse-01 to horse-20, independent of the names', () => {
    expect(roster.map((horse) => horse.id)).toEqual(
      Array.from({ length: 20 }, (_, i) => `horse-${String(i + 1).padStart(2, '0')}`),
    )
  })

  it('uses 20 unique names, all from the pool', () => {
    const names = roster.map((horse) => horse.name)
    expect(new Set(names).size).toBe(20)
    expect(names.every((name) => NAME_POOL.includes(name))).toBe(true)
  })

  it('gives every horse its own color from the palette', () => {
    const hexes = roster.map((horse) => horse.color.hex)
    expect(new Set(hexes).size).toBe(20)
    expect(roster.every((horse) => HORSE_COLORS.includes(horse.color))).toBe(true)
  })

  it('keeps conditions as integers from 1 to 100 across 1,000 seeds', () => {
    const conditions = Array.from({ length: 1_000 }, (_, seed) => rosterFor(seed)).flatMap(
      (horses) => horses.map((horse) => horse.condition),
    )

    expect(conditions.every(Number.isInteger)).toBe(true)
    expect(Math.min(...conditions)).toBe(1)
    expect(Math.max(...conditions)).toBe(100)
  })

  it('gives the same roster for the same seed', () => {
    expect(rosterFor(1923)).toEqual(roster)
  })

  it('freezes the roster and each horse', () => {
    expect(Object.isFrozen(roster)).toBe(true)
    expect(roster.every((horse) => Object.isFrozen(horse) && Object.isFrozen(horse.color))).toBe(
      true,
    )
  })
})

describe('palette legibility', () => {
  it('keeps every chip number readable with the chosen ink', () => {
    for (const color of HORSE_COLORS) {
      expect(contrastRatio(color.hex, readableInk(color.hex))).toBeGreaterThanOrEqual(3)
    }
  })
})
