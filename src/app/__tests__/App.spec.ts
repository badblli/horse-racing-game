import { describe, it, expect } from 'vitest'
import { createPinia } from 'pinia'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the product name and the race stage', () => {
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })
    expect(wrapper.get('h1').text()).toBe('Cumhuriyet Cup')
    expect(wrapper.find('section[aria-label="Race"]').exists()).toBe(true)
  })
})
