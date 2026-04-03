<template>
  <div class="mod-page fade-in">
    <!-- Hero -->
    <div class="mgr-hero">
      <div>
        <h1 class="mod-title">📊 Manager Dashboard</h1>
        <p class="mod-subtitle">Vue équipe en temps réel · {{ todayStr }}</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" :style="{ color: scoreColor(d.avgHealthScore) }">{{ d.avgHealthScore }}</div>
        <div class="mod-big-label">{{ t('mgrGlobalHealth') }}</div>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="d.alerts.length" class="mgr-alerts">
      <div class="mgr-alerts-header">⚠️ {{ d.alerts.length }} {{ t('mgrCriticalAlerts') }}</div>
      <div v-for="(alert, i) in d.alerts.slice(0, 5)" :key="i" class="mgr-alert-row"
        @click="alert.route && $router.push(alert.route)">
        {{ alert.message }}
      </div>
    </div>

    <!-- KPI Row -->
    <div class="mod-kpi-row">
      <div class="mod-kpi-card"><div class="mod-kpi-label">💙 {{ t('mgrHealthScore') }}</div><div class="mod-kpi-val" :style="{ color: scoreColor(d.avgHealthScore) }">{{ d.avgHealthScore }}/100</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">✅ {{ t('mgrHealthyClients') }}</div><div class="mod-kpi-val" style="color:#34A853">{{ d.healthyCount }}</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">⚠️ {{ t('mgrAtRisk') }}</div><div class="mod-kpi-val" style="color:#EA4335">{{ d.atRiskCount }}</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">💰 {{ t('mgrTotalARR') }}</div><div class="mod-kpi-val" style="color:#4285F4">{{ fmtCurrency(d.totalARR) }}</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">⚖️ {{ t('mgrTeamLoad') }}</div><div class="mod-kpi-val" :style="{ color: loadColor(d.teamAvgLoad) }">{{ d.teamAvgLoad }}%</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">🎯 {{ t('mgrOKRScore') }}</div><div class="mod-kpi-val" :style="{ color: okrColor(d.globalOKRScore) }">{{ d.globalOKRScore }}%</div></div>
    </div>

    <div class="mgr-grid">
      <!-- Performance par CSM -->
      <div class="mod-card mgr-wide">
        <div class="mod-card-header">
          <h3 class="mod-section-title">👥 {{ t('mgrCSMPerf') }}</h3>
          <router-link :to="{ name: 'workload' }" class="mod-link">{{ t('mgrSeeDetail') }} →</router-link>
        </div>
        <div v-if="csmStore.workloadByCSM.length" class="mod-table-wrap">
          <table class="mod-table">
            <thead>
              <tr><th>CSM</th><th>Clients</th><th>Santé moy.</th><th>À risque</th><th>Charge</th></tr>
            </thead>
            <tbody>
              <tr v-for="csm in csmStore.workloadByCSM" :key="csm.id">
                <td style="font-weight:700">{{ csm.name }}</td>
                <td>{{ csm.clients.length }}</td>
                <td :style="{ color: scoreColor(csm.avgHealth || 0), fontWeight: 700 }">{{ csm.avgHealth || 0 }}</td>
                <td :style="{ color: csm.atRiskCount > 2 ? '#EA4335' : '#202124', fontWeight: 700 }">{{ csm.atRiskCount }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="mod-progress-bar" style="flex:1;height:6px">
                      <div class="mod-progress-fill" :style="{ width: csm.workloadPct + '%', background: loadGrad(csm.workloadPct) }"></div>
                    </div>
                    <span :style="{ color: loadColor(csm.workloadPct), fontWeight: 700, fontSize: '12px' }">{{ csm.workloadPct }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mod-empty">{{ t('mgrNoCSMData') }}</div>
      </div>

      <!-- État du portefeuille -->
      <div class="mod-card">
        <div class="mod-card-header">
          <h3 class="mod-section-title">❤️ {{ t('mgrPortfolioStatus') }}</h3>
          <router-link :to="{ name: 'health-tracker' }" class="mod-link">{{ t('mgrSeeAll') }} →</router-link>
        </div>
        <apexchart v-if="clientsStore.clients.length" type="donut" height="200" :options="donutOpts" :series="donutSeries" />
        <div style="margin-top:14px">
          <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#EA4335" v-if="clientsStore.atRiskClients.length">
            {{ t('mgrTopAtRisk') }}
          </div>
          <div v-for="c in clientsStore.atRiskClients.slice(0,3)" :key="c.id" class="mgr-client-row">
            <span style="font-weight:700">{{ c.name }}</span>
            <span :style="{ color: scoreColor(c.healthScore), fontWeight: 700 }">{{ c.healthScore }}/100</span>
          </div>
        </div>
      </div>

      <!-- OKR Équipe -->
      <div class="mod-card">
        <div class="mod-card-header">
          <h3 class="mod-section-title">🎯 {{ t('mgrTeamOKRs') }}</h3>
          <router-link :to="{ name: 'okr-tracker' }" class="mod-link">{{ t('mgrSeeAll') }} →</router-link>
        </div>
        <div v-if="tasksStore.okrs.length">
          <div v-for="okr in tasksStore.okrs.slice(0,4)" :key="okr.id" class="mgr-okr-mini">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-weight:700;font-size:13px">{{ okr.emoji || '🎯' }} {{ okr.objective }}</span>
              <span :style="{ color: okrColor(okrPct(okr)), fontWeight: 800 }">{{ okrPct(okr) }}%</span>
            </div>
            <div class="mod-progress-bar">
              <div class="mod-progress-fill" :style="{ width: okrPct(okr) + '%', background: okrGrad(okrPct(okr)) }"></div>
            </div>
          </div>
        </div>
        <div v-else class="mod-empty">{{ t('mgrNoOKRs') }}</div>
      </div>

      <!-- Playbooks actifs -->
      <div class="mod-card">
        <div class="mod-card-header">
          <h3 class="mod-section-title">🔄 {{ t('mgrActivePlaybooks') }}</h3>
          <router-link :to="{ name: 'playbook-runner' }" class="mod-link">{{ t('mgrSeeAll') }} →</router-link>
        </div>
        <div v-if="tasksStore.playbooks.length">
          <div v-for="pb in tasksStore.playbooks.slice(0,4)" :key="pb.id" class="mgr-pb-row">
            <span style="font-weight:700">{{ pb.emoji || '📋' }} {{ pb.name }}</span>
            <span style="font-size:12px;color:#5F6368">{{ pb.clients?.length || 0 }} {{ t('clients') }}</span>
          </div>
        </div>
        <div v-else class="mod-empty">{{ t('mgrNoPlaybooks') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useManagerStore } from '../stores/manager'
import { useClientsStore } from '../stores/clients'
import { useCSMStore } from '../stores/csm'
import { useTasksStore } from '../stores/tasks'
import { useI18n } from '../i18n'

const { t } = useI18n()

const managerStore = useManagerStore()
const clientsStore = useClientsStore()
const csmStore = useCSMStore()
const tasksStore = useTasksStore()

const d = computed(() => managerStore.dashboard)
const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function scoreColor(s) { return s >= 75 ? '#34A853' : s >= 60 ? '#FBBC05' : '#EA4335' }
function loadColor(p) { return p >= 85 ? '#EA4335' : p >= 60 ? '#FBBC05' : '#34A853' }
function loadGrad(p) { return p >= 85 ? 'linear-gradient(90deg,#EA4335,#F44336)' : p >= 60 ? 'linear-gradient(90deg,#FBBC05,#FF9800)' : 'linear-gradient(90deg,#34A853,#4CAF50)' }
function okrColor(p) { return p >= 70 ? '#34A853' : p >= 40 ? '#FBBC05' : '#EA4335' }
function okrGrad(p) { return p >= 70 ? 'linear-gradient(90deg,#34A853,#4CAF50)' : p >= 40 ? 'linear-gradient(90deg,#FBBC05,#FF9800)' : 'linear-gradient(90deg,#EA4335,#F44336)' }
function fmtCurrency(v) { if (!v) return '0€'; if (v >= 1e6) return (v/1e6).toFixed(1)+'M€'; if (v >= 1e3) return Math.round(v/1e3)+'K€'; return v+'€' }
function okrPct(okr) {
  if (!okr.keyResults?.length) return 0
  return Math.round(okr.keyResults.reduce((a, kr) => a + (kr.target ? Math.min((kr.current/kr.target)*100,100) : 0), 0) / okr.keyResults.length)
}

const donutOpts = computed(() => ({
  chart: { fontFamily: "'DM Sans', sans-serif" },
  labels: [t('htStatusHealthy'), t('htRiskMedium'), t('htStatusAtRisk')],
  colors: ['#34A853', '#FBBC05', '#EA4335'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, formatter: (v) => Math.round(v) + '%' },
}))
const donutSeries = computed(() => [
  clientsStore.clients.filter(c => c.healthScore >= 75).length,
  clientsStore.clients.filter(c => c.healthScore >= 60 && c.healthScore < 75).length,
  clientsStore.clients.filter(c => c.healthScore < 60).length,
])

onMounted(() => managerStore.fetchAll())
</script>

<style scoped>
.mgr-hero { background: linear-gradient(135deg, #EA4335 0%, #FBBC05 30%, #34A853 60%, #4285F4 100%); border-radius: 20px; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: #fff; }
.mgr-hero .mod-title { color: #fff; }
.mgr-hero .mod-subtitle { color: rgba(255,255,255,.85); }
.mgr-hero .mod-big-num { color: #fff !important; }
.mgr-hero .mod-big-label { color: rgba(255,255,255,.85); }
.mgr-alerts { background: #FCE8E6; border: 1px solid #EA4335; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.mgr-alerts-header { font-weight: 800; color: #EA4335; margin-bottom: 8px; }
.mgr-alert-row { font-size: 13px; padding: 6px 0; border-bottom: 1px solid rgba(234,67,53,.15); cursor: pointer; }
.mgr-alert-row:last-child { border-bottom: none; }
.mgr-alert-row:hover { color: #EA4335; }
.mgr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.mgr-wide { grid-column: span 2; }
.mgr-client-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F3F4; font-size: 13px; }
.mgr-okr-mini { margin-bottom: 14px; }
.mgr-pb-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F3F4; font-size: 13px; }
</style>
