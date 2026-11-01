import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { useHorsesStore } from '@/features/horses/store'
import { readableText } from '@/shared/lib/color'

import RaceStage from '../components/RaceStage.vue'
import { leaderAt } from '../model/standings'
import { useRaceStore } from '../store'

function mountStage() {
  const race = useRaceStore()
  race.startSession(1923)
  const wrapper = mount(RaceStage, { props: { time: 0 } })
  const buttons = () => wrapper.findAll('button')
  return {
    race,
    wrapper,
    title: () => wrapper.get('h2').text(),
    status: () => wrapper.get('[data-testid="race-status"]').text(),
    announcement: () => wrapper.get('[role="status"]').text(),
    generate: () => buttons()[0]!,
    raceButton: () => buttons()[1]!,
  }
}

describe('RaceStage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('invites the user to generate a schedule', () => {
    const stage = mountStage()

    expect(stage.title()).toBe('No race scheduled')
    expect(stage.status()).toBe(
      'Generate a schedule to draw ten horses for each of the six rounds.',
    )
    expect(stage.raceButton().attributes('disabled')).toBeDefined()
  })

  it('shows round 1 after generating and starts it', async () => {
    const stage = mountStage()

    await stage.generate().trigger('click')
    expect(stage.title()).toBe('Round 1 of 6 · 1,200 m')
    expect(stage.status()).toBe('Ready. Ten horses are at the start.')
    expect(stage.announcement()).toBe('Schedule generated. Round 1 is ready to start.')

    await stage.raceButton().trigger('click')
    expect(stage.race.status).toBe('running')
    expect(stage.status()).toMatch(/^Racing · .+ leads$/)
    expect(stage.announcement()).toBe('Round 1 is running.')
    expect(stage.generate().attributes('disabled')).toBeDefined()
    expect(stage.raceButton().text()).toBe('Pause')
  })

  it('pauses and resumes from the same button', async () => {
    const stage = mountStage()
    await stage.generate().trigger('click')
    await stage.raceButton().trigger('click')

    await stage.raceButton().trigger('click')
    expect(stage.race.status).toBe('paused')
    expect(stage.status()).toMatch(/^Paused · .+ leads$/)
    expect(stage.raceButton().text()).toBe('Resume')
    expect(stage.generate().attributes('disabled')).toBeUndefined()

    await stage.raceButton().trigger('click')
    expect(stage.race.status).toBe('running')
  })

  it('names the winner once the round has a result', async () => {
    const stage = mountStage()
    stage.race.generate()
    stage.race.start()
    stage.race.completeRound(0)
    await stage.wrapper.vm.$nextTick()

    expect(stage.status()).toMatch(/^.+ wins round 1 in \d:\d\d\.\d\d\. Round 2 lines up next\.$/)
    expect(stage.announcement()).toMatch(/^.+ wins round 1 in \d:\d\d\.\d\d\.$/)
  })

  it('writes the leader and the winner in their own colors', async () => {
    const stage = mountStage()
    const horses = useHorsesStore()
    const name = () => stage.wrapper.get('[data-testid="race-status"] strong')
    const colorOf = (horseId: string) => {
      const swatch = document.createElement('span')
      swatch.style.color = readableText(horses.horsesById.get(horseId)!.color.hex)
      return swatch.style.color
    }

    stage.race.generate()
    stage.race.start()
    await stage.wrapper.setProps({ time: 5 })
    const leader = leaderAt(stage.race.currentSimulation!, 5)!
    expect((name().element as HTMLElement).style.color).toBe(colorOf(leader.horseId))

    stage.race.completeRound(0)
    await stage.wrapper.vm.$nextTick()
    const winner = stage.race.results[0]!.placings[0]!
    expect((name().element as HTMLElement).style.color).toBe(colorOf(winner.horseId))
  })

  it('places the horses by the race time it is given', async () => {
    const stage = mountStage()
    stage.race.generate()
    stage.race.start()
    await stage.wrapper.setProps({ time: 5 })

    const moved = stage.wrapper.findAll('.mover').map((mover) => mover.attributes('style')!)
    expect(moved.every((style) => !style.includes('--progress: 0;'))).toBe(true)
    expect(stage.wrapper.findAll('.galloping').length).toBeGreaterThan(0)
  })

  it('lines up the round on the track and shows places after the finish', async () => {
    const stage = mountStage()
    expect(stage.wrapper.findAll('.mover')).toHaveLength(0)

    await stage.generate().trigger('click')
    const movers = stage.wrapper.findAll('.mover')
    expect(movers).toHaveLength(10)
    expect(movers.every((mover) => mover.attributes('style')!.includes('--progress: 0'))).toBe(true)
    expect(stage.wrapper.findAll('svg.galloping')).toHaveLength(0)

    stage.race.start()
    stage.race.completeRound(0)
    await stage.wrapper.vm.$nextTick()
    const places = stage.wrapper.findAll('[data-testid="place"]').map((place) => place.text())
    expect([...places].sort((a, b) => Number(a) - Number(b))).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ])
  })
})
