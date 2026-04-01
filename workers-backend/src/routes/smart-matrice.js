import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const smartMatrice = new Hono()
smartMatrice.use('/*', authMiddleware(), companyRequired(), trialGuard())

// ===================== PROJECTS =====================

// GET / — list projects with computed progress
smartMatrice.get('/', async (c) => {
  const { company_id } = c.get('user')
  const db = c.env.DB

  const { results: projects } = await db.prepare(`
    SELECT p.*,
      COALESCE(tc.task_count, 0) as task_count,
      COALESCE(sc.sub_total, 0) as sub_total,
      COALESCE(sc.sub_done, 0) as sub_done
    FROM sm_projects p
    LEFT JOIN (SELECT project_id, COUNT(*) as task_count FROM sm_tasks GROUP BY project_id) tc ON tc.project_id = p.id
    LEFT JOIN (
      SELECT t.project_id,
        COUNT(s.id) as sub_total,
        SUM(CASE WHEN s.done = 1 THEN 1 ELSE 0 END) as sub_done
      FROM sm_tasks t
      LEFT JOIN sm_subtasks s ON s.task_id = t.id
      GROUP BY t.project_id
    ) sc ON sc.project_id = p.id
    WHERE p.company_id = ?
    ORDER BY p.sort_order ASC, p.created_at DESC
  `).bind(company_id).all()

  const enriched = (projects || []).map(p => ({
    ...p,
    progress: p.sub_total > 0 ? Math.round(p.sub_done / p.sub_total * 100) : 0,
  }))

  return c.json(enriched)
})

// POST / — create project
smartMatrice.post('/', async (c) => {
  const { company_id, id: user_id } = c.get('user')
  const body = await c.req.json()
  const history = JSON.stringify([{ date: new Date().toISOString(), action: 'created', details: body.name || 'Nouveau projet', user_id }])
  const row = await c.env.DB.prepare(
    `INSERT INTO sm_projects (company_id, name, description, emoji, color, start_date, end_date, target_end_date, state, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    company_id,
    body.name || 'Nouveau projet',
    body.description || '',
    body.emoji || '📁',
    body.color || '#3b82f6',
    body.start_date || null,
    body.end_date || null,
    body.target_end_date || body.end_date || null,
    body.state || 'active',
    history
  ).first()
  return c.json({ ...row, history: JSON.parse(row.history || '[]') }, 201)
})

// PATCH /:id — update project
smartMatrice.patch('/:id', async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()

  const fields = []
  const values = []
  const allowed = ['name', 'description', 'emoji', 'color', 'status', 'start_date', 'end_date', 'target_end_date', 'actual_end_date', 'sort_order', 'state']
  for (const key of allowed) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`)
      values.push(body[key])
    }
  }
  // Pause mode
  if (body.is_paused !== undefined) {
    fields.push('is_paused = ?')
    values.push(body.is_paused ? 1 : 0)
    if (body.is_paused) {
      fields.push("paused_at = datetime('now')")
    } else {
      // Calculate paused duration and add to total
      fields.push('paused_at = NULL')
    }
  }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)

  // Add history entry
  const { id: user_id } = c.get('user')
  const existing = await c.env.DB.prepare('SELECT history FROM sm_projects WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (existing) {
    const hist = JSON.parse(existing.history || '[]')
    const changes = Object.keys(body).filter(k => allowed.includes(k) || k === 'is_paused').join(', ')
    hist.push({ date: new Date().toISOString(), action: 'updated', details: changes, user_id })
    fields.push('history = ?')
    values.push(JSON.stringify(hist.slice(-50))) // Keep last 50 entries
  }

  fields.push("updated_at = datetime('now')")
  values.push(id, company_id)

  const row = await c.env.DB.prepare(
    `UPDATE sm_projects SET ${fields.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`
  ).bind(...values).first()

  if (!row) return c.json({ error: 'Project not found' }, 404)
  return c.json({ ...row, is_paused: !!row.is_paused, history: JSON.parse(row.history || '[]') })
})

// DELETE /:id — delete project
smartMatrice.delete('/:id', async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM sm_projects WHERE id = ? AND company_id = ?').bind(id, company_id).run()
  return c.json({ status: 'deleted' })
})

