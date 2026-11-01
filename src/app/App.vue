<script setup lang="ts">
import { ref, watch } from 'vue'

import HorseRoster from '@/features/horses/components/HorseRoster.vue'
import { useHorsesStore } from '@/features/horses/store'
import RaceStage from '@/features/race/components/RaceStage.vue'
import ResultsPanel from '@/features/race/components/ResultsPanel.vue'
import { useRaceClock } from '@/features/race/composables/useRaceClock'
import { useRaceStore } from '@/features/race/store'
import SchedulePanel from '@/features/schedule/components/SchedulePanel.vue'

import AppHeader from './AppHeader.vue'
import DetailTabs, { type DetailTab } from './DetailTabs.vue'

const props = defineProps<{
  /** Race seconds per real second; only the e2e build changes it. */
  playbackRate?: number
}>()

const race = useRaceStore()
const horses = useHorsesStore()
// Owned here because more than one panel reads the race time.
const { time } = useRaceClock({ rate: props.playbackRate })

/** The panel a phone shows; wider screens show them all. */
const activeTab = ref<DetailTab>('race')

// A new schedule or a running race brings a phone back to the track.
watch(
  () => race.schedule,
  () => {
    activeTab.value = 'race'
  },
)
watch(
  () => race.status,
  (status) => {
    if (status === 'running') activeTab.value = 'race'
  },
)
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="layout">
      <DetailTabs class="tabs" :active="activeTab" @select="activeTab = $event" />
      <div
        id="panel-race"
        class="stage"
        :class="{ active: activeTab === 'race' }"
        role="tabpanel"
        aria-labelledby="tab-race"
        data-testid="detail-panel"
      >
        <RaceStage :time="time" />
      </div>
      <div class="side">
        <div
          id="panel-schedule"
          class="schedule"
          :class="{ active: activeTab === 'schedule' }"
          role="tabpanel"
          aria-labelledby="tab-schedule"
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
          role="tabpanel"
          aria-labelledby="tab-results"
          data-testid="detail-panel"
        >
          <ResultsPanel :time="time" />
        </div>
      </div>
      <div
        id="panel-horses"
        class="horses"
        :class="{ active: activeTab === 'horses' }"
        role="tabpanel"
        aria-labelledby="tab-horses"
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

/* Phones: one panel at a time, chosen from a menu fixed above the action bar. */
@media (max-width: 599px) {
  .app {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    padding: 0;
  }

  .layout {
    flex: 1;
    min-height: 0;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'panel';
    gap: 0;
    /* Room for the menu and the action bar. */
    padding: 0 var(--space-4) 132px;
    overflow-y: auto;
  }

  .layout > .tabs {
    position: fixed;
    right: var(--space-4);
    bottom: calc(82px + env(safe-area-inset-bottom, 0px));
    left: var(--space-4);
    z-index: 5;
    /* Hides the panel scrolling past behind the menu. */
    box-shadow: 0 0 0 8px var(--color-bg);
  }

  .layout > .stage,
  .schedule,
  .results,
  .horses {
    grid-area: panel;
  }

  /* The stage stays mounted so the race keeps running; its action bar stays visible on its own. */
  .layout > .stage:not(.active) {
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }

  .schedule:not(.active),
  .results:not(.active),
  .horses:not(.active) {
    display: none;
  }
}
</style>
