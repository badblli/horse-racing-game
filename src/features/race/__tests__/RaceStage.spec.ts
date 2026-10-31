import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import RaceStage from '../components/RaceStage.vue'
import { useRaceStore } from '../store'

function mountStage() {
  const race = useRaceStore()
  race.startSession(1923)
  const wrapper = mount(RaceStage)
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
    // The clock asks for animation frames once a race runs; none are needed here.
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
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
})
