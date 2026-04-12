<template>
  <div class="quotes-view">
    <div class="qt-header">
      <div><h1>📄 {{ t('qt_title') }}</h1><p class="qt-sub">{{ t('qt_subtitle') }}</p></div>
      <div class="qt-actions">
        <button class="btn-outline">{{ t('qt_config') }}</button>
        <button class="btn-primary" @click="slideOpen = true">{{ t('qt_new') }}</button>
      </div>
    </div>

    <div class="qt-kpis">
      <div class="qtk"><span class="qtk-val">{{ quotes.length }}</span><span class="qtk-lbl">{{ t('qt_total') }}</span></div>
      <div class="qtk"><span class="qtk-val">{{ conversionRate }}%</span><span class="qtk-lbl">{{ t('qt_conversion') }}</span></div>
      <div class="qtk"><span class="qtk-val green">€{{ wonAmount.toLocaleString() }}</span><span class="qtk-lbl">{{ t('qt_won') }}</span></div>
    </div>

    <div class="qt-filters">
      <button v-for="f in filters" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">{{ t(f.label) }}</button>
    </div>

    <div v-if="filtered.length" class="qt-list">
      <div v-for="q in filtered" :key="q.id" class="qt-card">
        <div class="qtc-left">
          <strong>{{ q.title }}</strong>
          <span class="qtc-client">{{ clientName(q.clientId) }}</span>
        </div>
        <div class="qtc-right">
          <span class="qtc-amount">€{{ q.amount.toLocaleString() }}</span>
          <span class="qtc-status" :class="q.status">{{ t('qt_filter_' + q.status) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="qt-empty">
      <div class="empty-icon">📄</div>
      <h3>{{ t('qt_empty_title') }}</h3>
      <p>{{ t('qt_empty_note') }}</p>
      <button class="btn-primary" @click="slideOpen = true">{{ t('qt_new') }}</button>
    </div>

    <SlideOver :open="slideOpen" :title="t('qt_create_title')" @close="slideOpen = false">
      <form @submit.prevent="createQuote" class="sf">
        <div class="fg"><label>{{ t('qt_field_title') }} *</label><input v-model="form.title" required class="fi" /></div>
        <div class="fg"><label>{{ t('qt_field_client') }}</label>
          <select v-model="form.clientId" class="fi"><option value="">—</option><option v-for="c in clients.clients" :key="c.id" :value="c.id">{{ c.name }}</option></select>
        </div>
        <div class="fr">
          <div class="fg"><label>{{ t('qt_field_amount') }}</label><input v-model.number="form.amount" type="number" min="0" class="fi" /></div>
          <div class="fg"><label>{{ t('qt_field_tax') }}</label><input v-model.number="form.tax" type="number" min="0" max="100" class="fi" /></div>
        </div>
        <div class="fg calc-ttc"><span>{{ t('qt_ttc') }}:</span><strong>€{{ ttc.toLocaleString() }}</strong></div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import SlideOver from '@/components/SlideOver.vue'

const { t } = useI18n({ useScope: 'global' })
const clients = useClientStore()

const quotes = ref([])
const slideOpen = ref(false)
const activeFilter = ref('all')
const form = reactive({ title: '', clientId: '', amount: 0, tax: 20, status: 'draft', notes: '' })

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

function createQuote() {
  quotes.value.push({ id: 'q' + Date.now(), ...form, createdAt: new Date().toISOString().slice(0, 10) })
  Object.assign(form, { title: '', clientId: '', amount: 0, tax: 20, status: 'draft', notes: '' })
  slideOpen.value = false
}
</script>

<style scoped>
.quotes-view { max-width: 900px; }
.qt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.qt-header h1 { font-size: 1.5rem; font-weight: 800; }
.qt-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.qt-actions { display: flex; gap: 8px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; }

.qt-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
.qtk { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; text-align: center; }
.qtk-val { font-size: 1.6rem; font-weight: 800; display: block; }
.qtk-val.green { color: var(--green); }
.qtk-lbl { font-size: 0.72rem; color: var(--text-secondary); }

.qt-filters { display: flex; gap: 4px; margin-bottom: 20px; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); cursor: pointer; }
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

@media (max-width: 768px) { .qt-kpis { grid-template-columns: 1fr; } .fr { grid-template-columns: 1fr; } }
</style>
