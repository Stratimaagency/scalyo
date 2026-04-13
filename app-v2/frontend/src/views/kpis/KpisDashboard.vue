<template>
  <div class="kd" v-if="copil">
    <!-- HEADER -->
    <div class="kd-header">
      <div class="kd-header-left">
        <router-link to="/app/kpis" class="kd-back">← {{ t('back') }}</router-link>
        <h1><span class="kd-dot" :style="{ background: copil.color }" /> {{ copil.name }}</h1>
        <p class="kd-period">{{ copil.period }} · {{ copil.subtitle || '' }}</p>
      </div>
      <div class="kd-header-right">
        <div class="kd-global-score" :class="store.scoreStatus(globalScore)">
          <span class="kgs-label">{{ t('copil_score') }}</span>
          <span class="kgs-value">{{ globalScore }}</span>
          <span class="kgs-max">/100</span>
          <span class="kgs-status">{{ t('copil_' + store.scoreStatus(globalScore)) }}</span>
        </div>
        <router-link :to="'/app/kpis/' + id + '/present'" class="btn-outline">{{ t('copil_present') }}</router-link>
      </div>
    </div>

    <!-- TABS -->
    <div class="kd-tabs">
      <button v-for="tab in tabs" :key="tab.key" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ t(tab.label) }}</button>
    </div>

    <!-- OVERVIEW -->
    <div v-if="activeTab === 'overview'">
      <!-- Hero KPIs (top 4) -->
      <div class="kd-heroes">
        <div v-for="(kpi, i) in heroKpis" :key="kpi.kpiId" class="hero-card" :class="kpiStatus(kpi)" :style="{ animationDelay: i * 0.15 + 's' }">
          <div class="hc-header">
            <span class="hc-name">{{ kpi.name }}</span>
            <span class="hc-unit">{{ kpi.unit }}</span>
          </div>
          <div class="hc-value">{{ fmtVal(kpi) }}</div>
          <div class="hc-sparkline">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none">
              <polyline :points="sparkPoints(kpi)" fill="none" :stroke="sparkColor(kpi)" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <div class="hc-footer">
            <span>{{ t('copil_wiz_target') }}: {{ fmtVal({ ...kpi, value: kpi.target }) }}</span>
            <span :class="deltaClass(kpi)">{{ deltaText(kpi) }} {{ t('copil_vs_target') }}</span>
          </div>
          <div class="hc-bar"><div class="hc-bar-fill" :style="{ width: Math.min(barPct(kpi), 100) + '%' }" /></div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="kd-charts-row">
        <!-- Waterfall -->
        <div class="kd-chart-card wide">
          <h3>{{ t('copil_waterfall') }}</h3>
          <div class="waterfall">
            <div v-for="bar in waterfallBars" :key="bar.label" class="wf-bar-wrap">
              <div class="wf-val" :class="bar.type">{{ bar.label === 'ARR Fin' ? '' : (bar.value >= 0 ? '+' : '') }}{{ fmtCurrency(bar.value) }}</div>
              <div class="wf-bar" :class="bar.type" :style="{ height: Math.abs(bar.value) / waterfallMax * 120 + 'px' }" />
              <div class="wf-label">{{ bar.label }}</div>
            </div>
          </div>
        </div>

        <!-- Health distribution -->
        <div class="kd-chart-card">
          <h3>{{ t('copil_health_dist') }}</h3>
          <div class="health-donut">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" stroke-width="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="12" :stroke-dasharray="healthyArc + ' 314.16'" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" stroke-width="12" :stroke-dasharray="watchArc + ' 314.16'" :stroke-dashoffset="'-' + healthyArc" stroke-linecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" stroke-width="12" :stroke-dasharray="criticalArc + ' 314.16'" :stroke-dashoffset="'-' + (parseFloat(healthyArc) + parseFloat(watchArc))" stroke-linecap="round" transform="rotate(-90 60 60)" />
              <text x="60" y="56" text-anchor="middle" font-size="22" font-weight="800" fill="#1a1a2e">{{ clients.avgHealth }}</text>
              <text x="60" y="72" text-anchor="middle" font-size="10" fill="#6b7280">/10</text>
            </svg>
          </div>
          <div class="hd-legend">
            <div><span class="dot green" /> {{ t('status_healthy') }}: <strong>{{ clients.healthyCount }}</strong></div>
            <div><span class="dot amber" /> {{ t('status_watch') }}: <strong>{{ clients.watchCount }}</strong></div>
            <div><span class="dot red" /> {{ t('status_critical') }}: <strong>{{ clients.criticalCount }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Secondary KPIs -->
      <div v-if="secondaryKpis.length" class="kd-secondary">
        <div v-for="kpi in secondaryKpis" :key="kpi.kpiId" class="sec-card" :class="kpiStatus(kpi)">
          <span class="sc-name">{{ kpi.name }}</span>
          <span class="sc-value">{{ fmtVal(kpi) }}</span>
          <span class="sc-target">{{ t('copil_wiz_target') }}: {{ fmtVal({ ...kpi, value: kpi.target }) }}</span>
          <div class="sc-bar"><div class="sc-fill" :style="{ width: Math.min(barPct(kpi), 100) + '%' }" /></div>
        </div>
      </div>

      <!-- Nova Analysis -->
      <div class="kd-nova">
        <h3>{{ t('copil_nova_title') }}</h3>
        <div class="nova-body">
          <div class="nova-section green">
            <h4>{{ t('copil_nova_strengths') }}</h4>
            <ul><li v-for="s in novaStrengths" :key="s">{{ s }}</li></ul>
          </div>
          <div class="nova-section amber">
            <h4>{{ t('copil_nova_warnings') }}</h4>
            <ul><li v-for="w in novaWarnings" :key="w">{{ w }}</li></ul>
          </div>
          <div class="nova-section blue">
            <h4>{{ t('copil_nova_actions') }}</h4>
            <ol><li v-for="a in novaActions" :key="a">{{ a }}</li></ol>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAILS tab -->
    <div v-if="activeTab === 'details'" class="kd-details">
      <table class="details-table">
        <thead><tr><th>KPI</th><th>{{ t('copil_wiz_current') }}</th><th>{{ t('copil_wiz_target') }}</th><th>Δ</th><th>%</th></tr></thead>
        <tbody>
          <tr v-for="kpi in copil.kpis" :key="kpi.kpiId">
            <td><strong>{{ kpi.name }}</strong></td>
            <td>{{ fmtVal(kpi) }}</td>
            <td>{{ fmtVal({ ...kpi, value: kpi.target }) }}</td>
            <td :class="deltaClass(kpi)">{{ deltaText(kpi) }}</td>
            <td>{{ barPct(kpi) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Placeholder for other tabs -->
    <div v-if="['revenue','retention','team'].includes(activeTab)" class="kd-placeholder">
      <p>{{ t('copil_' + activeTab) }} — {{ t('loading') }}</p>
    </div>
  </div>

  <!-- Not found -->
  <div v-else class="kd-notfound">
    <p>COPIL not found</p>
    <router-link to="/app/kpis">{{ t('back') }}</router-link>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'
import { useClientStore } from '@/stores/clients'

const props = defineProps({ id: String })
const { t } = useI18n({ useScope: 'global' })
const store = useKpiStore()
const clients = useClientStore()

const activeTab = ref('overview')
const tabs = [
  { key: 'overview', label: 'copil_overview' },
  { key: 'revenue', label: 'copil_revenue' },
  { key: 'retention', label: 'copil_retention' },
  { key: 'team', label: 'copil_team' },
  { key: 'details', label: 'copil_details' },
]

const copil = computed(() => store.getCopil(props.id))
const globalScore = computed(() => store.computeScore(copil.value))
const heroKpis = computed(() => (copil.value?.kpis || []).slice(0, 4))
const secondaryKpis = computed(() => (copil.value?.kpis || []).slice(4))

function fmtVal(kpi) {
  const v = kpi.value
  if (v == null) return '—'
  if (kpi.format === 'currency') return '€' + (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v)
  if (kpi.format === 'pct') return v + '%'
  return v + (kpi.unit || '')
}

function fmtCurrency(v) {
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M€'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + 'K€'
  return v + '€'
}

function kpiStatus(kpi) {
  if (!kpi.target) return ''
  const ratio = kpi.inverse ? kpi.target / kpi.value : kpi.value / kpi.target
  return ratio >= 0.95 ? 'status-good' : ratio >= 0.7 ? 'status-warn' : 'status-bad'
}

function barPct(kpi) {
  if (!kpi.target) return 0
  return Math.round((kpi.inverse ? kpi.target / kpi.value : kpi.value / kpi.target) * 100)
}

function deltaText(kpi) {
  if (!kpi.target || !kpi.value) return '—'
  const diff = kpi.value - kpi.target
  const sign = diff >= 0 ? '+' : ''
  if (kpi.format === 'currency') return sign + fmtCurrency(diff)
  return sign + diff + (kpi.unit || '')
}

function deltaClass(kpi) {
  if (!kpi.target || !kpi.value) return ''
  const diff = kpi.value - kpi.target
  return (kpi.inverse ? diff <= 0 : diff >= 0) ? 'delta-pos' : 'delta-neg'
}

function sparkPoints(kpi) {
  const base = kpi.prevValue || kpi.value * 0.85
  const pts = [base, base * 1.02, base * 0.98, base * 1.05, kpi.value * 0.92, kpi.value * 0.96, kpi.value]
  const max = Math.max(...pts), min = Math.min(...pts)
  const range = max - min || 1
  return pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${30 - ((v - min) / range) * 28}`).join(' ')
}

function sparkColor(kpi) {
  const s = kpiStatus(kpi)
  return s === 'status-good' ? '#10b981' : s === 'status-warn' ? '#f59e0b' : '#ef4444'
}

// Waterfall mock
const waterfallBars = computed(() => {
  const arrStart = clients.totalArr
  const newArr = 85000
  const expansion = 42000
  const contraction = -15000
  const churn = -clients.arrAtRisk
  return [
    { label: 'ARR Start', value: arrStart, type: 'neutral' },
    { label: '+New', value: newArr, type: 'positive' },
    { label: '+Expansion', value: expansion, type: 'positive' },
    { label: '-Contraction', value: contraction, type: 'negative' },
    { label: '-Churn', value: churn, type: 'negative' },
    { label: 'ARR Fin', value: arrStart + newArr + expansion + contraction + churn, type: 'total' },
  ]
})
const waterfallMax = computed(() => Math.max(...waterfallBars.value.map(b => Math.abs(b.value))))

// Health donut
const circumference = 314.16
const total = computed(() => clients.clients.length || 1)
const healthyArc = computed(() => ((clients.healthyCount / total.value) * circumference).toFixed(1))
const watchArc = computed(() => ((clients.watchCount / total.value) * circumference).toFixed(1))
const criticalArc = computed(() => ((clients.criticalCount / total.value) * circumference).toFixed(1))

// Nova analysis (mock)
const novaStrengths = computed(() => {
  const s = []
  const nrr = copil.value?.kpis?.find(k => k.kpiId === 'nrr')
  if (nrr && nrr.value > 110) s.push(`NRR à ${nrr.value}% — rétention revenue excellente, top 15% industrie SaaS B2B`)
  if (clients.healthyCount > clients.criticalCount * 2) s.push(`${clients.healthyCount} comptes sains sur ${clients.clients.length} — portefeuille globalement solide`)
  s.push(`ARR portefeuille : ${fmtCurrency(clients.totalArr)}`)
  return s
})

const novaWarnings = computed(() => {
  const w = []
  const churn = copil.value?.kpis?.find(k => k.kpiId === 'churn_clients')
  if (churn && churn.value > churn.target) w.push(`Churn clients à ${churn.value}% vs objectif ${churn.target}% — ${clients.criticalCount} comptes critiques à traiter`)
  if (clients.criticalCount > 0) w.push(`${clients.criticalCount} comptes en statut critique nécessitent une intervention immédiate`)
  const nps = copil.value?.kpis?.find(k => k.kpiId === 'nps')
  if (nps && nps.value < 50) w.push(`NPS à ${nps.value} — sous la moyenne industrie (42)`)
  return w.length ? w : ['Aucun point d\'attention majeur détecté']
})

const novaActions = computed(() => [
  clients.criticalCount > 0 ? `Contacter les ${clients.criticalCount} comptes critiques cette semaine` : 'Maintenir le rythme de check-ins proactifs',
  'Planifier les QBR du trimestre prochain',
  'Lancer une campagne NPS promoteurs avant fin de période',
])
</script>

<style scoped>
.kd { max-width: 1100px; }
.kd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
.kd-back { font-size: 0.82rem; color: var(--text-muted); display: block; margin-bottom: 6px; }
.kd-back:hover { color: var(--purple); }
.kd-header h1 { font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.kd-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.kd-period { font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; }

.kd-global-score { display: flex; align-items: baseline; gap: 4px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 20px; }
.kd-global-score.excellent { border-color: var(--green-border); background: var(--green-bg); }
.kd-global-score.good { border-color: rgba(59,130,246,0.2); background: rgba(59,130,246,0.04); }
.kd-global-score.attention { border-color: var(--amber-border); background: var(--amber-bg); }
.kd-global-score.critical { border-color: var(--red-border); background: var(--red-bg); }
.kgs-label { font-size: 0.72rem; color: var(--text-muted); margin-right: 6px; }
.kgs-value { font-size: 1.8rem; font-weight: 800; }
.kgs-max { font-size: 0.85rem; color: var(--text-muted); }
.kgs-status { font-size: 0.72rem; font-weight: 600; margin-left: 8px; }
.kd-global-score.excellent .kgs-status { color: var(--green); }
.kd-global-score.attention .kgs-status { color: var(--amber); }
.kd-global-score.critical .kgs-status { color: var(--red); }

.kd-header-right { display: flex; align-items: center; gap: 10px; }
.btn-outline { background: #fff; border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; color: var(--text-secondary); text-decoration: none; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

/* Tabs */
.kd-tabs { display: flex; gap: 1px; background: var(--border-light); border-radius: 8px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 24px; }
.kd-tabs button { flex: 1; background: #fff; border: none; padding: 10px 16px; font-size: 0.82rem; font-weight: 500; cursor: pointer; color: var(--text-muted); transition: all 0.15s; }
.kd-tabs button.active { background: var(--purple); color: #fff; font-weight: 600; }
.kd-tabs button:hover:not(.active) { background: var(--bg-hover); }

/* Hero KPIs */
.kd-heroes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.hero-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; animation: heroEnter 0.5s ease both; position: relative; overflow: hidden; transition: all 0.2s; }
.hero-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.hero-card.status-good { background: #f0fdf4; border-color: rgba(16,185,129,0.2); }
.hero-card.status-warn { background: #fefce8; border-color: rgba(245,158,11,0.2); }
.hero-card.status-bad { background: #fef2f2; border-color: rgba(239,68,68,0.2); }
@keyframes heroEnter { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

.hc-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.hc-name { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
.hc-unit { font-size: 0.68rem; color: var(--text-muted); }
.hc-value { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
.hc-sparkline { height: 30px; margin-bottom: 8px; }
.hc-sparkline svg { width: 100%; height: 100%; }
.hc-footer { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 6px; }
.delta-pos { color: var(--green); font-weight: 600; }
.delta-neg { color: var(--red); font-weight: 600; }
.hc-bar { height: 4px; background: var(--border-light); border-radius: 2px; overflow: hidden; }
.hc-bar-fill { height: 100%; background: var(--purple); border-radius: 2px; transition: width 1s ease; }

/* Charts row */
.kd-charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 18px; margin-bottom: 24px; }
.kd-chart-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
.kd-chart-card h3 { font-size: 0.88rem; font-weight: 700; margin-bottom: 16px; }

/* Waterfall */
.waterfall { display: flex; align-items: flex-end; gap: 8px; height: 160px; padding-top: 30px; }
.wf-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.wf-val { font-size: 0.65rem; font-weight: 600; white-space: nowrap; }
.wf-val.positive { color: var(--green); }
.wf-val.negative { color: var(--red); }
.wf-val.neutral, .wf-val.total { color: var(--text); }
.wf-bar { width: 100%; max-width: 50px; border-radius: 4px 4px 0 0; transition: height 0.8s ease; }
.wf-bar.positive { background: var(--green); }
.wf-bar.negative { background: var(--red); }
.wf-bar.neutral { background: #6b7280; }
.wf-bar.total { background: var(--purple); }
.wf-label { font-size: 0.6rem; color: var(--text-muted); text-align: center; white-space: nowrap; }

/* Health donut */
.health-donut { width: 120px; height: 120px; margin: 0 auto 16px; }
.health-donut svg { width: 100%; height: 100%; }
.hd-legend { display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem; }
.hd-legend div { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.green { background: var(--green); }
.dot.amber { background: var(--amber); }
.dot.red { background: var(--red); }

/* Secondary KPIs */
.kd-secondary { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
.sec-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; }
.sec-card.status-good { border-left: 3px solid var(--green); }
.sec-card.status-warn { border-left: 3px solid var(--amber); }
.sec-card.status-bad { border-left: 3px solid var(--red); }
.sc-name { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.sc-value { font-size: 1.3rem; font-weight: 800; display: block; margin-bottom: 4px; }
.sc-target { font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 6px; }
.sc-bar { height: 3px; background: var(--border-light); border-radius: 2px; }
.sc-fill { height: 100%; background: var(--purple); border-radius: 2px; }

/* Nova */
.kd-nova { background: #fff; border: 1px solid var(--border); border-left: 4px solid var(--purple); border-radius: var(--radius-md); padding: 24px; margin-bottom: 24px; }
.kd-nova h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
.nova-body { display: flex; flex-direction: column; gap: 16px; }
.nova-section { padding: 14px; border-radius: var(--radius-sm); }
.nova-section.green { background: var(--green-bg); }
.nova-section.amber { background: var(--amber-bg); }
.nova-section.blue { background: rgba(59,130,246,0.06); }
.nova-section h4 { font-size: 0.82rem; font-weight: 700; margin-bottom: 8px; }
.nova-section ul, .nova-section ol { padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.nova-section li { font-size: 0.82rem; line-height: 1.5; }

/* Details table */
.details-table { width: 100%; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); border-collapse: collapse; overflow: hidden; }
.details-table th { padding: 10px 14px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); border-bottom: 2px solid var(--border); text-align: left; background: var(--bg); }
.details-table td { padding: 10px 14px; font-size: 0.85rem; border-bottom: 1px solid var(--border-light); }

.kd-placeholder { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 60px 20px; text-align: center; color: var(--text-muted); }

.kd-notfound { text-align: center; padding: 60px; color: var(--text-muted); }
.kd-notfound a { color: var(--purple); margin-top: 12px; display: inline-block; }

@media (max-width: 900px) { .kd-heroes { grid-template-columns: repeat(2, 1fr); } .kd-charts-row { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .kd-heroes { grid-template-columns: 1fr; } .kd-tabs { overflow-x: auto; } }
</style>
