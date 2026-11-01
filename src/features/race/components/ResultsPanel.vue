<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Horse } from '@/features/horses/model/horse'
import { useHorsesStore } from '@/features/horses/store'
import SelectionPill from '@/shared/components/SelectionPill.vue'
import { formatDistance } from '@/shared/lib/format'

import { rankAt } from '../model/standings'
import { useRaceStore } from '../store'
import LiveOrder from './LiveOrder.vue'
import RoundResult from './RoundResult.vue'

const props = defineProps<{
  /** Race seconds since the current round started. */
  time: number
}>()

const race = useRaceStore()
const horses = useHorsesStore()

/** The round the user picked; null follows the race. */
const selectedRound = ref<number | null>(null)

watch(
  () => race.schedule,
  () => {
    selectedRound.value = null
  },
)

const completed = computed(() => race.results.length)
const latestRound = computed(() => completed.value - 1)

/** The round running now, until its result takes over. */
const liveRound = computed(() => {
  const inPlay = race.status === 'running' || race.status === 'paused'
  return inPlay && props.time > 0 && !race.results[race.currentRoundIndex]
    ? race.currentRoundIndex
    : null
})
const followedRound = computed(() => liveRound.value ?? latestRound.value)

// The time changes every frame but the order rarely does; keeping the same array spares a render.
const liveRunners = computed<readonly Horse[]>((previous) => {
  const simulation = race.currentSimulation
  if (liveRound.value === null || !simulation) return []
  const next = rankAt(simulation, props.time).flatMap(
    (runner) => horses.horsesById.get(runner.horseId) ?? [],
  )
  return previous && next.every((horse, index) => horse === previous[index]) ? previous : next
})

const showLive = computed(() => selectedRound.value === null && liveRound.value !== null)
const shownRound = computed(() => selectedRound.value ?? followedRound.value)
const shownResult = computed(() => race.results[shownRound.value] ?? null)

function select(index: number) {
  // Picking the round the race is on goes back to following it.
  selectedRound.value = index === followedRound.value ? null : index
}
</script>

<template>
  <section class="panel" aria-labelledby="results-title">
    <div class="header">
      <h2 id="results-title">Results</h2>
      <span v-if="completed">{{ completed }} of {{ race.schedule.length }}</span>
    </div>
    <template v-if="shownResult || showLive">
      <div class="picker" role="group" aria-label="Choose round">
        <SelectionPill :index="shownRound" :count="race.schedule.length" />
        <button
          v-for="(round, index) in race.schedule"
          :key="round.number"
          type="button"
          :aria-label="`Round ${round.number}`"
          :aria-pressed="index === shownRound"
          :disabled="index > followedRound"
          @click="select(index)"
        >
          {{ round.number }}
        </button>
      </div>
      <template v-if="showLive && race.currentRound">
        <p class="meta live">
          <span class="live-dot" aria-hidden="true"></span>
          Round {{ race.currentRound.number }} · {{ formatDistance(race.currentRound.distance) }} ·
          Live
        </p>
        <LiveOrder :runners="liveRunners" />
      </template>
      <template v-else-if="shownResult">
        <p class="meta">
          Round {{ shownResult.roundNumber }} · {{ formatDistance(shownResult.distance) }}
        </p>
        <RoundResult :result="shownResult" :horses-by-id="horses.horsesById" />
      </template>
    </template>
    <p v-else class="empty">Each round's order appears here live, then its result when it ends.</p>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.header h2 {
  font-size: 1.05rem;
  font-weight: 600;
}

.header span,
.meta {
  color: var(--color-text-2);
  font-size: 0.85rem;
}

.live {
  display: flex;
  align-items: center;
  gap: 7px;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
}

.picker {
  position: relative;
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 9px;
  background: var(--color-fill);
}

.picker button {
  position: relative;
  flex: 1;
  min-height: 32px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--color-text-2);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
}

.picker button[aria-pressed='true'] {
  color: var(--color-text);
  font-weight: 600;
}

.picker button:not(:disabled):hover {
  color: var(--color-text);
}

.picker button:disabled {
  color: var(--color-text-disabled);
  cursor: default;
}

.picker button:focus-visible {
  outline-offset: -1px;
}

.empty {
  padding: 6px 0 var(--space-2);
  color: var(--color-text-2);
  font-size: 0.9rem;
}

/* One screen: a compact panel keeps all ten places in view on a 768 px laptop. */
@media (min-width: 1180px) and (min-height: 640px) {
  .panel {
    gap: var(--space-2);
    padding: 14px var(--space-4);
  }

  .picker button {
    min-height: 28px;
  }
}
</style>
