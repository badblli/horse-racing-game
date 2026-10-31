<script setup lang="ts">
import { computed } from 'vue'

import { readableInk } from '@/shared/lib/color'

const props = defineProps<{
  /** Silks, cap and saddle cloth. */
  color: string
  /** Shown on the saddle cloth. */
  lane: number
  /** Legs, body and jockey move only while the horse is running. */
  galloping: boolean
}>()

const ink = computed(() => readableInk(props.color))

interface Leg {
  name: 'hl' | 'hr' | 'fl' | 'fr'
  kind: 'hind' | 'fore'
  x: number
  /** Animation offset as a share of the stride: the transverse gallop footfall order. */
  phase: number
}

// Far-side legs are drawn behind the body and a shade darker, which reads as depth.
const farLegs: Leg[] = [
  { name: 'hr', kind: 'hind', x: 42, phase: 0.9 },
  { name: 'fr', kind: 'fore', x: 72, phase: 0.58 },
]
const nearLegs: Leg[] = [
  { name: 'hl', kind: 'hind', x: 38, phase: 0 },
  { name: 'fl', kind: 'fore', x: 76, phase: 0.7 },
]

function shape({ kind, x, phase }: Leg) {
  const joint = kind === 'hind' ? 54 : 55
  return {
    upper:
      kind === 'hind'
        ? `M${x - 6} 30 C${x - 2} 28.5 ${x + 4} 29 ${x + 5.5} 32 L${x + 2.2} 54 L${x - 2.2} 54 Z`
        : `M${x - 3.2} 36 L${x + 3.2} 36 L${x + 1.8} 55 L${x - 1.8} 55 Z`,
    lower: `M${x - 1.7} ${joint} L${x + 1.7} ${joint} L${x + 1.2} 68 L${x - 1.2} 68 Z`,
    hoof: `M${x - 1.5} 68 L${x + 1.6} 68 L${x + 2.8} 71.2 L${x - 1.6} 71.2 Z`,
    joint,
    upperOrigin: `${x}px ${kind === 'hind' ? 38 : 39}px`,
    lowerOrigin: `${x}px ${joint}px`,
    delay: `calc(var(--stride) * ${-phase})`,
  }
}

const farShapes = farLegs.map((item) => ({ ...item, ...shape(item) }))
const nearShapes = nearLegs.map((item) => ({ ...item, ...shape(item) }))
const edge = { stroke: 'rgb(0 0 0 / 0.28)', 'stroke-width': 0.5 }
</script>

