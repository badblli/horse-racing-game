<script setup lang="ts">
import ColorChip from '@/shared/components/ColorChip.vue'

import type { TrackLane } from '../model/race'

defineProps<{ lanes: readonly TrackLane[] }>()
</script>

<template>
  <!-- On narrow screens the lanes show numbers only; this key names every runner. -->
  <ul v-if="lanes.length" class="key" aria-label="Runners by lane">
    <li
      v-for="item in lanes"
      :key="item.lane"
      :class="{ emphasised: item.isLeader || item.place === 1 }"
    >
      <ColorChip :color="item.horse.color.hex" :label="item.lane" />
      <span class="name" lang="tr">{{ item.horse.name }}</span>
      <span v-if="item.place !== null" class="place" :class="{ first: item.place === 1 }">
        {{ item.place === 1 ? '1st' : item.place }}
      </span>
    </li>
  </ul>
</template>

<style scoped>
/* Shown only on narrow screens; the responsive layout switches it on. */
.key {
  display: none;
  grid-template-columns: 1fr 1fr;
  gap: 6px var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.key li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-size: 0.84rem;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emphasised .name {
  font-weight: 600;
}

.place {
  margin-left: auto;
  color: var(--color-text-2);
  font-size: 0.8rem;
}

.place.first {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
