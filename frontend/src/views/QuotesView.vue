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

    <!-- Quotes grouped by status -->
    <div v-for="group in groupedQuotes" :key="group.key" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 14px;">{{ group.icon }}</span>
        <span style="font-weight: 800; font-size: 14px;">{{ group.label }}</span>
        <span style="font-size: 12px; color: var(--muted); background: var(--chip-bg); padding: 2px 8px; border-radius: 10px;">{{ group.quotes.length }}</span>
        <div style="flex: 1; height: 1px; background: var(--border); margin-left: 8px;"></div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div v-for="q in group.quotes" :key="q.id" class="card card-lift"
          style="padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;"
          :style="{ borderLeft: '3px solid ' + group.color }"
          @click="editQuote(q)">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
            <div style="min-width: 0;">
              <div style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <span v-if="q.quote_number" style="color: var(--muted); font-weight: 500; font-size: 12px;">{{ q.quote_number }} — </span>{{ q.customer_name || q.client }}
              </div>
              <div style="font-size: 12px; color: var(--muted);">{{ q.title }} · {{ q.issue_date || q.date }}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 14px;">{{ fmtAmount(q.total_ttc || q.amount) }}</div>
              <div v-if="q.tax_amount" style="font-size: 10px; color: var(--muted);">HT {{ fmtAmount(q.subtotal) }}</div>
            </div>
            <button @click.stop="downloadQuote(q)" title="Télécharger" style="background: none; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; padding: 6px 8px; color: var(--muted); font-size: 12px;">⬇</button>
            <button @click.stop="removeQuote(q.id)" title="Supprimer" style="background: none; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; padding: 6px 8px; color: var(--red); font-size: 12px;">🗑</button>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-if="!filteredQuotes.length" icon="document" :title="t('quotesEmpty')" />

    <!-- Storage info -->
    <div style="margin-top: 16px; text-align: center; font-size: 12px; color: var(--muted);">
      {{ quotes.length }} devis enregistrés · Stockage illimité
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
          <button v-for="s in statusOptions" :key="s.key"
            style="padding: 6px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; border: 2px solid transparent;"
            :style="qForm.status === s.key ? { background: s.color, color: '#fff', borderColor: s.color } : { background: 'var(--chip-bg)', color: 'var(--chip-text)', borderColor: 'var(--chip-border)' }"
            @click="qForm.status = s.key">
            {{ s.icon }} {{ s.label }}
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
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'
import { quotesApi, authApi } from '../api'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'
import PlanGate from '../components/PlanGate.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const authStore = useAuthStore()

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
    const [quotesRes, configRes] = await Promise.all([
      quotesApi.list(),
      quotesApi.getConfig(),
    ])
    authApi.getCompany().then(r => { authStore.company = r.data }).catch(() => {})
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

const statusOptions = [
  { key: 'draft', label: 'Brouillon', icon: '✎', color: '#64748b' },
  { key: 'sent', label: 'Envoyé', icon: '→', color: '#3b82f6' },
  { key: 'won', label: 'Gagné', icon: '✓', color: '#16a34a' },
  { key: 'lost', label: 'Perdu', icon: '✗', color: '#dc2626' },
]

const filteredQuotes = computed(() => {
  if (filter.value === 'all') return quotes.value
  return quotes.value.filter(q => q.status === filter.value)
})

