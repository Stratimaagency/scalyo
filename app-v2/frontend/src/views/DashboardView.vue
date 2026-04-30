<template>
  <div class="dashboard">
    <DashHeader
      :greeting="auth.greeting"
      :first-name="auth.user?.firstName"
      :plan-label="auth.company?.planLabel"
      :role-label="auth.user?.roleLabel"
      :formatted-date="formattedDate"
    />

    <DashKpiSection
      :visible-kpis="visibleKpis"
      :periods="periods"
      :compare-period="snapStore.comparePeriod"
      @customize="customizerOpen = true"
      @period-change="snapStore.comparePeriod = $event"
    />

    <div class="dash-columns">
      <DashWatchAccounts
        :watch-accounts="watchAccounts"
        :healthy-arc="healthyArc"
        :watch-arc="watchArc"
        :critical-arc="criticalArc"
        :circumference="circumference"
        :total-clients="clients.clients.length"
        :healthy-count="clients.healthyCount"
        :watch-count="clients.watchCount"
        :critical-count="clients.criticalCount"
      />

      <DashMyTasks
        :filtered-tasks="filteredTasks"
        :task-tabs="taskTabs"
        :active-tab="activeTaskTab"
        :clients-map="clientsMap"
        @tab-change="activeTaskTab = $event"
      />
    </div>

    <DashQuickActions />

    <KpiCustomizer
      :open="customizerOpen"
      :selected="selectedKpis"
      @close="customizerOpen = false"
      @update:selected="selectedKpis = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { useSnapshotStore } from '@/stores/snapshots'
import KpiCustomizer from '@/components/KpiCustomizer.vue'
import DashHeader from '@/components/dashboard/DashHeader.vue'
import DashKpiSection from '@/components/dashboard/DashKpiSection.vue'
import DashWatchAccounts from '@/components/dashboard/DashWatchAccounts.vue'
import DashMyTasks from '@/components/dashboard/DashMyTasks.vue'
import DashQuickActions from '@/components/dashboard/DashQuickActions.vue'
import AiInsightPanel from '@/components/ai/AiInsightPanel.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const clients = useClientStore()
const tasks = useTaskStore()
const snapStore = useSnapshotStore()

const customizerOpen = ref(false)
const defaultKpis = ['arr', 'health_score', 'churn_rate', 'nps', 'nrr', 'active_users']
const selectedKpis = ref(
  JSON.parse(localStorage.getItem('scalyo_dashboard_kpis') || 'null') || [...defaultKpis]
)
watch(selectedKpis, (val) => {
  localStorage.setItem('scalyo_dashboard_kpis', JSON.stringify(val))
})

const periods = [
  { key: '7d',  label: 'period_7d' },
  { key: '30d', label: 'period_30d' },
  { key: '90d', label: 'period_90d' }
]

