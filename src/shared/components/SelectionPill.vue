<script setup lang="ts">
defineProps<{
  /** The selected segment, from 0. */
  index: number
  /** How many equal segments share the control. */
  count: number
}>()
</script>

<template>
  <span class="pill" aria-hidden="true" :style="{ '--index': index, '--count': count }"></span>
</template>

<style scoped>
/* The moving background of a segmented control with 2 px of padding and gaps. Its parent is
   positioned, and the buttons that follow it in the markup paint on top. */
.pill {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px - (var(--count) - 1) * 2px) / var(--count));
  border-radius: 7px;
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
  pointer-events: none;
  transform: translateX(calc(var(--index) * (100% + 2px)));
  transition: transform 0.26s cubic-bezier(0.3, 0.7, 0.3, 1);
}
</style>
