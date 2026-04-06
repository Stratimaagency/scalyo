<template>
  <div class="sm-page">
    <!-- SVG Gradient defs -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="sm-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5"/>
          <stop offset="50%" stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
        <linearGradient id="sm-cg-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#16a34a"/><stop offset="100%" stop-color="#4ade80"/>
        </linearGradient>
        <linearGradient id="sm-cg-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#60a5fa"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- Topbar -->
    <header class="sm-topbar">
      <div class="sm-topbar__left">
        <button v-if="store.selectedProject && currentView !== 'projects'" class="sm-back" @click="goToProjects">← {{ lt.back }}</button>
        <h1 class="sm-topbar__title">{{ pageTitle }}</h1>
        <span v-if="store.selectedProject && currentView !== 'projects'" class="sm-topbar__project">{{ store.selectedProject.emoji }} {{ store.selectedProject.name }}</span>
      </div>
      <div class="sm-topbar__actions">
        <!-- Filters -->
        <div v-if="showFilters" class="sm-filters">
          <select v-model="filterStatus" class="sm-filter-select">
            <option value="">{{ lt.allStatus }}</option>
            <option value="todo">{{ lt.todo }}</option>
            <option value="in_progress">{{ lt.inProgress }}</option>
            <option value="blocked">{{ lt.blocked }}</option>
            <option value="done">{{ lt.done }}</option>
          </select>
          <select v-if="store.team.length" v-model="filterAssignee" class="sm-filter-select">
            <option value="">{{ lt.allMembers }}</option>
            <option v-for="m in store.team" :key="m.id" :value="m.id">{{ m.display_name || m.email }}</option>
          </select>
          <select v-model="filterPriority" class="sm-filter-select">
            <option value="">{{ lt.allPriority }}</option>
            <option value="urgent">🔴 {{ lt.urgent }}</option>
            <option value="priority">🟠 {{ lt.priority }}</option>
            <option value="important">🟡 {{ lt.important }}</option>
            <option value="normal">⚪ {{ lt.normal }}</option>
          </select>
        </div>
        <button v-if="store.selectedProject && currentView !== 'projects'" class="sm-btn sm-btn--danger" @click="confirmDeleteProject(store.selectedProject)">🗑️ Supprimer</button>
        <template v-if="currentView === 'projects'">
          <button v-if="bulkSelect.length" class="sm-btn sm-btn--danger" @click="bulkDeleteProjects">🗑️ Supprimer ({{ bulkSelect.length }})</button>
          <button class="sm-btn sm-btn--secondary" @click="toggleBulkMode">{{ bulkMode ? '✕ Annuler' : '☑ Sélectionner' }}</button>
          <button class="sm-btn sm-btn--primary" @click="showCreateProject = true">✨ {{ lt.newProject }}</button>
        </template>
        <button v-if="['tasks','kanban','eisenhower'].includes(currentView)" class="sm-btn sm-btn--secondary" @click="showCreateTask = true">+ {{ lt.newTask }}</button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="store.loading" class="sm-loading">{{ lt.loading }}</div>

    <!-- PROJECTS VIEW (Tree) -->
    <div v-else-if="currentView === 'projects'" class="sm-content">
      <div v-if="store.projects.length">
        <SmTreeView
          :projects="store.projects"
          :tasks="store.tasks"
          :team="store.team"
          :bulk-mode="bulkMode"
          :bulk-select="bulkSelect"
          @toggle-subtask="toggleSubtask"
          @delete-subtask="deleteSubtask"
          @add-subtask="addSubtask"
          @edit-task="openEditTask"
          @delete-task="confirmDeleteTask"
          @delete-project="confirmDeleteProject"
          @toggle-bulk="toggleBulkProject"
        />
      </div>
      <div v-else class="sm-empty">
        <div class="sm-empty__icon">📁</div>
        <h3>{{ lt.noProjects }}</h3>
        <p>{{ lt.noProjectsDesc }}</p>
        <button class="sm-btn sm-btn--primary" @click="showCreateProject = true">✨ {{ lt.createFirst }}</button>
      </div>
    </div>

    <!-- TASKS VIEW -->
    <div v-else-if="currentView === 'tasks'" class="sm-content">
      <SmTaskGroup v-for="(tasks, groupName) in filteredTaskGroups" :key="groupName"
        :group-name="groupName" :tasks="tasks" :team="store.team"
        @toggle-subtask="toggleSubtask" @delete-subtask="deleteSubtask"
        @add-subtask="addSubtask" @transfer="transferTask"
        @edit-task="openEditTask" />
      <div v-if="!filteredTasks.length" class="sm-empty">
        <p>{{ lt.noTasks }}</p>
        <button class="sm-btn sm-btn--secondary" @click="showCreateTask = true">+ {{ lt.newTask }}</button>
      </div>
    </div>

    <!-- KANBAN -->
    <div v-else-if="currentView === 'kanban'" class="sm-content">
      <SmKanbanBoard :tasks="store.selectedProject ? filteredTasks : allTasksFlat" :team="store.team" @update-status="updateTaskStatus" @edit-task="openEditTask" />
    </div>

    <!-- EISENHOWER -->
    <div v-else-if="currentView === 'eisenhower'" class="sm-content">
      <SmEisenhower :tasks="store.selectedProject ? filteredTasks : allTasksFlat" :team="store.team"
        @update-quadrant="updateTaskQuadrant" @transfer="transferTask" @edit-task="openEditTask" />
    </div>

    <!-- PLANNING (project tasks only if project selected, all otherwise) -->
    <div v-else-if="currentView === 'planning'" class="sm-content">
      <SmPlanning :tasks="store.selectedProject ? filteredTasks : allTasksFlat" @create-event="handlePlanningCreateEvent" @edit-event="handlePlanningEditEvent" @move-event="handlePlanningMoveEvent" />
    </div>

    <!-- STATS -->
    <div v-else-if="currentView === 'stats'" class="sm-content">
      <SmStatsDashboard :stats="store.stats" :tasks="store.selectedProject ? filteredTasks : allTasksFlat" />
    </div>

    <!-- TEAM -->
    <div v-else-if="currentView === 'team'" class="sm-content">
      <SmTeamView :team="store.team" :tasks="allTasksFlat" />
    </div>

    <!-- CONFIG -->
    <div v-else-if="currentView === 'config'" class="sm-content">
      <SmConfigView />
    </div>

    <!-- IMPORT -->
    <div v-else-if="currentView === 'import'" class="sm-content">
      <SmImport @import="handleImport" />
    </div>

    <!-- No project selected fallback — auto-create -->
    <div v-else-if="!store.selectedProject && !store.projects.length && ['tasks','kanban','eisenhower','stats'].includes(currentView)" class="sm-content sm-empty">
      <div class="sm-empty__icon">📋</div>
      <h3>{{ lt.noProjects }}</h3>
      <p>{{ lt.noProjectsDesc }}</p>
      <button class="sm-btn sm-btn--primary" @click="showCreateProject = true">✨ {{ lt.createFirst }}</button>
    </div>

    <!-- CREATE PROJECT PANEL -->
    <div v-if="showCreateProject" class="sm-inline-panel">
      <h3 class="sm-inline-panel__title">✨ {{ lt.newProject }}</h3>
      <div class="sm-modal__field">
        <label>{{ lt.projectName }}</label>
        <input v-model="newProject.name" :placeholder="lt.projectNameHint" autofocus />
      </div>
      <div class="sm-modal__field">
        <label>{{ lt.description }}</label>
        <textarea v-model="newProject.description" rows="3" :placeholder="lt.descriptionHint"></textarea>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.startDate }}</label>
          <input v-model="newProject.start_date" type="date" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.targetDate }}</label>
          <input v-model="newProject.target_end_date" type="date" />
        </div>
      </div>
      <div class="sm-modal__field">
        <label>{{ lt.state }}</label>
        <select v-model="newProject.state">
          <option value="active">🟢 {{ lt.active }}</option>
          <option value="priority">🔴 {{ lt.priority }}</option>
          <option value="urgent">⚡ {{ lt.urgent }}</option>
          <option value="important">🟡 {{ lt.important }}</option>
        </select>
      </div>
      <div class="sm-modal__actions">
        <button class="sm-btn sm-btn--secondary" @click="showCreateProject = false">{{ lt.cancel }}</button>
        <button class="sm-btn sm-btn--primary" @click="createProject" :disabled="!newProject.name.trim()">{{ lt.create }}</button>
      </div>
    </div>

    <!-- EDIT TASK PANEL -->
    <div v-if="showEditTask" class="sm-inline-panel">
      <h3 class="sm-inline-panel__title">✏️ {{ lt.editTask }}</h3>
      <div class="sm-modal__field">
        <label>{{ lt.taskName }}</label>
        <input v-model="editTask.name" :placeholder="lt.taskNameHint" autofocus />
      </div>
      <div class="sm-modal__field">
        <label>{{ lt.description }}</label>
        <textarea v-model="editTask.description" rows="2" :placeholder="lt.taskDescHint"></textarea>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.group }}</label>
          <input v-model="editTask.group_name" :placeholder="lt.groupHint" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.state }}</label>
          <select v-model="editTask.priority">
            <option value="normal">⚪ {{ lt.normal }}</option>
            <option value="priority">🔴 {{ lt.priority }}</option>
            <option value="urgent">⚡ {{ lt.urgent }}</option>
            <option value="important">🟡 {{ lt.important }}</option>
          </select>
        </div>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.status }}</label>
          <select v-model="editTask.status">
            <option value="todo">{{ lt.todo }}</option>
            <option value="in_progress">{{ lt.inProgress }}</option>
            <option value="blocked">{{ lt.blocked }}</option>
            <option value="done">{{ lt.done }}</option>
          </select>
        </div>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.estimatedDuration }} (h)</label>
          <input v-model.number="editTask.dur_estimated" type="number" min="0" step="0.5" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.minDuration }} (h)</label>
          <input v-model.number="editTask.dur_min" type="number" min="0" step="0.5" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.maxDuration }} (h)</label>
          <input v-model.number="editTask.dur_max" type="number" min="0" step="0.5" />
        </div>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.startDate }}</label>
          <input v-model="editTask.start_date" type="datetime-local" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.endDate }}</label>
          <input v-model="editTask.end_date" type="datetime-local" />
        </div>
      </div>
      <div class="sm-modal__actions">
        <button class="sm-btn sm-btn--secondary" @click="showEditTask = false">{{ lt.cancel }}</button>
        <button class="sm-btn sm-btn--primary" @click="saveEditTask" :disabled="!editTask.name.trim()">{{ lt.save }}</button>
      </div>
    </div>

    <!-- CREATE TASK PANEL -->
    <div v-if="showCreateTask" class="sm-inline-panel">
      <h3 class="sm-inline-panel__title">📝 {{ lt.newTask }}</h3>
      <div class="sm-modal__field">
        <label>{{ lt.taskName }}</label>
        <input v-model="newTask.name" :placeholder="lt.taskNameHint" autofocus />
      </div>
      <div class="sm-modal__field">
        <label>{{ lt.description }}</label>
        <textarea v-model="newTask.description" rows="2" :placeholder="lt.taskDescHint"></textarea>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.group }}</label>
          <input v-model="newTask.group_name" :placeholder="lt.groupHint" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.state }}</label>
          <select v-model="newTask.priority">
            <option value="normal">⚪ {{ lt.normal }}</option>
            <option value="priority">🔴 {{ lt.priority }}</option>
            <option value="urgent">⚡ {{ lt.urgent }}</option>
            <option value="important">🟡 {{ lt.important }}</option>
          </select>
        </div>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.estimatedDuration }} (h)</label>
          <input v-model.number="newTask.dur_estimated" type="number" min="0" step="0.5" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.minDuration }} (h)</label>
          <input v-model.number="newTask.dur_min" type="number" min="0" step="0.5" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.maxDuration }} (h)</label>
          <input v-model.number="newTask.dur_max" type="number" min="0" step="0.5" />
        </div>
      </div>
      <div class="sm-modal__row">
        <div class="sm-modal__field">
          <label>{{ lt.startDate }}</label>
          <input v-model="newTask.start_date" type="datetime-local" />
        </div>
        <div class="sm-modal__field">
          <label>{{ lt.endDate }}</label>
          <input v-model="newTask.end_date" type="datetime-local" />
        </div>
      </div>
      <div class="sm-modal__field">
        <label>{{ lt.referent }}</label>
        <input v-model="newTask.referent_name" :placeholder="lt.referentHint" />
      </div>
      <div class="sm-modal__actions">
        <button class="sm-btn sm-btn--secondary" @click="showCreateTask = false">{{ lt.cancel }}</button>
        <button class="sm-btn sm-btn--primary" @click="createTask" :disabled="!newTask.name.trim()">{{ lt.create }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useSmartMatriceStore } from '../stores/smartMatrice'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'

