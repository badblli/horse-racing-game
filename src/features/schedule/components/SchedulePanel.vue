<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Horse } from '@/features/horses/model/horse'

import { ROUND_DISTANCES, type Round, type RoundState } from '../model/round'
import ScheduleRound from './ScheduleRound.vue'

const props = defineProps<{
  rounds: readonly Round[]
  /** One per round, in the same order. */
  roundStates: readonly RoundState[]
  /** Winning horse id per completed round. */
  winners: readonly (string | null)[]
  horsesById: ReadonlyMap<string, Horse>
}>()

/** The round whose lineup the user opened. The track already names the current runners. */
const openRound = ref<number | null>(null)

watch(
  () => props.rounds,
  () => {
    openRound.value = null
  },
)

const completed = computed(() => props.roundStates.filter((state) => state === 'done').length)

function toggle(index: number) {
  openRound.value = openRound.value === index ? null : index
}

function runnersOf(round: Round): Horse[] {
  return round.horseIds.flatMap((id) => props.horsesById.get(id) ?? [])
}

function winnerName(index: number): string | null {
  const id = props.winners[index]
  return id ? (props.horsesById.get(id)?.name ?? null) : null
}
</script>

<template>
  <section class="panel" aria-labelledby="schedule-title">
    <div class="header">
      <h2 id="schedule-title">Schedule</h2>
      <span v-if="rounds.length">{{ completed }} of {{ ROUND_DISTANCES.length }} complete</span>
    </div>
    <ol v-if="rounds.length" class="rounds">
      <ScheduleRound
        v-for="(round, index) in rounds"
        :key="round.number"
        :round="round"
        :state="roundStates[index] ?? 'upcoming'"
        :runners="runnersOf(round)"
        :winner-name="winnerName(index)"
        :expanded="openRound === index"
        @toggle="toggle(index)"
      />
    </ol>
    <p v-else class="empty">Generate a schedule to see the six rounds and who runs in each.</p>
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

.header span {
  color: var(--color-text-2);
  font-size: 0.85rem;
}

.rounds {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A child component's root element carries this component's scope, so no :deep is needed. */
.rounds > li + li {
  border-top: 1px solid var(--color-border);
}

.empty {
  padding: 6px 0 var(--space-2);
  color: var(--color-text-2);
  font-size: 0.9rem;
}

@media (min-width: 1180px) and (min-height: 640px) {
  .panel {
    gap: var(--space-1);
    padding: 14px var(--space-4) var(--space-2);
  }
}
</style>
