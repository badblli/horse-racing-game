<script lang="ts">
export type DetailTab = 'race' | 'schedule' | 'results' | 'horses'
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'

import SelectionPill from '@/shared/components/SelectionPill.vue'

const props = defineProps<{ active: DetailTab }>()

const emit = defineEmits<{ select: [tab: DetailTab] }>()

const tabs: readonly { id: DetailTab; label: string }[] = [
  { id: 'race', label: 'Race' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'results', label: 'Results' },
  { id: 'horses', label: 'Horses' },
]

const activeIndex = computed(() => tabs.findIndex((tab) => tab.id === props.active))

const list = useTemplateRef<HTMLElement>('list')

// Arrow keys move between tabs and select them, as the ARIA tabs pattern describes.
function onKeydown(event: KeyboardEvent, index: number) {
  const last = tabs.length - 1
  const targets: Record<string, number> = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }
  const next = targets[event.key]
  if (next === undefined) return
  event.preventDefault()
  emit('select', tabs[next]!.id)
  list.value?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
}
</script>

<template>
  <!-- Phones only: wider screens show every panel at once. -->
  <div ref="list" class="tabs" role="tablist" aria-label="Details">
    <SelectionPill :index="activeIndex" :count="tabs.length" />
    <button
      v-for="(tab, index) in tabs"
      :id="`tab-${tab.id}`"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="tab.id === active"
      :aria-controls="`panel-${tab.id}`"
      :tabindex="tab.id === active ? 0 : -1"
      @click="emit('select', tab.id)"
      @keydown="onKeydown($event, index)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  position: relative;
  display: none;
  gap: 2px;
  padding: 2px;
  border-radius: 10px;
  /* Unselected labels keep 4.5:1 on this fill, the same one the round picker uses. */
  background: var(--color-fill);
}

button {
  position: relative;
  flex: 1;
  min-height: 38px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-2);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
}

button[aria-selected='true'] {
  color: var(--color-text);
  font-weight: 600;
}

button:focus-visible {
  outline-offset: -1px;
}

@media (max-width: 599px) {
  .tabs {
    display: flex;
  }
}
</style>
