import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import RaceControls from '../components/RaceControls.vue'
import type { RaceAction } from '../model/lifecycle'

function mountControls(canGenerate: boolean, primaryAction: RaceAction | null) {
  const wrapper = mount(RaceControls, { props: { canGenerate, primaryAction } })
  const [generate, race] = wrapper.findAll('button')
  return { wrapper, generate: generate!, race: race! }
}

describe('RaceControls', () => {
  it.each<[string, boolean, RaceAction | null, string, boolean, boolean]>([
    // status, canGenerate, primaryAction, race label, race enabled, generate is primary
    ['idle', true, null, 'Start race', false, true],
    ['ready', true, 'start', 'Start race', true, false],
    ['running', false, 'pause', 'Pause', true, false],
    ['paused', true, 'resume', 'Resume', true, false],
    ['finished', true, null, 'Start race', false, true],
  ])('%s', (_, canGenerate, primaryAction, label, raceEnabled, generatePrimary) => {
    const { generate, race } = mountControls(canGenerate, primaryAction)

    expect(generate.text()).toBe('Generate schedule')
    expect(generate.attributes('disabled')).toBe(canGenerate ? undefined : '')
    expect(race.text()).toBe(label)
    expect(race.attributes('disabled')).toBe(raceEnabled ? undefined : '')
    expect(generate.classes('primary')).toBe(generatePrimary)
    expect(race.classes('primary')).toBe(!generatePrimary)
  })

  it.each<[RaceAction]>([['start'], ['pause'], ['resume']])(
    'emits %s from the race button',
    async (action) => {
      const { wrapper, race } = mountControls(true, action)
      await race.trigger('click')
      expect(Object.keys(wrapper.emitted())).toContain(action)
    },
  )

  it('emits generate', async () => {
    const { wrapper, generate } = mountControls(true, null)
    await generate.trigger('click')
    expect(wrapper.emitted('generate')).toHaveLength(1)
  })
})