import SmProjectCard from '../components/smart-matrice/SmProjectCard.vue'
import SmTreeView from '../components/smart-matrice/SmTreeView.vue'
import SmTaskGroup from '../components/smart-matrice/SmTaskGroup.vue'
import SmKanbanBoard from '../components/smart-matrice/SmKanbanBoard.vue'
import SmEisenhower from '../components/smart-matrice/SmEisenhower.vue'
import SmPlanning from '../components/smart-matrice/SmPlanning.vue'
import SmStatsDashboard from '../components/smart-matrice/SmStatsDashboard.vue'
import SmTeamView from '../components/smart-matrice/SmTeamView.vue'
import SmConfigView from '../components/smart-matrice/SmConfigView.vue'
import SmImport from '../components/smart-matrice/SmImport.vue'

const store = useSmartMatriceStore()
const authStore = useAuthStore()
const prefsStore = usePreferencesStore()

const currentView = computed({
  get: () => store.currentView,
  set: (v) => { store.currentView = v }
})

const smNavItems = [
  { key: 'stats', emoji: '📊', label: 'Stats', group: 'VUE D\'ENSEMBLE' },
  { key: 'planning', emoji: '📅', label: 'Planning', group: 'VUE D\'ENSEMBLE' },
  { key: 'projects', emoji: '📁', label: 'Projets', group: 'GESTION' },
  { key: 'kanban', emoji: '🔥', label: 'Kanban', group: 'GESTION' },
  { key: 'eisenhower', emoji: '🎯', label: 'Priorités', group: 'VUES' },
  { key: 'team', emoji: '👥', label: 'Équipe', group: 'VUES' },
  { key: 'config', emoji: '⚙️', label: 'Réglages', group: 'RÉGLAGES' },
  { key: 'import', emoji: '📥', label: 'Importer', group: 'RÉGLAGES' },
]
// smNavItems defined in AppLayout via store

