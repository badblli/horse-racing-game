<script setup lang="ts">
import { computed } from 'vue'

import type { Horse } from '@/features/horses/model/horse'
import ColorChip from '@/shared/components/ColorChip.vue'
import { formatRaceTime } from '@/shared/lib/format'

import type { RoundResult } from '../store'

const props = defineProps<{
  result: RoundResult
  horsesById: ReadonlyMap<string, Horse>
}>()

const finishers = computed(() =>
  props.result.placings.flatMap((placing) => {
    const horse = props.horsesById.get(placing.horseId)
    return horse ? [{ ...placing, horse }] : []
  }),
)
const winner = computed(() => finishers.value[0] ?? null)
const others = computed(() => finishers.value.slice(1))
</script>

<template>
  <div class="result">
    <div v-if="winner" class="winner" data-testid="winner">
      <ColorChip class="large" :color="winner.horse.color.hex" :label="winner.lane" />
      <div class="who">
        <span class="label">Winner</span>
        <span class="name" lang="tr">{{ winner.horse.name }}</span>
      </div>
      <span class="time">{{ formatRaceTime(winner.finishTime) }}</span>
    </div>
    <ol class="places" start="2" aria-label="Other places">
      <li v-for="finisher in others" :key="finisher.horseId">
        <span class="position">{{ finisher.position }}</span>
        <ColorChip class="small" :color="finisher.horse.color.hex" />
        <span class="name" lang="tr">{{ finisher.horse.name }}</span>
        <span class="time">{{ formatRaceTime(finisher.finishTime) }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.result {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.winner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) 14px;
  border-radius: var(--radius-track);
  background: var(--color-accent-soft);
}

.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.label {
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  font-weight: 600;
}

.winner .name {
  font-size: 1.1rem;
  font-weight: 600;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  color: var(--color-text-2);
  font-size: 0.85rem;
}

/* ColorChip's root carries this component's scope, so these sizes apply without :deep. */
.chip.large {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
}

.chip.small {
  width: 16px;
  height: 16px;
}

.places {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0 var(--space-1);
  list-style: none;
}

.places li {
  display: grid;
  grid-template-columns: 22px 16px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 5px 0;
  font-size: 0.86rem;
}

.places li + li {
  border-top: 1px solid var(--color-border);
}

.position {
  color: var(--color-text-2);
}

.places .time {
  font-size: 0.82rem;
}

@media (min-width: 1180px) and (min-height: 640px) {
  .result {
    gap: var(--space-2);
  }

  .winner {
    padding: var(--space-2) var(--space-3);
  }

  .winner .name {
    font-size: 1rem;
  }

  .places li {
    padding: 2px 0;
  }
}
</style>
