<script setup lang="ts">
import { computed } from 'vue'

import BaseButton from '@/shared/components/BaseButton.vue'

import type { RaceAction } from '../model/lifecycle'

const props = defineProps<{
  canGenerate: boolean
  /** The race action available now; null when there is nothing to start. */
  primaryAction: RaceAction | null
}>()

const emit = defineEmits<{
  generate: []
  start: []
  pause: []
  resume: []
}>()

const labels: Record<RaceAction, string> = {
  start: 'Start race',
  pause: 'Pause',
  resume: 'Resume',
}

/** With no race to run, Generate is the one thing to do, so it takes the primary color. */
const generateIsPrimary = computed(() => props.primaryAction === null)
const raceLabel = computed(() => labels[props.primaryAction ?? 'start'])

function onRaceAction() {
  switch (props.primaryAction) {
    case 'start':
      return emit('start')
    case 'pause':
      return emit('pause')
    case 'resume':
      return emit('resume')
  }
}
</script>

<template>
  <div class="controls">
    <BaseButton
      :variant="generateIsPrimary ? 'primary' : 'secondary'"
      :disabled="!canGenerate"
      @click="emit('generate')"
    >
      Generate schedule
    </BaseButton>
    <BaseButton
      :variant="generateIsPrimary ? 'secondary' : 'primary'"
      :disabled="primaryAction === null"
      @click="onRaceAction"
    >
      <svg class="icon" viewBox="0 0 12 12" aria-hidden="true">
        <path v-if="primaryAction === 'pause'" d="M2.5 1.5h2.6v9H2.5zM6.9 1.5h2.6v9H6.9z" />
        <path v-else d="M2.5 1.2l8 4.8-8 4.8z" />
      </svg>
      {{ raceLabel }}
    </BaseButton>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex: none;
  gap: 10px;
}

.icon {
  width: 11px;
  height: 11px;
  fill: currentColor;
}

/* Mobile: the same controls become a bar fixed to the bottom of the screen. */
@media (max-width: 599px) {
  .controls {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 5;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--color-border);
    background: rgb(255 255 255 / 0.96);
  }

  /* BaseButton's root carries this component's scope, so no :deep is needed. */
  .button {
    min-height: 48px;
    padding: 10px var(--space-3);
    font-size: 1rem;
  }
}
</style>
