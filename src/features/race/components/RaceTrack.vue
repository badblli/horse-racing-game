<script setup lang="ts">
import { RUNNERS_PER_ROUND } from '@/features/schedule/model/round'

import type { RaceStatus } from '../model/lifecycle'
import type { TrackLane } from '../model/race'
import RaceLane from './RaceLane.vue'

defineProps<{
  /** Empty until a schedule exists. */
  lanes: readonly TrackLane[]
  phase: RaceStatus
}>()
</script>

<template>
  <div class="track" :class="{ paused: phase === 'paused' }">
    <div class="caption" aria-hidden="true">
      <span class="caption-lane">Lane</span>
      <span class="ends"><span>Start</span><span>Finish</span></span>
    </div>
    <ol class="lanes" aria-label="Lanes">
      <template v-if="lanes.length">
        <RaceLane v-for="item in lanes" :key="item.lane" v-bind="item" />
      </template>
      <template v-else>
        <RaceLane v-for="lane in RUNNERS_PER_ROUND" :key="lane" :lane="lane" :horse="null" />
      </template>
    </ol>
    <div v-if="!lanes.length" class="empty">
      <p>
        <strong>No race scheduled</strong>
        <span>Six rounds from 1,200 m to 2,200 m, ten horses each.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.track {
  --place-column: 40px;

  position: relative;
  overflow: hidden;
  border-radius: var(--radius-track);
  background: var(--color-track);
}

/* The horses freeze mid-stride while the race is paused. */
.paused {
  --gallop-state: paused;
}

.paused .lanes {
  opacity: 0.78;
}

.caption {
  display: grid;
  grid-template-columns: 196px minmax(0, 1fr) 40px;
  padding: var(--space-2) 0 2px;
  color: #44514a;
  font-size: var(--font-size-caption);
}

.caption-lane {
  padding-left: 14px;
}

.ends {
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-2);
}

.lanes {
  position: relative;
  margin: 0;
  padding: 2px 0 var(--space-2);
  list-style: none;
}

/* The finish line: one strip across every lane, painted first so the horses run over it. */
.lanes::before {
  position: absolute;
  top: 0;
  right: var(--place-column);
  bottom: 0;
  width: 12px;
  background: repeating-conic-gradient(#1d1d1f 0 25%, #fff 0 50%) 0 0 / 12px 12px;
  content: '';
}

.empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-6);
  text-align: center;
}

.empty p {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-width: 360px;
  padding: var(--space-4) 22px;
  border-radius: var(--radius-track);
  background: rgb(255 255 255 / 0.88);
}

.empty strong {
  font-weight: 600;
}

.empty span {
  color: var(--color-text-2);
  font-size: 0.9rem;
}

/* Column widths match RaceLane. */
@media (max-width: 1023px) {
  .track {
    --place-column: 36px;
  }

  .caption {
    grid-template-columns: 168px minmax(0, 1fr) 36px;
  }
}

@media (max-width: 599px) {
  .track {
    --place-column: 30px;
  }

  .lanes::before {
    width: 10px;
    background-size: 10px 10px;
  }

  .caption {
    grid-template-columns: 40px minmax(0, 1fr) 30px;
  }

  .caption-lane {
    visibility: hidden;
  }
}

/* One screen: the lanes share the height the stage gives the track. */
@media (min-width: 1180px) and (min-height: 640px) {
  .track {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .caption {
    flex: none;
  }

  .lanes {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }
}
</style>
