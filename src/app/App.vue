<script setup lang="ts">
import RaceStage from '@/features/race/components/RaceStage.vue'

import AppHeader from './AppHeader.vue'

defineProps<{
  /** Race seconds per real second; only the e2e build changes it. */
  playbackRate?: number
}>()
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="layout">
      <div class="stage"><RaceStage :rate="playbackRate" /></div>
      <div class="side"><!-- SchedulePanel, ResultsPanel --></div>
      <div class="horses"><!-- HorseRoster --></div>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-10) var(--space-12);
}

/* The track takes the wide column; schedule and results sit beside it, horses below. */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  grid-template-areas:
    'stage side'
    'horses side';
  gap: var(--space-6) var(--space-7);
  align-items: start;
}

.stage {
  grid-area: stage;
  min-width: 0;
}

.side {
  grid-area: side;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
}

.horses {
  grid-area: horses;
  min-width: 0;
}
</style>
