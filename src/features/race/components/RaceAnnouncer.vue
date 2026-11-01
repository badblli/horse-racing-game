<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <!-- Milestones only; the visible status line changes too often to be read aloud. -->
  <p class="announcer" role="status" aria-live="polite">{{ message }}</p>
</template>

<style scoped>
.announcer {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  /* Announcements carry on while a phone shows another tab. */
  visibility: visible;
}
</style>