// Filters
const filterStatus = ref('')
const filterAssignee = ref('')
const filterPriority = ref('')

const showFilters = computed(() => ['tasks', 'kanban', 'eisenhower', 'planning', 'team'].includes(currentView.value))

const currentTasks = computed(() => {
  if (!store.selectedProject) return []
  return store.tasks[store.selectedProject.id] || []
})

const filteredTasks = computed(() => {
  let list = currentTasks.value
  if (filterStatus.value) list = list.filter(t => t.status === filterStatus.value)
  if (filterAssignee.value) list = list.filter(t => t.assigned_to == filterAssignee.value)
  if (filterPriority.value) list = list.filter(t => t.priority === filterPriority.value)
  return list
})

const filteredTaskGroups = computed(() => {
  const groups = {}
  for (const t of filteredTasks.value) {
    const g = t.group_name || 'Sans groupe'
    if (!groups[g]) groups[g] = []
    groups[g].push(t)
  }
  return groups
})

const allTasksFlat = computed(() => {
  const all = []
  for (const pid in store.tasks) all.push(...store.tasks[pid])
  return all
})

// Page title
const currentNavItem = computed(() => smNavItems.find(n => n.key === currentView.value))
const pageTitle = computed(() => currentNavItem.value?.label || 'Smart Matrice')

