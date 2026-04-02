<template>
  <div class="fade-in">
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; padding: 60px 0; color: #334155; font-size: 14px">
      {{ t('loading') }}
    </div>
    <template v-else>

    <!-- TABS -->
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: tab === 'executive' }" @click="tab = 'executive'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="dashboard" :size="15" /> {{ t('copilExecutive') }}</button>
      <button class="tab-item" :class="{ active: tab === 'standard' }" @click="tab = 'standard'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="chart-up" :size="15" /> {{ t('kpiStandard') }}</button>
      <button class="tab-item" :class="{ active: tab === 'team' }" @click="tab = 'team'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="heart" :size="15" /> {{ t('copilTeam') }}</button>
      <button class="tab-item" :class="{ active: tab === 'renewals' }" @click="tab = 'renewals'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="calendar" :size="15" /> {{ t('copilRenewals') }}</button>
      <button class="tab-item" :class="{ active: tab === 'custom' }" @click="tab = 'custom'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="target" :size="15" /> {{ t('kpiCustomTitle') }}</button>
      <button class="tab-item" :class="{ active: tab === 'goals' }" @click="tab = 'goals'" style="display: flex; align-items: center; gap: 5px;"><ScalyoIcon name="trophy" :size="15" /> {{ t('quarterlyGoals') }}</button>
    </div>

    <!-- ===== VUE EXECUTIVE (auto-computed from portfolio) ===== -->
    <template v-if="tab === 'executive'">
      <!-- North Star Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 20px;">
        <div class="card" style="padding: 16px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; color: #334155; font-weight: 700; margin-bottom: 4px;">ARR Total</div>
          <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ fmtKpiCurrency(computed_arr) }}</div>
        </div>
        <div class="card" style="padding: 16px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; color: #334155; font-weight: 700; margin-bottom: 4px;">MRR</div>
          <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ fmtKpiCurrency(computed_mrr) }}</div>
        </div>
        <div class="card" style="padding: 16px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; color: #334155; font-weight: 700; margin-bottom: 4px;">NRR</div>
          <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace;" :style="{ color: kpis.nrr >= 100 ? 'var(--green)' : 'var(--red)' }">{{ kpis.nrr || 100 }}%</div>
        </div>
        <div class="card" style="padding: 16px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; color: #334155; font-weight: 700; margin-bottom: 4px;">GRR</div>
          <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace;" :style="{ color: kpis.grr >= 90 ? 'var(--green)' : 'var(--amber)' }">{{ kpis.grr || 90 }}%</div>
        </div>
        <div class="card" style="padding: 16px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; color: #334155; font-weight: 700; margin-bottom: 4px;">NPS</div>
          <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace;" :style="{ color: kpis.nps >= 30 ? 'var(--green)' : kpis.nps >= 0 ? 'var(--amber)' : 'var(--red)' }">{{ kpis.nps || 0 }}</div>
        </div>
      </div>

      <!-- Secondary metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px;">
        <KpiCard :label="t('copilTotalClients')" :value="totalAccounts" icon="briefcase" color="var(--teal)" />
        <KpiCard :label="t('copilAvgHealth')" :value="avgHealth + '/100'" icon="heart" :color="avgHealth >= 70 ? 'var(--green)' : avgHealth >= 50 ? 'var(--amber)' : 'var(--red)'" />
        <KpiCard label="CSAT" :value="(kpis.csat || 0) + '/10'" icon="star" :color="kpis.csat >= 7 ? 'var(--green)' : 'var(--amber)'" />
        <KpiCard :label="t('copilAtRisk')" :value="atRiskCount" icon="siren" color="var(--red)" />
        <KpiCard :label="t('renewalRate')" :value="(kpis.renewalRate || 0) + '%'" icon="refresh" :color="kpis.renewalRate >= 85 ? 'var(--green)' : 'var(--amber)'" />
        <KpiCard :label="t('copilExpansion')" :value="fmtKpiCurrency(kpis.expansion || 0)" icon="chart-up" color="var(--green)" />
      </div>

      <!-- Health Score Distribution -->
      <div class="card" style="padding: 20px; margin-bottom: 16px;">
        <h4 style="font-weight: 800; margin-bottom: 14px;">{{ t('copilHealthDist') }}</h4>
        <div style="display: flex; gap: 4px; height: 32px; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
          <div :style="{ flex: healthDist.green, background: 'var(--green)', minWidth: healthDist.green ? '2px' : 0 }"></div>
          <div :style="{ flex: healthDist.orange, background: '#f59e0b', minWidth: healthDist.orange ? '2px' : 0 }"></div>
          <div :style="{ flex: healthDist.red, background: 'var(--red)', minWidth: healthDist.red ? '2px' : 0 }"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span style="color: var(--green);">● {{ t('copilHealthy') }} {{ healthDist.green }} ({{ healthDist.greenPct }}%)</span>
          <span style="color: #f59e0b;">● {{ t('copilWatch') }} {{ healthDist.orange }} ({{ healthDist.orangePct }}%)</span>
          <span style="color: var(--red);">● {{ t('copilCritical') }} {{ healthDist.red }} ({{ healthDist.redPct }}%)</span>
        </div>
      </div>

      <!-- ARPU & Unit Economics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 16px;">
        <div class="card" style="padding: 16px;">
          <div style="font-size: 13px; color: #334155; font-weight: 700; text-transform: uppercase;">ARPU</div>
          <div style="font-size: 20px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ fmtKpiCurrency(arpu) }}</div>
          <div style="font-size: 13px; color: #334155;">{{ t('copilArpuDesc') }}</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div style="font-size: 13px; color: #334155; font-weight: 700; text-transform: uppercase;">{{ t('copilChurnRate') }}</div>
          <div style="font-size: 20px; font-weight: 900; font-family: 'JetBrains Mono', monospace;" :style="{ color: churnRate <= 5 ? 'var(--green)' : 'var(--red)' }">{{ churnRate }}%</div>
          <div style="font-size: 13px; color: #334155;">{{ t('copilLogoChurn') }}</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div style="font-size: 13px; color: #334155; font-weight: 700; text-transform: uppercase;">{{ t('copilCsEfficiency') }}</div>
          <div style="font-size: 20px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ fmtKpiCurrency(arrPerCsm) }}</div>
          <div style="font-size: 13px; color: #334155;">{{ t('copilArrPerCsm') }}</div>
        </div>
      </div>
    </template>

    <!-- ===== STANDARD KPIs (existing + client search) ===== -->
    <template v-if="tab === 'standard'">
      <div class="card mb-md" style="padding: 20px">
        <div class="flex-between mb-md">
          <h3 style="font-weight: 800">{{ t('periodLabel') }}</h3>
          <input v-model="period" class="field-input" style="max-width: 200px; padding: 8px 12px; font-size: 13px" :placeholder="t('periodLabel')" />
        </div>

        <!-- Client search -->
        <div style="margin-bottom: 16px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; position: relative;">
              <input v-model="clientSearch" :placeholder="t('kpiSearchClient')" @focus="showClientDropdown = true" @input="showClientDropdown = true"
                style="width: 100%; background: var(--surface); border: 1px solid var(--tealBorder); border-radius: 10px; padding: 10px 14px 10px 36px; color: var(--text); font-size: 13px;" />
              <ScalyoIcon name="search" :size="14" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--teal);" />
            </div>
            <button v-if="selectedClient" class="btn btn-secondary" style="font-size: 13px; padding: 8px 14px; white-space: nowrap;" @click="clearClient">✕ {{ t('kpiClearClient') }}</button>
          </div>
          <div v-if="selectedClient" style="margin-top: 8px; padding: 8px 14px; background: var(--tealBg); border: 1px solid var(--tealBorder); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 13px;">{{ selectedClient.name }} <span style="font-size: 12px; color: #334155; margin-left: 8px;">{{ selectedClient.csm || '—' }}</span></span>
            <span style="font-size: 12px; font-weight: 700; color: var(--teal);">{{ t('kpiAutoFilled') }}</span>
          </div>
          <div v-if="showClientDropdown && clientResults.length > 0" style="position: absolute; z-index: 100; top: 100%; left: 0; right: 0; background: var(--bg1); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); max-height: 240px; overflow-y: auto; margin-top: 4px;">
            <div v-for="acc in clientResults" :key="acc.id" @click="selectClient(acc)" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;" @mouseenter="$event.target.style.background='var(--surface)'" @mouseleave="$event.target.style.background='transparent'">
              <div>
                <div style="font-weight: 600; font-size: 13px;">{{ acc.name }}</div>
                <div style="font-size: 13px; color: #334155;">{{ acc.csm || '—' }} · Health {{ acc.health || 0 }}/100</div>
              </div>
              <div style="font-weight: 700; font-size: 13px; font-family: 'JetBrains Mono', monospace;">{{ fmtKpiCurrency(acc.arr || acc.mrr * 12 || 0) }}</div>
            </div>
          </div>
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
          <div class="field-group">
            <label class="field-label">NRR (%)</label>
            <input v-model.number="kpis.nrr" type="number" class="field-input" min="0" max="200" />
          </div>
          <div class="field-group">
            <label class="field-label">GRR (%)</label>
            <input v-model.number="kpis.grr" type="number" class="field-input" min="0" max="100" />
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('copilExpansion') }} ({{ currencySymbol }})</label>
            <input v-model.number="kpis.expansion" type="number" class="field-input" min="0" />
          </div>
        </div>
        <button class="btn btn-primary" @click="saveMonthly" :disabled="saving">
          {{ saving ? t('saving') : t('save') }}
        </button>
      </div>

      <div class="grid-4 mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))">
        <KpiCard label="MRR" :value="fmtKpiCurrency(kpis.mrr)" icon="money" color="var(--teal)" />
        <KpiCard label="NPS" :value="kpis.nps" icon="survey" color="var(--blue)" />
        <KpiCard :label="t('renewalRate')" :value="kpis.renewalRate + '%'" icon="refresh" :color="kpis.renewalRate >= 85 ? 'var(--green)' : 'var(--amber)'" />
        <KpiCard label="CSAT" :value="kpis.csat + '/10'" icon="star" :color="kpis.csat >= 7 ? 'var(--green)' : 'var(--amber)'" />
      </div>
    </template>

    <!-- ===== PERFORMANCE EQUIPE ===== -->
    <template v-if="tab === 'team'">
      <div class="card mb-md" style="padding: 20px">
        <h3 style="font-weight: 800; margin-bottom: 16px;">{{ t('copilTeamPerf') }}</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border);">
                <th style="text-align: left; padding: 8px;">CSM</th>
                <th style="text-align: right; padding: 8px;">{{ t('copilManagedArr') }}</th>
                <th style="text-align: center; padding: 8px;">{{ t('copilAccountCount') }}</th>
                <th style="text-align: center; padding: 8px;">{{ t('copilAvgHealth') }}</th>
                <th style="text-align: center; padding: 8px;">{{ t('copilAtRisk') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="csm in csmPerformance" :key="csm.name" style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px 8px; font-weight: 600;">{{ csm.name }}</td>
                <td style="padding: 10px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">{{ fmtKpiCurrency(csm.arr) }}</td>
                <td style="padding: 10px 8px; text-align: center;">{{ csm.count }}</td>
                <td style="padding: 10px 8px; text-align: center;">
                  <span :style="{ color: csm.avgHealth >= 70 ? 'var(--green)' : csm.avgHealth >= 50 ? '#f59e0b' : 'var(--red)', fontWeight: 700 }">{{ csm.avgHealth }}</span>
                </td>
                <td style="padding: 10px 8px; text-align: center;">
                  <span v-if="csm.atRisk > 0" style="color: var(--red); font-weight: 700;">{{ csm.atRisk }}</span>
                  <span v-else style="color: var(--green);">0</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!csmPerformance.length" style="text-align: center; padding: 20px; color: #334155; font-size: 13px;">{{ t('copilNoTeamData') }}</div>
      </div>
    </template>

    <!-- ===== PIPELINE RENOUVELLEMENTS ===== -->
    <template v-if="tab === 'renewals'">
      <div class="card mb-md" style="padding: 20px">
        <h3 style="font-weight: 800; margin-bottom: 16px;">{{ t('copilRenewalPipeline') }}</h3>
        <div v-if="upcomingRenewals.length" style="display: flex; flex-direction: column; gap: 6px;">
          <div v-for="acc in upcomingRenewals" :key="acc.id" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 8px; height: 8px; border-radius: 50%;" :style="{ background: acc.risk === 'critical' ? 'var(--red)' : acc.risk === 'medium' ? '#f59e0b' : 'var(--green)' }"></div>
              <div>
                <div style="font-weight: 700; font-size: 13px;">{{ acc.name }}</div>
                <div style="font-size: 13px; color: #334155;">{{ acc.csm || '—' }} · Health {{ acc.health || 0 }}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; font-family: 'JetBrains Mono', monospace;">{{ fmtKpiCurrency(acc.arr || 0) }}</div>
              <div style="font-size: 13px; color: #334155;">{{ acc.renewal || '—' }}</div>
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 20px; color: #334155; font-size: 13px;">{{ t('copilNoRenewals') }}</div>
      </div>
    </template>

    <!-- ===== CUSTOM KPIs (existing) ===== -->
    <template v-if="tab === 'custom'">
      <div class="flex-between mb-md">
        <div>
          <h3 style="font-weight: 800">{{ t('kpiCustomTitle') }}</h3>
          <p style="font-size: 13px; color: #334155">{{ t('kpiCustomDesc') }}</p>
        </div>
        <button class="btn btn-primary" @click="showNewKpi = true">{{ t('kpiNewBtn') }}</button>
      </div>
      <div v-if="customKpis.length" style="display: flex; flex-direction: column; gap: 10px">
        <AppCard v-for="(kpi, i) in customKpis" :key="i">
          <div class="flex-between">
            <div>
              <div style="font-weight: 700">{{ kpi.name }}</div>
              <div style="font-size: 12px; color: #334155">{{ kpi.unit || '' }}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="kpi-value" :style="{ color: kpi.color || 'var(--teal)' }">{{ kpi.value }}</div>
              <button class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px;" @click="editCustomKpi(i)">{{ t('edit') }}</button>
              <button class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px; color: var(--red);" @click="deleteCustomKpi(i)">{{ t('delete') }}</button>
            </div>
          </div>
          <div v-if="kpi.goal && kpi.goal > 0" style="font-size: 13px; color: #334155; margin-top: 6px">
            {{ t('target') }}{{ kpi.goal }} ({{ Math.round((kpi.value / kpi.goal) * 100) }}% {{ t('reached') }})
          </div>
        </AppCard>
      </div>
      <EmptyState v-else icon="target" :title="t('kpiNoCustom')" :action="t('kpiNewBtn')" @action="showNewKpi = true" />
    </template>

    <!-- ===== GOALS (existing) ===== -->
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
      <AppField :label="t('name')" v-model="newKpi.name" required />
      <AppField :label="t('value')" v-model="newKpi.value" type="number" />
      <AppField :label="t('target')" v-model="newKpi.goal" type="number" />
      <AppField :label="t('unit')" v-model="newKpi.unit" :placeholder="currencySymbol + ', %, score...'" />
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
import { usePortfolioStore } from '../stores/portfolio'
import KpiCard from '../components/KpiCard.vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const portfolioStore = usePortfolioStore()

const currencySymbol = computed(() => {
  const c = prefsStore.currency
  if (c === 'USD') return '$'
  if (c === 'GBP') return '£'
  if (c === 'CHF') return 'CHF'
  if (c === 'CAD') return 'CA$'
  return '€'
})

const tab = ref('executive')
const loading = ref(true)
const saving = ref(false)
const showNewKpi = ref(false)
const period = ref(new Date().toISOString().slice(0, 7))
const kpis = reactive({ mrr: 0, churned: 0, nps: 0, renewalRate: 0, csat: 0, resolvedTickets: 0, nrr: 100, grr: 90, expansion: 0 })
const goals = reactive({ mrr: 0, churned: 0, nps: 0, renewalRate: 0 })
const customKpis = ref([])
const newKpi = ref({ name: '', value: 0, goal: 0, unit: '', color: '#7EC8B8' })

// Client search
const clientSearch = ref('')
const showClientDropdown = ref(false)
const selectedClient = ref(null)

const clientResults = computed(() => {
  const q = clientSearch.value.toLowerCase().trim()
  if (!q) return portfolioStore.accounts.slice(0, 10)
  return portfolioStore.accounts.filter(a =>
    a.name?.toLowerCase().includes(q) || a.csm?.toLowerCase().includes(q)
  ).slice(0, 10)
})

function selectClient(acc) {
  selectedClient.value = acc
  clientSearch.value = acc.name
  showClientDropdown.value = false
  const arr = parseFloat(acc.arr) || (parseFloat(acc.mrr) || 0) * 12
  kpis.mrr = parseFloat(acc.mrr) || Math.round(arr / 12)
  if (acc.health && !kpis.csat) kpis.csat = Math.round((acc.health / 10) * 10) / 10
  if (acc.health && !kpis.renewalRate) kpis.renewalRate = Math.min(100, Math.round(acc.health * 1.1))
}

function clearClient() { selectedClient.value = null; clientSearch.value = '' }

// Auto-computed metrics from portfolio
const computed_arr = computed(() => portfolioStore.accounts.reduce((s, a) => s + (parseFloat(a.arr) || 0), 0))
const computed_mrr = computed(() => Math.round(computed_arr.value / 12))
const totalAccounts = computed(() => portfolioStore.accounts.length)
const avgHealth = computed(() => {
  const accs = portfolioStore.accounts.filter(a => a.health > 0)
  if (!accs.length) return 0
  return Math.round(accs.reduce((s, a) => s + a.health, 0) / accs.length)
})
const atRiskCount = computed(() => portfolioStore.accounts.filter(a => a.risk === 'critical' || a.risk === 'medium').length)
const arpu = computed(() => totalAccounts.value ? Math.round(computed_arr.value / totalAccounts.value) : 0)
const churnRate = computed(() => {
  if (!totalAccounts.value || !kpis.churned) return 0
  return Math.round((kpis.churned / computed_mrr.value) * 100 * 10) / 10
})

// ARR per CSM
const csmList = computed(() => {
  const map = {}
  for (const a of portfolioStore.accounts) {
    const csm = a.csm || t('copilUnassigned')
    if (!map[csm]) map[csm] = { name: csm, arr: 0, count: 0, totalHealth: 0, healthCount: 0, atRisk: 0 }
    map[csm].arr += parseFloat(a.arr) || 0
    map[csm].count++
    if (a.health > 0) { map[csm].totalHealth += a.health; map[csm].healthCount++ }
    if (a.risk === 'critical' || a.risk === 'medium') map[csm].atRisk++
  }
  return Object.values(map)
})

const arrPerCsm = computed(() => {
  const csms = csmList.value.filter(c => c.name !== t('copilUnassigned'))
  if (!csms.length) return 0
  return Math.round(computed_arr.value / csms.length)
})

const csmPerformance = computed(() =>
  csmList.value.map(c => ({
    ...c,
    avgHealth: c.healthCount ? Math.round(c.totalHealth / c.healthCount) : 0,
  })).sort((a, b) => b.arr - a.arr)
)

// Health distribution
const healthDist = computed(() => {
  const accs = portfolioStore.accounts
  const total = accs.length || 1
  const green = accs.filter(a => a.health >= 70).length
  const orange = accs.filter(a => a.health >= 40 && a.health < 70).length
  const red = accs.filter(a => a.health < 40).length
  return {
    green, orange, red,
    greenPct: Math.round(green / total * 100),
    orangePct: Math.round(orange / total * 100),
    redPct: Math.round(red / total * 100),
  }
})

// Upcoming renewals (accounts with renewal dates)
const upcomingRenewals = computed(() =>
  portfolioStore.accounts
    .filter(a => a.renewal && a.renewal.length > 3)
    .sort((a, b) => (a.renewal || '').localeCompare(b.renewal || ''))
    .slice(0, 20)
)

// Close dropdown on click outside
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest?.('[style*="tealBorder"]')) showClientDropdown.value = false
  })
}

onMounted(async () => {
  if (!portfolioStore.accounts.length) portfolioStore.fetchAccounts()
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
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
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
  try { await kpiApi.saveMonthly({ period: period.value, kpis: { ...kpis } }) }
  catch (e) { console.error('saveMonthly error:', e) }
  saving.value = false
}

async function saveGoals() {
  saving.value = true
  try { await kpiApi.saveGoals({ goals: { ...goals } }) }
  catch (e) { console.error('saveGoals error:', e) }
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
  } catch (e) { customKpis.value = backup; console.error('addCustomKpi error:', e) }
}

function editCustomKpi(idx) {
  Object.assign(newKpi.value, customKpis.value[idx])
  editingKpiIdx.value = idx
  showNewKpi.value = true
}

async function deleteCustomKpi(idx) {
  if (!confirm(t('delete') + ' ?')) return
  const backup = [...customKpis.value.map(k => ({ ...k }))]
  try { customKpis.value.splice(idx, 1); await kpiApi.saveCustom({ custom_kpis: customKpis.value }) }
  catch (e) { customKpis.value = backup }
}
</script>
