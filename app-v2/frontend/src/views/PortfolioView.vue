<template>
  <div class="portfolio">
    <!-- HEADER -->
    <div class="port-header">
      <h1>💼 {{ t('port_title') }}</h1>
      <div class="port-actions">
        <button class="btn-outline" @click="$router.push('/app/import')">{{ t('port_import') }}</button>
        <button class="btn-outline" @click="exportCsv">{{ t('port_export') }}</button>
        <div v-if="resetStep === 0">
          <button class="btn-danger-outline" @click="resetStep = 1">{{ t('port_reset_all') }}</button>
        </div>
        <div v-else-if="resetStep === 1" class="reset-confirm">
          <span class="reset-msg">{{ t('port_reset_step1') }}</span>
          <button class="btn-danger-outline" @click="resetStep = 2">{{ t('port_reset_confirm') }}</button>
          <button class="btn-outline" @click="resetStep = 0">{{ t('sm_reset_cancel') }}</button>
        </div>
        <div v-else-if="resetStep === 2" class="reset-confirm">
          <span class="reset-msg warn">{{ t('port_reset_step2') }}</span>
          <button class="btn-danger" @click="doResetAll">{{ t('port_reset_confirm') }}</button>
          <button class="btn-outline" @click="resetStep = 0">{{ t('sm_reset_cancel') }}</button>
        </div>
        <button class="btn-primary" @click="openCreate">{{ t('port_add') }}</button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="port-kpis">
      <div class="pkpi"><span class="pkpi-icon">📊</span><div><span class="pkpi-value">{{ clients.clients.length }}</span><span class="pkpi-label">{{ t('port_accounts') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">💰</span><div><span class="pkpi-value">€{{ fmtNum(clients.totalArr) }}</span><span class="pkpi-label">{{ t('port_arr_total') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">💚</span><div><span class="pkpi-value">{{ clients.avgHealth }}/10</span><span class="pkpi-label">{{ t('port_health_avg') }}</span></div></div>
      <div class="pkpi warn"><span class="pkpi-icon">🔴</span><div><span class="pkpi-value">{{ clients.criticalCount }}</span><span class="pkpi-label">{{ t('port_critical') }}</span></div></div>
    </div>

    <!-- SEARCH & FILTERS -->
    <div class="port-toolbar">
      <div class="search-box">
        <span class="si">🔍</span>
        <input v-model="search" :placeholder="t('port_search')" />
      </div>
      <div class="filter-tabs">
        <button v-for="f in filterList" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">
          {{ t(f.label) }} <span class="fc">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <PortfolioTable v-if="filtered.length" :clients="filtered" @edit="openEdit" @delete="doDelete" />

    <!-- EMPTY -->
    <div v-else class="empty">
      <div class="empty-i">💼</div>
      <h3>{{ t('port_empty_title') }}</h3>
      <p>{{ t('port_empty_desc') }}</p>
      <button class="btn-primary" @click="openCreate">{{ t('port_new_account') }}</button>
    </div>

    <!-- SLIDE-OVER -->
    <PortfolioForm
      :open="slideOpen"
      :edit-id="editId"
      :form="form"
      :industries="industries"
      :members="team.members"
      @close="slideOpen = false"
      @save="save"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import PortfolioTable from '@/components/portfolio/PortfolioTable.vue'
import PortfolioForm from '@/components/portfolio/PortfolioForm.vue'
import { fmtNum } from '@/components/portfolio/portfolioHelpers.js'
import '@/assets/portfolio.css'

const { t } = useI18n({ useScope: 'global' })
const clients = useClientStore()
const team = useTeamStore()

const search = ref('')
const activeFilter = ref('all')
const slideOpen = ref(false)
const editId = ref(null)
const resetStep = ref(0)

function doResetAll() { clients.resetAll(); resetStep.value = 0 }

const initForm = () => ({
  name: '', industry: 'SaaS', arr: 0, mrr: 0, health: 7, nps: 50,
  status: 'healthy', csmId: team.members[0]?.id || '', renewalDate: '',
  cName: '', cEmail: '', cRole: '', churnRisk: 0.05
})

const form = reactive(initForm())
const industries = computed(() => t('port_industries').split(','))

const filterList = computed(() => [
  { key: 'all', label: 'port_filter_all', count: clients.clients.length },
  { key: 'critical', label: 'port_filter_critical', count: clients.criticalCount },
  { key: 'watch', label: 'port_filter_watch', count: clients.watchCount },
  { key: 'healthy', label: 'port_filter_healthy', count: clients.healthyCount },
])

const filtered = computed(() => {
  let list = clients.clients
  if (activeFilter.value !== 'all') list = list.filter(c => c.status === activeFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.csm.toLowerCase().includes(q))
  }
  return list
})

function openCreate() { editId.value = null; Object.assign(form, initForm()); slideOpen.value = true }

function openEdit(c) {
  editId.value = c.id
  Object.assign(form, {
    name: c.name, industry: c.industry, arr: c.arr, mrr: c.mrr, health: c.health,
    nps: c.nps, status: c.status, csmId: c.csmId, renewalDate: c.renewalDate,
    churnRisk: c.churnRisk, cName: c.contacts?.[0]?.name || '',
    cEmail: c.contacts?.[0]?.email || '', cRole: c.contacts?.[0]?.role || ''
  })
  slideOpen.value = true
}

function save() {
  const csm = team.members.find(m => m.id === form.csmId)
  const data = {
    name: form.name, industry: form.industry, arr: form.arr,
    mrr: form.mrr || Math.round(form.arr / 12), health: form.health, nps: form.nps,
    status: form.status, csmId: form.csmId, csm: csm?.name || '',
    renewalDate: form.renewalDate, churnRisk: form.churnRisk,
    logo: form.status === 'healthy' ? '🟢' : form.status === 'watch' ? '🟡' : '🔴',
    contacts: form.cName ? [{ name: form.cName, email: form.cEmail, role: form.cRole }] : []
  }
  if (editId.value) clients.updateClient(editId.value, data)
  else clients.addClient(data)
  slideOpen.value = false
}

function doDelete(c) { clients.deleteClient(c.id) }

function exportCsv() {
  const h = [t('port_field_name'), t('port_field_industry'), t('kpi_arr'), t('kpi_health'),
    'NPS', t('port_field_status'), t('port_field_agent'), t('port_renewal')]
  const rows = clients.clients.map(c => [c.name, c.industry, c.arr, c.health, c.nps, c.status, c.csm, c.renewalDate])
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'scalyo-portfolio.csv'; a.click()
}
</script>
