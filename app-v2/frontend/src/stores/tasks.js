import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  } catch (err) {
    if (window.Sentry) window.Sentry.captureException(err)
    return null
  }
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])
  const projects = ref([])
  const loading = ref(false)
  const lastError = ref(null)

  // ── Computed ──
  const tasksByStatus = computed(() => ({
    todo: tasks.value.filter(t => t.status === 'todo'),
    in_progress: tasks.value.filter(t => t.status === 'in_progress'),
    blocked: tasks.value.filter(t => t.status === 'blocked'),
    done: tasks.value.filter(t => t.status === 'done'),
  }))

  const urgentTasks = computed(() =>
    tasks.value.filter(t => (t.urgency >= 4 || t.importance >= 4) && t.status !== 'done')
  )

  const overdueTasks = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return tasks.value.filter(t => t.endDate && t.endDate < today && t.status !== 'done' && !t.finished)
  })

  // ── AI Predictions ──
  const predictions = computed(() => {
    const allTasks = tasks.value.filter(t => t.taskType !== 'project')
    const doneTasks = allTasks.filter(t => t.finished || t.status === 'done')
    const totalTasks = allTasks.length
    const doneCount = doneTasks.length

    // Velocity: tasks done per week (based on last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    const recentDone = doneTasks.filter(t => t.updatedAt && t.updatedAt >= thirtyDaysAgo)
    const velocityPerWeek = recentDone.length > 0 ? (recentDone.length / 4.3) : (doneCount > 0 ? doneCount / 12 : 0.5)

    // Remaining tasks
    const remaining = totalTasks - doneCount
    const weeksToComplete = velocityPerWeek > 0 ? Math.ceil(remaining / velocityPerWeek) : null

    // Estimated completion date
    const estimatedDate = weeksToComplete
      ? new Date(Date.now() + weeksToComplete * 7 * 86400000).toISOString().slice(0, 10)
      : null

    // Hours analysis
    const totalActual = allTasks.reduce((s, t) => s + (t.actualHours || 0), 0)
    const totalExpected = allTasks.reduce((s, t) => s + (t.expectedHours || 0), 0)
    const totalMin = allTasks.reduce((s, t) => s + (t.minHours || 0), 0)
    const totalMax = allTasks.reduce((s, t) => s + (t.maxHours || 0), 0)
    const hoursAccuracy = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : null

    // Risk score (0-100, higher = more risk)
    let riskScore = 0
    const blockedCount = allTasks.filter(t => t.status === 'blocked').length
    const overdueCount = overdueTasks.value.length
    const highUrgency = allTasks.filter(t => (t.urgency || 3) >= 4 && !t.finished).length

    riskScore += Math.min(blockedCount * 15, 30)
    riskScore += Math.min(overdueCount * 10, 30)
    riskScore += Math.min(highUrgency * 5, 20)
    if (hoursAccuracy && hoursAccuracy > 120) riskScore += 10
    if (velocityPerWeek < 1 && remaining > 5) riskScore += 10
    riskScore = Math.min(riskScore, 100)

    // Risk label
    const riskLabel = riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'warning' : 'healthy'

    // Recommendations
    const recommendations = []
    if (blockedCount > 0) recommendations.push({ type: 'danger', msg: blockedCount + ' blocked tasks need attention' })
    if (overdueCount > 0) recommendations.push({ type: 'warning', msg: overdueCount + ' overdue tasks' })
    if (hoursAccuracy && hoursAccuracy > 130) recommendations.push({ type: 'warning', msg: 'Actual hours exceed estimates by ' + (hoursAccuracy - 100) + '%' })
    if (velocityPerWeek < 1 && remaining > 3) recommendations.push({ type: 'info', msg: 'Low velocity (' + velocityPerWeek.toFixed(1) + ' tasks/week). Consider reducing scope.' })
    if (doneCount > 0 && riskScore < 30) recommendations.push({ type: 'success', msg: 'On track! ' + doneCount + '/' + totalTasks + ' tasks completed.' })

    return {
      velocityPerWeek: Math.round(velocityPerWeek * 10) / 10,
      remaining,
      weeksToComplete,
      estimatedDate,
      completionPercent: totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0,
      hoursAccuracy,
      totalActual,
      totalExpected,
      totalMin,
      totalMax,
      riskScore,
      riskLabel,
      blockedCount,
      overdueCount,
      recommendations,
    }
  })
  // ── Load ──
  async function loadTasks() {
    loading.value = true
    lastError.value = null
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
      ])
      if (tasksRes.error) throw tasksRes.error
      if (projectsRes.error) throw projectsRes.error
      if (tasksRes.data) tasks.value = tasksRes.data.map(dbToTask)
      if (projectsRes.data) projects.value = projectsRes.data.map(dbToProject)
    } catch (err) {
      lastError.value = err.message || 'Failed to load tasks'
      if (window.Sentry) window.Sentry.captureException(err)
    } finally {
      loading.value = false
    }
  }

  // ── Project CRUD ──
  async function addProject(project) {
    lastError.value = null
    try {
      const { data, error } = await supabase.from('projects').insert([await projectToDb(project)]).select().single()
      if (error) throw error
      if (data) projects.value.unshift(dbToProject(data))
      return data
    } catch (err) {
      lastError.value = err.message || 'Failed to add project'
      if (window.Sentry) window.Sentry.captureException(err)
      return null
    }
  }

  async function updateProject(idOrProject, maybeData) {
    lastError.value = null
    try {
      let id, projectData
      if (maybeData !== undefined) {
        id = idOrProject
        projectData = maybeData
      } else {
        id = idOrProject.id
        projectData = idOrProject
      }
      const { error } = await supabase.from('projects').update(await projectToDb(projectData)).eq('id', id)
      if (error) throw error
      const idx = projects.value.findIndex(p => p.id === id)
      if (idx > -1) projects.value[idx] = { ...projects.value[idx], ...projectData }
    } catch (err) {
      lastError.value = err.message || 'Failed to update project'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  async function deleteProject(id) {
    lastError.value = null
    try {
      const { error: tasksErr } = await supabase.from('tasks').delete().eq('project_id', id)
      if (tasksErr) throw tasksErr
      const { error: projErr } = await supabase.from('projects').delete().eq('id', id)
      if (projErr) throw projErr
      projects.value = projects.value.filter(p => p.id !== id)
      tasks.value = tasks.value.filter(t => t.projectId !== id)
    } catch (err) {
      lastError.value = err.message || 'Failed to delete project'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ── Task CRUD ──
  async function addTask(task) {
    lastError.value = null
    try {
      const { data, error } = await supabase.from('tasks').insert([await taskToDb(task)]).select().single()
      if (error) throw error
      if (data) tasks.value.unshift(dbToTask(data))
      return data
    } catch (err) {
      lastError.value = err.message || 'Failed to add task'
      if (window.Sentry) window.Sentry.captureException(err)
      return null
    }
  }

  async function updateTask(idOrTask, maybeData) {
    lastError.value = null
    try {
      let id, taskData
      if (maybeData !== undefined) {
        id = idOrTask
        taskData = maybeData
      } else {
        id = idOrTask.id
        taskData = idOrTask
      }
      const { error } = await supabase.from('tasks').update(await taskToDb(taskData)).eq('id', id)
      if (error) throw error
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx > -1) tasks.value[idx] = { ...tasks.value[idx], ...taskData }
    } catch (err) {
      lastError.value = err.message || 'Failed to update task'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  async function deleteTask(id) {
    lastError.value = null
    try {
      const { error: subErr } = await supabase.from('tasks').delete().eq('parent_id', id)
      if (subErr) throw subErr
      const { error: taskErr } = await supabase.from('tasks').delete().eq('id', id)
      if (taskErr) throw taskErr
      tasks.value = tasks.value.filter(t => t.id !== id && t.parentId !== id)
    } catch (err) {
      lastError.value = err.message || 'Failed to delete task'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  async function moveTask(taskId, newStatus) {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      lastError.value = err.message || 'Failed to move task'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ── Reset ──
  async function resetAll() {
    lastError.value = null
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        const { error: tErr } = await supabase.from('tasks').delete().eq('user_id', uid)
        if (tErr) throw tErr
        const { error: pErr } = await supabase.from('projects').delete().eq('user_id', uid)
        if (pErr) throw pErr
      }
      tasks.value = []
      projects.value = []
    } catch (err) {
      lastError.value = err.message || 'Failed to reset tasks'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ── Mappers — COMPLETE with all Smart Matrice fields ──
  function dbToTask(r) {
    return {
      id: r.id,
      projectId: r.project_id || '',
      parentId: r.parent_id || null,
      title: r.title || '',
      description: r.description || '',
      status: r.status || 'todo',
      priority: r.priority || 'important',
      assignee: r.assignee || '',
      dueDate: r.due_date || '',
      startDate: r.start_date || '',
      endDate: r.end_date || r.due_date || '',
      clientId: r.client_id || '',
      tags: r.tags || [],
      subtasks: r.subtasks || [],
      // Smart Matrice fields
      urgency: r.urgency ?? 3,
      importance: r.importance ?? 3,
      difficulty: r.difficulty ?? 3,
      finished: r.finished ?? false,
      pended: r.pended ?? false,
      actualHours: r.actual_hours ?? 0,
      expectedHours: r.expected_hours ?? 0,
      minHours: r.min_hours ?? 0,
      maxHours: r.max_hours ?? 0,
      level: r.level ?? 0,
      taskType: r.task_type || 'task',
      createdAt: r.created_at || '',
      updatedAt: r.updated_at || '',
    }
  }

  async function taskToDb(t) {
    const user_id = await getCurrentUserId()
    if (!user_id) throw new Error('User not authenticated')
    const obj = {
      user_id,
      title: t.title || '',
      description: t.description || '',
      status: t.status || 'todo',
      priority: t.priority || 'important',
      assignee: t.assignee || '',
      tags: t.tags || [],
      subtasks: t.subtasks || [],
      updated_at: new Date().toISOString(),
    }
    // Map all Smart Matrice fields
    if (t.projectId !== undefined) obj.project_id = t.projectId || null
    if (t.parentId !== undefined) obj.parent_id = t.parentId || null
    if (t.dueDate !== undefined) obj.due_date = t.dueDate || null
    if (t.startDate !== undefined) obj.start_date = t.startDate || null
    if (t.endDate !== undefined) obj.end_date = t.endDate || null
    if (t.clientId !== undefined) obj.client_id = t.clientId || ''
    if (t.urgency !== undefined) obj.urgency = t.urgency
    if (t.importance !== undefined) obj.importance = t.importance
    if (t.difficulty !== undefined) obj.difficulty = t.difficulty
    if (t.finished !== undefined) obj.finished = t.finished
    if (t.pended !== undefined) obj.pended = t.pended
    if (t.actualHours !== undefined) obj.actual_hours = t.actualHours
    if (t.expectedHours !== undefined) obj.expected_hours = t.expectedHours
    if (t.minHours !== undefined) obj.min_hours = t.minHours
    if (t.maxHours !== undefined) obj.max_hours = t.maxHours
    if (t.level !== undefined) obj.level = t.level
    if (t.taskType !== undefined) obj.task_type = t.taskType
    return obj
  }

  function dbToProject(r) {
    return { id: r.id, name: r.name, title: r.name, color: r.color || '#7c3aed', status: r.status || 'active' }
  }

  async function projectToDb(p) {
    const user_id = await getCurrentUserId()
    if (!user_id) throw new Error('User not authenticated')
    return { user_id, name: p.name || p.title, color: p.color || '#7c3aed', status: p.status || 'active' }
  }

  return {
    tasks, projects, loading, lastError,
    tasksByStatus, urgentTasks, overdueTasks,
    predictions,
    loadTasks, addTask, updateTask, deleteTask, moveTask,
    addProject, updateProject, deleteProject,
    resetAll,
  }
})
