<template>
  <div class="projects-view">
    <div class="pj-header">
      <h1>📁 {{ t('sm_projects_title') }}</h1>
      <button class="btn-primary" @click="slideOpen = true">{{ t('sm_new_project') }}</button>
    </div>

    <div v-if="tasks.projects.length" class="pj-list">
      <div v-for="proj in tasks.projects" :key="proj.id" class="pj-card">
        <div class="pjc-header" @click="toggleProject(proj.id)">
          <div class="pjc-left">
            <span class="pjc-chevron">{{ openProjects[proj.id] ? '▾' : '▸' }}</span>
            <span class="pjc-dot" :style="{ background: proj.color }" />
            <strong>{{ proj.name }}</strong>
          </div>
          <span class="pjc-count">{{ projectTasks(proj.id).length }} {{ t('sm_tasks_count') }}</span>
        </div>
        <transition name="slide-up">
          <div v-if="openProjects[proj.id]" class="pjc-tasks">
            <div v-for="task in projectTasks(proj.id)" :key="task.id" class="pjt-row">
              <div class="pjt-main">
                <span class="pjt-status" :class="task.status" />
                <div class="pjt-info">
                  <div class="pjt-title-row">
                    <strong>{{ task.title }}</strong>
                    <span class="pjt-badge" :class="task.status">{{ t('status_' + task.status) }}</span>
                  </div>
                  <div class="pjt-meta">
                    <span v-if="task.clientId" class="pjt-client">{{ clientName(task.clientId) }}</span>
                    <span class="pjt-due">{{ task.dueDate }}</span>
                  </div>
                </div>
              </div>
              <!-- Recursive subtasks (infinite nesting) -->
              <div v-if="task.subtasks?.length" class="pjt-subtasks">
                <RecursiveSubtask
                  v-for="st in task.subtasks"
                  :key="st.id"
                  :subtask="st"
                  :depth="0"
                  :add-label="t('add')"
                  @toggle="toggleSubtask(task, $event)"
                  @add-child="addChildSubtask(task, $event)"
                />
              </div>
              <button class="pjt-add-sub" @click="addTopSubtask(task)">+ {{ t('add') }}</button>
            </div>
            <div v-if="!projectTasks(proj.id).length" class="pjt-empty">{{ t('sm_no_tasks') }}</div>
          </div>
        </transition>
      </div>
    </div>

    <div v-else class="pj-empty">
      <div class="empty-icon">📁</div>
      <h3>{{ t('sm_no_projects') }}</h3>
      <button class="btn-primary" @click="slideOpen = true">{{ t('sm_new_project') }}</button>
    </div>

    <SlideOver :open="slideOpen" :title="t('sm_new_project')" @close="slideOpen = false">
      <form @submit.prevent="createProject" class="sf">
        <div class="fg"><label>{{ t('sm_project_name') }} *</label><input v-model="newName" required class="fi" /></div>
        <div class="fg"><label>{{ t('sm_project_color') }}</label>
          <div class="color-picks">
            <button v-for="c in colors" :key="c" type="button" class="cpick" :class="{ active: newColor === c }" :style="{ background: c }" @click="newColor = c" />
          </div>
        </div>
        <div class="fa">
          <button type="button" class="btn-outline" @click="slideOpen = false">{{ t('cancel') }}</button>
          <button type="submit" class="btn-primary">{{ t('create') }}</button>
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
import SlideOver from '@/components/SlideOver.vue'
import RecursiveSubtask from '@/components/RecursiveSubtask.vue'

const { t } = useI18n({ useScope: 'global' })
const tasks = useTaskStore()
const clients = useClientStore()

