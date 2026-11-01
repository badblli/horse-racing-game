<script setup lang="ts">
import { computed } from 'vue'

import { RUNNERS_PER_ROUND } from '@/features/schedule/model/round'
import { formatDistance } from '@/shared/lib/format'

import type { RaceStatus } from '../model/lifecycle'
import type { TrackLane } from '../model/race'
import RaceLane from './RaceLane.vue'

const props = defineProps<{
  /** Empty until a schedule exists. */
  lanes: readonly TrackLane[]
  phase: RaceStatus
  /** Meters of the round on the track. */
  distance?: number | null
}>()

const distanceMarks = computed(() =>
  props.distance
    ? [0.25, 0.5, 0.75].map((share) => ({
        share,
        label: formatDistance((props.distance as number) * share),
      }))
    : [],
)
</script>

<template>
  <div class="track" :class="{ paused: phase === 'paused' }">
    <div class="caption" aria-hidden="true">
      <span class="caption-lane">Lane</span>
      <span class="ends"><span>Start</span><span>Finish</span></span>
    </div>
    <!-- Comes before the lanes so the horses run over the lines. -->
    <div v-if="distanceMarks.length" class="marks" aria-hidden="true">
      <span
        v-for="mark in distanceMarks"
        :key="mark.share"
        class="mark"
        :style="{ '--share': mark.share }"
      >
        {{ mark.label }}
      </span>
    </div>
    <ol class="lanes" aria-label="Lanes">
      <template v-if="lanes.length">
        <RaceLane v-for="item in lanes" :key="item.lane" v-bind="item" />
      </template>
      <template v-else>
        <RaceLane v-for="lane in RUNNERS_PER_ROUND" :key="lane" :lane="lane" :horse="null" />
      </template>
    </ol>
  </div>
</template>

<style scoped>
.track {
  --label-column: 196px;
  --place-column: 40px;
  /* From a horse's tail to its nose: the nose starts this far into the run. See RaceLane. */
  --horse-length: 52px;

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

/* The run's column, so a mark sits where a horse's nose is at that distance. */
.marks {
  position: absolute;
  top: 0;
  right: var(--place-column);
  bottom: 0;
  left: var(--label-column);
}

.mark {
  --at: calc(var(--horse-length) + (100% - var(--horse-length)) * var(--share));

  position: absolute;
  top: var(--space-2);
  left: var(--at);
  color: #44514a;
  font-size: var(--font-size-caption);
  transform: translateX(-50%);
  white-space: nowrap;
}

.mark::after {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 1px;
  height: 100vh;
  background: var(--color-track-line);
  content: '';
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

/* Column widths match RaceLane. */
@media (max-width: 1023px) {
  .track {
    --label-column: 168px;
    --place-column: 36px;
  }

  .caption {
    grid-template-columns: 168px minmax(0, 1fr) 36px;
  }
}

@media (max-width: 599px) {
  .track {
    --label-column: 40px;
    --place-column: 30px;
    --horse-length: 38px;
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
