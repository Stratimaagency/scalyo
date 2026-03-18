<template>
  <div class="fade-in">
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: tab === 'overview' }" @click="tab = 'overview'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="heart" :size="15" /> Overview</button>
      <button class="tab-item" :class="{ active: tab === 'nova' }" @click="tab = 'nova'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="meditation" :size="15" /> Nova</button>
      <button class="tab-item" :class="{ active: tab === 'team' }" @click="tab = 'team'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="people" :size="15" /> {{ t('wbDetail') }}</button>
    </div>

    <!-- Overview -->
    <template v-if="tab === 'overview'">
      <div class="grid-3 mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
        <KpiCard :label="t('wellbeingScore')" :value="wellbeing.score + '%'" icon="heart" :color="scoreColor" />
        <KpiCard :label="t('workload')" :value="wellbeing.charge + '%'" icon="bolt" :color="wellbeing.charge > 85 ? 'var(--red)' : 'var(--green)'" />
        <KpiCard :label="t('burnoutRisk')" :value="burnoutDisplay" icon="fire" :color="burnoutColor" />
      </div>

      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 12px">{{ t('teamScore') }}</h4>
        <HealthBar :val="wellbeing.score" />
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--muted)">
          <span>0%</span>
          <span>{{ wellbeing.score }}%</span>
          <span>100%</span>
        </div>
      </AppCard>

      <!-- Quick actions -->
      <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
        <AppCard class="card-lift" style="cursor: pointer" @click="tab = 'nova'">
          <div style="margin-bottom: 8px"><ScalyoIcon name="meditation" :size="28" /></div>
          <div style="font-weight: 700; margin-bottom: 4px">{{ t('wbDecompress') }}</div>
          <div style="font-size: 12px; color: var(--muted)">{{ t('wbTalkSomeone') }}</div>
        </AppCard>
        <AppCard class="card-lift" style="cursor: pointer" @click="tab = 'team'">
          <div style="margin-bottom: 8px"><ScalyoIcon name="dashboard" :size="28" /></div>
          <div style="font-weight: 700; margin-bottom: 4px">{{ t('wbManage') }}</div>
          <div style="font-size: 12px; color: var(--muted)">{{ t('trackWorkload') }}</div>
        </AppCard>
      </div>

      <!-- Methodology transparency -->
      <AppCard class="mb-md" style="margin-top: 16px;">
        <h4 style="font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <ScalyoIcon name="lightbulb" :size="16" />
          {{ t('wbMethodTitle') }}
        </h4>
        <p style="font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 14px;">
          {{ t('wbMethodDesc') }}
        </p>
        <div style="font-weight: 700; font-size: 12px; margin-bottom: 8px;">{{ t('wbFactors') }}</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div v-for="factor in burnoutFactors" :key="factor.key" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border);">
            <div style="width: 32px; height: 4px; border-radius: 2px;" :style="{ background: factor.color, width: factor.weight + '%', minWidth: '20px', maxWidth: '60px' }"></div>
            <span style="font-size: 12px; color: var(--text);">{{ factor.label }}</span>
            <span style="font-size: 11px; color: var(--muted); margin-left: auto;">{{ factor.value }}</span>
          </div>
        </div>
      </AppCard>
    </template>

    <!-- Nova (AI Wellbeing Chat) -->
    <template v-if="tab === 'nova'">
      <AppCard style="max-width: 700px; margin: 0 auto">
        <div style="text-align: center; margin-bottom: 20px">
          <div style="margin-bottom: 8px"><ScalyoIcon name="meditation" :size="36" /></div>
          <h3 style="font-weight: 800">{{ t('novaTitle') }}</h3>
          <p style="font-size: 13px; color: var(--muted)">{{ t('novaDesc') }}</p>
        </div>

        <div style="max-height: 400px; overflow-y: auto; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px">
          <div v-for="(msg, i) in novaMessages" :key="i"
            :style="{ textAlign: msg.role === 'user' ? 'right' : 'left' }"
          >
            <div style="display: inline-block; padding: 10px 14px; border-radius: 14px; max-width: 80%; font-size: 13px; line-height: 1.6"
              :style="{
                background: msg.role === 'user' ? 'var(--tealBg)' : 'var(--surface)',
                color: msg.role === 'user' ? 'var(--teal)' : 'var(--text)',
                border: '1px solid ' + (msg.role === 'user' ? 'var(--tealBorder)' : 'var(--border)'),
              }"
            >{{ msg.content }}</div>
          </div>
          <div v-if="novaLoading" style="color: var(--muted); font-size: 13px">{{ t('thinking') }}</div>
        </div>

        <!-- Quick chips -->
        <div v-if="!novaMessages.length" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px">
          <button v-for="q in quickChips" :key="q" class="chip" @click="sendNova(q)">{{ q }}</button>
        </div>

        <div style="display: flex; gap: 8px">
          <textarea v-model="novaInput" class="chat-input" rows="1" :placeholder="t('wellbeingPlaceholder')" @keydown.enter.prevent="sendNova(novaInput)"></textarea>
          <button class="chat-send-btn" :disabled="!novaInput.trim() || novaLoading" @click="sendNova(novaInput)">→</button>
        </div>
      </AppCard>
    </template>

    <!-- Team detail -->
    <template v-if="tab === 'team'">
      <div v-if="wellbeing.team?.length" style="display: flex; flex-direction: column; gap: 10px">
        <AppCard v-for="(member, i) in wellbeing.team" :key="i">
          <div class="flex-between">
            <div style="display: flex; gap: 12px; align-items: center">
              <div class="avatar" style="width: 36px; height: 36px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal); font-size: 14px">
                {{ (member.name || '?')[0] }}
              </div>
              <div>
                <div style="font-weight: 700">{{ member.name }}</div>
                <div style="font-size: 11px; color: var(--muted)">{{ member.accounts || 0 }} {{ t('accounts') }}</div>
              </div>
            </div>
            <div style="text-align: right">
              <div style="font-weight: 700; font-family: 'JetBrains Mono', monospace">{{ member.score || 0 }}%</div>
              <HealthBar :val="member.score || 0" style="width: 80px" />
            </div>
          </div>
        </AppCard>
      </div>
      <EmptyState v-else icon="people" :title="t('noTeamData')" :desc="t('noTeamDataDesc')" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { wellbeingApi, coachApi } from '../api'
