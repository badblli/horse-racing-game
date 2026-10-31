<script setup lang="ts">
import { computed } from 'vue'

import { readableInk } from '../lib/color'

const props = defineProps<{
  /** `#RRGGBB`; without it the chip is a neutral placeholder. */
  color?: string
  label?: string | number
}>()

const style = computed(() =>
  props.color ? { background: props.color, color: readableInk(props.color) } : undefined,
)
</script>

<template>
  <span class="chip" :class="{ empty: !color }" :style="style">{{ label }}</span>
</template>

<style scoped>
.chip {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  /* The inner ring keeps white and yellow chips visible on light backgrounds. */
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.16);
  font-size: var(--font-size-caption);
  font-weight: 600;
  line-height: 1;
}

.empty {
  background: rgb(255 255 255 / 0.7);
  color: #8a968e;
  box-shadow: none;
}
</style>
