<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useHorsesStore } from '@/features/horses/store'
import { formatDistance } from '@/shared/lib/format'

import { useRaceStore } from '../store'
import RoundResult from './RoundResult.vue'

const race = useRaceStore()
const horses = useHorsesStore()

/** The round the user picked; null follows the latest result. */
const selectedRound = ref<number | null>(null)

watch(
  () => race.schedule,
  () => {
    selectedRound.value = null
  },
)

const completed = computed(() => race.results.length)
const latestRound = computed(() => completed.value - 1)
const shownRound = computed(() => selectedRound.value ?? latestRound.value)
const shownResult = computed(() => race.results[shownRound.value] ?? null)

function select(index: number) {
  // Picking the latest round goes back to following the race.
  selectedRound.value = index === latestRound.value ? null : index
}
</script>

<template>
  <section class="panel" aria-labelledby="results-title">
    <div class="header">
      <h2 id="results-title">Results</h2>
      <span v-if="completed">{{ completed }} of {{ race.schedule.length }}</span>
    </div>
    <template v-if="shownResult">
      <div class="picker" role="group" aria-label="Choose round">
        <button
          v-for="(round, index) in race.schedule"
          :key="round.number"
          type="button"
          :aria-label="`Round ${round.number}`"
          :aria-pressed="index === shownRound"
          :disabled="index > latestRound"
          @click="select(index)"
        >
          {{ round.number }}
        </button>
      </div>
      <p class="meta">
        Round {{ shownResult.roundNumber }} · {{ formatDistance(shownResult.distance) }}
      </p>
      <RoundResult :result="shownResult" :horses-by-id="horses.horsesById" />
    </template>
    <p v-else class="empty">Each round's finishing order appears here as soon as the round ends.</p>
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

.picker {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 9px;
  background: var(--color-fill);
}

.picker button {
  flex: 1;
  min-height: 32px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--color-text-2);
  font-size: 0.85rem;
  cursor: pointer;
}

.picker button[aria-pressed='true'] {
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
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
</style>
