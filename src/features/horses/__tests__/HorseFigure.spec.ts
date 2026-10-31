import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import HorseFigure from '../components/HorseFigure.vue'

describe('HorseFigure', () => {
  it('carries the lane number on a saddle cloth in the horse color', () => {
    const horse = mount(HorseFigure, { props: { color: '#F2D53C', lane: 7, galloping: false } })

    expect(horse.get('text').text()).toBe('7')
    expect(horse.get('text').attributes('fill')).toBe('#1D1D1F')
    expect(horse.get('rect').attributes('fill')).toBe('#F2D53C')
  })

  it('draws four two-segment legs', () => {
    const horse = mount(HorseFigure, { props: { color: '#2563EB', lane: 1, galloping: false } })

    expect(horse.findAll('.hind-upper')).toHaveLength(2)
    expect(horse.findAll('.fore-upper')).toHaveLength(2)
    expect(horse.findAll('.hind-lower, .fore-lower')).toHaveLength(4)
  })

  it('gallops only when asked to', async () => {
    const horse = mount(HorseFigure, { props: { color: '#2563EB', lane: 1, galloping: false } })
    expect(horse.classes()).not.toContain('galloping')

    await horse.setProps({ galloping: true })
    expect(horse.classes()).toContain('galloping')
  })

  it('is decorative for assistive technology', () => {
    const horse = mount(HorseFigure, { props: { color: '#2563EB', lane: 1, galloping: false } })
    expect(horse.attributes('aria-hidden')).toBe('true')
  })
})
