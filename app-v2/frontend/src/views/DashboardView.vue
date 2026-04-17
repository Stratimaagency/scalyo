<template>
  <div class="dashboard">

    <!-- HEADER -->
    <div class="dash-header">
      <div class="dash-greeting">
        <h1>{{ t(`greeting_${auth.greeting}`) }}, {{ auth.user?.firstName }} 👋</h1>
        <p class="dash-date">{{ formattedDate }}</p>
      </div>
      <div class="dash-header-right">
        <div class="dash-badges">
          <span class="badge plan">{{ auth.company?.planLabel }}</span>
          <span class="badge role">{{ auth.user?.roleLabel }}</span>
        </div>
      </div>
    </div>

    <!-- KPI SECTION -->
    <div class="kpi-header-row">
      <h2 class="kpi-section-title">KPIs</h2>
      <div class="kpi-header-actions">
        <!-- Sélecteur période de comparaison -->
        <div class="period-selector">
          <span class="period-label">{{ t('dash_compare_with') }}</span>
          <div class="period-pills">
            <button
              v-for="p in periods"
              :key="p.key"
              class="period-pill"
              :class="{ active: snapStore.comparePeriod === p.key }"
              @click="snapStore.comparePeriod = p.key"
            >{{ t(p.label) }}</button>
          </div>
        </div>
        <button class="btn-customize" @click="customizerOpen = true">⚙ {{ t('kpi_cust_title') }}</button>
      </div>
    </div>

    <div class="kpi-grid" :style="{ '--kpi-cols': Math.min(visibleKpis.length, 6) }">
      <div v-for="kpi in visibleKpis" :key="kpi.id" class="kpi-card" :class="kpi.trend">
        <div class="kpi-icon">{{ kpi.icon }}</div>
        <div class="kpi-data">
          <span class="kpi-value">{{ kpi.value }}</span>
          <span class="kpi-label">{{ kpi.label }}</span>
        </div>
        <span v-if="kpi.change?.value" class="kpi-change" :class="kpi.change.type">
          {{ kpi.change.value }}
        </span>
        <span v-else-if="snapStore.snapshots.length <= 1" class="kpi-change neutral" :title="t('dash_no_history')">—</span>
      </div>
    </div>

    <!-- TWO COLUMNS -->
    <div class="dash-columns">

      <!-- Comptes à surveiller -->
      <div class="dash-card">
        <div class="card-header">
          <h2>{{ t('dash_watch_accounts') }}</h2>
          <router-link to="/app/satisfaction" class="card-link">{{ t('dash_view_all') }} →</router-link>
        </div>

        <!-- Donut satisfaction -->
        <div class="satisfaction-chart">
          <div class="sat-donut">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" stroke-width="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" stroke-width="10"
                :stroke-dasharray="healthyArc + ' ' + circumference"
                stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" stroke-width="10"
                :stroke-dasharray="watchArc + ' ' + circumference"
                :stroke-dashoffset="'-' + healthyArc"
                stroke-linecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#ef4444" stroke-width="10"
                :stroke-dasharray="criticalArc + ' ' + circumference"
                :stroke-dashoffset="'-' + (parseFloat(healthyArc) + parseFloat(watchArc))"
                stroke-linecap="round" transform="rotate(-90 60 60)" />
              <text x="60" y="56" text-anchor="middle" font-size="22" font-weight="800" fill="#1a1a2e">{{ clients.avgHealth }}</text>
              <text x="60" y="72" text-anchor="middle" font-size="9" fill="#6b7280">/10</text>
            </svg>
          </div>
          <div class="sat-legend">
            <div class="legend-item"><span class="dot green" /> {{ t('status_healthy') }} <strong>{{ clients.healthyCount }}</strong></div>
            <div class="legend-item"><span class="dot amber" /> {{ t('status_watch') }} <strong>{{ clients.watchCount }}</strong></div>
            <div class="legend-item"><span class="dot red" /> {{ t('status_critical') }} <strong>{{ clients.criticalCount }}</strong></div>
          </div>
        </div>

        <!-- Top comptes critiques/watch triés par health ASC -->
        <div class="top-accounts">
          <div v-for="c in watchAccounts" :key="c.id" class="account-row" @click="$router.push('/app/portfolio')">
            <div class="acc-avatar" :style="{ background: statusColor(c.status) }">{{ c.name[0] }}</div>
            <div class="acc-info">
              <strong>{{ c.name }}</strong>
              <span class="acc-industry">{{ c.industry }}</span>
            </div>
            <div class="acc-health">
              <span class="health-score" :style="{ color: statusColor(c.status) }">{{ c.health }}</span>
              <div class="health-bar-bg">
                <div class="health-bar-fill" :style="{ width: c.health * 10 + '%', background: statusColor(c.status) }" />
              </div>
            </div>
          </div>
          <div v-if="!watchAccounts.length" class="empty-tasks">{{ t('no_data') }}</div>
        </div>
      </div>

      <!-- Mes tâches — filtrées par utilisateur connecté -->
      <div class="dash-card">
        <div class="card-header">
          <h2>{{ t('dash_my_tasks') }}</h2>
          <router-link to="/app/tasks/kanban" class="card-link">{{ t('dash_view_all') }} →</router-link>
        </div>

        <div class="task-tabs">
          <button
            v-for="tab in taskTabs"
            :key="tab.key"
            class="task-tab"
            :class="{ active: activeTaskTab === tab.key }"
            @click="activeTaskTab = tab.key"
          >
            {{ t(tab.label) }} <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-item"
            :class="{ overdue: isOverdue(task) }"
          >
            <div class="task-status-dot" :class="task.status" />
            <div class="task-info">
              <strong>{{ task.title }}</strong>
              <div class="task-meta">
                <span v-if="task.clientId" class="task-client">{{ clientName(task.clientId) }}</span>
                <span class="task-due" :class="{ late: isOverdue(task) }">{{ formatDate(task.dueDate) }}</span>
              </div>
            </div>
            <span v-if="task.priority === 'urgent_important'" class="priority-badge urgent">!</span>
          </div>
          <div v-if="!filteredTasks.length" class="empty-tasks">{{ t('dash_my_tasks_empty') }}</div>
        </div>
      </div>
    </div>

    <!-- ACTIONS RAPIDES -->
    <div class="quick-actions">
      <h2>{{ t('dash_quick_actions') }}</h2>
      <div class="actions-grid">
        <button class="action-card" @click="$router.push('/app/tasks/kanban')">
          <span class="action-icon">✏️</span>
          <span>{{ t('dash_action_task') }}</span>
        </button>
        <button class="action-card" @click="$router.push('/app/portfolio')">
          <span class="action-icon">👤</span>
          <span>{{ t('dash_action_client') }}</span>
        </button>
        <button class="action-card" @click="$router.push('/app/import')">
          <span class="action-icon">📥</span>
          <span>{{ t('dash_action_import') }}</span>
        </button>
        <button class="action-card" @click="$router.push('/app/kpis')">
          <span class="action-icon">📊</span>
          <span>{{ t('sidebar_kpis') }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Customizer -->
    <KpiCustomizer
      :open="customizerOpen"
      page-id="dashboard"
      :defaults="defaultKpis"
      v-model="selectedKpis"
      @close="customizerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { useSnapshotStore } from '@/stores/snapshots'
import KpiCustomizer from '@/components/KpiCustomizer.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const clients = useClientStore()
const tasks = useTaskStore()
const snapStore = useSnapshotStore()

// ─── KPI Customizer ────────────────────────────────────────────────────────────
const customizerOpen = ref(false)
const defaultKpis = ['arr', 'health_score', 'churn_rate', 'nps', 'nrr', 'active_users']
const selectedKpis = ref(
  JSON.parse(localStorage.getItem('scalyo_dashboard_kpis') || 'null') || [...defaultKpis]
)

// Persister la sélection de KPIs dans localStorage
watch(selectedKpis, (val) => {
  localStorage.setItem('scalyo_dashboard_kpis', JSON.stringify(val))
}, { deep: true })

// ─── Période de comparaison ────────────────────────────────────────────────────
const periods = [
  { key: 'day', label: 'dash_period_day' },
  { key: 'week', label: 'dash_period_week' },
  { key: 'month', label: 'dash_period_month' },
]

// ─── Date formatée ─────────────────────────────────────────────────────────────
const formattedDate = computed(() => {
  const d = new Date()
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// ─── Valeurs actuelles des KPIs — source de vérité ────────────────────────────
const todayStr = new Date().toISOString().slice(0, 10)

const currentKpiValues = computed(() => ({
  arr: clients.totalArr,
  health_score: clients.avgHealth,
  churn_rate: clients.churnRate,
  nps: clients.avgNps,
  nrr: parseFloat((100 - clients.churnRate).toFixed(1)),
  active_users: clients.clients.length,
  critical_count: clients.criticalCount,
  healthy_count: clients.healthyCount,
  watch_count: clients.watchCount,
  tasks_overdue: tasks.tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < todayStr).length,
  tasks_todo: tasks.tasks.filter(t => t.status === 'todo').length,
  tasks_in_progress: tasks.tasks.filter(t => t.status === 'in_progress').length,
}))

// Sauvegarder snapshot automatiquement à chaque chargement du dashboard
snapStore.saveSnapshot(currentKpiValues.value)

// ─── Configuration des KPIs affichables ────────────────────────────────────────
// lowerIsBetter: true = une baisse est une bonne nouvelle (ex: churn, critiques)
const KPI_CONFIG = {
  arr: { icon: '💰', lowerIsBetter: false, format: v => '€' + (v / 1000).toFixed(0) + 'K', labelKey: 'kpi_arr' },
  health_score: { icon: '💚', lowerIsBetter: false, format: v => v + '/10', labelKey: 'kpi_health' },
  churn_rate: { icon: '📉', lowerIsBetter: true, format: v => v + '%', labelKey: 'kpi_churn' },
  nps: { icon: '📊', lowerIsBetter: false, format: v => String(v), labelKey: 'kpi_nps' },
  nrr: { icon: '🔄', lowerIsBetter: false, format: v => v + '%', labelKey: 'kpi_nrr' },
  active_users: { icon: '✅', lowerIsBetter: false, format: v => String(v), labelKey: 'kpi_active' },
  critical_count: { icon: '🔴', lowerIsBetter: true, format: v => String(v), labelKey: 'kpi_critical' },
  healthy_count: { icon: '🟢', lowerIsBetter: false, format: v => String(v), labelKey: 'kpi_health' },
  watch_count: { icon: '🟡', lowerIsBetter: true, format: v => String(v), labelKey: 'kpi_nps' },
  tasks_overdue: { icon: '⏰', lowerIsBetter: true, format: v => String(v), labelKey: 'kpi_critical' },
  tasks_todo: { icon: '📋', lowerIsBetter: false, format: v => String(v), labelKey: 'status_todo' },
  tasks_in_progress: { icon: '⚡', lowerIsBetter: false, format: v => String(v), labelKey: 'status_in_progress' },
}

// ─── KPIs visibles — filtrés par selectedKpis dans l'ordre choisi ─────────────
const visibleKpis = computed(() => {
  return selectedKpis.value
    .map(id => {
      const config = KPI_CONFIG[id]
      if (!config) return null
      const currentValue = currentKpiValues.value[id]
      if (currentValue === undefined) return null
      const change = snapStore.calcChange(id, currentValue, snapStore.comparePeriod, config.lowerIsBetter)
      return {
        id,
        icon: config.icon,
        value: config.format(currentValue),
        label: t(config.labelKey),
        change,
        trend: id === 'critical_count' && currentValue > 0 ? 'warn' : '',
      }
    })
    .filter(Boolean)
})

// ─── Donut satisfaction ────────────────────────────────────────────────────────
const circumference = (2 * Math.PI * 52).toFixed(1)
const total = computed(() => clients.clients.length || 1)
const healthyArc = computed(() => ((clients.healthyCount / total.value) * parseFloat(circumference)).toFixed(1))
const watchArc = computed(() => ((clients.watchCount / total.value) * parseFloat(circumference)).toFixed(1))
const criticalArc = computed(() => ((clients.criticalCount / total.value) * parseFloat(circumference)).toFixed(1))

// ─── Comptes à surveiller — triés par health ASC (pires en premier) ───────────
const watchAccounts = computed(() =>
  [...clients.clients]
    .filter(c => c.status === 'critical' || c.status === 'watch')
    .sort((a, b) => a.health - b.health)
    .slice(0, 5)
)

// ─── Mes tâches — filtrées par utilisateur connecté ───────────────────────────
// Match sur id, firstName, displayName ou email pour couvrir tous les cas
const myTasks = computed(() => {
  const u = auth.user
  if (!u) return []
  return tasks.tasks.filter(task => {
    if (!task.assignee) return false
    const a = String(task.assignee).toLowerCase()
    return (
      a === String(u.id).toLowerCase() ||
      a === String(u.firstName).toLowerCase() ||
      a === String(u.displayName || '').toLowerCase() ||
      a === String(u.email || '').toLowerCase() ||
      a === String(u.firstName + ' ' + u.lastName).toLowerCase()
    )
  })
})

const activeTaskTab = ref('all')

const taskTabs = computed(() => [
  { key: 'all', label: 'dash_tasks_all', count: myTasks.value.filter(t => t.status !== 'done').length },
  { key: 'todo', label: 'status_todo', count: myTasks.value.filter(t => t.status === 'todo').length },
  { key: 'in_progress', label: 'status_in_progress', count: myTasks.value.filter(t => t.status === 'in_progress').length },
  { key: 'blocked', label: 'status_blocked', count: myTasks.value.filter(t => t.status === 'blocked').length },
])

const filteredTasks = computed(() => {
  const list = activeTaskTab.value === 'all'
    ? myTasks.value.filter(t => t.status !== 'done')
    : myTasks.value.filter(t => t.status === activeTaskTab.value)
  return list.slice(0, 6)
})

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isOverdue(task) {
  return task.status !== 'done' && task.dueDate && task.dueDate < todayStr
}

function clientName(id) {
  return clients.clients.find(c => c.id === id)?.name || ''
}

function formatDate(d) {
  if (!d) return ''
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(d).toLocaleDateString(loc, { day: 'numeric', month: 'short' })
}

function statusColor(status) {
  return status === 'healthy' ? '#10b981' : status === 'watch' ? '#f59e0b' : '#ef4444'
}

// ─── Reset all data ────────────────────────────────────────────────────────
function resetAllData() {
  if (!confirm(t('dashboard_reset_confirm'))) return
  clients.clients.length = 0
  team.members.length = 0
  tasks.tasks.length = 0
  tasks.projects.length = 0
  // Clear localStorage
  ['scalyo_clients','scalyo_tasks','scalyo_team','scalyo_projects','scalyo_kpis',
   'scalyo_playbooks','scalyo_snapshots','scalyo_okr','scalyo_roadmap',
   'scalyo_quotes','scalyo_dashboard_kpis','scalyo_coach_messages'].forEach(k => localStorage.removeItem(k))
}

</script>

<style scoped>
.dashboard { max-width: 1200px; }

/* ─── Header ──────────────────────────────────────────────────────────────────── */
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.dash-greeting h1 { font-size: 1.6rem; font-weight: 800; color: var(--text); }
.dash-date { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; text-transform: capitalize; }
.dash-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.dash-badges { display: flex; gap: 6px; }
.badge { font-size: 0.7rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
.badge.plan { background: var(--purple-bg); color: var(--purple); }
.badge.role { background: var(--green-bg); color: var(--green); }

/* ─── KPI Header ──────────────────────────────────────────────────────────────── */
.kpi-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
.kpi-section-title { font-size: 0.9rem; font-weight: 700; }
.kpi-header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.period-selector { display: flex; align-items: center; gap: 8px; }
.period-label { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; }
.period-pills { display: flex; gap: 2px; background: var(--bg); border-radius: 8px; padding: 2px; }
.period-pill { background: none; border: none; color: var(--text-muted); font-size: 0.72rem; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; font-weight: 500; white-space: nowrap; }
.period-pill.active { background: var(--purple); color: #fff; font-weight: 600; }
.btn-customize { background: #fff; border: 1px solid var(--border); padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.btn-customize:hover { border-color: var(--purple); color: var(--purple); }

/* ─── KPI Grid — colonnes dynamiques selon nombre de KPIs ─────────────────────── */
.kpi-grid { display: grid; grid-template-columns: repeat(var(--kpi-cols, 6), 1fr); gap: 14px; margin-bottom: 28px; }
.kpi-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 16px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; position: relative; overflow: hidden; }
.kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.kpi-card.warn { border-left: 3px solid var(--red); }
.kpi-icon { font-size: 1.5rem; }
.kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.kpi-label { font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; display: block; }
.kpi-change { position: absolute; top: 14px; right: 14px; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.kpi-change.up { background: var(--green-bg); color: var(--green); }
.kpi-change.down { background: var(--red-bg); color: var(--red); }
.kpi-change.down-good { background: var(--green-bg); color: var(--green); }
.kpi-change.neutral { background: var(--bg); color: var(--text-muted); }

/* ─── Two columns ─────────────────────────────────────────────────────────────── */
.dash-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
.dash-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.card-header h2 { font-size: 1rem; font-weight: 700; }
.card-link { font-size: 0.78rem; color: var(--purple); font-weight: 500; }
.card-link:hover { text-decoration: underline; }

/* ─── Donut satisfaction ──────────────────────────────────────────────────────── */
.satisfaction-chart { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
.sat-donut { width: 120px; height: 120px; flex-shrink: 0; }
.sat-donut svg { width: 100%; height: 100%; }
.sat-legend { display: flex; flex-direction: column; gap: 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
.legend-item strong { color: var(--text); margin-left: auto; min-width: 20px; text-align: right; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.green { background: var(--green); }
.dot.amber { background: var(--amber); }
.dot.red { background: var(--red); }

/* ─── Comptes à surveiller ────────────────────────────────────────────────────── */
.top-accounts { display: flex; flex-direction: column; gap: 6px; }
.account-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--radius-sm); transition: background 0.15s; cursor: pointer; }
.account-row:hover { background: var(--bg-hover); }
.acc-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.acc-info { flex: 1; min-width: 0; }
.acc-info strong { font-size: 0.82rem; display: block; }
.acc-industry { font-size: 0.7rem; color: var(--text-muted); }
.acc-health { text-align: right; min-width: 60px; }
.health-score { font-weight: 700; font-size: 0.9rem; }
.health-bar-bg { height: 3px; background: var(--border-light); border-radius: 2px; margin-top: 4px; }
.health-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

/* ─── Mes tâches ──────────────────────────────────────────────────────────────── */
.task-tabs { display: flex; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
.task-tab { background: var(--bg); border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; color: var(--text-muted); font-weight: 500; transition: all 0.15s; cursor: pointer; }
.task-tab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.tab-count { font-size: 0.68rem; margin-left: 4px; background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px; }
.task-tab.active .tab-count { background: rgba(124,58,237,0.12); }
.task-list { display: flex; flex-direction: column; gap: 6px; }
.task-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); transition: all 0.15s; }
.task-item:hover { border-color: var(--border); background: var(--bg-hover); }
.task-item.overdue { border-left: 3px solid var(--red); }
.task-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.task-status-dot.todo { background: var(--text-muted); }
.task-status-dot.in_progress { background: var(--blue); }
.task-status-dot.blocked { background: var(--red); }
.task-info { flex: 1; min-width: 0; }
.task-info strong { font-size: 0.82rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.task-meta { display: flex; gap: 8px; margin-top: 3px; }
.task-client { font-size: 0.7rem; color: var(--purple); background: var(--purple-bg); padding: 1px 6px; border-radius: 4px; }
.task-due { font-size: 0.7rem; color: var(--text-muted); }
.task-due.late { color: var(--red); font-weight: 600; }
.priority-badge { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.priority-badge.urgent { background: var(--red-bg); color: var(--red); }
.empty-tasks { text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem; }

/* ─── Quick actions ───────────────────────────────────────────────────────────── */
.quick-actions h2 { font-size: 1rem; font-weight: 700; margin-bottom: 14px; }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.action-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: all 0.2s; font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); cursor: pointer; }
.action-card:hover { border-color: var(--purple); color: var(--purple); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.action-icon { font-size: 1.5rem; }

/* ─── Responsive ──────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-columns { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-greeting h1 { font-size: 1.3rem; }
  .kpi-header-row { flex-direction: column; align-items: flex-start; }
  .period-selector { flex-wrap: wrap; }
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
}

.dash-header-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
.dash-header-row .section-title { margin-bottom:0; }
.btn-reset-data { background:none;border:1px solid var(--border,#e5e7eb);color:var(--text-muted,#6b7280);padding:7px 14px;border-radius:8px;font-size:0.82rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px; }
.btn-reset-data:hover { border-color:#ef4444;color:#ef4444; }
</style>
