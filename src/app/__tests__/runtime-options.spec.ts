import { describe, it, expect } from 'vitest'

import { PLAYBACK_RATE } from '@/features/race/composables/useRaceClock'

import { readRuntimeOptions } from '../runtime-options'

describe('readRuntimeOptions', () => {
  it('ignores ?seed and ?rate outside the e2e build', () => {
    const options = readRuntimeOptions('?seed=1923&rate=60', false)

    expect(options.rate).toBe(PLAYBACK_RATE)
    expect(Number.isInteger(options.seed)).toBe(true)
    expect(options.seed).toBeGreaterThanOrEqual(0)
  })

  it('reads ?seed and ?rate in the e2e build', () => {
    expect(readRuntimeOptions('?seed=1923&rate=60', true)).toEqual({
      seed: 1923,
      rate: 60,
      restore: false,
    })
  })

  it('restores a saved race unless a test fixes the seed', () => {
    expect(readRuntimeOptions('', false).restore).toBe(true)
    expect(readRuntimeOptions('?seed=1923', false).restore).toBe(true)
    expect(readRuntimeOptions('?rate=60', true).restore).toBe(true)
  })

  it('falls back to defaults for missing or invalid values', () => {
    for (const search of [
      '',
      '?seed=&rate=',
      '?seed=abc&rate=-2',
      '?seed=1.5&rate=0',
      '?seed=-1&rate=Infinity',
    ]) {
      const options = readRuntimeOptions(search, true)
      expect(options.rate).toBe(PLAYBACK_RATE)
      expect(Number.isInteger(options.seed)).toBe(true)
      expect(options.seed).toBeGreaterThanOrEqual(0)
    }
  })
})
