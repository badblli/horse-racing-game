<script setup lang="ts">
import { computed } from 'vue'

import { useHorsesStore } from '@/features/horses/store'

import {
  describeRaceAnnouncement,
  describeRaceStatus,
  type RaceStatusInput,
} from '../model/describe-status'
import type { RunnerTrajectory, TrackLane } from '../model/race'
import { distanceAt, leaderAt, rankAt } from '../model/standings'
import { useRaceStore } from '../store'
import LaneKey from './LaneKey.vue'
import RaceAnnouncer from './RaceAnnouncer.vue'
import RaceControls from './RaceControls.vue'
import RaceHeading from './RaceHeading.vue'
import RaceTrack from './RaceTrack.vue'

const props = defineProps<{
  /** Race seconds since the current round started. */
  time: number
}>()

const race = useRaceStore()
const horses = useHorsesStore()

const nameOf = (horseId: string) => horses.horsesById.get(horseId)?.name ?? horseId

// Results are appended in running order, so round i's result sits at index i.
const result = computed(() => race.results[race.currentRoundIndex] ?? null)
const inPlay = computed(() => race.status === 'running' || race.status === 'paused')
const leader = computed(() => {
  const simulation = race.currentSimulation
  return simulation && inPlay.value && !result.value ? leaderAt(simulation, props.time) : null
})

const lanes = computed<TrackLane[]>(() => {
  const simulation = race.currentSimulation
  if (!simulation) return []
  const places = new Map(
    result.value?.placings.map((placing) => [placing.horseId, placing.position]),
  )

  return simulation.runners.flatMap((runner) => {
    const horse = horses.horsesById.get(runner.horseId)
    if (!horse) return []
    return {
      lane: runner.lane,
      horse,
      progress: distanceAt(runner, props.time) / simulation.distance,
      place: places.get(runner.horseId) ?? null,
      isLeader: runner === leader.value,
      galloping: inPlay.value && props.time > 0 && props.time < runner.finishTime,
    }
  })
})

const statusInput = computed<RaceStatusInput>(() => {
  const winner = result.value?.placings[0]
  return {
    status: race.status,
    roundNumber: race.currentRound?.number ?? null,
    leaderName: leader.value ? nameOf(leader.value.horseId) : null,
    winner: winner ? { name: nameOf(winner.horseId), finishTime: winner.finishTime } : null,
  }
})

/**
 * Runners in their current order once the race is on: the live ranking, then the result.
 * The time changes every frame but the order rarely does; keeping the same array spares a render.
 */
const order = computed<readonly RunnerTrajectory[] | null>((previous) => {
  const simulation = race.currentSimulation
  if (!simulation) return null
  const running = inPlay.value && props.time > 0
  if (!result.value && !running) return null
  const next = rankAt(simulation, result.value ? simulation.duration : props.time)
  return previous && next.every((runner, index) => runner === previous[index]) ? previous : next
})

const keyRunners = computed(() =>
  (order.value ?? race.currentSimulation?.runners ?? []).flatMap((runner) => {
    const horse = horses.horsesById.get(runner.horseId)
    return horse ? [{ lane: runner.lane, horse }] : []
  }),
)

/** The color of the horse the status line names: the leader, then the round's winner. */
const namedHorseColor = computed(() => {
  const named = leader.value ?? result.value?.placings[0]
  return named ? (horses.horsesById.get(named.horseId)?.color.hex ?? null) : null
})

const statusMessage = computed(() => describeRaceStatus(statusInput.value))
const announcement = computed(() => describeRaceAnnouncement(statusInput.value))
</script>

<template>
  <section class="stage" aria-label="Race">
    <div class="top">
      <RaceHeading
        :round-number="race.currentRound?.number ?? null"
        :distance="race.currentRound?.distance ?? null"
        :status-message="statusMessage"
        :horse-color="namedHorseColor"
      />
      <RaceControls
        :can-generate="race.canGenerate"
        :primary-action="race.primaryAction"
        @generate="race.generate()"
        @start="race.start()"
        @pause="race.pause()"
        @resume="race.resume()"
      />
    </div>
    <!-- Keyed by round so every new round's lanes fade in. -->
    <RaceTrack
      :key="race.currentRound?.number"
      :lanes="lanes"
      :phase="race.status"
      :distance="race.currentRound?.distance"
    />
    <LaneKey :runners="keyRunners" :ranked="order !== null" />
    <RaceAnnouncer :message="announcement" />
  </section>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: var(--space-6) var(--space-6) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

@media (max-width: 599px) {
  .stage {
    gap: 14px;
    padding: 18px 14px var(--space-4);
    border-radius: 14px;
  }
}

/* One screen: the track takes whatever height the heading leaves. */
@media (min-width: 1180px) and (min-height: 640px) {
  .stage {
    gap: 14px;
    padding: var(--space-5);
  }

  .top {
    flex: none;
  }
}
</style>
