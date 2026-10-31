<script setup lang="ts">
import { computed } from 'vue'

import ColorChip from '@/shared/components/ColorChip.vue'

import { MAX_CONDITION, MIN_CONDITION, type Horse } from '../model/horse'

const props = defineProps<{
  horses: readonly Horse[]
  /** Lane of each horse running in the current round. */
  laneByHorse: ReadonlyMap<string, number>
  /** The round the lanes belong to; null when no round is lined up. */
  roundNumber: number | null
}>()

const showLanes = computed(() => props.roundNumber !== null && props.laneByHorse.size > 0)

const subtitle = computed(() =>
  showLanes.value
    ? `${props.horses.length} horses · ${props.laneByHorse.size} run in round ${props.roundNumber}`
    : `${props.horses.length} horses · condition ${MIN_CONDITION}–${MAX_CONDITION}`,
)

// Two side-by-side tables keep the roster short on wide screens.
const halves = computed(() => {
  const rows = props.horses.map((horse, index) => ({
    horse,
    number: String(index + 1).padStart(2, '0'),
    lane: showLanes.value ? (props.laneByHorse.get(horse.id) ?? null) : null,
  }))
  const middle = Math.ceil(rows.length / 2)
  return [rows.slice(0, middle), rows.slice(middle)].filter((half) => half.length)
})
</script>

<template>
  <section class="roster" aria-labelledby="horses-title">
    <div class="header">
      <h2 id="horses-title">Horses</h2>
      <span>{{ subtitle }}</span>
    </div>
    <div class="tables">
      <table
        v-for="(half, index) in halves"
        :key="index"
        :aria-label="`Horses ${half[0]!.number}–${half[half.length - 1]!.number}`"
      >
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Horse</th>
            <th scope="col" class="color">Color</th>
            <th scope="col">Condition</th>
            <th scope="col">{{ showLanes ? `Round ${roundNumber}` : 'Lane' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in half" :key="row.horse.id">
            <td class="number">{{ row.number }}</td>
            <td>
              <span class="horse">
                <ColorChip class="small" :color="row.horse.color.hex" />
                <span class="name" lang="tr">{{ row.horse.name }}</span>
              </span>
            </td>
            <td class="color">{{ row.horse.color.name }}</td>
            <td>
              <span class="condition">
                <span
                  class="meter"
                  :style="{ '--condition': `${row.horse.condition}%` }"
                  aria-hidden="true"
                />
                {{ row.horse.condition }}
              </span>
            </td>
            <td class="lane" :class="{ none: row.lane === null }" data-testid="lane">
              {{ row.lane === null ? '—' : `Lane ${row.lane}` }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.roster {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--space-5) var(--space-6) var(--space-4);
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

.tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 var(--space-7);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

th {
  padding: var(--space-2) 6px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-2);
  font-size: 0.78rem;
  font-weight: 500;
  text-align: left;
}

td {
  padding: 7px 6px;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

tr:last-child td {
  border-bottom: 0;
}

.number {
  width: 34px;
  color: var(--color-text-2);
}

.horse {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  max-width: 170px;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ColorChip's root carries this component's scope, so the size applies without :deep. */
.chip.small {
  width: 16px;
  height: 16px;
}

td.color {
  color: var(--color-text-2);
}

.condition {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.meter {
  position: relative;
  width: 44px;
  height: 4px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--color-fill-disabled);
}

.meter::after {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--condition);
  border-radius: 2px;
  background: var(--color-text-disabled);
  content: '';
}

.lane {
  color: var(--color-accent);
  font-weight: 500;
}

.lane.none {
  color: var(--color-text-disabled);
  font-weight: 400;
}
</style>
