<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import HorseRoster from '@/features/horses/components/HorseRoster.vue'
import { useHorsesStore } from '@/features/horses/store'
import RaceStage from '@/features/race/components/RaceStage.vue'
import ResultsPanel from '@/features/race/components/ResultsPanel.vue'
import { useRaceStore } from '@/features/race/store'
import SchedulePanel from '@/features/schedule/components/SchedulePanel.vue'

import AppHeader from './AppHeader.vue'
import DetailTabs, { type DetailTab } from './DetailTabs.vue'

defineProps<{
  /** Race seconds per real second; only the e2e build changes it. */
  playbackRate?: number
}>()

const race = useRaceStore()
const horses = useHorsesStore()

/** The mobile tab the user picked; null follows the race. */
const chosenTab = ref<DetailTab | null>(null)

// Results come forward while a finished round holds the track; the schedule otherwise.
const followedTab = computed<DetailTab>(() =>
  race.roundStates[race.currentRoundIndex] === 'done' ? 'results' : 'schedule',
)
const activeTab = computed(() => chosenTab.value ?? followedTab.value)

watch(
  () => race.schedule,
  () => {
    chosenTab.value = null
  },
)
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="layout">
      <div class="stage"><RaceStage :rate="playbackRate" /></div>
      <DetailTabs class="tabs" :active="activeTab" @select="chosenTab = $event" />
      <div class="side">
        <div
          id="panel-schedule"
          class="schedule"
          :class="{ active: activeTab === 'schedule' }"
          data-testid="detail-panel"
        >
          <SchedulePanel
            :rounds="race.schedule"
            :round-states="race.roundStates"
            :winners="race.winners"
            :horses-by-id="horses.horsesById"
          />
        </div>
        <div
          id="panel-results"
          class="results"
          :class="{ active: activeTab === 'results' }"
          data-testid="detail-panel"
        >
          <ResultsPanel />
        </div>
      </div>
      <div
        id="panel-horses"
        class="horses"
        :class="{ active: activeTab === 'horses' }"
        data-testid="detail-panel"
      >
        <HorseRoster
          :horses="horses.roster"
          :lane-by-horse="race.laneByHorse"
          :round-number="race.currentRound?.number ?? null"
        />
      </div>
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

/* Laptops and desktops: horses, track, schedule and results fit one screen with no page scroll. */
@media (min-width: 1180px) and (min-height: 640px) {
  .app {
    display: flex;
    flex-direction: column;
    max-width: 1760px;
    height: 100dvh;
    padding: 0 var(--space-4) var(--space-4);
    overflow: hidden;
  }

  .layout {
    flex: 1;
    min-height: 0;
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: 300px minmax(0, 1fr) 330px;
    grid-template-areas: 'horses stage side';
    gap: var(--space-4);
    align-items: stretch;
  }

  .layout > .stage,
  .schedule,
  .results,
  .horses {
    display: flex;
    min-height: 0;
  }

  /* Each panel fills its slot and scrolls inside it if a slot ever runs short. */
  .layout > .stage > *,
  .schedule > *,
  .results > *,
  .horses > * {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  .side {
    gap: var(--space-4);
    min-height: 0;
  }

  .schedule {
    flex: none;
    max-height: 62%;
  }

  .results {
    flex: 1;
  }
}

/* Tablet: the track spans the width, schedule and results side by side under it. */
@media (max-width: 1023px) {
  .app {
    padding: 0 var(--space-6) var(--space-10);
  }

  .layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'stage stage'
      'schedule results'
      'horses horses';
    gap: var(--space-5);
  }

  .side {
    display: contents;
  }

  .schedule {
    grid-area: schedule;
    min-width: 0;
  }

  .results {
    grid-area: results;
    min-width: 0;
  }
}

/* Mobile: one column, and the three detail panels share a tab control. */
@media (max-width: 599px) {
  .app {
    /* Room for the action bar fixed to the bottom of the screen. */
    padding: 0 var(--space-4) 108px;
  }

  .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'stage'
      'tabs'
      'panel';
    gap: var(--space-4);
  }

  .tabs {
    grid-area: tabs;
  }

  .schedule,
  .results,
  .horses {
    grid-area: panel;
  }

  .schedule:not(.active),
  .results:not(.active),
  .horses:not(.active) {
    display: none;
  }
}
</style>