<template>
  <svg
    class="horse"
    :class="{ galloping }"
    viewBox="0 0 120 80"
    aria-hidden="true"
    focusable="false"
  >
    <g class="anim pitch">
      <g class="anim tail">
        <path class="mane" d="M31 29 C24 27 17.5 30.5 12.5 39 C18.5 35.5 24 34.8 30.5 34.4 Z" />
      </g>

      <g v-for="item in farShapes" :key="item.name" class="far">
        <g
          class="anim"
          :class="`${item.kind}-upper`"
          :style="{ transformOrigin: item.upperOrigin, animationDelay: item.delay }"
        >
          <path :d="item.upper" />
          <circle :cx="item.x" :cy="item.joint" r="2" />
          <g
            class="anim"
            :class="`${item.kind}-lower`"
            :style="{ transformOrigin: item.lowerOrigin, animationDelay: item.delay }"
          >
            <path :d="item.lower" />
            <path class="hoof" :d="item.hoof" />
          </g>
        </g>
      </g>

      <path
        class="coat"
        d="M36 21.5 C31 22 28.5 26 29 31 C29.4 36 31.5 41 36 43.5 C39 44.6 42 42 45 40.5 C52 41.5 62 43.5 70 44 C75 44.3 79.5 43 81.5 39.5 C84 35 83.5 30 80.5 27 C77.5 24.2 74 23 71 23.4 C66 24.5 60 25.6 55 25.4 C49 25.2 42 21.2 36 21.5 Z"
      />
      <g class="anim neck">
        <path
          class="coat"
          d="M70.5 32 C73 22.5 80.5 14.5 89.5 9 L95 12.2 C93 19.5 89.5 27 86 37 Z"
        />
        <path
          class="coat"
          d="M88.6 8.4 C92.6 6.8 97 8.4 103 13 C104.6 14.6 103.6 16.8 101.4 16.4 L95.4 15.1 C93.4 14.5 91.8 13 91.2 11.4 Z"
        />
        <path class="coat" d="M90.2 9 L91.2 4.6 L93 8.4 Z" />
        <path
          class="mane"
          d="M75 29.5 C78 21.5 83.5 14.5 89.6 8.8 L88.4 11.6 C84 15.2 80.6 20.6 78.6 29.8 Z"
        />
        <circle cx="96" cy="11.2" r="0.75" fill="#0d0907" />
        <path d="M101.6 15.6 L80 21.5" stroke="#1d1d1f" stroke-width="0.55" fill="none" />
      </g>

      <rect x="50" y="25.5" width="11" height="8.5" rx="1.8" :fill="color" v-bind="edge" />
      <text class="number" x="55.5" y="32" text-anchor="middle" :fill="ink">{{ lane }}</text>
      <path d="M53.5 24.8 C56 23.2 61 23.2 63.5 24.8 L62.5 26.4 L54.5 26.4 Z" fill="#2a2a2c" />

      <g v-for="item in nearShapes" :key="item.name" class="near">
        <g
          class="anim"
          :class="`${item.kind}-upper`"
          :style="{ transformOrigin: item.upperOrigin, animationDelay: item.delay }"
        >
          <path :d="item.upper" />
          <circle :cx="item.x" :cy="item.joint" r="2" />
          <g
            class="anim"
            :class="`${item.kind}-lower`"
            :style="{ transformOrigin: item.lowerOrigin, animationDelay: item.delay }"
          >
            <path :d="item.lower" />
            <path class="hoof" :d="item.hoof" />
          </g>
        </g>
      </g>

      <g class="anim jockey">
        <path
          d="M64.6 24.8 L62.8 30.4"
          stroke="#1d1d1f"
          stroke-width="1.9"
          stroke-linecap="round"
        />
        <path
          d="M56 21.5 C59.5 20.6 62.8 21.2 65.4 23.2 L64.2 25.6 C61.6 24.4 58.8 24 56.4 24.6 Z"
          fill="#f4f4f2"
          v-bind="edge"
        />
        <path
          d="M55 22.5 C56.5 17.5 60.5 14.5 66.5 13.6 L68.4 16.6 C63.8 17.4 60.6 19.6 59.4 23.4 Z"
          :fill="color"
          v-bind="edge"
        />
        <ellipse cx="71.4" cy="13.2" rx="1.4" ry="1.7" fill="#e4c9b4" />
        <path
          d="M67.8 11.9 A2.6 2.6 0 0 1 73 11.4 L73.4 12 L67.9 12.4 Z"
          :fill="color"
          v-bind="edge"
        />
        <path d="M72.6 11.4 L74.8 12" stroke="#1d1d1f" stroke-width="0.8" stroke-linecap="round" />
        <g class="anim arms">
          <path
            d="M66.8 15 L70.4 19.4 L77.4 21"
            :stroke="color"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          <circle cx="78" cy="21.2" r="1.1" fill="#e4c9b4" />
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.horse {
  /* One stride. A parent can freeze the gallop by setting --gallop-state: paused. */
  --stride: 0.56s;
  overflow: visible;
}

.coat,
.near path,
.near circle {
  fill: #4a2f1f;
}

.far path,
.far circle {
  fill: #34221a;
}

.mane {
  fill: #1c130e;
}

.far .hoof,
.near .hoof {
  fill: #2a1c14;
}

.number {
  font: 700 6px var(--font-sans);
}

.galloping .anim {
  animation-duration: var(--stride);
  animation-iteration-count: infinite;
  animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  animation-play-state: var(--gallop-state, running);
}

.galloping .pitch {
  transform-origin: 56px 36px;
  animation-name: pitch;
}

.galloping .neck {
  transform-origin: 77px 30px;
  animation-name: nod;
}

.galloping .tail {
  transform-origin: 31px 29px;
  animation-name: tail;
}

.galloping .jockey {
  transform-origin: 57px 24px;
  animation-name: ride;
}

.galloping .arms {
  transform-origin: 67px 15px;
  animation-name: push;
}

