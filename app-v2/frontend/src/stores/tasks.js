import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const DEMO_PROJECTS = [
  { id: 'p1', name: 'Onboarding Q2', color: '#7c3aed', status: 'active', createdAt: '2026-03-01' },
  { id: 'p2', name: 'Expansion Comptes', color: '#10b981', status: 'active', createdAt: '2026-02-15' },
  { id: 'p3', name: 'Rétention H1', color: '#3b82f6', status: 'active', createdAt: '2026-01-10' },
]

const DEMO_TASKS = [
  { id: 't1', title: 'QBR Acme Corp', status: 'todo', priority: 'urgent_important', projectId: 'p3', clientId: 'cl2', assignee: 'u1', dueDate: '2026-04-15', description: 'Préparer le QBR trimestriel pour Acme Corp', subtasks: [], createdAt: '2026-04-01', startDate: '', endDate: '', urgency: 4, importance: 5, difficulty: 3, finished: false, pended: false, actualHours: 0, expectedHours: 3, minHours: 2, maxHours: 4, level: 1, type: 'task', hasChildren: false },
  { id: 't2', title: 'Check-in TechScale', status: 'in_progress', priority: 'important', projectId: 'p1', clientId: 'cl1', assignee: 'u1', dueDate: '2026-04-18', description: 'Call mensuel de suivi', subtasks: [], createdAt: '2026-04-05', startDate: '', endDate: '', urgency: 3, importance: 4, difficulty: 2, finished: false, pended: false, actualHours: 1, expectedHours: 2, minHours: 1, maxHours: 2, level: 1, type: 'task', hasChildren: false },
  { id: 't3', title: 'Playbook Leroy Finance', status: 'in_progress', priority: 'urgent_important', projectId: 'p3', clientId: 'cl4', assignee: 'tm2', dueDate: '2026-04-12', description: 'Activer le playbook de rétention', subtasks: [], createdAt: '2026-03-28', startDate: '', endDate: '', urgency: 5, importance: 5, difficulty: 4, finished: false, pended: false, actualHours: 2, expectedHours: 4, minHours: 3, maxHours: 5, level: 1, type: 'task', hasChildren: false },
  { id: 't4', title: 'Onboarding Biotech Group', status: 'done', priority: 'important', projectId: 'p1', clientId: 'cl3', assignee: 'u1', dueDate: '2026-04-10', description: 'Terminer onboarding phase 2', subtasks: [], createdAt: '2026-03-15', startDate: '', endDate: '', urgency: 3, importance: 4, difficulty: 2, finished: true, pended: false, actualHours: 4, expectedHours: 4, minHours: 3, maxHours: 5, level: 1, type: 'task', hasChildren: false, completedAt: '2026-04-10' },
  { id: 't5', title: 'Email expansion NovaTech', status: 'in_progress', priority: 'important', projectId: 'p2', clientId: 'cl5', assignee: 'tm3', dueDate: '2026-04-20', description: 'Préparer proposition expansion', subtasks: [], createdAt: '2026-04-08', startDate: '', endDate: '', urgency: 3, importance: 4, difficulty: 2, finished: false, pended: false, actualHours: 0, expectedHours: 2, minHours: 1, maxHours: 3, level: 1, type: 'task', hasChildren: false },
  { id: 't6', title: 'Health check DataVault', status: 'blocked', priority: 'urgent', projectId: 'p3', clientId: 'cl8', assignee: 'tm2', dueDate: '2026-04-14', description: 'Analyse urgente du compte', subtasks: [], createdAt: '2026-04-02', startDate: '', endDate: '', urgency: 5, importance: 4, difficulty: 3, finished: false, pended: false, actualHours: 0, expectedHours: 2, minHours: 1, maxHours: 3, level: 1, type: 'task', hasChildren: false },
  { id: 't7', title: 'Rapport COPIL Mars', status: 'done', priority: 'not_urgent', projectId: null, clientId: null, assignee: 'u1', dueDate: '2026-04-05', description: 'Générer le rapport mensuel', subtasks: [], createdAt: '2026-03-30', startDate: '', endDate: '', urgency: 2, importance: 3, difficulty: 1, finished: true, pended: false, actualHours: 2, expectedHours: 2, minHours: 1, maxHours: 3, level: 1, type: 'task', hasChildren: false, completedAt: '2026-04-05' },
  { id: 't8', title: 'Formation équipe NPS', status: 'todo', priority: 'not_urgent', projectId: 'p2', clientId: null, assignee: 'tm3', dueDate: '2026-04-25', description: 'Session formation NPS pour les CSM', subtasks: [], createdAt: '2026-04-06', startDate: '', endDate: '', urgency: 2, importance: 3, difficulty: 2, finished: false, pended: false, actualHours: 0, expectedHours: 3, minHours: 2, maxHours: 4, level: 1, type: 'task', hasChildren: false },
]

