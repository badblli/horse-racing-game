import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { createRoster } from '@/features/horses/model/create-roster'
import { createRng, deriveSeed } from '@/shared/lib/random'

import SchedulePanel from '../components/SchedulePanel.vue'
import { createSchedule } from '../model/create-schedule'
import type { RoundState } from '../model/round'

const roster = createRoster(createRng(deriveSeed(1923, 'roster')))
const horsesById = new Map(roster.map((horse) => [horse.id, horse]))
const rounds = createSchedule(roster, createRng(deriveSeed(1923, 'schedule:1')))

function mountPanel(roundStates: RoundState[], winners: (string | null)[] = []) {
  return mount(SchedulePanel, { props: { rounds, roundStates, winners, horsesById } })
}

const rows = (panel: ReturnType<typeof mountPanel>) => panel.findAll('button')
const expanded = (panel: ReturnType<typeof mountPanel>) =>
  rows(panel).map((row) => row.attributes('aria-expanded'))

describe('SchedulePanel', () => {
  it('asks for a schedule when there is none', () => {
    const panel = mount(SchedulePanel, {
      props: { rounds: [], roundStates: [], winners: [], horsesById },
    })

    expect(panel.text()).toContain('Generate a schedule to see the six rounds')
    expect(panel.find('ol').exists()).toBe(false)
  })

  it('lists six rounds with distance and state', () => {
    const winner = rounds[0]!.horseIds[0]!
    const panel = mountPanel(
      ['done', 'racing', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      [winner],
    )
    const text = rows(panel).map((row) => [row.get('.name').text(), row.get('.state').text()])

    expect(text).toHaveLength(6)
    expect(text[0]).toEqual(['Round 1 1,200 m', `${horsesById.get(winner)!.name} won`])
    expect(text[1]).toEqual(['Round 2 1,400 m', 'Racing'])
    expect(text[5]).toEqual(['Round 6 2,200 m', 'Upcoming'])
    expect(panel.text()).toContain('1 of 6 complete')
  })

  it('keeps every round closed until the user opens one', () => {
    const panel = mountPanel(['done', 'racing', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])

    expect(expanded(panel).every((value) => value === 'false')).toBe(true)
    expect(panel.find('ul').exists()).toBe(false)
  })

  it('shows an opened round with its ten horses in lane order', async () => {
    const panel = mountPanel(['done', 'next', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])
    await rows(panel)[1]!.trigger('click')

    const lineup = panel.findAll('ul li').map((item) => item.text())
    expect(lineup).toHaveLength(10)
    expect(lineup[0]).toBe(`1${horsesById.get(rounds[1]!.horseIds[0]!)!.name}`)
  })

  it('opens one round at a time and closes it on a second click', async () => {
    const panel = mountPanel(['racing', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])

    await rows(panel)[1]!.trigger('click')
    await rows(panel)[3]!.trigger('click')
    expect(expanded(panel)).toEqual(['false', 'false', 'false', 'true', 'false', 'false'])

    await rows(panel)[3]!.trigger('click')
    expect(expanded(panel)).toEqual(['false', 'false', 'false', 'false', 'false', 'false'])
  })

  it('closes the open round after a new schedule', async () => {
    const panel = mountPanel(['racing', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])
    await rows(panel)[4]!.trigger('click')

    const next = createSchedule(roster, createRng(deriveSeed(1923, 'schedule:2')))
    await panel.setProps({
      rounds: next,
      roundStates: ['next', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
    })

    expect(expanded(panel).every((value) => value === 'false')).toBe(true)
  })
})
