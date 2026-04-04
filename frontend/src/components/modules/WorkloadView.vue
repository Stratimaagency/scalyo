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
      <div class="mod-kpi-card"><div class="mod-kpi-label">👥 {{ t('htTeamMembers') }}</div><div class="mod-kpi-val" style="color: #4285F4">{{ members.length }}</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">🟢 {{ t('htTeamHealthy') }}</div><div class="mod-kpi-val" style="color: #34A853">{{ healthyCount }}</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">🔴 {{ t('htTeamOverloaded') }}</div><div class="mod-kpi-val" style="color: #EA4335">{{ overloadedCount }}</div></div>
      <div class="mod-kpi-card"><div class="mod-kpi-label">⚠️ {{ t('htAtRiskClients') }}</div><div class="mod-kpi-val" style="color: #FBBC05">{{ totalAtRisk }}</div></div>
    </div>

    <!-- Filters -->
    <div class="ht-filters">
      <button v-for="f in filters" :key="f.value" class="ht-filter" :class="{ 'ht-filter--on': activeFilter === f.value }" @click="activeFilter = f.value">{{ f.label }}</button>
      <div class="ht-sort">
        <select v-model="sortBy" class="ht-select"><option value="name">{{ t('crmContactName') }}</option><option value="workload">{{ t('htWorkload') }}</option><option value="clients">{{ t('htClients') }}</option><option value="atRisk">{{ t('htAtRiskClients') }}</option></select>
      </div>
    </div>

    <!-- Member cards -->
    <div v-if="filteredMembers.length" class="ht-grid">
      <div v-for="m in filteredMembers" :key="m.id" class="ht-card" :class="{ 'ht-card--alert': m.stressLevel === 'high', 'ht-card--expanded': expandedId === m.id }">
        <!-- Header -->
        <div class="ht-card-header" @click="toggleExpand(m.id)">
          <div class="ht-avatar" :style="{ background: stressGrad(m.stressLevel) }">{{ (m.name || '?')[0] }}</div>
          <div class="ht-card-info">
            <div class="ht-card-name">{{ m.name }}</div>
            <div class="ht-card-role">{{ m.role || '' }}</div>
          </div>
          <div class="ht-stress-badge" :style="{ background: stressColor(m.stressLevel) + '18', color: stressColor(m.stressLevel) }">
            {{ stressEmoji(m.stressLevel) }} {{ stressLabel(m.stressLevel) }}
          </div>
          <span class="ht-expand-chevron">{{ expandedId === m.id ? '▾' : '▸' }}</span>
        </div>

        <!-- Mood selector (editable!) -->
        <div class="ht-mood">
          <span class="ht-mood-label">{{ t('htMood') }}</span>
          <div class="ht-mood-emojis">
            <button v-for="mood in moods" :key="mood.value" class="ht-mood-btn" :class="{ 'ht-mood-btn--on': getMood(m.id) === mood.value }" @click.stop="setMood(m.id, mood.value)" :title="mood.label">{{ mood.emoji }}</button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="ht-metrics">
          <div class="ht-metric">
            <div class="ht-metric-label">{{ t('htWorkload') }}</div>
            <div class="ht-metric-bar"><div class="ht-metric-fill" :style="{ width: m.workloadPct + '%', background: loadColor(m.workloadPct) }"></div></div>
            <div class="ht-metric-val" :style="{ color: loadColor(m.workloadPct) }">{{ m.workloadPct }}%</div>
          </div>
          <div class="ht-metric">
            <div class="ht-metric-label">{{ t('htWellbeing') }}</div>
            <div class="ht-metric-bar"><div class="ht-metric-fill" :style="{ width: m.wellbeingScore + '%', background: wellbeingColor(m.wellbeingScore) }"></div></div>
            <div class="ht-metric-val" :style="{ color: wellbeingColor(m.wellbeingScore) }">{{ m.wellbeingScore }}</div>
          </div>
        </div>

        <!-- Client stats -->
        <div class="ht-client-stats">
          <div class="ht-client-stat"><span class="ht-client-stat-val">{{ m.clientCount }}</span><span class="ht-client-stat-label">{{ t('htClients') }}</span></div>
          <div class="ht-client-stat"><span class="ht-client-stat-val" :style="{ color: m.atRiskCount > 0 ? '#EA4335' : '#34A853' }">{{ m.atRiskCount }}</span><span class="ht-client-stat-label">{{ t('htAtRiskClients') }}</span></div>
          <div class="ht-client-stat"><span class="ht-client-stat-val" :style="{ color: avgHealthColor(m.avgHealth) }">{{ m.avgHealth }}</span><span class="ht-client-stat-label">{{ t('htAvgHealth') }}</span></div>
        </div>

        <!-- Quick actions -->
        <div class="ht-actions">
          <button class="ht-action-btn ht-action-btn--green" @click.stop="encourage(m)">🎉 {{ t('htEncourage') }}</button>
          <button class="ht-action-btn" @click.stop="checkIn(m)">💬 {{ t('htCheckIn') }}</button>
          <button v-if="m.workloadPct >= 80" class="ht-action-btn ht-action-btn--red" @click.stop="redistribute(m)">⚖️ {{ t('htRedistribute') }}</button>
        </div>

        <!-- Tip -->
        <div class="ht-tip" :style="{ background: tipBg(m), color: tipColor(m) }">💡 {{ tipText(m) }}</div>

        <!-- Expanded: client list -->
        <div v-if="expandedId === m.id" class="ht-expanded">
          <div class="ht-expanded-title">{{ t('htClientList') }}</div>
          <div v-if="m.clients && m.clients.length" class="ht-client-list">
            <div v-for="c in m.clients" :key="c.id" class="ht-client-row">
              <span class="ht-client-dot" :style="{ background: c.status === 'at-risk' ? '#EA4335' : c.status === 'neutral' ? '#FBBC05' : '#34A853' }"></span>
              <span class="ht-client-name">{{ c.name }}</span>
              <span class="ht-client-health" :style="{ color: avgHealthColor(c.healthScore) }">{{ c.healthScore }}/100</span>
            </div>
          </div>
          <div v-else style="font-size: 12px; color: var(--muted); padding: 8px 0;">{{ t('htNoClients') }}</div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="mod-card"><div class="mod-empty"><p style="font-size: 40px; margin-bottom: 12px;">💚</p><p style="font-weight: 700;">{{ t('htNoTeam') }}</p><p style="color: #5F6368; margin-top: 4px;">{{ t('htNoTeamHint') }}</p></div></div>

    <!-- Toast -->
    <div v-if="toastMsg" class="ht-toast" :class="{ 'ht-toast--show': toastMsg }">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useCSMStore } from '../../stores/csm'