export const useTaskStore = defineStore('tasks', () => {
  const projects = ref(load('scalyo_projects', DEMO_PROJECTS))
  const tasks = ref(load('scalyo_tasks', DEMO_TASKS))

  const byStatus = (status) => tasks.value.filter(t => t.status === status)
  const todoTasks = computed(() => byStatus('todo'))
  const inProgressTasks = computed(() => byStatus('in_progress'))
  const blockedTasks = computed(() => byStatus('blocked'))
  const doneTasks = computed(() => byStatus('done'))
  const overdueTasks = computed(() => {
    const now = new Date().toISOString().slice(0, 10)
    return tasks.value.filter(t => t.status !== 'done' && t.dueDate < now)
  })

  function addTask(task) {
    tasks.value.push({
      id: 't' + Date.now(),
      status: 'todo',
      subtasks: [],
      createdAt: new Date().toISOString().slice(0, 10),
      startDate: '',
      endDate: '',
      urgency: 3,
      importance: 3,
      difficulty: 3,
      finished: false,
      pended: false,
      actualHours: 0,
      expectedHours: 0,
      minHours: 0,
      maxHours: 0,
      level: 1,
      type: 'task',
      hasChildren: false,
      ...task,
    })
    save('scalyo_tasks', tasks.value)
  }

  function addSubtask(parentId, subtask) {
    tasks.value.push({
      id: 'st' + Date.now(),
      status: 'todo',
      subtasks: [],
      createdAt: new Date().toISOString().slice(0, 10),
      startDate: '',
      endDate: '',
      urgency: 3,
      importance: 3,
      difficulty: 3,
      finished: false,
      pended: false,
      actualHours: 0,
      expectedHours: 0,
      minHours: 0,
      maxHours: 0,
      level: 2,
      type: 'subtask',
      hasChildren: false,
      parentId,
      ...subtask,
    })
    save('scalyo_tasks', tasks.value)
  }

  function updateTask(id, data) {
    const i = tasks.value.findIndex(t => t.id === id)
    if (i !== -1) {
      Object.assign(tasks.value[i], data)
      save('scalyo_tasks', tasks.value)
    }
  }

  function deleteTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    save('scalyo_tasks', tasks.value)
  }

  function moveTask(id, newStatus) {
    updateTask(id, {
      status: newStatus,
      ...(newStatus === 'done' ? { completedAt: new Date().toISOString().slice(0, 10) } : {}),
    })
  }

  function addProject(p) {
    projects.value.push({
      id: 'p' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      startDate: '',
      endDate: '',
      urgency: 3,
      importance: 3,
      difficulty: 3,
      finished: false,
      pended: false,
      actualHours: 0,
      expectedHours: 0,
      minHours: 0,
      maxHours: 0,
      level: 0,
      type: 'project',
      hasChildren: false,
      ...p,
    })
    save('scalyo_projects', projects.value)
  }

  function updateProject(id, data) {
    const i = projects.value.findIndex(p => p.id === id)
    if (i !== -1) {
      Object.assign(projects.value[i], data)
      save('scalyo_projects', projects.value)
    }
  }

  function deleteProject(id) {
    const toRemove = new Set([id])
    for (const t of tasks.value) {
      if (t.parentId && toRemove.has(t.parentId)) toRemove.add(t.id)
    }
    tasks.value = tasks.value.filter(t => !toRemove.has(t.id) && t.projectId !== id)
    projects.value = projects.value.filter(p => p.id !== id)
    save('scalyo_tasks', tasks.value)
    save('scalyo_projects', projects.value)
  }

  function resetAll() {
    tasks.value = []
    projects.value = []
    save('scalyo_tasks', [])
    save('scalyo_projects', [])
  }

  return {
    projects, tasks, todoTasks, inProgressTasks, blockedTasks, doneTasks, overdueTasks,
    addTask, addSubtask, updateTask, updateProject, deleteTask, moveTask, addProject, deleteProject, resetAll,
  }
}, { persist: false })
