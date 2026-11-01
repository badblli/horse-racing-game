import { describe, it, expect } from 'vitest'

import {
  DARK_INK,
  LIGHT_INK,
  contrastRatio,
  readableInk,
  readableText,
  relativeLuminance,
} from '../lib/color'

describe('relativeLuminance', () => {
  it('runs from 0 for black to 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBe(1)
  })
})

describe('contrastRatio', () => {
  it('matches the WCAG extremes and is symmetric', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21)
    expect(contrastRatio('#A12B3A', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#A12B3A'), 9)
  })

  it('confirms the accent reads with white text', () => {
    expect(contrastRatio('#A12B3A', '#FFFFFF')).toBeGreaterThan(7)
  })
})

describe('readableInk', () => {
  it.each([
    ['#FFFFFF', DARK_INK],
    ['#F2D53C', DARK_INK],
    ['#1D1D1F', LIGHT_INK],
    ['#1E3A8A', LIGHT_INK],
  ])('uses the stronger ink on %s', (background, ink) => {
    expect(readableInk(background)).toBe(ink)
  })
})

describe('readableText', () => {
  it.each(['#FFFFFF', '#F2D53C', '#9BC53D'])('makes %s readable on white', (hex) => {
    expect(contrastRatio(readableText(hex), LIGHT_INK)).toBeGreaterThanOrEqual(4.5)
  })

  it('leaves a color that already reads alone', () => {
    expect(readableText('#1E3A8A')).toBe('#1e3a8a')
  })

  it('darkens a light color no further than it needs', () => {
    const text = readableText('#F2D53C')

    expect(text).not.toBe('#f2d53c')
    expect(contrastRatio(text, LIGHT_INK)).toBeLessThan(5)
  })

  it('reads against the background it is given', () => {
    expect(contrastRatio(readableText('#F2D53C', '#F7EBED'), '#F7EBED')).toBeGreaterThanOrEqual(4.5)
  })
})
