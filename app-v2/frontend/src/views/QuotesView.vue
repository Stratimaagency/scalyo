<template>
  <div class="quotes-view">
    <div class="qt-header">
      <div><h1>📄 {{ t('qt_title') }}</h1><p class="qt-sub">{{ t('qt_subtitle') }}</p></div>
      <div class="qt-actions">
        <button class="btn-outline" @click="configOpen = true">{{ t('qt_config') }}</button>
        <button class="btn-primary" @click="slideOpen = true">{{ t('qt_new') }}</button>
      </div>
    </div>

    <!-- Country config banner -->
    <div v-if="billingCountry" class="qt-country-banner">
      <span>{{ laws.flag }} {{ laws.name }}</span>
      <span>{{ t('qt_field_tax') }}: {{ laws.tva }}% ({{ laws.taxName }})</span>
      <span>{{ t('cl_currency') }}: {{ laws.currencySymbol }}</span>
    </div>

    <div class="qt-kpis">
      <div class="qtk"><span class="qtk-val">{{ quotes.length }}</span><span class="qtk-lbl">{{ t('qt_total') }}</span></div>
      <div class="qtk"><span class="qtk-val">{{ conversionRate }}%</span><span class="qtk-lbl">{{ t('qt_conversion') }}</span></div>
      <div class="qtk"><span class="qtk-val green">{{ laws.currencySymbol }}{{ wonAmount.toLocaleString() }}</span><span class="qtk-lbl">{{ t('qt_won') }}</span></div>
    </div>

    <div class="qt-filters">
      <button v-for="f in filters" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">{{ t(f.label) }}</button>
    </div>

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
              <button class="btn-pdf" @click="downloadPdf(q)" :title="t('qt_download_pdf')">📄</button>
        </div>
      </div>
    </div>

    <div v-else class="qt-empty">
      <div class="empty-icon">📄</div>
      <h3>{{ t('qt_empty_title') }}</h3>
      <p>{{ t('qt_empty_note') }}</p>
      <button class="btn-primary" @click="slideOpen = true">{{ t('qt_new') }}</button>
    </div>

    <!-- Slide-over: Create quote -->
    <SlideOver :open="slideOpen" :title="t('qt_create_title')" @close="slideOpen = false">
      <form @submit.prevent="createQuote" class="sf">
        <div class="fg"><label>{{ t('qt_field_title') }} *</label><input v-model="form.title" required class="fi" /></div>
        <div class="fg"><label>{{ t('qt_field_company') }}</label><input v-model="form.company" class="fi" /></div>
        <div class="fg"><label>{{ t('qt_field_client') }}</label>
          <select v-model="form.clientId" class="fi"><option value="">—</option><option v-for="c in clients.clients" :key="c.id" :value="c.id">{{ c.name }}</option></select>
        </div>
        <div class="fr">
          <div class="fg"><label>{{ t('qt_field_amount') }} ({{ laws.currencySymbol }})</label><input v-model.number="form.amount" type="number" min="0" class="fi" /></div>
          <div class="fg"><label>{{ t('qt_field_tax') }} ({{ laws.tva }}%)</label><input v-model.number="form.tax" type="number" min="0" max="100" class="fi" /></div>
        </div>
        <div class="fg calc-ttc"><span>{{ t('qt_ttc') }}:</span><strong>{{ laws.currencySymbol }}{{ ttc.toLocaleString() }}</strong></div>
        <div class="fg"><label>{{ t('qt_field_status') }}</label>
          <select v-model="form.status" class="fi">
            <option value="draft">{{ t('qt_filter_draft') }}</option>
            <option value="sent">{{ t('qt_filter_sent') }}</option>
            <option value="won">{{ t('qt_filter_won') }}</option>
            <option value="lost">{{ t('qt_filter_lost') }}</option>
          </select>
        </div>
        <div class="fg"><label>{{ t('qt_field_notes') }}</label><textarea v-model="form.notes" class="fi ta" rows="3" /></div>
        <div class="fa">
          <button type="button" class="btn-outline" @click="slideOpen = false">{{ t('cancel') }}</button>
          <button type="submit" class="btn-primary">{{ t('create') }}</button>
        </div>
      </form>
    </SlideOver>

    <!-- Slide-over: Country config -->
    <SlideOver :open="configOpen" :title="t('qt_config')" @close="configOpen = false">
      <div class="sf">
        <div class="fg">
          <label>{{ t('cl_country') }}</label>
          <select v-model="billingCountry" class="fi">
            <option v-for="c in countryLaws.allCountries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
          </select>
        </div>
        <div class="qt-law-info">
          <div class="qli-row"><span>{{ t('cl_tva') }}</span><strong>{{ laws.tva }}% ({{ laws.taxName }})</strong></div>
          <div class="qli-row"><span>{{ t('cl_currency') }}</span><strong>{{ laws.currencySymbol }} ({{ laws.currencyCode }})</strong></div>
          <div class="qli-row"><span>{{ t('cl_legal_number') }}</span><strong>{{ legalLabel }}</strong></div>
        </div>
        <div class="fg"><label>{{ legalLabel }}</label><input v-model="legalNumber" class="fi" :placeholder="laws.legalNumberFormat" /></div>
        <div class="qt-law-mention">
          <strong>⚖️ {{ t('cl_data_law') }}</strong>
          <p>{{ laws.privacy }}</p>
        </div>
      </div>
    </SlideOver>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import { useCountryLawStore } from '@/stores/countryLaws'
