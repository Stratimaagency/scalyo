<template>
  <div class="sm-page">
    <!-- SVG Gradient defs (global for all child components) -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="sm-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e"/>
          <stop offset="18%" stop-color="#f97316"/>
          <stop offset="33%" stop-color="#eab308"/>
          <stop offset="50%" stop-color="#22c55e"/>
          <stop offset="66%" stop-color="#06b6d4"/>
          <stop offset="82%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="sm-cg-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#16a34a"/>
          <stop offset="100%" stop-color="#4ade80"/>
        </linearGradient>
        <linearGradient id="sm-cg-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb"/>
          <stop offset="100%" stop-color="#60a5fa"/>
        </linearGradient>
        <linearGradient id="sm-cg-z" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- Topbar -->
    <header class="sm-topbar">
      <h1 class="sm-topbar__title">{{ currentNavItem?.label || 'Projets' }}</h1>
      <div class="sm-topbar__actions">
        <button v-if="currentView === 'projects'" class="sm-topbar__btn sm-topbar__btn--secondary" @click="createTask">
          + Tâche
        </button>
        <button v-if="currentView === 'projects'" class="sm-topbar__btn sm-topbar__btn--primary" @click="createProject">
          ✨ Nouveau projet
        </button>
      </div>
    </header>

    <!-- Loading state -->
    <div v-if="store.loading" class="sm-loading">Chargement…</div>

    <!-- Projects view -->
    <div v-else-if="currentView === 'projects'" class="sm-content">
      <div v-if="store.projects.length" class="sm-projects-grid">
        <SmProjectCard v-for="p in store.projects" :key="p.id" :project="p"
          :selected="store.selectedProject?.id === p.id"
          @select-project="selectProject" />
      </div>
      <div v-else class="sm-empty">
        <p>Aucun projet. Créez votre premier projet pour démarrer.</p>
      </div>
    </div>

    <!-- Tasks view (grouped) -->
    <div v-else-if="currentView === 'tasks' && store.selectedProject" class="sm-content">
      <div class="sm-project-header">
        <span class="sm-project-header__emoji">{{ store.selectedProject.emoji }}</span>
        <h2 class="sm-project-header__name">{{ store.selectedProject.name }}</h2>
      </div>
      <SmTaskGroup v-for="(tasks, groupName) in taskGroups" :key="groupName"
        :group-name="groupName" :tasks="tasks" :team="store.team"
        @toggle-subtask="toggleSubtask" @delete-subtask="deleteSubtask"
        @add-subtask="addSubtask" @transfer="transferTask" />
      <div v-if="!currentTasks.length" class="sm-empty"><p>Aucune tâche dans ce projet.</p></div>
    </div>

    <!-- Kanban -->
    <div v-else-if="currentView === 'kanban' && store.selectedProject" class="sm-content">
      <SmKanbanBoard :tasks="currentTasks" :team="store.team" @update-status="updateTaskStatus" />
    </div>

    <!-- Eisenhower -->
    <div v-else-if="currentView === 'eisenhower' && store.selectedProject" class="sm-content">
      <SmEisenhower :tasks="currentTasks" :team="store.team"
        @update-quadrant="updateTaskQuadrant" @transfer="transferTask" />
    </div>

    <!-- Planning -->
    <div v-else-if="currentView === 'planning'" class="sm-content">
      <SmPlanning :tasks="allTasksFlat" />
    </div>

    <!-- Stats -->
    <div v-else-if="currentView === 'stats' && store.selectedProject" class="sm-content">
      <SmStatsDashboard :stats="store.stats" />
    </div>

    <!-- Team -->
    <div v-else-if="currentView === 'team'" class="sm-content">
      <SmTeamView :team="store.team" :tasks="allTasksFlat" />
    </div>

    <!-- Config -->
    <div v-else-if="currentView === 'config'" class="sm-content">
      <SmConfigView />
    </div>

    <!-- Import -->
    <div v-else-if="currentView === 'import'" class="sm-content">
      <SmImport @import="handleImport" />
    </div>

    <!-- No project selected -->
    <div v-else-if="!store.selectedProject && ['tasks', 'kanban', 'eisenhower', 'stats'].includes(currentView)" class="sm-content sm-empty">
      <p>Sélectionnez un projet d'abord dans la vue Projets.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useSmartMatriceStore } from '../stores/smartMatrice'
import { useAuthStore } from '../stores/auth'

import SmProjectCard from '../components/smart-matrice/SmProjectCard.vue'
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

