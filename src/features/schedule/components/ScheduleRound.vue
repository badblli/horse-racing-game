<script setup lang="ts">
import { computed, useId } from 'vue'

import type { Horse } from '@/features/horses/model/horse'
import ColorChip from '@/shared/components/ColorChip.vue'
import { formatDistance } from '@/shared/lib/format'

import type { Round, RoundState } from '../model/round'

const props = defineProps<{
  round: Round
  state: RoundState
  /** In lane order. */
  runners: readonly Horse[]
  winnerName: string | null
  expanded: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const lineupId = useId()

const labels: Record<Exclude<RoundState, 'done'>, string> = {
  next: 'Next',
  racing: 'Racing',
  paused: 'Paused',
  upcoming: 'Upcoming',
}

const label = computed(() =>
  props.state === 'done'
    ? props.winnerName
      ? `${props.winnerName} won`
      : 'Completed'
    : labels[props.state],
)

const isCurrent = computed(() => ['next', 'racing', 'paused'].includes(props.state))
</script>

<template>
  <li>
    <button
      type="button"
      class="row"
      :aria-label="`Round ${round.number}, ${formatDistance(round.distance)}, ${label}`"
      :aria-expanded="expanded"
      :aria-controls="lineupId"
      @click="emit('toggle')"
    >
      <span class="name">
        Round {{ round.number }} <span class="distance">{{ formatDistance(round.distance) }}</span>
      </span>
      <span
        class="state"
        :class="{ current: isCurrent }"
        :lang="state === 'done' ? 'tr' : undefined"
      >
        {{ label }}
      </span>
      <svg class="chevron" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M4.5 2.5L8 6l-3.5 3.5" />
      </svg>
    </button>
    <ul v-if="expanded" :id="lineupId" class="lineup" :aria-label="`Round ${round.number} lineup`">
      <li v-for="(horse, index) in runners" :key="horse.id">
        <ColorChip :color="horse.color.hex" :label="index + 1" />
        <span class="horse" lang="tr">{{ horse.name }}</span>
      </li>
    </ul>
  </li>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 14px;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 10px 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.92rem;
  text-align: left;
  cursor: pointer;
}

.row:hover {
  background: var(--color-fill);
}

.row:focus-visible {
  outline-offset: -2px;
}

.name {
  font-weight: 500;
  white-space: nowrap;
}

.distance {
  margin-left: 2px;
  color: var(--color-text-2);
  font-weight: 400;
}

.state {
  max-width: 140px;
  overflow: hidden;
  color: var(--color-text-2);
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.state.current {
  color: var(--color-accent);
  font-weight: 500;
}

.chevron {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: var(--color-text-2);
  stroke-width: 1.8;
  transition: transform 0.2s;
}

[aria-expanded='true'] .chevron {
  transform: rotate(90deg);
}

.lineup {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-1) 14px;
  margin: 0;
  padding: 2px 6px var(--space-3);
  list-style: none;
}

.lineup li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-size: 0.84rem;
}

.horse {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
