<template>
  <div class="fade-in">
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: tab === 'standard' }" @click="tab = 'standard'">📊 KPIs Standard</button>
      <button class="tab-item" :class="{ active: tab === 'custom' }" @click="tab = 'custom'">🎯 {{ t('kpiCustomTitle') }}</button>
      <button class="tab-item" :class="{ active: tab === 'goals' }" @click="tab = 'goals'">🏆 {{ t('target') }}Goals</button>
    </div>

    <!-- Standard KPIs -->
    <template v-if="tab === 'standard'">
      <div class="card mb-md" style="padding: 20px">
        <div class="flex-between mb-md">
          <h3 style="font-weight: 800">{{ t('periodLabel') }}</h3>
          <input v-model="period" class="field-input" style="max-width: 200px; padding: 8px 12px; font-size: 13px" :placeholder="t('periodLabel')" />
        </div>
        <div class="grid-3 mb-md">
          <div class="field-group">
            <label class="field-label">MRR (€)</label>
            <input v-model.number="kpis.mrr" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Churned (€)</label>
            <input v-model.number="kpis.churned" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">NPS</label>
            <input v-model.number="kpis.nps" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Renewal Rate (%)</label>
            <input v-model.number="kpis.renewalRate" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">CSAT (/10)</label>
            <input v-model.number="kpis.csat" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Resolved Tickets</label>
            <input v-model.number="kpis.resolvedTickets" type="number" class="field-input" />
          </div>
        </div>
        <button class="btn btn-primary" @click="saveMonthly" :disabled="saving">
          {{ saving ? t('saving') : t('save') }}
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid-4 mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))">
        <KpiCard label="MRR" :value="fmtK(kpis.mrr) + '€'" icon="💰" color="var(--teal)" />
        <KpiCard label="NPS" :value="kpis.nps" icon="📊" color="var(--blue)" />
        <KpiCard label="Renewal Rate" :value="kpis.renewalRate + '%'" icon="🔄" :color="kpis.renewalRate >= 85 ? 'var(--green)' : 'var(--amber)'" />
        <KpiCard label="CSAT" :value="kpis.csat + '/10'" icon="⭐" :color="kpis.csat >= 7 ? 'var(--green)' : 'var(--amber)'" />
      </div>
    </template>

    <!-- Custom KPIs -->
    <template v-if="tab === 'custom'">
      <div class="flex-between mb-md">
        <div>
          <h3 style="font-weight: 800">{{ t('kpiCustomTitle') }}</h3>
          <p style="font-size: 13px; color: var(--muted)">{{ t('kpiCustomDesc') }}</p>
        </div>
        <button class="btn btn-primary" @click="showNewKpi = true">{{ t('kpiNewBtn') }}</button>
      </div>

      <div v-if="customKpis.length" style="display: flex; flex-direction: column; gap: 10px">
        <AppCard v-for="(kpi, i) in customKpis" :key="i">
          <div class="flex-between">
            <div>
              <div style="font-weight: 700">{{ kpi.name }}</div>
              <div style="font-size: 12px; color: var(--muted)">{{ kpi.unit || '' }}</div>
            </div>
            <div class="kpi-value" :style="{ color: kpi.color || 'var(--teal)' }">{{ kpi.value }}</div>
          </div>
          <div v-if="kpi.goal" style="font-size: 11px; color: var(--muted); margin-top: 6px">
            {{ t('target') }}{{ kpi.goal }} ({{ Math.round((kpi.value / kpi.goal) * 100) }}% {{ t('reached') }})
          </div>
        </AppCard>
      </div>
      <EmptyState v-else icon="🎯" :title="t('kpiNoCustom')" :action="t('kpiNewBtn')" @action="showNewKpi = true" />
    </template>

    <!-- Goals -->
    <template v-if="tab === 'goals'">
      <AppCard class="mb-md">
        <h3 style="font-weight: 800; margin-bottom: 14px">Quarterly Goals</h3>
        <div class="grid-2">
          <div class="field-group">
            <label class="field-label">MRR Target (€)</label>
            <input v-model.number="goals.mrr" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Max Churn (€)</label>
            <input v-model.number="goals.churned" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">NPS Target</label>
            <input v-model.number="goals.nps" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Renewal Rate Target (%)</label>
            <input v-model.number="goals.renewalRate" type="number" class="field-input" />
          </div>
        </div>
        <button class="btn btn-primary" style="margin-top: 12px" @click="saveGoals" :disabled="saving">
          {{ saving ? t('saving') : t('save') }}
        </button>
      </AppCard>
    </template>

    <!-- New KPI Modal -->
    <AppModal v-if="showNewKpi" title="New KPI" @close="showNewKpi = false">
      <AppField label="Name" v-model="newKpi.name" required />
      <AppField label="Value" v-model="newKpi.value" type="number" />
      <AppField label="Goal" v-model="newKpi.goal" type="number" />
      <AppField label="Unit" v-model="newKpi.unit" placeholder="€, %, score..." />
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-secondary" @click="showNewKpi = false">{{ t('cancel') }}</button>
        <button class="btn btn-primary" @click="addCustomKpi">{{ t('create') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { kpiApi } from '../api'
import { useI18n } from '../i18n'
import KpiCard from '../components/KpiCard.vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'

const { t } = useI18n()
const tab = ref('standard')
const saving = ref(false)
const showNewKpi = ref(false)
const period = ref(new Date().toISOString().slice(0, 7))
const kpis = reactive({ mrr: 0, churned: 0, nps: 40, renewalRate: 85, csat: 8, resolvedTickets: 0 })
const goals = reactive({ mrr: 0, churned: 0, nps: 40, renewalRate: 85 })
const customKpis = ref([])
const newKpi = ref({ name: '', value: 0, goal: 0, unit: '', color: '#7EC8B8' })

onMounted(async () => {
  try {
    const { data } = await kpiApi.getAll()
    const rows = data.results || data
    rows.forEach(row => {
      if (row.period === '__custom__') customKpis.value = row.custom_kpis || []
      else if (row.period === '__goals__') Object.assign(goals, row.goals || {})
      else if (row.kpis) Object.assign(kpis, row.kpis)
    })
  } catch {}
})

function fmtK(v) {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}K`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v
}

async function saveMonthly() {
  saving.value = true
  await kpiApi.saveMonthly({ period: period.value, kpis: { ...kpis }, goals: { ...goals } })
  saving.value = false
}

async function saveGoals() {
  saving.value = true
  await kpiApi.saveGoals({ goals: { ...goals } })
  saving.value = false
}

async function addCustomKpi() {
  customKpis.value.push({ ...newKpi.value })
  await kpiApi.saveCustom({ custom_kpis: customKpis.value })
  newKpi.value = { name: '', value: 0, goal: 0, unit: '', color: '#7EC8B8' }
  showNewKpi.value = false
}
</script>
