<template>
  <div class="kpis-view">
    <div class="kpis-header">
      <div><h1>📊 {{ t('kpis_title') }}</h1><p class="kpis-sub">{{ t('kpis_subtitle') }}</p></div>
      <button class="btn-primary" @click="openCreate">{{ t('kpis_new') }}</button>
    </div>

    <AiInsightPanel
      module="copil"
      :title="t('ai_copil_title')"
      :button-label="t('ai_copil_btn')"
      :message="t('ai_copil_prompt')"
      :context="{ copils: store.copils?.length || 0 }"
    />

    <!-- COPIL cards -->
    <div v-if="store.copils.length" class="copil-list">
      <div v-for="c in store.copils" :key="c.id" class="copil-card">
        <div class="cc-header">
          <div><strong>{{ c.name }}</strong><span class="cc-period">{{ c.period }}</span></div>
          <div class="cc-actions">
            <button class="rb" @click="openEdit(c)">✏️</button>
            <button class="rb del" @click="store.deleteCopil(c.id)">🗑️</button>
          </div>
        </div>
        <div class="cc-kpis">
          <div v-for="kpi in kpiDefs" :key="kpi.key" class="cc-kpi">
            <span class="cck-label">{{ kpi.label }}</span>
            <div class="cck-row">
              <span class="cck-actual">{{ fmtKpi(c[kpi.key + '_actual'], kpi.suffix) }}</span>
              <span class="cck-target">/ {{ fmtKpi(c[kpi.key + '_target'], kpi.suffix) }}</span>
            </div>
            <div class="cck-bar"><div class="cck-fill" :class="kpiColor(c[kpi.key + '_actual'], c[kpi.key + '_target'], kpi.inverse)" :style="{ width: kpiPct(c[kpi.key + '_actual'], c[kpi.key + '_target']) + '%' }" /></div>
            <span class="cck-delta" :class="deltaClass(c[kpi.key + '_actual'], c[kpi.key + '_target'], kpi.inverse)">
              {{ deltaText(c[kpi.key + '_actual'], c[kpi.key + '_target'], kpi.suffix) }} {{ t('kpis_vs_target') }}
            </span>
          </div>
        </div>
        <div v-if="c.notes" class="cc-notes">{{ c.notes }}</div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="kpis-empty">
      <div class="empty-icon">📊</div>
      <h3>{{ t('kpis_empty_title') }}</h3>
      <p>{{ t('kpis_empty_desc') }}</p>
      <button class="btn-primary" @click="openCreate">{{ t('kpis_create_first') }}</button>
    </div>

    <!-- Slide-over -->
    <SlideOver :open="slideOpen" :title="editId ? t('kpis_title') : t('kpis_create_title')" @close="slideOpen = false" :width="520">
      <form @submit.prevent="save" class="sf">
        <div class="fg"><label>{{ t('kpis_field_name') }} *</label><input v-model="form.name" required class="fi" /></div>
        <div class="fg"><label>{{ t('kpis_field_period') }}</label>
          <select v-model="form.period" class="fi">
            <option v-for="p in periods" :key="p" :value="p">{{ t('kpis_period_' + p.toLowerCase().replace(' ', '')) }}</option>
          </select>
        </div>
        <div class="form-section">KPIs — {{ t('kpis_target') }} / {{ t('kpis_actual') }}</div>
        <div v-for="kpi in kpiDefs" :key="kpi.key" class="kpi-input-row">
          <span class="kir-label">{{ kpi.label }}</span>
          <div class="kir-inputs">
            <div class="kir-group"><label>{{ t('kpis_target') }}</label><input v-model.number="form[kpi.key + '_target']" type="number" step="any" class="fi" /></div>
            <div class="kir-group"><label>{{ t('kpis_actual') }}</label><input v-model.number="form[kpi.key + '_actual']" type="number" step="any" class="fi" /></div>
          </div>
        </div>
        <div class="fg"><label>{{ t('kpis_field_notes') }}</label><textarea v-model="form.notes" class="fi ta" rows="3" /></div>
        <div class="fa">
          <button type="button" class="btn-outline" @click="slideOpen = false">{{ t('cancel') }}</button>
          <button type="submit" class="btn-primary">{{ editId ? t('save') : t('create') }}</button>
        </div>
      </form>
    </SlideOver>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'
import SlideOver from '@/components/SlideOver.vue'
import AiInsightPanel from '@/components/ai/AiInsightPanel.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useKpiStore()

const slideOpen = ref(false)
const editId = ref(null)
const periods = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026']

const kpiDefs = [
  { key: 'nrr', label: 'NRR', suffix: '%', inverse: false },
  { key: 'churn', label: 'Churn', suffix: '%', inverse: true },
  { key: 'mrr', label: 'MRR', suffix: '€', inverse: false },
  { key: 'csat', label: 'CSAT', suffix: '/5', inverse: false },
  { key: 'arr', label: 'ARR', suffix: '€', inverse: false },
  { key: 'nps', label: 'NPS', suffix: '', inverse: false },
]