import { useI18n } from '../i18n'
import KpiCard from '../components/KpiCard.vue'
import AppCard from '../components/AppCard.vue'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const tab = ref('overview')
const wellbeing = ref({ score: 70, burnout: 'moderate', charge: 70, trend: '+0', alerts: [], team: [] })
const novaMessages = ref([])
const novaInput = ref('')
const novaLoading = ref(false)

const quickChips = computed(() => [
  t('wbDecompress'),
  t('wbTalkSomeone'),
])

onMounted(async () => {
  try {
    const { data } = await wellbeingApi.get()
    Object.assign(wellbeing.value, data)
  } catch {}
})

const scoreColor = computed(() => wellbeing.value.score >= 70 ? 'var(--green)' : wellbeing.value.score >= 40 ? 'var(--amber)' : 'var(--red)')
const burnoutColor = computed(() => {
  const b = wellbeing.value.burnout
  return b === 'high' ? 'var(--red)' : b === 'moderate' ? 'var(--amber)' : 'var(--green)'
})

const burnoutDisplay = computed(() => {
  const b = wellbeing.value.burnout
  const key = b === 'low' ? 'burnoutLow' : b === 'high' ? 'burnoutHigh' : b === 'moderate' ? 'burnoutModerate' : 'burnoutNone'
  return t(key)
})

const burnoutFactors = computed(() => {
  const w = wellbeing.value
  const teamSize = w.team?.length || 0
  const avgAccounts = teamSize > 0 ? Math.round(w.team.reduce((s, m) => s + (m.accounts || 0), 0) / teamSize) : 0
  return [
    { key: 'workload', label: t('wbFactorWorkload'), value: w.charge + '%', weight: w.charge, color: w.charge > 85 ? 'var(--red)' : w.charge > 70 ? 'var(--amber)' : 'var(--green)' },
    { key: 'accounts', label: t('wbFactorAccounts'), value: avgAccounts + ' ' + t('accounts') + '/CSM', weight: Math.min(avgAccounts * 5, 100), color: avgAccounts > 15 ? 'var(--red)' : avgAccounts > 8 ? 'var(--amber)' : 'var(--green)' },
    { key: 'trend', label: t('wbFactorTrend'), value: w.trend, weight: 40, color: w.trend.startsWith('-') ? 'var(--red)' : 'var(--green)' },
    { key: 'alerts', label: t('wbFactorAlerts'), value: (w.alerts?.length || 0) + ' alertes', weight: Math.min((w.alerts?.length || 0) * 25, 100), color: (w.alerts?.length || 0) > 2 ? 'var(--red)' : 'var(--green)' },
  ]
})

async function sendNova(text) {
  if (!text?.trim()) return
  novaMessages.value.push({ role: 'user', content: text.trim() })
  novaInput.value = ''
  novaLoading.value = true
  try {
    const { data } = await coachApi.chat(
      novaMessages.value.map(m => ({ role: m.role, content: m.content })),
      'nova'
    )
    novaMessages.value.push({ role: 'assistant', content: data.content })
  } catch {
    novaMessages.value.push({ role: 'assistant', content: t('novaError') })
  }
  novaLoading.value = false
}
</script>