import SlideOver from '@/components/SlideOver.vue'
import { jsPDF } from 'jspdf'

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
const legalNumber = ref('')

const laws = computed(() => countryLaws.getLaws(billingCountry.value))
const legalLabel = computed(() => {
  const map = { FR: t('cl_legal_siret'), BE: t('cl_legal_bce'), CH: t('cl_legal_ide'), CA: t('cl_legal_tps'), US: t('cl_legal_ein'), KR: t('cl_legal_krn') }
  return map[billingCountry.value] || t('cl_legal_number')
})

const form = reactive({ title: '', clientId: '', company: '', amount: 0, tax: laws.value.taxRate, status: 'draft', notes: '' })

// Auto-update TVA when country changes
watch(billingCountry, (country) => {
  const l = countryLaws.getLaws(country)
  form.tax = l.taxRate
})

const filters = [
  { key: 'all', label: 'qt_filter_all' },
  { key: 'draft', label: 'qt_filter_draft' },
  { key: 'sent', label: 'qt_filter_sent' },
  { key: 'won', label: 'qt_filter_won' },
  { key: 'lost', label: 'qt_filter_lost' },
]

const filtered = computed(() => activeFilter.value === 'all' ? quotes.value : quotes.value.filter(q => q.status === activeFilter.value))
const conversionRate = computed(() => { const total = quotes.value.length; return total ? Math.round((quotes.value.filter(q => q.status === 'won').length / total) * 100) : 0 })
const wonAmount = computed(() => quotes.value.filter(q => q.status === 'won').reduce((s, q) => s + q.amount, 0))
const ttc = computed(() => Math.round(form.amount * (1 + form.tax / 100)))

function clientName(id) { return clients.clients.find(c => c.id === id)?.name || '—' }

function downloadPdf(q) {
  const doc = new jsPDF()
  const l = countryLaws.getLaws(q.country || billingCountry.value)

  // En-tête entreprise client (marque blanche)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(q.company || clientName(q.clientId) || 'Entreprise', 20, 25)

  // Ligne séparatrice
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 32, 190, 32)

  // Titre devis
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(t('qt_title') + ' — ' + q.id, 20, 45)

  // Date + statut
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(t('qt_create_date') + ' : ' + q.createdAt, 20, 55)
  doc.text(t('qt_field_status') + ' : ' + t('qt_filter_' + q.status), 20, 62)

  // Pays + fiscalité (sans emoji — jsPDF ne supporte pas les emojis)
  doc.text(l.name + ' — ' + l.taxName + ' ' + l.tva + '%', 20, 72)

  // Ligne séparatrice
  doc.line(20, 78, 190, 78)

  // Objet du devis — splitTextToSize pour éviter le débordement
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(t('qt_field_title') + ' :', 20, 88)
  doc.setFont('helvetica', 'normal')
  const titleLines = doc.splitTextToSize(q.title, 170)
  doc.text(titleLines, 20, 96)

  // Montants — toLocaleString('fr-FR') pour format universel stable
  doc.setFontSize(10)
  doc.text(t('qt_field_amount') + ' (HT) : ' + l.currencySymbol + q.amount.toLocaleString('fr-FR'), 20, 110)
  doc.text(t('qt_field_tax') + ' (' + q.tax + '%) : ' + l.currencySymbol + Math.round(q.amount * q.tax / 100).toLocaleString('fr-FR'), 20, 118)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(t('qt_ttc') + ' : ' + l.currencySymbol + Math.round(q.amount * (1 + q.tax / 100)).toLocaleString('fr-FR'), 20, 130)

  // Notes — splitTextToSize pour éviter le débordement
  if (q.notes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.line(20, 138, 190, 138)
    doc.text(t('qt_field_notes') + ' :', 20, 148)
    const noteLines = doc.splitTextToSize(q.notes, 170)
    doc.text(noteLines, 20, 156)
  }

  // Mentions légales pays en pied de page — position dynamique pour éviter le chevauchement
  doc.setFontSize(8)
  doc.setTextColor(150)
  const privacyLines = doc.splitTextToSize(l.privacy, 170)
  doc.text(privacyLines, 20, 268)
  const legalY = 268 + (privacyLines.length * 4)
  const legalLines = doc.splitTextToSize(l.legalMentions, 170)
  doc.text(legalLines, 20, legalY)

  doc.save('devis-' + q.id + '.pdf')
}

