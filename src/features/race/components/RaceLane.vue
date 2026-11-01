<script setup lang="ts">
import HorseFigure from '@/features/horses/components/HorseFigure.vue'
import type { Horse } from '@/features/horses/model/horse'
import ColorChip from '@/shared/components/ColorChip.vue'

withDefaults(
  defineProps<{
    lane: number
    /** Null for an empty lane before a schedule exists. */
    horse: Horse | null
    progress?: number
    place?: number | null
    isLeader?: boolean
    galloping?: boolean
  }>(),
  { progress: 0, place: null, isLeader: false, galloping: false },
)
</script>

<template>
  <li class="lane" :class="{ emphasised: isLeader || place === 1 }" :data-lane="lane">
    <div class="label">
      <ColorChip :color="horse?.color.hex" :label="lane" />
      <span v-if="horse" class="name" lang="tr">{{ horse.name }}</span>
    </div>
    <div class="run">
      <!-- The mover spans the run minus the horse's length; translating it by 100% puts the nose on the line. -->
      <div v-if="horse" class="mover" :style="{ '--progress': progress }">
        <HorseFigure :color="horse.color.hex" :lane="lane" :galloping="galloping" />
      </div>
    </div>
    <!-- The leader wears the winner's badge; the rest of the order is in the Results panel. -->
    <span class="place" :class="{ first: place === 1 || isLeader }" data-testid="place">{{
      place ?? (isLeader ? 1 : '')
    }}</span>
  </li>
</template>

<style scoped>
.lane {
  display: grid;
  grid-template-columns: 196px minmax(0, 1fr) 40px;
  align-items: center;
  height: 42px;
  /* A new round fades in, which also hides the horses going back to the start. */
  animation: fade-in 0.32s ease-out;
  transition: background 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

.lane + .lane {
  border-top: 1px solid rgb(255 255 255 / 0.75);
}

.label {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 var(--space-3) 0 14px;
}

.name {
  overflow: hidden;
  font-size: 0.88rem;
  transition: color 0.3s ease;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emphasised {
  background: rgb(161 43 58 / 0.1);
}

.emphasised .name {
  color: var(--color-accent);
  font-weight: 600;
}

.run {
  position: relative;
  height: 100%;
  border-left: 1px solid var(--color-track-line);
}

.mover {
  position: absolute;
  inset: 0 52px 0 0;
  transform: translateX(calc(var(--progress) * 100%));
  will-change: transform;
}

.mover :deep(svg) {
  position: absolute;
  top: 50%;
  left: 0;
  width: 60px;
  height: 40px;
  margin-top: -21px;
}

.place {
  justify-self: center;
  font-size: 0.82rem;
}

.place.first {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  /* Runs each time the badge lands on a new lane. */
  animation: badge-pop 0.32s cubic-bezier(0.3, 1.5, 0.5, 1);
}

@keyframes badge-pop {
  from {
    transform: scale(0.6);
  }
}

/* Column widths match the track caption in RaceTrack. */
@media (max-width: 1023px) {
  .lane {
    grid-template-columns: 168px minmax(0, 1fr) 36px;
  }
}

/* Mobile: lanes keep only the number chip; LaneKey names the runners. */
@media (max-width: 599px) {
  .lane {
    grid-template-columns: 40px minmax(0, 1fr) 30px;
    height: 31px;
  }

  .label {
    padding: 0 0 0 10px;
  }

  .name {
    display: none;
  }

  .mover {
    right: 38px;
  }

  .mover :deep(svg) {
    width: 42px;
    height: 28px;
    margin-top: -16px;
  }
}

@media (min-width: 1180px) and (min-height: 640px) {
  .lane {
    flex: 1;
    height: auto;
    min-height: 0;
  }
}
</style>
