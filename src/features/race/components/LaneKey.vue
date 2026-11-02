<script setup lang="ts">
import type { Horse } from '@/features/horses/model/horse'
import ColorChip from '@/shared/components/ColorChip.vue'

defineProps<{
  runners: readonly { readonly lane: number; readonly horse: Horse }[]
  /** True once the runners arrive in the current order, the leader first. */
  ranked: boolean
}>()
</script>

<template>
  <!-- On phones the track shows lane numbers only; this names the runners and, in a race, their order. -->
  <TransitionGroup
    v-if="runners.length"
    tag="ol"
    name="reorder"
    class="key"
    :aria-label="ranked ? 'Runners in their current order' : 'Runners by lane'"
  >
    <li
      v-for="(item, index) in runners"
      :key="item.lane"
      :class="{ leading: ranked && index === 0 }"
    >
      <span v-if="ranked" class="position">{{ index + 1 }}</span>
      <ColorChip :color="item.horse.color.hex" :label="item.lane" />
      <span class="name" lang="tr">{{ item.horse.name }}</span>
    </li>
  </TransitionGroup>
</template>

<style scoped>
/* Shown only on phones; the responsive layout switches it on. Reads down each column, 1 to 10. */
.key {
  display: none;
  grid-template-rows: repeat(5, auto);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-flow: column;
  gap: 6px var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.key li {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  /* Opaque, so a row sliding past hides the one under it instead of mixing their text. */
  background: var(--color-surface);
  font-size: 0.84rem;
}

/* A horse that changes place slides there; the moving rows pass on top. */
.reorder-move {
  z-index: 1;
  transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.3, 1);
}

.position {
  flex: none;
  width: 16px;
  color: var(--color-text-2);
  font-size: 0.8rem;
  text-align: right;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leading .position {
  color: var(--color-accent);
  font-weight: 600;
}

.leading .name {
  font-weight: 600;
}

@media (max-width: 599px) {
  .key {
    display: grid;
  }
}
</style>
