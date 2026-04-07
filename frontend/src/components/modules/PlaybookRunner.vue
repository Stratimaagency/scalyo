<template>
  <div class="mod-page fade-in">
    <!-- Hero -->
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">{{ t('pbTitle') }}</h1>
        <p class="mod-subtitle">{{ t('pbSubtitle') }}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <button v-if="tasksStore.playbooks.length" @click="resetPlaybooks" style="font-size: 11px; padding: 5px 12px; border-radius: 8px; border: 1px solid var(--red); background: transparent; color: var(--red); cursor: pointer; font-weight: 600;">🔄 {{ t('smReset') }}</button>
        <div class="mod-hero-score">
          <div class="mod-big-num">{{ tasksStore.playbooks.length }}</div>
          <div class="mod-big-label">Playbooks</div>
        </div>
      </div>
    </div>

    <!-- Top Bar: Filters + Search + Add -->
    <div class="pb-topbar">
      <div class="pb-filters">
        <button v-for="f in statusFilters" :key="f.value"
          class="pb-filter-btn" :class="{ 'pb-filter-btn--active': activeFilter === f.value }"
          @click="activeFilter = f.value">
          {{ f.label }}
        </button>
      </div>
      <input v-model="searchQuery" class="pb-search" :placeholder="t('pbSearchClient')" />
      <button class="pb-add-btn" @click="showTemplates = !showTemplates">+</button>
    </div>

    <!-- Stats Summary Row -->
    <div class="mod-kpi-row">
      <div class="mod-kpi-card">
        <div style="font-size: 24px; font-weight: 900; color: #4285F4">{{ activePlaybooks.length }}</div>
        <div style="font-size: 11px; color: #5F6368; font-weight: 600; margin-top: 4px">{{ t('pbActiveCount') }}</div>
      </div>
      <div class="mod-kpi-card">
        <div style="font-size: 24px; font-weight: 900; color: #34A853">{{ completedThisMonth }}</div>
        <div style="font-size: 11px; color: #5F6368; font-weight: 600; margin-top: 4px">{{ t('pbCompletedCount') }}</div>
      </div>
      <div class="mod-kpi-card">
        <div style="font-size: 24px; font-weight: 900; color: #FBBC05">{{ avgDuration }}{{ t('pbDayPrefix') }}</div>
        <div style="font-size: 11px; color: #5F6368; font-weight: 600; margin-top: 4px">{{ t('pbAvgDuration') }}</div>
      </div>
      <div class="mod-kpi-card">
        <div style="font-size: 24px; font-weight: 900; color: #34A853">{{ successRate }}%</div>
        <div style="font-size: 11px; color: #5F6368; font-weight: 600; margin-top: 4px">{{ t('pbSuccessRate') }}</div>
      </div>
    </div>

    <!-- Active churn playbooks alert -->
    <div v-if="tasksStore.activeChurnPlaybooks.length" class="mod-alert mod-alert--warn">
      <span>{{ tasksStore.activeChurnPlaybooks.length }} {{ t('pbActiveAlert') }}</span>
    </div>

    <!-- Templates Panel -->
    <div v-if="showTemplates" class="mod-card pb-templates-panel">
      <div class="mod-card-header">
        <h3 style="font-size: 16px; font-weight: 800; color: #202124">{{ t('pbTemplates') }}</h3>
        <button class="pb-close-btn" @click="showTemplates = false">&times;</button>
      </div>
      <div class="pb-templates-grid">
        <div v-for="tpl in templates" :key="tpl.id" class="pb-template-card"
          :style="{ borderColor: tpl.color }" @click="selectTemplate(tpl)">
          <div style="font-size: 32px; margin-bottom: 8px">{{ tpl.emoji }}</div>
          <div style="font-size: 14px; font-weight: 800; color: #202124">{{ t(tpl.nameKey) }}</div>
          <div style="font-size: 12px; color: #5F6368; margin-top: 4px">{{ t(tpl.descKey) }}</div>
          <div class="pb-template-meta">
            <span>{{ tpl.stepsCount }} {{ t('pbSteps') }}</span>
            <span>{{ tpl.days }} {{ t('pbDays') }}</span>
          </div>
        </div>
      </div>
      <!-- Client selection modal -->
      <div v-if="pendingTemplate" class="pb-client-select">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #202124">
          {{ pendingTemplate.emoji }} {{ t(pendingTemplate.nameKey) }} &mdash; {{ t('pbSelectClient') }}
        </div>
        <div class="pb-client-list">
          <button v-for="client in clientsStore.clients" :key="client.id" class="pb-client-option"
            :class="{ 'pb-client-option--risk': client.status === 'at-risk' }"
            @click="activatePlaybook(client)">
            {{ client.name }}
            <span v-if="client.status === 'at-risk'" style="color: #EA4335; margin-left: 4px">&#9679;</span>
          </button>
        </div>
        <button class="pb-cancel-btn" @click="pendingTemplate = null">{{ t('cancel') }}</button>
      </div>
    </div>

    <!-- No Active Playbooks -->
    <div v-if="!filteredPlaybooks.length && activeFilter !== 'completed'" class="mod-card">
      <div class="mod-empty">
        <p style="font-size: 40px; margin-bottom: 12px">&#128260;</p>
        <p style="font-weight: 700; margin-bottom: 8px">{{ t('pbNoActive') }}</p>
        <p style="color: #5F6368">{{ t('pbNoActiveHint') }}</p>
        <button class="pb-add-btn" style="margin-top: 16px; font-size: 18px" @click="showTemplates = true">+</button>
      </div>
    </div>

    <!-- Active Playbooks -->
    <div v-if="filteredPlaybooks.length" class="playbook-grid">
      <div v-for="pb in filteredPlaybooks" :key="pb.id" class="mod-card playbook-card"
        :class="{ 'playbook-card--celebrating': pbProgress(pb.id) === 100 && celebratingIds.has(pb.id) }">

        <!-- Header -->
        <div class="pb-header">
          <span class="pb-emoji">{{ pb.emoji || '&#128203;' }}</span>
          <div style="flex: 1; min-width: 0">
            <h4 class="pb-title">{{ pb.name }}</h4>
            <span class="pb-type-badge" :style="{ background: typeColor(pb.type), color: '#fff' }">
              {{ typeEmoji(pb.type) }} {{ pb.type || 'Playbook' }}
            </span>
          </div>
          <!-- Progress ring -->
          <div class="pb-ring-wrap">
            <svg class="pb-ring" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#E8EAED" stroke-width="3" />
              <circle cx="20" cy="20" r="16" fill="none"
                :stroke="progressColor(pbProgress(pb.id))" stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="100.53"
                :stroke-dashoffset="100.53 - (100.53 * pbProgress(pb.id) / 100)"
                class="pb-ring-progress" />
            </svg>
            <span class="pb-ring-text">{{ pbProgress(pb.id) }}%</span>
            <span v-if="pbProgress(pb.id) === 100" class="pb-celebrate-emoji">&#127881;</span>
          </div>
        </div>

        <!-- Client chips -->
        <div v-if="pb.clients?.length" class="pb-clients">
          <span v-for="client in pb.clients" :key="client" class="pb-client-chip"
            :class="{ 'pb-client-chip--risk': isAtRisk(client) }">
            {{ client }}
            <span v-if="isAtRisk(client)" style="margin-left: 3px">&#9679;</span>
          </span>
        </div>

        <!-- Step Timeline -->
        <div class="pb-timeline">
          <div v-for="(step, i) in pb.steps" :key="i"
            class="pb-timeline-step"
            :class="{
              'pb-timeline-step--done': isStepDone(pb.id, i),
              'pb-timeline-step--current': isCurrentStep(pb.id, i, pb.steps),
              'pb-timeline-step--future': !isStepDone(pb.id, i) && !isCurrentStep(pb.id, i, pb.steps)
            }">
            <div class="pb-timeline-line-wrap">
              <div class="pb-timeline-dot"
                :class="{ 'pb-timeline-dot--done': isStepDone(pb.id, i), 'pb-timeline-dot--current': isCurrentStep(pb.id, i, pb.steps) }"
                @click="toggleStep(pb.id, i)">
                <span v-if="isStepDone(pb.id, i)">&#10003;</span>
              </div>
              <div v-if="i < pb.steps.length - 1" class="pb-timeline-line"
                :class="{ 'pb-timeline-line--done': isStepDone(pb.id, i) }"></div>
            </div>
            <div class="pb-timeline-content" @click="toggleExpanded(pb.id, i)">
              <div class="pb-step-header">
                <span class="pb-step-title" :class="{ 'pb-step-title--done': isStepDone(pb.id, i) }">
                  {{ step.title }}
                </span>
                <div class="pb-step-badges">
                  <span v-if="step.type" class="pb-step-type-badge">
                    {{ stepTypeEmoji(step.type) }} {{ stepTypeLabel(step.type) }}
                  </span>
                  <span v-if="step.auto" class="pb-step-auto-badge">&#9889; {{ t('pbStepAuto') }}</span>
                  <span v-if="step.day" class="pb-step-day">{{ t('pbDayPrefix') }}{{ step.day }}</span>
                </div>
              </div>
              <div v-if="isExpanded(pb.id, i) && step.description" class="pb-step-desc">
                {{ step.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pb-footer">
          <span v-if="pb.startedAt">{{ t('pbStarted') }}: {{ formatDate(pb.startedAt) }}</span>
          <span v-if="pb.estimatedDays">{{ estimatedDaysLeft(pb) }} {{ t('pbDaysLeft') }}</span>
          <span v-if="pb.csm" class="pb-csm-badge">{{ pb.csm }}</span>
          <button class="pb-delete-btn" @click.stop="deletePlaybook(pb)" title="Supprimer">🗑️</button>
        </div>

        <!-- Progress bar -->
        <div class="mod-progress-bar" style="margin-top: 14px">
          <div class="mod-progress-fill" :style="{ width: pbProgress(pb.id) + '%', background: progressGradient(pbProgress(pb.id)) }"></div>
        </div>
      </div>
    </div>

    <!-- Completed Playbooks Section -->
    <div v-if="completedPlaybooks.length" class="mod-card" style="margin-top: 8px">
      <div class="mod-card-header" style="cursor: pointer" @click="showCompleted = !showCompleted">
        <h3 style="font-size: 15px; font-weight: 800; color: #202124">
          {{ t('pbCompletedSection') }} ({{ completedPlaybooks.length }})
        </h3>
        <span style="font-size: 18px; transition: transform 0.2s" :style="{ transform: showCompleted ? 'rotate(180deg)' : '' }">&#9660;</span>
      </div>
      <div v-if="showCompleted" class="pb-completed-list">
        <div v-for="pb in completedPlaybooks" :key="pb.id" class="pb-completed-item">
          <span class="pb-emoji" style="font-size: 20px">{{ pb.emoji || '&#128203;' }}</span>
          <div style="flex: 1; min-width: 0">
            <div style="font-size: 13px; font-weight: 700; color: #202124">{{ pb.name }}</div>
            <div style="font-size: 11px; color: #5F6368">
              {{ pb.clients?.join(', ') }}
            </div>
          </div>
          <div style="text-align: right">
            <div style="font-size: 12px; font-weight: 700; color: #34A853">{{ t('pbCompleted') }} &#127881;</div>
            <div v-if="pb.completedAt" style="font-size: 11px; color: #5F6368">{{ formatDate(pb.completedAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useClientsStore } from '../../stores/clients'
import { useCSMStore } from '../../stores/csm'
import { useI18n } from '../../i18n'
import api from '../../api/client'

const { t } = useI18n()
const tasksStore = useTasksStore()
const clientsStore = useClientsStore()
const csmStore = useCSMStore()

// State
const activeFilter = ref('all')
const searchQuery = ref('')
const showTemplates = ref(false)
const showCompleted = ref(false)
const pendingTemplate = ref(null)
const expandedSteps = reactive({})
const celebratingIds = reactive(new Set())

// Filter config
const statusFilters = computed(() => [
  { value: 'all', label: t('pbFilterAll') },
  { value: 'active', label: t('pbFilterActive') },
  { value: 'completed', label: t('pbFilterCompleted') },
])

// Templates
const templates = [
  { id: 'churn', emoji: '\u{1F6E1}\uFE0F', nameKey: 'pbChurnPrevention', descKey: 'pbChurnDesc', stepsCount: 8, days: 30, color: '#EA4335', type: 'churn' },
  { id: 'onboarding', emoji: '\u{1F680}', nameKey: 'pbOnboarding', descKey: 'pbOnboardingDesc', stepsCount: 10, days: 45, color: '#4285F4', type: 'onboarding' },
  { id: 'expansion', emoji: '\u{1F4C8}', nameKey: 'pbExpansion', descKey: 'pbExpansionDesc', stepsCount: 7, days: 60, color: '#34A853', type: 'expansion' },
  { id: 'qbr', emoji: '\u{1F4CB}', nameKey: 'pbQBR', descKey: 'pbQBRDesc', stepsCount: 6, days: 14, color: '#FBBC05', type: 'qbr' },
  { id: 'recovery', emoji: '\u{1F49A}', nameKey: 'pbRecovery', descKey: 'pbRecoveryDesc', stepsCount: 7, days: 21, color: '#4285F4', type: 'recovery' },
  { id: 'celebrate', emoji: '\u2B50', nameKey: 'pbCelebrate', descKey: 'pbCelebrateDesc', stepsCount: 4, days: 7, color: '#FBBC05', type: 'celebrate' },
]

// Computed
const activePlaybooks = computed(() =>
  tasksStore.playbooks.filter(pb => pbProgress(pb.id) < 100)
)

const completedPlaybooks = computed(() =>
  tasksStore.playbooks.filter(pb => pbProgress(pb.id) === 100)
)

const completedThisMonth = computed(() => {
  return completedPlaybooks.value.length
})

const avgDuration = computed(() => {
  const pbs = tasksStore.playbooks.filter(pb => pb.estimatedDays)
  if (!pbs.length) return 0
  return Math.round(pbs.reduce((a, pb) => a + pb.estimatedDays, 0) / pbs.length)
})

const successRate = computed(() => {
  const total = tasksStore.playbooks.length
  if (!total) return 0
  const completed = completedPlaybooks.value.length
  return Math.round((completed / total) * 100)
})

const filteredPlaybooks = computed(() => {
  let list = tasksStore.playbooks
  if (activeFilter.value === 'active') {
    list = list.filter(pb => pbProgress(pb.id) < 100)
  } else if (activeFilter.value === 'completed') {
    list = list.filter(pb => pbProgress(pb.id) === 100)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(pb =>
      pb.name?.toLowerCase().includes(q) ||
      (pb.clients || []).some(c => c.toLowerCase().includes(q))
    )
  }
  return list
})

// Helpers
function isStepDone(pbId, idx) {
  return (tasksStore.playbookProgress[pbId] || []).includes(idx)
}

function pbProgress(pbId) {
  const pb = tasksStore.playbooks.find(p => p.id === pbId)
  if (!pb?.steps?.length) return 0
  const done = (tasksStore.playbookProgress[pbId] || []).length
  return Math.round((done / pb.steps.length) * 100)
}

function isCurrentStep(pbId, idx, steps) {
  if (isStepDone(pbId, idx)) return false
  for (let i = 0; i < idx; i++) {
    if (!isStepDone(pbId, i)) return false
  }
  return true
}

function progressColor(pct) {
  if (pct >= 100) return '#34A853'
  if (pct >= 60) return '#34A853'
  if (pct >= 30) return '#FBBC05'
  return '#4285F4'
}

function progressGradient(pct) {
  if (pct >= 100) return 'linear-gradient(90deg, #34A853, #2E7D32)'
  if (pct >= 60) return 'linear-gradient(90deg, #4285F4, #34A853)'
  if (pct >= 30) return 'linear-gradient(90deg, #4285F4, #FBBC05)'
  return 'linear-gradient(90deg, #4285F4, #4285F4)'
}

function typeColor(type) {
  const colors = { churn: '#EA4335', onboarding: '#4285F4', expansion: '#34A853', qbr: '#FBBC05', recovery: '#4285F4', celebrate: '#FBBC05' }
  return colors[type] || '#5F6368'
}

function typeEmoji(type) {
  const emojis = { churn: '\u{1F6E1}\uFE0F', onboarding: '\u{1F680}', expansion: '\u{1F4C8}', qbr: '\u{1F4CB}', recovery: '\u{1F49A}', celebrate: '\u2B50' }
  return emojis[type] || ''
}

function stepTypeEmoji(type) {
  const map = { call: '\u{1F4DE}', email: '\u{1F4E7}', review: '\u{1F4CA}', auto: '\u2699\uFE0F', plan: '\u{1F4DD}', setup: '\u{1F527}' }
  return map[type] || ''
}

function stepTypeLabel(type) {
  const map = { call: 'pbStepCall', email: 'pbStepEmail', review: 'pbStepReview', auto: 'pbStepAuto', plan: 'pbStepPlan', setup: 'pbStepSetup' }
  return t(map[type] || type)
}

function isAtRisk(clientName) {
  return clientsStore.atRiskClients.some(c => c.name === clientName)
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString()
}

function estimatedDaysLeft(pb) {
  if (!pb.startedAt || !pb.estimatedDays) return pb.estimatedDays || '?'
  const start = new Date(pb.startedAt)
  const now = new Date()
  const elapsed = Math.floor((now - start) / 86400000)
  return Math.max(0, pb.estimatedDays - elapsed)
}

function toggleExpanded(pbId, stepIdx) {
  const key = `${pbId}-${stepIdx}`
  expandedSteps[key] = !expandedSteps[key]
}

function isExpanded(pbId, stepIdx) {
  return !!expandedSteps[`${pbId}-${stepIdx}`]
}

function selectTemplate(tpl) {
  pendingTemplate.value = tpl
}

function activatePlaybook(client) {
  const tpl = pendingTemplate.value
  if (!tpl) return
  const newPb = {
    id: `pb-${Date.now()}`,
    name: t(tpl.nameKey),
    emoji: tpl.emoji,
    type: tpl.id,
    clients: [client.name],
    estimatedDays: tpl.days,
    startedAt: new Date().toISOString(),
    csm: '',
    steps: Array.from({ length: tpl.stepsCount }, (_, i) => ({
      title: `${t(tpl.nameKey)} - Step ${i + 1}`,
      day: Math.round((tpl.days / tpl.stepsCount) * (i + 1)),
      type: ['call', 'email', 'review', 'plan'][i % 4],
      auto: i % 5 === 4,
      description: t(tpl.descKey),
    })),
  }
  tasksStore.playbooks.push(newPb)
  pendingTemplate.value = null
  showTemplates.value = false
}

async function resetPlaybooks() {
  if (!confirm('Supprimer tous les playbooks ? Cette action est irréversible.')) return
  await Promise.all(tasksStore.playbooks.map(pb => api.delete(`/modules/playbooks/${pb.id}`).catch(() => {})))
  tasksStore.playbooks = []
}

async function deletePlaybook(pb) {
  if (!confirm(`Supprimer le playbook "${pb.name}" ? Cette action est irréversible.`)) return
  try {
    await api.delete(`/modules/playbooks/${pb.id}`)
    tasksStore.playbooks = tasksStore.playbooks.filter(p => p.id !== pb.id)
  } catch (e) {
    console.error('Delete playbook error:', e)
  }
}

async function toggleStep(pbId, idx) {
  const prevProgress = pbProgress(pbId)
  await tasksStore.togglePlaybookStep(pbId, idx)
  const newProgress = pbProgress(pbId)
  if (newProgress === 100 && prevProgress < 100) {
    celebratingIds.add(pbId)
    setTimeout(() => celebratingIds.delete(pbId), 3000)
  }
  await csmStore.fetchCSMs()
}

onMounted(() => {
  if (!tasksStore.playbooks.length) tasksStore.fetchAll()
  if (!clientsStore.clients.length) clientsStore.fetchClients()
})
</script>

<style scoped>
.playbook-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 16px; }
.playbook-card { padding: 24px; transition: box-shadow 0.3s ease, transform 0.2s ease; }
.playbook-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,.12); }
.playbook-card--celebrating { animation: celebratePulse 0.6s ease 2; }

@keyframes celebratePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 2px 16px rgba(0,0,0,.07); }
  50% { transform: scale(1.01); box-shadow: 0 4px 24px rgba(52,168,83,.25); }
}

