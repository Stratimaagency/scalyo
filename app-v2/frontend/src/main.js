
// Fix: suppress ApexCharts ResizeObserver/MutationObserver benign errors
const _origError = window.onerror
window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('ResizeObserver loop') || e.message.includes('MutationObserver'))) {
    e.stopImmediatePropagation()
    return true
  }
}, true)
// Fix: suppress unhandled promise rejections from ApexCharts
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ApexCharts') || e.reason?.message?.includes('MutationObserver')) {
    e.preventDefault()
  }
})

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './i18n'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(VueApexCharts)
app.mount('#app')
