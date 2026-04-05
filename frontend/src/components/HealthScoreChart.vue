<template>
  <div class="health-chart-wrap">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h4 style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px;">
        📈 Historique Health Score
        <span v-if="trend" class="trend-badge" :class="trend.trend">
          {{ trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→' }}
          {{ Math.abs(trend.change_pct) }}%
        </span>
      </h4>
      <div style="display: flex; gap: 4px;">
        <button v-for="p in periods" :key="p.days" class="period-btn" :class="{ active: activePeriod === p.days }" @click="loadData(p.days)">
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--muted);">
      Chargement...
    </div>
    <div v-else-if="!history.length" style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 13px;">
      Pas encore d'historique. Le score sera enregistré à chaque modification.
    </div>
    <apexchart v-else type="area" height="220" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { healthHistoryApi } from '../api'

const props = defineProps({
  accountId: {
    type: [Number, String],
    required: true
  }
})

const history = ref([])
const trend = ref(null)
const loading = ref(false)
const activePeriod = ref(90)

const periods = [
  { days: 30, label: '30j' },
  { days: 90, label: '90j' },
  { days: 180, label: '6m' },
  { days: 365, label: '12m' }
]

async function loadData(days) {
  activePeriod.value = days
  loading.value = true
  try {
    const from = new Date(Date.now() - days * 86400000).toISOString()
    const res = await healthHistoryApi.get(props.accountId, { from, limit: 500 })
    history.value = res.data || []
  } catch (e) {
    // silently ignore
  }
  try {
    const res = await healthHistoryApi.trend(props.accountId)
    trend.value = res.data || null
  } catch (e) {
    // silently ignore
  }
  loading.value = false
}

const chartSeries = computed(() => [
  {
    name: 'Health Score',
    data: history.value.map((h) => ({
      x: new Date(h.recorded_at).getTime(),
      y: h.score
    }))
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'DM Sans, sans-serif'
  },
  stroke: { curve: 'smooth', width: 2.5 },
  colors: ['#4db6a0'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 }
  },
  xaxis: {
    type: 'datetime',
    labels: { style: { fontSize: '10px', colors: '#94a3b8' } }
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: { style: { fontSize: '10px', colors: '#94a3b8' } }
  },
  annotations: {
    yaxis: [
      {
        y: 70,
        borderColor: '#4db6a0',
        strokeDashArray: 4,
        label: {
          text: 'Seuil sain',
          style: { fontSize: '9px', color: '#4db6a0', background: 'transparent' }
        }
      },
      {
        y: 40,
        borderColor: '#dc2626',
        strokeDashArray: 4,
        label: {
          text: 'Seuil critique',
          style: { fontSize: '9px', color: '#dc2626', background: 'transparent' }
        }
      }
    ]
  },
  tooltip: {
    x: { format: 'dd MMM yyyy' },
    y: { formatter: (v) => v + '/100' }
  },
  grid: { borderColor: 'rgba(0,0,0,.06)', strokeDashArray: 3 }
}))

watch(() => props.accountId, () => {
  loadData(activePeriod.value)
})

onMounted(() => {
  loadData(90)
})
</script>

<style scoped>
.health-chart-wrap {
  padding: 16px;
  background: var(--card, white);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.period-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  cursor: pointer;
  color: var(--muted);
  font-weight: 600;
  transition: all .2s;
}
.period-btn.active {
  background: var(--teal);
  color: white;
  border-color: var(--teal);
}
.period-btn:hover:not(.active) {
  border-color: var(--teal);
  color: var(--teal);
}
.trend-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
}
.trend-badge.up {
  background: rgba(77, 182, 160, .1);
  color: #4db6a0;
}
.trend-badge.down {
  background: rgba(220, 38, 38, .1);
  color: #dc2626;
}
.trend-badge.stable {
  background: rgba(148, 163, 184, .1);
  color: #94a3b8;
}
</style>