// ===================== TASKS =====================

// GET /:projectId/tasks — tasks with subtasks
smartMatrice.get('/:projectId/tasks', async (c) => {
  const { company_id } = c.get('user')
  const projectId = parseInt(c.req.param('projectId'), 10)

  const { results: tasks } = await c.env.DB.prepare(
    'SELECT * FROM sm_tasks WHERE project_id = ? AND company_id = ? ORDER BY sort_order ASC, created_at ASC'
  ).bind(projectId, company_id).all()

  const taskIds = (tasks || []).map(t => t.id)
  let subtaskMap = {}
  if (taskIds.length) {
    const placeholders = taskIds.map(() => '?').join(',')
    const { results: subs } = await c.env.DB.prepare(
      `SELECT * FROM sm_subtasks WHERE task_id IN (${placeholders}) ORDER BY sort_order ASC, created_at ASC`
    ).bind(...taskIds).all()
    for (const s of (subs || [])) {
      if (!subtaskMap[s.task_id]) subtaskMap[s.task_id] = []
      subtaskMap[s.task_id].push(s)
    }
  }

  const enriched = (tasks || []).map(t => {
    const subs = subtaskMap[t.id] || []
    const done = subs.filter(s => s.done).length
    return {
      ...t,
      is_paused: !!t.is_paused,
      subtasks: subs.map(s => ({ ...s, done: !!s.done })),
      progress: subs.length > 0 ? Math.round(done / subs.length * 100) : 0,
    }
  })

  return c.json(enriched)
})

