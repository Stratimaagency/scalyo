<template>
  <div class="playbooks">
    <!-- HEADER -->
    <div class="pb-header">
      <div>
        <h1>📋 {{ t('pb_title') }}</h1>
        <span class="pb-counter">{{ store.playbooks.length }} Playbooks</span>
      </div>
      <div class="pb-actions">
        <div class="search-box">
          <span>🔍</span>
          <input v-model="search" :placeholder="t('search')" />
        </div>
        <button class="btn-primary" @click="slideTemplate = true">{{ t('pb_add') }}</button>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="pb-filters">
      <button v-for="f in filterTabs" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">
        {{ t(f.label) }} <span class="fc">{{ f.count }}</span>
      </button>
    </div>

    <!-- KPI CARDS -->
    <div class="pb-kpis">
      <div class="pkpi"><span class="pkpi-icon">▶️</span><div><span class="pkpi-val">{{ store.activePlaybooks.length }}</span><span class="pkpi-lbl">{{ t('pb_kpi_active') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">✅</span><div><span class="pkpi-val">{{ store.doneThisMonth }}</span><span class="pkpi-lbl">{{ t('pb_kpi_done_month') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">⏱️</span><div><span class="pkpi-val">{{ store.avgDuration || '—' }} <small v-if="store.avgDuration">{{ t('pb_days') }}</small></span><span class="pkpi-lbl">{{ t('pb_kpi_avg_duration') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">🎯</span><div><span class="pkpi-val">{{ store.successRate }}%</span><span class="pkpi-lbl">{{ t('pb_kpi_success') }}</span></div></div>
    </div>

    <!-- PLAYBOOKS LIST -->
    <div v-if="filteredPlaybooks.length" class="pb-list">
      <div v-for="pb in filteredPlaybooks" :key="pb.id" class="pb-card" @click="openDetail(pb)">
        <div class="pbc-header">
          <div class="pbc-left">
            <span class="pbc-icon" :style="{ background: pb.color + '15', color: pb.color }">{{ pb.icon }}</span>
            <div>
              <strong>{{ t('pb_template_' + pb.templateKey) }}</strong>
              <span class="pbc-client" v-if="pb.clientId">{{ clientName(pb.clientId) }}</span>
            </div>
          </div>
          <span class="pbc-status" :class="pb.status">{{ t('pb_status_' + pb.status) }}</span>
        </div>

        <!-- Progress bar -->
        <div class="pbc-progress">
          <div class="pbc-progress-header">
            <span>{{ t('pb_progress') }}</span>
            <span class="pbc-pct">{{ progressPct(pb) }}%</span>
          </div>
          <div class="pbc-bar"><div class="pbc-fill" :style="{ width: progressPct(pb) + '%', background: pb.color }" /></div>
        </div>

        <!-- Steps preview -->
        <div class="pbc-steps">
          <div v-for="step in pb.steps" :key="step.id" class="pbc-step" :class="{ done: step.done }">
            <span class="step-check" @click.stop="store.toggleStep(pb.id, step.id)">{{ step.done ? '✅' : '⬜' }}</span>
            <span class="step-title">{{ step.title }}</span>
          </div>
        </div>

        <div class="pbc-footer">
          <span class="pbc-date">{{ t('pb_started') }} {{ fmtDate(pb.startedAt) }}</span>
          <div class="pbc-btns">
            <button v-if="pb.status === 'active'" class="btn-sm green" @click.stop="store.completePlaybook(pb.id)">{{ t('pb_complete') }}</button>
            <button class="btn-sm red" @click.stop="store.deletePlaybook(pb.id)">{{ t('pb_delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="pb-empty">
      <div class="empty-icon">📋</div>
      <h3>{{ t('pb_empty_title') }}</h3>
      <p>{{ t('pb_empty_desc') }}</p>
      <button class="btn-primary" @click="slideTemplate = true">{{ t('pb_activate') }}</button>
    </div>

    <!-- SLIDE-OVER: Templates -->
    <SlideOver :open="slideTemplate" :title="t('pb_templates_title')" @close="slideTemplate = false" :width="520">
      <div class="tpl-list">
        <div v-for="tpl in store.templates" :key="tpl.id" class="tpl-card">
          <div class="tpl-header">
            <span class="tpl-icon" :style="{ background: tpl.color + '15', color: tpl.color }">{{ tpl.icon }}</span>
            <div class="tpl-info">
              <strong>{{ t('pb_template_' + tpl.key) }}</strong>
              <p>{{ t('pb_template_' + tpl.key + '_desc') }}</p>
            </div>
          </div>
          <div class="tpl-meta">
            <span>{{ tpl.steps.length }} {{ t('pb_steps') }}</span>
            <span>~{{ tpl.avgDays }} {{ t('pb_avg_days') }}</span>
          </div>
          <button class="btn-outline tpl-use" @click="selectTemplate(tpl)">{{ t('pb_use_template') }}</button>
        </div>
      </div>
    </SlideOver>

    <!-- SLIDE-OVER: Activate -->
    <SlideOver :open="slideActivate" :title="activatingTpl ? t('pb_template_' + activatingTpl.key) : ''" @close="slideActivate = false">
      <form @submit.prevent="doActivate" class="sf" v-if="activatingTpl">
        <div class="tpl-preview">
          <span class="tpl-icon-lg" :style="{ background: activatingTpl.color + '15', color: activatingTpl.color }">{{ activatingTpl.icon }}</span>
          <p>{{ t('pb_template_' + activatingTpl.key + '_desc') }}</p>
        </div>

        <div class="tpl-steps-preview">
          <div v-for="(s, i) in activatingTpl.steps" :key="i" class="tsp-step">
            <span class="tsp-num">{{ i + 1 }}</span>
            <span>{{ s }}</span>
          </div>
        </div>

        <div class="fg">
          <label>{{ t('pb_select_client') }} *</label>
          <select v-model="activateForm.clientId" required class="fi">
            <option value="" disabled>—</option>
            <option v-for="c in clients.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="fg">
          <label>{{ t('pb_select_csm') }}</label>
          <select v-model="activateForm.csmId" class="fi">
            <option v-for="m in team.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>

        <div class="fa">
          <button type="button" class="btn-outline" @click="slideActivate = false">{{ t('cancel') }}</button>
          <button type="submit" class="btn-primary">{{ t('pb_start') }}</button>
        </div>
      </form>
    </SlideOver>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlaybookStore } from '@/stores/playbooks'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import SlideOver from '@/components/SlideOver.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const store = usePlaybookStore()
const clients = useClientStore()
const team = useTeamStore()

const search = ref('')
const activeFilter = ref('all')
const slideTemplate = ref(false)
const slideActivate = ref(false)
const activatingTpl = ref(null)
const activateForm = reactive({ clientId: '', csmId: 'tm1' })

const filterTabs = computed(() => [
  { key: 'all', label: 'pb_filter_all', count: store.playbooks.length },
  { key: 'active', label: 'pb_filter_active', count: store.activePlaybooks.length },
  { key: 'done', label: 'pb_filter_done', count: store.donePlaybooks.length },
])

const filteredPlaybooks = computed(() => {
  let list = store.playbooks
  if (activeFilter.value === 'active') list = list.filter(p => p.status === 'active')
  else if (activeFilter.value === 'done') list = list.filter(p => p.status === 'done')
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => {
      const name = t('pb_template_' + p.templateKey).toLowerCase()
      const client = clientName(p.clientId).toLowerCase()
      return name.includes(q) || client.includes(q)
    })
  }
  return list
})

function clientName(id) { return clients.clients.find(c => c.id === id)?.name || '' }

function progressPct(pb) {
  if (!pb.steps.length) return 0
  return Math.round((pb.steps.filter(s => s.done).length / pb.steps.length) * 100)
}

function fmtDate(d) {
  if (!d) return '—'
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(d).toLocaleDateString(loc, { day: 'numeric', month: 'short' })
}

function selectTemplate(tpl) {
  activatingTpl.value = tpl
  activateForm.clientId = ''
  activateForm.csmId = 'tm1'
  slideTemplate.value = false
  slideActivate.value = true
}

function doActivate() {
  if (!activateForm.clientId) return
  store.activateTemplate(activatingTpl.value.id, activateForm.clientId, activateForm.csmId)
  slideActivate.value = false
  activatingTpl.value = null
}

function openDetail(pb) {
  // Scroll into expanded view — already shown inline
}
</script>

<style scoped>
.playbooks { max-width: 1000px; }

.pb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.pb-header h1 { font-size: 1.5rem; font-weight: 800; }
.pb-counter { font-size: 0.82rem; color: var(--text-muted); margin-left: 8px; }
.pb-actions { display: flex; gap: 8px; align-items: center; }
.search-box { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0 10px; }
.search-box input { border: none; outline: none; padding: 8px 0; font-size: 0.82rem; width: 150px; background: transparent; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; transition: all 0.2s; cursor: pointer; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; transition: all 0.2s; cursor: pointer; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

.pb-filters { display: flex; gap: 4px; margin-bottom: 20px; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); transition: all 0.15s; cursor: pointer; }
.ftab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.fc { font-size: 0.68rem; margin-left: 4px; background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px; }
.ftab.active .fc { background: rgba(124,58,237,0.12); }

/* KPIs */
.pb-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.pkpi { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
.pkpi:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.pkpi-icon { font-size: 1.3rem; }
.pkpi-val { font-size: 1.3rem; font-weight: 800; display: block; }
.pkpi-val small { font-size: 0.72rem; font-weight: 500; color: var(--text-muted); }
.pkpi-lbl { font-size: 0.72rem; color: var(--text-secondary); }

/* Playbook cards */
.pb-list { display: flex; flex-direction: column; gap: 14px; }
.pb-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; transition: all 0.2s; cursor: pointer; }
.pb-card:hover { box-shadow: var(--shadow-sm); }

.pbc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.pbc-left { display: flex; align-items: center; gap: 12px; }
.pbc-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.pbc-left strong { font-size: 0.92rem; display: block; }
.pbc-client { font-size: 0.75rem; color: var(--purple); background: var(--purple-bg); padding: 1px 8px; border-radius: 4px; display: inline-block; margin-top: 2px; }
.pbc-status { font-size: 0.72rem; font-weight: 600; padding: 4px 12px; border-radius: 6px; }
.pbc-status.active { background: var(--blue-bg); color: var(--blue); }
.pbc-status.done { background: var(--green-bg); color: var(--green); }

.pbc-progress { margin-bottom: 14px; }
.pbc-progress-header { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
.pbc-pct { font-weight: 600; color: var(--text); }
.pbc-bar { height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.pbc-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

.pbc-steps { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.pbc-step { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; font-size: 0.82rem; transition: background 0.15s; }
.pbc-step:hover { background: var(--bg-hover); }
.pbc-step.done .step-title { text-decoration: line-through; color: var(--text-muted); }
.step-check { cursor: pointer; font-size: 0.9rem; }
.step-title { flex: 1; }

.pbc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-light); }
.pbc-date { font-size: 0.72rem; color: var(--text-muted); }
.pbc-btns { display: flex; gap: 6px; }
.btn-sm { border: none; padding: 5px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-sm.green { background: var(--green-bg); color: var(--green); }
.btn-sm.green:hover { background: var(--green); color: #fff; }
.btn-sm.red { background: var(--red-bg); color: var(--red); }
.btn-sm.red:hover { background: var(--red); color: #fff; }

/* Empty */
.pb-empty { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.pb-empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.pb-empty p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto; }

/* Templates slide-over */
.tpl-list { display: flex; flex-direction: column; gap: 14px; }
.tpl-card { border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; transition: all 0.2s; }
.tpl-card:hover { border-color: var(--border); box-shadow: var(--shadow-sm); }
.tpl-header { display: flex; gap: 12px; margin-bottom: 10px; }
.tpl-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.tpl-info strong { font-size: 0.9rem; display: block; margin-bottom: 4px; }
.tpl-info p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; }
.tpl-meta { display: flex; gap: 16px; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 10px; }
.tpl-use { width: 100%; text-align: center; padding: 8px; font-size: 0.82rem; }

/* Activate slide-over */
.sf { display: flex; flex-direction: column; gap: 16px; }
.tpl-preview { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--bg); border-radius: var(--radius-md); }
.tpl-icon-lg { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.tpl-preview p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }
.tpl-steps-preview { display: flex; flex-direction: column; gap: 6px; }
.tsp-step { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; padding: 8px; background: var(--bg); border-radius: 6px; }
.tsp-num { width: 22px; height: 22px; border-radius: 50%; background: var(--purple-bg); color: var(--purple); font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.fa { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); }

@media (max-width: 768px) {
  .pb-kpis { grid-template-columns: repeat(2, 1fr); }
  .pb-actions { width: 100%; }
  .search-box { flex: 1; }
  .search-box input { width: 100%; }
}
@media (max-width: 480px) { .pb-kpis { grid-template-columns: 1fr; } }
</style>
