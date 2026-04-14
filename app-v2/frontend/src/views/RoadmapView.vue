<template>
  <div class="roadmap-view">
    <!-- Header -->
    <div class="rm-header">
      <div>
        <h1>🗺️ {{ t('rm_title') }}</h1>
        <p class="rm-sub">{{ t('rm_subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="openCreate">{{ t('rm_new') }}</button>
    </div>

    <!-- KPIs -->
    <div class="rm-kpis">
      <div class="rmk"><span class="rmk-val blue">{{ store.activeRoadmaps.length }}</span><span class="rmk-label">{{ t('rm_active_count') }}</span></div>
      <div class="rmk"><span class="rmk-val green">{{ store.doneRoadmaps.length }}</span><span class="rmk-label">{{ t('rm_done_count') }}</span></div>
      <div class="rmk"><span class="rmk-val purple">{{ totalMilestones }}</span><span class="rmk-label">{{ t('rm_total_milestones') }}</span></div>
      <div class="rmk">
        <span class="rmk-val">{{ store.globalProgress }}%</span>
        <span class="rmk-label">{{ t('rm_global_progress') }}</span>
        <div class="rmk-bar"><div class="rmk-fill" :style="{ width: store.globalProgress + '%' }" /></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="!store.roadmaps.length" class="rm-empty">
      <div class="rme-icon">🗺️</div>
      <h3>{{ t('rm_empty_title') }}</h3>
      <p>{{ t('rm_empty_desc') }}</p>
      <div class="rme-actions">
        <button class="btn-primary" @click="openCreate">{{ t('rm_choose_template') }}</button>
        <button class="btn-outline" @click="openBlank">{{ t('rm_blank') }}</button>
      </div>
    </div>

    <!-- Roadmaps list -->
    <div v-else class="rm-list">
      <div v-for="rm in store.roadmaps" :key="rm.id" class="rm-card">
        <!-- Card header -->
        <div class="rmc-header">
          <div class="rmc-left">
            <span class="rmc-icon" :style="{ background: rm.color + '22' }">{{ rm.icon }}</span>
            <div>
              <strong>{{ rm.name }}</strong>
              <span class="rmc-date">{{ t('rm_start_date') }} : {{ rm.createdAt }}</span>
            </div>
          </div>
          <div class="rmc-right">
            <div class="rmc-progress">
              <div class="rmc-bar"><div class="rmc-fill" :style="{ width: store.roadmapProgress(rm) + '%', background: rm.color }" /></div>
              <span class="rmc-pct">{{ store.roadmapProgress(rm) }}%</span>
            </div>
            <!-- Delete inline -->
            <template v-if="deleteStep[rm.id] === 2">
              <span class="del-msg warn">{{ t('rm_delete_step2') }}</span>
              <button class="btn-danger" @click="confirmDelete(rm.id)">{{ t('rm_delete_confirm') }}</button>
              <button class="btn-outline-sm" @click="clearDelete(rm.id)">{{ t('rm_delete_cancel') }}</button>
            </template>
            <template v-else-if="deleteStep[rm.id] === 1">
              <span class="del-msg">{{ t('rm_delete_step1') }}</span>
              <button class="btn-danger-outline-sm" @click="deleteStep[rm.id] = 2">{{ t('rm_delete_confirm') }}</button>
              <button class="btn-outline-sm" @click="clearDelete(rm.id)">{{ t('rm_delete_cancel') }}</button>
            </template>
            <template v-else>
              <button class="btn-del" @click="deleteStep[rm.id] = 1" :title="t('rm_delete_roadmap')">🗑</button>
            </template>
          </div>
        </div>

        <!-- Timeline visuelle -->
        <div class="rmc-timeline">
          <div v-for="(ms, i) in rm.milestones" :key="ms.id" class="rmt-item">
            <div class="rmt-connector" v-if="i > 0" :class="{ done: rm.milestones[i-1].done }" />
            <div class="rmt-node" :class="ms.status" @click="openEditMilestone(rm, ms)">
              <span v-if="ms.done">✓</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div class="rmt-label">
              <span class="rmt-title">{{ ms.title }}</span>
              <span class="rmt-date">{{ ms.endDate }}</span>
              <span v-if="daysInfo(ms)" class="rmt-days" :class="daysInfo(ms).late ? 'late' : 'ok'">
                {{ daysInfo(ms).days }} {{ daysInfo(ms).late ? t('rm_days_late') : t('rm_days_left') }}
              </span>
            </div>
          </div>
          <div class="rmt-add" @click="openAddMilestone(rm)">
            <span>{{ t('rm_add_milestone') }}</span>
          </div>
        </div>

        <div v-if="!rm.milestones.length" class="rmc-empty">{{ t('rm_no_milestones') }}</div>
      </div>
    </div>

    <!-- Slide-over : créer roadmap -->
    <Transition name="so-slide">
      <div v-if="showCreate" class="so-overlay" @click.self="showCreate = false">
        <div class="so-panel">
          <div class="so-head">
            <h3>{{ t('rm_new') }}</h3>
            <button class="so-close" @click="showCreate = false">✕</button>
          </div>
          <div class="so-body">
            <!-- Templates -->
            <p class="so-section-label">{{ t('rm_select_template') }}</p>
            <div class="tpl-grid">
              <div v-for="tpl in TEMPLATES" :key="tpl.id"
                   class="tpl-card" :class="{ selected: selectedTpl === tpl.id }"
                   :style="{ borderColor: selectedTpl === tpl.id ? tpl.color : '' }"
                   @click="selectedTpl = tpl.id">
                <span class="tpl-icon">{{ tpl.icon }}</span>
                <div>
                  <strong>{{ t('rm_tpl_' + tpl.key) }}</strong>
                  <p>{{ t('rm_tpl_' + tpl.key + '_desc') }}</p>
                </div>
              </div>
            </div>
            <div class="so-divider">{{ t('rm_or_blank') }}</div>
            <div class="fg">
              <label>{{ t('rm_roadmap_name') }} *</label>
              <input v-model="createForm.name" class="fi" :placeholder="t('rm_roadmap_name_ph')" />
            </div>
            <div class="fg mt">
              <label>{{ t('rm_start_date') }}</label>
              <input v-model="createForm.startDate" type="date" class="fi" />
            </div>
            <div class="so-actions">
              <button class="btn-outline" @click="showCreate = false">{{ t('cancel') }}</button>
              <button class="btn-primary" @click="doCreate" :disabled="!createForm.name">{{ t('rm_create') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Slide-over : ajouter/éditer jalon -->
    <Transition name="so-slide">
      <div v-if="showMilestone" class="so-overlay" @click.self="showMilestone = false">
        <div class="so-panel">
          <div class="so-head">
            <h3>{{ editMilestone ? t('edit') : t('rm_add_milestone') }}</h3>
            <button class="so-close" @click="showMilestone = false">✕</button>
          </div>
          <div class="so-body">
            <div class="fg">
              <label>{{ t('rm_milestone_title') }} *</label>
              <input v-model="msForm.title" class="fi" />
            </div>
            <div class="fr mt">
              <div class="fg">
                <label>{{ t('rm_milestone_start') }}</label>
                <input v-model="msForm.startDate" type="date" class="fi" />
              </div>
              <div class="fg">
                <label>{{ t('rm_milestone_end') }}</label>
                <input v-model="msForm.endDate" type="date" class="fi" />
              </div>
            </div>
            <div class="fg mt">
              <label>{{ t('rm_milestone_status') }}</label>
              <select v-model="msForm.status" class="fi">
                <option value="todo">{{ t('rm_ms_todo') }}</option>
                <option value="in_progress">{{ t('rm_ms_progress') }}</option>
                <option value="done">{{ t('rm_ms_done') }}</option>
                <option value="blocked">{{ t('rm_ms_blocked') }}</option>
              </select>
            </div>
            <div class="fg mt">
              <label>{{ t('rm_milestone_notes') }}</label>
              <textarea v-model="msForm.notes" class="fi ta" rows="3" />
            </div>
            <div class="so-actions">
              <button v-if="editMilestone" class="btn-danger-outline" @click="doDeleteMilestone">{{ t('delete') }}</button>
              <div style="flex:1" />
              <button class="btn-outline" @click="showMilestone = false">{{ t('cancel') }}</button>
              <button class="btn-primary" @click="doSaveMilestone" :disabled="!msForm.title">{{ t('save') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoadmapStore, TEMPLATES } from '@/stores/roadmap'

const { t } = useI18n({ useScope: 'global' })
const store = useRoadmapStore()

const showCreate = ref(false)
const showMilestone = ref(false)
const selectedTpl = ref(null)
const currentRoadmapId = ref(null)
const editMilestone = ref(null)
const deleteStep = reactive({})

const createForm = reactive({ name: '', startDate: new Date().toISOString().slice(0, 10) })
const msForm = reactive({ title: '', startDate: '', endDate: '', status: 'todo', notes: '' })

const totalMilestones = computed(() => store.roadmaps.reduce((s, r) => s + r.milestones.length, 0))

function openCreate() {
  selectedTpl.value = null
  createForm.name = ''
  createForm.startDate = new Date().toISOString().slice(0, 10)
  showCreate.value = true
}

function openBlank() {
  selectedTpl.value = null
  createForm.name = ''
  createForm.startDate = new Date().toISOString().slice(0, 10)
  showCreate.value = true
}

function doCreate() {
  if (!createForm.name) return
  if (selectedTpl.value) {
    store.createFromTemplate(selectedTpl.value, createForm.name, createForm.startDate)
  } else {
    store.createBlank(createForm.name)
  }
  showCreate.value = false
}

function openAddMilestone(rm) {
  currentRoadmapId.value = rm.id
  editMilestone.value = null
  Object.assign(msForm, { title: '', startDate: '', endDate: '', status: 'todo', notes: '' })
  showMilestone.value = true
}

function openEditMilestone(rm, ms) {
  currentRoadmapId.value = rm.id
  editMilestone.value = ms.id
  Object.assign(msForm, { title: ms.title, startDate: ms.startDate || '', endDate: ms.endDate || '', status: ms.status, notes: ms.notes || '' })
  showMilestone.value = true
}

function doSaveMilestone() {
  if (!msForm.title) return
  if (editMilestone.value) {
    store.updateMilestone(currentRoadmapId.value, editMilestone.value, {
      title: msForm.title,
      startDate: msForm.startDate,
      endDate: msForm.endDate,
      status: msForm.status,
      done: msForm.status === 'done',
      notes: msForm.notes,
    })
  } else {
    store.addMilestone(currentRoadmapId.value, { ...msForm, done: msForm.status === 'done' })
  }
  showMilestone.value = false
}

function doDeleteMilestone() {
  store.deleteMilestone(currentRoadmapId.value, editMilestone.value)
  showMilestone.value = false
}

function clearDelete(id) { delete deleteStep[id] }
function confirmDelete(id) { store.deleteRoadmap(id); clearDelete(id) }

function daysInfo(ms) {
  if (!ms.endDate || ms.done) return null
  const end = new Date(ms.endDate)
  const now = new Date()
  const diff = Math.round((end - now) / 86400000)
  if (diff > 30) return null
  return { days: Math.abs(diff), late: diff < 0 }
}
</script>

<style scoped>
.roadmap-view { max-width: 1000px; }
.rm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.rm-header h1 { font-size: 1.5rem; font-weight: 800; }
.rm-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }
.btn-danger { background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-danger:hover { background: #dc2626; }
.btn-danger-outline { background: none; color: #ef4444; border: 1px solid #ef4444; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-outline-sm { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 4px; font-size: 0.78rem; cursor: pointer; }
.btn-danger-outline-sm { background: none; color: #ef4444; border: 1px solid #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 0.78rem; cursor: pointer; }

.rm-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
.rmk { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; text-align: center; }
.rmk-val { font-size: 1.6rem; font-weight: 800; display: block; }
.rmk-val.blue { color: var(--blue); }
.rmk-val.green { color: var(--green); }
.rmk-val.purple { color: var(--purple); }
.rmk-label { font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 6px; }
.rmk-bar { height: 5px; background: var(--border-light); border-radius: 3px; overflow: hidden; margin-top: 6px; }
.rmk-fill { height: 100%; background: var(--purple); border-radius: 3px; transition: width 0.5s; }

.rm-empty { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 72px 40px; text-align: center; }
.rme-icon { font-size: 3.5rem; margin-bottom: 16px; }
.rm-empty h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
.rm-empty p { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 28px; }
.rme-actions { display: flex; justify-content: center; gap: 12px; }

.rm-list { display: flex; flex-direction: column; gap: 16px; }
.rm-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.rmc-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border-light); gap: 16px; flex-wrap: wrap; }
.rmc-left { display: flex; align-items: center; gap: 12px; }
.rmc-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.rmc-left strong { font-size: 1rem; font-weight: 700; display: block; }
.rmc-date { font-size: 0.72rem; color: var(--text-muted); }
.rmc-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rmc-progress { display: flex; align-items: center; gap: 8px; }
.rmc-bar { width: 120px; height: 5px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.rmc-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
.rmc-pct { font-size: 0.8rem; font-weight: 700; min-width: 36px; }
.btn-del { background: none; border: none; font-size: 0.9rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; opacity: 0.4; transition: all 0.15s; }
.btn-del:hover { opacity: 1; background: #fee2e2; }
.del-msg { font-size: 0.78rem; color: var(--text-secondary); }
.del-msg.warn { color: #ef4444; font-weight: 600; }

.rmc-timeline { padding: 20px; display: flex; flex-wrap: wrap; gap: 0; align-items: flex-start; }
.rmt-item { display: flex; flex-direction: column; align-items: center; position: relative; min-width: 80px; flex: 1; }
.rmt-connector { position: absolute; top: 14px; right: calc(50% + 14px); left: calc(-50% + 14px); height: 3px; background: var(--border-light); z-index: 0; }
.rmt-connector.done { background: var(--green); }
.rmt-node { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; cursor: pointer; z-index: 1; position: relative; transition: all 0.2s; border: 2px solid var(--border); background: #fff; color: var(--text-muted); }
.rmt-node:hover { transform: scale(1.15); }
.rmt-node.done { background: var(--green); border-color: var(--green); color: #fff; }
.rmt-node.in_progress { background: var(--blue); border-color: var(--blue); color: #fff; }
.rmt-node.blocked { background: #ef4444; border-color: #ef4444; color: #fff; }
.rmt-label { margin-top: 8px; text-align: center; padding: 0 4px; }
.rmt-title { font-size: 0.72rem; font-weight: 600; display: block; line-height: 1.3; }
.rmt-date { font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px; }
.rmt-days { font-size: 0.65rem; font-weight: 600; display: block; margin-top: 2px; }
.rmt-days.late { color: #ef4444; }
.rmt-days.ok { color: var(--green); }
.rmt-add { display: flex; flex-direction: column; align-items: center; min-width: 80px; flex: 1; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; padding-top: 4px; }
.rmt-add:hover { opacity: 1; }
.rmt-add span { font-size: 0.72rem; color: var(--purple); margin-top: 8px; white-space: nowrap; }
.rmt-add::before { content: '+'; width: 28px; height: 28px; border-radius: 50%; border: 2px dashed var(--purple); display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--purple); background: #fff; }
.rmc-empty { padding: 16px 20px; font-size: 0.82rem; color: var(--text-muted); text-align: center; border-top: 1px solid var(--border-light); }

.so-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; justify-content: flex-end; }
.so-panel { width: 480px; max-width: 95vw; background: #fff; height: 100%; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.12); }
.so-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.so-head h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.so-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-muted); padding: 4px 8px; border-radius: 4px; }
.so-close:hover { background: var(--bg-secondary); }
.so-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.so-section-label { font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: -8px; }
.tpl-grid { display: flex; flex-direction: column; gap: 8px; }
.tpl-card { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s; }
.tpl-card:hover { border-color: var(--purple); background: #faf9ff; }
.tpl-card.selected { background: #f5f3ff; }
.tpl-icon { font-size: 1.4rem; flex-shrink: 0; }
.tpl-card strong { font-size: 0.85rem; display: block; margin-bottom: 2px; }
.tpl-card p { font-size: 0.75rem; color: var(--text-muted); margin: 0; line-height: 1.4; }
.so-divider { text-align: center; font-size: 0.75rem; color: var(--text-muted); padding: 4px 0; position: relative; }
.so-divider::before, .so-divider::after { content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--border); }
.so-divider::before { left: 0; }
.so-divider::after { right: 0; }
.so-actions { display: flex; gap: 10px; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-light); margin-top: auto; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; transition: border-color 0.15s; }
.fi:focus { border-color: var(--purple); }
.ta { resize: vertical; }
.fr { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mt { margin-top: 4px; }
.so-slide-enter-active, .so-slide-leave-active { transition: opacity 0.25s ease; }
.so-slide-enter-active .so-panel, .so-slide-leave-active .so-panel { transition: transform 0.3s ease; }
.so-slide-enter-from, .so-slide-leave-to { opacity: 0; }
.so-slide-enter-from .so-panel, .so-slide-leave-to .so-panel { transform: translateX(100%); }
@media (max-width: 768px) { .rm-kpis { grid-template-columns: repeat(2, 1fr); } .rmc-timeline { gap: 4px; } }
</style>
