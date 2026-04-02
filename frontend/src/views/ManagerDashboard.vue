<template>
  <div class="manager-dashboard">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">📊 Manager Dashboard — Vue equipe en temps reel</h1>
      <p class="hero-sub">Pilotez votre equipe Customer Success depuis un seul ecran</p>
    </div>

    <!-- Alert bar -->
    <div v-if="dashboard.alerts && dashboard.alerts.length > 0" class="alert-bar">
      <div class="alert-header">🚨 Alertes critiques</div>
      <div v-for="(alert, i) in dashboard.alerts.slice(0, 5)" :key="i" class="alert-item">
        <span class="alert-icon">{{ alert.severity === 1 ? '🔴' : '🟡' }}</span>
        <span class="alert-msg">{{ alert.message }}</span>
      </div>
    </div>

    <!-- KPI row -->
    <div class="kpi-row">
      <div class="kpi-card">
        <span class="kpi-label">SANTE MOYENNE</span>
        <span class="kpi-number" :style="{ color: healthColor(dashboard.avgHealthScore) }">
          {{ dashboard.avgHealthScore || 0 }}
        </span>
        <span class="kpi-unit">/100</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">CLIENTS SAINS</span>
        <span class="kpi-number" style="color: #34A853;">{{ dashboard.healthyCount || 0 }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">A RISQUE</span>
        <span class="kpi-number" :style="{ color: (dashboard.atRiskCount || 0) > 0 ? '#EA4335' : '#34A853' }">
          {{ dashboard.atRiskCount || 0 }}
        </span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">ARR TOTAL</span>
        <span class="kpi-number" style="color: #4285F4;">{{ formatARR(dashboard.totalARR) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">CHARGE EQUIPE</span>
        <span class="kpi-number" :style="{ color: (dashboard.teamAvgLoad || 0) > 85 ? '#EA4335' : '#34A853' }">
          {{ dashboard.teamAvgLoad || 0 }}%
        </span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">SCORE OKR</span>
        <span class="kpi-number kpi-gradient">{{ dashboard.globalOKRScore || 0 }}%</span>
      </div>
    </div>

    <!-- Performance par CSM -->
    <div class="section-card">
      <h2 class="section-title">👥 Performance par CSM</h2>
      <div v-if="csms.length === 0" class="section-empty">Aucun CSM configure</div>
      <div v-else class="table-wrapper">
        <table class="perf-table">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="sortable">Nom {{ sortIcon('name') }}</th>
              <th @click="sortBy('clients')" class="sortable">Clients {{ sortIcon('clients') }}</th>
              <th @click="sortBy('health')" class="sortable">Sante moy. {{ sortIcon('health') }}</th>
              <th @click="sortBy('load')" class="sortable">Charge {{ sortIcon('load') }}</th>
              <th @click="sortBy('atRisk')" class="sortable">A risque {{ sortIcon('atRisk') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="csm in sortedCSMs" :key="csm.id">
              <td>
                <div class="csm-cell">
                  <div class="csm-avatar" :style="{ background: csm.workloadPct >= 85 ? '#EA4335' : '#4285F4' }">
                    {{ initials(csm.name) }}
                  </div>
                  <span class="csm-name-cell">{{ csm.name }}</span>
                </div>
              </td>
              <td class="num-cell">{{ (csm.clients || []).length }}</td>
              <td class="num-cell">
                <span :style="{ color: healthColor(avgClientHealth(csm)) }">{{ avgClientHealth(csm) }}</span>
              </td>
              <td class="num-cell">
                <span :style="{ color: csm.workloadPct >= 85 ? '#EA4335' : csm.workloadPct >= 70 ? '#FBBC05' : '#34A853' }">
                  {{ csm.workloadPct || 0 }}%
                </span>
              </td>
              <td class="num-cell">
                <span :style="{ color: atRiskCount(csm) > 0 ? '#EA4335' : '#34A853' }">
                  {{ atRiskCount(csm) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom grid: Portfolio + OKR -->
    <div class="bottom-grid">
      <!-- Etat du portefeuille -->
      <div class="section-card">
        <h2 class="section-title">❤️ Etat du portefeuille</h2>
        <div v-if="clients.length === 0" class="section-empty">Aucun client</div>
        <template v-else>
          <div class="sub-section">
            <span class="sub-label">🔴 Top 3 a risque</span>
            <div v-for="c in topAtRisk" :key="c.id" class="mini-client-row">
              <div class="mini-client-info">
                <span class="mini-client-name">{{ c.name }}</span>
                <span class="mini-client-arr">{{ formatARR(c.arrValue) }}</span>
              </div>
              <span class="mini-health" :style="{ color: healthColor(c.healthScore), background: healthBg(c.healthScore) }">
                {{ c.healthScore }}
              </span>
            </div>
          </div>
          <div class="sub-section">
            <span class="sub-label">✅ Top 3 meilleurs</span>
            <div v-for="c in topHealthy" :key="c.id" class="mini-client-row">
              <div class="mini-client-info">
                <span class="mini-client-name">{{ c.name }}</span>
                <span class="mini-client-arr">{{ formatARR(c.arrValue) }}</span>
              </div>
              <span class="mini-health" :style="{ color: healthColor(c.healthScore), background: healthBg(c.healthScore) }">
                {{ c.healthScore }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- OKR Equipe -->
      <div class="section-card">
        <h2 class="section-title">🎯 OKR Equipe</h2>
        <div v-if="okrs.length === 0" class="section-empty">Aucun OKR defini</div>
        <div v-else class="okr-mini-list">
          <div v-for="okr in okrs.slice(0, 4)" :key="okr.id || okr.objective" class="okr-mini-card">
            <div class="okr-mini-top">
              <span class="okr-mini-title">{{ okr.objective }}</span>
              <span class="okr-mini-score" :style="{ color: scoreColor(okrProgress(okr)) }">
                {{ okrProgress(okr) }}%
              </span>
            </div>
            <div class="okr-mini-bar-track">
              <div
                class="okr-mini-bar-fill"
                :style="{ width: okrProgress(okr) + '%', background: scoreColor(okrProgress(okr)) }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom grid 2: Playbooks + Charge -->
    <div class="bottom-grid">
      <!-- Playbooks actifs -->
      <div class="section-card">
        <h2 class="section-title">🔄 Playbooks actifs</h2>
        <div v-if="playbooks.length === 0" class="section-empty">Aucun playbook actif</div>
        <div v-else class="table-wrapper">
          <table class="perf-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Progression</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pb in playbooks.slice(0, 5)" :key="pb.id">
                <td>{{ pb.name }}</td>
                <td>
                  <span class="pb-type-badge" :class="typeBadgeClass(pb.type)">{{ typeBadgeLabel(pb.type) }}</span>
                </td>
                <td>
                  <div class="pb-mini-bar-track">
                    <div class="pb-mini-bar-fill" :style="{ width: pbProgress(pb) + '%' }" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Charge equipe -->
      <div class="section-card">
        <h2 class="section-title">⚖️ Charge equipe</h2>
        <div v-if="csms.length === 0" class="section-empty">Aucun CSM</div>
        <div v-else class="load-chart">
          <div v-for="csm in csms" :key="csm.id" class="load-row">
            <span class="load-name">{{ csm.name }}</span>
            <div class="load-bar-track">
              <div
                class="load-bar-fill"
                :style="{
                  width: Math.min(csm.workloadPct || 0, 100) + '%',
                  background: csm.workloadPct >= 85 ? '#EA4335' : 'linear-gradient(90deg, #EA4335, #FBBC05, #34A853, #4285F4)'
                }"
              />
            </div>
            <span class="load-pct" :style="{ color: csm.workloadPct >= 85 ? '#EA4335' : '#5F6368' }">
              {{ csm.workloadPct || 0 }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useManagerStore } from '../stores/manager'
import { useClientsStore } from '../stores/clients'
import { useCsmStore } from '../stores/csm'
import { useTasksStore } from '../stores/tasks'

const managerStore = useManagerStore()
const clientsStore = useClientsStore()
const csmStore = useCsmStore()
const tasksStore = useTasksStore()

const sortField = ref('name')
const sortAsc = ref(true)

onMounted(() => {
  managerStore.fetchAll()
})

const dashboard = computed(() => managerStore.dashboard)
const clients = computed(() => clientsStore.clients)
const csms = computed(() => csmStore.workloadByCSM)
const okrs = computed(() => tasksStore.okrs)
const playbooks = computed(() => tasksStore.playbooks)

const topAtRisk = computed(() =>
  [...clients.value].sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0)).slice(0, 3)
)
const topHealthy = computed(() =>
  [...clients.value].sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0)).slice(0, 3)
)

const sortedCSMs = computed(() => {
  const list = [...csms.value]
  list.sort((a, b) => {
    let va, vb
    switch (sortField.value) {
      case 'name': va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); break
      case 'clients': va = (a.clients || []).length; vb = (b.clients || []).length; break
      case 'health': va = avgClientHealth(a); vb = avgClientHealth(b); break
      case 'load': va = a.workloadPct || 0; vb = b.workloadPct || 0; break
      case 'atRisk': va = atRiskCount(a); vb = atRiskCount(b); break
      default: va = 0; vb = 0
    }
    if (va < vb) return sortAsc.value ? -1 : 1
    if (va > vb) return sortAsc.value ? 1 : -1
    return 0
  })
  return list
})

function sortBy(field) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = true }
}

