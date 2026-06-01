<template>
<div class="dashboard">
<DashHeader :greeting="auth.greeting" :first-name="auth.user?.firstName" :plan-label="auth.company?.planLabel" :role-label="auth.user?.roleLabel" :formatted-date="formattedDate" />

<EmptyState v-if="clients.clients.length === 0" icon="📊" title-key="empty_dashboard_title" desc-key="empty_dashboard_desc" cta-key="empty_dashboard_cta" :cta-action="() => $router.push('/app/portfolio')" />

<template v-else>
<DashKpiSection :visible-kpis="visibleKpis" :periods="periods" :compare-period="snapStore.comparePeriod" @customize="customizerOpen = true" @period-change="snapStore.comparePeriod = $event" />

<AiInsightPanel module="dashboard" :title="t('ai_dashboard_title')" :button-label="t('ai_dashboard_btn')" :message="t('ai_dashboard_prompt')" />

<div class="dash-columns">
<DashWatchAccounts :watch-accounts="watchAccounts" :healthy-arc="healthyArc" :watch-arc="watchArc" :critical-arc="criticalArc" :circumference="circumference" :total-clients="clients.clients.length" :healthy-count="clients.healthyCount" :watch-count="clients.watchCount" :critical-count="clients.criticalCount" />
<DashMyTasks :filtered-tasks="filteredTasks" :task-tabs="taskTabs" :active-tab="activeTaskTab" :clients-map="clientsMap" @tab-change="activeTaskTab = $event" />
</div>

<DashQuickActions />
<KpiCustomizer :open="customizerOpen" page-id="dashboard" :defaults="defaultKpis" v-model="selectedKpis" @close="customizerOpen = false" />
</template>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { useSnapshotStore } from '@/stores/snapshots'
import { KPI_CATALOG, KPI_CATEGORIES } from '@/data/kpiCatalog'
import KpiCustomizer from '@/components/KpiCustomizer.vue'
import DashHeader from '@/components/dashboard/DashHeader.vue'
import DashKpiSection from '@/components/dashboard/DashKpiSection.vue'
import DashWatchAccounts from '@/components/dashboard/DashWatchAccounts.vue'
import DashMyTasks from '@/components/dashboard/DashMyTasks.vue'
import DashQuickActions from '@/components/dashboard/DashQuickActions.vue'
import AiInsightPanel from '@/components/ai/AiInsightPanel.vue'
import EmptyState from '@/components/EmptyState.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const clients = useClientStore()
const tasks = useTaskStore()
const snapStore = useSnapshotStore()

const customizerOpen = ref(false)
const defaultKpis = ['arr', 'health_score', 'churn_rate', 'nps', 'nrr', 'active_users']
const selectedKpis = ref(JSON.parse(localStorage.getItem('scalyo_dashboard_kpis') || 'null') || [...defaultKpis])
watch(selectedKpis, (val) => { localStorage.setItem('scalyo_dashboard_kpis', JSON.stringify(val)) })

const periods = [{ key: '7d', label: 'period_7d' }, { key: '30d', label: 'period_30d' }, { key: '90d', label: 'period_90d' }]
const LOCALE_MAP = { ko: 'ko-KR', en: 'en-US', fr: 'fr-FR' }
const PERIOD_DAYS = { '7d': 7, '30d': 30, '90d': 90 }

