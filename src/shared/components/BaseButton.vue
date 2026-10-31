<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>(), {
  variant: 'secondary',
  disabled: false,
})
</script>

<template>
  <button type="button" class="button" :class="variant" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.button:hover:not(:disabled) {
  background: var(--color-fill);
}

.primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: #fff;
}

.primary:hover:not(:disabled) {
  border-color: var(--color-accent-hover);
  background: var(--color-accent-hover);
}

.button:disabled {
  border-color: var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.primary:disabled {
  border-color: var(--color-fill-disabled);
  background: var(--color-fill-disabled);
}
</style>
