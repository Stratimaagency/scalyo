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
