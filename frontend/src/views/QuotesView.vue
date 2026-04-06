<template>
  <PlanGate requiredPlan="Growth" :moduleName="t('quotesTitle')">
  <div class="fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon">📝</div>
        <div class="page-header__text">
          <h1 class="page-header__title">{{ config?.country_defaults?.label || t('quotesTitle') }}</h1>
          <p class="page-header__subtitle">{{ t('quotesDesc') }}</p>
        </div>
      </div>
      <div class="page-header__actions">
        <button class="btn btn-secondary" @click="showConfig = !showConfig" style="font-size: 12px;">⚙️ Config pays</button>
        <button class="btn btn-primary" @click="openNew">+ {{ config?.country_defaults?.label || t('quotesNew') }}</button>
      </div>
    </div>

    <!-- Country Config Panel -->
    <div v-if="showConfig" class="card" style="padding: 16px; margin-bottom: 16px; border: 2px solid var(--tealBorder);">
      <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 12px;">Configuration par pays</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        <div class="field-group">
          <label class="field-label">Pays</label>
          <select v-model="configForm.country" class="field-input" @change="onCountryChange">
            <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
          </select>
        </div>
        <AppField label="Préfixe numérotation" v-model="configForm.quote_prefix" placeholder="DEV" />
        <AppField label="TVA par défaut (%)" v-model="configForm.default_tax_rate" type="number" />
        <AppField label="Validité (jours)" v-model="configForm.default_validity_days" type="number" />
        <AppField label="Conditions de paiement" v-model="configForm.default_payment_terms" placeholder="Net 30" />
      </div>
      <div class="field-group" style="margin-top: 8px;">
        <label class="field-label">Mentions légales</label>
        <textarea v-model="configForm.legal_mentions" class="field-input" rows="2" placeholder="Ex: TVA non applicable..."></textarea>
      </div>
      <div class="field-group" style="margin-top: 8px;">
        <label class="field-label">Conditions par défaut</label>
        <textarea v-model="configForm.default_conditions" class="field-input" rows="2" placeholder="Conditions générales..."></textarea>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="btn btn-primary" @click="saveConfig">Enregistrer</button>
        <button class="btn btn-secondary" @click="showConfig = false">Fermer</button>
      </div>
    </div>

    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; color: var(--teal)">{{ totalQuotes }}</div>
        <div style="font-size: 11px; color: var(--muted)">{{ t('quotesTotal') }}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; color: var(--green)">{{ conversionRate }}%</div>
        <div style="font-size: 11px; color: var(--muted)">{{ t('quotesConversion') }}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; color: var(--teal)">{{ fmtAmount(totalWon) }}</div>
        <div style="font-size: 11px; color: var(--muted)">{{ t('quotesWonTotal') }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="csm-filter-bar" style="margin-bottom: 14px;">
      <button class="csm-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">{{ t('taskAll') }}</button>
      <button class="csm-chip" :class="{ active: filter === 'draft' }" @click="filter = 'draft'">{{ t('quotesDraft') }}</button>
      <button class="csm-chip" :class="{ active: filter === 'sent' }" @click="filter = 'sent'">{{ t('quotesSent') }}</button>
      <button class="csm-chip" :class="{ active: filter === 'won' }" @click="filter = 'won'">{{ t('quotesWon') }}</button>
      <button class="csm-chip" :class="{ active: filter === 'lost' }" @click="filter = 'lost'">{{ t('quotesLost') }}</button>
    </div>

    <!-- Quotes list -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div v-for="q in filteredQuotes" :key="q.id" class="card card-lift row-item"
        style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;"
        @click="editQuote(q)">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
          <div style="width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;"
            :style="{ background: statusBg(q.status), color: statusColor(q.status) }">
            {{ statusIcon(q.status) }}
          </div>
          <div style="min-width: 0;">
            <div style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span v-if="q.quote_number" style="color: var(--muted); font-weight: 500;">{{ q.quote_number }} — </span>{{ q.customer_name || q.client }}
            </div>
            <div style="font-size: 12px; color: var(--muted);">{{ q.title }} · {{ q.issue_date || q.date }}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 14px;">{{ fmtAmount(q.total_ttc || q.amount) }}</div>
            <div v-if="q.tax_amount" style="font-size: 10px; color: var(--muted);">HT {{ fmtAmount(q.subtotal) }} + TVA {{ fmtAmount(q.tax_amount) }}</div>
          </div>
          <span class="csm-chip" :style="{ background: statusBg(q.status), color: statusColor(q.status), borderColor: statusColor(q.status) }">
            {{ statusLabel(q.status) }}
          </span>
          <button class="btn btn-sm btn-danger" @click.stop="removeQuote(q.id)" style="padding: 6px 10px; font-size: 12px;">
            <ScalyoIcon name="trash" :size="12" />
          </button>
        </div>
      </div>
      <EmptyState v-if="!filteredQuotes.length" icon="document" :title="t('quotesEmpty')" />
    </div>

    <!-- Add/Edit Panel -->
    <div v-if="showForm" class="card" style="padding: 20px; margin-top: 16px; border: 2px solid var(--tealBorder); border-radius: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="font-weight: 800; font-size: 16px; margin: 0;">{{ editingQuote ? 'Modifier' : 'Nouveau' }} {{ config?.country_defaults?.label || 'Devis' }}</h4>
        <button @click="closeForm" style="background: none; border: none; font-size: 18px; cursor: pointer; color: var(--muted);">&#x2715;</button>
      </div>

      <!-- Client info -->
      <h5 style="font-weight: 700; font-size: 13px; color: var(--muted); margin: 0 0 8px; text-transform: uppercase; letter-spacing: .5px;">Client</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <AppField label="Nom / Société *" v-model="qForm.customer_name" placeholder="Nom du client" />
        <AppField label="Email" v-model="qForm.customer_email" placeholder="email@client.com" />
      </div>
      <AppField label="Adresse" v-model="qForm.customer_address" placeholder="Adresse complète" />
      <AppField v-if="needsVat" label="N° TVA / Tax ID" v-model="qForm.customer_vat" :placeholder="vatPlaceholder" />

      <!-- Quote info -->
      <h5 style="font-weight: 700; font-size: 13px; color: var(--muted); margin: 16px 0 8px; text-transform: uppercase; letter-spacing: .5px;">{{ config?.country_defaults?.label || 'Devis' }}</h5>
      <AppField label="Objet" v-model="qForm.title" placeholder="Ex: Prestation de conseil Q2 2026" />
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <AppField label="Date d'émission" v-model="qForm.issue_date" type="date" />
        <AppField label="Validité (jours)" v-model="qForm.validity_days" type="number" />
        <AppField label="Conditions paiement" v-model="qForm.payment_terms" :placeholder="config?.default_payment_terms || 'Net 30'" />
      </div>

      <!-- Line items -->
      <h5 style="font-weight: 700; font-size: 13px; color: var(--muted); margin: 16px 0 8px; text-transform: uppercase; letter-spacing: .5px;">Lignes</h5>
      <div v-for="(item, i) in qForm.items" :key="i" style="display: grid; grid-template-columns: 3fr 1fr 1fr 30px; gap: 8px; margin-bottom: 6px; align-items: end;">
        <AppField label="Description" v-model="item.description" placeholder="Produit ou service" />
        <AppField label="Qté" v-model="item.quantity" type="number" />
        <AppField label="Prix unitaire" v-model="item.unit_price" type="number" />
        <button @click="qForm.items.splice(i, 1)" style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 16px; padding: 8px 0;">✕</button>
      </div>
      <button @click="qForm.items.push({ description: '', quantity: 1, unit_price: 0 })" class="btn btn-secondary" style="font-size: 12px; margin-bottom: 12px;">+ Ajouter une ligne</button>

      <!-- Totals -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <AppField label="Remise (%)" v-model="qForm.discount_pct" type="number" />
        <AppField :label="'TVA (%)'" v-model="qForm.tax_rate" type="number" />
        <div class="field-group">
          <label class="field-label">Total TTC</label>
          <div style="font-size: 22px; font-weight: 900; padding: 6px 0; color: var(--teal);">{{ fmtAmount(computedTotal) }}</div>
        </div>
      </div>

      <!-- Status -->
      <div class="field-group" style="margin-top: 8px;">
        <label class="field-label">Statut</label>
        <div style="display: flex; gap: 6px;">
          <button v-for="s in ['draft', 'sent', 'won', 'lost']" :key="s"
            class="csm-chip" :class="{ active: qForm.status === s }" @click="qForm.status = s">
            {{ statusLabel(s) }}
          </button>
        </div>
      </div>

      <!-- Notes & conditions -->
      <AppField label="Notes" v-model="qForm.notes" placeholder="Notes internes..." />
      <div class="field-group">
        <label class="field-label">Conditions</label>
        <textarea v-model="qForm.conditions" class="field-input" rows="2" placeholder="Conditions de vente..."></textarea>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-primary" style="flex: 1; justify-content: center;" @click="saveQuote" :disabled="!qForm.customer_name?.trim()">
          {{ editingQuote ? t('update') : t('create') }}
        </button>
        <button class="btn btn-secondary" @click="closeForm">{{ t('cancel') }}</button>
      </div>
    </div>
  </div>
  </PlanGate>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import { quotesApi } from '../api'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'
import PlanGate from '../components/PlanGate.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()

const quotes = ref([])
const config = ref(null)
const loading = ref(true)
const filter = ref('all')
const showForm = ref(false)
const showConfig = ref(false)
const editingQuote = ref(null)

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
]

