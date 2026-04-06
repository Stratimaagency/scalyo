<template>
  <PlanGate requiredPlan="Growth" moduleName="Roadmap">
  <div class="rm fade-in">
    <div v-if="loading" style="display: flex; justify-content: center; padding: 60px 0; color: var(--muted);">{{ t('loading') }}</div>
    <template v-else>

    <!-- Header -->
    <div class="page-header rm-header">
      <div class="page-header__left">
        <div class="page-header__icon">🗺️</div>
        <div class="page-header__text">
          <h1 class="page-header__title">{{ t('rmTitle') }}</h1>
          <p class="page-header__subtitle">{{ t('rmSubtitle') }}</p>
        </div>
      </div>
      <div class="page-header__actions">
        <div class="rm-ring-wrap">
          <svg viewBox="0 0 80 80" class="rm-ring">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="7"/>
            <circle cx="40" cy="40" r="34" fill="none" :stroke="progressColor" stroke-width="7"
              stroke-linecap="round" :stroke-dasharray="214" :stroke-dashoffset="214 - (progress / 100 * 214)"
              class="rm-ring-fill" transform="rotate(-90 40 40)"/>
          </svg>
          <span class="rm-ring-val" :style="{ color: progressColor }">{{ progress }}%</span>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="rm-stats">
      <div class="rm-stat"><span class="rm-stat-val">{{ items.length }}</span><span class="rm-stat-label">{{ t('rmMilestones') }}</span></div>
      <div class="rm-stat"><span class="rm-stat-val" style="color: var(--green)">{{ doneCount }}</span><span class="rm-stat-label">{{ t('rmCompletedCount') }}</span></div>
      <div class="rm-stat"><span class="rm-stat-val" style="color: var(--amber)">{{ items.length - doneCount }}</span><span class="rm-stat-label">{{ t('rmRemainingCount') }}</span></div>
      <div class="rm-stat"><span class="rm-stat-val" style="color: var(--teal)">P{{ currentPhase }}</span><span class="rm-stat-label">{{ t('rmCurrentPhase') }}</span></div>
    </div>

    <!-- Visual timeline: 3 phase nodes -->
    <div class="rm-timeline">
      <div v-for="p in 3" :key="p" class="rm-timeline-phase" :class="{ 'rm-timeline-phase--active': p === currentPhase, 'rm-timeline-phase--done': phaseProgress(p) === 100 }">
        <div class="rm-timeline-line" v-if="p > 1" :class="{ 'rm-timeline-line--done': phaseProgress(p - 1) === 100 }"></div>
        <div class="rm-timeline-node" :style="{ '--phase-color': phaseColor(p) }" @click="phaseFilter = phaseFilter === String(p) ? 'all' : String(p)">
          <span class="rm-timeline-num">{{ p }}</span>
          <div class="rm-timeline-pct" v-if="phaseItemCount(p)">{{ phaseProgress(p) }}%</div>
        </div>
        <div class="rm-timeline-name">{{ phaseName(p) }}</div>
        <div class="rm-timeline-count">{{ phaseDoneCount(p) }}/{{ phaseItemCount(p) }}</div>
      </div>
    </div>

    <!-- Filters + Quick add -->
    <div class="rm-toolbar">
      <div class="rm-filters">
        <button class="rm-chip" :class="{ 'rm-chip--on': phaseFilter === 'all' }" @click="phaseFilter = 'all'">{{ t('rmAllPhases') }}</button>
        <button v-for="p in 3" :key="p" class="rm-chip" :class="{ 'rm-chip--on': phaseFilter === String(p) }" @click="phaseFilter = String(p)" :style="phaseFilter === String(p) ? { background: phaseColor(p) + '18', color: phaseColor(p), borderColor: phaseColor(p) + '40' } : {}">P{{ p }}</button>
        <span class="rm-divider"></span>
        <button class="rm-chip" :class="{ 'rm-chip--on': statusFilter === 'all' }" @click="statusFilter = 'all'">{{ t('rmAllStatus') }}</button>
        <button class="rm-chip" :class="{ 'rm-chip--on': statusFilter === 'todo' }" @click="statusFilter = 'todo'">{{ t('rmTodo') }}</button>
        <button class="rm-chip" :class="{ 'rm-chip--on': statusFilter === 'done' }" @click="statusFilter = 'done'">{{ t('rmDone') }}</button>
        <span class="rm-divider"></span>
        <button class="rm-chip" :class="{ 'rm-chip--on': prioFilter === 'all' }" @click="prioFilter = 'all'">{{ t('rmAllPrio') }}</button>
        <button class="rm-chip" :class="{ 'rm-chip--on': prioFilter === 'high' }" @click="prioFilter = 'high'" style="--chip-c: var(--red)">🔴</button>
        <button class="rm-chip" :class="{ 'rm-chip--on': prioFilter === 'medium' }" @click="prioFilter = 'medium'" style="--chip-c: var(--amber)">🟡</button>
        <button class="rm-chip" :class="{ 'rm-chip--on': prioFilter === 'low' }" @click="prioFilter = 'low'" style="--chip-c: var(--green)">🟢</button>
      </div>
      <div class="rm-quick-add">
        <input v-model="newLabel" class="rm-quick-input" :placeholder="t('rmQuickAdd')" @keydown.enter="addItem" />
        <select v-model="newPhase" class="rm-quick-select"><option v-for="p in 3" :key="p" :value="p">P{{ p }}</option></select>
        <select v-model="newPrio" class="rm-quick-select">
          <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
        </select>
        <button class="rm-quick-btn" @click="addItem" :disabled="!newLabel.trim()">+</button>
      </div>
    </div>

    <!-- Phase cards with milestone timeline -->
    <div v-for="phase in displayPhases" :key="phase.num" class="rm-phase-card" :style="{ '--phase-accent': phaseColor(phase.num) }">
      <div class="rm-phase-header">
        <span class="rm-phase-emoji">{{ phaseEmoji(phase.num) }}</span>
        <div class="rm-phase-info">
          <h3 class="rm-phase-title">{{ t('rmPhase') }} {{ phase.num }} — {{ phaseName(phase.num) }}</h3>
          <span class="rm-phase-count">{{ phaseDoneCount(phase.num) }}/{{ phaseItemCount(phase.num) }} {{ t('rmMilestones') }}</span>
        </div>
        <div class="rm-phase-progress-wrap">
          <div class="rm-phase-progress" :style="{ width: phaseProgress(phase.num) + '%', background: phaseColor(phase.num) }"></div>
        </div>
        <span class="rm-phase-pct" :style="{ color: phaseColor(phase.num) }">{{ phaseProgress(phase.num) }}%</span>
        <span v-if="phaseProgress(phase.num) === 100" class="rm-phase-celebrate">🎉</span>
      </div>

      <!-- Milestone items with vertical timeline -->
      <div class="rm-milestones">
        <div v-for="(item, i) in phase.items" :key="item.id" class="rm-milestone" :class="{ 'rm-milestone--done': item.done }">
          <div class="rm-milestone-line-wrap">
            <div class="rm-milestone-dot" :style="{ background: item.done ? 'var(--green)' : phaseColor(phase.num) }" @click="toggleItem(item.id)">
              <span v-if="item.done" style="color: #fff; font-size: 10px;">✓</span>
            </div>
            <div v-if="i < phase.items.length - 1" class="rm-milestone-line" :class="{ 'rm-milestone-line--done': item.done }"></div>
          </div>
          <div class="rm-milestone-content">
            <input v-if="editingId === item.id" v-model="editLabel" class="rm-edit-input" autofocus @keydown.enter="saveEdit(item.id)" @keydown.escape="editingId = null" @blur="saveEdit(item.id)" />
            <span v-else class="rm-milestone-label" :class="{ 'rm-milestone-label--done': item.done }" @dblclick="startEdit(item)">{{ item.label }}</span>
            <div class="rm-milestone-meta">
              <span v-if="item.prio" class="rm-prio" :style="{ background: prioColor(item.prio) + '18', color: prioColor(item.prio) }">{{ prioLabel(item.prio) }}</span>
              <span v-if="item.due" class="rm-due">{{ item.due }}</span>
            </div>
          </div>
          <div class="rm-milestone-actions">
            <button class="rm-act-btn" @click="startEdit(item)" title="Edit">✏️</button>
            <button class="rm-act-btn" @click="deleteItem(item.id)" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!items.length" class="rm-empty">
      <div style="font-size: 48px; margin-bottom: 12px;">🗺️</div>
      <h3>{{ t('noRoadmapSteps') }}</h3>
      <p style="color: var(--muted); margin-top: 8px;">{{ t('rmSubtitle') }}</p>
    </div>

    <!-- All done celebration -->
    <div v-if="items.length && progress === 100" class="rm-alldone">
      <div style="font-size: 48px; margin-bottom: 8px;">🎉🎊✨</div>
      <h3>{{ t('rmAllDone') }}</h3>
    </div>

    </template>
  </div>
  </PlanGate>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { roadmapApi } from '../api'
