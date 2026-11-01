<script setup lang="ts">
import type { Horse } from '@/features/horses/model/horse'
import ColorChip from '@/shared/components/ColorChip.vue'

defineProps<{
  /** In their current order, the leader first. */
  runners: readonly Horse[]
}>()
</script>

<template>
  <ol class="order" aria-label="Current order">
    <li v-for="(horse, index) in runners" :key="horse.id" :class="{ leading: index === 0 }">
      <span class="position">{{ index + 1 }}</span>
      <ColorChip class="small" :color="horse.color.hex" />
      <span class="name" lang="tr">{{ horse.name }}</span>
    </li>
  </ol>
</template>

<style scoped>
.order {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.order li {
  display: grid;
  grid-template-columns: 22px 16px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 5px var(--space-1);
  background: var(--color-surface);
  font-size: 0.86rem;
}

.order li + li {
  border-top: 1px solid var(--color-border);
}

.order .leading {
  border-radius: 8px;
  background: var(--color-accent-soft);
  font-weight: 600;
}

.position {
  color: var(--color-text-2);
}

.leading .position {
  color: var(--color-accent);
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ColorChip's root carries this component's scope, so the size applies without :deep. */
.chip.small {
  width: 16px;
  height: 16px;
}

@media (min-width: 1180px) and (min-height: 640px) {
  .order li {
    padding-block: 3px;
  }
}
</style>