/* Top bar */
.pb-topbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.pb-filters { display: flex; gap: 4px; }
.pb-filter-btn { padding: 7px 16px; border-radius: 20px; border: 1px solid #E8EAED; background: #fff; font-size: 13px; font-weight: 700; color: #5F6368; cursor: pointer; transition: all 0.15s; }
.pb-filter-btn:hover { background: #F1F3F4; }
.pb-filter-btn--active { background: #4285F4; color: #fff; border-color: #4285F4; }
.pb-search { flex: 1; min-width: 180px; padding: 8px 14px; border-radius: 20px; border: 1px solid #E8EAED; font-size: 13px; outline: none; transition: border-color 0.15s; }
.pb-search:focus { border-color: #4285F4; }
.pb-add-btn { width: 38px; height: 38px; border-radius: 50%; background: #4285F4; color: #fff; border: none; font-size: 22px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.pb-add-btn:hover { background: #3367D6; }

/* Header */
.pb-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.pb-emoji { font-size: 28px; flex-shrink: 0; }
.pb-title { font-size: 16px; font-weight: 800; color: #202124; margin: 0; }
.pb-type-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 10px; border-radius: 10px; margin-top: 4px; }

/* Progress ring */
.pb-ring-wrap { position: relative; width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.pb-ring { width: 48px; height: 48px; transform: rotate(-90deg); }
.pb-ring-progress { transition: stroke-dashoffset 0.6s ease; }
.pb-ring-text { position: absolute; font-size: 11px; font-weight: 800; color: #202124; }
.pb-celebrate-emoji { position: absolute; top: -8px; right: -8px; font-size: 18px; animation: celebrateBounce 0.5s ease 3; }

@keyframes celebrateBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* Client chips */
.pb-clients { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.pb-client-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #E8F0FE; color: #4285F4; transition: transform 0.15s; }
.pb-client-chip:hover { transform: scale(1.05); }
.pb-client-chip--risk { background: #FCE8E6; color: #EA4335; }

/* Timeline */
.pb-timeline { display: flex; flex-direction: column; gap: 0; margin: 8px 0; }
.pb-timeline-step { display: flex; gap: 12px; transition: opacity 0.2s; }
.pb-timeline-step--future { opacity: 0.45; }
.pb-timeline-step--done { opacity: 0.7; }
.pb-timeline-step--current { opacity: 1; }

.pb-timeline-line-wrap { display: flex; flex-direction: column; align-items: center; width: 24px; flex-shrink: 0; }
.pb-timeline-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #E8EAED; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.2s; flex-shrink: 0; color: #5F6368; }
.pb-timeline-dot:hover { border-color: #4285F4; background: #E8F0FE; }
.pb-timeline-dot--done { background: #34A853; border-color: #34A853; color: #fff; }
.pb-timeline-dot--current { border-color: #4285F4; background: #E8F0FE; box-shadow: 0 0 0 3px rgba(66,133,244,.2); }
.pb-timeline-line { width: 2px; flex: 1; min-height: 12px; background: #E8EAED; }
.pb-timeline-line--done { background: #34A853; }

.pb-timeline-content { flex: 1; padding: 4px 0 14px; cursor: pointer; min-width: 0; }
.pb-step-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pb-step-title { font-size: 13px; font-weight: 600; color: #202124; }
.pb-step-title--done { text-decoration: line-through; color: #5F6368; }
.pb-step-badges { display: flex; gap: 4px; flex-wrap: wrap; }
.pb-step-type-badge { font-size: 10px; font-weight: 700; padding: 1px 8px; border-radius: 10px; background: #F1F3F4; color: #5F6368; }
.pb-step-auto-badge { font-size: 10px; font-weight: 700; padding: 1px 8px; border-radius: 10px; background: #E8F0FE; color: #4285F4; }
.pb-step-day { font-size: 10px; font-weight: 700; padding: 1px 8px; border-radius: 10px; background: #FEF7E0; color: #795500; }
.pb-step-desc { font-size: 12px; color: #5F6368; margin-top: 6px; padding: 8px 12px; background: #F8F9FA; border-radius: 8px; animation: fadeSlide 0.2s ease; }

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Footer */
.pb-footer { display: flex; align-items: center; gap: 12px; margin-top: 14px; font-size: 11px; color: #5F6368; font-weight: 600; flex-wrap: wrap; }
.pb-csm-badge { background: #E8F0FE; color: #4285F4; padding: 2px 10px; border-radius: 10px; font-weight: 700; }
.pb-delete-btn { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0; transition: opacity .2s; padding: 4px 8px; border-radius: 6px; }
.pb-delete-btn:hover { background: rgba(239,68,68,.1); }
.playbook-card:hover .pb-delete-btn { opacity: 1; }

/* Templates */
.pb-templates-panel { position: relative; }
.pb-templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.pb-template-card { padding: 20px; border-radius: 14px; border: 2px solid #E8EAED; cursor: pointer; transition: all 0.2s; text-align: center; }
.pb-template-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.pb-template-meta { display: flex; justify-content: center; gap: 12px; margin-top: 10px; font-size: 11px; font-weight: 700; color: #5F6368; }
.pb-close-btn { background: none; border: none; font-size: 22px; color: #5F6368; cursor: pointer; padding: 0; line-height: 1; }

/* Client selection */
.pb-client-select { margin-top: 16px; padding: 16px; background: #F8F9FA; border-radius: 12px; }
.pb-client-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.pb-client-option { padding: 6px 14px; border-radius: 20px; border: 1px solid #E8EAED; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; color: #202124; }
.pb-client-option:hover { background: #E8F0FE; border-color: #4285F4; }
.pb-client-option--risk { border-color: #FCE8E6; }
.pb-cancel-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid #E8EAED; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; color: #5F6368; }

/* Completed list */
.pb-completed-list { display: flex; flex-direction: column; gap: 8px; }
.pb-completed-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; background: #F8F9FA; transition: background 0.15s; }
.pb-completed-item:hover { background: #E8F0FE; }

@media (max-width: 600px) {
  .playbook-grid { grid-template-columns: 1fr; }
  .pb-templates-grid { grid-template-columns: repeat(2, 1fr); }
  .pb-topbar { flex-direction: column; align-items: stretch; }
  .pb-search { min-width: 0; }
}
</style>