const formattedDate = computed(() => {
  const d = new Date()
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const todayStr = new Date().toISOString().slice(0, 10)

const currentKpiValues = computed(() => ({
  arr:          clients.totalARR,
  health_score: clients.avgHealth,
  churn_rate:   clients.churnRate,
  nps:          clients.avgNPS,
  nrr:          clients.nrr,
  active_users: clients.activeCount,
  csat:         clients.avgCSAT,
  expansion:    clients.expansionRate,
  tickets:      clients.openTickets,
  onboarding:   clients.onboardingCount
}))

snapStore.saveSnapshot?.(todayStr, currentKpiValues.value)

const KPI_CONFIG = {
  arr:          { icon: '💰', format: 'currency', lowerIsBetter: false },
  health_score: { icon: '💚', format: 'decimal',  lowerIsBetter: false },
  churn_rate:   { icon: '📉', format: 'percent',  lowerIsBetter: true },
  nps:          { icon: '⭐', format: 'integer',  lowerIsBetter: false },
  nrr:          { icon: '🔄', format: 'percent',  lowerIsBetter: false },
  active_users: { icon: '👥', format: 'integer',  lowerIsBetter: false },
  csat:         { icon: '😊', format: 'decimal',  lowerIsBetter: false },
  expansion:    { icon: '📈', format: 'percent',  lowerIsBetter: false },
  tickets:      { icon: '🎫', format: 'integer',  lowerIsBetter: true },
  onboarding:   { icon: '🚀', format: 'integer',  lowerIsBetter: false }
}

const visibleKpis = computed(() => {
  return selectedKpis.value.map(id => {
    const config = KPI_CONFIG[id]
    if (!config) return null
    const currentValue = currentKpiValues.value[id]
    const display = formatKpiValue(currentValue, config.format)
    const change = snapStore.calcChange(id, currentValue, snapStore.comparePeriod, config.lowerIsBetter)
    return {
      id, icon: config.icon, display,
      warn: config.lowerIsBetter ? currentValue > 5 : currentValue < 3,
      change: change?.value ?? null,
      changeLabel: change?.label ?? '',
      changeClass: change?.class ?? 'neutral'
    }
  }).filter(Boolean)
})

function formatKpiValue(v, format) {
  if (v == null) return String.fromCharCode(8212)
  if (format === 'currency') return String.fromCharCode(8364) + Number(v).toLocaleString()
  if (format === 'percent') return Number(v).toFixed(1) + '%'
  if (format === 'decimal') return Number(v).toFixed(1)
  return String(v)
}

const circumference = (2 * Math.PI * 52).toFixed(1)
const total = computed(() => clients.clients.length || 1)
const healthyArc = computed(() => ((clients.healthyCount / total.value) * circumference).toFixed(1))
const watchArc = computed(() => ((clients.watchCount / total.value) * circumference).toFixed(1))
const criticalArc = computed(() => ((clients.criticalCount / total.value) * circumference).toFixed(1))

const watchAccounts = computed(() =>
  clients.clients
    .filter(c => c.status !== 'healthy')
    .sort((a, b) => (a.health || 0) - (b.health || 0))
    .slice(0, 5)
)

const myTasks = computed(() => {
  const u = auth.user
  if (!u) return []
  return tasks.tasks.filter(task => {
    const a = String(task.assignee).toLowerCase()
    return a === u.id || a === u.firstName?.toLowerCase() || a === u.displayName?.toLowerCase() || a === u.email?.toLowerCase()
  })
})

const activeTaskTab = ref('all')
const taskTabs = computed(() => [
  { key: 'all',         label: 'task_all',         count: myTasks.value.length },
  { key: 'in_progress', label: 'task_in_progress', count: myTasks.value.filter(t => t.status === 'in_progress').length },
  { key: 'todo',        label: 'task_todo',        count: myTasks.value.filter(t => t.status === 'todo').length },
  { key: 'blocked',     label: 'task_blocked',     count: myTasks.value.filter(t => t.status === 'blocked').length }
])

const filteredTasks = computed(() => {
  const list = activeTaskTab.value === 'all'
    ? myTasks.value
    : myTasks.value.filter(t => t.status === activeTaskTab.value)
  return list.slice(0, 8)
})

const clientsMap = computed(() => {
  const map = {}
  clients.clients.forEach(c => { map[c.id] = c.name })
  return map
})

const aiContext = computed(() => ({
  totalClients: clients.clients?.length || 0,
  totalArr: clients.totalArr || 0,
  avgHealth: clients.avgHealth || 0,
  criticalCount: clients.criticalCount || 0,
  avgNps: clients.avgNps || 0,
  overdueTasks: tasks.overdueTasks?.length || 0,
  teamSize: auth.company?.teamSize || 0,
}))
</script>

<style scoped>
.dashboard { max-width: 1200px; }
.dash-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
@media (max-width: 768px) { .dash-columns { grid-template-columns: 1fr; } }
</style>