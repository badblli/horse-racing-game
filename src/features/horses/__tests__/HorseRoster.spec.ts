import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { createRng, deriveSeed } from '@/shared/lib/random'

import HorseRoster from '../components/HorseRoster.vue'
import { createRoster } from '../model/create-roster'

const roster = createRoster(createRng(deriveSeed(1923, 'roster')))

function mountRoster(laneByHorse = new Map<string, number>(), roundNumber: number | null = null) {
  return mount(HorseRoster, { props: { horses: roster, laneByHorse, roundNumber } })
}

const rows = (wrapper: ReturnType<typeof mountRoster>) => wrapper.findAll('tbody tr')

describe('HorseRoster', () => {
  it('lists all twenty horses with number, name, color and condition', () => {
    const wrapper = mountRoster()
    const first = rows(wrapper)[0]!
      .findAll('td')
      .map((cell) => cell.text())
    const horse = roster[0]!

    expect(rows(wrapper)).toHaveLength(20)
    expect(first.slice(0, 4)).toEqual(['01', horse.name, horse.color.name, String(horse.condition)])
    expect(rows(wrapper)[19]!.get('td').text()).toBe('20')
    expect(wrapper.text()).toContain('20 horses · condition 1–100')
  })

  it('shows no lanes when no round is lined up', () => {
    const wrapper = mountRoster()
    const lanes = wrapper.findAll('[data-testid="lane"]')

    expect(lanes.every((lane) => lane.text() === '—')).toBe(true)
    expect(wrapper.get('thead th:last-child').text()).toBe('Lane')
  })

  it('shows the lane of each horse running in the current round', () => {
    const laneByHorse = new Map([
      [roster[2]!.id, 1],
      [roster[15]!.id, 10],
    ])
    const wrapper = mountRoster(laneByHorse, 4)
    const lanes = wrapper.findAll('[data-testid="lane"]').map((lane) => lane.text())

    expect(lanes[2]).toBe('Lane 1')
    expect(lanes[15]).toBe('Lane 10')
    expect(lanes.filter((lane) => lane === '—')).toHaveLength(18)
    expect(wrapper.get('thead th:last-child').text()).toBe('Round 4')
    expect(wrapper.text()).toContain('20 horses · 2 run in round 4')
  })
})
