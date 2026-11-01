<template>
  <header class="header">
    <h1 class="brand" lang="tr">
      <!-- The crescent and star keep the flag's proportions, cropped to a circle in the accent red. -->
      <svg class="flag" viewBox="165 70 660 660" aria-hidden="true">
        <circle class="red" cx="495" cy="400" r="330" />
        <circle cx="425" cy="400" r="200" fill="#fff" />
        <circle class="red" cx="475" cy="400" r="160" />
        <polygon
          points="583.334,400 764.235,458.779 652.431,304.894 652.431,495.106 764.235,341.221"
          fill="#fff"
        />
      </svg>
      Cumhuriyet Cup
    </h1>
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

.flag {
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-right: 2px;
  vertical-align: -5px;
}

.red {
  fill: var(--color-accent);
}

.subtitle {
  color: var(--color-text-2);
  font-size: var(--font-size-body);
}

@media (max-width: 599px) {
  .header {
    flex-direction: column;
    gap: 0;
    padding: var(--space-4) 0 14px;
  }

  .brand {
    font-size: 1.05rem;
  }

  .flag {
    width: 20px;
    height: 20px;
  }

  .subtitle {
    font-size: 0.85rem;
  }
}
</style>