function sortIcon(field) {
  if (sortField.value !== field) return ''
  return sortAsc.value ? '↑' : '↓'
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function avgClientHealth(csm) {
  const cl = csm.clients || []
  if (!cl.length) return 0
  return Math.round(cl.reduce((s, c) => s + (c.healthScore || 0), 0) / cl.length)
}

function atRiskCount(csm) {
  return (csm.clients || []).filter(c => c.healthScore < 60).length
}

function healthColor(score) {
  if (score >= 75) return '#34A853'
  if (score >= 60) return '#FBBC05'
  return '#EA4335'
}

function healthBg(score) {
  if (score >= 75) return 'rgba(52,168,83,0.1)'
  if (score >= 60) return 'rgba(251,188,5,0.1)'
  return 'rgba(234,67,53,0.1)'
}

function scoreColor(pct) {
  if (pct >= 70) return '#34A853'
  if (pct >= 40) return '#FBBC05'
  return '#EA4335'
}

function formatARR(val) {
  if (!val) return '0 €'
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M €`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K €`
  return `${val} €`
}

function okrProgress(okr) {
  const krs = okr.keyResults || []
  if (!krs.length) return 0
  let total = 0
  for (const kr of krs) {
    const target = kr.target || 1
    const current = kr.current || 0
    total += kr.inverse
      ? Math.min(1, target / Math.max(current, 0.01))
      : Math.min(1, current / target)
  }
  return Math.round((total / krs.length) * 100)
}

function pbProgress(pb) {
  const steps = pb.steps || []
  if (!steps.length) return 0
  const done = steps.filter((s, i) => {
    const key = `${pb.id}_${i}`
    if (tasksStore.playbookProgress[key] !== undefined) return tasksStore.playbookProgress[key]
    return s.done || false
  }).length
  return Math.round((done / steps.length) * 100)
}

function typeBadgeClass(type) {
  if (type === 'churn' || type === 'anti-churn') return 'badge-churn'
  if (type === 'onboarding') return 'badge-onboarding'
  if (type === 'expansion') return 'badge-expansion'
  return 'badge-default'
}

function typeBadgeLabel(type) {
  if (type === 'churn' || type === 'anti-churn') return 'Anti-churn'
  if (type === 'onboarding') return 'Onboarding'
  if (type === 'expansion') return 'Expansion'
  return type || 'Autre'
}
</script>

<style scoped>
.manager-dashboard {
  max-width: 1200px;
  padding: 24px 28px;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  background: #F8F9FA;
}

.hero {
  background: linear-gradient(135deg, #EA4335, #FBBC05, #34A853, #4285F4);
  color: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
}
.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px;
}
.hero-sub {
  font-size: 14px;
  opacity: 0.85;
  margin: 0;
}

/* Alert bar */
.alert-bar {
  background: rgba(234,67,53,0.1);
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(234,67,53,0.12);
  padding: 18px 22px;
  margin-bottom: 20px;
}
.alert-header {
  font-size: 14px;
  font-weight: 800;
  color: #EA4335;
  margin-bottom: 10px;
}
.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: #1a1f36;
  border-bottom: 1px solid rgba(234, 67, 53, 0.1);
}
.alert-item:last-child { border-bottom: none; }
.alert-icon { flex-shrink: 0; }
.alert-msg { font-weight: 600; }

