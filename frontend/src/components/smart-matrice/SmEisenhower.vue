<template>
  <div class="sm-prio">
    <!-- Summary bar -->
    <div class="sm-prio__summary">
      <div class="sm-prio__stat" v-for="(cfg, idx) in quadrants" :key="idx">
        <span class="sm-prio__stat-dot" :style="{ background: cfg.color }"></span>
        <span class="sm-prio__stat-label">{{ cfg.label }}</span>
        <span class="sm-prio__stat-count">{{ q(idx + 1).length }}</span>
      </div>
      <div class="sm-prio__stat sm-prio__stat--muted">
        <span class="sm-prio__stat-label">Non classées</span>
        <span class="sm-prio__stat-count">{{ unsortedTasks.length }}</span>
      </div>
    </div>

    <div class="sm-prio__layout">
      <!-- Unsorted tasks panel -->
      <div class="sm-prio__inbox">
        <h4 class="sm-prio__inbox-title">Non classées ({{ unsortedTasks.length }})</h4>
        <p v-if="unsortedTasks.length" class="sm-prio__inbox-hint">Glissez ou cliquez les boutons pour classer</p>

        <div v-for="(group, gName) in unsortedGrouped" :key="gName" class="sm-prio__inbox-group">
          <div class="sm-prio__inbox-group-head" @click="toggleGroup(gName)">
            <span class="sm-prio__chevron">{{ openGroups[gName] ? '▾' : '▸' }}</span>
            <span class="sm-prio__inbox-group-name">{{ gName }}</span>
            <span class="sm-prio__inbox-badge">{{ group.length }}</span>
          </div>
          <div v-if="openGroups[gName]" class="sm-prio__inbox-tasks">
            <div v-for="task in group" :key="task.id" class="sm-prio__inbox-item"
              draggable="true" @dragstart="onDragStart($event, task)">
              <div class="sm-prio__inbox-item-info" @click="$emit('edit-task', task)">
                <span class="sm-prio__inbox-dot" :class="'sm-prio__inbox-dot--' + task.status"></span>
                <span class="sm-prio__inbox-name">{{ task.name }}</span>
              </div>
              <div class="sm-prio__inbox-actions">
                <button v-for="(cfg, qi) in quadrants" :key="qi"
                  class="sm-prio__quick-btn"
                  :style="{ background: cfg.color + '18', color: cfg.color }"
                  :title="cfg.label"
                  @click.stop="quickAssign(task, qi + 1)">
                  {{ cfg.icon }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!unsortedTasks.length" class="sm-prio__inbox-empty">Toutes les tâches sont classées</div>
      </div>

      <!-- Priority grid -->
      <div class="sm-prio__grid">
        <div v-for="(cfg, idx) in quadrants" :key="idx"
          class="sm-prio__card"
          :style="{ '--card-color': cfg.color, '--card-bg': cfg.bg }"
          @dragover.prevent
          @dragenter.prevent="dragOver = idx + 1"
          @dragleave="dragOver = null"
          @drop="onDrop($event, idx + 1)"
          :class="{ 'sm-prio__card--hover': dragOver === idx + 1 }">

          <div class="sm-prio__card-header">
            <span class="sm-prio__card-icon">{{ cfg.icon }}</span>
            <input v-if="editingLabel === idx" class="sm-prio__card-label-input" v-model="quadrants[idx].label"
              @blur="editingLabel = null" @keydown.enter="editingLabel = null" autofocus />
            <span v-else class="sm-prio__card-label" @dblclick="editingLabel = idx">{{ cfg.label }}</span>
            <span class="sm-prio__card-count">{{ q(idx + 1).length }}</span>
            <button class="sm-prio__card-edit" @click="editingLabel = editingLabel === idx ? null : idx" title="Renommer">✎</button>
          </div>
          <p class="sm-prio__card-desc">{{ cfg.desc }}</p>

          <div class="sm-prio__card-tasks">
            <div v-for="task in q(idx + 1)" :key="task.id" class="sm-prio__task"
              draggable="true" @dragstart="onDragStart($event, task)" @click="$emit('edit-task', task)">
              <span class="sm-prio__task-status" :class="'sm-prio__task-status--' + task.status"></span>
              <span class="sm-prio__task-name">{{ task.name }}</span>
              <button v-if="team.length" class="sm-prio__task-transfer" @click.stop="startTransfer(task)" title="Transférer">↗</button>
              <button class="sm-prio__task-remove" @click.stop="quickAssign(task, 0)" title="Retirer">✕</button>
            </div>
          </div>

          <div v-if="!q(idx + 1).length" class="sm-prio__card-empty">
            Glissez des tâches ici
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer overlay -->
    <div v-if="transferringTask" class="sm-prio__overlay" @click.self="transferringTask = null">
      <div class="sm-prio__transfer-box">
        <h4>Transférer « {{ transferringTask.name }} »</h4>
        <div v-for="m in team" :key="m.id" class="sm-prio__transfer-item" @click="doTransfer(m.id)">
          <span class="sm-prio__transfer-avatar">{{ getInitials(m.display_name || m.email) }}</span>
          {{ m.display_name || m.email }}
        </div>
        <button class="sm-prio__transfer-cancel" @click="transferringTask = null">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  tasks: { type: Array, required: true },
  team: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-quadrant', 'transfer', 'edit-task'])

const transferringTask = ref(null)
const dragOver = ref(null)
const openGroups = reactive({})
const editingLabel = ref(null)

// Customizable quadrant config
const quadrants = reactive([
  { label: 'Faire maintenant', icon: '🔴', color: '#ef4444', bg: '#fef2f2', desc: 'Urgent & important — à traiter immédiatement' },
  { label: 'Planifier', icon: '🟢', color: '#22c55e', bg: '#f0fdf4', desc: 'Important mais pas urgent — à programmer' },
  { label: 'Déléguer', icon: '🔵', color: '#3b82f6', bg: '#eff6ff', desc: 'Urgent mais pas important — à confier' },
  { label: 'Éliminer', icon: '⚪', color: '#94a3b8', bg: '#f8fafc', desc: 'Ni urgent ni important — à supprimer ou reporter' },
])

function q(num) {
  return props.tasks.filter(t => t.quadrant === num)
}

const unsortedTasks = computed(() => {
  return props.tasks.filter(t => !t.quadrant || t.quadrant === 0)
})

const unsortedGrouped = computed(() => {
  const groups = {}
  for (const tk of unsortedTasks.value) {
    const g = tk.group_name || 'Sans groupe'
    if (!groups[g]) { groups[g] = []; if (openGroups[g] === undefined) openGroups[g] = true }
    groups[g].push(tk)
  }
  return groups
})

function toggleGroup(name) { openGroups[name] = !openGroups[name] }

function quickAssign(task, quadrant) {
  emit('update-quadrant', task.id, quadrant)
}

let draggedTask = null
function onDragStart(e, task) {
  draggedTask = task
  e.dataTransfer.effectAllowed = 'move'
}
function onDrop(e, quadrant) {
  dragOver.value = null
  if (draggedTask && draggedTask.quadrant !== quadrant) {
    emit('update-quadrant', draggedTask.id, quadrant)
  }
  draggedTask = null
}

function startTransfer(task) { transferringTask.value = task }
function doTransfer(memberId) {
  emit('transfer', transferringTask.value.id, memberId)
  transferringTask.value = null
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<style scoped>
.sm-prio { font-family: 'DM Sans', sans-serif; }

/* Summary bar */
.sm-prio__summary {
  display: flex; gap: 16px; padding: 12px 16px; background: var(--sm-white, #fff);
  border: 1px solid var(--sm-bd, #e5e7eb); border-radius: 12px; margin-bottom: 16px;
  flex-wrap: wrap;
}
.sm-prio__stat { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--sm-t1, #374151); }
.sm-prio__stat--muted { margin-left: auto; color: var(--sm-t3, #9ca3af); }
.sm-prio__stat-dot { width: 10px; height: 10px; border-radius: 50%; }
.sm-prio__stat-label { font-weight: 500; }
.sm-prio__stat-count { font-weight: 700; font-size: 14px; }

/* Layout */
.sm-prio__layout { display: flex; gap: 16px; }

/* Inbox */
.sm-prio__inbox {
  width: 280px; flex-shrink: 0; background: var(--sm-white, #fff);
  border: 1px solid var(--sm-bd, #e5e7eb); border-radius: 12px;
  padding: 16px; max-height: 650px; overflow-y: auto;
}
.sm-prio__inbox-title { font-size: 15px; font-weight: 700; color: var(--sm-t1, #1f2937); margin: 0 0 4px; }
.sm-prio__inbox-hint { font-size: 11px; color: var(--sm-t3, #9ca3af); margin: 0 0 14px; }
.sm-prio__inbox-group { margin-bottom: 4px; }
.sm-prio__inbox-group-head {
  display: flex; align-items: center; gap: 6px; padding: 7px 8px;
  border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--sm-t1, #374151);
}
.sm-prio__inbox-group-head:hover { background: var(--sm-bg, #f9fafb); }
.sm-prio__chevron { font-size: 10px; color: var(--sm-t3, #9ca3af); width: 14px; text-align: center; }
.sm-prio__inbox-group-name { flex: 1; }
.sm-prio__inbox-badge { font-size: 10px; color: var(--sm-t3, #9ca3af); background: var(--sm-bg, #f3f4f6); border-radius: 10px; padding: 2px 8px; font-weight: 600; }
.sm-prio__inbox-tasks { padding-left: 4px; }
.sm-prio__inbox-item {
  display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 8px;
  cursor: grab; font-size: 13px; color: var(--sm-t1, #374151); border: 1px solid transparent; margin-bottom: 2px;
}
.sm-prio__inbox-item:hover { background: var(--sm-bg, #f9fafb); border-color: var(--sm-bd, #e5e7eb); }
.sm-prio__inbox-item:active { cursor: grabbing; }
.sm-prio__inbox-item-info { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; cursor: pointer; }
.sm-prio__inbox-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: #94a3b8; }
.sm-prio__inbox-dot--todo { background: #94a3b8; }
.sm-prio__inbox-dot--in_progress { background: #f59e0b; }
.sm-prio__inbox-dot--blocked { background: #3b82f6; }
.sm-prio__inbox-dot--done { background: #22c55e; }
.sm-prio__inbox-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-prio__inbox-actions { display: none; gap: 2px; flex-shrink: 0; }
.sm-prio__inbox-item:hover .sm-prio__inbox-actions { display: flex; }
.sm-prio__quick-btn {
  border: none; cursor: pointer; font-size: 11px; padding: 2px 6px;
  border-radius: 6px; font-weight: 600; transition: transform .1s;
}
.sm-prio__quick-btn:hover { transform: scale(1.15); }
.sm-prio__inbox-empty { font-size: 13px; color: var(--sm-ok, #22c55e); text-align: center; padding: 24px 10px; font-weight: 500; }

/* Grid */
.sm-prio__grid {
  flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}

/* Cards */
.sm-prio__card {
  background: var(--card-bg); border: 1px solid var(--sm-bd, #e5e7eb);
  border-radius: 12px; padding: 14px; min-height: 200px; transition: box-shadow .15s;
  display: flex; flex-direction: column;
}
.sm-prio__card--hover { box-shadow: inset 0 0 0 2px var(--card-color); }
.sm-prio__card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.sm-prio__card-icon { font-size: 16px; }
.sm-prio__card-label { font-size: 14px; font-weight: 700; color: var(--sm-t1, #1f2937); flex: 1; cursor: default; }
.sm-prio__card-label-input {
  font-size: 14px; font-weight: 700; color: var(--sm-t1, #1f2937); flex: 1;
  border: 1px solid var(--card-color); border-radius: 6px; padding: 2px 6px;
  outline: none; background: #fff; font-family: 'DM Sans', sans-serif;
}
.sm-prio__card-count {
  font-size: 12px; font-weight: 700; color: var(--card-color);
  background: #fff; border-radius: 10px; padding: 2px 8px;
  border: 1px solid var(--sm-bd, #e5e7eb);
}
.sm-prio__card-edit {
  border: none; background: none; cursor: pointer; font-size: 12px;
  color: var(--sm-t3, #9ca3af); opacity: 0; transition: opacity .15s;
}
.sm-prio__card:hover .sm-prio__card-edit { opacity: 1; }
.sm-prio__card-desc { font-size: 11px; color: var(--sm-t3, #9ca3af); margin: 0 0 10px; line-height: 1.4; }

.sm-prio__card-tasks { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.sm-prio__task {
  display: flex; align-items: center; gap: 8px; background: #fff;
  border: 1px solid var(--sm-bd, #e5e7eb); border-radius: 8px;
  padding: 8px 10px; font-size: 13px; color: var(--sm-t1, #374151);
  cursor: grab; transition: box-shadow .15s;
}
.sm-prio__task:hover { box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.sm-prio__task:active { cursor: grabbing; }
.sm-prio__task-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: #94a3b8; }
.sm-prio__task-status--done { background: #22c55e; }
.sm-prio__task-status--in_progress { background: #f59e0b; }
.sm-prio__task-status--blocked { background: #3b82f6; }
.sm-prio__task-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-prio__task-transfer, .sm-prio__task-remove {
  border: none; background: none; cursor: pointer; font-size: 12px;
  color: var(--sm-t3, #9ca3af); opacity: 0; transition: opacity .15s; padding: 0 2px;
}
.sm-prio__task:hover .sm-prio__task-transfer,
.sm-prio__task:hover .sm-prio__task-remove { opacity: 1; }
.sm-prio__task-remove:hover { color: #ef4444; }

.sm-prio__card-empty {
  font-size: 12px; color: var(--sm-t3, #9ca3af); text-align: center;
  padding: 24px 8px; border: 2px dashed var(--sm-bd, #e5e7eb);
  border-radius: 8px; opacity: .6; flex: 1; display: flex; align-items: center; justify-content: center;
}

/* Transfer overlay */
.sm-prio__overlay { position: fixed; inset: 0; background: rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; z-index: 100; }
.sm-prio__transfer-box { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,.15); min-width: 240px; }
.sm-prio__transfer-box h4 { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: var(--sm-t1, #1f2937); margin: 0 0 14px; }
.sm-prio__transfer-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--sm-t1, #374151); cursor: pointer; }
.sm-prio__transfer-item:hover { background: #f3f4f6; }
.sm-prio__transfer-avatar { width: 28px; height: 28px; border-radius: 50%; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; background: #ede9fe; color: #7c3aed; }
.sm-prio__transfer-cancel { border: none; background: none; color: var(--sm-t3, #9ca3af); font-size: 12px; cursor: pointer; margin-top: 10px; width: 100%; text-align: center; }
.sm-prio__transfer-cancel:hover { color: var(--sm-t1, #374151); }

/* Responsive */
@media (max-width: 900px) {
  .sm-prio__layout { flex-direction: column; }
  .sm-prio__inbox { width: 100%; max-height: 300px; }
  .sm-prio__grid { grid-template-columns: 1fr; }
}

/* Dark theme */
[data-theme="dark"] .sm-prio__card { border-color: var(--sm-bd); }
[data-theme="dark"] .sm-prio__task { background: var(--sm-white); border-color: var(--sm-bd); }
[data-theme="dark"] .sm-prio__summary { background: var(--sm-white); border-color: var(--sm-bd); }
[data-theme="dark"] .sm-prio__inbox { background: var(--sm-white); border-color: var(--sm-bd); }
</style>
