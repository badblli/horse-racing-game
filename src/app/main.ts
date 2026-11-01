import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { readSavedRace } from '@/features/race/composables/useSavedRace'
import { useRaceStore } from '@/features/race/store'

import App from './App.vue'
import { readRuntimeOptions } from './runtime-options'

const options = readRuntimeOptions()
const saved = options.restore ? readSavedRace() : null
const pinia = createPinia()
const app = createApp(App, { playbackRate: options.rate, startTime: saved?.time })

app.use(pinia)
const race = useRaceStore(pinia)
if (saved) race.restoreSession(saved)
// The roster is generated once here; Generate only builds new schedules over it.
else race.startSession(options.seed)

app.mount('#app')