// Modals
const showCreateProject = ref(false)
const showCreateTask = ref(false)
const showEditTask = ref(false)
const bulkMode = ref(false)
const bulkSelect = ref([])

function toggleBulkMode() {
  bulkMode.value = !bulkMode.value
  bulkSelect.value = []
}
function toggleBulkProject(id) {
  const idx = bulkSelect.value.indexOf(id)
  if (idx >= 0) bulkSelect.value.splice(idx, 1)
  else bulkSelect.value.push(id)
}
async function bulkDeleteProjects() {
  if (!confirm(`Supprimer ${bulkSelect.value.length} projet(s) et toutes leurs tâches ? Cette action est irréversible.`)) return
  for (const id of bulkSelect.value) {
    try { await store.deleteProject(id) } catch {}
  }
  bulkSelect.value = []
  bulkMode.value = false
}
const newProject = reactive({ name: '', description: '', start_date: '', target_end_date: '', state: 'active' })
const newTask = reactive({ name: '', description: '', group_name: '', priority: 'normal', dur_estimated: null, dur_min: null, dur_max: null, start_date: '', end_date: '', referent_name: '' })
const editTask = reactive({ id: null, name: '', description: '', group_name: '', priority: 'normal', status: 'todo', dur_estimated: null, dur_min: null, dur_max: null, start_date: '', end_date: '' })

