<template>
  <div class="fade-in">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
      <div>
        <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('quotesTitle') }}</h3>
        <p style="font-size: 13px; color: var(--muted)">{{ t('quotesDesc') }}</p>
      </div>
      <button class="btn btn-primary" @click="showAdd = true">{{ t('quotesNew') }}</button>
    </div>

    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal)">{{ totalQuotes }}</div>
        <div style="font-size: 11px; color: var(--muted)">{{ t('quotesTotal') }}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--green)">{{ conversionRate }}%</div>
        <div style="font-size: 11px; color: var(--muted)">{{ t('quotesConversion') }}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal)">{{ fmtAmount(totalWon) }}</div>
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
            <div style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ q.title }}</div>
            <div style="font-size: 12px; color: var(--muted);">{{ q.client }} · {{ q.date }}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 14px;">{{ fmtAmount(q.amount) }}</span>
          <span class="csm-chip" :style="{ background: statusBg(q.status), color: statusColor(q.status), borderColor: statusColor(q.status) }">
            {{ statusLabel(q.status) }}
          </span>
          <button class="btn btn-sm btn-secondary" @click.stop="duplicateQuote(q)" :title="t('quotesDuplicate')">
            <ScalyoIcon name="copy" :size="13" />
          </button>
          <button class="btn btn-sm btn-danger" @click.stop="removeQuote(q.id)" :title="t('delete')">
            <ScalyoIcon name="trash" :size="13" />
          </button>
        </div>
      </div>
      <EmptyState v-if="!filteredQuotes.length" icon="document" :title="t('quotesEmpty')" />
    </div>

    <!-- Add/Edit Modal -->
    <AppModal v-if="showAdd || editingQuote" :title="editingQuote ? t('quotesEdit') : t('quotesNew')" @close="closeModal">
      <AppField :label="t('quotesFieldTitle')" v-model="qForm.title" placeholder="Proposition commerciale..." />
      <AppField :label="t('quotesFieldClient')" v-model="qForm.client" placeholder="Nom du client" />
      <AppField :label="t('quotesFieldAmount')" v-model="qForm.amount" type="number" placeholder="0" />
      <div class="field-group">
        <label class="field-label">{{ t('quotesFieldStatus') }}</label>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button v-for="s in ['draft', 'sent', 'won', 'lost']" :key="s"
            class="csm-chip" :class="{ active: qForm.status === s }" @click="qForm.status = s">
            {{ statusLabel(s) }}
          </button>
        </div>
      </div>
      <AppField :label="t('quotesFieldNotes')" v-model="qForm.notes" placeholder="Notes..." />
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-primary" style="flex: 1; justify-content: center;" @click="saveQuote">
          {{ editingQuote ? t('update') : t('create') }}
        </button>
        <button class="btn btn-secondary" @click="closeModal">{{ t('cancel') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import AppField from '../components/AppField.vue'
import AppModal from '../components/AppModal.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()

const quotes = ref(JSON.parse(localStorage.getItem('scalyo_quotes') || '[]'))
const filter = ref('all')
const showAdd = ref(false)
const editingQuote = ref(null)
const qForm = reactive({ title: '', client: '', amount: 0, status: 'draft', notes: '', date: '' })

function persist() {
  localStorage.setItem('scalyo_quotes', JSON.stringify(quotes.value))
}

const filteredQuotes = computed(() => {
  if (filter.value === 'all') return quotes.value
  return quotes.value.filter(q => q.status === filter.value)
})

const totalQuotes = computed(() => quotes.value.length)
const totalWon = computed(() => quotes.value.filter(q => q.status === 'won').reduce((s, q) => s + (parseFloat(q.amount) || 0), 0))
const conversionRate = computed(() => {
  const closed = quotes.value.filter(q => q.status === 'won' || q.status === 'lost')
  if (!closed.length) return 0
  return Math.round((quotes.value.filter(q => q.status === 'won').length / closed.length) * 100)
})

function fmtAmount(v) {
  const c = prefsStore.currency
  const n = Number(v || 0).toLocaleString()
  if (c === 'USD') return `$${n}`
  if (c === 'GBP') return `£${n}`
  if (c === 'CHF') return `CHF ${n}`
  return `${n}€`
}

function statusLabel(s) {
  const map = { draft: t('quotesDraft'), sent: t('quotesSent'), won: t('quotesWon'), lost: t('quotesLost') }
  return map[s] || s
}
function statusColor(s) {
  if (s === 'won') return 'var(--green)'
  if (s === 'lost') return 'var(--red)'
  if (s === 'sent') return 'var(--teal)'
  return 'var(--muted)'
}
function statusBg(s) {
  if (s === 'won') return 'var(--greenBg)'
  if (s === 'lost') return 'var(--redBg)'
  if (s === 'sent') return 'var(--tealBg)'
  return 'var(--surface)'
}
function statusIcon(s) {
  if (s === 'won') return '✓'
  if (s === 'lost') return '✗'
  if (s === 'sent') return '→'
  return '✎'
}

function saveQuote() {
  if (!qForm.title.trim()) return
  if (!qForm.client.trim()) return
  const now = new Date().toISOString().slice(0, 10)
  if (editingQuote.value) {
    const idx = quotes.value.findIndex(q => q.id === editingQuote.value.id)
    if (idx >= 0) {
      quotes.value.splice(idx, 1, { ...quotes.value[idx], ...qForm })
    }
  } else {
    quotes.value.unshift({ id: Date.now(), ...qForm, date: now })
  }
  persist()
  closeModal()
}

function editQuote(q) {
  editingQuote.value = q
  Object.assign(qForm, { title: q.title, client: q.client, amount: q.amount, status: q.status, notes: q.notes || '', date: q.date })
}

function duplicateQuote(q) {
  quotes.value.unshift({ ...q, id: Date.now(), title: q.title + ' (copie)', status: 'draft', date: new Date().toISOString().slice(0, 10) })
  persist()
}

function removeQuote(id) {
  if (!confirm(t('delete') + ' ?')) return
  quotes.value = quotes.value.filter(q => q.id !== id)
  persist()
}

function closeModal() {
  showAdd.value = false
  editingQuote.value = null
  Object.assign(qForm, { title: '', client: '', amount: 0, status: 'draft', notes: '', date: '' })
}
</script>
