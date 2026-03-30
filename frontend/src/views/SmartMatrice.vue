<template>
  <div class="sm-layout">
    <!-- SVG Gradient defs (global for all child components) -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="sm-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8603a"/>
          <stop offset="35%" stop-color="#e8507a"/>
          <stop offset="70%" stop-color="#9b5acd"/>
          <stop offset="100%" stop-color="#e8a020"/>
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

    <!-- Sidebar -->
    <aside class="sm-sidebar">
      <!-- Profile switcher -->
      <div class="sm-sidebar__profile">
        <button v-for="p in profiles" :key="p.key" class="sm-sidebar__profile-btn"
          :class="{ 'sm-sidebar__profile-btn--active': store.profile === p.key }"
          @click="store.setProfile(p.key)">
          {{ p.emoji }} <span class="sm-sidebar__profile-label">{{ profileLabel(p) }}</span>
        </button>
      </div>

      <!-- Nav items -->
      <nav class="sm-sidebar__nav">
        <button v-for="item in navItems" :key="item.key" class="sm-sidebar__nav-btn"
          :class="{ 'sm-sidebar__nav-btn--active': currentView === item.key }"
          @click="currentView = item.key">
          <span class="sm-sidebar__nav-icon">{{ item.emoji }}</span>
          <span class="sm-sidebar__nav-label">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="sm-main">
      <!-- Topbar -->
      <header class="sm-topbar">
        <h1 class="sm-topbar__title">{{ currentNavItem?.label || 'Smart Matrice' }}</h1>
        <div class="sm-topbar__actions">
          <button v-if="currentView === 'projects'" class="sm-topbar__btn sm-topbar__btn--primary" @click="createProject">
            + Nouveau projet
          </button>
          <button v-if="store.selectedProject && ['tasks', 'kanban', 'eisenhower'].includes(currentView)"
            class="sm-topbar__btn sm-topbar__btn--secondary" @click="createTask">
            + Nouvelle tâche
          </button>
        </div>
      </header>

      <!-- Loading state -->
      <div v-if="store.loading" class="sm-loading">Chargement…</div>

      <!-- Projects view -->
      <div v-else-if="currentView === 'projects'" class="sm-content">
        <div class="sm-projects-grid">
          <SmProjectCard v-for="p in store.projects" :key="p.id" :project="p"
            :selected="store.selectedProject?.id === p.id"
            @select-project="selectProject" />
        </div>
        <div v-if="!store.projects.length" class="sm-empty">
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
        <div v-if="!currentTasks.length" class="sm-empty">
          <p>Aucune tâche dans ce projet.</p>
        </div>
      </div>

      <!-- Kanban -->
      <div v-else-if="currentView === 'kanban' && store.selectedProject" class="sm-content">
        <SmKanbanBoard :tasks="currentTasks" :team="store.team"
          @update-status="updateTaskStatus" />
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
        <button class="sm-topbar__btn sm-topbar__btn--secondary" @click="currentView = 'projects'">Voir les projets</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const profiles = [
  { key: 'moi', emoji: '👤', label: 'Moi' },
  { key: 'manager', emoji: '📊', label: 'Manager' },
  { key: 'direction', emoji: '👔', label: 'Direction' },
]

const navItems = [
  { key: 'projects', emoji: '📁', label: 'Projets' },
  { key: 'tasks', emoji: '✅', label: 'Tâches' },
  { key: 'kanban', emoji: '📋', label: 'Kanban' },
  { key: 'eisenhower', emoji: '🎯', label: 'Eisenhower' },
  { key: 'planning', emoji: '📅', label: 'Planning' },
  { key: 'stats', emoji: '📈', label: 'Statistiques' },
  { key: 'team', emoji: '👥', label: 'Équipe' },
  { key: 'config', emoji: '⚙️', label: 'Paramètres' },
  { key: 'import', emoji: '📥', label: 'Import' },
]

const currentNavItem = computed(() => navItems.find(n => n.key === currentView.value))

function profileLabel(p) {
  if (p.key === 'moi') return store.userName || authStore.user?.display_name || 'Moi'
  return p.label
}

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

// Init
onMounted(async () => {
  store.userName = authStore.user?.display_name || ''
  await Promise.all([
    store.fetchProjects(),
    store.fetchTeam(),
  ])
})

// Load tasks when project is selected
watch(() => store.selectedProject, async (p) => {
  if (p) {
    await store.fetchTasks(p.id)
    if (currentView.value === 'stats') {
      await store.fetchStats(p.id)
    }
  }
})

