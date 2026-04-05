<template>
  <div class="mod-page fade-in">
    <!-- Header + Filters -->
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">⭐ {{ t('htTitle') }}</h1>
        <p class="mod-subtitle">{{ t('htSubtitle') }}</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" :style="{ color: '#fff' }">{{ clientsStore.avgHealthScore }}</div>
        <div class="mod-big-label">{{ t('scoreAvg') }}</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="mod-card ht-filter-bar">
      <div class="ht-filters">
        <div class="ht-filter-group">
          <button
            v-for="f in riskFilters"
            :key="f.value"
            class="ht-filter-btn"
            :class="{ 'ht-filter-btn--active': activeRiskFilter === f.value }"
            @click="activeRiskFilter = f.value"
          >
            <span v-if="f.dot" class="ht-dot" :style="{ background: f.dot }"></span>
            {{ f.label }}
            <span class="ht-filter-count">{{ f.count }}</span>
          </button>
        </div>
        <div class="ht-filter-right">
          <select v-model="activeCsmFilter" class="mod-search ht-select">
            <option value="">{{ t('htAllCSM') }}</option>
            <option v-for="csm in uniqueCSMs" :key="csm" :value="csm">{{ csm }}</option>
          </select>
          <select v-model="activeSort" class="mod-search ht-select">
            <option value="score">{{ t('htSortScore') }}</option>
            <option value="arr">{{ t('htSortARR') }}</option>
            <option value="renewal">{{ t('htSortRenewal') }}</option>
            <option value="name">{{ t('htSortName') }}</option>
          </select>
          <input v-model="search" :placeholder="'🔍 ' + t('searchPlaceholder')" class="mod-search" />
        </div>
      </div>
    </div>

    <!-- Portfolio Health Score -->
    <div class="mod-card ht-portfolio-card">
      <div class="ht-portfolio-grid">
        <!-- Health Ring -->
        <div class="ht-ring-block">
          <svg viewBox="0 0 120 120" class="ht-ring-svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E8EAED" stroke-width="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              :stroke="scoreColor(clientsStore.avgHealthScore)"
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 52"
              :stroke-dashoffset="2 * Math.PI * 52 * (1 - clientsStore.avgHealthScore / 100)"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="56" text-anchor="middle" class="ht-ring-num" :fill="scoreColor(clientsStore.avgHealthScore)">{{ clientsStore.avgHealthScore }}</text>
            <text x="60" y="72" text-anchor="middle" class="ht-ring-label">/100</text>
          </svg>
          <div class="ht-ring-caption">{{ t('htPortfolioHealth') }}</div>
        </div>

        <!-- Distribution -->
        <div class="ht-dist-block">
          <div class="ht-dist-title">{{ t('htDistBar') }}</div>
          <div class="ht-dist-bar">
            <div class="ht-dist-seg ht-dist-seg--healthy" :style="{ width: pctHealthy + '%' }" :title="t('htStatusHealthy')"></div>
            <div class="ht-dist-seg ht-dist-seg--neutral" :style="{ width: pctNeutral + '%' }" :title="t('htStatusNeutral')"></div>
            <div class="ht-dist-seg ht-dist-seg--risk" :style="{ width: pctAtRisk + '%' }" :title="t('htStatusAtRisk')"></div>
          </div>
          <div class="ht-dist-legend">
            <span class="ht-legend-item"><span class="ht-dot" style="background:#34A853"></span>{{ t('htStatusHealthy') }} ({{ clientsStore.healthyClients.length }})</span>
            <span class="ht-legend-item"><span class="ht-dot" style="background:#FBBC05"></span>{{ t('htStatusNeutral') }} ({{ clientsStore.neutralClients.length }})</span>
            <span class="ht-legend-item"><span class="ht-dot" style="background:#EA4335"></span>{{ t('htStatusAtRisk') }} ({{ clientsStore.atRiskClients.length }})</span>
          </div>
        </div>

        <!-- ARR Summary -->
        <div class="ht-arr-block">
          <div class="ht-arr-row">
            <span class="ht-arr-label">{{ t('htTotalARR') }}</span>
            <span class="ht-arr-val" style="color:#4285F4">{{ fmtCurrency(clientsStore.totalARR) }}</span>
          </div>
          <div class="ht-arr-row">
            <span class="ht-arr-label">{{ t('htArrAtRisk') }}</span>
            <span class="ht-arr-val" style="color:#EA4335">{{ fmtCurrency(arrAtRisk) }}</span>
          </div>
          <div class="ht-action-prompt" v-if="clientsStore.atRiskClients.length + clientsStore.neutralClients.length > 0">
            ⚠️ <strong>{{ clientsStore.atRiskClients.length + clientsStore.neutralClients.length }}</strong> {{ t('htNeedAttention') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Client Cards Grid -->
    <div v-if="clientsStore.loading" class="mod-empty">{{ t('loadingText') }}</div>
    <div v-else-if="!filteredClients.length" class="mod-card mod-empty">{{ t('htNoClients') }}</div>
    <div v-else class="ht-cards-grid">
      <div v-for="c in filteredClients" :key="c.id" class="ht-client-card" @click="goToClient(c)">
        <!-- Card Header -->
        <div class="ht-card-top">
          <div class="ht-card-avatar" :style="{ background: scoreColor(c.healthScore) }">
            {{ (c.name || '?')[0].toUpperCase() }}
          </div>
          <div class="ht-card-info">
            <div class="ht-card-name">{{ c.name }}</div>
            <div class="ht-card-csm">{{ c.csmName || '—' }}</div>
          </div>
          <svg viewBox="0 0 40 40" class="ht-mini-ring">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#E8EAED" stroke-width="3" />
            <circle
              cx="20" cy="20" r="16" fill="none"
              :stroke="scoreColor(c.healthScore)"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 16"
              :stroke-dashoffset="2 * Math.PI * 16 * (1 - c.healthScore / 100)"
              transform="rotate(-90 20 20)"
            />
            <text x="20" y="24" text-anchor="middle" class="ht-mini-num" :fill="scoreColor(c.healthScore)">{{ c.healthScore }}</text>
          </svg>
        </div>

        <!-- Card Body -->
        <div class="ht-card-body">
          <div class="ht-card-row">
            <span class="mod-pill" :class="'mod-pill--' + c.status">{{ statusLabel(c.status) }}</span>
            <span class="ht-card-trend" :class="'ht-trend--' + getTrend(c).key">{{ getTrend(c).icon }} {{ getTrend(c).label }}</span>
          </div>
          <div class="ht-card-row">
            <span class="ht-card-arr">{{ fmtCurrency(c.arrValue) }}</span>
            <span class="ht-card-renewal" v-if="c.renewal">
              📅 {{ renewalLabel(c.renewal) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Insights -->
    <div class="mod-card ht-insights">
      <h3 class="mod-section-title">💡 {{ t('htQuickInsights') }}</h3>
      <div class="ht-insights-grid">
        <div class="ht-insight-item">
          <span class="ht-insight-num" style="color:#FBBC05">{{ renewalsIn30 }}</span>
          <span class="ht-insight-text">{{ t('htRenewalsIn30') }}</span>
        </div>
        <div class="ht-insight-item">
          <span class="ht-insight-num" style="color:#EA4335">{{ decliningCount }}</span>
          <span class="ht-insight-text">{{ t('htDecliningClients') }}</span>
        </div>
        <div class="ht-insight-item">
          <span class="ht-insight-num" style="color:#34A853">{{ topCSMName || '—' }}</span>
          <span class="ht-insight-text">{{ t('htTopCSM') }}</span>
        </div>
        <div class="ht-insight-item">
          <span class="ht-insight-num" style="color:#EA4335">{{ fmtCurrency(arrAtRisk) }}</span>
          <span class="ht-insight-text">{{ t('htTotalArrAtRisk') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '../../stores/clients'
import { useTasksStore } from '../../stores/tasks'
import { scalyoEvents } from '../../utils/eventBus'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const clientsStore = useClientsStore()
const tasksStore = useTasksStore()

// Filters
const search = ref('')
const activeRiskFilter = ref('')
const activeCsmFilter = ref('')
const activeSort = ref('score')

// Risk filter options
const riskFilters = computed(() => [
  { value: '', label: t('htFilterAll'), count: clientsStore.clients.length, dot: null },
  { value: 'healthy', label: t('htFilterHealthy'), count: clientsStore.healthyClients.length, dot: '#34A853' },
  { value: 'neutral', label: t('htFilterNeutral'), count: clientsStore.neutralClients.length, dot: '#FBBC05' },
  { value: 'at-risk', label: t('htFilterAtRisk'), count: clientsStore.atRiskClients.length, dot: '#EA4335' },
])

// Unique CSM list
const uniqueCSMs = computed(() => {
  const csms = new Set(clientsStore.clients.map(c => c.csmName).filter(Boolean))
  return [...csms].sort()
})

// Filtered + sorted clients
const filteredClients = computed(() => {
  let list = [...clientsStore.clients]
  // Risk filter
  if (activeRiskFilter.value) {
    list = list.filter(c => c.status === activeRiskFilter.value)
  }
  // CSM filter
  if (activeCsmFilter.value) {
    list = list.filter(c => c.csmName === activeCsmFilter.value)
  }
  // Search
  const q = search.value.toLowerCase()
  if (q) {
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.csmName || '').toLowerCase().includes(q))
  }
  // Sort
  switch (activeSort.value) {
    case 'score': list.sort((a, b) => a.healthScore - b.healthScore); break
    case 'arr': list.sort((a, b) => (b.arrValue || 0) - (a.arrValue || 0)); break
    case 'name': list.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break
    case 'renewal': list.sort((a, b) => {
      if (!a.renewal) return 1
      if (!b.renewal) return -1
      return new Date(a.renewal) - new Date(b.renewal)
    }); break
  }
  return list
})

// Distribution percentages
const total = computed(() => clientsStore.clients.length || 1)
const pctHealthy = computed(() => Math.round(clientsStore.healthyClients.length / total.value * 100))
const pctNeutral = computed(() => Math.round(clientsStore.neutralClients.length / total.value * 100))
const pctAtRisk = computed(() => Math.round(clientsStore.atRiskClients.length / total.value * 100))

// ARR at risk
const arrAtRisk = computed(() => clientsStore.atRiskClients.reduce((a, c) => a + (c.arrValue || 0), 0))

// Renewals in 30 days
const renewalsIn30 = computed(() => {
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return clientsStore.clients.filter(c => {
    if (!c.renewal) return false
    const d = new Date(c.renewal)
    return d >= now && d <= in30
  }).length
})

// Declining clients (score < 60 as proxy for declining)
const decliningCount = computed(() => clientsStore.atRiskClients.length)

// Top CSM by average health
const topCSMName = computed(() => {
  const csmMap = {}
  clientsStore.clients.forEach(c => {
    if (!c.csmName) return
    if (!csmMap[c.csmName]) csmMap[c.csmName] = { total: 0, count: 0 }
    csmMap[c.csmName].total += c.healthScore
    csmMap[c.csmName].count++
  })
  let best = null
  let bestAvg = 0
  Object.entries(csmMap).forEach(([name, data]) => {
    const avg = data.total / data.count
    if (avg > bestAvg) { bestAvg = avg; best = name }
  })
  return best
})

// Helpers
function scoreColor(s) { return s >= 75 ? '#34A853' : s >= 60 ? '#FBBC05' : '#EA4335' }

function statusLabel(s) {
  return s === 'healthy' ? t('htStatusHealthy') : s === 'neutral' ? t('htStatusNeutral') : t('htStatusAtRisk')
}

function fmtCurrency(v) {
  if (!v) return '0€'
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M€'
  if (v >= 1000) return Math.round(v / 1000) + 'K€'
  return v + '€'
}

function getTrend(c) {
  // Use healthScore as proxy: >=75 improving, 60-74 stable, <60 declining
  if (c.healthScore >= 75) return { key: 'up', icon: '↑', label: t('htTrendUp') }
  if (c.healthScore >= 60) return { key: 'stable', icon: '→', label: t('htTrendStable') }
  return { key: 'down', icon: '↓', label: t('htTrendDown') }
}

function renewalLabel(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return t('htRenewalOverdue')
  return t('htRenewalIn').replace('{days}', diff)
}

const router = useRouter()
function goToClient(c) {
  router.push({ name: 'portfolio', query: { client: c.id } })
}

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

<style scoped>
/* Filter Bar */
.ht-filter-bar { padding: 14px 20px !important; }
.ht-filters { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.ht-filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
.ht-filter-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 20px; border: 1px solid #E8EAED;
  background: #fff; font-size: 12px; font-weight: 700; color: #5F6368;
  cursor: pointer; transition: all .15s;
  font-family: 'DM Sans', sans-serif;
}
.ht-filter-btn:hover { border-color: #4285F4; color: #4285F4; }
.ht-filter-btn--active { background: #4285F4; color: #fff; border-color: #4285F4; }
.ht-filter-btn--active .ht-dot { background: #fff !important; }
.ht-filter-count { font-size: 10px; opacity: .7; }
.ht-filter-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ht-select { width: auto; min-width: 130px; font-family: 'DM Sans', sans-serif; }
.ht-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

/* Portfolio Health Card */
.ht-portfolio-card { padding: 28px !important; }
.ht-portfolio-grid { display: grid; grid-template-columns: 160px 1fr 220px; gap: 32px; align-items: center; }
@media (max-width: 800px) { .ht-portfolio-grid { grid-template-columns: 1fr; gap: 20px; } }

/* Health Ring */
.ht-ring-block { text-align: center; }
.ht-ring-svg { width: 120px; height: 120px; }
.ht-ring-num { font-size: 28px; font-weight: 900; font-family: 'DM Sans', sans-serif; }
.ht-ring-label { font-size: 12px; fill: #9AA0A6; font-family: 'DM Sans', sans-serif; }
.ht-ring-caption { font-size: 12px; font-weight: 700; color: #5F6368; margin-top: 6px; text-transform: uppercase; letter-spacing: .04em; }

/* Distribution Bar */
.ht-dist-block {}
.ht-dist-title { font-size: 11px; font-weight: 700; color: #5F6368; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 10px; }
.ht-dist-bar { display: flex; height: 14px; border-radius: 7px; overflow: hidden; background: #E8EAED; }
.ht-dist-seg { min-width: 2px; transition: width .3s; }
.ht-dist-seg--healthy { background: #34A853; }
.ht-dist-seg--neutral { background: #FBBC05; }
.ht-dist-seg--risk { background: #EA4335; }
.ht-dist-legend { display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap; }
.ht-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: #5F6368; }

/* ARR Block */
.ht-arr-block {}
.ht-arr-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F3F4; }
.ht-arr-label { font-size: 13px; color: #5F6368; font-weight: 600; }
.ht-arr-val { font-size: 18px; font-weight: 900; }
.ht-action-prompt { margin-top: 12px; padding: 10px 14px; background: #FEF7E0; border-radius: 10px; font-size: 13px; color: #E37400; font-weight: 600; }

/* Client Cards Grid */
.ht-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-bottom: 16px; }
.ht-client-card {
  background: #fff; border-radius: 16px; padding: 18px 20px;
  box-shadow: 0 2px 16px rgba(0,0,0,.07); cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}
.ht-client-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,.12); }

/* Card Top */
.ht-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.ht-card-avatar {
  width: 40px; height: 40px; border-radius: 12px; display: flex;
  align-items: center; justify-content: center; color: #fff;
  font-weight: 900; font-size: 16px; flex-shrink: 0;
}
.ht-card-info { flex: 1; min-width: 0; }
.ht-card-name { font-size: 14px; font-weight: 800; color: #202124; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ht-card-csm { font-size: 11px; color: #9AA0A6; }

/* Mini ring */
.ht-mini-ring { width: 40px; height: 40px; flex-shrink: 0; }
.ht-mini-num { font-size: 11px; font-weight: 900; font-family: 'DM Sans', sans-serif; }

/* Card Body */
.ht-card-body {}
.ht-card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ht-card-arr { font-size: 15px; font-weight: 800; color: #202124; }
.ht-card-renewal { font-size: 11px; color: #5F6368; }
.ht-card-trend { font-size: 11px; font-weight: 700; }
.ht-trend--up { color: #34A853; }
.ht-trend--stable { color: #FBBC05; }
.ht-trend--down { color: #EA4335; }

/* Quick Insights */
.ht-insights { margin-top: 4px; }
.ht-insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 14px; }
.ht-insight-item { display: flex; flex-direction: column; gap: 4px; padding: 14px; background: #F8F9FA; border-radius: 12px; }
.ht-insight-num { font-size: 22px; font-weight: 900; }
.ht-insight-text { font-size: 12px; color: #5F6368; font-weight: 600; }
</style>
