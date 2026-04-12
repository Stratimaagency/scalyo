<template>
  <div class="kanban-view">
    <div class="kb-header">
      <h1>📋 {{ t('sm_kanban_title') }}</h1>
      <button class="btn-primary" @click="openCreate">{{ t('sm_new_task') }}</button>
    </div>

    <div class="kb-board">
      <div v-for="col in columns" :key="col.key" class="kb-col" :class="col.key">
        <div class="kbc-header">
          <span class="kbc-dot" :class="col.key" />
          <strong>{{ t(col.label) }}</strong>
          <span class="kbc-count">{{ colTasks(col.key).length }}</span>
        </div>
        <div class="kbc-body">
          <div
            v-for="task in colTasks(col.key)"
            :key="task.id"
            class="kb-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @click="openEdit(task)"
          >
            <div class="kcard-top">
              <strong>{{ task.title }}</strong>
              <span v-if="task.priority === 'urgent_important'" class="kcard-urgent">!</span>
            </div>
            <div class="kcard-meta">
              <span v-if="task.clientId" class="kcard-client">{{ clientName(task.clientId) }}</span>
              <span v-if="task.projectId" class="kcard-project" :style="{ borderColor: projectColor(task.projectId) }">{{ projectName(task.projectId) }}</span>
            </div>
            <div class="kcard-footer">
              <span class="kcard-assignee">{{ assigneeName(task.assignee) }}</span>
              <span class="kcard-due" :class="{ late: isOverdue(task) }">{{ task.dueDate }}</span>
            </div>
            <div v-if="task.subtasks?.length" class="kcard-subtasks">
              {{ task.subtasks.filter(s => s.done).length }}/{{ task.subtasks.length }}
            </div>
          </div>
          <!-- Drop zone -->
          <div
            class="kb-dropzone"
            @dragover.prevent
            @drop="onDrop($event, col.key)"
          >
            <span v-if="!colTasks(col.key).length">{{ t('sm_no_tasks') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-over new/edit task -->
    <SlideOver :open="slideOpen" :title="editId ? t('edit') : t('sm_new_task')" @close="slideOpen = false">
      <form @submit.prevent="saveTask" class="sf">
        <div class="fg"><label>{{ t('sm_task_title') }} *</label><input v-model="form.title" required class="fi" /></div>
        <div class="fg"><label>{{ t('sm_task_desc') }}</label><textarea v-model="form.description" class="fi ta" rows="2" /></div>
        <div class="fr">
          <div class="fg"><label>{{ t('sm_task_project') }}</label>
            <select v-model="form.projectId" class="fi"><option :value="null">—</option><option v-for="p in tasks.projects" :key="p.id" :value="p.id">{{ p.name }}</option></select>
          </div>
          <div class="fg"><label>{{ t('sm_task_client') }}</label>
            <select v-model="form.clientId" class="fi"><option :value="null">—</option><option v-for="c in clients.clients" :key="c.id" :value="c.id">{{ c.name }}</option></select>
          </div>
        </div>
        <div class="fr">
          <div class="fg"><label>{{ t('sm_task_assignee') }}</label>
            <select v-model="form.assignee" class="fi"><option v-for="m in team.members" :key="m.id" :value="m.id">{{ m.name }}</option></select>
          </div>
          <div class="fg"><label>{{ t('sm_task_due') }}</label><input v-model="form.dueDate" type="date" class="fi" /></div>
        </div>
        <div class="fg"><label>{{ t('sm_task_priority') }}</label>
          <select v-model="form.priority" class="fi">
            <option value="urgent_important">{{ t('sm_priority_urgent_important') }}</option>
            <option value="important">{{ t('sm_priority_important') }}</option>
            <option value="urgent">{{ t('sm_priority_urgent') }}</option>
            <option value="not_urgent">{{ t('sm_priority_not_urgent') }}</option>
          </select>
        </div>
        <div class="fa">
          <button v-if="editId" type="button" class="btn-danger" @click="deleteTask">{{ t('delete') }}</button>
          <div style="flex:1" />
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
import { useTaskStore } from '@/stores/tasks'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import SlideOver from '@/components/SlideOver.vue'

const { t } = useI18n({ useScope: 'global' })
const tasks = useTaskStore()
const clients = useClientStore()
const team = useTeamStore()

const slideOpen = ref(false)
const editId = ref(null)
let draggedTask = null

const columns = [
  { key: 'todo', label: 'sm_col_todo' },
  { key: 'in_progress', label: 'sm_col_progress' },
  { key: 'blocked', label: 'sm_col_blocked' },
  { key: 'done', label: 'sm_col_done' },
]

const initForm = () => ({ title: '', description: '', projectId: null, clientId: null, assignee: 'tm1', dueDate: '', priority: 'important' })
const form = reactive(initForm())

function colTasks(status) { return tasks.tasks.filter(t => t.status === status) }
function clientName(id) { return clients.clients.find(c => c.id === id)?.name || '' }
function projectName(id) { return tasks.projects.find(p => p.id === id)?.name || '' }
function projectColor(id) { return tasks.projects.find(p => p.id === id)?.color || '#7c3aed' }
function assigneeName(id) { return team.members.find(m => m.id === id)?.name || '' }
function isOverdue(task) { return task.status !== 'done' && task.dueDate < new Date().toISOString().slice(0, 10) }

function onDragStart(e, task) { draggedTask = task; e.dataTransfer.effectAllowed = 'move' }
function onDrop(e, newStatus) { if (draggedTask) { tasks.moveTask(draggedTask.id, newStatus); draggedTask = null } }

function openCreate() { editId.value = null; Object.assign(form, initForm()); slideOpen.value = true }
function openEdit(task) {
  editId.value = task.id
  Object.assign(form, { title: task.title, description: task.description || '', projectId: task.projectId, clientId: task.clientId, assignee: task.assignee, dueDate: task.dueDate, priority: task.priority })
  slideOpen.value = true
}

function saveTask() {
  if (editId.value) {
    tasks.updateTask(editId.value, { ...form })
  } else {
    tasks.addTask({ ...form })
  }
  slideOpen.value = false
}

function deleteTask() {
  if (editId.value) { tasks.deleteTask(editId.value); slideOpen.value = false }
}
</script>

<style scoped>
.kanban-view { max-width: 1200px; }
.kb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.kb-header h1 { font-size: 1.5rem; font-weight: 800; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; }
.btn-danger { background: var(--red-bg); color: var(--red); border: 1px solid var(--red-border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; font-weight: 600; }

.kb-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; align-items: start; }
.kb-col { background: var(--bg); border-radius: var(--radius-md); min-height: 300px; }
.kbc-header { display: flex; align-items: center; gap: 8px; padding: 14px 14px 10px; }
.kbc-dot { width: 8px; height: 8px; border-radius: 50%; }
.kbc-dot.todo { background: var(--text-muted); }
.kbc-dot.in_progress { background: var(--blue); }
.kbc-dot.blocked { background: var(--red); }
.kbc-dot.done { background: var(--green); }
.kbc-header strong { font-size: 0.82rem; }
.kbc-count { font-size: 0.68rem; background: rgba(0,0,0,0.06); padding: 1px 6px; border-radius: 4px; color: var(--text-muted); }
.kbc-body { padding: 0 10px 14px; }

.kb-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 8px; cursor: grab; transition: all 0.15s; }
.kb-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.kb-card:active { cursor: grabbing; }
.kcard-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.kcard-top strong { font-size: 0.82rem; }
.kcard-urgent { background: var(--red-bg); color: var(--red); width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.kcard-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.kcard-client { font-size: 0.68rem; color: var(--purple); background: var(--purple-bg); padding: 1px 6px; border-radius: 4px; }
.kcard-project { font-size: 0.68rem; padding: 1px 6px; border-radius: 4px; border: 1px solid; }
.kcard-footer { display: flex; justify-content: space-between; }
.kcard-assignee { font-size: 0.7rem; color: var(--text-muted); }
.kcard-due { font-size: 0.7rem; color: var(--text-muted); }
.kcard-due.late { color: var(--red); font-weight: 600; }
.kcard-subtasks { font-size: 0.68rem; color: var(--text-muted); margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border-light); }

.kb-dropzone { min-height: 40px; border: 2px dashed transparent; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 0.78rem; color: var(--text-muted); }
.kb-dropzone:hover { border-color: var(--purple-border); background: var(--purple-bg); }

.sf { display: flex; flex-direction: column; gap: 14px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.ta { resize: vertical; }
.fr { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fa { display: flex; gap: 10px; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-light); }

@media (max-width: 900px) { .kb-board { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .kb-board { grid-template-columns: 1fr; } .fr { grid-template-columns: 1fr; } }
</style>