import { useI18n } from '../i18n'
import PlanGate from '../components/PlanGate.vue'
import { useToast } from '../composables/useToast'

const { t, lang } = useI18n()

const roadmap = ref({ phase: '', progress: 0, items: [] })
const loading = ref(true)
const newLabel = ref('')
const newPhase = ref(1)
const newPrio = ref('medium')
const editingId = ref(null)
const editLabel = ref('')
const phaseFilter = ref('all')
const prioFilter = ref('all')
const statusFilter = ref('all')

const items = computed(() => Array.isArray(roadmap.value.items) ? roadmap.value.items : [])
const doneCount = computed(() => items.value.filter(i => i.done).length)
const progress = computed(() => items.value.length ? Math.round(doneCount.value / items.value.length * 100) : 0)
const progressColor = computed(() => progress.value >= 80 ? 'var(--green)' : progress.value >= 40 ? 'var(--amber)' : 'var(--teal)')

const currentPhase = computed(() => {
  for (let p = 1; p <= 3; p++) {
    const phaseItems = items.value.filter(i => i.phase === p)
    if (phaseItems.length && phaseItems.some(i => !i.done)) return p
  }
  return 3
})

const filtered = computed(() => {
  return items.value.filter(i => {
    if (phaseFilter.value !== 'all' && String(i.phase) !== phaseFilter.value) return false
    if (prioFilter.value !== 'all' && i.prio !== prioFilter.value) return false
    if (statusFilter.value === 'done' && !i.done) return false
    if (statusFilter.value === 'todo' && i.done) return false
    return true
  })
})

