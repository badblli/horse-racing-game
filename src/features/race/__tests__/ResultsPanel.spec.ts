import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { useHorsesStore } from '@/features/horses/store'
import { formatRaceTime } from '@/shared/lib/format'

import ResultsPanel from '../components/ResultsPanel.vue'
import { useRaceStore } from '../store'

function mountPanel() {
  const race = useRaceStore()
  race.startSession(1923)
  const panel = mount(ResultsPanel)
  return {
    race,
    panel,
    picker: () => panel.findAll('[role="group"] button'),
    meta: () => panel.get('.meta').text(),
    winner: () => panel.get('[data-testid="winner"]').text(),
  }
}

/** Runs rounds to their results, as the race clock would. */
function runRounds(race: ReturnType<typeof useRaceStore>, count: number) {
  for (let i = 0; i < count; i++) {
    race.completeRound(race.currentRoundIndex)
    race.advanceRound()
  }
}

describe('ResultsPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('says when results will appear before any round ends', async () => {
    const { race, panel } = mountPanel()
    expect(panel.text()).toContain('finishing order appears here')

    race.generate()
    race.start()
    await panel.vm.$nextTick()

    expect(panel.text()).toContain('finishing order appears here')
    expect(panel.find('[role="group"]').exists()).toBe(false)
  })

  it('lists all ten places of the latest round with the winner first', async () => {
    const { race, panel, meta, winner } = mountPanel()
    const horses = useHorsesStore()
    race.generate()
    race.start()
    runRounds(race, 1)
    await panel.vm.$nextTick()

    const [first, ...rest] = race.results[0]!.placings
    expect(meta()).toBe('Round 1 · 1,200 m')
    expect(winner()).toContain(horses.horsesById.get(first!.horseId)!.name)
    expect(winner()).toContain(formatRaceTime(first!.finishTime))

    const places = panel.findAll('.places li')
    expect(places).toHaveLength(9)
    expect(places.map((place) => place.get('.position').text())).toEqual(
      rest.map((placing) => String(placing.position)),
    )
  })

  it('follows each new result and lets earlier rounds be picked', async () => {
    const { race, panel, picker, meta } = mountPanel()
    race.generate()
    race.start()
    runRounds(race, 3)
    await panel.vm.$nextTick()

    expect(meta()).toContain('Round 3')
    expect(picker().map((button) => button.attributes('disabled') !== undefined)).toEqual([
      false,
      false,
      false,
      true,
      true,
      true,
    ])
    expect(picker()[2]!.attributes('aria-pressed')).toBe('true')

    await picker()[0]!.trigger('click')
    expect(meta()).toContain('Round 1')
    expect(picker()[0]!.attributes('aria-pressed')).toBe('true')

    // A picked round stays put while the race goes on.
    runRounds(race, 1)
    await panel.vm.$nextTick()
    expect(meta()).toContain('Round 1')

    // Picking the latest round follows the race again.
    await picker()[3]!.trigger('click')
    runRounds(race, 1)
    await panel.vm.$nextTick()
    expect(meta()).toContain('Round 5')
  })

  it('starts over when a new schedule is generated', async () => {
    const { race, panel, picker } = mountPanel()
    race.generate()
    race.start()
    runRounds(race, 6)
    await panel.vm.$nextTick()
    await picker()[1]!.trigger('click')

    race.generate()
    await panel.vm.$nextTick()
    expect(panel.text()).toContain('finishing order appears here')

    race.start()
    runRounds(race, 1)
    await panel.vm.$nextTick()
    expect(panel.get('.meta').text()).toContain('Round 1')
    expect(picker()[0]!.attributes('aria-pressed')).toBe('true')
  })
})