const groupedQuotes = computed(() => {
  return statusOptions
    .map(s => ({
      ...s,
      quotes: filteredQuotes.value.filter(q => q.status === s.key),
    }))
    .filter(g => g.quotes.length > 0)
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
  if (map[cur]) return map[cur] + n
  if (cur === 'EUR') return n + '€'
  return n + ' ' + cur
}


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

async function downloadQuote(q) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const cfg = config.value || {}
  const company = authStore.company
  const companyName = company?.legal_name || company?.name || ''
  const label = cfg.country_defaults?.label || 'Devis'
  const cur = cfg.country_defaults?.currency || 'EUR'
  const fmt = (v) => {
    const n = Number(v || 0).toFixed(2)
    const [int, dec] = n.split('.')
    const spacedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    const suffix = cur === 'EUR' ? ' EUR' : ` ${cur}`
    return `${spacedInt},${dec}${suffix}`
  }

  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()

  // --- Header gradient bar ---
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, w, 28, 'F')
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, w * 0.5, 28, 'F')

  // Company name in header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text(companyName || 'Mon entreprise', 14, 16)

  // Quote number + label
  doc.setFontSize(11)
  doc.text(`${label.toUpperCase()} ${q.quote_number || ''}`, w - 14, 12, { align: 'right' })
  doc.setFontSize(9)
  doc.text(`Date: ${q.issue_date || q.date || '-'}  |  Validité: ${q.validity_days || 30} jours`, w - 14, 19, { align: 'right' })

  // --- Status badge ---
  const statusOpt = statusOptions.find(s => s.key === q.status)
  if (statusOpt) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    const badgeText = statusOpt.label.toUpperCase()
    const badgeW = doc.getTextWidth(badgeText) + 10
    const colors = { draft: [100, 116, 139], sent: [59, 130, 246], won: [22, 163, 74], lost: [220, 38, 38] }
    const c = colors[q.status] || colors.draft
    doc.setFillColor(c[0], c[1], c[2])
    doc.roundedRect(w - 14 - badgeW, 22, badgeW, 7, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text(badgeText, w - 14 - badgeW / 2, 27, { align: 'center' })
  }

  // --- Company info under header ---
  let y = 34
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  const companyInfo = [company?.address, company?.postal_code && company?.city ? `${company.postal_code} ${company.city}` : company?.city, company?.vat_number ? `TVA: ${company.vat_number}` : '', company?.registration_number || ''].filter(Boolean).join('  ·  ')
  if (companyInfo) { doc.text(companyInfo, 14, y); y += 6 }
  y = Math.max(y, 42)

  // --- Client block ---
  doc.setTextColor(79, 70, 229)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT', 14, y)
  y += 6
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(q.customer_name || q.client || '-', 14, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (q.customer_address) { doc.text(q.customer_address, 14, y); y += 4 }
  if (q.customer_email) { doc.text(q.customer_email, 14, y); y += 4 }
  if (q.customer_vat) { doc.text(`TVA: ${q.customer_vat}`, 14, y); y += 4 }

  // --- Objet ---
  y += 6
  doc.setTextColor(79, 70, 229)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('OBJET', 14, y)
  y += 6
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(q.title || '-', 14, y)
  y += 10

  // --- Line items table ---
  let items = []
  try {
    const { data } = await quotesApi.getItems(q.id)
    if (data?.length) items = data
  } catch {}

  if (items.length) {
    autoTable(doc, {
      startY: y,
      head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
      body: items.map(i => [
        i.description || '-',
        String(i.quantity || 1),
        fmt(i.unit_price),
        fmt((i.quantity || 1) * (i.unit_price || 0)),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 25 }, 2: { halign: 'right', cellWidth: 35 }, 3: { halign: 'right', cellWidth: 35 } },
    })
    y = doc.lastAutoTable?.finalY || (y + 40) + 8
  } else {
    y += 4
  }

  // --- Totals box ---
  const boxW = 90
  const boxX = w - 14 - boxW
  const boxH = q.discount_pct ? 38 : 30
  doc.setFillColor(245, 243, 255)
  doc.roundedRect(boxX, y - 2, boxW, boxH, 3, 3, 'F')

  const rightEdge = w - 18
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Sous-total HT:', boxX + 4, y + 5)
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.text(fmt(q.subtotal || q.amount || 0), rightEdge, y + 5, { align: 'right' })

  if (q.discount_pct) {
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Remise (${q.discount_pct}%):`, boxX + 4, y + 5)
    doc.setTextColor(220, 38, 38)
    doc.text(`-${fmt((q.subtotal || 0) * q.discount_pct / 100)}`, rightEdge, y + 5, { align: 'right' })
  }

  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`TVA (${q.tax_rate || 0}%):`, boxX + 4, y + 5)
  doc.setTextColor(30, 30, 30)
  doc.text(fmt(q.tax_amount || 0), rightEdge, y + 5, { align: 'right' })

  y += 10
  doc.setFillColor(79, 70, 229)
  doc.roundedRect(boxX, y, boxW, 11, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL TTC:', boxX + 4, y + 8)
  doc.text(fmt(q.total_ttc || q.amount || 0), rightEdge, y + 8, { align: 'right' })

  y += 18

  // --- Payment terms ---
  if (q.payment_terms) {
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CONDITIONS DE PAIEMENT', 14, y)
    y += 5
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.text(q.payment_terms, 14, y)
    y += 8
  }

  // --- Conditions ---
  if (q.conditions) {
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CONDITIONS', 14, y)
    y += 5
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    const condLines = doc.splitTextToSize(q.conditions, w - 28)
    doc.text(condLines, 14, y)
    y += condLines.length * 4 + 6
  }

  // --- Legal mentions (footer) ---
  if (cfg.legal_mentions) {
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    const legalLines = doc.splitTextToSize(cfg.legal_mentions, w - 28)
    doc.text(legalLines, 14, 280)
  }

  // --- Footer line ---
  doc.setDrawColor(79, 70, 229)
  doc.setLineWidth(0.5)
  doc.line(14, 275, w - 14, 275)
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text(`${companyName || ''} — ${new Date().toLocaleDateString('fr-FR')}`, w / 2, 290, { align: 'center' })

  doc.save(`${q.quote_number || 'devis'}.pdf`)
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
