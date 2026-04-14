import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('tasks', () => {
  const projects = ref([
    { id: 'p1', name: 'Onboarding Q2', color: '#7c3aed', status: 'active', createdAt: '2026-03-01' },
    { id: 'p2', name: 'Expansion Comptes', color: '#10b981', status: 'active', createdAt: '2026-02-15' },
    { id: 'p3', name: 'Rétention H1', color: '#3b82f6', status: 'active', createdAt: '2026-01-10' },
  ])

  const tasks = ref([
    { id: 't1', title: 'QBR Acme Corp', status: 'todo', priority: 'urgent_important', projectId: 'p3', clientId: 'cl2', assignee: 'tm1', dueDate: '2026-04-15', description: 'Préparer le QBR trimestriel pour Acme Corp', subtasks: [{ id: 'st1', title: 'Collecter les KPIs', done: true, children: [{ id: 'st1a', title: 'KPIs usage produit', done: true, children: [] }, { id: 'st1b', title: 'KPIs satisfaction', done: false, children: [{ id: 'st1b1', title: 'Score NPS', done: false, children: [] }, { id: 'st1b2', title: 'Score CSAT', done: false, children: [] }] }] }, { id: 'st2', title: 'Préparer slides', done: false, children: [{ id: 'st2a', title: 'Template PowerPoint', done: false, children: [] }, { id: 'st2b', title: 'Graphiques résultats', done: false, children: [] }] }], createdAt: '2026-04-01' },
    { id: 't2', title: 'Check-in TechScale', status: 'in_progress', priority: 'important', projectId: 'p1', clientId: 'cl1', assignee: 'tm1', dueDate: '2026-04-18', description: 'Call mensuel de suivi', subtasks: [], createdAt: '2026-04-05' },
    { id: 't3', title: 'Playbook Leroy Finance', status: 'in_progress', priority: 'urgent_important', projectId: 'p3', clientId: 'cl4', assignee: 'tm2', dueDate: '2026-04-12', description: 'Activer le playbook de rétention', subtasks: [{ id: 'st3', title: 'Email de dialogue', done: true }, { id: 'st4', title: 'Analyse usage', done: true }, { id: 'st5', title: 'Call 30min', done: false }, { id: 'st6', title: 'Présenter roadmap', done: false }], createdAt: '2026-03-28' },
    { id: 't4', title: 'Onboarding Biotech Group', status: 'done', priority: 'important', projectId: 'p1', clientId: 'cl3', assignee: 'tm1', dueDate: '2026-04-10', description: 'Terminer onboarding phase 2', subtasks: [], createdAt: '2026-03-15', completedAt: '2026-04-10' },
    { id: 't5', title: 'Email expansion NovaTech', status: 'in_progress', priority: 'important', projectId: 'p2', clientId: 'cl5', assignee: 'tm3', dueDate: '2026-04-20', description: 'Préparer proposition expansion', subtasks: [], createdAt: '2026-04-08' },
    { id: 't6', title: 'Health check DataVault', status: 'blocked', priority: 'urgent', projectId: 'p3', clientId: 'cl8', assignee: 'tm2', dueDate: '2026-04-14', description: 'Analyse urgente du compte', subtasks: [], createdAt: '2026-04-02' },
    { id: 't7', title: 'Rapport COPIL Mars', status: 'done', priority: 'not_urgent', projectId: null, clientId: null, assignee: 'tm1', dueDate: '2026-04-05', description: 'Générer le rapport mensuel', subtasks: [], createdAt: '2026-03-30', completedAt: '2026-04-05' },
    { id: 't8', title: 'Formation équipe NPS', status: 'todo', priority: 'not_urgent', projectId: 'p2', clientId: null, assignee: 'tm3', dueDate: '2026-04-25', description: 'Session formation NPS pour les CSM', subtasks: [], createdAt: '2026-04-06' },
  ])

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
    tasks.value.push({ id: 't' + Date.now(), status: 'todo', subtasks: [], createdAt: new Date().toISOString().slice(0, 10), ...task })
  }
  function updateTask(id, data) {
    const i = tasks.value.findIndex(t => t.id === id)
    if (i !== -1) Object.assign(tasks.value[i], data)
  }
  function deleteTask(id) { tasks.value = tasks.value.filter(t => t.id !== id) }
  function moveTask(id, newStatus) { updateTask(id, { status: newStatus, ...(newStatus === 'done' ? { completedAt: new Date().toISOString().slice(0, 10) } : {}) }) }
  function addProject(p) { projects.value.push({ id: 'p' + Date.now(), status: 'active', createdAt: new Date().toISOString().slice(0, 10), ...p }) }

  function deleteProject(id) {
    tasks.value = tasks.value.filter(t => t.projectId !== id)
    projects.value = projects.value.filter(p => p.id !== id)
  }

  function resetAll() {
    tasks.value = []
    projects.value = []
  }

  return {
    projects, tasks, todoTasks, inProgressTasks, blockedTasks, doneTasks, overdueTasks,
    addTask, updateTask, deleteTask, moveTask, addProject, deleteProject, resetAll,
  }
}, { persist: true })
