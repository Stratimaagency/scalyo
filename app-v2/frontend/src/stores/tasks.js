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


export const useTaskStore = defineStore('tasks', () => {
  const projects = ref(load('scalyo_projects', []))
  const tasks = ref(load('scalyo_tasks', []))

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
