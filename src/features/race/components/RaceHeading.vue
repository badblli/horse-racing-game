<script setup lang="ts">
import { ROUND_DISTANCES } from '@/features/schedule/model/round'
import { formatDistance } from '@/shared/lib/format'

import type { StatusMessage } from '../model/describe-status'

defineProps<{
  roundNumber: number | null
  distance: number | null
  statusMessage: StatusMessage
}>()
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
        <strong v-if="part.strong" lang="tr">{{ part.text }}</strong>
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