import { useClientsStore } from '../../stores/clients'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const csmStore = useCSMStore()
const clientsStore = useClientsStore()

const activeFilter = ref('all')
const sortBy = ref('name')
const expandedId = ref(null)
const toastMsg = ref('')
const memberMoods = reactive({})

const moods = [
  { value: 1, emoji: '😫', label: 'Épuisé' },
  { value: 2, emoji: '😟', label: 'Stressé' },
  { value: 3, emoji: '😐', label: 'Neutre' },
  { value: 4, emoji: '😊', label: 'Bien' },
  { value: 5, emoji: '🤩', label: 'Au top !' },
]

const filters = computed(() => [
  { value: 'all', label: t('htFilterAll') },
  { value: 'overloaded', label: '🔴 ' + t('htFilterOverloaded') },
  { value: 'healthy', label: '🟢 ' + t('htFilterHealthy') },
  { value: 'atRisk', label: '⚠️ ' + t('htFilterAtRisk') },
])

const members = computed(() => csmStore.workloadByCSM.map(csm => ({
  id: csm.id, name: csm.name, role: csm.role || '',
  workloadPct: csm.workloadPct || 0,
  wellbeingScore: csm.workloadPct >= 85 ? 35 : csm.workloadPct >= 60 ? 60 : 85,
  stressLevel: csm.workloadPct >= 85 ? 'high' : csm.workloadPct >= 60 ? 'medium' : 'low',
  clientCount: csm.clientCount || csm.clients?.length || 0,
  atRiskCount: csm.atRiskCount || 0,
  avgHealth: csm.avgHealth || 0,
  clients: csm.clients || [],
})))

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

const teamScore = computed(() => members.value.length ? Math.round(members.value.reduce((s, m) => s + m.wellbeingScore, 0) / members.value.length) : 0)
const teamScoreColor = computed(() => teamScore.value >= 70 ? '#34A853' : teamScore.value >= 50 ? '#FBBC05' : '#EA4335')
const healthyCount = computed(() => members.value.filter(m => m.stressLevel === 'low').length)
const overloadedCount = computed(() => members.value.filter(m => m.stressLevel === 'high').length)
const totalAtRisk = computed(() => members.value.reduce((s, m) => s + m.atRiskCount, 0))

function toggleExpand(id) { expandedId.value = expandedId.value === id ? null : id }
function getMood(id) { return memberMoods[id] || 3 }
function setMood(id, val) { memberMoods[id] = val; showToast(val >= 4 ? '🎉 ' + t('htMoodPositive') : val <= 2 ? '💙 ' + t('htMoodSupport') : '👍') }
function encourage(m) { showToast('🎉 ' + t('htEncourageMsg').replace('{name}', m.name)) }
function checkIn(m) { showToast('💬 ' + t('htCheckInMsg').replace('{name}', m.name)) }
function redistribute(m) { showToast('⚖️ ' + t('htRedistributeMsg').replace('{name}', m.name)) }
function showToast(msg) { toastMsg.value = msg; setTimeout(() => { toastMsg.value = '' }, 3000) }

