<template>
  <div class="mod-page fade-in">
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">⚖️ Workload Équipe</h1>
        <p class="mod-subtitle">{{ t('wlSubtitle') }}</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" :style="{ color: loadColor(csmStore.teamAvgLoad) }">{{ csmStore.teamAvgLoad }}%</div>
        <div class="mod-big-label">{{ t('wlAvgLoad') }}</div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="mod-kpi-row">
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">👥 {{ t('wlTotalCSM') }}</div>
        <div class="mod-kpi-val" style="color: #4285F4">{{ csmStore.csms.length }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">⚖️ {{ t('wlAvgLoad') }}</div>
        <div class="mod-kpi-val" :style="{ color: loadColor(csmStore.teamAvgLoad) }">{{ csmStore.teamAvgLoad }}%</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">🔴 {{ t('wlOverloaded') }}</div>
        <div class="mod-kpi-val" style="color: #EA4335">{{ csmStore.overloadedCSMs.length }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">📊 {{ t('wlTotalClients') }}</div>
        <div class="mod-kpi-val" style="color: #34A853">{{ clientsStore.clients.length }}</div>
      </div>
    </div>

    <!-- Workload chart -->
    <div class="mod-card" v-if="csmStore.workloadByCSM.length">
      <h3 class="mod-section-title">📊 {{ t('wlLoadByCSM') }}</h3>
      <apexchart type="bar" height="300" :options="chartOpts" :series="chartSeries" />
    </div>

    <!-- CSM detail cards -->
    <div class="workload-grid">
      <div v-for="csm in csmStore.workloadByCSM" :key="csm.id" class="mod-card workload-csm-card">
        <div class="workload-csm-header">
          <div class="workload-avatar" :style="{ background: loadColor(csm.workloadPct) }">{{ (csm.name || '?')[0] }}</div>
          <div>
            <div style="font-weight: 800; font-size: 15px">{{ csm.name }}</div>
            <div style="font-size: 12px; color: #5F6368">{{ csm.clients.length }} {{ t('clients') }}</div>
          </div>
          <div class="workload-pct" :style="{ color: loadColor(csm.workloadPct) }">{{ csm.workloadPct }}%</div>
        </div>
        <div class="mod-progress-bar" style="margin-top: 12px">
          <div class="mod-progress-fill" :style="{ width: csm.workloadPct + '%', background: loadGrad(csm.workloadPct) }"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #5F6368">
          <span>{{ csm.atRiskCount }} {{ t('atRisk') }}</span>
          <span>{{ csm.clients.length }} / 15 {{ t('clients') }}</span>
        </div>
      </div>
    </div>

    <div v-if="!csmStore.csms.length && !csmStore.loading" class="mod-card">
      <div class="mod-empty">
        <p style="font-size: 40px; margin-bottom: 12px;">⚖️</p>
        <p style="font-weight: 700;">{{ t('wlNoClients') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCSMStore } from '../../stores/csm'
import { useClientsStore } from '../../stores/clients'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const csmStore = useCSMStore()
const clientsStore = useClientsStore()

function loadColor(pct) { return pct >= 85 ? '#EA4335' : pct >= 60 ? '#FBBC05' : '#34A853' }
function loadGrad(pct) { return pct >= 85 ? 'linear-gradient(90deg, #EA4335, #F44336)' : pct >= 60 ? 'linear-gradient(90deg, #FBBC05, #FF9800)' : 'linear-gradient(90deg, #34A853, #4CAF50)' }

const chartOpts = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: "'DM Sans', sans-serif" },
  plotOptions: { bar: { borderRadius: 8, horizontal: true, barHeight: '60%' } },
  colors: csmStore.workloadByCSM.map(c => loadColor(c.workloadPct)),
  xaxis: { max: 100, labels: { formatter: v => v + '%' } },
  yaxis: { labels: { style: { fontWeight: 700 } } },
  labels: csmStore.workloadByCSM.map(c => c.name),
}))
const chartSeries = computed(() => [{ name: 'Charge', data: csmStore.workloadByCSM.map(c => c.workloadPct) }])

onMounted(async () => {
  if (!clientsStore.clients.length) await clientsStore.fetchClients()
  if (!csmStore.csms.length) await csmStore.fetchCSMs()
})
</script>

<style scoped>
.workload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-top: 16px; }
.workload-csm-card { padding: 20px; }
.workload-csm-header { display: flex; align-items: center; gap: 12px; }
.workload-avatar { width: 40px; height: 40px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.workload-pct { margin-left: auto; font-size: 24px; font-weight: 900; }
</style>