function createQuote() {
  quotes.value.push({ id: 'q' + Date.now(), ...form, country: billingCountry.value, currency: laws.value.currencySymbol, createdAt: new Date().toISOString().slice(0, 10) })
  Object.assign(form, { title: '', clientId: '', company: '', amount: 0, tax: laws.value.taxRate, status: 'draft', notes: '' })
  slideOpen.value = false
}
</script>

<style scoped>
.quotes-view { max-width: 900px; }
.qt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.qt-header h1 { font-size: 1.5rem; font-weight: 800; }
.qt-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.qt-actions { display: flex; gap: 8px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

.qt-country-banner { display: flex; gap: 16px; align-items: center; background: var(--purple-bg); border: 1px solid var(--purple-border); border-radius: var(--radius-sm); padding: 10px 16px; margin-bottom: 16px; font-size: 0.82rem; flex-wrap: wrap; }
.qt-country-banner span:first-child { font-weight: 600; }

.qt-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
.qtk { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; text-align: center; transition: all 0.2s; }
.qtk:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.qtk-val { font-size: 1.6rem; font-weight: 800; display: block; }
.qtk-val.green { color: var(--green); }
.qtk-lbl { font-size: 0.72rem; color: var(--text-secondary); }

.qt-filters { display: flex; gap: 4px; margin-bottom: 20px; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.ftab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }

.qt-list { display: flex; flex-direction: column; gap: 8px; }
.qt-card { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; transition: all 0.15s; }
.qt-card:hover { box-shadow: var(--shadow-sm); }
.qtc-left strong { font-size: 0.9rem; display: block; }
.qtc-client { font-size: 0.75rem; color: var(--text-muted); }
.qtc-right { display: flex; align-items: center; gap: 12px; }
.qtc-amount { font-size: 1rem; font-weight: 700; }
.qtc-status { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.qtc-status.draft { background: var(--bg); color: var(--text-muted); }
.qtc-status.sent { background: var(--blue-bg); color: var(--blue); }
.qtc-status.won { background: var(--green-bg); color: var(--green); }
.qtc-status.lost { background: var(--red-bg); color: var(--red); }
.qtc-company { font-size: 0.72rem; color: var(--purple); font-weight: 500; display: block; margin-top: 2px; }
.btn-pdf { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
.btn-pdf:hover { border-color: var(--purple); color: var(--purple); }

.qt-empty { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.qt-empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.qt-empty p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 20px; }

.sf { display: flex; flex-direction: column; gap: 14px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.ta { resize: vertical; }
.fr { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fa { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); }
.calc-ttc { flex-direction: row; justify-content: space-between; align-items: center; padding: 12px; background: var(--purple-bg); border-radius: var(--radius-sm); }
.calc-ttc strong { font-size: 1.1rem; color: var(--purple); }

/* Country config slide-over */
.qt-law-info { background: var(--bg); border-radius: var(--radius-sm); padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.qli-row { display: flex; justify-content: space-between; font-size: 0.82rem; }
.qli-row span { color: var(--text-secondary); }
.qt-law-mention { background: rgba(124,58,237,0.04); border-left: 3px solid var(--purple); border-radius: var(--radius-sm); padding: 12px; }
.qt-law-mention strong { font-size: 0.78rem; display: block; margin-bottom: 4px; }
.qt-law-mention p { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; }

@media (max-width: 768px) { .qt-kpis { grid-template-columns: 1fr; } .fr { grid-template-columns: 1fr; } }
</style>