const configForm = reactive({ country: 'FR', quote_prefix: 'DEV', default_tax_rate: 20, default_validity_days: 30, default_payment_terms: 'Net 30', legal_mentions: '', default_conditions: '' })

const emptyForm = () => ({
  title: '', customer_name: '', customer_email: '', customer_address: '', customer_vat: '',
  issue_date: new Date().toISOString().slice(0, 10), validity_days: config.value?.default_validity_days || 30,
  payment_terms: config.value?.default_payment_terms || 'Net 30', tax_rate: config.value?.default_tax_rate || 20,
  discount_pct: 0, status: 'draft', notes: '', conditions: config.value?.default_conditions || '',
  items: [{ description: '', quantity: 1, unit_price: 0 }],
})
const qForm = reactive(emptyForm())

const needsVat = computed(() => ['FR', 'DE', 'ES', 'IT', 'GB', 'BE', 'CH'].includes(config.value?.country))
const vatPlaceholder = computed(() => {
  const map = { FR: 'FR XX XXXXXXXXX', DE: 'DE XXXXXXXXX', ES: 'ESX XXXXXXXX', IT: 'IT XXXXXXXXXXX', GB: 'GB XXX XXXX XX', CH: 'CHE-XXX.XXX.XXX', BE: 'BE XXXX.XXX.XXX' }
  return map[config.value?.country] || 'Tax ID'
})

