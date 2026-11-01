<script setup lang="ts">
import InsiderLogo from './InsiderLogo.vue'
</script>

<template>
  <header class="header">
    <div class="titles">
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
    </div>
    <p class="credit">
      Built by badblli for
      <InsiderLogo class="logo" />
      <span class="assessment">assessment</span>
    </p>
    <nav class="links" aria-label="Author links">
      <a
        href="https://github.com/badblli"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        <span class="link-label">GitHub</span>
      </a>
      <a
        href="https://badblli.dev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Website, badblli.dev"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path
            d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5z"
          />
        </svg>
        <span class="link-label">badblli.dev</span>
      </a>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 22px 0 var(--space-5);
}

.titles {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  min-width: 0;
}

.brand {
  font-size: 1.15rem;
  font-weight: 600;
  white-space: nowrap;
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

.credit {
  margin-left: auto;
  color: var(--color-text-2);
  font-size: var(--font-size-small);
  white-space: nowrap;
}

/* The logo's letters sit on the sentence's baseline. */
.logo {
  display: inline-block;
  width: auto;
  height: 18px;
  margin: 0 1px;
  color: var(--color-text);
  vertical-align: -4.5px;
}

.assessment {
  margin-left: 4px;
}

.links {
  display: flex;
  flex: none;
  gap: var(--space-2);
}

.links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 36px;
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-text-2);
  font-size: var(--font-size-small);
  font-weight: 500;
  text-decoration: none;
  transition:
    color 0.15s,
    background 0.15s;
}

.links a:hover {
  background: var(--color-fill);
  color: var(--color-text);
}

.links svg {
  width: 16px;
  height: 16px;
}

/* The credit needs the room on tablets; the page title still names the simulator. */
@media (max-width: 1023px) {
  .subtitle,
  .assessment {
    display: none;
  }
}

/* Small tablets keep the icons only; the buttons stay labelled for screen readers. */
@media (max-width: 719px) {
  .links a {
    padding: 0;
  }

  .link-label {
    display: none;
  }
}

/* Phones: the credit moves under the title, the links span both rows. */
@media (max-width: 599px) {
  .header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0 var(--space-3);
    padding: var(--space-4) 0 14px;
  }

  .links {
    grid-area: 1 / 2 / 3 / 3;
  }

  .brand {
    font-size: 1.05rem;
  }

  .flag {
    width: 20px;
    height: 20px;
  }

  .credit {
    margin-left: 0;
    font-size: var(--font-size-caption);
    white-space: normal;
  }

  .logo {
    height: 16px;
    vertical-align: -4px;
  }

  .links a {
    min-width: 40px;
    height: 40px;
  }
}
</style>