// i18n
const lang = computed(() => prefsStore.lang)
const i18n = {
  fr: { back: 'Retour', loading: 'Chargement…', allStatus: 'Tous les statuts', todo: 'À faire', inProgress: 'En cours', blocked: 'Bloqué', done: 'Terminé', allMembers: 'Toute l\'équipe', allPriority: 'Toutes priorités', urgent: 'Urgent', priority: 'Prioritaire', important: 'Important', normal: 'Normal', newProject: 'Nouveau projet', newTask: 'Nouvelle tâche', editTask: 'Modifier la tâche', save: 'Enregistrer', status: 'Statut', noProjects: 'Aucun projet', noProjectsDesc: 'Créez votre premier projet pour commencer à organiser vos tâches.', createFirst: 'Créer mon premier projet', noTasks: 'Aucune tâche dans ce projet.', selectProject: 'Sélectionnez un projet', selectProjectDesc: 'Choisissez un projet dans la vue Projets pour voir ses tâches.', goToProjects: 'Voir les projets', projectName: 'Nom du projet', projectNameHint: 'Ex: Refonte site web, Lancement produit...', description: 'Description', descriptionHint: 'Décrivez l\'objectif du projet...', startDate: 'Date de début', targetDate: 'Date cible de fin', endDate: 'Date de fin', state: 'État', active: 'Actif', cancel: 'Annuler', create: 'Créer', taskName: 'Nom de la tâche', taskNameHint: 'Ex: Rédiger cahier des charges...', taskDescHint: 'Décrivez la tâche...', group: 'Groupe / Phase', groupHint: 'Ex: Phase 1, Design, Dev...', estimatedDuration: 'Durée estimée', minDuration: 'Durée min', maxDuration: 'Durée max', referent: 'Référent', referentHint: 'Personne responsable...' },
  en: { back: 'Back', loading: 'Loading…', allStatus: 'All statuses', todo: 'To do', inProgress: 'In progress', blocked: 'Blocked', done: 'Done', allMembers: 'All members', allPriority: 'All priorities', urgent: 'Urgent', priority: 'Priority', important: 'Important', normal: 'Normal', newProject: 'New project', newTask: 'New task', editTask: 'Edit task', save: 'Save', status: 'Status', noProjects: 'No projects', noProjectsDesc: 'Create your first project to start organizing your tasks.', createFirst: 'Create my first project', noTasks: 'No tasks in this project.', selectProject: 'Select a project', selectProjectDesc: 'Choose a project from the Projects view to see its tasks.', goToProjects: 'View projects', projectName: 'Project name', projectNameHint: 'E.g.: Website redesign, Product launch...', description: 'Description', descriptionHint: 'Describe the project goal...', startDate: 'Start date', targetDate: 'Target end date', endDate: 'End date', state: 'State', active: 'Active', cancel: 'Cancel', create: 'Create', taskName: 'Task name', taskNameHint: 'E.g.: Write requirements doc...', taskDescHint: 'Describe the task...', group: 'Group / Phase', groupHint: 'E.g.: Phase 1, Design, Dev...', estimatedDuration: 'Estimated duration', minDuration: 'Min duration', maxDuration: 'Max duration', referent: 'Referent', referentHint: 'Responsible person...' },
  kr: { back: '뒤로', loading: '로딩 중…', allStatus: '모든 상태', todo: '할 일', inProgress: '진행 중', blocked: '차단됨', done: '완료', allMembers: '모든 멤버', allPriority: '모든 우선순위', urgent: '긴급', priority: '우선', important: '중요', normal: '보통', newProject: '새 프로젝트', newTask: '새 작업', editTask: '작업 수정', save: '저장', status: '상태', noProjects: '프로젝트 없음', noProjectsDesc: '첫 번째 프로젝트를 만들어 작업을 정리하세요.', createFirst: '첫 프로젝트 만들기', noTasks: '이 프로젝트에 작업이 없습니다.', selectProject: '프로젝트 선택', selectProjectDesc: '프로젝트 뷰에서 프로젝트를 선택하세요.', goToProjects: '프로젝트 보기', projectName: '프로젝트 이름', projectNameHint: '예: 웹사이트 리디자인, 제품 출시...', description: '설명', descriptionHint: '프로젝트 목표를 설명하세요...', startDate: '시작일', targetDate: '목표 종료일', endDate: '종료일', state: '상태', active: '활성', cancel: '취소', create: '만들기', taskName: '작업 이름', taskNameHint: '예: 요구사항 문서 작성...', taskDescHint: '작업을 설명하세요...', group: '그룹 / 단계', groupHint: '예: 1단계, 디자인, 개발...', estimatedDuration: '예상 기간', minDuration: '최소 기간', maxDuration: '최대 기간', referent: '담당자', referentHint: '책임자...' },
}
const lt = computed(() => i18n[lang.value] || i18n.fr)

