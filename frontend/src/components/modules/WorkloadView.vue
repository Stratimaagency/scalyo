<template>
  <div class="mod-page fade-in">
    <!-- Hero -->
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">💚 {{ t('htTeamTitle') }}</h1>
        <p class="mod-subtitle">{{ t('htTeamSubtitle') }}</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" :style="{ color: teamScoreColor }">{{ teamScore }}</div>
        <div class="mod-big-label">{{ t('htTeamScore') }}</div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="mod-kpi-row">
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">👥 {{ t('htTeamMembers') }}</div>
        <div class="mod-kpi-val" style="color: #4285F4">{{ members.length }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">🟢 {{ t('htTeamHealthy') }}</div>
        <div class="mod-kpi-val" style="color: #34A853">{{ healthyCount }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">🔴 {{ t('htTeamOverloaded') }}</div>
        <div class="mod-kpi-val" style="color: #EA4335">{{ overloadedCount }}</div>
      </div>
      <div class="mod-kpi-card">
        <div class="mod-kpi-label">⚠️ {{ t('htAtRiskClients') }}</div>
        <div class="mod-kpi-val" style="color: #FBBC05">{{ totalAtRisk }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="ht-filters">
      <button v-for="f in filters" :key="f.value" class="ht-filter" :class="{ 'ht-filter--on': activeFilter === f.value }" @click="activeFilter = f.value">{{ f.label }}</button>
      <div class="ht-sort">
        <select v-model="sortBy" class="ht-select">
          <option value="name">{{ t('crmSortName') || 'Nom' }}</option>
          <option value="workload">{{ t('htWorkload') }}</option>
          <option value="clients">{{ t('htClients') }}</option>
          <option value="atRisk">{{ t('htAtRiskClients') }}</option>
        </select>
      </div>
    </div>

    <!-- Member cards -->
    <div v-if="filteredMembers.length" class="ht-grid">
      <div v-for="m in filteredMembers" :key="m.id" class="ht-card" :class="{ 'ht-card--alert': m.stressLevel === 'high' }">
        <!-- Header -->
        <div class="ht-card-header">
          <div class="ht-avatar" :style="{ background: stressGrad(m.stressLevel) }">{{ (m.name || '?')[0] }}</div>
          <div class="ht-card-info">
            <div class="ht-card-name">{{ m.name }}</div>
            <div class="ht-card-role">{{ m.role || 'CSM' }}</div>
          </div>
          <div class="ht-stress-badge" :style="{ background: stressColor(m.stressLevel) + '18', color: stressColor(m.stressLevel) }">
            {{ stressEmoji(m.stressLevel) }} {{ stressLabel(m.stressLevel) }}
          </div>
        </div>

        <!-- Metrics grid -->
        <div class="ht-metrics">
          <div class="ht-metric">
            <div class="ht-metric-label">{{ t('htWorkload') }}</div>
            <div class="ht-metric-bar">
              <div class="ht-metric-fill" :style="{ width: m.workloadPct + '%', background: loadColor(m.workloadPct) }"></div>
            </div>
            <div class="ht-metric-val" :style="{ color: loadColor(m.workloadPct) }">{{ m.workloadPct }}%</div>
          </div>
          <div class="ht-metric">
            <div class="ht-metric-label">{{ t('htWellbeing') }}</div>
            <div class="ht-metric-bar">
              <div class="ht-metric-fill" :style="{ width: m.wellbeingScore + '%', background: wellbeingColor(m.wellbeingScore) }"></div>
            </div>
            <div class="ht-metric-val" :style="{ color: wellbeingColor(m.wellbeingScore) }">{{ m.wellbeingScore }}/100</div>
          </div>
        </div>

        <!-- Client stats -->
        <div class="ht-client-stats">
          <div class="ht-client-stat">
            <span class="ht-client-stat-val">{{ m.clientCount }}</span>
            <span class="ht-client-stat-label">{{ t('htClients') }}</span>
          </div>
          <div class="ht-client-stat">
            <span class="ht-client-stat-val" :style="{ color: m.atRiskCount > 0 ? '#EA4335' : '#34A853' }">{{ m.atRiskCount }}</span>
            <span class="ht-client-stat-label">{{ t('htAtRiskClients') }}</span>
          </div>
          <div class="ht-client-stat">
            <span class="ht-client-stat-val" :style="{ color: avgHealthColor(m.avgHealth) }">{{ m.avgHealth }}</span>
            <span class="ht-client-stat-label">{{ t('htAvgHealth') }}</span>
          </div>
        </div>

        <!-- Tip -->
        <div class="ht-tip" :style="{ background: tipBg(m), color: tipColor(m) }">
          💡 {{ tipText(m) }}
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="mod-card">
      <div class="mod-empty">
        <p style="font-size: 40px; margin-bottom: 12px;">💚</p>
        <p style="font-weight: 700;">{{ t('htNoTeam') }}</p>
        <p style="color: #5F6368; margin-top: 4px;">{{ t('htNoTeamHint') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCSMStore } from '../../stores/csm'
import { useClientsStore } from '../../stores/clients'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const csmStore = useCSMStore()
const clientsStore = useClientsStore()

const activeFilter = ref('all')
const sortBy = ref('name')

const filters = computed(() => [
  { value: 'all', label: t('htFilterAll') },
  { value: 'overloaded', label: '🔴 ' + t('htFilterOverloaded') },
  { value: 'healthy', label: '🟢 ' + t('htFilterHealthy') },
  { value: 'atRisk', label: '⚠️ ' + t('htFilterAtRisk') },
])

const members = computed(() => {
  return csmStore.workloadByCSM.map(csm => ({
    id: csm.id,
    name: csm.name,
    role: csm.role || '',
    workloadPct: csm.workloadPct || 0,
    wellbeingScore: csm.workloadPct >= 85 ? 35 : csm.workloadPct >= 60 ? 60 : 85,
    stressLevel: csm.workloadPct >= 85 ? 'high' : csm.workloadPct >= 60 ? 'medium' : 'low',
    clientCount: csm.clientCount || csm.clients?.length || 0,
    atRiskCount: csm.atRiskCount || 0,
    avgHealth: csm.avgHealth || 0,
  }))
})

const filteredMembers = computed(() => {
  let list = [...members.value]
  if (activeFilter.value === 'overloaded') list = list.filter(m => m.stressLevel === 'high')
  if (activeFilter.value === 'healthy') list = list.filter(m => m.stressLevel === 'low')
  if (activeFilter.value === 'atRisk') list = list.filter(m => m.atRiskCount > 0)

  if (sortBy.value === 'workload') list.sort((a, b) => b.workloadPct - a.workloadPct)
  else if (sortBy.value === 'clients') list.sort((a, b) => b.clientCount - a.clientCount)
  else if (sortBy.value === 'atRisk') list.sort((a, b) => b.atRiskCount - a.atRiskCount)
  else list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  return list
})

const teamScore = computed(() => {
  if (!members.value.length) return 0
  return Math.round(members.value.reduce((s, m) => s + m.wellbeingScore, 0) / members.value.length)
})
const teamScoreColor = computed(() => teamScore.value >= 70 ? '#34A853' : teamScore.value >= 50 ? '#FBBC05' : '#EA4335')
const healthyCount = computed(() => members.value.filter(m => m.stressLevel === 'low').length)
const overloadedCount = computed(() => members.value.filter(m => m.stressLevel === 'high').length)
const totalAtRisk = computed(() => members.value.reduce((s, m) => s + m.atRiskCount, 0))

function loadColor(p) { return p >= 85 ? '#EA4335' : p >= 60 ? '#FBBC05' : '#34A853' }
function wellbeingColor(s) { return s >= 70 ? '#34A853' : s >= 50 ? '#FBBC05' : '#EA4335' }
function avgHealthColor(h) { return h >= 75 ? '#34A853' : h >= 60 ? '#FBBC05' : '#EA4335' }
function stressColor(l) { return l === 'high' ? '#EA4335' : l === 'medium' ? '#FBBC05' : '#34A853' }
function stressGrad(l) { return l === 'high' ? 'linear-gradient(135deg, #EA4335, #d32f2f)' : l === 'medium' ? 'linear-gradient(135deg, #FBBC05, #f9a825)' : 'linear-gradient(135deg, #34A853, #2e7d32)' }
function stressEmoji(l) { return l === 'high' ? '🔴' : l === 'medium' ? '🟡' : '🟢' }
function stressLabel(l) { return l === 'high' ? t('htStressHigh') : l === 'medium' ? t('htStressMedium') : t('htStressLow') }

function tipText(m) {
  if (m.stressLevel === 'high') return t('htTipOverloaded')
  if (m.atRiskCount > 0) return t('htTipAtRisk')
  return t('htTipHealthy')
}
function tipBg(m) { return m.stressLevel === 'high' ? 'rgba(234,67,53,.08)' : m.atRiskCount > 0 ? 'rgba(251,188,5,.08)' : 'rgba(52,168,83,.08)' }
function tipColor(m) { return m.stressLevel === 'high' ? '#EA4335' : m.atRiskCount > 0 ? '#FBBC05' : '#34A853' }

onMounted(async () => {
  if (!clientsStore.clients.length) await clientsStore.fetchClients()
  if (!csmStore.csms.length) await csmStore.fetchCSMs()
})
</script>

<style scoped>
/* Filters */
.ht-filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.ht-filter { font-size: 11px; padding: 5px 12px; border-radius: 20px; cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--muted); font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.ht-filter:hover { border-color: #34A853; color: #34A853; }
.ht-filter--on { background: #34A853; color: #fff !important; border-color: #34A853; }
.ht-sort { margin-left: auto; }
.ht-select { border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 500; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none; }

/* Grid */
.ht-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }

/* Card */
.ht-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.04); transition: all .15s; }
.ht-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); transform: translateY(-1px); }
.ht-card--alert { border-left: 4px solid #EA4335; }

/* Header */
.ht-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.ht-avatar { width: 42px; height: 42px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.ht-card-info { flex: 1; }
.ht-card-name { font-size: 15px; font-weight: 800; color: var(--text); }
.ht-card-role { font-size: 11px; color: var(--muted); }
.ht-stress-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }

/* Metrics */
.ht-metrics { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.ht-metric { display: flex; align-items: center; gap: 8px; }
.ht-metric-label { font-size: 11px; color: var(--muted); font-weight: 600; min-width: 70px; }
.ht-metric-bar { flex: 1; height: 6px; background: rgba(0,0,0,.04); border-radius: 3px; overflow: hidden; }
.ht-metric-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.ht-metric-val { font-size: 12px; font-weight: 800; min-width: 50px; text-align: right; }

/* Client stats */
.ht-client-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.ht-client-stat { text-align: center; background: var(--surface); border-radius: 10px; padding: 10px 6px; }
.ht-client-stat-val { display: block; font-size: 20px; font-weight: 900; color: var(--text); }
.ht-client-stat-label { display: block; font-size: 9px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }

/* Tip */
.ht-tip { font-size: 11px; font-weight: 600; padding: 8px 12px; border-radius: 10px; line-height: 1.4; }
</style>