function loadColor(p) { return p >= 85 ? '#EA4335' : p >= 60 ? '#FBBC05' : '#34A853' }
function wellbeingColor(s) { return s >= 70 ? '#34A853' : s >= 50 ? '#FBBC05' : '#EA4335' }
function avgHealthColor(h) { return h >= 75 ? '#34A853' : h >= 60 ? '#FBBC05' : '#EA4335' }
function stressColor(l) { return l === 'high' ? '#EA4335' : l === 'medium' ? '#FBBC05' : '#34A853' }
function stressGrad(l) { return l === 'high' ? 'linear-gradient(135deg, #EA4335, #d32f2f)' : l === 'medium' ? 'linear-gradient(135deg, #FBBC05, #f9a825)' : 'linear-gradient(135deg, #34A853, #2e7d32)' }
function stressEmoji(l) { return l === 'high' ? '🔴' : l === 'medium' ? '🟡' : '🟢' }
function stressLabel(l) { return l === 'high' ? t('htStressHigh') : l === 'medium' ? t('htStressMedium') : t('htStressLow') }
function tipText(m) { return m.stressLevel === 'high' ? t('htTipOverloaded') : m.atRiskCount > 0 ? t('htTipAtRisk') : t('htTipHealthy') }
function tipBg(m) { return m.stressLevel === 'high' ? 'rgba(234,67,53,.08)' : m.atRiskCount > 0 ? 'rgba(251,188,5,.08)' : 'rgba(52,168,83,.08)' }
function tipColor(m) { return m.stressLevel === 'high' ? '#EA4335' : m.atRiskCount > 0 ? '#FBBC05' : '#34A853' }

onMounted(async () => {
  if (!clientsStore.clients.length) await clientsStore.fetchClients()
  if (!csmStore.csms.length) await csmStore.fetchCSMs()
})
</script>

<style scoped>
.ht-filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.ht-filter { font-size: 11px; padding: 5px 12px; border-radius: 20px; cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--muted); font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.ht-filter:hover { border-color: #34A853; color: #34A853; }
.ht-filter--on { background: #34A853; color: #fff !important; border-color: #34A853; }
.ht-sort { margin-left: auto; }
.ht-select { border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 500; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none; }
.ht-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
.ht-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.04); transition: all .15s; }
.ht-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
.ht-card--alert { border-left: 4px solid #EA4335; }
.ht-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; cursor: pointer; }
.ht-avatar { width: 42px; height: 42px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.ht-card-info { flex: 1; }
.ht-card-name { font-size: 15px; font-weight: 800; color: var(--text); }
.ht-card-role { font-size: 11px; color: var(--muted); }
.ht-stress-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
.ht-expand-chevron { font-size: 10px; color: var(--muted); }

/* Mood selector */
.ht-mood { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px 12px; background: var(--surface); border-radius: 10px; }
.ht-mood-label { font-size: 11px; color: var(--muted); font-weight: 600; min-width: 50px; }
.ht-mood-emojis { display: flex; gap: 4px; }
.ht-mood-btn { border: none; background: none; font-size: 20px; cursor: pointer; padding: 2px 6px; border-radius: 8px; transition: all .12s; opacity: .4; }
.ht-mood-btn:hover { opacity: .8; transform: scale(1.2); }
.ht-mood-btn--on { opacity: 1; background: rgba(0,0,0,.04); transform: scale(1.15); box-shadow: 0 2px 6px rgba(0,0,0,.1); }

.ht-metrics { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.ht-metric { display: flex; align-items: center; gap: 8px; }
.ht-metric-label { font-size: 11px; color: var(--muted); font-weight: 600; min-width: 65px; }
.ht-metric-bar { flex: 1; height: 6px; background: rgba(0,0,0,.04); border-radius: 3px; overflow: hidden; }
.ht-metric-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.ht-metric-val { font-size: 12px; font-weight: 800; min-width: 40px; text-align: right; }
.ht-client-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
.ht-client-stat { text-align: center; background: var(--surface); border-radius: 10px; padding: 10px 6px; }
.ht-client-stat-val { display: block; font-size: 20px; font-weight: 900; color: var(--text); }
.ht-client-stat-label { display: block; font-size: 9px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }

/* Quick actions */
.ht-actions { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.ht-action-btn { font-size: 11px; padding: 5px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.ht-action-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.ht-action-btn--green { border-color: rgba(52,168,83,.3); color: #34A853; background: rgba(52,168,83,.06); }
.ht-action-btn--red { border-color: rgba(234,67,53,.3); color: #EA4335; background: rgba(234,67,53,.06); }

.ht-tip { font-size: 11px; font-weight: 600; padding: 8px 12px; border-radius: 10px; line-height: 1.4; margin-bottom: 8px; }

/* Expanded client list */
.ht-expanded { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px; }
.ht-expanded-title { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; }
.ht-client-list { display: flex; flex-direction: column; gap: 4px; }
.ht-client-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; font-size: 12px; }
.ht-client-row:hover { background: var(--surface); }
.ht-client-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ht-client-name { flex: 1; font-weight: 500; }
.ht-client-health { font-weight: 700; font-size: 11px; }

/* Toast */
.ht-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600; opacity: 0; transition: all .3s; pointer-events: none; z-index: 999; box-shadow: 0 8px 24px rgba(0,0,0,.2); }
.ht-toast--show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