// Actions
function goToProjects() { store.selectProject(null); currentView.value = 'projects' }

function selectProject(project) {
  store.selectProject(project)
  currentView.value = 'tasks'
}

async function confirmDeleteProject(project) {
  if (!confirm(`Supprimer le projet "${project.name}" et toutes ses tâches ? Cette action est irréversible.`)) return
  try {
    await store.deleteProject(project.id)
  } catch (e) {
    console.error('Delete project error:', e)
  }
}

async function confirmDeleteTask(task) {
  if (!confirm(`Supprimer la tâche "${task.name}" ? Cette action est irréversible.`)) return
  try {
    await store.deleteTask(task.id)
  } catch (e) {
    console.error('Delete task error:', e)
  }
}

async function createProject() {
  const p = await store.createProject({
    name: newProject.name.trim(),
    description: newProject.description,
    start_date: newProject.start_date || null,
    end_date: newProject.target_end_date || null,
    target_end_date: newProject.target_end_date || null,
    state: newProject.state,
    emoji: '📁',
  })
  Object.assign(newProject, { name: '', description: '', start_date: '', target_end_date: '', state: 'active' })
  showCreateProject.value = false
  selectProject(p)
}

async function createTask() {
  await store.createTask({
    project_id: store.selectedProject.id,
    name: newTask.name.trim(),
    description: newTask.description,
    group_name: newTask.group_name,
    priority: newTask.priority,
    status: 'todo',
    dur_estimated: newTask.dur_estimated,
    dur_min: newTask.dur_min,
    dur_max: newTask.dur_max,
    start_date: newTask.start_date || null,
    end_date: newTask.end_date || null,
    referent_name: newTask.referent_name,
  })
  Object.assign(newTask, { name: '', description: '', group_name: '', priority: 'normal', dur_estimated: null, dur_min: null, dur_max: null, start_date: '', end_date: '', referent_name: '' })
  showCreateTask.value = false
}

