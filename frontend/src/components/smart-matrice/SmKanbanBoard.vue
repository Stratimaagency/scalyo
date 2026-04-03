<template>
  <div class="sm-kanban">
    <div v-for="col in columns" :key="col.status" class="sm-kanban__col" :style="{ '--col-bg': col.bg, '--col-accent': col.color }">
      <div class="sm-kanban__col-header">
        <span class="sm-kanban__col-dot" :style="{ background: col.color }"></span>
        <h4 class="sm-kanban__col-title">{{ col.label }}</h4>
        <span class="sm-kanban__col-count">{{ tasksFor(col.status).length }}</span>
      </div>
      <div class="sm-kanban__col-body" @dragover.prevent @drop="onDrop($event, col.status)">

        <!-- Group by group_name (project/phase) -->
        <template v-for="(group, gName) in groupedTasksFor(col.status)" :key="gName">
          <div class="sm-kanban__group">
            <div class="sm-kanban__group-head" @click="toggleGroup(col.status + '-' + gName)">
              <span class="sm-kanban__group-chevron">{{ openGroups[col.status + '-' + gName] === false ? '▸' : '▾' }}</span>
              <span class="sm-kanban__group-name">{{ gName }}</span>
              <span class="sm-kanban__group-count">{{ group.length }}</span>
            </div>

            <template v-if="openGroups[col.status + '-' + gName] !== false">
              <div v-for="task in group" :key="task.id" class="sm-kanban__card"
                draggable="true" @dragstart="onDragStart($event, task)">

                <div class="sm-kanban__card-top" @click="$emit('edit-task', task)">
                  <span class="sm-kanban__card-name">{{ task.name }}</span>
                  <span v-if="getAssigned(task)" class="sm-kanban__card-avatar">{{ getAssigned(task).initials }}</span>
                </div>

                <div class="sm-kanban__card-bar-wrap">
                  <div class="sm-kanban__card-bar" :style="{ width: (task.progress || 0) + '%' }"></div>
                </div>

                <div class="sm-kanban__card-meta">
                  <span>{{ doneSubtasks(task) }}/{{ totalSubtasks(task) }} sous-tâches</span>
                  <span v-if="task.end_date" class="sm-kanban__card-date">{{ formatDate(task.end_date) }}</span>
                </div>

                <!-- Subtasks expandable -->
                <div v-if="totalSubtasks(task) > 0">
                  <button class="sm-kanban__subtask-toggle" @click.stop="toggleTask(task.id)">
                    {{ openTasks[task.id] ? '▾' : '▸' }} {{ totalSubtasks(task) }} sous-tâches
                  </button>
                  <div v-if="openTasks[task.id]" class="sm-kanban__subtasks">
                    <div v-for="sub in (task.subtasks || [])" :key="sub.id" class="sm-kanban__subtask"
                      :class="{ 'sm-kanban__subtask--done': sub.done }">
                      <span class="sm-kanban__subtask-check">{{ sub.done ? '✓' : '○' }}</span>
                      <span class="sm-kanban__subtask-name">{{ sub.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        <div v-if="!tasksFor(col.status).length" class="sm-kanban__empty">Aucune tâche</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  tasks: { type: Array, required: true },
  team: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-status', 'edit-task'])

const openGroups = reactive({})
const openTasks = reactive({})

const columns = [
  { status: 'todo',        label: 'À faire',   color: '#3b82f6', bg: 'rgba(139,92,246,.05)' },
  { status: 'in_progress', label: 'En cours',   color: '#f43f5e', bg: 'rgba(244,63,94,.05)' },
  { status: 'blocked',     label: 'Bloqué',     color: '#2563eb', bg: 'rgba(37,99,235,.05)' },
  { status: 'done',        label: 'Terminé',    color: '#16a34a', bg: 'rgba(22,163,74,.05)' },
]

function tasksFor(status) {
  return props.tasks.filter(t => t.status === status)
}

function groupedTasksFor(status) {
  const groups = {}
  for (const t of tasksFor(status)) {
    const g = t.group_name || 'Sans groupe'
    if (!groups[g]) groups[g] = []
    groups[g].push(t)
  }
  return groups
}

function toggleGroup(key) { openGroups[key] = openGroups[key] === false ? true : false }
function toggleTask(id) { openTasks[id] = !openTasks[id] }

function doneSubtasks(task) { return (task.subtasks || []).filter(s => s.done).length }
function totalSubtasks(task) { return (task.subtasks || []).length }

function getAssigned(task) { return props.team.find(m => m.id === task.assigned_to) }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

let draggedTask = null
function onDragStart(e, task) { draggedTask = task; e.dataTransfer.effectAllowed = 'move' }
function onDrop(e, status) {
  if (draggedTask && draggedTask.status !== status) emit('update-status', draggedTask.id, status)
  draggedTask = null
}
</script>

<style scoped>
.sm-kanban { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-family: 'DM Sans', sans-serif; min-height: 400px; }
@media (max-width: 900px) { .sm-kanban { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .sm-kanban { grid-template-columns: 1fr; } }
.sm-kanban__col { background: var(--col-bg); border: 1px solid var(--sm-bd); border-radius: var(--sm-r); display: flex; flex-direction: column; min-height: 300px; }
.sm-kanban__col-header { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--sm-bd); }
.sm-kanban__col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sm-kanban__col-title { font-size: 13px; font-weight: 600; color: var(--sm-t1); margin: 0; flex: 1; }
.sm-kanban__col-count { font-size: 11px; font-weight: 600; color: var(--col-accent); background: rgba(0,0,0,.04); padding: 2px 7px; border-radius: 8px; }
.sm-kanban__col-body { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 6px; overflow-y: auto; }
.sm-kanban__group { margin-bottom: 4px; }
.sm-kanban__group-head { display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700; color: var(--sm-t2); }
.sm-kanban__group-head:hover { background: rgba(0,0,0,.03); }
.sm-kanban__group-chevron { font-size: 9px; color: var(--sm-t3); width: 12px; }
.sm-kanban__group-name { flex: 1; }
.sm-kanban__group-count { font-size: 9px; color: var(--sm-t3); background: rgba(0,0,0,.04); padding: 1px 5px; border-radius: 6px; }
.sm-kanban__card { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 10px; padding: 10px 12px; cursor: grab; transition: box-shadow .15s; margin-left: 8px; }
.sm-kanban__card:hover { box-shadow: var(--sm-sh); border-color: var(--sm-terra); }
.sm-kanban__card:active { cursor: grabbing; }
.sm-kanban__card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer; }
.sm-kanban__card-name { flex: 1; font-size: 12px; font-weight: 600; color: var(--sm-t1); }
.sm-kanban__card-avatar { width: 22px; height: 22px; border-radius: 50%; font-size: 9px; font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--sm-ai-p); color: var(--sm-ai); }
.sm-kanban__card-bar-wrap { height: 3px; background: var(--sm-bd); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
.sm-kanban__card-bar { height: 100%; background: var(--sm-grad-h); border-radius: 2px; transition: width .3s; }
.sm-kanban__card-meta { display: flex; justify-content: space-between; font-size: 10px; color: var(--sm-t3); }
.sm-kanban__card-date { color: var(--sm-warn); }
.sm-kanban__subtask-toggle { border: none; background: none; font-size: 10px; font-weight: 600; color: var(--sm-info); cursor: pointer; padding: 4px 0 0; }
.sm-kanban__subtask-toggle:hover { text-decoration: underline; }
.sm-kanban__subtasks { padding: 4px 0 0 4px; }
.sm-kanban__subtask { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--sm-t2); padding: 2px 0; }
.sm-kanban__subtask--done { opacity: .5; text-decoration: line-through; }
.sm-kanban__subtask-check { font-size: 10px; width: 14px; flex-shrink: 0; }
.sm-kanban__subtask-name { flex: 1; }
.sm-kanban__empty { font-size: 12px; color: var(--sm-t3); text-align: center; padding: 24px 0; }
</style>
