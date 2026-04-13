<template>
  <div class="dashboard">
    <!-- HEADER -->
    <div class="dash-header">
      <div class="dash-greeting">
        <h1>{{ t(`greeting_${auth.greeting}`) }}, {{ auth.user?.firstName }} 👋</h1>
        <p class="dash-date">{{ formattedDate }}</p>
      </div>
      <div class="dash-badges">
        <span class="badge plan">{{ auth.company?.planLabel }}</span>
        <span class="badge role">{{ auth.user?.roleLabel }}</span>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="kpi-header-row">
      <h2 class="kpi-section-title">KPIs</h2>
      <button class="btn-customize" @click="customizerOpen = true">⚙ {{ t('kpi_cust_title') }}</button>
    </div>
    <div class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card" :class="kpi.trend">
        <div class="kpi-icon">{{ kpi.icon }}</div>
        <div class="kpi-data">
          <span class="kpi-value">{{ kpi.value }}</span>
          <span class="kpi-label">{{ t(kpi.label) }}</span>
        </div>
        <span v-if="kpi.change" class="kpi-change" :class="kpi.changeType">{{ kpi.change }}</span>
      </div>
    </div>

    <!-- TWO COLUMNS -->
    <div class="dash-columns">
      <!-- Satisfaction portefeuille -->
      <div class="dash-card">
        <div class="card-header">
          <h2>{{ t('dash_satisfaction') }}</h2>
          <router-link to="/app/satisfaction" class="card-link">{{ t('dash_view_all') }} →</router-link>
        </div>
        <div class="satisfaction-chart">
          <div class="sat-donut">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" stroke-width="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" stroke-width="10"
                :stroke-dasharray="healthyArc + ' ' + circumference" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" stroke-width="10"
                :stroke-dasharray="watchArc + ' ' + circumference" :stroke-dashoffset="'-' + healthyArc" stroke-linecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#ef4444" stroke-width="10"
                :stroke-dasharray="criticalArc + ' ' + circumference" :stroke-dashoffset="'-' + (parseFloat(healthyArc) + parseFloat(watchArc))" stroke-linecap="round" transform="rotate(-90 60 60)" />
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

        <div class="top-accounts">
          <div v-for="c in topAccounts" :key="c.id" class="account-row">
            <div class="acc-avatar" :style="{ background: statusColor(c.status) }">{{ c.name[0] }}</div>
            <div class="acc-info">
              <strong>{{ c.name }}</strong>
              <span class="acc-industry">{{ c.industry }}</span>
            </div>
            <div class="acc-health">
              <span class="health-score" :style="{ color: statusColor(c.status) }">{{ c.health }}</span>
              <div class="health-bar-bg"><div class="health-bar-fill" :style="{ width: c.health * 10 + '%', background: statusColor(c.status) }" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mes tâches -->
      <div class="dash-card">
        <div class="card-header">
          <h2>{{ t('dash_my_tasks') }}</h2>
          <router-link to="/app/tasks/kanban" class="card-link">{{ t('dash_view_all') }} →</router-link>
        </div>

        <div class="task-tabs">
          <button v-for="tab in taskTabs" :key="tab.key" class="task-tab" :class="{ active: activeTaskTab === tab.key }" @click="activeTaskTab = tab.key">
            {{ t(tab.label) }} <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="task-list">
          <div v-for="task in filteredTasks" :key="task.id" class="task-item" :class="{ overdue: isOverdue(task) }">
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
          <div v-if="!filteredTasks.length" class="empty-tasks">{{ t('no_data') }}</div>
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
        <button class="action-card" @click="$router.push('/app/portfolio')">
          <span class="action-icon">💼</span>
          <span>{{ t('dash_action_portfolio') }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Customizer -->
    <KpiCustomizer :open="customizerOpen" page-id="dashboard" :defaults="defaultKpis" v-model="selectedKpis" @close="customizerOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import KpiCustomizer from '@/components/KpiCustomizer.vue'
import { useTaskStore } from '@/stores/tasks'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const clients = useClientStore()
const tasks = useTaskStore()

const customizerOpen = ref(false)
const defaultKpis = ['arr', 'health_score', 'churn_rate', 'nps', 'nrr', 'active_users']
const selectedKpis = ref([...defaultKpis])

const activeTaskTab = ref('all')

const formattedDate = computed(() => {
  const d = new Date()
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const kpis = computed(() => [
  { icon: '💰', value: '€' + (clients.totalArr / 1000).toFixed(0) + 'K', label: 'kpi_arr', change: '+12%', changeType: 'up' },
  { icon: '💚', value: clients.avgHealth + '/10', label: 'kpi_health', change: '+0.3', changeType: 'up' },
  { icon: '🔴', value: String(clients.criticalCount), label: 'kpi_critical', change: null, changeType: 'neutral', trend: clients.criticalCount > 0 ? 'warn' : '' },
  { icon: '📊', value: String(clients.avgNps), label: 'kpi_nps', change: '+5', changeType: 'up' },
  { icon: '📉', value: clients.churnRate + '%', label: 'kpi_churn', change: '-1.2%', changeType: 'down-good' },
  { icon: '✅', value: String(clients.clients.length), label: 'kpi_active', change: '+2', changeType: 'up' },
])

const circumference = (2 * Math.PI * 52).toFixed(1)
const total = computed(() => clients.clients.length || 1)
const healthyArc = computed(() => ((clients.healthyCount / total.value) * parseFloat(circumference)).toFixed(1))
const watchArc = computed(() => ((clients.watchCount / total.value) * parseFloat(circumference)).toFixed(1))
const criticalArc = computed(() => ((clients.criticalCount / total.value) * parseFloat(circumference)).toFixed(1))

const topAccounts = computed(() => [...clients.clients].sort((a, b) => a.health - b.health).slice(0, 5))

const taskTabs = computed(() => [
  { key: 'all', label: 'all', count: tasks.tasks.filter(t => t.status !== 'done').length },
  { key: 'todo', label: 'status_todo', count: tasks.todoTasks.length },
  { key: 'in_progress', label: 'status_in_progress', count: tasks.inProgressTasks.length },
  { key: 'blocked', label: 'status_blocked', count: tasks.blockedTasks.length },
])

const filteredTasks = computed(() => {
  const list = activeTaskTab.value === 'all'
    ? tasks.tasks.filter(t => t.status !== 'done')
    : tasks.tasks.filter(t => t.status === activeTaskTab.value)
  return list.slice(0, 6)
})

function isOverdue(task) {
  return task.status !== 'done' && task.dueDate < new Date().toISOString().slice(0, 10)
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
</script>

<style scoped>
.dashboard { max-width: 1200px; }

/* Header */
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.dash-greeting h1 { font-size: 1.6rem; font-weight: 800; color: var(--text); }
.dash-date { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; text-transform: capitalize; }
.dash-badges { display: flex; gap: 6px; }
.badge { font-size: 0.7rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
.badge.plan { background: var(--purple-bg); color: var(--purple); }
.badge.role { background: var(--green-bg); color: var(--green); }

/* KPI header */
.kpi-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.kpi-section-title { font-size: 0.9rem; font-weight: 700; }
.btn-customize { background: #fff; border: 1px solid var(--border); padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.btn-customize:hover { border-color: var(--purple); color: var(--purple); }

/* KPI Grid */
.kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 28px; }
.kpi-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 16px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; position: relative; overflow: hidden; }
.kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.kpi-card.warn { border-left: 3px solid var(--red); }
.kpi-icon { font-size: 1.5rem; }
.kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.kpi-label { font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; display: block; }
.kpi-change { position: absolute; top: 14px; right: 14px; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.kpi-change.up { background: var(--green-bg); color: var(--green); }
.kpi-change.down-good { background: var(--green-bg); color: var(--green); }

/* Two columns */
.dash-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
.dash-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.card-header h2 { font-size: 1rem; font-weight: 700; }
.card-link { font-size: 0.78rem; color: var(--purple); font-weight: 500; }
.card-link:hover { text-decoration: underline; }

/* Satisfaction donut */
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

/* Accounts */
.top-accounts { display: flex; flex-direction: column; gap: 6px; }
.account-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--radius-sm); transition: background 0.15s; }
.account-row:hover { background: var(--bg-hover); }
.acc-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.acc-info { flex: 1; min-width: 0; }
.acc-info strong { font-size: 0.82rem; display: block; }
.acc-industry { font-size: 0.7rem; color: var(--text-muted); }
.acc-health { text-align: right; min-width: 60px; }
.health-score { font-weight: 700; font-size: 0.9rem; }
.health-bar-bg { height: 3px; background: var(--border-light); border-radius: 2px; margin-top: 4px; }
.health-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

/* Tasks */
.task-tabs { display: flex; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
.task-tab { background: var(--bg); border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; color: var(--text-muted); font-weight: 500; transition: all 0.15s; }
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
.task-info strong { font-size: 0.82rem; display: block; }
.task-meta { display: flex; gap: 8px; margin-top: 3px; }
.task-client { font-size: 0.7rem; color: var(--purple); background: var(--purple-bg); padding: 1px 6px; border-radius: 4px; }
.task-due { font-size: 0.7rem; color: var(--text-muted); }
.task-due.late { color: var(--red); font-weight: 600; }
.priority-badge { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.priority-badge.urgent { background: var(--red-bg); color: var(--red); }
.empty-tasks { text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem; }

/* Quick actions */
.quick-actions h2 { font-size: 1rem; font-weight: 700; margin-bottom: 14px; }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.action-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: all 0.2s; font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); }
.action-card:hover { border-color: var(--purple); color: var(--purple); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.action-icon { font-size: 1.5rem; }

/* Responsive */
@media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-columns { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-greeting h1 { font-size: 1.3rem; }
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
}
</style>