/* KPI row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.kpi-card {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 18px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.kpi-label {
  font-size: 13px;
  color: #2d3748;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.kpi-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: #1a1f36;
}
.kpi-gradient {
  background: linear-gradient(135deg, #EA4335, #FBBC05, #34A853, #4285F4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.kpi-unit {
  font-size: 12px;
  color: #2d3748;
  font-weight: 500;
}

/* Section card */
.section-card {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 22px 24px;
  margin-bottom: 16px;
}
.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1a1f36;
  margin: 0 0 16px;
}
.section-empty {
  font-size: 13px;
  color: #2d3748;
  text-align: center;
  padding: 20px 0;
}

/* Bottom grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* Performance table */
.table-wrapper {
  overflow-x: auto;
}
.perf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.perf-table th {
  text-align: left;
  font-size: 13px;
  color: #2d3748;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 8px 10px;
  border-bottom: 1px solid #E8EAED;
}
.perf-table th.sortable {
  cursor: pointer;
  user-select: none;
}
.perf-table th.sortable:hover {
  color: #1a1f36;
}
.perf-table td {
  padding: 10px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-weight: 500;
}
.num-cell {
  text-align: center;
  font-weight: 700;
}

.csm-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.csm-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.csm-name-cell {
  font-weight: 700;
  font-size: 13px;
  color: #1a1f36;
}

