
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
import * as Sentry from '@sentry/vue'

const app = createApp(App)

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
if (SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'production',
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(b => {
          if (b.data && b.data.url) b.data.url = b.data.url.split('?')[0]
          return b
        })
      }
      return event
    }
  })
}
app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(VueApexCharts)

// Global error handler — catches all Vue + JS errors
app.config.errorHandler = (err, instance, info) => {
  console.error('[Scalyo Error]', { error: err?.message || err, component: instance?.$options?.name || 'unknown', info })
  if (SENTRY_DSN) Sentry.captureException(err)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Scalyo Unhandled Promise]', event.reason)
  if (SENTRY_DSN) Sentry.captureException(event.reason)
})

window.onerror = (msg, source, line, col, error) => {
  console.error('[Scalyo Global Error]', { msg, source, line, col })
  if (SENTRY_DSN) Sentry.captureException(error)
  return false
}

app.mount('#app')
