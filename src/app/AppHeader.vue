<template>
  <header class="header">
    <h1 class="brand" lang="tr"><span class="mark" aria-hidden="true"></span>Cumhuriyet Cup</h1>
    <p class="subtitle">Horse Racing Simulator</p>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  padding: 22px 0 var(--space-5);
}

.brand {
  font-size: 1.15rem;
  font-weight: 600;
}

.mark {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 9px;
  border-radius: 50%;
  background: var(--color-accent);
  transform: translateY(-2px);
}

.subtitle {
  color: var(--color-text-2);
  font-size: var(--font-size-body);
}
</style>