const displayPhases = computed(() => {
  const phases = [...new Set(filtered.value.map(i => i.phase).filter(Boolean))].sort()
  return phases.map(num => ({ num, items: filtered.value.filter(i => i.phase === num) }))
})

function phaseItemCount(p) { return items.value.filter(i => i.phase === p).length }
function phaseDoneCount(p) { return items.value.filter(i => i.phase === p && i.done).length }
function phaseProgress(p) { const c = phaseItemCount(p); return c ? Math.round(phaseDoneCount(p) / c * 100) : 0 }
function phaseColor(p) { return p === 1 ? '#3b82f6' : p === 2 ? '#f97316' : '#16a34a' }
function phaseEmoji(p) { return p === 1 ? '🏗️' : p === 2 ? '🚀' : '⭐' }
function phaseName(p) {
  if (p === 1) return t('rmPhase1Name') || 'Fondations'
  if (p === 2) return t('rmPhase2Name') || 'Croissance'
  return t('rmPhase3Name') || 'Excellence'
}
function prioColor(p) { return p === 'high' ? '#EF4444' : p === 'medium' ? '#F59E0B' : '#10B981' }
function prioLabel(p) { return p === 'high' ? t('priorityHigh') : p === 'medium' ? t('priorityMed') : t('priorityLow') }

function toggleItem(id) {
  roadmap.value.items = items.value.map(i => i.id === id ? { ...i, done: !i.done } : i)
  roadmap.value.progress = progress.value
  save()
}
function addItem() {
  if (!newLabel.value.trim()) return
  roadmap.value.items = [...items.value, { id: 'r_' + Date.now(), phase: newPhase.value, label: newLabel.value.trim(), done: false, due: '', prio: newPrio.value }]
  roadmap.value.progress = progress.value
  newLabel.value = ''
  save()
}
function deleteItem(id) {
  if (!confirm(t('confirmDelete') || 'Supprimer cette étape ?')) return
  roadmap.value.items = items.value.filter(i => i.id !== id)
  roadmap.value.progress = progress.value
  save()
}
function startEdit(item) { editingId.value = item.id; editLabel.value = item.label }
function saveEdit(id) {
  if (!editLabel.value.trim()) { editingId.value = null; return }
  roadmap.value.items = items.value.map(i => i.id === id ? { ...i, label: editLabel.value.trim() } : i)
  editingId.value = null
  save()
}