const slideOpen = ref(false)
const newName = ref('')
const newColor = ref('#7c3aed')
const openProjects = reactive({})
const colors = ['#7c3aed', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

if (tasks.projects.length) openProjects[tasks.projects[0].id] = true

function toggleProject(id) { openProjects[id] = !openProjects[id] }
function projectTasks(pid) { return tasks.tasks.filter(t => t.projectId === pid) }
function clientName(id) { return clients.clients.find(c => c.id === id)?.name || '' }

function createProject() {
  tasks.addProject({ name: newName.value, color: newColor.value })
  newName.value = ''
  slideOpen.value = false
}

// Recursive subtask helpers
function findSubtask(subtasks, id) {
  for (const st of subtasks) {
    if (st.id === id) return st
    if (st.children?.length) {
      const found = findSubtask(st.children, id)
      if (found) return found
    }
  }
  return null
}

function toggleSubtask(task, subtaskId) {
  const st = findSubtask(task.subtasks, subtaskId)
  if (st) st.done = !st.done
}

function addChildSubtask(task, parentId) {
  const parent = findSubtask(task.subtasks, parentId)
  if (parent) {
    if (!parent.children) parent.children = []
    parent.children.push({ id: 'st_' + Date.now(), title: 'Nouvelle sous-tâche', done: false, children: [] })
  }
}

function addTopSubtask(task) {
  if (!task.subtasks) task.subtasks = []
  task.subtasks.push({ id: 'st_' + Date.now(), title: 'Nouvelle sous-tâche', done: false, children: [] })
}
</script>

<style scoped>
.projects-view { max-width: 900px; }
.pj-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.pj-header h1 { font-size: 1.5rem; font-weight: 800; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; }

.pj-list { display: flex; flex-direction: column; gap: 12px; }
.pj-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.pjc-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: background 0.15s; }
.pjc-header:hover { background: var(--bg-hover); }
.pjc-left { display: flex; align-items: center; gap: 10px; }
.pjc-chevron { font-size: 0.8rem; color: var(--text-muted); width: 14px; }
.pjc-dot { width: 10px; height: 10px; border-radius: 50%; }
.pjc-count { font-size: 0.78rem; color: var(--text-muted); }

.pjc-tasks { border-top: 1px solid var(--border-light); }
.pjt-row { padding: 12px 20px 12px 40px; border-bottom: 1px solid var(--border-light); }
.pjt-row:last-child { border-bottom: none; }
.pjt-main { display: flex; align-items: flex-start; gap: 10px; }
.pjt-status { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
.pjt-status.todo { background: var(--text-muted); }
.pjt-status.in_progress { background: var(--blue); }
.pjt-status.blocked { background: var(--red); }
.pjt-status.done { background: var(--green); }
.pjt-info { flex: 1; min-width: 0; }
.pjt-title-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.pjt-info strong { font-size: 0.85rem; }
.pjt-meta { display: flex; gap: 8px; margin-top: 3px; }
.pjt-client { font-size: 0.7rem; color: var(--purple); background: var(--purple-bg); padding: 1px 6px; border-radius: 4px; }
.pjt-due { font-size: 0.7rem; color: var(--text-muted); }
.pjt-badge { font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; flex-shrink: 0; }
.pjt-badge.todo { background: var(--bg); color: var(--text-muted); }
.pjt-badge.in_progress { background: var(--blue-bg); color: var(--blue); }
.pjt-badge.blocked { background: var(--red-bg); color: var(--red); }
.pjt-badge.done { background: var(--green-bg); color: var(--green); }

.pjt-subtasks { margin-top: 8px; margin-left: 18px; border-left: 2px solid var(--border-light); padding-left: 4px; }

.pjt-add-sub { background: none; border: 1px dashed var(--border); padding: 4px 12px; border-radius: 6px; font-size: 0.72rem; color: var(--text-muted); cursor: pointer; margin-top: 8px; margin-left: 18px; transition: all 0.15s; }
.pjt-add-sub:hover { border-color: var(--purple); color: var(--purple); background: var(--purple-bg); }

.pjt-empty { padding: 16px 52px; font-size: 0.82rem; color: var(--text-muted); }

.pj-empty { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.pj-empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; }

.sf { display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.fa { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); }
.color-picks { display: flex; gap: 8px; }
.cpick { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; }
.cpick.active { border-color: var(--text); transform: scale(1.15); }
</style>
