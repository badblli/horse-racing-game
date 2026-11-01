import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { useHorsesStore } from '@/features/horses/store'
import { formatRaceTime } from '@/shared/lib/format'

import ResultsPanel from '../components/ResultsPanel.vue'
import { rankAt } from '../model/standings'
import { useRaceStore } from '../store'

function mountPanel() {
  const race = useRaceStore()
  race.startSession(1923)
  const panel = mount(ResultsPanel, { props: { time: 0 } })
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
    expect(panel.text()).toContain('appears here live')

    race.generate()
    race.start()
    await panel.vm.$nextTick()

    expect(panel.text()).toContain('appears here live')
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
    expect(panel.get('.pill').attributes('style')).toContain('--index: 2')

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

  describe('while a round runs', () => {
    const names = (panel: ReturnType<typeof mountPanel>['panel']) =>
      panel.findAll('.order .name').map((name) => name.text())

    it('shows the live order, without times, for the round on the track', async () => {
      const { race, panel, picker, meta } = mountPanel()
      const horses = useHorsesStore()
      race.generate()
      race.start()
      await panel.setProps({ time: 20 })

      const expected = rankAt(race.currentSimulation!, 20).map(
        (runner) => horses.horsesById.get(runner.horseId)!.name,
      )
      expect(meta()).toBe('Round 1 · 1,200 m · Live')
      expect(names(panel)).toEqual(expected)
      expect(panel.findAll('.order li').map((row) => row.get('.position').text())).toEqual(
        Array.from({ length: 10 }, (_, index) => String(index + 1)),
      )
      expect(panel.find('.time').exists()).toBe(false)
      expect(panel.find('[data-testid="winner"]').exists()).toBe(false)
      expect(picker()[0]!.attributes('aria-pressed')).toBe('true')
    })

    it('follows the order as the race time moves on', async () => {
      const { race, panel } = mountPanel()
      race.generate()
      race.start()
      await panel.setProps({ time: 1 })
      const early = names(panel)

      const finished = race.currentSimulation!.duration
      await panel.setProps({ time: finished })
      expect(names(panel)).not.toEqual(early)
    })

    it('keeps the order but says it is paused', async () => {
      const { race, panel, meta } = mountPanel()
      race.generate()
      race.start()
      await panel.setProps({ time: 20 })

      race.pause()
      await panel.vm.$nextTick()
      expect(meta()).toBe('Round 1 · 1,200 m · Paused')
      expect(panel.findAll('.order li')).toHaveLength(10)
      expect(panel.get('.live-dot').classes()).toContain('held')
    })

    it('gives way to the final result as soon as the round ends', async () => {
      const { race, panel, meta, winner } = mountPanel()
      race.generate()
      race.start()
      await panel.setProps({ time: 20 })

      race.completeRound(0)
      await panel.vm.$nextTick()
      expect(panel.find('.order').exists()).toBe(false)
      expect(meta()).toBe('Round 1 · 1,200 m')
      expect(winner()).toContain('Winner')
      expect(panel.findAll('.places .time')).toHaveLength(9)
    })

    it('lets an earlier round be read, then returns to the live order', async () => {
      const { race, panel, picker, meta } = mountPanel()
      race.generate()
      race.start()
      runRounds(race, 1)
      await panel.setProps({ time: 20 })
      expect(meta()).toContain('Round 2 · 1,400 m · Live')
      expect(picker()[1]!.attributes('disabled')).toBeUndefined()
      expect(picker()[2]!.attributes('disabled')).toBeDefined()

      await picker()[0]!.trigger('click')
      expect(meta()).toBe('Round 1 · 1,200 m')

      await picker()[1]!.trigger('click')
      expect(meta()).toContain('Live')
    })
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
    expect(panel.text()).toContain('appears here live')

    race.start()
    runRounds(race, 1)
    await panel.vm.$nextTick()
    expect(panel.get('.meta').text()).toContain('Round 1')
    expect(picker()[0]!.attributes('aria-pressed')).toBe('true')
  })
})
