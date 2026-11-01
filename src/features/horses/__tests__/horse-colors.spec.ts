import { describe, it, expect } from 'vitest'

import { LIGHT_INK, contrastRatio, readableText } from '@/shared/lib/color'

import { HORSE_COLORS } from '../model/horse-colors'

describe('HORSE_COLORS', () => {
  it.each(HORSE_COLORS.map((color) => [color.name, color.hex]))(
    'keeps %s readable as text on white',
    (_name, hex) => {
      expect(contrastRatio(readableText(hex!), LIGHT_INK)).toBeGreaterThanOrEqual(4.5)
    },
  )
})