const computedTotal = computed(() => {
  const sub = qForm.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0), 0)
  const disc = sub * (1 - (parseFloat(qForm.discount_pct) || 0) / 100)
  return disc * (1 + (parseFloat(qForm.tax_rate) || 0) / 100)
})

onMounted(async () => {
  try {
    const [quotesRes, configRes] = await Promise.all([quotesApi.list(), quotesApi.getConfig()])
    quotes.value = quotesRes.data
    config.value = configRes.data
    Object.assign(configForm, {
      country: configRes.data.country || 'FR',
      quote_prefix: configRes.data.quote_prefix || 'DEV',
      default_tax_rate: configRes.data.default_tax_rate || 20,
      default_validity_days: configRes.data.default_validity_days || 30,
      default_payment_terms: configRes.data.default_payment_terms || 'Net 30',
      legal_mentions: configRes.data.legal_mentions || '',
      default_conditions: configRes.data.default_conditions || '',
    })
  } catch { /* empty state */ }
  loading.value = false
})

const filteredQuotes = computed(() => {
  if (filter.value === 'all') return quotes.value
  return quotes.value.filter(q => q.status === filter.value)
})

const totalQuotes = computed(() => quotes.value.length)
const totalWon = computed(() => quotes.value.filter(q => q.status === 'won').reduce((s, q) => s + (parseFloat(q.total_ttc || q.amount) || 0), 0))
const conversionRate = computed(() => {
  const closed = quotes.value.filter(q => q.status === 'won' || q.status === 'lost')
  if (!closed.length) return 0
  return Math.round((quotes.value.filter(q => q.status === 'won').length / closed.length) * 100)
})

