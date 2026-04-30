
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

// Global error handler — catches all Vue + JS errors
app.config.errorHandler = (err, instance, info) => {
  console.error('[Scalyo Error]', { error: err?.message || err, component: instance?.$options?.name || 'unknown', info })
  // TODO: plug Sentry here when ready — Sentry.captureException(err)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Scalyo Unhandled Promise]', event.reason)
  // TODO: plug Sentry here — Sentry.captureException(event.reason)
})

window.onerror = (msg, source, line, col, error) => {
  console.error('[Scalyo Global Error]', { msg, source, line, col })
  // TODO: plug Sentry here — Sentry.captureException(error)
  return false
}

app.mount('#app')
