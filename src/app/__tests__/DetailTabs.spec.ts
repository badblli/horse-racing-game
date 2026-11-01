import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import DetailTabs from '../DetailTabs.vue'

const tabsOf = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('[role="tab"]')

describe('DetailTabs', () => {
  it('marks the active tab and keeps only it in the tab order', () => {
    const wrapper = mount(DetailTabs, { props: { active: 'results' } })
    const tabs = tabsOf(wrapper)

    expect(tabs.map((tab) => tab.text())).toEqual(['Race', 'Schedule', 'Results', 'Horses'])
    expect(tabs.map((tab) => tab.attributes('aria-selected'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ])
    expect(tabs.map((tab) => tab.attributes('tabindex'))).toEqual(['-1', '-1', '0', '-1'])
    expect(tabs[2]!.attributes('aria-controls')).toBe('panel-results')
  })

  it('selects a tab on click', async () => {
    const wrapper = mount(DetailTabs, { props: { active: 'schedule' } })
    await tabsOf(wrapper)[3]!.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['horses']])
  })

  it('moves between tabs with the arrow, Home and End keys', async () => {
    const wrapper = mount(DetailTabs, { props: { active: 'race' } })
    const [race, , , horses] = tabsOf(wrapper)

    await race!.trigger('keydown', { key: 'ArrowRight' })
    await race!.trigger('keydown', { key: 'ArrowLeft' })
    await horses!.trigger('keydown', { key: 'ArrowRight' })
    await horses!.trigger('keydown', { key: 'Home' })
    await race!.trigger('keydown', { key: 'End' })
    await race!.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')).toEqual([
      ['schedule'],
      ['horses'],
      ['race'],
      ['race'],
      ['horses'],
    ])
  })
})