function fmtAmount(v) {
  const cur = config.value?.country_defaults?.currency || prefsStore.currency || 'EUR'
  const n = Number(v || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const map = { USD: '$', GBP: '£', CHF: 'CHF ', KRW: '₩' }
  return (map[cur] || '') + n + (cur === 'EUR' ? '€' : '')
}

function statusLabel(s) { return { draft: t('quotesDraft'), sent: t('quotesSent'), won: t('quotesWon'), lost: t('quotesLost') }[s] || s }
function statusColor(s) { return { won: 'var(--green)', lost: 'var(--red)', sent: 'var(--teal)' }[s] || 'var(--muted)' }
function statusBg(s) { return { won: 'var(--greenBg)', lost: 'var(--redBg)', sent: 'var(--tealBg)' }[s] || 'var(--surface)' }
function statusIcon(s) { return { won: '✓', lost: '✗', sent: '→' }[s] || '✎' }

function onCountryChange() {
  const defs = { FR: { tax: 20, prefix: 'DEV' }, DE: { tax: 19, prefix: 'ANG' }, ES: { tax: 21, prefix: 'PRE' }, IT: { tax: 22, prefix: 'PRV' }, GB: { tax: 20, prefix: 'QUO' }, US: { tax: 0, prefix: 'EST' }, CH: { tax: 8.1, prefix: 'DEV' }, BE: { tax: 21, prefix: 'DEV' }, KR: { tax: 10, prefix: 'EST' } }
  const d = defs[configForm.country] || defs.FR
  configForm.default_tax_rate = d.tax
  configForm.quote_prefix = d.prefix
}

async function saveConfig() {
  try {
    const { data } = await quotesApi.updateConfig({ ...configForm })
    config.value = data
    showConfig.value = false
  } catch { /* silent */ }
}

function openNew() {
  editingQuote.value = null
  Object.assign(qForm, emptyForm())
  showForm.value = true
}

function editQuote(q) {
  editingQuote.value = q
  Object.assign(qForm, {
    title: q.title || '', customer_name: q.customer_name || q.client || '',
    customer_email: q.customer_email || '', customer_address: q.customer_address || '',
    customer_vat: q.customer_vat || '', issue_date: q.issue_date || q.date || '',
    validity_days: q.validity_days || 30, payment_terms: q.payment_terms || '',
    tax_rate: q.tax_rate || 0, discount_pct: q.discount_pct || 0,
    status: q.status || 'draft', notes: q.notes || '', conditions: q.conditions || '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  })
  // Load items
  quotesApi.getItems(q.id).then(({ data }) => {
    if (data?.length) qForm.items = data.map(i => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price }))
  }).catch(() => {})
  showForm.value = true
}

async function saveQuote() {
  if (!qForm.customer_name?.trim()) return
  const subtotal = qForm.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0), 0)
  const payload = { ...qForm, subtotal, client: qForm.customer_name }
  try {
    if (editingQuote.value) {
      const { data } = await quotesApi.update(editingQuote.value.id, payload)
      await quotesApi.setItems(editingQuote.value.id, qForm.items)
      const idx = quotes.value.findIndex(q => q.id === editingQuote.value.id)
      if (idx >= 0) quotes.value.splice(idx, 1, data)
    } else {
      const { data } = await quotesApi.create(payload)
      if (qForm.items.length) await quotesApi.setItems(data.id, qForm.items).catch(() => {})
      quotes.value.unshift(data)
    }
  } catch { /* silent */ }
  closeForm()
}

async function removeQuote(id) {
  if (!confirm('Supprimer ce devis ?')) return
  try { await quotesApi.remove(id); quotes.value = quotes.value.filter(q => q.id !== id) } catch {}
}

function closeForm() {
  showForm.value = false
  editingQuote.value = null
  Object.assign(qForm, emptyForm())
}
</script>
