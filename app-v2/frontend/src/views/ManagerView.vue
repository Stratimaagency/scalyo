<template>
  <div class="manager">
    <!-- HEADER -->
    <div class="mgr-header">
      <div>
        <div class="manager-header-row"><h1>👥 {{ t('mgr_title') }}</h1><button class="btn-reset-data" @click="resetAllData" title="Réinitialiser les données">🔄 Réinitialiser</button></div>
        <p class="mgr-date">{{ formattedDate }}</p>
      </div>
      <div class="mgr-header-actions">
        <button class="btn-customize" @click="customizerOpen = true">⚙ {{ t('kpi_cust_title') }}</button>
      </div>
      <div class="mgr-kpis-top">
        <div class="mkpi">
          <span class="mkpi-value" :class="healthClass">{{ team.teamHealthScore }}</span>
          <span class="mkpi-label">{{ t('mgr_global_health') }}</span>
        </div>
        <div class="mkpi">
          <span class="mkpi-value">€{{ (team.totalArrManaged / 1000).toFixed(0) }}K</span>
          <span class="mkpi-label">{{ t('mgr_total_arr') }}</span>
        </div>
        <div class="mkpi">
          <span class="mkpi-value">{{ clients.clients.length }}</span>
          <span class="mkpi-label">{{ t('mgr_total_clients') }}</span>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="mgr-filters">
      <select v-model="filterCsm" class="filter-select">
        <option value="all">{{ t('mgr_filter_all_csm') }}</option>
        <option v-for="m in team.enrichedMembers" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <select v-model="filterLevel" class="filter-select">
        <option value="all">{{ t('mgr_filter_all_levels') }}</option>
        <option v-for="role in uniqueRoles" :key="role" :value="role">{{ role }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="all">{{ t('mgr_filter_all_statuses') }}</option>
        <option value="healthy">{{ t('status_healthy') }}</option>
        <option value="overloaded">{{ t('kpi_overloaded') }}</option>
      </select>
    </div>

    <!-- WELLBEING SECTION -->
    <section class="mgr-section">
      <h2>💚 {{ t('mgr_wellbeing') }}</h2>
      <div class="wellbeing-grid">
        <div v-for="m in filteredMembers" :key="m.id" class="member-card">
          <div class="mc-header">
            <div class="mc-avatar" :class="m.status">{{ m.name[0] }}</div>
            <div class="mc-info">
              <strong>{{ m.name }}</strong>
              <span class="mc-role">{{ m.role }}</span>
            </div>
            <span class="mc-status-badge" :class="m.status">
              {{ m.status === 'healthy' ? t('status_healthy') : t('kpi_overloaded') }}
            </span>
          </div>

          <!-- Score bar -->
          <div class="mc-metric">
            <div class="metric-row">
              <span class="metric-label">{{ t('mgr_wellbeing') }}</span>
              <span class="metric-val" :class="wellbeingClass(m.wellbeingScore)">{{ m.wellbeingScore }}/100</span>
            </div>
            <div class="metric-bar"><div class="metric-fill" :class="wellbeingClass(m.wellbeingScore)" :style="{ width: m.wellbeingScore + '%' }" /></div>
          </div>

          <!-- Workload bar -->
          <div class="mc-metric">
            <div class="metric-row">
              <span class="metric-label">{{ t('mgr_workload') }}</span>
              <span class="metric-val" :class="workloadClass(m.workload)">{{ m.workload }}%</span>
            </div>
            <div class="metric-bar"><div class="metric-fill" :class="workloadClass(m.workload)" :style="{ width: m.workload + '%' }" /></div>
          </div>

          <!-- Burnout -->
          <div class="mc-row">
            <span class="metric-label">{{ t('mgr_burnout_risk') }}</span>
            <span class="burnout-badge" :class="m.burnoutRisk">{{ t('mgr_burnout_' + m.burnoutRisk) }}</span>
          </div>

          <!-- Week mood -->
          <div class="mc-row">
            <span class="metric-label">{{ t('mgr_week_mood') }}</span>
            <div class="week-moods">
              <span v-for="(mood, i) in m.weekMoods" :key="i" class="mood-emoji" :title="t('mgr_mood_' + mood)">{{ moodEmoji(mood) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TWO COLUMNS: Performance + Alerts -->
    <div class="mgr-columns">
      <!-- Performance CSMs -->
      <section class="mgr-section">
        <h2>📊 {{ t('mgr_performance') }}</h2>
        <div class="perf-table">
          <div class="perf-header">
            <span>CSM</span>
            <span>{{ t('mgr_clients_managed') }}</span>
            <span>{{ t('mgr_arr_managed') }}</span>
            <span>{{ t('kpi_health') }}</span>
          </div>
          <div v-for="m in filteredMembers" :key="m.id" class="perf-row">
            <div class="perf-name">
              <div class="perf-avatar" :class="m.status">{{ m.name[0] }}</div>
              <div>
                <strong>{{ m.name }}</strong>
                <span class="perf-role">{{ m.role }}</span>
              </div>
            </div>
            <span class="perf-val">{{ m.clientCount }}</span>
            <span class="perf-val">€{{ (m.arrManaged / 1000).toFixed(0) }}K</span>
            <span class="perf-val">
              <span class="health-pill" :class="avgHealthClass(m.id)">{{ avgHealthForCsm(m.id) }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- Portfolio overview + Alerts -->
      <section class="mgr-section">
        <h2>🔔 {{ t('mgr_alerts') }}</h2>
        <div class="alerts-list">
          <div v-for="n in activeAlerts" :key="n.id" class="alert-item" :class="n.type">
            <span class="alert-icon">{{ n.icon }}</span>
            <div class="alert-content">
              <strong>{{ n.title }}</strong>
              <p>{{ n.body }}</p>
            </div>
          </div>
          <div v-if="!activeAlerts.length" class="empty-alerts">{{ t('mgr_no_alerts') }}</div>
        </div>

        <h2 class="mt-section">💼 {{ t('mgr_portfolio_overview') }}</h2>
        <div class="portfolio-mini">
          <div class="pm-stat">
            <div class="pm-donut-mini">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" stroke-width="7" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" stroke-width="7"
                  :stroke-dasharray="healthyArcMini + ' 213.6'" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 40 40)" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" stroke-width="7"
                  :stroke-dasharray="watchArcMini + ' 213.6'" :stroke-dashoffset="'-' + healthyArcMini" stroke-linecap="round" transform="rotate(-90 40 40)" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" stroke-width="7"
                  :stroke-dasharray="criticalArcMini + ' 213.6'" :stroke-dashoffset="'-' + (parseFloat(healthyArcMini) + parseFloat(watchArcMini))" stroke-linecap="round" transform="rotate(-90 40 40)" />
              </svg>
            </div>
            <div class="pm-legend">
              <div><span class="dot green" /> {{ t('status_healthy') }}: <strong>{{ clients.healthyCount }}</strong></div>
              <div><span class="dot amber" /> {{ t('status_watch') }}: <strong>{{ clients.watchCount }}</strong></div>
              <div><span class="dot red" /> {{ t('status_critical') }}: <strong>{{ clients.criticalCount }}</strong></div>
            </div>
          </div>
          <div class="pm-kpi-row">
            <div class="pm-kpi"><span class="pm-kpi-v">€{{ (clients.totalArr / 1000).toFixed(0) }}K</span><span>{{ t('kpi_arr') }}</span></div>
            <div class="pm-kpi"><span class="pm-kpi-v red">€{{ (clients.arrAtRisk / 1000).toFixed(0) }}K</span><span>{{ t('kpi_arr_at_risk') }}</span></div>
            <div class="pm-kpi"><span class="pm-kpi-v">{{ clients.renewalsNext30 }}</span><span>{{ t('kpi_renewals_30d') }}</span></div>
          </div>
        </div>
      </section>
    </div>

    <KpiCustomizer :open="customizerOpen" page-id="manager" :defaults="defaultKpis" v-model="selectedKpis" @close="customizerOpen = false" />
  </div>
</template>

<script setup>
import { useTaskStore } from '@/stores/tasks'

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeamStore } from '@/stores/team'
import { useClientStore } from '@/stores/clients'
import { useNotificationStore } from '@/stores/notifications'
import KpiCustomizer from '@/components/KpiCustomizer.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const team = useTeamStore()

const customizerOpen = ref(false)
const defaultKpis = ['team_wellbeing', 'arr', 'churn_rate', 'accounts_per_csm', 'nrr', 'health_score']
const selectedKpis = ref([...defaultKpis])
const clients = useClientStore()
const notifications = useNotificationStore()

const filterCsm = ref('all')
const filterLevel = ref('all')
const filterStatus = ref('all')

const formattedDate = computed(() => {
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date().toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const healthClass = computed(() => {
  const s = team.teamHealthScore
  return s >= 70 ? 'green' : s >= 50 ? 'amber' : 'red'
})

const filteredMembers = computed(() => {
  return team.enrichedMembers.filter(m => {
    if (filterCsm.value !== 'all' && m.id !== filterCsm.value) return false
    if (filterLevel.value !== 'all' && m.role !== filterLevel.value) return false
    if (filterStatus.value !== 'all' && m.status !== filterStatus.value) return false
    return true
  })
})

const uniqueRoles = computed(() => [...new Set(team.enrichedMembers.map(m => m.role))])

const activeAlerts = computed(() => notifications.notifications.filter(n => !n.read).slice(0, 5))

function wellbeingClass(score) { return score >= 70 ? 'green' : score >= 50 ? 'amber' : 'red' }
function workloadClass(load) { return load <= 60 ? 'green' : load <= 80 ? 'amber' : 'red' }

function moodEmoji(mood) {
  const map = { great: '😄', happy: '😊', neutral: '🙂', stressed: '😟', exhausted: '😩' }
  return map[mood] || '🙂'
}

function avgHealthForCsm(csmId) {
  const csmClients = clients.clients.filter(c => c.csmId === csmId)
  if (!csmClients.length) return '—'
  return (csmClients.reduce((s, c) => s + c.health, 0) / csmClients.length).toFixed(1)
}

function avgHealthClass(csmId) {
  const v = parseFloat(avgHealthForCsm(csmId))
  if (isNaN(v)) return ''
  return v >= 7 ? 'green' : v >= 5 ? 'amber' : 'red'
}

const circumMini = 2 * Math.PI * 34
const total = computed(() => clients.clients.length || 1)
const healthyArcMini = computed(() => ((clients.healthyCount / total.value) * circumMini).toFixed(1))
const watchArcMini = computed(() => ((clients.watchCount / total.value) * circumMini).toFixed(1))
const criticalArcMini = computed(() => ((clients.criticalCount / total.value) * circumMini).toFixed(1))



const tasks = useTaskStore()

function resetAllData() {
  if (!confirm('Supprimer toutes les données ? Cette action est irréversible.')) return
  if (clients.clients) clients.clients.length = 0
  if (team.members) team.members.length = 0
  if (tasks.tasks) tasks.tasks.length = 0
  if (tasks.projects) tasks.projects.length = 0
  ;['scalyo_clients','scalyo_tasks','scalyo_team','scalyo_projects','scalyo_kpis',
    'scalyo_playbooks','scalyo_snapshots','scalyo_okr','scalyo_roadmap',
    'scalyo_quotes','scalyo_dashboard_kpis','scalyo_coach_messages'].forEach(k => localStorage.removeItem(k))
}

</script>

<style scoped>
.manager { max-width: 1200px; }

/* Header */
.mgr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.mgr-header-actions { display: flex; align-items: center; }
.btn-customize { background: #fff; border: 1px solid var(--border); padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.btn-customize:hover { border-color: var(--purple); color: var(--purple); }
.mgr-header h1 { font-size: 1.5rem; font-weight: 800; }
.mgr-date { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; text-transform: capitalize; }
.mgr-kpis-top { display: flex; gap: 20px; }
.mkpi { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 24px; min-width: 120px; }
.mkpi-value { font-size: 1.6rem; font-weight: 800; }
.mkpi-value.green { color: var(--green); }
.mkpi-value.amber { color: var(--amber); }
.mkpi-value.red { color: var(--red); }
.mkpi-label { font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; }

/* Filters */
.mgr-filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-select { padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--text); background: #fff; outline: none; cursor: pointer; }
.filter-select:focus { border-color: var(--purple); }

/* Sections */
.mgr-section { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px; }
.mgr-section h2 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
.mt-section { margin-top: 24px; }

/* Wellbeing grid */
.wellbeing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.member-card { border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 18px; transition: box-shadow 0.2s; }
.member-card:hover { box-shadow: var(--shadow-sm); }
.mc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.mc-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
.mc-avatar.healthy { background: var(--green); }
.mc-avatar.overloaded { background: var(--red); }
.mc-info { flex: 1; }
.mc-info strong { font-size: 0.9rem; display: block; }
.mc-role { font-size: 0.72rem; color: var(--text-muted); }
.mc-status-badge { font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.mc-status-badge.healthy { background: var(--green-bg); color: var(--green); }
.mc-status-badge.overloaded { background: var(--red-bg); color: var(--red); }

/* Metrics */
.mc-metric { margin-bottom: 12px; }
.metric-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
.metric-label { font-size: 0.75rem; color: var(--text-secondary); }
.metric-val { font-size: 0.78rem; font-weight: 600; }
.metric-val.green { color: var(--green); }
.metric-val.amber { color: var(--amber); }
.metric-val.red { color: var(--red); }
.metric-bar { height: 5px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.metric-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.metric-fill.green { background: var(--green); }
.metric-fill.amber { background: var(--amber); }
.metric-fill.red { background: var(--red); }

.mc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.burnout-badge { font-size: 0.72rem; font-weight: 600; padding: 2px 10px; border-radius: 6px; }
.burnout-badge.none { background: var(--green-bg); color: var(--green); }
.burnout-badge.low { background: var(--green-bg); color: var(--green); }
.burnout-badge.medium { background: var(--amber-bg); color: var(--amber); }
.burnout-badge.high { background: var(--red-bg); color: var(--red); }

.week-moods { display: flex; gap: 4px; }
.mood-emoji { font-size: 1.1rem; cursor: default; }

/* Two columns */
.mgr-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Performance table */
.perf-table { display: flex; flex-direction: column; gap: 0; }
.perf-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 8px 12px; font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border-light); }
.perf-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px; align-items: center; border-bottom: 1px solid var(--border-light); transition: background 0.15s; }
.perf-row:hover { background: var(--bg-hover); }
.perf-name { display: flex; align-items: center; gap: 10px; }
.perf-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.perf-avatar.healthy { background: var(--green); }
.perf-avatar.overloaded { background: var(--red); }
.perf-name strong { font-size: 0.82rem; display: block; }
.perf-role { font-size: 0.7rem; color: var(--text-muted); }
.perf-val { font-size: 0.85rem; font-weight: 500; text-align: center; }
.health-pill { font-size: 0.78rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.health-pill.green { background: var(--green-bg); color: var(--green); }
.health-pill.amber { background: var(--amber-bg); color: var(--amber); }
.health-pill.red { background: var(--red-bg); color: var(--red); }

/* Alerts */
.alerts-list { display: flex; flex-direction: column; gap: 8px; }
.alert-item { display: flex; gap: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); transition: background 0.15s; }
.alert-item:hover { background: var(--bg-hover); }
.alert-item.churn_risk { border-left: 3px solid var(--red); }
.alert-item.burnout { border-left: 3px solid var(--amber); }
.alert-item.renewal { border-left: 3px solid var(--blue); }
.alert-item.nps_drop { border-left: 3px solid var(--amber); }
.alert-item.task_overdue { border-left: 3px solid var(--text-muted); }
.alert-icon { font-size: 1.3rem; flex-shrink: 0; }
.alert-content strong { font-size: 0.82rem; display: block; margin-bottom: 2px; }
.alert-content p { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; }
.empty-alerts { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem; }

/* Portfolio mini */
.portfolio-mini { margin-top: 12px; }
.pm-stat { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
.pm-donut-mini { width: 80px; height: 80px; flex-shrink: 0; }
.pm-donut-mini svg { width: 100%; height: 100%; }
.pm-legend { display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; color: var(--text-secondary); }
.pm-legend strong { color: var(--text); }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
.dot.green { background: var(--green); }
.dot.amber { background: var(--amber); }
.dot.red { background: var(--red); }
.pm-kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.pm-kpi { background: var(--bg); border-radius: var(--radius-sm); padding: 12px; text-align: center; }
.pm-kpi-v { display: block; font-size: 1.2rem; font-weight: 700; margin-bottom: 2px; }
.pm-kpi-v.red { color: var(--red); }
.pm-kpi span:not(.pm-kpi-v) { font-size: 0.7rem; color: var(--text-secondary); }

/* Responsive */
@media (max-width: 1024px) {
  .mgr-kpis-top { gap: 10px; }
  .mkpi { padding: 10px 16px; min-width: 90px; }
  .mkpi-value { font-size: 1.3rem; }
}
@media (max-width: 768px) {
  .mgr-columns { grid-template-columns: 1fr; }
  .mgr-kpis-top { flex-wrap: wrap; }
  .wellbeing-grid { grid-template-columns: 1fr; }
  .perf-header, .perf-row { grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr; font-size: 0.75rem; }
}

.manager-header-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px; }
.manager-header-row h1 { margin-bottom:0; }
.btn-reset-data { background:none;border:1px solid var(--border,#e5e7eb);color:var(--text-muted,#6b7280);padding:7px 14px;border-radius:8px;font-size:0.82rem;cursor:pointer;transition:all 0.2s; }
.btn-reset-data:hover { border-color:#ef4444;color:#ef4444; }
</style>