const initForm = () => ({ name: '', period: 'Q2 2026', notes: '', nrr_target: 110, nrr_actual: 0, churn_target: 5, churn_actual: 0, mrr_target: 50000, mrr_actual: 0, csat_target: 4.5, csat_actual: 0, arr_target: 600000, arr_actual: 0, nps_target: 60, nps_actual: 0 })
const form = reactive(initForm())

function openCreate() { editId.value = null; Object.assign(form, initForm()); slideOpen.value = true }
function openEdit(c) {
  editId.value = c.id
  Object.assign(form, { ...c })
  slideOpen.value = true
}

function save() {
  const data = { ...form }
  if (editId.value) store.updateCopil(editId.value, data)
  else store.addCopil(data)
  slideOpen.value = false
}

function fmtKpi(v, suffix) {
  if (v == null || v === 0) return '—'
  if (suffix === '€') return '€' + (v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v)
  return v + (suffix || '')
}

function kpiPct(actual, target) {
  if (!target || !actual) return 0
  return Math.min(100, Math.round((actual / target) * 100))
}

function kpiColor(actual, target, inverse) {
  if (!actual || !target) return ''
  const ratio = actual / target
  if (inverse) return ratio <= 1 ? 'green' : ratio <= 1.2 ? 'amber' : 'red'
  return ratio >= 0.9 ? 'green' : ratio >= 0.7 ? 'amber' : 'red'
}

function deltaClass(actual, target, inverse) {
  if (!actual || !target) return ''
  const diff = actual - target
  if (inverse) return diff <= 0 ? 'pos' : 'neg'
  return diff >= 0 ? 'pos' : 'neg'
}

function deltaText(actual, target, suffix) {
  if (!actual || !target) return '—'
  const diff = actual - target
  const sign = diff >= 0 ? '+' : ''
  if (suffix === '€') return sign + (diff >= 1e3 ? (diff / 1e3).toFixed(1) + 'K' : diff) + '€'
  return sign + (suffix === '/5' ? diff.toFixed(1) : diff) + (suffix === '%' ? 'pts' : suffix || '')
}
</script>

<style scoped>
.kpis-view { max-width: 1000px; }
.kpis-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.kpis-header h1 { font-size: 1.5rem; font-weight: 800; }
.kpis-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background-color: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

.copil-list { display: flex; flex-direction: column; gap: 20px; }
.copil-card { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; }
.cc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.cc-header strong { font-size: 1.1rem; }
.cc-period { font-size: 0.78rem; color: var(--purple); background: var(--purple-bg); padding: 2px 10px; border-radius: 6px; margin-left: 10px; }
.cc-actions { display: flex; gap: 4px; }
.rb { background: none; border: none; font-size: 0.9rem; padding: 4px; border-radius: 4px; opacity: 0.5; cursor: pointer; transition: all 0.15s; }
.rb:hover { opacity: 1; background: var(--bg-hover); }
.rb.del:hover { background: var(--red-bg); }

.cc-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.cc-kpi { background: var(--bg); border-radius: var(--radius-sm); padding: 14px; }
.cck-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 6px; }
.cck-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
.cck-actual { font-size: 1.3rem; font-weight: 800; }
.cck-target { font-size: 0.78rem; color: var(--text-muted); }
.cck-bar { height: 5px; background: var(--border-light); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.cck-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.cck-fill.green { background: var(--green); }
.cck-fill.amber { background: var(--amber); }
.cck-fill.red { background: var(--red); }
.cck-delta { font-size: 0.7rem; font-weight: 600; }
.cck-delta.pos { color: var(--green); }
.cck-delta.neg { color: var(--red); }

.cc-notes { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-light); font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }

.kpis-empty { text-align: center; padding: 60px 20px; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.kpis-empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.kpis-empty p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; }

.sf { display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background-color: var(--bg-card); width: 100%; }
.fi:focus { border-color: var(--purple); }
.ta { resize: vertical; min-height: 60px; }
.fa { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); }
.form-section { font-size: 0.82rem; font-weight: 700; color: var(--text); padding: 8px 0 0; border-top: 1px solid var(--border-light); }
.kpi-input-row { background: var(--bg); border-radius: var(--radius-sm); padding: 12px; }
.kir-label { font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 8px; }
.kir-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kir-group { display: flex; flex-direction: column; gap: 2px; }
.kir-group label { font-size: 0.68rem; color: var(--text-muted); }

@media (max-width: 768px) { .cc-kpis { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .cc-kpis { grid-template-columns: 1fr; } }
</style>
