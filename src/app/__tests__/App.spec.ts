import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { useRaceStore } from '@/features/race/store'
import App from '../App.vue'

function mountApp() {
  const race = useRaceStore()
  race.startSession(1923)
  const wrapper = mount(App)
  return {
    race,
    wrapper,
    activePanel: () =>
      wrapper
        .findAll('[data-testid="detail-panel"]')
        .filter((panel) => panel.classes('active'))
        .map((panel) => panel.attributes('id')),
  }
}

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // The race clock asks for animation frames once a race runs; none are needed here.
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the product name and the race stage', () => {
    const { wrapper } = mountApp()
    expect(wrapper.get('h1').text()).toBe('Cumhuriyet Cup')
    expect(wrapper.find('section[aria-label="Race"]').exists()).toBe(true)
  })

  it('brings results forward on mobile while a finished round holds the track', async () => {
    const { race, wrapper, activePanel } = mountApp()
    race.generate()
    race.start()
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-schedule'])

    race.completeRound(0)
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-results'])

    race.advanceRound()
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-schedule'])
  })

  it('keeps the tab the user picked until a new schedule', async () => {
    const { race, wrapper, activePanel } = mountApp()
    race.generate()
    race.start()
    await wrapper.vm.$nextTick()
    await wrapper.get('#tab-horses').trigger('click')
    expect(activePanel()).toEqual(['panel-horses'])

    race.completeRound(0)
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-horses'])

    race.pause()
    race.generate()
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-schedule'])
  })
})
