<template>
  <div class="mod-page fade-in">
    <!-- Hero -->
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">❤️ Health Tracker</h1>
        <p class="mod-subtitle">Suivi santé de vos clients en temps réel</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" :style="{ color: scoreColor(clientsStore.avgHealthScore) }">{{ clientsStore.avgHealthScore }}</div>
        <div class="mod-big-label">Score moyen</div>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="mod-kpi-row">
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">💙 Score moyen</div>
        <div class="mod-kpi-val" :style="{ color: scoreColor(clientsStore.avgHealthScore) }">{{ clientsStore.avgHealthScore }}/100</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">✅ Clients sains</div>
        <div class="mod-kpi-val" style="color: #34A853">{{ clientsStore.healthyClients.length }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">⚠️ À risque</div>
        <div class="mod-kpi-val" style="color: #EA4335">{{ clientsStore.atRiskClients.length }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">💰 ARR total</div>
        <div class="mod-kpi-val" style="color: #4285F4">{{ fmtCurrency(clientsStore.totalARR) }}</div>
      </div>
    </div>

    <!-- Distribution chart -->
    <div class="mod-card" v-if="clientsStore.clients.length">
      <h3 class="mod-section-title">📊 Distribution des scores</h3>
      <apexchart type="bar" height="250" :options="distChartOpts" :series="distSeries" />
    </div>

    <!-- Client list -->
    <div class="mod-card">
      <div class="mod-card-header">
        <h3 class="mod-section-title">🏢 Tous les clients</h3>
        <input v-model="search" placeholder="🔍 Rechercher..." class="mod-search" />
      </div>
      <div v-if="clientsStore.loading" class="mod-empty">Chargement...</div>
      <div v-else-if="!filteredClients.length" class="mod-empty">Aucun client trouvé</div>
      <div v-else class="mod-table-wrap">
        <table class="mod-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Score</th>
              <th>Statut</th>
              <th>ARR</th>
              <th>CSM</th>
              <th>Renouvellement</th>
              <th v-if="lateTasksByClient">Retards</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredClients" :key="c.id">
              <td style="font-weight: 700">{{ c.name }}</td>
              <td>
                <div class="mod-health-bar-wrap">
                  <div class="mod-health-bar" :style="{ width: c.healthScore + '%', background: scoreGrad(c.healthScore) }"></div>
                </div>
                <span :style="{ color: scoreColor(c.healthScore), fontWeight: 700, fontSize: '13px' }">{{ c.healthScore }}</span>
              </td>
              <td><span class="mod-pill" :class="'mod-pill--' + c.status">{{ statusLabel(c.status) }}</span></td>
              <td style="font-weight: 700">{{ fmtCurrency(c.arrValue) }}</td>
              <td>{{ c.csmName || '—' }}</td>
              <td>{{ c.renewal || '—' }}</td>
              <td v-if="lateTasksByClient">
                <span v-if="lateTasksByClient[c.name]" class="mod-pill mod-pill--at-risk">⚠️ {{ lateTasksByClient[c.name] }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useClientsStore } from '../../stores/clients'
import { useTasksStore } from '../../stores/tasks'
import { scalyoEvents } from '../../utils/eventBus'

const clientsStore = useClientsStore()
const tasksStore = useTasksStore()
const search = ref('')

const lateTasksByClient = computed(() => tasksStore.lateTasksByClient)

const filteredClients = computed(() => {
  const q = search.value.toLowerCase()
  const sorted = [...clientsStore.clients].sort((a, b) => a.healthScore - b.healthScore)
  if (!q) return sorted
  return sorted.filter(c => c.name.toLowerCase().includes(q) || (c.csmName || '').toLowerCase().includes(q))
})

function scoreColor(s) { return s >= 75 ? '#34A853' : s >= 60 ? '#FBBC05' : '#EA4335' }
function scoreGrad(s) { return s >= 75 ? 'linear-gradient(90deg, #34A853, #4CAF50)' : s >= 60 ? 'linear-gradient(90deg, #FBBC05, #FF9800)' : 'linear-gradient(90deg, #EA4335, #F44336)' }
function statusLabel(s) { return s === 'healthy' ? 'Sain' : s === 'neutral' ? 'À surveiller' : 'À risque' }
function fmtCurrency(v) {
  if (!v) return '0€'
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M€'
  if (v >= 1000) return Math.round(v / 1000) + 'K€'
  return v + '€'
}

// Distribution chart
const distChartOpts = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: "'DM Sans', sans-serif" },
  colors: ['#EA4335', '#FBBC05', '#34A853'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  xaxis: { categories: ['À risque (<60)', 'Neutre (60-74)', 'Sain (≥75)'] },
  legend: { show: false },
}))
const distSeries = computed(() => [{
  name: 'Clients',
  data: [
    clientsStore.clients.filter(c => c.healthScore < 60).length,
    clientsStore.clients.filter(c => c.healthScore >= 60 && c.healthScore < 75).length,
    clientsStore.clients.filter(c => c.healthScore >= 75).length,
  ]
}])

// Watch for at-risk changes → emit events
watch(() => clientsStore.atRiskClients, (newRisk) => {
  newRisk.forEach(client => {
    scalyoEvents.emit({ type: 'CLIENT_AT_RISK', payload: client })
  })
}, { deep: true })

onMounted(() => {
  if (!clientsStore.clients.length) clientsStore.fetchClients()
})
</script>