// Load stats when switching to stats view
watch(currentView, async (v) => {
  if (v === 'stats' && store.selectedProject) {
    await store.fetchStats(store.selectedProject.id)
  }
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
  await store.createTask({
    project_id: store.selectedProject.id,
    name: 'Nouvelle tâche',
    group_name: '',
    status: 'todo',
  })
}

async function toggleSubtask(taskId, subId) {
  await store.toggleSubtask(taskId, subId)
}

async function deleteSubtask(taskId, subId) {
  await store.deleteSubtask(taskId, subId)
}

async function addSubtask(taskId, name) {
  await store.addSubtask(taskId, name)
}

async function transferTask(taskId, memberId) {
  await store.transferTask(taskId, memberId)
}

async function updateTaskStatus(taskId, status) {
  await store.updateTask(taskId, { status })
}

async function updateTaskQuadrant(taskId, quadrant) {
  await store.updateTask(taskId, { quadrant })
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
</script>

<style scoped>
.sm-layout {
  display: flex; height: 100%; min-height: 0;
  background: var(--sm-bg); font-family: 'DM Sans', sans-serif;
}

/* Sidebar */
.sm-sidebar {
  width: 220px; flex-shrink: 0; background: #1a1f36;
  display: flex; flex-direction: column; overflow-y: auto;
  border-right: 1px solid rgba(255,255,255,.06);
}
.sm-sidebar__profile {
  padding: 16px 12px 8px; display: flex; flex-direction: column; gap: 4px;
  border-bottom: 1px solid rgba(255,255,255,.06); margin-bottom: 8px;
}
.sm-sidebar__profile-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border: none; background: transparent;
  border-radius: 8px; color: rgba(255,255,255,.55); font-size: 13px;
  cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left;
  transition: all .15s;
}
.sm-sidebar__profile-btn:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.8); }
.sm-sidebar__profile-btn--active { background: rgba(232,96,58,.15); color: #e8603a; }
.sm-sidebar__profile-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-sidebar__nav { padding: 4px 8px; flex: 1; }
.sm-sidebar__nav-btn {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 12px; border: none; background: transparent;
  border-radius: 8px; color: rgba(255,255,255,.55); font-size: 13px;
  cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left;
  transition: all .15s;
}
.sm-sidebar__nav-btn:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.8); }
.sm-sidebar__nav-btn--active {
  background: linear-gradient(135deg, rgba(232,96,58,.15), rgba(155,90,205,.12));
  color: white;
}
.sm-sidebar__nav-icon { font-size: 16px; width: 20px; text-align: center; }
.sm-sidebar__nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Main */
.sm-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.sm-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-bottom: 1px solid var(--sm-bd); background: var(--sm-white);
  flex-shrink: 0;
}
.sm-topbar__title {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 22px;
  color: var(--sm-t1); margin: 0;
}
.sm-topbar__actions { display: flex; gap: 8px; }
.sm-topbar__btn {
  border: none; border-radius: 10px; padding: 8px 18px;
  font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all .15s;
}
.sm-topbar__btn--primary { background: var(--sm-grad); color: white; }
.sm-topbar__btn--primary:hover { opacity: .9; }
.sm-topbar__btn--secondary { background: var(--sm-white); border: 1px solid var(--sm-bd); color: var(--sm-t1); }
.sm-topbar__btn--secondary:hover { border-color: var(--sm-terra); color: var(--sm-terra); }
.sm-content { flex: 1; padding: 24px; overflow-y: auto; }
.sm-loading { padding: 40px; text-align: center; color: var(--sm-t3); font-size: 14px; }
.sm-empty { text-align: center; padding: 60px 20px; color: var(--sm-t3); font-size: 14px; }

/* Projects grid */
.sm-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

/* Project header in task view */
.sm-project-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.sm-project-header__emoji { font-size: 28px; }
.sm-project-header__name {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 24px;
  color: var(--sm-t1); margin: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sm-sidebar {
    width: 56px;
  }
  .sm-sidebar__profile-label,
  .sm-sidebar__nav-label { display: none; }
  .sm-sidebar__profile-btn,
  .sm-sidebar__nav-btn { justify-content: center; padding: 10px; }
  .sm-sidebar__nav-icon { width: auto; }
  .sm-topbar { padding: 12px 16px; }
  .sm-topbar__title { font-size: 18px; }
  .sm-content { padding: 16px; }
  .sm-projects-grid { grid-template-columns: 1fr; }
}
</style>
