<template>
  <div class="fade-in">
    <div class="flex-between mb-md">
      <div>
        <div style="display: flex; gap: 8px; align-items: center">
          <h3 style="font-weight: 800">{{ t('tasks') }}</h3>
          <span class="tag risk-low" v-if="doneTasks.length">{{ doneTasks.length }} {{ t('taskDone') }}</span>
        </div>
      </div>
      <button class="btn btn-primary" @click="showAdd = true">{{ t('newTask') }}</button>
    </div>

    <!-- Filter -->
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px">
      <button class="chip" :class="{ active: filterQ === 'all' }" @click="filterQ = 'all'">{{ t('taskAll') }}</button>
      <button v-for="q in quadrants" :key="q.key" class="chip" :class="{ active: filterQ === q.key }" @click="filterQ = q.key">
        {{ q.icon }} {{ q.label }}
      </button>
    </div>

    <!-- Kanban columns -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px">
      <div v-for="col in columns" :key="col.key" style="min-height: 200px">
        <div style="font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; display: flex; justify-content: space-between">
          <span>{{ col.label }}</span>
          <span class="tag" :style="{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }">
            {{ columnTasks(col.key).length }}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <div
            v-for="task in columnTasks(col.key)" :key="task.id"
            class="card"
            style="padding: 12px 14px; cursor: grab"
            draggable="true"
            @dragstart="dragTask = task"
            @click="editingTask = task"
          >
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px">{{ task.title }}</div>
            <div v-if="task.note" style="font-size: 11px; color: var(--muted); margin-bottom: 6px">{{ task.note }}</div>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap">
              <span v-if="task.quadrant" class="tag" style="font-size: 10px; background: var(--surface); color: var(--muted); border: 1px solid var(--border)">
                {{ quadrants.find(q => q.key === task.quadrant)?.icon }} {{ task.quadrant }}
              </span>
              <span v-if="task.due" style="font-size: 10px; color: var(--muted)">{{ task.due }}</span>
              <span v-if="isOverdue(task)" style="font-size: 10px; color: var(--red); font-weight: 700">{{ t('overdue') }}</span>
            </div>
          </div>
        </div>
        <div
          style="border: 2px dashed var(--border); border-radius: 12px; padding: 20px; text-align: center; color: var(--muted); font-size: 12px; margin-top: 8px"
          @dragover.prevent
          @drop="dropTask(col.key)"
        >
          {{ t('taskDrop') }}
        </div>
      </div>
    </div>

    <!-- Add task modal -->
    <AppModal v-if="showAdd" :title="t('newTask')" @close="showAdd = false">
      <AppField :label="t('taskTitle')" v-model="newTask.title" required />
      <AppField :label="t('taskNote')" v-model="newTask.note" type="textarea" />
      <div class="field-group">
        <label class="field-label">{{ t('taskQuadrant') }}</label>
        <select v-model="newTask.quadrant" class="field-input">
          <option v-for="q in quadrants" :key="q.key" :value="q.key">{{ q.icon }} {{ q.label }}</option>
        </select>
      </div>
      <AppField :label="t('taskDue')" v-model="newTask.due" type="date" />
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-secondary" @click="showAdd = false">{{ t('cancel') }}</button>
        <button class="btn btn-primary" @click="addTask">{{ t('taskAdd') }}</button>
      </div>
    </AppModal>

    <!-- Edit task modal -->
    <AppModal v-if="editingTask" :title="t('editTask')" @close="editingTask = null">
      <AppField :label="t('taskTitle')" v-model="editingTask.title" required />
      <AppField :label="t('taskNote')" v-model="editingTask.note" type="textarea" />
      <div class="field-group">
        <label class="field-label">Status</label>
        <select v-model="editingTask.status" class="field-input">
          <option v-for="col in columns" :key="col.key" :value="col.key">{{ col.label }}</option>
        </select>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-danger" @click="removeTask(editingTask)">{{ t('delete') }}</button>
        <button class="btn btn-primary" @click="saveAll(); editingTask = null">{{ t('taskUpdate') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { taskApi } from '../api'
import { useI18n } from '../i18n'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'

const { t } = useI18n()
const tasks = ref([])
const showAdd = ref(false)
const editingTask = ref(null)
const filterQ = ref('all')
const dragTask = ref(null)

const quadrants = [
  { key: 'urgent-important', icon: '🔴', label: 'Urgent & Important' },
  { key: 'not-urgent-important', icon: '🟡', label: 'Important' },
  { key: 'urgent-not-important', icon: '🟠', label: 'Urgent' },
  { key: 'not-urgent-not-important', icon: '🔵', label: 'Low priority' },
]

const columns = computed(() => [
  { key: 'todo', label: t('todoCol') },
  { key: 'inprogress', label: t('inProgressCol') },
  { key: 'done', label: t('doneCol') },
])

const newTask = ref({ title: '', note: '', quadrant: 'urgent-important', due: '', status: 'todo' })

onMounted(async () => {
  try {
    const { data } = await taskApi.getTasks()
    tasks.value = data.tasks || []
  } catch {}
})

const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

function columnTasks(status) {
  let list = tasks.value.filter(t => t.status === status)
  if (filterQ.value !== 'all') list = list.filter(t => t.quadrant === filterQ.value)
  return list
}

function isOverdue(task) {
  if (!task.due || task.status === 'done') return false
  return new Date(task.due) < new Date()
}

function addTask() {
  tasks.value.push({ ...newTask.value, id: Date.now().toString() })
  newTask.value = { title: '', note: '', quadrant: 'urgent-important', due: '', status: 'todo' }
  showAdd.value = false
  saveAll()
}

function removeTask(task) {
  tasks.value = tasks.value.filter(t => t.id !== task.id)
  editingTask.value = null
  saveAll()
}

function dropTask(status) {
  if (!dragTask.value) return
  dragTask.value.status = status
  dragTask.value = null
  saveAll()
}

async function saveAll() {
  await taskApi.saveTasks(tasks.value)
}
</script>