.galloping .hind-upper {
  animation-name: hind-upper;
  animation-timing-function: linear;
}

.galloping .hind-lower {
  animation-name: hind-lower;
  animation-timing-function: linear;
}

.galloping .fore-upper {
  animation-name: fore-upper;
  animation-timing-function: linear;
}

.galloping .fore-lower {
  animation-name: fore-lower;
  animation-timing-function: linear;
}

/* Angles: negative = hoof forward (towards the head), positive = hoof back. */
@keyframes hind-upper {
  0% {
    transform: rotate(-24deg);
  }
  24% {
    transform: rotate(24deg);
  }
  36% {
    transform: rotate(34deg);
  }
  56% {
    transform: rotate(10deg);
  }
  76% {
    transform: rotate(-18deg);
  }
  90% {
    transform: rotate(-32deg);
  }
  100% {
    transform: rotate(-24deg);
  }
}

@keyframes hind-lower {
  0% {
    transform: rotate(4deg);
  }
  24% {
    transform: rotate(12deg);
  }
  36% {
    transform: rotate(-30deg);
  }
  52% {
    transform: rotate(-60deg);
  }
  68% {
    transform: rotate(-55deg);
  }
  82% {
    transform: rotate(-24deg);
  }
  93% {
    transform: rotate(4deg);
  }
  100% {
    transform: rotate(4deg);
  }
}

@keyframes fore-upper {
  0% {
    transform: rotate(-28deg);
  }
  24% {
    transform: rotate(22deg);
  }
  36% {
    transform: rotate(32deg);
  }
  54% {
    transform: rotate(18deg);
  }
  72% {
    transform: rotate(-20deg);
  }
  87% {
    transform: rotate(-44deg);
  }
  100% {
    transform: rotate(-28deg);
  }
}

@keyframes fore-lower {
  0% {
    transform: rotate(0deg);
  }
  24% {
    transform: rotate(8deg);
  }
  36% {
    transform: rotate(60deg);
  }
  52% {
    transform: rotate(110deg);
  }
  66% {
    transform: rotate(95deg);
  }
  78% {
    transform: rotate(35deg);
  }
  89% {
    transform: rotate(-6deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

/* Nose up on the hind stance, nose down on the fore stance. */
@keyframes pitch {
  0% {
    transform: translateY(1px) rotate(0deg);
  }
  16% {
    transform: translateY(1.6px) rotate(-2.6deg);
  }
  40% {
    transform: translateY(1px) rotate(0deg);
  }
  56% {
    transform: translateY(1.6px) rotate(2deg);
  }
  76% {
    transform: translateY(-1.4px) rotate(0deg);
  }
  90% {
    transform: translateY(-2px) rotate(-0.8deg);
  }
  100% {
    transform: translateY(1px) rotate(0deg);
  }
}

@keyframes nod {
  0% {
    transform: rotate(-4deg);
  }
  30% {
    transform: rotate(-1deg);
  }
  56% {
    transform: rotate(7deg);
  }
  76% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(-4deg);
  }
}

@keyframes tail {
  0% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(7deg);
  }
  100% {
    transform: rotate(-5deg);
  }
}

/* The jockey counters the pitch and absorbs the bob with the knees, so the head stays level. */
@keyframes ride {
  0% {
    transform: translateY(-0.6px) rotate(0deg);
  }
  16% {
    transform: translateY(-1.2px) rotate(2.2deg);
  }
  40% {
    transform: translateY(-0.6px) rotate(0deg);
  }
  56% {
    transform: translateY(-1.2px) rotate(-1.6deg);
  }
  76% {
    transform: translateY(1.1px) rotate(0deg);
  }
  90% {
    transform: translateY(1.6px) rotate(0.6deg);
  }
  100% {
    transform: translateY(-0.6px) rotate(0deg);
  }
}

/* Hands follow the neck: forward when the head goes down. */
@keyframes push {
  0% {
    transform: rotate(-7deg);
  }
  30% {
    transform: rotate(-3deg);
  }
  56% {
    transform: rotate(9deg);
  }
  76% {
    transform: rotate(2deg);
  }
  100% {
    transform: rotate(-7deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .galloping .anim {
    animation: none;
  }
}
</style>