const currentView = ref('projects')

// Expose currentView to AppLayout for sidebar navigation
provide('sm-current-view', currentView)

const smNavItems = [
  { key: 'projects', emoji: '📁', label: 'Projets', group: 'VUE D\'ENSEMBLE' },
  { key: 'stats', emoji: '📊', label: 'Stats', group: 'VUE D\'ENSEMBLE' },
  { key: 'tasks', emoji: '⚡', label: 'Tâches', group: 'GESTION' },
  { key: 'planning', emoji: '📅', label: 'Planning', group: 'GESTION' },
  { key: 'kanban', emoji: '🔥', label: 'Kanban', group: 'VUES' },
  { key: 'eisenhower', emoji: '🎯', label: 'Priorités', group: 'VUES' },
  { key: 'team', emoji: '👥', label: 'Équipe', group: 'VUES' },
  { key: 'config', emoji: '⚙️', label: 'Réglages', group: 'RÉGLAGES' },
  { key: 'import', emoji: '📥', label: 'Importer', group: 'RÉGLAGES' },
]

// Provide nav items for AppLayout sidebar
provide('sm-nav-items', smNavItems)

const currentNavItem = computed(() => smNavItems.find(n => n.key === currentView.value))

const currentTasks = computed(() => {
  if (!store.selectedProject) return []
  return store.tasks[store.selectedProject.id] || []
})

const taskGroups = computed(() => {
  const groups = {}
  for (const t of currentTasks.value) {
    const g = t.group_name || 'Sans groupe'
    if (!groups[g]) groups[g] = []
    groups[g].push(t)
  }
  return groups
})

const allTasksFlat = computed(() => {
  const all = []
  for (const pid in store.tasks) {
    all.push(...store.tasks[pid])
  }
  return all
})

onMounted(async () => {
  store.userName = authStore.user?.display_name || ''
  await Promise.all([
    store.fetchProjects(),
    store.fetchTeam(),
  ])
})

watch(() => store.selectedProject, async (p) => {
  if (p) {
    await store.fetchTasks(p.id)
    if (currentView.value === 'stats') await store.fetchStats(p.id)
  }
})

watch(currentView, async (v) => {
  if (v === 'stats' && store.selectedProject) await store.fetchStats(store.selectedProject.id)
})

function selectProject(project) {
  store.selectProject(project)
  currentView.value = 'tasks'
}

async function createProject() {
  await store.createProject({ name: 'Nouveau projet', emoji: '📁' })
}

async function createTask() {
  if (!store.selectedProject) return
  await store.createTask({ project_id: store.selectedProject.id, name: 'Nouvelle tâche', status: 'todo' })
}

async function toggleSubtask(taskId, subId) { await store.toggleSubtask(taskId, subId) }
async function deleteSubtask(taskId, subId) { await store.deleteSubtask(taskId, subId) }
async function addSubtask(taskId, name) { await store.addSubtask(taskId, name) }
async function transferTask(taskId, memberId) { await store.transferTask(taskId, memberId) }
async function updateTaskStatus(taskId, status) { await store.updateTask(taskId, { status }) }
async function updateTaskQuadrant(taskId, quadrant) { await store.updateTask(taskId, { quadrant }) }

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
</script>

<style scoped>
.sm-page { font-family: 'DM Sans', sans-serif; }
.sm-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0 20px; margin-bottom: 4px;
}
.sm-topbar__title {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 24px;
  color: var(--sm-t1); margin: 0;
}
.sm-topbar__actions { display: flex; gap: 8px; }
.sm-topbar__btn {
  border: none; border-radius: 10px; padding: 9px 20px;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all .15s;
}
.sm-topbar__btn--primary { background: var(--sm-grad); color: white; }
.sm-topbar__btn--primary:hover { opacity: .9; }
.sm-topbar__btn--secondary { background: var(--sm-white); border: 1px solid var(--sm-bd); color: var(--sm-t1); }
.sm-topbar__btn--secondary:hover { border-color: var(--sm-terra); color: var(--sm-terra); }
.sm-content { }
.sm-loading { padding: 40px; text-align: center; color: var(--sm-t3); font-size: 14px; }
.sm-empty { text-align: center; padding: 60px 20px; color: var(--sm-t3); font-size: 14px; }
.sm-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.sm-project-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.sm-project-header__emoji { font-size: 28px; }
.sm-project-header__name {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 24px;
  color: var(--sm-t1); margin: 0;
}
</style>