/* Portfolio mini */
.sub-section {
  margin-bottom: 18px;
}
.sub-section:last-child {
  margin-bottom: 0;
}
.sub-label {
  font-size: 12px;
  font-weight: 700;
  color: #2d3748;
  display: block;
  margin-bottom: 8px;
}
.mini-client-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(0,0,0,0.015);
  margin-bottom: 6px;
}
.mini-client-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mini-client-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1f36;
}
.mini-client-arr {
  font-size: 11px;
  color: #2d3748;
}
.mini-health {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}

/* OKR mini */
.okr-mini-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.okr-mini-card {
  padding: 12px 14px;
  background: rgba(0,0,0,0.015);
  border-radius: 12px;
}
.okr-mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.okr-mini-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a1f36;
  flex: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.okr-mini-score {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}
.okr-mini-bar-track {
  height: 8px;
  background: #E8EAED;
  border-radius: 4px;
  overflow: hidden;
}
.okr-mini-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Playbook badges */
.pb-type-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
}
.badge-churn { background: rgba(234,67,53,0.1); color: #EA4335; }
.badge-onboarding { background: rgba(66,133,244,0.1); color: #4285F4; }
.badge-expansion { background: rgba(52,168,83,0.1); color: #34A853; }
.badge-default { background: rgba(0,0,0,0.05); color: #2d3748; }

.pb-mini-bar-track {
  height: 8px;
  background: #E8EAED;
  border-radius: 4px;
  overflow: hidden;
  min-width: 80px;
}
.pb-mini-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #EA4335, #FBBC05, #34A853, #4285F4);
  transition: width 0.4s ease;
}

/* Load chart */
.load-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.load-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.load-name {
  font-size: 12px;
  font-weight: 700;
  color: #2d3748;
  width: 80px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.load-bar-track {
  flex: 1;
  height: 8px;
  background: #E8EAED;
  border-radius: 4px;
  overflow: hidden;
}
.load-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}
.load-pct {
  font-size: 12px;
  font-weight: 700;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .kpi-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
