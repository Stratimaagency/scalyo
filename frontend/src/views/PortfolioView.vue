<template>
  <div class="fade-in" style="display: flex; height: 100%; overflow: hidden;">
    <!-- Left panel: Account list -->
    <div :style="{ width: selectedAccount ? '340px' : undefined, flex: selectedAccount ? undefined : 1, borderRight: '1px solid var(--border)', overflow: 'auto', padding: '20px 16px', flexShrink: 0, minWidth: '290px' }">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">💼 {{ t('portfolio') }}</h2>
        <div style="display: flex; gap: 6px;">
          <button class="btn-base" @click="showAdd = true"
            style="font-size: 11px; padding: 6px 13px; border-radius: 20px; background: var(--greenBg, var(--tealBg)); border: 1px solid var(--greenBorder, var(--tealBorder)); color: var(--green, var(--teal));">
            + {{ t('add') }}
          </button>
          <button class="btn-base" @click="showImport = true"
            style="font-size: 11px; padding: 6px 13px; border-radius: 20px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal);">
            ⬆ {{ t('importPortfolio') }}
          </button>
        </div>
      </div>

      <!-- Import success message -->
      <div v-if="importMsg" style="margin-bottom: 10px; padding: 9px 12px; background: var(--greenBg, var(--tealBg)); border: 1px solid var(--greenBorder, var(--tealBorder)); border-radius: 9px; font-size: 12px; color: var(--green, var(--teal));">
        {{ importMsg }}
      </div>

      <!-- Search -->
      <input v-model="search" :placeholder="'🔍 ' + t('searchAccount')"
        style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 9px 12px; color: var(--text); font-size: 13px; margin-bottom: 12px;" />

      <!-- Risk filters with counts -->
      <div style="display: flex; gap: 5px; margin-bottom: 14px; flex-wrap: wrap;">
        <button v-for="f in filterOptions" :key="f.value" class="btn-base" @click="filter = f.value"
          :style="{
            fontSize: '11px', padding: '4px 11px', borderRadius: '20px',
            background: filter === f.value ? 'var(--tealBg)' : 'var(--surface)',
            border: '1px solid ' + (filter === f.value ? 'var(--tealBorder)' : 'var(--border)'),
            color: filter === f.value ? 'var(--teal)' : 'var(--muted)'
          }">
          {{ f.label }} <span style="margin-left: 3px; opacity: 0.7;">{{ f.count }}</span>
        </button>
      </div>

      <!-- CSM filter -->
      <div v-if="csmList.length > 1" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; color: var(--muted); font-weight: 700;">{{ t('filterCsm') }}:</span>
        <select v-model="csmFilter" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 5px 10px; color: var(--text); font-size: 12px; cursor: pointer;">
          <option value="">{{ t('allCsm') }}</option>
          <option v-for="csm in csmList" :key="csm" :value="csm">{{ csm }}</option>
        </select>
      </div>

      <!-- Account list -->
      <template v-if="filteredAccounts.length">
        <div v-for="acc in filteredAccounts" :key="acc.id" class="row-item"
          @click="selectedAccount = selectedAccount?.id === acc.id ? null : acc"
          :style="{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 10px', borderRadius: '11px', marginBottom: '4px',
            background: selectedAccount?.id === acc.id ? 'var(--tealBg)' : undefined,
            border: '1px solid ' + (selectedAccount?.id === acc.id ? 'var(--tealBorder)' : 'transparent'),
            cursor: 'pointer', transition: 'all .12s'
          }">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <div style="width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; color: #fff;"
              :style="{ background: riskColor(acc.risk) }">
              {{ (acc.name || '?')[0] }}
            </div>
            <div style="min-width: 0;">
              <div style="font-weight: 700; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ acc.name }}</div>
              <div style="font-size: 11px; color: var(--muted);">{{ acc.csm || t('unassigned') }} · {{ formatMRR(acc.mrr || acc.arr) }}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
            <RiskPill :risk="acc.risk" />
            <div style="font-size: 10px; color: var(--muted);">Score {{ acc.health || 70 }}</div>
          </div>
        </div>
      </template>
      <EmptyState v-else-if="!portfolioStore.loading" icon="📭"
        :title="portfolioStore.accounts.length === 0 ? t('portfolioEmpty') : t('noAccountMatch')"
        :action="'+ ' + t('newAccount')" @action="showAdd = true" />
    </div>

    <!-- Right panel: Account detail -->
    <div v-if="selectedAccount" class="side-panel" style="width: 400px; border-left: 1px solid var(--border); overflow: auto; background: var(--bg1); flex-shrink: 0;">
      <!-- Header -->
      <div style="padding: 16px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; position: sticky; top: 0; background: var(--bg1); z-index: 10;">
        <div style="display: flex; align-items: center; gap: 11px; min-width: 0;">
          <div style="width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; color: #fff;"
            :style="{ background: riskColor(selectedAccount.risk) }">
            {{ (selectedAccount.name || '?')[0] }}
          </div>
          <div style="min-width: 0;">
            <div style="font-weight: 800; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ selectedAccount.name }}</div>
            <div style="font-size: 12px; color: var(--muted);">{{ selectedAccount.industry || '—' }} · {{ selectedAccount.csm || t('unassigned') }}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button @click="detailTab = 'edit'" style="background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; padding: 4px;" :title="t('edit')">✏️</button>
          <button @click="removeAccount" style="background: none; border: none; color: var(--faint); cursor: pointer; font-size: 16px; padding: 4px;" :title="t('delete')">🗑</button>
          <button @click="selectedAccount = null" style="background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
        </div>
      </div>

      <div style="padding: 0 18px;">
        <!-- Tabs -->
        <div class="tab-bar" style="margin: 14px 0;">
          <div v-for="[key, label] in detailTabs" :key="key"
            class="tab-item" :class="{ active: detailTab === key }"
            @click="detailTab = key"
            style="flex: 1; text-align: center; font-size: 12px;">
            {{ label }}
          </div>
        </div>

        <!-- Overview tab -->
        <template v-if="detailTab === 'overview'">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 15px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ formatMRR(selectedAccount.mrr || selectedAccount.arr) }}</div>
              <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">MRR</div>
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 15px; font-weight: 900; font-family: 'JetBrains Mono', monospace;">{{ selectedAccount.health || 70 }}</div>
              <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">Health</div>
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <RiskPill :risk="selectedAccount.risk" />
              <div style="font-size: 10px; color: var(--muted); margin-top: 5px;">Status</div>
            </div>
          </div>

          <!-- Health bar -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 5px;">
              <span>Health Score</span>
              <span style="font-weight: 700; color: var(--text);">{{ selectedAccount.health || 70 }}/100</span>
            </div>
            <HealthBar :val="selectedAccount.health || 70" />
          </div>

          <!-- Renewal -->
          <div style="margin-bottom: 14px; font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; padding: 10px 14px; background: var(--surface); border-radius: 10px;">
            <span>{{ t('renewal') }}</span>
            <span style="font-weight: 700;" :style="{ color: (selectedAccount.renewal || '').includes('−') ? 'var(--red)' : 'var(--green)' }">{{ selectedAccount.renewal || 'N/A' }}</span>
          </div>

          <!-- Issues/alerts -->
          <div v-if="selectedAccount.issues?.length" class="card card-danger" style="margin-bottom: 12px; padding: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: var(--red); margin-bottom: 8px;">⚠ Alert signals</div>
            <div v-for="(issue, i) in selectedAccount.issues" :key="i" style="display: flex; gap: 8px; padding: 5px 0; font-size: 12px; line-height: 1.4;">
              <span style="color: var(--red); flex-shrink: 0;">→</span>
              <span>{{ issue }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedAccount.notes" style="background: var(--surface); border-radius: 12px; padding: 14px; font-size: 13px; color: var(--muted); margin-bottom: 16px;">
            {{ selectedAccount.notes }}
          </div>
        </template>

        <!-- Edit tab -->
        <template v-if="detailTab === 'edit'">
          <div style="padding-top: 4px; padding-bottom: 20px;">
            <AppField :label="t('accNameLabel')" v-model="editForm.name" required />
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <AppField label="CSM" v-model="editForm.csm" />
              <AppField label="MRR" v-model="editForm.arr" type="number" />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <AppField label="Health (0-100)" v-model="editForm.health" type="number" />
              <AppField :label="t('renewal')" v-model="editForm.renewal" />
            </div>
            <AppField label="Contact" v-model="editForm.contact" />
            <AppField label="Email" v-model="editForm.contact_email" type="email" />
            <AppField label="Notes" v-model="editForm.notes" type="textarea" />
            <button class="btn-base" @click="saveEdit" :disabled="!editForm.name || saving"
              style="width: 100%; padding: 11px; border-radius: 12px; font-size: 13px; background: var(--teal); color: #FFFFFF; margin-top: 8px;">
              {{ saving ? t('saving') : t('saveAcc') }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add account modal -->
    <AppModal v-if="showAdd" :title="t('newAccount')" @close="showAdd = false">
      <AppField :label="t('accNameLabel')" v-model="newAcc.name" required />
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <AppField label="CSM" v-model="newAcc.csm" placeholder="CSM name" />
        <AppField label="MRR" v-model="newAcc.arr" type="number" placeholder="0" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <AppField label="Health (0-100)" v-model="newAcc.health" type="number" />
        <AppField :label="t('renewal')" v-model="newAcc.renewal" />
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
      <div class="import-drop-zone" @click="$refs.fileInput.click()">
        <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" style="display: none" @change="handleFileImport" />
        <div style="font-size: 32px; margin-bottom: 12px;">📁</div>
        <div style="font-weight: 700;">Drop your file here or click to browse</div>
        <div style="font-size: 12px; color: var(--muted); margin-top: 6px;">Supported: CSV, Excel (.xlsx, .xls)</div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePortfolioStore } from '../stores/portfolio'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import HealthBar from '../components/HealthBar.vue'
import RiskPill from '../components/RiskPill.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'

const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const { t } = useI18n()

const search = ref('')
const filter = ref('all')
const csmFilter = ref('')
const showAdd = ref(false)
const showImport = ref(false)
const selectedAccount = ref(null)
const detailTab = ref('overview')
const creating = ref(false)
const saving = ref(false)
const editForm = ref({})
const importMsg = ref('')

const newAcc = ref({ name: '', csm: '', arr: 0, health: 70, risk: 'low', contact: '', contact_email: '', notes: '', renewal: '' })

onMounted(() => portfolioStore.fetchAccounts())

// When selecting a new account, populate edit form and reset tab
watch(selectedAccount, (acc) => {
  if (acc) {
    editForm.value = { ...acc }
    detailTab.value = 'overview'
  }
})

const detailTabs = computed(() => [
  ['overview', '📊 ' + (prefsStore.lang === 'en' ? 'Overview' : prefsStore.lang === 'kr' ? '개요' : 'Aperçu')],
  ['edit', '✏️ ' + t('edit')],
])

function riskColor(risk) {
  if (risk === 'critical') return 'var(--red, #EB5757)'
  if (risk === 'medium') return 'var(--amber, #E8A838)'
  return 'var(--teal, #4DB6A0)'
}

const csmList = computed(() => {
  const csms = new Set(portfolioStore.accounts.map(a => a.csm).filter(Boolean))
  return [...csms].sort()
})

const filterCounts = computed(() => ({
  all: portfolioStore.accounts.length,
  critical: portfolioStore.accounts.filter(a => a.risk === 'critical').length,
  medium: portfolioStore.accounts.filter(a => a.risk === 'medium').length,
  low: portfolioStore.accounts.filter(a => a.risk === 'low').length,
}))

const filterOptions = computed(() => [
  { value: 'all', label: t('allAccounts'), count: filterCounts.value.all },
  { value: 'critical', label: t('filterCritical'), count: filterCounts.value.critical },
  { value: 'medium', label: t('filterWatch'), count: filterCounts.value.medium },
  { value: 'low', label: t('filterHealthy'), count: filterCounts.value.low },
])

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

const currencySymbol = computed(() => {
  const c = prefsStore.currency
  if (c === 'USD') return '$'
  if (c === 'GBP') return '£'
  if (c === 'CHF') return 'CHF'
  if (c === 'CAD') return 'CA$'
  return '€'
})

function formatMRR(mrr) {
  const v = parseFloat(mrr) || 0
  const s = currencySymbol.value
  if (v >= 10000) return `${(v / 1000).toFixed(0)}K${s}`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K${s}`
  return `${v}${s}`
}

function formatARR(mrr) {
  const v = parseFloat(mrr) || 0
  const a = v * 12
  const s = currencySymbol.value
  if (a >= 1000000) return `${(a / 1000000).toFixed(1)}M${s}`
  if (a >= 1000) return `${(a / 1000).toFixed(0)}K${s}`
  return `${a}${s}`
}

async function createAccount() {
  if (!newAcc.value.name) return
  creating.value = true
  const h = parseInt(newAcc.value.health) || 70
  await portfolioStore.createAccount({
    ...newAcc.value,
    health: h,
    risk: h >= 70 ? 'low' : h >= 40 ? 'medium' : 'critical',
  })
  newAcc.value = { name: '', csm: '', arr: 0, health: 70, risk: 'low', contact: '', contact_email: '', notes: '', renewal: '' }
  showAdd.value = false
  creating.value = false
}

async function saveEdit() {
  if (!editForm.value.name) return
  saving.value = true
  try {
    const h = parseInt(editForm.value.health) || 70
    const payload = {
      ...editForm.value,
      health: h,
      risk: h >= 70 ? 'low' : h >= 40 ? 'medium' : 'critical',
    }
    const updated = await portfolioStore.updateAccount(selectedAccount.value.id, payload)
    selectedAccount.value = updated
    detailTab.value = 'overview'
  } catch (e) {
    console.error('updateAccount error:', e)
  }
  saving.value = false
}

async function removeAccount() {
  if (!selectedAccount.value) return
  if (!confirm(t('confirmDelete'))) return
  await portfolioStore.deleteAccount(selectedAccount.value.id)
  selectedAccount.value = null
}

async function handleFileImport(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (event) => {
    let total = 0, ok = 0
    try {
      const text = event.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) return
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const accounts = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim())
        const obj = {}
        headers.forEach((h, i) => { obj[h] = vals[i] || '' })
        const h = parseInt(obj.health || 70) || 70
        return {
          name: obj.name || obj.account || '',
          csm: obj.csm || '',
          arr: parseFloat(obj.arr || obj.mrr || 0) || 0,
          health: h,
          risk: h >= 70 ? 'low' : h >= 40 ? 'medium' : 'critical',
          contact: obj.contact || '',
          contact_email: obj.email || obj.contact_email || '',
          notes: obj.notes || '',
          renewal: obj.renewal || '',
        }
      }).filter(a => a.name)
      total = accounts.length
      for (const acc of accounts) {
        try {
          await portfolioStore.createAccount(acc)
          ok++
        } catch {}
      }
    } catch (err) {
      console.error('Import error:', err)
    }
    showImport.value = false
    importMsg.value = `✅ ${ok}/${total} accounts imported`
    setTimeout(() => { importMsg.value = '' }, 5000)
  }
  reader.readAsText(file)
}
</script>
