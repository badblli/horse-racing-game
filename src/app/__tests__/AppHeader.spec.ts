import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

describe('AppHeader', () => {
  it('links to the author in a new tab', () => {
    const links = mount(AppHeader).findAll('nav a')

    expect(links.map((link) => link.attributes('href'))).toEqual([
      'https://github.com/badblli',
      'https://badblli.dev',
    ])
    expect(links.map((link) => link.text())).toEqual(['GitHub', 'badblli.dev'])
    for (const link of links) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
  })
})
