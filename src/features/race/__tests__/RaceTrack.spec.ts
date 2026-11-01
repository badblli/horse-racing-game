import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import type { Horse } from '@/features/horses/model/horse'

import LaneKey from '../components/LaneKey.vue'
import RaceTrack from '../components/RaceTrack.vue'
import type { TrackLane } from '../model/race'

const horse = (n: number): Horse => ({
  id: `horse-${n}`,
  name: `Horse ${n}`,
  color: { name: 'Blue', hex: '#2563EB' },
  condition: 50,
})

const lane = (n: number, overrides: Partial<TrackLane> = {}): TrackLane => ({
  lane: n,
  horse: horse(n),
  progress: 0,
  place: null,
  isLeader: false,
  galloping: false,
  ...overrides,
})

describe('RaceTrack', () => {
  it('shows ten empty lanes and a note before a schedule exists', () => {
    const track = mount(RaceTrack, { props: { lanes: [], phase: 'idle' } })

    expect(track.findAll('li')).toHaveLength(10)
    expect(track.findAll('svg')).toHaveLength(0)
    expect(track.text()).toContain('No race scheduled')
  })

  it('places each horse by its progress along the run', () => {
    const track = mount(RaceTrack, {
      props: { lanes: [lane(1, { progress: 0 }), lane(2, { progress: 0.5 })], phase: 'running' },
    })
    const movers = track.findAll('.mover')

    expect(movers[0]!.attributes('style')).toContain('--progress: 0')
    expect(movers[1]!.attributes('style')).toContain('--progress: 0.5')
    expect(track.text()).toContain('Horse 2')
  })

  it('passes galloping to the horse and bolds the leader', () => {
    const track = mount(RaceTrack, {
      props: { lanes: [lane(1, { galloping: true, isLeader: true }), lane(2)], phase: 'running' },
    })
    const [first, second] = track.findAll('li')

    expect(first!.get('svg').classes()).toContain('galloping')
    expect(second!.get('svg').classes()).not.toContain('galloping')
    expect(first!.classes()).toContain('emphasised')
    expect(second!.classes()).not.toContain('emphasised')
  })

  it('gives the leader the first-place badge and no number to the rest', () => {
    const track = mount(RaceTrack, {
      props: { lanes: [lane(1), lane(2, { isLeader: true })], phase: 'running' },
    })
    const places = track.findAll('[data-testid="place"]')

    expect(places.map((place) => place.text())).toEqual(['', '1'])
    expect(places[1]!.classes()).toContain('first')
    expect(places[0]!.classes()).not.toContain('first')
  })

  it('shows the finishing places and marks the winner', () => {
    const track = mount(RaceTrack, {
      props: { lanes: [lane(1, { place: 2 }), lane(2, { place: 1 })], phase: 'running' },
    })
    const places = track.findAll('[data-testid="place"]')

    expect(places.map((place) => place.text())).toEqual(['2', '1'])
    expect(places[1]!.classes()).toContain('first')
  })

  it('freezes and dims the field while paused', () => {
    const track = mount(RaceTrack, { props: { lanes: [lane(1)], phase: 'paused' } })
    expect(track.classes()).toContain('paused')
  })
})

describe('LaneKey', () => {
  it('names every runner by lane before the race', () => {
    const key = mount(LaneKey, { props: { lanes: [lane(1), lane(2)], ranked: false } })
    const items = key.findAll('li')

    expect(key.get('ol').attributes('aria-label')).toBe('Runners by lane')
    expect(items.map((item) => item.text())).toEqual(['1Horse 1', '2Horse 2'])
    expect(key.find('.position').exists()).toBe(false)
  })

  it('numbers the runners by position in a race, keeping their lane chips', () => {
    const key = mount(LaneKey, { props: { lanes: [lane(7), lane(2)], ranked: true } })
    const items = key.findAll('li')

    expect(key.get('ol').attributes('aria-label')).toBe('Runners in their current order')
    expect(items.map((item) => item.text())).toEqual(['17Horse 7', '22Horse 2'])
    expect(items[0]!.classes()).toContain('leading')
    expect(items[1]!.classes()).not.toContain('leading')
  })

  it('renders nothing before a schedule exists', () => {
    expect(
      mount(LaneKey, { props: { lanes: [], ranked: false } })
        .find('ol')
        .exists(),
    ).toBe(false)
  })
})
