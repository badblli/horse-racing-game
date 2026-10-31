import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const e2e = mode === 'e2e'

  return {
    // GitHub Pages serves the site from /horse-racing-game/; dev and test builds stay at the root.
    base: (command === 'build' || isPreview) && !e2e ? '/horse-racing-game/' : '/',
    build: {
      outDir: e2e ? 'dist-e2e' : 'dist',
    },
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
