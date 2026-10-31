import { describe, it, expect } from 'vitest'

import { formatDistance, formatRaceTime } from '../lib/format'

describe('formatDistance', () => {
  it.each([
    [1200, '1,200 m'],
    [1600, '1,600 m'],
    [2200, '2,200 m'],
    [100, '100 m'],
  ])('formats %d as %s', (meters, expected) => {
    expect(formatDistance(meters)).toBe(expected)
  })
})

describe('formatRaceTime', () => {
  it.each([
    [97.84, '1:37.84'],
    [133.4, '2:13.40'],
    [72.051, '1:12.05'],
    [0, '0:00.00'],
    [59.996, '1:00.00'],
  ])('formats %s s as %s', (seconds, expected) => {
    expect(formatRaceTime(seconds)).toBe(expected)
  })

  it('rejects negative and non-finite times', () => {
    expect(() => formatRaceTime(-1)).toThrow(RangeError)
    expect(() => formatRaceTime(Number.NaN)).toThrow(RangeError)
    expect(() => formatRaceTime(Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })
})