// POST /tasks — create task
smartMatrice.post('/tasks', async (c) => {
  const { company_id, id: user_id } = c.get('user')
  const body = await c.req.json()
  if (!body.project_id) return c.json({ error: 'project_id required' }, 400)

  const history = JSON.stringify([{ date: new Date().toISOString(), action: 'created', details: body.name || 'Nouvelle tâche', user_id }])
  const row = await c.env.DB.prepare(
    `INSERT INTO sm_tasks (project_id, company_id, name, group_name, status, priority, quadrant, start_date, end_date, dur_min, dur_max, dur_estimated, assigned_to, sort_order, description, referent_name, waiting_for, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    body.project_id, company_id,
    body.name || 'Nouvelle tâche',
    body.group_name || '',
    body.status || 'todo',
    body.priority || 'normal',
    body.quadrant || 0,
    body.start_date || null,
    body.end_date || null,
    body.dur_min || null,
    body.dur_max || null,
    body.dur_estimated || null,
    body.assigned_to || null,
    body.sort_order || 0,
    body.description || '',
    body.referent_name || '',
    body.waiting_for || '',
    history
  ).first()

  return c.json({ ...row, is_paused: false, subtasks: [], progress: 0, history: JSON.parse(row.history || '[]') }, 201)
})

// PATCH /tasks/:id — update task
smartMatrice.patch('/tasks/:id', async (c) => {
  const { company_id, id: user_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()

  const allowed = ['name', 'group_name', 'status', 'priority', 'quadrant', 'start_date', 'end_date', 'dur_min', 'dur_max', 'dur_estimated', 'dur_ai', 'dur_real', 'assigned_to', 'is_paused', 'sort_order', 'description', 'referent_name', 'waiting_for', 'actual_end_date', 'is_repetitive', 'cycle_count']
  const fields = []
  const values = []
  for (const key of allowed) {
    if (body[key] !== undefined) {
      const boolKeys = ['is_paused', 'is_repetitive']
      fields.push(`${key} = ?`)
      values.push(boolKeys.includes(key) ? (body[key] ? 1 : 0) : body[key])
    }
  }
  // Pause tracking
  if (body.is_paused === true) {
    fields.push("paused_at = datetime('now')")
  } else if (body.is_paused === false) {
    fields.push('paused_at = NULL')
  }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)

  // Add history entry
  const existing = await c.env.DB.prepare('SELECT history FROM sm_tasks WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (existing) {
    const hist = JSON.parse(existing.history || '[]')
    const changes = Object.keys(body).filter(k => allowed.includes(k)).join(', ')
    hist.push({ date: new Date().toISOString(), action: 'updated', details: changes, user_id })
    fields.push('history = ?')
    values.push(JSON.stringify(hist.slice(-50)))
  }

  fields.push("updated_at = datetime('now')")
  values.push(id, company_id)

  const row = await c.env.DB.prepare(
    `UPDATE sm_tasks SET ${fields.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`
  ).bind(...values).first()

  if (!row) return c.json({ error: 'Task not found' }, 404)
  return c.json({ ...row, is_paused: !!row.is_paused, is_repetitive: !!row.is_repetitive, history: JSON.parse(row.history || '[]') })
})

// DELETE /tasks/:id
smartMatrice.delete('/tasks/:id', async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM sm_tasks WHERE id = ? AND company_id = ?').bind(id, company_id).run()
  return c.json({ status: 'deleted' })
})

// ===================== SUBTASKS =====================

// POST /tasks/:taskId/subtasks — create subtask
smartMatrice.post('/tasks/:taskId/subtasks', async (c) => {
  const { company_id } = c.get('user')
  const taskId = parseInt(c.req.param('taskId'), 10)

  // Verify task belongs to company
  const task = await c.env.DB.prepare('SELECT id FROM sm_tasks WHERE id = ? AND company_id = ?').bind(taskId, company_id).first()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const body = await c.req.json()
  const row = await c.env.DB.prepare(
    'INSERT INTO sm_subtasks (task_id, name, sort_order) VALUES (?, ?, ?) RETURNING *'
  ).bind(taskId, body.name || '', body.sort_order || 0).first()

  return c.json({ ...row, done: false }, 201)
})

// PATCH /subtasks/:id — toggle done / update
smartMatrice.patch('/subtasks/:id', async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()

  // Verify ownership through task -> project -> company
  const sub = await c.env.DB.prepare(`
    SELECT s.id FROM sm_subtasks s
    JOIN sm_tasks t ON t.id = s.task_id
    WHERE s.id = ? AND t.company_id = ?
  `).bind(id, company_id).first()
  if (!sub) return c.json({ error: 'Subtask not found' }, 404)

  const fields = []
  const values = []
  if (body.done !== undefined) { fields.push('done = ?'); values.push(body.done ? 1 : 0) }
  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(body.sort_order) }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)

  values.push(id)
  const row = await c.env.DB.prepare(
    `UPDATE sm_subtasks SET ${fields.join(', ')} WHERE id = ? RETURNING *`
  ).bind(...values).first()

  return c.json({ ...row, done: !!row.done })
})

// DELETE /subtasks/:id
smartMatrice.delete('/subtasks/:id', async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const sub = await c.env.DB.prepare(`
    SELECT s.id FROM sm_subtasks s
    JOIN sm_tasks t ON t.id = s.task_id
    WHERE s.id = ? AND t.company_id = ?
  `).bind(id, company_id).first()
  if (!sub) return c.json({ error: 'Subtask not found' }, 404)

  await c.env.DB.prepare('DELETE FROM sm_subtasks WHERE id = ?').bind(id).run()
  return c.json({ status: 'deleted' })
})

// ===================== TEAM WORKLOAD =====================

// GET /team-workload — members with task counts and dates
smartMatrice.get('/team-workload', async (c) => {
  const { company_id } = c.get('user')
  const db = c.env.DB

  const { results: members } = await db.prepare(
    'SELECT id, email, display_name, role FROM users WHERE company_id = ?'
  ).bind(company_id).all()

  const { results: taskStats } = await db.prepare(`
    SELECT assigned_to,
      COUNT(*) as task_count,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done_count,
      MIN(end_date) as earliest_end,
      MAX(end_date) as latest_end,
      SUM(COALESCE(dur_estimated, 0)) as total_estimated
    FROM sm_tasks WHERE company_id = ?
    GROUP BY assigned_to
  `).bind(company_id).all()

  const statsMap = {}
  for (const s of (taskStats || [])) {
    if (s.assigned_to) statsMap[s.assigned_to] = s
  }

  const enriched = (members || []).map(m => ({
    ...m,
    initials: (m.display_name || m.email || '').slice(0, 2).toUpperCase(),
    ...(statsMap[m.id] || { task_count: 0, done_count: 0, earliest_end: null, latest_end: null, total_estimated: 0 }),
  }))

  return c.json(enriched)
})

// ===================== STATS =====================

// GET /stats/:projectId — dashboard data
smartMatrice.get('/stats/:projectId', async (c) => {
  const { company_id } = c.get('user')
  const projectId = parseInt(c.req.param('projectId'), 10)
  const db = c.env.DB

  const project = await db.prepare('SELECT * FROM sm_projects WHERE id = ? AND company_id = ?').bind(projectId, company_id).first()
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const { results: tasks } = await db.prepare(
    'SELECT * FROM sm_tasks WHERE project_id = ? AND company_id = ?'
  ).bind(projectId, company_id).all()

  const taskIds = (tasks || []).map(t => t.id)
  let subTotal = 0, subDone = 0
  if (taskIds.length) {
    const ph = taskIds.map(() => '?').join(',')
    const row = await db.prepare(
      `SELECT COUNT(*) as total, SUM(CASE WHEN done=1 THEN 1 ELSE 0 END) as done FROM sm_subtasks WHERE task_id IN (${ph})`
    ).bind(...taskIds).first()
    subTotal = row?.total || 0
    subDone = row?.done || 0
  }

  const byStatus = { todo: 0, in_progress: 0, blocked: 0, done: 0 }
  for (const t of (tasks || [])) byStatus[t.status] = (byStatus[t.status] || 0) + 1

  const byGroup = {}
  for (const t of (tasks || [])) {
    const g = t.group_name || 'Sans groupe'
    if (!byGroup[g]) byGroup[g] = { total: 0, done: 0 }
    byGroup[g].total++
    if (t.status === 'done') byGroup[g].done++
  }

  // Calculate end dates based on remaining work
  const activeTasks = (tasks || []).filter(t => t.status !== 'done' && !t.is_paused)
  const totalRemaining = { min: 0, estimated: 0, max: 0 }
  for (const t of activeTasks) {
    totalRemaining.min += t.dur_min || t.dur_estimated || 1
    totalRemaining.estimated += t.dur_estimated || t.dur_min || 1
    totalRemaining.max += t.dur_max || t.dur_estimated || 2
  }

  // Get config for hours per day
  let config = await db.prepare('SELECT * FROM sm_config WHERE company_id = ?').bind(company_id).first()
  const hoursPerDay = config?.hours_per_day || 8
  const daysPerWeek = config?.days_per_week || 5
  const dailyTasks = JSON.parse(config?.daily_tasks || '[]')
  const dailyFixed = dailyTasks.reduce((s, dt) => s + (dt.duration || 0), 0)
  const effectiveHoursPerDay = Math.max(1, hoursPerDay - dailyFixed)

  const daysMin = Math.ceil(totalRemaining.min / effectiveHoursPerDay)
  const daysEstimated = Math.ceil(totalRemaining.estimated / effectiveHoursPerDay)
  const daysMax = Math.ceil(totalRemaining.max / effectiveHoursPerDay)

  // Convert working days to calendar dates
  function addWorkDays(fromDate, workDays, daysPerWeek) {
    const d = new Date(fromDate || new Date())
    let added = 0
    while (added < workDays) {
      d.setDate(d.getDate() + 1)
      const dow = d.getDay()
      if (daysPerWeek >= 7 || (dow !== 0 && (daysPerWeek >= 6 || dow !== 6))) added++
    }
    return d.toISOString().slice(0, 10)
  }

  const now = new Date().toISOString().slice(0, 10)
  const dateBest = addWorkDays(now, daysMin, daysPerWeek)
  const dateProbable = addWorkDays(now, daysEstimated, daysPerWeek)
  const dateWorst = addWorkDays(now, daysMax, daysPerWeek)

  // By assignee stats
  const byAssignee = {}
  for (const t of (tasks || [])) {
    const name = t.referent_name || 'Non assigné'
    if (!byAssignee[name]) byAssignee[name] = { total: 0, done: 0, hours: 0 }
    byAssignee[name].total++
    if (t.status === 'done') byAssignee[name].done++
    byAssignee[name].hours += t.dur_estimated || 0
  }

  // Paused tasks count
  const pausedCount = (tasks || []).filter(t => t.is_paused).length
  const waitingCount = (tasks || []).filter(t => t.waiting_for).length

  return c.json({
    project: { ...project, history: JSON.parse(project.history || '[]'), is_paused: !!project.is_paused },
    task_count: (tasks || []).length,
    sub_total: subTotal,
    sub_done: subDone,
    progress: subTotal > 0 ? Math.round(subDone / subTotal * 100) : 0,
    by_status: byStatus,
    by_group: Object.entries(byGroup).map(([name, d]) => ({
      name, total: d.total, done: d.done, progress: d.total > 0 ? Math.round(d.done / d.total * 100) : 0
    })),
    by_assignee: Object.entries(byAssignee).map(([name, d]) => ({ name, ...d })),
    dates: {
      best: dateBest,
      probable: dateProbable,
      worst: dateWorst,
      target: project.target_end_date || project.end_date,
      remaining_days: daysEstimated,
    },
    time: {
      total_estimated: totalRemaining.estimated,
      effective_hours_day: effectiveHoursPerDay,
      paused_count: pausedCount,
      waiting_count: waitingCount,
    },
  })
})

// ===================== CONFIG =====================

// GET /config
smartMatrice.get('/config', async (c) => {
  const { company_id } = c.get('user')
  let config = await c.env.DB.prepare('SELECT * FROM sm_config WHERE company_id = ?').bind(company_id).first()
  if (!config) {
    config = await c.env.DB.prepare(
      "INSERT INTO sm_config (company_id) VALUES (?) RETURNING *"
    ).bind(company_id).first()
  }
  return c.json({ ...config, daily_tasks: JSON.parse(config.daily_tasks || '[]') })
})

// PATCH /config
smartMatrice.patch('/config', async (c) => {
  const { company_id } = c.get('user')
  const body = await c.req.json()

  const fields = []
  const values = []
  for (const key of ['country', 'company_name', 'days_per_week', 'hours_per_day', 'days_off_per_year', 'national_holidays', 'extra_days_off', 'company_type', 'contract_type', 'user_first_name']) {
    if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]) }
  }
  if (body.daily_tasks !== undefined) {
    fields.push('daily_tasks = ?')
    values.push(JSON.stringify(body.daily_tasks))
  }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)

  fields.push("updated_at = datetime('now')")
  values.push(company_id)

  let config = await c.env.DB.prepare(
    `UPDATE sm_config SET ${fields.join(', ')} WHERE company_id = ? RETURNING *`
  ).bind(...values).first()

  if (!config) {
    // Create if not exists
    config = await c.env.DB.prepare("INSERT INTO sm_config (company_id) VALUES (?) RETURNING *").bind(company_id).first()
  }

  return c.json({ ...config, daily_tasks: JSON.parse(config.daily_tasks || '[]') })
})

// ===================== IMPORT =====================

// POST /import — bulk import tasks from parsed CSV/JSON
smartMatrice.post('/import', async (c) => {
  const { company_id } = c.get('user')
  const { project_id, tasks: importTasks } = await c.req.json()

  if (!project_id || !Array.isArray(importTasks)) {
    return c.json({ error: 'project_id and tasks[] required' }, 400)
  }

  // Verify project
  const project = await c.env.DB.prepare('SELECT id FROM sm_projects WHERE id = ? AND company_id = ?').bind(project_id, company_id).first()
  if (!project) return c.json({ error: 'Project not found' }, 404)

  let created = 0
  for (const t of importTasks) {
    const task = await c.env.DB.prepare(
      `INSERT INTO sm_tasks (project_id, company_id, name, group_name, status, priority, dur_estimated, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    ).bind(
      project_id, company_id,
      t.name || 'Tâche importée',
      t.group_name || '',
      t.status || 'todo',
      t.priority || 'normal',
      t.dur_estimated || null,
      t.sort_order || created
    ).first()

    if (task && Array.isArray(t.subtasks)) {
      for (let i = 0; i < t.subtasks.length; i++) {
        await c.env.DB.prepare(
          'INSERT INTO sm_subtasks (task_id, name, sort_order) VALUES (?, ?, ?)'
        ).bind(task.id, t.subtasks[i].name || '', i).run()
      }
    }
    created++
  }

  return c.json({ imported: created })
})

export default smartMatrice
