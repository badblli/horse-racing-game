import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import ColorChip from '../components/ColorChip.vue'

describe('ColorChip', () => {
  it('fills with the color and picks a readable ink', () => {
    const dark = mount(ColorChip, { props: { color: '#1E3A8A', label: 4 } })
    const light = mount(ColorChip, { props: { color: '#F2D53C', label: 7 } })

    expect(dark.text()).toBe('4')
    expect(dark.attributes('style')).toContain('background: rgb(30, 58, 138)')
    expect(dark.attributes('style')).toContain('color: rgb(255, 255, 255)')
    expect(light.attributes('style')).toContain('color: rgb(29, 29, 31)')
  })

  it('renders a neutral placeholder without a color', () => {
    const chip = mount(ColorChip, { props: { label: 3 } })

    expect(chip.classes()).toContain('empty')
    expect(chip.attributes('style')).toBeUndefined()
  })
})
