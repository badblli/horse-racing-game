<script setup lang="ts">
import { computed } from 'vue'

import { useHorsesStore } from '@/features/horses/store'

import { PLAYBACK_RATE, useRaceClock } from '../composables/useRaceClock'
import {
  describeRaceAnnouncement,
  describeRaceStatus,
  type RaceStatusInput,
} from '../model/describe-status'
import { leaderAt } from '../model/standings'
import { useRaceStore } from '../store'
import RaceAnnouncer from './RaceAnnouncer.vue'
import RaceControls from './RaceControls.vue'
import RaceHeading from './RaceHeading.vue'

const props = withDefaults(defineProps<{ rate?: number }>(), { rate: PLAYBACK_RATE })

const race = useRaceStore()
const horses = useHorsesStore()
const { time } = useRaceClock({ rate: props.rate })

const nameOf = (horseId: string) => horses.horsesById.get(horseId)?.name ?? horseId

const statusInput = computed<RaceStatusInput>(() => {
  const simulation = race.currentSimulation
  // Results are appended in running order, so round i's result sits at index i.
  const winner = race.results[race.currentRoundIndex]?.placings[0]
  const inPlay = race.status === 'running' || race.status === 'paused'
  const leader = simulation && inPlay && !winner ? leaderAt(simulation, time.value) : null

  return {
    status: race.status,
    roundNumber: race.currentRound?.number ?? null,
    leaderName: leader ? nameOf(leader.horseId) : null,
    winner: winner ? { name: nameOf(winner.horseId), finishTime: winner.finishTime } : null,
  }
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
</style>