const formattedDate = computed(() => {
  const d = new Date()
  return d.toLocaleDateString(LOCALE_MAP[locale.value] || 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const currentPeriodDays = computed(() => PERIOD_DAYS[snapStore.comparePeriod] || 30)

// Get beginning-of-period ARR from snapshot (for real NRR)
const beginningArr = computed(() => {
  const past = snapStore.getSnapshot(snapStore.comparePeriod)
  return past?.arr || null
})

const currentKpiValues = DATA_SOURCES

// Save snapshot once after clients load — correct arg (kpiValues only)
watch(() => clients.clients.length, (len) => {
  if (len > 0) snapStore.saveSnapshot?.(currentKpiValues.value)
}, { once: true })

// Catalog-based KPI config (source: kpiCatalog.js)
const catalogMap = Object.fromEntries(KPI_CATALOG.map(k => [k.id, k]))
const categoryMap = Object.fromEntries(KPI_CATEGORIES.map(c => [c.id, c]))
const DATA_SOURCES = computed(() => ({
  arr: clients.totalArr,
  health_score: clients.avgHealth,
  churn_rate: clients.getChurnRate(currentPeriodDays.value),
  nps: clients.avgNps,
  nrr: clients.getNrr(beginningArr.value, currentPeriodDays.value),
  active_users: clients.activeCount,
}))
const WARN_RULES = { health_score: { below: 5 }, churn_rate: { above: 10 }, nps: { below: 30 }, nrr: { below: 85 } }

const visibleKpis = computed(() => {
return selectedKpis.value.map(id => {
const cat = catalogMap[id]
if (!cat) return null
const catIcon = categoryMap[cat.cat]?.icon || '📊'
const currentValue = currentKpiValues.value[id] ?? null
const display = formatKpiValue(currentValue, cat.format)
const lowerIsBetter = !!cat.inverse
const change = currentValue != null ? snapStore.calcChange(id, currentValue, snapStore.comparePeriod, lowerIsBetter) : null
const rule = WARN_RULES[id]
const warn = rule && currentValue != null ? (rule.above != null ? currentValue > rule.above : rule.below != null ? currentValue < rule.below : false) : false
const label = locale.value === 'en' ? (cat.labelEN || cat.label) : locale.value === 'ko' ? (cat.labelKO || cat.label) : cat.label
return { id, icon: catIcon, label, display, warn, change: change?.value ?? null, changeLabel: change?.label ?? '', changeClass: change?.class ?? 'neutral' }
}).filter(Boolean)
})

function formatKpiValue(v, format) {
if (v == null) return '\u2014'
const loc = LOCALE_MAP[locale.value] || 'fr-FR'
if (format === 'currency') { const cur = locale.value === 'ko' ? 'KRW' : 'EUR'; return new Intl.NumberFormat(loc, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(v) }
if (format === 'percentage' || format === 'percent') return new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(v) + '%'
if (format === 'score' || format === 'decimal') return new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v)
if (format === 'ratio') return new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v) + 'x'
if (format === 'days') return String(Math.round(v)) + 'j'
if (format === 'hours') return new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(v) + 'h'
if (format === 'number' || format === 'integer') return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(v)
return String(v)
}

const circumference = (2 * Math.PI * 52).toFixed(1)
const total = computed(() => clients.clients.length || 1)
const healthyArc = computed(() => ((clients.healthyCount / total.value) * circumference).toFixed(1))
const watchArc = computed(() => ((clients.watchCount / total.value) * circumference).toFixed(1))
const criticalArc = computed(() => ((clients.criticalCount / total.value) * circumference).toFixed(1))

const watchAccounts = computed(() =>
  clients.clients.filter(c => clients.getEffectiveStatus(c) !== 'healthy').sort((a, b) => (a.health || 0) - (b.health || 0)).slice(0, 5)
)

const myTasks = computed(() => {
  const u = auth.user; if (!u) return []
  return tasks.tasks.filter(task => { const a = String(task.assignee).toLowerCase(); return a === u.id || a === u.firstName?.toLowerCase() || a === u.displayName?.toLowerCase() || a === u.email?.toLowerCase() })
})
const activeTaskTab = ref('all')
const taskTabs = computed(() => [
  { key: 'all', label: 'task_all', count: myTasks.value.length },
  { key: 'in_progress', label: 'task_in_progress', count: myTasks.value.filter(t => t.status === 'in_progress').length },
  { key: 'todo', label: 'task_todo', count: myTasks.value.filter(t => t.status === 'todo').length },
  { key: 'blocked', label: 'task_blocked', count: myTasks.value.filter(t => t.status === 'blocked').length }
])
const filteredTasks = computed(() => {
  const list = activeTaskTab.value === 'all' ? myTasks.value : myTasks.value.filter(t => t.status === activeTaskTab.value)
  return list.slice(0, 8)
})
const clientsMap = computed(() => { const map = {}; clients.clients.forEach(c => { map[c.id] = c.name }); return map })

</script>

<style scoped>
.dashboard { max-width: 1200px; }
.dash-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
@media (max-width: 768px) { .dash-columns { grid-template-columns: 1fr; } }
</style>
