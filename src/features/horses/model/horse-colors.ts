import type { HorseColor } from './horse'

/** One distinct color per horse; the roster shuffles all 20. */
export const HORSE_COLORS: readonly HorseColor[] = Object.freeze(
  [
    { name: 'Red', hex: '#E03C31' },
    { name: 'Orange', hex: '#F08A24' },
    { name: 'Amber', hex: '#E9B10A' },
    { name: 'Yellow', hex: '#F2D53C' },
    { name: 'Lime', hex: '#9BC53D' },
    { name: 'Green', hex: '#2E9E5B' },
    { name: 'Teal', hex: '#179E94' },
    { name: 'Cyan', hex: '#23B5D3' },
    { name: 'Sky', hex: '#5AA9E6' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Indigo', hex: '#5B4FD6' },
    { name: 'Purple', hex: '#8B3FD0' },
    { name: 'Magenta', hex: '#C2349B' },
    { name: 'Pink', hex: '#F06BA8' },
    { name: 'Brown', hex: '#8A5A3B' },
    { name: 'Tan', hex: '#C9A27C' },
    { name: 'Gray', hex: '#8E8E93' },
    { name: 'Black', hex: '#1D1D1F' },
    { name: 'White', hex: '#FFFFFF' },
  ].map((color) => Object.freeze(color)),
)
