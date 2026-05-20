<template>
  <div class="kn">
    <div class="kn-header">
      <router-link to="/app/kpis" class="kn-back">← {{ t('back') }}</router-link>
      <h1>{{ t('copil_new') }}</h1>
    </div>

    <!-- Stepper -->
    <div class="kn-stepper">
      <div v-for="(s, i) in stepLabels" :key="i" class="kn-step" :class="{ active: step === i, done: step > i }">
        <div class="kns-dot">{{ step > i ? '✓' : i + 1 }}</div>
        <span>{{ t(s) }}</span>
      </div>
    </div>

    <!-- Step 1: Identity -->
    <div v-if="step === 0" class="kn-panel">
      <h2>{{ t('copil_wiz_step1') }}</h2>
      <div class="fg"><label>{{ t('copil_wiz_name') }} *</label><input v-model="form.name" class="fi" :placeholder="t('copil_wiz_name_ph')" /></div>
      <div class="fg"><label>{{ t('copil_wiz_period') }}</label>
        <div class="period-pills">
          <button v-for="p in periods" :key="p.key" type="button" class="pill" :class="{ active: form.periodType === p.key }" @click="form.periodType = p.key">{{ t(p.label) }}</button>
        </div>
        <select v-if="form.periodType !== 'custom'" v-model="form.period" class="fi period-sel">
          <option v-for="q in quarterOptions" :key="q" :value="q">{{ q }}</option>
        </select>
        <div v-else class="fr"><input v-model="form.periodStart" type="date" class="fi" /><input v-model="form.periodEnd" type="date" class="fi" /></div>
      </div>
      <div class="fg"><label>{{ t('copil_wiz_color') }}</label>
        <div class="color-row"><button v-for="c in colors" :key="c" type="button" class="cpick" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c" /></div>
      </div>
      <div class="fg"><label>{{ t('copil_wiz_participants') }}</label>
        <div class="part-list">
          <label v-for="m in team.members" :key="m.id" class="part-check">
            <input type="checkbox" :value="m.id" v-model="form.participants" /> {{ m.name }} <span class="part-role">{{ m.role }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Step 2: KPI Selection -->
    <div v-if="step === 1" class="kn-panel">
      <h2>{{ t('copil_wiz_select_kpis') }}</h2>
      <div class="kpi-catalog">
        <div v-for="cat in categories" :key="cat.key" class="kcat">
          <h3 class="kcat-title" @click="catOpen[cat.key] = !catOpen[cat.key]">
            <span class="kcat-chev">{{ catOpen[cat.key] ? '▾' : '▸' }}</span>
            {{ cat.icon }} {{ t(cat.label) }}
            <span class="kcat-count">{{ catKpis(cat.key).length }}</span>
          </h3>
          <div v-if="catOpen[cat.key]" class="kcat-items">
            <label v-for="kpi in catKpis(cat.key)" :key="kpi.id" class="kpi-item" :class="{ selected: isSelected(kpi.id), recommended: kpi.recommended }">
              <input type="checkbox" :checked="isSelected(kpi.id)" @change="toggleKpi(kpi)" />
              <span class="ki-name">{{ kpi.name }}</span>
              <span v-if="kpi.recommended" class="ki-rec">★</span>
              <span class="ki-unit">{{ kpi.unit }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="kn-selected-count">{{ form.kpis.length }} KPIs {{ t('active') }}</div>
    </div>

    <!-- Step 3: Data -->
    <div v-if="step === 2" class="kn-panel">
      <h2>{{ t('copil_wiz_step3') }}</h2>
      <div v-for="kpi in form.kpis" :key="kpi.kpiId" class="kpi-data-card">
        <div class="kdc-header"><strong>{{ kpi.name }}</strong><span class="kdc-unit">{{ kpi.unit }}</span></div>
        <div class="fr">
          <div class="fg"><label>{{ t('copil_wiz_current') }}</label><input v-model.number="kpi.value" type="number" step="any" class="fi" /></div>
          <div class="fg"><label>{{ t('copil_wiz_target') }}</label><input v-model.number="kpi.target" type="number" step="any" class="fi" /></div>
        </div>
        <div class="fg"><label>{{ t('copil_wiz_prev') }}</label><input v-model.number="kpi.prevValue" type="number" step="any" class="fi" /></div>
      </div>
      <div v-if="!form.kpis.length" class="kn-empty-kpis">{{ t('copil_wiz_select_kpis') }}</div>
    </div>

    <!-- Step 4: Layout -->
    <div v-if="step === 3" class="kn-panel">
      <h2>{{ t('copil_wiz_layout') }}</h2>
      <div class="layout-options">
        <button v-for="lo in layouts" :key="lo.key" class="lo-card" :class="{ active: form.layout === lo.key }" @click="form.layout = lo.key">
          <span class="lo-icon">{{ lo.icon }}</span>
          <strong>{{ t(lo.label) }}</strong>
        </button>
      </div>
    </div>

    <!-- Step 5: Finish -->
    <div v-if="step === 4" class="kn-panel">
      <h2>{{ t('copil_wiz_finish') }}</h2>
      <div class="fg"><label>{{ t('copil_wiz_subtitle') }}</label><input v-model="form.subtitle" class="fi" /></div>
      <div class="fg"><label>{{ t('copil_wiz_narrative') }}</label><textarea v-model="form.narrative" class="fi ta" rows="4" /></div>
      <div class="kn-summary">
        <div class="ks-row"><span>{{ t('copil_wiz_name') }}</span><strong>{{ form.name }}</strong></div>
        <div class="ks-row"><span>{{ t('copil_wiz_period') }}</span><strong>{{ form.period || form.periodStart + ' → ' + form.periodEnd }}</strong></div>
        <div class="ks-row"><span>KPIs</span><strong>{{ form.kpis.length }}</strong></div>
        <div class="ks-row"><span>{{ t('copil_wiz_layout') }}</span><strong>{{ form.layout }}</strong></div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="kn-nav">
      <button v-if="step > 0" class="btn-outline" @click="step--">{{ t('back') }}</button>
      <div style="flex:1" />
      <button v-if="step < 4" class="btn-primary" @click="step++" :disabled="!canNext">{{ t('integ_next') }}</button>
      <button v-else class="btn-gradient" @click="generate" :disabled="!form.name">{{ t('copil_wiz_generate') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'
import { KPI_CATALOG } from '@/data/kpiCatalog'
import { useTeamStore } from '@/stores/team'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const store = useKpiStore()
const team = useTeamStore()

const step = ref(0)
const stepLabels = ['copil_wiz_step1', 'copil_wiz_step2', 'copil_wiz_step3', 'copil_wiz_step4', 'copil_wiz_step5']
const colors = ['#7c3aed', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#1e293b']
const catOpen = reactive({ revenue: true, retention: true, health: true, expansion: false, activation: false, team: false, engagement: false })

const periods = [
  { key: 'monthly', label: 'copil_wiz_monthly' },
  { key: 'quarterly', label: 'copil_wiz_quarterly' },
  { key: 'yearly', label: 'copil_wiz_yearly' },
  { key: 'custom', label: 'copil_wiz_custom' },
]
const quarterOptions = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027']
const layouts = [
  { key: 'executive', icon: '👔', label: 'copil_wiz_layout_exec' },
  { key: 'operational', icon: '⚙️', label: 'copil_wiz_layout_ops' },
  { key: 'growth', icon: '🚀', label: 'copil_wiz_layout_growth' },
  { key: 'retention', icon: '🛡️', label: 'copil_wiz_layout_retention' },
]
const categories = [
  { key: 'revenue', icon: '📈', label: 'copil_cat_revenue' },
  { key: 'retention', icon: '🎯', label: 'copil_cat_retention' },
  { key: 'health', icon: '💚', label: 'copil_cat_health' },
  { key: 'expansion', icon: '🚀', label: 'copil_cat_expansion' },
  { key: 'activation', icon: '⚡', label: 'copil_cat_activation' },
  { key: 'team', icon: '👥', label: 'copil_cat_team' },
  { key: 'engagement', icon: '📞', label: 'copil_cat_engagement' },
]

const form = reactive({
  name: '', periodType: 'quarterly', period: 'Q2 2026', periodStart: '', periodEnd: '',
  color: '#7c3aed', participants: [], subtitle: '', narrative: '', layout: 'executive', kpis: [],
})

function catKpis(cat) { return KPI_CATALOG.filter(k => k.cat === cat) }
function isSelected(id) { return form.kpis.some(k => k.kpiId === id) }
function toggleKpi(kpi) {
  const idx = form.kpis.findIndex(k => k.kpiId === kpi.id)
  if (idx >= 0) form.kpis.splice(idx, 1)
  else form.kpis.push({ kpiId: kpi.id, name: kpi.name, unit: kpi.unit, format: kpi.format, inverse: kpi.inverse, value: 0, target: 0, prevValue: 0 })
}
const canNext = computed(() => {
  if (step.value === 0) return form.name.trim().length > 0
  if (step.value === 1) return form.kpis.length > 0
  return true
})
function generate() {
  const period = form.periodType === 'custom'
    ? `${form.periodStart} → ${form.periodEnd}`
    : form.period

  const id = store.createCopil({
    title: form.name,
    subtitle: form.subtitle || '',
    period,
    color: form.color,
    clientName: '',
    presenter: '',
  })

  router.push('/app/kpis/' + id)
}
</script>

<style scoped>
.kn { max-width: 720px; margin: 0 auto; }
.kn-header { margin-bottom: 24px; }
.kn-back { font-size: 0.82rem; color: var(--text-muted); display: block; margin-bottom: 8px; }
.kn-back:hover { color: var(--purple); }
.kn-header h1 { font-size: 1.5rem; font-weight: 800; }

.kn-stepper { display: flex; margin-bottom: 32px; }
.kn-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; }
.kn-step::after { content: ''; position: absolute; top: 14px; left: 55%; right: -45%; height: 2px; background: var(--border-light); z-index: 0; }
.kn-step:last-child::after { display: none; }
.kn-step.done::after { background: var(--green); }
.kns-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); z-index: 1; }
.kn-step.active .kns-dot { border-color: var(--purple); color: var(--purple); background: var(--purple-bg); }
.kn-step.done .kns-dot { border-color: var(--green); color: #fff; background: var(--green); }
.kn-step span { font-size: 0.68rem; color: var(--text-muted); }
.kn-step.active span { color: var(--purple); font-weight: 600; }

.kn-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 28px; margin-bottom: 20px; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.kn-panel h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }

.fg { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: var(--bg-card); width: 100%; }
.fi:focus { border-color: var(--purple); }
.ta { resize: vertical; }
.fr { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.period-pills { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.pill { background: var(--bg); border: 1px solid var(--border); padding: 7px 16px; border-radius: 999px; font-size: 0.82rem; cursor: pointer; }
.pill.active { background: var(--purple); color: #fff; border-color: var(--purple); }
.period-sel { max-width: 200px; }

.color-row { display: flex; gap: 8px; }
.cpick { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.cpick.active { border-color: var(--text); transform: scale(1.15); }

.part-list { display: flex; flex-direction: column; gap: 6px; }
.part-check { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.85rem; }
.part-check input { accent-color: var(--purple); }
.part-role { font-size: 0.72rem; color: var(--text-muted); margin-left: auto; }

.kpi-catalog { display: flex; flex-direction: column; gap: 6px; max-height: 50vh; overflow-y: auto; }
.kcat { background: var(--bg); border-radius: var(--radius-sm); }
.kcat-title { display: flex; align-items: center; gap: 8px; padding: 10px 14px; font-size: 0.88rem; font-weight: 700; cursor: pointer; margin: 0; }
.kcat-title:hover { background: var(--bg-hover); }
.kcat-chev { font-size: 0.7rem; color: var(--text-muted); width: 14px; }
.kcat-count { font-size: 0.68rem; color: var(--text-muted); background: var(--bg-card); padding: 1px 8px; border-radius: 4px; margin-left: auto; }
.kcat-items { padding: 0 8px 8px; display: flex; flex-direction: column; gap: 2px; }
.kpi-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; font-size: 0.82rem; cursor: pointer; background: var(--bg-card); border: 1px solid transparent; }
.kpi-item:hover { background: var(--purple-bg); }
.kpi-item.selected { background: var(--purple-bg); border-color: var(--purple-border); }
.kpi-item.recommended { border-left: 3px solid var(--purple); }
.kpi-item input { accent-color: var(--purple); }
.ki-name { flex: 1; }
.ki-rec { color: var(--purple); font-size: 0.7rem; }
.ki-unit { font-size: 0.7rem; color: var(--text-muted); min-width: 30px; text-align: right; }
.kn-selected-count { text-align: center; font-size: 0.82rem; color: var(--purple); font-weight: 600; margin-top: 12px; }
.kn-empty-kpis { text-align: center; padding: 24px; color: var(--text-muted); }

.kpi-data-card { background: var(--bg); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; }
.kdc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.kdc-unit { font-size: 0.72rem; color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 4px; }

.layout-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.lo-card { background: var(--bg); border: 2px solid var(--border); border-radius: var(--radius-md); padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
.lo-card:hover { border-color: var(--purple); }
.lo-card.active { border-color: var(--purple); background: var(--purple-bg); }
.lo-icon { font-size: 2rem; display: block; margin-bottom: 8px; }

.kn-summary { background: var(--bg); border-radius: var(--radius-sm); padding: 16px; margin-top: 16px; }
.ks-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; border-bottom: 1px solid var(--border-light); }
.ks-row:last-child { border-bottom: none; }
.ks-row span { color: var(--text-secondary); }

.kn-nav { display: flex; gap: 10px; align-items: center; }
.btn-outline { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:disabled, .btn-gradient:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-gradient { padding: 12px 28px; border-radius: 12px; font-size: 0.9rem; font-weight: 700; color: #fff; background: linear-gradient(135deg, #7c3aed, #3b82f6); border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,0.3); background-size: 200% 200%; animation: gs 3s ease infinite; }
@keyframes gs { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

@media (max-width: 600px) { .layout-options { grid-template-columns: 1fr; } .fr { grid-template-columns: 1fr; } .kn-stepper { overflow-x: auto; } }
</style>