async function save() {
  try { await roadmapApi.update({ items: roadmap.value.items, progress: roadmap.value.progress, phase: roadmap.value.phase }) } catch { useToast().error('Erreur lors de la sauvegarde') }
}

function buildTemplate() {
  return [
    { id: 'r01', phase: 1, label: t('goalP1'), done: false, due: 'J1-J10', prio: 'high' },
    { id: 'r02', phase: 1, label: t('goalP3'), done: false, due: 'J1-J15', prio: 'high' },
    { id: 'r03', phase: 1, label: t('goalP9'), done: false, due: 'J10-J20', prio: 'medium' },
    { id: 'r04', phase: 1, label: t('goalP10'), done: false, due: 'J7-J14', prio: 'medium' },
    { id: 'r05', phase: 2, label: t('goalP4'), done: false, due: 'J30-J45', prio: 'high' },
    { id: 'r06', phase: 2, label: t('goalP5'), done: false, due: 'J30-J40', prio: 'medium' },
    { id: 'r07', phase: 2, label: t('goalP2'), done: false, due: 'J40-J60', prio: 'medium' },
    { id: 'r08', phase: 3, label: t('goalP7'), done: false, due: 'J60-J75', prio: 'high' },
    { id: 'r09', phase: 3, label: t('goalP8'), done: false, due: 'J80-J90', prio: 'high' },
  ]
}

onMounted(async () => {
  try {
    const { data } = await roadmapApi.get()
    if (data && Array.isArray(data.items) && data.items.length > 0) { roadmap.value = data }
    else { roadmap.value = { phase: '', progress: 0, items: buildTemplate() }; save() }
  } catch { useToast().error('Erreur de chargement de la roadmap'); roadmap.value = { phase: '', progress: 0, items: buildTemplate() } }
  finally { loading.value = false }
})
</script>

<style scoped>
.rm { padding: 24px 28px; height: 100%; overflow-y: auto; font-family: 'DM Sans', sans-serif; }

/* Header */
.rm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.rm-title { font-size: 22px; font-weight: 900; letter-spacing: -.5px; margin-bottom: 4px; }
.rm-subtitle { font-size: 13px; color: var(--muted); }
.rm-header-right { display: flex; align-items: center; gap: 16px; }
.rm-ring-wrap { position: relative; width: 70px; height: 70px; }
.rm-ring { width: 100%; height: 100%; }
.rm-ring-fill { transition: stroke-dashoffset .8s ease; }
.rm-ring-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; }

/* Stats */
.rm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
.rm-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; text-align: center; }
.rm-stat-val { display: block; font-size: 24px; font-weight: 900; color: var(--text); }
.rm-stat-label { display: block; font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; margin-top: 2px; }

