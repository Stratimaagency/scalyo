import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])
  const projects = ref([])
  const loading = ref(false)

  // ─── Computed ─────────────────────────────────────────────────
  const tasksByStatus = computed(() => ({
    todo: tasks.value.filter(t => t.status === 'todo'),
    in_progress: tasks.value.filter(t => t.status === 'in_progress'),
    blocked: tasks.value.filter(t => t.status === 'blocked'),
    done: tasks.value.filter(t => t.status === 'done'),
  }))

  const urgentTasks = computed(() =>
    tasks.value.filter(t => (t.priority === 'urgent_important' || t.priority === 'urgent') && t.status !== 'done')
  )

  const overdueTasks = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return tasks.value.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done')
  })

  // ─── Load ─────────────────────────────────────────────────────
  async function loadTasks() {
    loading.value = true
    const [{ data: tasksData }, { data: projectsData }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
    ])
    if (tasksData) tasks.value = tasksData.map(dbToTask)
    if (projectsData) projects.value = projectsData.map(dbToProject)
    loading.value = false
  }

  // ─── Project CRUD ─────────────────────────────────────────────
  async function addProject(project) {
    const { data, error } = await supabase.from('projects').insert([await projectToDb(project)]).select().single()
    if (!error && data) projects.value.unshift(dbToProject(data))
    return data
  }

  async function updateProject(project) {
    const { error } = await supabase.from('projects').update(await projectToDb(project)).eq('id', project.id)
    if (!error) {
      const idx = projects.value.findIndex(p => p.id === project.id)
      if (idx > -1) projects.value[idx] = { ...projects.value[idx], ...project }
    }
  }

  async function deleteProject(id) {
    await supabase.from('tasks').delete().eq('project_id', id)
    await supabase.from('projects').delete().eq('id', id)
    projects.value = projects.value.filter(p => p.id !== id)
    tasks.value = tasks.value.filter(t => t.projectId !== id)
  }

  // ─── Task CRUD ────────────────────────────────────────────────
  async function addTask(task) {
    const { data, error } = await supabase.from('tasks').insert([await taskToDb(task)]).select().single()
    if (!error && data) tasks.value.unshift(dbToTask(data))
    return data
  }

  async function updateTask(task) {
    const { error } = await supabase.from('tasks').update(await taskToDb(task)).eq('id', task.id)
    if (!error) {
      const idx = tasks.value.findIndex(t => t.id === task.id)
      if (idx > -1) tasks.value[idx] = { ...tasks.value[idx], ...task }
    }
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  async function moveTask(taskId, newStatus) {
    await updateTask({ id: taskId, status: newStatus })
  }

  // ─── Reset ────────────────────────────────────────────────────
  async function resetAll() {
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    tasks.value = []
    projects.value = []
  }

  // ─── Mappers ──────────────────────────────────────────────────
  function dbToTask(r) {
    return {
      id: r.id,
      projectId: r.project_id || '',
      title: r.title,
      description: r.description || '',
      status: r.status || 'todo',
      priority: r.priority || 'important',
      assignee: r.assignee || '',
      dueDate: r.due_date || '',
      clientId: r.client_id || '',
      tags: r.tags || [],
      subtasks: r.subtasks || [],
    }
  }

  async function taskToDb(t) {
    const user_id = await getCurrentUserId()
    return { user_id,
      project_id: t.projectId || null,
      title: t.title,
      description: t.description || '',
      status: t.status || 'todo',
      priority: t.priority || 'important',
      assignee: t.assignee || '',
      due_date: t.dueDate || null,
      client_id: t.clientId || '',
      tags: t.tags || [],
      subtasks: t.subtasks || [],
      updated_at: new Date().toISOString(),
    }
  }

  function dbToProject(r) {
    return { id: r.id, name: r.name, color: r.color || '#7c3aed', status: r.status || 'active' }
  }

  async function projectToDb(p) {
    const user_id = await getCurrentUserId()
    return { user_id, name: p.name, color: p.color || '#7c3aed', status: p.status || 'active' }
  }

  return {
    tasks, projects, loading, tasksByStatus, urgentTasks, overdueTasks,
    loadTasks, addTask, updateTask, deleteTask, moveTask,
    addProject, updateProject, deleteProject, resetAll,
  }
})
