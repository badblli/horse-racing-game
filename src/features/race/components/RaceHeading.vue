<script setup lang="ts">
import { computed } from 'vue'

import { ROUND_DISTANCES } from '@/features/schedule/model/round'
import { readableText } from '@/shared/lib/color'
import { formatDistance } from '@/shared/lib/format'

import type { StatusMessage } from '../model/describe-status'

const props = defineProps<{
  roundNumber: number | null
  distance: number | null
  statusMessage: StatusMessage
  /** Color of the horse the status names, if any. */
  horseColor: string | null
}>()

const nameStyle = computed(() =>
  props.horseColor ? { color: readableText(props.horseColor) } : undefined,
)
</script>

<template>
  <div class="heading">
    <h2 class="title">
      <template v-if="roundNumber !== null && distance !== null">
        Round {{ roundNumber }}
        <span class="detail">of {{ ROUND_DISTANCES.length }} · {{ formatDistance(distance) }}</span>
      </template>
      <template v-else>No race scheduled</template>
    </h2>
    <p class="status" data-testid="race-status">
      <template v-for="(part, index) in statusMessage" :key="index">
        <strong v-if="part.strong" lang="tr" :style="nameStyle">{{ part.text }}</strong>
        <template v-else>{{ part.text }}</template>
      </template>
    </p>
  </div>
</template>

<style scoped>
.title {
  font-size: var(--font-size-title);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.detail {
  color: var(--color-text-2);
  font-weight: 500;
}

.status {
  min-height: 1.5em;
  margin-top: var(--space-1);
  color: var(--color-text-2);
  font-size: 1rem;
}

.status strong {
  color: var(--color-text);
  font-weight: 600;
}

@media (max-width: 599px) {
  .title {
    font-size: 1.4rem;
  }
}
</style>