/* Visual timeline */
.rm-timeline { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 24px; padding: 20px 0; }
.rm-timeline-phase { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
.rm-timeline-line { position: absolute; top: 22px; right: 50%; width: 100%; height: 3px; background: var(--border); z-index: 0; }
.rm-timeline-line--done { background: var(--green); }
.rm-timeline-node { width: 44px; height: 44px; border-radius: 50%; background: var(--surface); border: 3px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 1; cursor: pointer; transition: all .2s; }
.rm-timeline-phase--active .rm-timeline-node { width: 52px; height: 52px; border-color: var(--phase-color); background: var(--phase-color); box-shadow: 0 0 0 6px rgba(0,0,0,.05); }
.rm-timeline-phase--done .rm-timeline-node { border-color: var(--green); background: var(--green); }
.rm-timeline-num { font-size: 14px; font-weight: 800; color: var(--muted); }
.rm-timeline-phase--active .rm-timeline-num, .rm-timeline-phase--done .rm-timeline-num { color: #fff; }
.rm-timeline-pct { font-size: 8px; font-weight: 700; color: var(--muted); }
.rm-timeline-phase--active .rm-timeline-pct { color: rgba(255,255,255,.8); }
.rm-timeline-name { font-size: 11px; font-weight: 700; color: var(--text); margin-top: 8px; }
.rm-timeline-count { font-size: 10px; color: var(--muted); }

/* Toolbar */
.rm-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.rm-filters { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
.rm-chip { font-size: 11px; padding: 4px 10px; border-radius: 20px; cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--muted); font-weight: 500; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.rm-chip:hover { border-color: var(--teal); color: var(--teal); }
.rm-chip--on { background: var(--teal); color: #fff !important; border-color: var(--teal); font-weight: 700; }
.rm-divider { width: 1px; height: 16px; background: var(--border); margin: 0 4px; }
.rm-quick-add { display: flex; gap: 4px; align-items: center; }
.rm-quick-input { border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 6px 12px; font-size: 12px; color: var(--text); outline: none; width: 200px; font-family: 'DM Sans', sans-serif; }
.rm-quick-input:focus { border-color: var(--teal); }
.rm-quick-select { border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 5px 8px; font-size: 11px; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none; }
.rm-quick-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--teal); color: #fff; border: none; font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .1s; }
.rm-quick-btn:hover:not(:disabled) { transform: scale(1.1); }
.rm-quick-btn:disabled { opacity: .3; cursor: default; }

/* Phase cards */
.rm-phase-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 16px; border-left: 4px solid var(--phase-accent); }
.rm-phase-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.rm-phase-emoji { font-size: 24px; }
.rm-phase-info { flex: 1; }
.rm-phase-title { font-size: 15px; font-weight: 800; color: var(--text); margin: 0; }
.rm-phase-count { font-size: 11px; color: var(--muted); }
.rm-phase-progress-wrap { width: 100px; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
.rm-phase-progress { height: 100%; border-radius: 3px; transition: width .4s; }
.rm-phase-pct { font-size: 13px; font-weight: 800; min-width: 35px; text-align: right; }
.rm-phase-celebrate { font-size: 20px; animation: rm-bounce .6s ease infinite alternate; }
@keyframes rm-bounce { from { transform: scale(1); } to { transform: scale(1.3); } }

/* Milestones */
.rm-milestones { padding-left: 8px; }
.rm-milestone { display: flex; gap: 12px; align-items: flex-start; transition: opacity .2s; }
.rm-milestone--done { opacity: .6; }
.rm-milestone-line-wrap { display: flex; flex-direction: column; align-items: center; width: 18px; flex-shrink: 0; }
.rm-milestone-dot { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: transform .15s; }
.rm-milestone-dot:hover { transform: scale(1.2); }
.rm-milestone-line { width: 2px; flex: 1; min-height: 20px; background: var(--border); }
.rm-milestone-line--done { background: var(--green); }
.rm-milestone-content { flex: 1; padding: 2px 0 14px; }
.rm-milestone-label { font-size: 13px; font-weight: 500; color: var(--text); cursor: default; }
.rm-milestone-label--done { text-decoration: line-through; color: var(--muted); }
.rm-milestone-meta { display: flex; gap: 6px; margin-top: 4px; }
.rm-prio { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 6px; }
.rm-due { font-size: 10px; color: var(--muted); }
.rm-milestone-actions { display: flex; gap: 2px; opacity: 0; transition: opacity .15s; }
.rm-milestone:hover .rm-milestone-actions { opacity: 1; }
.rm-act-btn { border: none; background: none; font-size: 12px; cursor: pointer; padding: 2px 4px; border-radius: 4px; }
.rm-act-btn:hover { background: var(--surface); }
.rm-edit-input { border: 1px solid var(--teal); background: var(--surface); border-radius: 6px; padding: 4px 8px; font-size: 13px; color: var(--text); outline: none; width: 100%; font-family: 'DM Sans', sans-serif; }

/* Empty / celebration */
.rm-empty, .rm-alldone { text-align: center; padding: 40px; }
.rm-alldone h3 { color: var(--green); }

@media (max-width: 600px) {
  .rm-stats { grid-template-columns: repeat(2, 1fr); }
  .rm-toolbar { flex-direction: column; align-items: stretch; }
  .rm-quick-add { width: 100%; }
  .rm-quick-input { flex: 1; }
}
</style>
