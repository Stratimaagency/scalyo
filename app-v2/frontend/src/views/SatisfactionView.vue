<template>
  <div class="satisfaction">
    <!-- HEADER -->
    <div class="sat-header">
      <div>
        <h1>⭐ {{ t('sat_title') }}</h1>
      </div>
      <div class="sat-header-right">
        <button class="btn-customize" @click="customizerOpen = true">⚙ {{ t('kpi_cust_title') }}</button>
        <button class="btn-outline" @click="resetFilters">{{ t('sat_reset') }}</button>
        <div class="sat-score-badge">
          <span class="ssb-label">{{ t('sat_avg_score') }}</span>
          <span class="ssb-value" :class="scoreColor(globalScore)">{{ globalScore }}</span>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="sat-filters">
      <div class="filter-tabs">
        <button v-for="f in statusFilters" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">
          {{ t(f.label) }}
        </button>
      </div>
      <select v-model="csmFilter" class="filter-select">
        <option value="all">{{ t('sat_all_csm') }}</option>
        <option v-for="m in team.members" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <select v-model="sortBy" class="filter-select">
        <option value="health">{{ t('sat_sort_health') }} ↑</option>
        <option value="health_desc">{{ t('sat_sort_health') }} ↓</option>
        <option value="arr">ARR ↓</option>
      </select>
      <div class="search-box">
        <span>🔍</span>
        <input v-model="search" :placeholder="t('search')" />
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="sat-grid">
      <!-- LEFT: Gauge + Distribution -->
      <div class="sat-left">
        <!-- Gauge -->
        <div class="sat-card gauge-card">
          <div class="gauge-wrap">
            <svg viewBox="0 0 200 200" class="gauge-svg">
              <circle cx="100" cy="100" r="85" fill="none" stroke="#f3f4f6" stroke-width="14" />
              <circle cx="100" cy="100" r="85" fill="none" :stroke="gaugeColor" stroke-width="14"
                :stroke-dasharray="gaugeArc + ' 534.07'" stroke-dashoffset="0" stroke-linecap="round"
                transform="rotate(-90 100 100)" class="gauge-progress" />
              <text x="100" y="92" text-anchor="middle" font-size="42" font-weight="800" :fill="gaugeColor">{{ globalScore }}</text>
              <text x="100" y="116" text-anchor="middle" font-size="14" fill="#9ca3af">{{ t('sat_score_out_of') }}</text>
            </svg>
          </div>

          <!-- Distribution -->
          <div class="distrib">
            <h3>{{ t('sat_distribution') }}</h3>
            <div class="distrib-bars">
              <div class="dbar">
                <div class="dbar-header"><span class="dot green" /> {{ t('sat_healthy') }}<strong>{{ clients.healthyCount }}</strong></div>
                <div class="dbar-track"><div class="dbar-fill green" :style="{ width: pct(clients.healthyCount) + '%' }" /></div>
              </div>
              <div class="dbar">
                <div class="dbar-header"><span class="dot amber" /> {{ t('sat_watch') }}<strong>{{ clients.watchCount }}</strong></div>
                <div class="dbar-track"><div class="dbar-fill amber" :style="{ width: pct(clients.watchCount) + '%' }" /></div>
              </div>
              <div class="dbar">
                <div class="dbar-header"><span class="dot red" /> {{ t('sat_risk') }}<strong>{{ clients.criticalCount }}</strong></div>
                <div class="dbar-track"><div class="dbar-fill red" :style="{ width: pct(clients.criticalCount) + '%' }" /></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ARR cards -->
        <div class="arr-row">
          <div class="arr-card">
            <span class="arr-label">{{ t('sat_arr_total') }}</span>
            <span class="arr-value">€{{ fmtNum(clients.totalArr) }}</span>
          </div>
          <div class="arr-card risk">
            <span class="arr-label">{{ t('sat_arr_at_risk') }}</span>
            <span class="arr-value red">€{{ fmtNum(clients.arrAtRisk) }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Portfolio health table + Key indicators -->
      <div class="sat-right">
        <div class="sat-card">
          <h3>{{ t('sat_portfolio_health') }}</h3>
          <div class="health-list">
            <div v-for="c in sortedClients" :key="c.id" class="hl-row">
              <div class="hl-left">
                <div class="hl-av" :class="c.status">{{ c.name[0] }}</div>
                <div class="hl-info">
                  <strong>{{ c.name }}</strong>
                  <span>{{ c.csm }} · €{{ fmtNum(c.arr) }}</span>
                </div>
              </div>
              <div class="hl-right">
                <div class="hl-score-wrap">
                  <span class="hl-score" :class="scoreColor(c.health * 10)">{{ (c.health * 10).toFixed(0) }}</span>
                  <div class="hl-bar-bg"><div class="hl-bar" :class="scoreColor(c.health * 10)" :style="{ width: c.health * 10 + '%' }" /></div>
                </div>
                <span class="hl-status" :class="c.status">{{ t('status_' + c.status) }}</span>
              </div>
            </div>
            <div v-if="!sortedClients.length" class="sat-empty">{{ t('sat_no_clients') }}</div>
          </div>
        </div>

        <!-- Key indicators -->
        <div class="sat-card indicators">
          <h3>{{ t('sat_key_indicators') }}</h3>
          <div class="ind-grid">
            <div class="ind">
              <span class="ind-icon">📅</span>
              <div>
                <span class="ind-val">{{ clients.renewalsNext30.length }}</span>
                <span class="ind-label">{{ t('sat_renewals_30d') }}</span>
              </div>
            </div>
            <div class="ind">
              <span class="ind-icon">📉</span>
              <div>
                <span class="ind-val red">{{ decliningCount }}</span>
                <span class="ind-label">{{ t('sat_declining') }}</span>
              </div>
            </div>
            <div class="ind">
              <span class="ind-icon">🏆</span>
              <div>
                <span class="ind-val green">{{ bestCsm }}</span>
                <span class="ind-label">{{ t('sat_best_csm') }}</span>
              </div>
            </div>
            <div class="ind">
              <span class="ind-icon">⚠️</span>
              <div>
                <span class="ind-val red">€{{ fmtNum(clients.arrAtRisk) }}</span>
                <span class="ind-label">{{ t('sat_arr_at_risk') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <KpiCustomizer :open="customizerOpen" page-id="satisfaction" :defaults="defaultKpis" v-model="selectedKpis" @close="customizerOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import KpiCustomizer from '@/components/KpiCustomizer.vue'

const { t } = useI18n({ useScope: 'global' })
const clients = useClientStore()
const team = useTeamStore()

const customizerOpen = ref(false)
const defaultKpis = ['health_score', 'nps', 'churn_rate', 'renewal_rate', 'csat', 'promoters_pct']
const selectedKpis = ref([...defaultKpis])

const activeFilter = ref('all')
const csmFilter = ref('all')
const sortBy = ref('health')
const search = ref('')

const statusFilters = [
  { key: 'all', label: 'sat_filter_all' },
  { key: 'healthy', label: 'sat_filter_healthy' },
  { key: 'watch', label: 'sat_filter_watch' },
  { key: 'risk', label: 'sat_filter_risk' },
]

function resetFilters() {
  activeFilter.value = 'all'
  csmFilter.value = 'all'
  sortBy.value = 'health'
  search.value = ''
}

const filteredClients = computed(() => {
  let list = clients.clients
  if (activeFilter.value === 'healthy') list = list.filter(c => c.status === 'healthy')
  else if (activeFilter.value === 'watch') list = list.filter(c => c.status === 'watch')
  else if (activeFilter.value === 'risk') list = list.filter(c => c.status === 'critical' || c.status === 'watch')
  if (csmFilter.value !== 'all') list = list.filter(c => c.csmId === csmFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q))
  }
  return list
})

const sortedClients = computed(() => {
  const list = [...filteredClients.value]
  if (sortBy.value === 'health') list.sort((a, b) => a.health - b.health)
  else if (sortBy.value === 'health_desc') list.sort((a, b) => b.health - a.health)
  else if (sortBy.value === 'arr') list.sort((a, b) => b.arr - a.arr)
  return list
})

const globalScore = computed(() => {
  if (!filteredClients.value.length) return 0
  return Math.round(filteredClients.value.reduce((s, c) => s + c.health * 10, 0) / filteredClients.value.length)
})

const gaugeColor = computed(() => {
  if (globalScore.value >= 70) return '#10b981'
  if (globalScore.value >= 50) return '#f59e0b'
  return '#ef4444'
})

const gaugeArc = computed(() => ((globalScore.value / 100) * 534.07).toFixed(1))

const decliningCount = computed(() => clients.clients.filter(c => c.health < 5).length)

const bestCsm = computed(() => {
  const csmScores = {}
  clients.clients.forEach(c => {
    if (!csmScores[c.csmId]) csmScores[c.csmId] = { total: 0, count: 0, name: c.csm }
    csmScores[c.csmId].total += c.health
    csmScores[c.csmId].count++
  })
  let best = null
  let bestAvg = 0
  for (const id in csmScores) {
    const avg = csmScores[id].total / csmScores[id].count
    if (avg > bestAvg) { bestAvg = avg; best = csmScores[id].name }
  }
  return best || '—'
})

function pct(count) {
  return clients.clients.length ? (count / clients.clients.length) * 100 : 0
}

function fmtNum(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : String(n) }

function scoreColor(score) {
  if (score >= 70) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}
</script>

<style scoped>
.satisfaction { max-width: 1200px; }

/* Header */
.sat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.sat-header h1 { font-size: 1.5rem; font-weight: 800; }
.sat-header-right { display: flex; align-items: center; gap: 12px; }
.btn-customize { background: #fff; border: 1px solid var(--border); padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.btn-customize:hover { border-color: var(--purple); color: var(--purple); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 500; transition: all 0.2s; cursor: pointer; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }
.sat-score-badge { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 18px; display: flex; align-items: center; gap: 10px; }
.ssb-label { font-size: 0.78rem; color: var(--text-secondary); }
.ssb-value { font-size: 1.4rem; font-weight: 800; }
.ssb-value.green { color: var(--green); }
.ssb-value.amber { color: var(--amber); }
.ssb-value.red { color: var(--red); }

/* Filters */
.sat-filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
.filter-tabs { display: flex; gap: 4px; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); transition: all 0.15s; cursor: pointer; }
.ftab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.ftab:hover:not(.active) { background: var(--bg-hover); }
.filter-select { padding: 7px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.82rem; background: #fff; outline: none; cursor: pointer; }
.filter-select:focus { border-color: var(--purple); }
.search-box { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0 10px; }
.search-box input { border: none; outline: none; padding: 7px 0; font-size: 0.82rem; width: 140px; background: transparent; }

/* Grid */
.sat-grid { display: grid; grid-template-columns: 380px 1fr; gap: 20px; }

/* Left column */
.sat-left { display: flex; flex-direction: column; gap: 16px; }
.sat-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
.sat-card h3 { font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--text); letter-spacing: 0.02em; }

/* Gauge */
.gauge-card { text-align: center; }
.gauge-wrap { width: 180px; height: 180px; margin: 0 auto 20px; }
.gauge-svg { width: 100%; height: 100%; }
.gauge-progress { transition: stroke-dasharray 0.8s ease; }

/* Distribution */
.distrib { text-align: left; }
.distrib-bars { display: flex; flex-direction: column; gap: 12px; }
.dbar-header { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
.dbar-header strong { margin-left: auto; color: var(--text); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.green { background: var(--green); }
.dot.amber { background: var(--amber); }
.dot.red { background: var(--red); }
.dbar-track { height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.dbar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.dbar-fill.green { background: var(--green); }
.dbar-fill.amber { background: var(--amber); }
.dbar-fill.red { background: var(--red); }

/* ARR */
.arr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.arr-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; text-align: center; }
.arr-card.risk { border-left: 3px solid var(--red); }
.arr-label { font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.arr-value { font-size: 1.3rem; font-weight: 800; }
.arr-value.red { color: var(--red); }

/* Right column */
.sat-right { display: flex; flex-direction: column; gap: 16px; }

/* Health list */
.health-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
.hl-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); transition: all 0.15s; }
.hl-row:hover { background: var(--bg-hover); border-color: var(--border); }
.hl-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.hl-av { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.hl-av.healthy { background: var(--green); }
.hl-av.watch { background: var(--amber); }
.hl-av.critical { background: var(--red); }
.hl-info { min-width: 0; }
.hl-info strong { font-size: 0.82rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hl-info span { font-size: 0.7rem; color: var(--text-muted); }
.hl-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hl-score-wrap { width: 80px; }
.hl-score { font-size: 0.85rem; font-weight: 700; }
.hl-score.green { color: var(--green); }
.hl-score.amber { color: var(--amber); }
.hl-score.red { color: var(--red); }
.hl-bar-bg { height: 4px; background: var(--border-light); border-radius: 2px; margin-top: 4px; }
.hl-bar { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
.hl-bar.green { background: var(--green); }
.hl-bar.amber { background: var(--amber); }
.hl-bar.red { background: var(--red); }
.hl-status { font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.hl-status.healthy { background: var(--green-bg); color: var(--green); }
.hl-status.watch { background: var(--amber-bg); color: var(--amber); }
.hl-status.critical { background: var(--red-bg); color: var(--red); }
.sat-empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem; }

/* Indicators */
.indicators { }
.ind-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ind { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--bg); border-radius: var(--radius-sm); }
.ind-icon { font-size: 1.3rem; }
.ind-val { font-size: 1.1rem; font-weight: 700; display: block; }
.ind-val.green { color: var(--green); }
.ind-val.red { color: var(--red); }
.ind-label { font-size: 0.72rem; color: var(--text-secondary); }

/* Responsive */
@media (max-width: 900px) { .sat-grid { grid-template-columns: 1fr; } .sat-left { order: -1; } }
@media (max-width: 600px) {
  .filter-tabs { flex-wrap: wrap; }
  .arr-row { grid-template-columns: 1fr; }
  .ind-grid { grid-template-columns: 1fr; }
  .gauge-wrap { width: 150px; height: 150px; }
}
</style>