function openEditTask(task) {
  Object.assign(editTask, {
    id: task.id,
    name: task.name || '',
    description: task.description || '',
    group_name: task.group_name || '',
    priority: task.priority || 'normal',
    status: task.status || 'todo',
    dur_estimated: task.dur_estimated || null,
    dur_min: task.dur_min || null,
    dur_max: task.dur_max || null,
    start_date: task.start_date || '',
    end_date: task.end_date || '',
  })
  showEditTask.value = true
  nextTick(() => {
    document.querySelector('.sm-inline-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function saveEditTask() {
  await store.updateTask(editTask.id, {
    name: editTask.name.trim(),
    description: editTask.description,
    group_name: editTask.group_name,
    priority: editTask.priority,
    status: editTask.status,
    dur_estimated: editTask.dur_estimated,
    dur_min: editTask.dur_min,
    dur_max: editTask.dur_max,
    start_date: editTask.start_date || null,
    end_date: editTask.end_date || null,
  })
  showEditTask.value = false
}

function handlePlanningCreateEvent({ date, hour }) {
  const dateStr = date.toISOString().slice(0, 10)
  const hourStr = String(hour).padStart(2, '0')
  Object.assign(newTask, { name: '', description: '', group_name: '', priority: 'normal', dur_estimated: 1, dur_min: null, dur_max: null, start_date: dateStr + 'T' + hourStr + ':00', end_date: '', referent_name: '' })
  showCreateTask.value = true
}

function handlePlanningEditEvent(task) {
  openEditTask(task)
}

async function handlePlanningMoveEvent({ task, start_date, dur_estimated }) {
  const updates = {}
  if (start_date) updates.start_date = start_date
  if (dur_estimated !== undefined) updates.dur_estimated = dur_estimated
  if (Object.keys(updates).length) {
    await store.updateTask(task.id, updates)
  }
}

async function toggleSubtask(taskId, subId) { await store.toggleSubtask(taskId, subId) }
async function deleteSubtask(taskId, subId) { await store.deleteSubtask(taskId, subId) }
async function addSubtask(taskId, name) { await store.addSubtask(taskId, name) }
async function transferTask(taskId, memberId) { await store.transferTask(taskId, memberId) }

async function updateTaskStatus(taskId, status) {
  const updates = { status }
  // Sync Kanban → Eisenhower
  if (status === 'done') updates.quadrant = 4
  else if (status === 'in_progress' && !getCurrentQuadrant(taskId)) updates.quadrant = 1
  else if (status === 'blocked') updates.quadrant = 3
  await store.updateTask(taskId, updates)
}

async function updateTaskQuadrant(taskId, quadrant) {
  const updates = { quadrant }
  // Sync Eisenhower → Kanban
  if (quadrant === 4) updates.status = 'done'
  else if (quadrant === 1) updates.status = 'in_progress'
  else if (quadrant === 3) updates.status = 'todo'
  else if (quadrant === 2) updates.status = 'todo'
  await store.updateTask(taskId, updates)
}

function getCurrentQuadrant(taskId) {
  const allTasks = store.selectedProject ? (store.tasks[store.selectedProject.id] || []) : []
  const task = allTasks.find(t => t.id === taskId)
  return task?.quadrant || 0
}

async function handleImport(tasks) {
  if (!store.selectedProject) {
    const p = await store.createProject({ name: 'Projet importé', emoji: '📥' })
    store.selectProject(p)
    await store.importTasks(p.id, tasks)
  } else {
    await store.importTasks(store.selectedProject.id, tasks)
  }
  currentView.value = 'tasks'
}

// Init
onMounted(async () => {
  store.userName = authStore.user?.display_name || ''
  await Promise.all([store.fetchProjects(), store.fetchTeam()])
  // Fetch tasks for all projects (needed for tree view)
  await Promise.all(store.projects.map(p => store.fetchTasks(p.id).catch(() => {})))
  // Auto-select first project so all views work immediately
  if (store.projects.length && !store.selectedProject) {
    await store.selectProject(store.projects[0])
  }
})

watch(() => store.selectedProject, async (p) => {
  if (p?.id) {
    await store.fetchTasks(p.id)
    if (currentView.value === 'stats') await store.fetchStats(p.id)
  }
})

watch(currentView, async (v) => {
  if (v === 'stats' && store.selectedProject?.id) await store.fetchStats(store.selectedProject.id)
})
</script>

<style scoped>
.sm-page { font-family: 'DM Sans', sans-serif; }
.sm-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; gap: 16px; flex-wrap: wrap; background: linear-gradient(135deg, rgba(79,70,229,.07), rgba(124,58,237,.07), rgba(168,85,247,.05)); border: 1px solid rgba(79,70,229,.12); border-radius: 16px; margin-bottom: 20px; }
.sm-topbar__left { display: flex; align-items: center; gap: 12px; }
.sm-topbar__title { font-family: 'DM Sans', sans-serif; font-weight: 900; font-size: 22px; letter-spacing: -0.5px; color: var(--sm-t1); margin: 0; }
.sm-topbar__project { font-size: 14px; color: var(--sm-t3); }
.sm-topbar__actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sm-back { border: none; background: none; color: var(--sm-t3); font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 4px 0; }
.sm-back:hover { color: var(--sm-t1); }

/* Filters */
.sm-filters { display: flex; gap: 8px; }
.sm-filter-select {
  border: 1px solid var(--sm-bd); background: #fff; border-radius: 8px;
  padding: 6px 10px; font-size: 12px; font-family: 'DM Sans', sans-serif;
  color: var(--sm-t1); outline: none; cursor: pointer;
}
.sm-filter-select:focus { border-color: #3b82f6; }

/* Buttons */
.sm-btn {
  border: none; border-radius: 10px; padding: 9px 20px;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all .15s; white-space: nowrap;
}
.sm-btn--primary { background: var(--sm-grad); color: white; box-shadow: 0 3px 12px rgba(124,58,237,.25); }
.sm-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(59,130,246,.25); }
.sm-btn--primary:disabled { opacity: .5; transform: none; }
.sm-btn--secondary { background: #fff; border: 1px solid var(--sm-bd); color: var(--sm-t1); }
.sm-btn--secondary:hover { border-color: #3b82f6; color: #3b82f6; }
.sm-btn--danger { background: transparent; border: 1px solid var(--sm-err); color: var(--sm-err); font-size: 12px; }
.sm-btn--danger:hover { background: var(--sm-err); color: #fff; }

/* Content */
.sm-content { }
.sm-loading { padding: 40px; text-align: center; color: var(--sm-t3); font-size: 15px; }
.sm-empty { text-align: center; padding: 80px 20px; }
.sm-empty__icon { font-size: 48px; margin-bottom: 12px; }
.sm-empty h3 { font-size: 18px; font-weight: 700; color: var(--sm-t1); margin: 0 0 6px; }
.sm-empty p { font-size: 14px; color: var(--sm-t3); margin: 0 0 20px; }
.sm-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

/* Inline panels (replaced modals) */
.sm-inline-panel {
  background: #fff; border: 2px solid var(--tealBorder, var(--sm-bd)); border-radius: 12px;
  padding: 16px; margin-bottom: 16px; max-width: 560px;
}
.sm-inline-panel__title { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 22px; color: var(--sm-t1); margin: 0 0 20px; }
.sm-modal__field { margin-bottom: 14px; display: flex; flex-direction: column; gap: 5px; }
.sm-modal__field label { font-size: 12px; font-weight: 600; color: var(--sm-t2); }
.sm-modal__field input, .sm-modal__field textarea, .sm-modal__field select {
  border: 1px solid var(--sm-bd); background: #fff; border-radius: 10px;
  padding: 10px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: var(--sm-t1); outline: none; resize: vertical;
}
.sm-modal__field input:focus, .sm-modal__field textarea:focus, .sm-modal__field select:focus { border-color: #3b82f6; }
.sm-modal__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.sm-modal__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
</style>
