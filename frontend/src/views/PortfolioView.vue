<template>
  <div class="fade-in">
    <!-- Toolbar -->
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; align-items: center">
      <input
        v-model="search"
        :placeholder="t('searchAccount')"
        class="field-input"
        style="max-width: 300px; padding: 9px 14px; font-size: 13px"
      />
      <div style="display: flex; gap: 6px; flex-wrap: wrap">
        <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">{{ t('allAccounts') }}</button>
        <button class="chip" :class="{ active: filter === 'low' }" @click="filter = 'low'">{{ t('riskLow') }}</button>
        <button class="chip" :class="{ active: filter === 'medium' }" @click="filter = 'medium'">{{ t('riskMedium') }}</button>
        <button class="chip" :class="{ active: filter === 'critical' }" @click="filter = 'critical'">{{ t('riskCritical') }}</button>
      </div>
      <div style="flex: 1"></div>
      <button class="btn btn-primary" @click="showAdd = true">{{ t('newAccount') }}</button>
      <button class="btn btn-secondary" @click="showImport = true">{{ t('importPortfolio') }}</button>
    </div>

    <!-- CSM filter -->
    <div v-if="csmList.length > 1" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px">
      <button class="chip" :class="{ active: csmFilter === '' }" @click="csmFilter = ''">{{ t('allCsm') }}</button>
      <button
        v-for="csm in csmList" :key="csm"
        class="chip" :class="{ active: csmFilter === csm }"
        @click="csmFilter = csm"
      >{{ csm }}</button>
    </div>

    <!-- Accounts list -->
    <div v-if="filteredAccounts.length" style="display: flex; flex-direction: column; gap: 8px">
      <div
        v-for="acc in filteredAccounts" :key="acc.id"
        class="card card-lift"
        style="display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer"
        @click="selectedAccount = acc"
      >
        <div style="width: 38px; height: 38px; border-radius: 11px; background: var(--tealBg); border: 1px solid var(--tealBorder); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: var(--teal); font-family: 'JetBrains Mono', monospace; flex-shrink: 0">
          {{ (acc.name || '?').substring(0, 2).toUpperCase() }}
        </div>
        <div style="flex: 1; min-width: 0">
          <div style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ acc.name }}</div>
          <div style="font-size: 11px; color: var(--muted)">{{ acc.csm || t('unassigned') }}</div>
        </div>
        <HealthBar :val="acc.health" style="width: 80px; flex-shrink: 0" />
        <RiskPill :risk="acc.risk" />
        <span style="font-size: 13px; font-weight: 700; color: var(--teal); font-family: 'JetBrains Mono', monospace; white-space: nowrap">
          {{ formatARR(acc.arr) }}
        </span>
      </div>
    </div>
    <EmptyState v-else-if="!portfolioStore.loading" icon="💼" :title="t('portfolioEmpty')" :action="t('newAccount')" @action="showAdd = true" />

    <!-- Add account modal -->
    <AppModal v-if="showAdd" :title="t('newAccount')" @close="showAdd = false">
      <AppField :label="t('accNameLabel')" v-model="newAcc.name" required />
      <AppField label="CSM" v-model="newAcc.csm" placeholder="CSM name" />
      <AppField label="ARR (€)" v-model="newAcc.arr" type="number" placeholder="0" />
      <AppField label="Health (0-100)" v-model="newAcc.health" type="number" />
      <div class="field-group">
        <label class="field-label">Risk</label>
        <select v-model="newAcc.risk" class="field-input">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <AppField label="Contact" v-model="newAcc.contact" />
      <AppField label="Email" v-model="newAcc.contact_email" type="email" />
      <AppField label="Notes" v-model="newAcc.notes" type="textarea" />
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px">
        <button class="btn btn-secondary" @click="showAdd = false">{{ t('cancel') }}</button>
        <button class="btn btn-primary" :disabled="!newAcc.name || creating" @click="createAccount">
          {{ creating ? t('addingAcc') : t('createAcc') }}
        </button>
      </div>
    </AppModal>

    <!-- Import modal -->
    <AppModal v-if="showImport" :title="t('importPortfolio')" @close="showImport = false" maxWidth="600px">
      <div style="text-align: center; padding: 40px 20px; border: 2px dashed var(--border); border-radius: 16px; cursor: pointer" @click="$refs.fileInput.click()">
        <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" style="display: none" @change="handleFileImport" />
        <div style="font-size: 32px; margin-bottom: 12px">📁</div>
        <div style="font-weight: 700">Drop your file here or click to browse</div>
        <div style="font-size: 12px; color: var(--muted); margin-top: 6px">Supported: CSV, Excel (.xlsx, .xls)</div>
      </div>
    </AppModal>

    <!-- Account detail modal -->
    <AppModal v-if="selectedAccount" :title="selectedAccount.name" @close="selectedAccount = null" maxWidth="600px">
      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px">
        <HealthBar :val="selectedAccount.health" style="flex: 1" />
        <RiskPill :risk="selectedAccount.risk" />
      </div>
      <div class="grid-2 mb-md">
        <div><span style="font-size: 11px; color: var(--muted); text-transform: uppercase">CSM</span><div style="font-weight: 600">{{ selectedAccount.csm || t('unassigned') }}</div></div>
        <div><span style="font-size: 11px; color: var(--muted); text-transform: uppercase">ARR</span><div style="font-weight: 600; color: var(--teal)">{{ formatARR(selectedAccount.arr) }}</div></div>
        <div><span style="font-size: 11px; color: var(--muted); text-transform: uppercase">Contact</span><div style="font-weight: 600">{{ selectedAccount.contact || '-' }}</div></div>
        <div><span style="font-size: 11px; color: var(--muted); text-transform: uppercase">Health</span><div style="font-weight: 600">{{ selectedAccount.health }}%</div></div>
      </div>
      <div v-if="selectedAccount.notes" style="background: var(--surface); border-radius: 12px; padding: 14px; font-size: 13px; color: var(--muted); margin-bottom: 16px">
        {{ selectedAccount.notes }}
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <button class="btn btn-danger" @click="removeAccount">{{ t('delete') }}</button>
        <button class="btn btn-secondary" @click="selectedAccount = null">{{ t('close') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePortfolioStore } from '../stores/portfolio'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'
import HealthBar from '../components/HealthBar.vue'
import RiskPill from '../components/RiskPill.vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'

const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()
const { t } = useI18n()

const search = ref('')
const filter = ref('all')
const csmFilter = ref('')
const showAdd = ref(false)
const showImport = ref(false)
const selectedAccount = ref(null)
const creating = ref(false)

const newAcc = ref({ name: '', csm: '', arr: 0, health: 70, risk: 'low', contact: '', contact_email: '', notes: '' })

onMounted(() => portfolioStore.fetchAccounts())

const csmList = computed(() => {
  const csms = new Set(portfolioStore.accounts.map(a => a.csm).filter(Boolean))
  return [...csms].sort()
})

const filteredAccounts = computed(() => {
  let list = portfolioStore.accounts
  if (filter.value !== 'all') list = list.filter(a => a.risk === filter.value)
  if (csmFilter.value) list = list.filter(a => a.csm === csmFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a => a.name.toLowerCase().includes(q) || (a.csm || '').toLowerCase().includes(q))
  }
  return list
})

function formatARR(arr) {
  const v = parseFloat(arr) || 0
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M€`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K€`
  return `${v}€`
}

async function createAccount() {
  if (!newAcc.value.name) return
  creating.value = true
  try {
    await portfolioStore.createAccount(newAcc.value)
    newAcc.value = { name: '', csm: '', arr: 0, health: 70, risk: 'low', contact: '', contact_email: '', notes: '' }
    showAdd.value = false
  } catch (e) {
    console.error('createAccount error:', e)
  }
  creating.value = false
}

async function removeAccount() {
  if (!selectedAccount.value) return
  if (!confirm(t('confirmDelete'))) return
  await portfolioStore.deleteAccount(selectedAccount.value.id)
  selectedAccount.value = null
}

function handleFileImport(e) {
  // File import handling placeholder
  const file = e.target.files[0]
  if (!file) return
  showImport.value = false
  alert('File import processing — connect to your CSV/Excel parser')
}
</script>
