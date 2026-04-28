<template>
  <div class="quotes-view">
    <div class="qt-header">
      <div><h1>📄 {{ t('qt_title') }}</h1><p class="qt-sub">{{ t('qt_subtitle') }}</p></div>
      <div class="qt-actions">
        <button class="btn-outline" @click="configOpen = true">{{ t('qt_config') }}</button>
        <button class="btn-primary" @click="slideOpen = true">{{ t('qt_new') }}</button>
      </div>
    </div>

    <!-- Country banner -->
    <div v-if="billingCountry" class="qt-country-banner">
      <span>{{ laws.flag }} {{ laws.name }}</span>
      <span>{{ t('qt_field_tax') }}: {{ laws.tva }}% ({{ laws.taxName }})</span>
      <span>{{ t('cl_currency') }}: {{ laws.currencySymbol }}</span>
    </div>

    <!-- KPIs -->
    <div class="qt-kpis">
      <div class="qtk"><span class="qtk-val">{{ quotes.length }}</span><span class="qtk-lbl">{{ t('qt_total') }}</span></div>
      <div class="qtk"><span class="qtk-val">{{ conversionRate }}%</span><span class="qtk-lbl">{{ t('qt_conversion') }}</span></div>
      <div class="qtk"><span class="qtk-val green">{{ laws.currencySymbol }}{{ wonAmount.toLocaleString() }}</span><span class="qtk-lbl">{{ t('qt_won') }}</span></div>
    </div>

    <!-- Filters -->
    <div class="qt-filters">
      <button v-for="f in filters" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">{{ t(f.label) }}</button>
    </div>

    <!-- List -->
    <div v-if="filtered.length" class="qt-list">
      <div v-for="q in filtered" :key="q.id" class="qt-card">
        <div class="qtc-left">
          <strong>{{ q.title }}</strong>
          <span class="qtc-client">{{ clientName(q.clientId) }}</span>
          <span class="qtc-company" v-if="q.company">{{ q.company }}</span>
        </div>
        <div class="qtc-right">
          <span class="qtc-amount">{{ laws.currencySymbol }}{{ q.amount.toLocaleString() }}</span>
          <span class="qtc-status" :class="q.status">{{ t('qt_filter_' + q.status) }}</span>
          <button class="btn-pdf" @click="handlePdf(q)" :title="t('qt_download_pdf')">📄</button>
          <button class="btn-delete" @click="deleteQuote(q.id)" :title="t('qt_delete')">🗑</button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="qt-empty">
      <div class="empty-icon">📄</div>
      <h3>{{ t('qt_empty_title') }}</h3>
      <p>{{ t('qt_empty_note') }}</p>
      <button class="btn-primary" @click="slideOpen = true">{{ t('qt_new') }}</button>
    </div>

    <!-- Create Modal -->
    <QuoteCreateModal
      :open="slideOpen"
      :form="form"
      :clients="clients.clients"
      :currency-symbol="laws.currencySymbol"
      :tva="laws.tva"
      @close="slideOpen = false"
      @create="createQuote"
    />

    <!-- Country Config -->
    <QuoteCountryConfig
      :open="configOpen"
      :country="billingCountry"
      :laws="laws"
      :legal-label="legalLabel"
      :countries="countryLaws.allCountries"
      @close="configOpen = false"
      @update:country="billingCountry = $event"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import { useCountryLawStore } from '@/stores/countryLaws'
import QuoteCreateModal from '@/components/quotes/QuoteCreateModal.vue'
import QuoteCountryConfig from '@/components/quotes/QuoteCountryConfig.vue'
import { downloadPdf } from '@/components/quotes/quotePdf.js'
import '@/assets/quotes.css'

const { t } = useI18n({ useScope: 'global' })

function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

const clients = useClientStore()
const countryLaws = useCountryLawStore()
const quotes = ref(load('scalyo_quotes', []))
watch(quotes, val => save('scalyo_quotes', val), { deep: true })

const slideOpen = ref(false)
const configOpen = ref(false)
const activeFilter = ref('all')
const billingCountry = ref(countryLaws.currentCountry)

const laws = computed(() => countryLaws.getLaws(billingCountry.value))
const legalLabel = computed(() => {
  const map = { FR: t('cl_legal_siret'), BE: t('cl_legal_bce'), CH: t('cl_legal_ide'), CA: t('cl_legal_tps'), US: t('cl_legal_ein'), KR: t('cl_legal_krn') }
  return map[billingCountry.value] || t('cl_legal_number')
})

const form = reactive({ title: '', clientId: '', company: '', amount: 0, tax: laws.value.taxRate, status: 'draft', notes: '' })
watch(billingCountry, (country) => { form.tax = countryLaws.getLaws(country).taxRate })

const filters = [
  { key: 'all', label: 'qt_filter_all' }, { key: 'draft', label: 'qt_filter_draft' },
  { key: 'sent', label: 'qt_filter_sent' }, { key: 'won', label: 'qt_filter_won' },
  { key: 'lost', label: 'qt_filter_lost' }
]

const filtered = computed(() => activeFilter.value === 'all' ? quotes.value : quotes.value.filter(q => q.status === activeFilter.value))
const conversionRate = computed(() => { const total = quotes.value.length; return total ? Math.round((quotes.value.filter(q => q.status === 'won').length / total) * 100) : 0 })
const wonAmount = computed(() => quotes.value.filter(q => q.status === 'won').reduce((s, q) => s + q.amount, 0))

function clientName(id) { return clients.clients.find(c => c.id === id)?.name || '—' }

function handlePdf(q) {
  const l = countryLaws.getLaws(q.country || billingCountry.value)
  downloadPdf(q, l, billingCountry.value, t, clientName(q.clientId))
}

function deleteQuote(id) { quotes.value = quotes.value.filter(q => q.id !== id) }

function createQuote() {
  quotes.value.push({
    id: 'q' + Date.now(), ...form, country: billingCountry.value,
    currency: laws.value.currencySymbol, createdAt: new Date().toISOString().slice(0, 10)
  })
  Object.assign(form, { title: '', clientId: '', company: '', amount: 0, tax: laws.value.taxRate, status: 'draft', notes: '' })
  slideOpen.value = false
}
</script>
