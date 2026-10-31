import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { useRaceStore } from '@/features/race/store'

import App from './App.vue'
import { readRuntimeOptions } from './runtime-options'

const options = readRuntimeOptions()
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
// The roster is generated once here; Generate only builds new schedules over it.
useRaceStore(pinia).startSession(options.seed)

app.mount('#app')
