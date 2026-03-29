<template>
  <div class="fade-in">
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; padding: 60px 0; color: var(--muted); font-size: 14px">
      {{ t('loading') }}
    </div>
    <template v-else>
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: tab === 'standard' }" @click="tab = 'standard'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="dashboard" :size="15" /> {{ t('kpiStandard') }}</button>
      <button class="tab-item" :class="{ active: tab === 'custom' }" @click="tab = 'custom'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="target" :size="15" /> {{ t('kpiCustomTitle') }}</button>
      <button class="tab-item" :class="{ active: tab === 'goals' }" @click="tab = 'goals'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="trophy" :size="15" /> {{ t('quarterlyGoals') }}</button>
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
            <label class="field-label">MRR ({{ currencySymbol }})</label>
            <input v-model.number="kpis.mrr" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('churned') }} ({{ currencySymbol }})</label>
            <input v-model.number="kpis.churned" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">NPS</label>
            <input v-model.number="kpis.nps" type="number" class="field-input" min="-100" max="100" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('renewalRate') }} (%)</label>
            <input v-model.number="kpis.renewalRate" type="number" class="field-input" min="0" max="100" />
          </div>
          <div class="field-group">
            <label class="field-label">CSAT (/10)</label>
            <input v-model.number="kpis.csat" type="number" class="field-input" min="0" max="10" step="0.1" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('resolvedTickets') }}</label>
            <input v-model.number="kpis.resolvedTickets" type="number" class="field-input" min="0" />
          </div>
        </div>
        <button class="btn btn-primary" @click="saveMonthly" :disabled="saving">
          {{ saving ? t('saving') : t('save') }}
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid-4 mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))">
        <KpiCard label="MRR" :value="fmtKpiCurrency(kpis.mrr)" icon="money" color="var(--teal)" />
        <KpiCard label="NPS" :value="kpis.nps" icon="survey" color="var(--blue)" />
        <KpiCard :label="t('renewalRate') || 'Renewal Rate'" :value="kpis.renewalRate + '%'" icon="refresh" :color="kpis.renewalRate >= 85 ? 'var(--green)' : 'var(--amber)'" />
        <KpiCard label="CSAT" :value="kpis.csat + '/10'" icon="star" :color="kpis.csat >= 7 ? 'var(--green)' : 'var(--amber)'" />
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
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="kpi-value" :style="{ color: kpi.color || 'var(--teal)' }">{{ kpi.value }}</div>
              <button class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px;" @click="editCustomKpi(i)">{{ t('edit') }}</button>
              <button class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px; color: var(--red);" @click="deleteCustomKpi(i)">{{ t('delete') }}</button>
            </div>
          </div>
          <div v-if="kpi.goal && kpi.goal > 0" style="font-size: 11px; color: var(--muted); margin-top: 6px">
            {{ t('target') }}{{ kpi.goal }} ({{ Math.round((kpi.value / kpi.goal) * 100) }}% {{ t('reached') }})
          </div>
        </AppCard>
      </div>
      <EmptyState v-else icon="target" :title="t('kpiNoCustom')" :action="t('kpiNewBtn')" @action="showNewKpi = true" />
    </template>

    <!-- Goals -->
    <template v-if="tab === 'goals'">
      <AppCard class="mb-md">
        <h3 style="font-weight: 800; margin-bottom: 14px">{{ t('quarterlyGoals') }}</h3>
        <div class="grid-2">
          <div class="field-group">
            <label class="field-label">{{ t('mrrTarget') }} ({{ currencySymbol }})</label>
            <input v-model.number="goals.mrr" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('maxChurn') }} ({{ currencySymbol }})</label>
            <input v-model.number="goals.churned" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('npsTarget') }}</label>
            <input v-model.number="goals.nps" type="number" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('renewalRateTarget') }} (%)</label>
            <input v-model.number="goals.renewalRate" type="number" class="field-input" />
          </div>
        </div>
        <button class="btn btn-primary" style="margin-top: 12px" @click="saveGoals" :disabled="saving">
          {{ saving ? t('saving') : t('save') }}
        </button>
      </AppCard>
    </template>

    </template>

    <!-- New KPI Modal -->
    <AppModal v-if="showNewKpi" :title="editingKpiIdx !== null ? t('edit') : t('kpiNewBtn')" @close="showNewKpi = false; editingKpiIdx = null">
      <AppField :label="t('name') || 'Name'" v-model="newKpi.name" required />
      <AppField :label="t('value') || 'Value'" v-model="newKpi.value" type="number" />
      <AppField :label="t('target') || 'Goal'" v-model="newKpi.goal" type="number" />
      <AppField :label="t('unit') || 'Unit'" v-model="newKpi.unit" :placeholder="currencySymbol + ', %, score...'" />
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-secondary" @click="showNewKpi = false">{{ t('cancel') }}</button>
        <button class="btn btn-primary" @click="addCustomKpi">{{ t('create') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { kpiApi } from '../api'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import KpiCard from '../components/KpiCard.vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const currencySymbol = computed(() => {
  const c = prefsStore.currency
  if (c === 'USD') return '$'
  if (c === 'GBP') return '£'
  if (c === 'CHF') return 'CHF'
  if (c === 'CAD') return 'CA$'
  return '€'
})
const tab = ref('standard')
const loading = ref(true)
const saving = ref(false)
const showNewKpi = ref(false)
const period = ref(new Date().toISOString().slice(0, 7))
const kpis = reactive({ mrr: 0, churned: 0, nps: 0, renewalRate: 0, csat: 0, resolvedTickets: 0 })
const goals = reactive({ mrr: 0, churned: 0, nps: 0, renewalRate: 0 })
const customKpis = ref([])
const newKpi = ref({ name: '', value: 0, goal: 0, unit: '', color: '#7EC8B8' })

