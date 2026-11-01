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

  it('opens on the track', () => {
    const { activePanel } = mountApp()
    expect(activePanel()).toEqual(['panel-race'])
  })

  it('keeps the tab the user picked while the race runs', async () => {
    const { race, wrapper, activePanel } = mountApp()
    race.generate()
    race.start()
    await wrapper.vm.$nextTick()
    await wrapper.get('#tab-horses').trigger('click')
    expect(activePanel()).toEqual(['panel-horses'])

    race.completeRound(0)
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-horses'])
  })

  it('returns to the track on a new schedule and when the race starts', async () => {
    const { race, wrapper, activePanel } = mountApp()
    await wrapper.get('#tab-results').trigger('click')
    race.generate()
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-race'])

    await wrapper.get('#tab-schedule').trigger('click')
    race.start()
    await wrapper.vm.$nextTick()
    expect(activePanel()).toEqual(['panel-race'])
  })
})