onMounted(async () => {
  try {
    const { data } = await kpiApi.getAll()
    const rows = data.results || data
    rows.forEach(row => {
      if (row.period === '__custom__') customKpis.value = row.custom_kpis || []
      else if (row.period === '__goals__') Object.assign(goals, row.goals || {})
      else if (row.period === period.value && row.kpis) Object.assign(kpis, row.kpis)
    })
  } catch (e) {
    console.error('Failed to load KPIs:', e)
  } finally {
    loading.value = false
  }
})

function fmtK(v) {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}K`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v
}

function fmtKpiCurrency(v) {
  const s = currencySymbol.value
  const before = ['$', '£', 'CA$'].includes(s)
  const n = fmtK(v)
  return before ? `${s}${n}` : `${n}${s}`
}

async function saveMonthly() {
  saving.value = true
  try {
    await kpiApi.saveMonthly({ period: period.value, kpis: { ...kpis } })
  } catch (e) {
    console.error('saveMonthly error:', e)
  }
  saving.value = false
}

async function saveGoals() {
  saving.value = true
  try {
    await kpiApi.saveGoals({ goals: { ...goals } })
  } catch (e) {
    console.error('saveGoals error:', e)
  }
  saving.value = false
}

const editingKpiIdx = ref(null)

async function addCustomKpi() {
  if (!newKpi.value.name.trim()) return
  const backup = [...customKpis.value.map(k => ({ ...k }))]
  try {
    if (editingKpiIdx.value !== null) {
      customKpis.value.splice(editingKpiIdx.value, 1, { ...newKpi.value })
      editingKpiIdx.value = null
    } else {
      customKpis.value.push({ ...newKpi.value })
    }
    await kpiApi.saveCustom({ custom_kpis: customKpis.value })
    newKpi.value = { name: '', value: 0, goal: 0, unit: '', color: '#7EC8B8' }
    showNewKpi.value = false
  } catch (e) {
    customKpis.value = backup
    console.error('addCustomKpi error:', e)
  }
}

function editCustomKpi(idx) {
  const kpi = customKpis.value[idx]
  Object.assign(newKpi.value, kpi)
  editingKpiIdx.value = idx
  showNewKpi.value = true
}

async function deleteCustomKpi(idx) {
  if (!confirm(t('delete') + ' ?')) return
  const backup = [...customKpis.value.map(k => ({ ...k }))]
  try {
    customKpis.value.splice(idx, 1)
    await kpiApi.saveCustom({ custom_kpis: customKpis.value })
  } catch (e) {
    customKpis.value = backup
    console.error('deleteCustomKpi error:', e)
  }
}
</script>
