import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const P = '/api/smart-matrice'
const mw = [authMiddleware(), companyRequired(), trialGuard()]

export function registerSmartMatriceRoutes(app) {

  // ===================== PROJECTS =====================

  app.get(`${P}`, ...mw, listProjects)
  app.get(`${P}/`, ...mw, listProjects)
  app.post(`${P}`, ...mw, createProject)
  app.post(`${P}/`, ...mw, createProject)
  app.patch(`${P}/:id`, ...mw, updateProject)
  app.delete(`${P}/:id`, ...mw, deleteProject)

  // ===================== TASKS =====================

  app.get(`${P}/:projectId/tasks`, ...mw, getTasks)
  app.post(`${P}/tasks`, ...mw, createTask)
  app.post(`${P}/tasks/`, ...mw, createTask)
  app.patch(`${P}/tasks/:id`, ...mw, updateTask)
  app.delete(`${P}/tasks/:id`, ...mw, deleteTask)

  // ===================== SUBTASKS =====================

  app.post(`${P}/tasks/:taskId/subtasks`, ...mw, createSubtask)
  app.patch(`${P}/subtasks/:id`, ...mw, updateSubtask)
  app.delete(`${P}/subtasks/:id`, ...mw, deleteSubtask)

  // ===================== OTHER =====================

  app.get(`${P}/team-workload`, ...mw, getTeamWorkload)
  app.get(`${P}/stats/:projectId`, ...mw, getStats)
  app.get(`${P}/config`, ...mw, getConfig)
  app.get(`${P}/config/`, ...mw, getConfig)
  app.patch(`${P}/config`, ...mw, updateConfig)
  app.patch(`${P}/config/`, ...mw, updateConfig)
  app.post(`${P}/import`, ...mw, importTasks)
  app.post(`${P}/import/`, ...mw, importTasks)
  app.post(`${P}/ai-estimate`, ...mw, aiEstimate)
  app.post(`${P}/ai-estimate/`, ...mw, aiEstimate)
}

// ===================== HANDLERS =====================

async function listProjects(c) {
  const { company_id } = c.get('user')
  const { results: projects } = await c.env.DB.prepare(`
    SELECT p.*, COALESCE(tc.task_count, 0) as task_count,
      COALESCE(sc.sub_total, 0) as sub_total, COALESCE(sc.sub_done, 0) as sub_done
    FROM sm_projects p
    LEFT JOIN (SELECT project_id, COUNT(*) as task_count FROM sm_tasks GROUP BY project_id) tc ON tc.project_id = p.id
    LEFT JOIN (
      SELECT t.project_id, COUNT(s.id) as sub_total, SUM(CASE WHEN s.done = 1 THEN 1 ELSE 0 END) as sub_done
      FROM sm_tasks t LEFT JOIN sm_subtasks s ON s.task_id = t.id GROUP BY t.project_id
    ) sc ON sc.project_id = p.id
    WHERE p.company_id = ? ORDER BY p.sort_order ASC, p.created_at DESC
  `).bind(company_id).all()
  return c.json((projects || []).map(p => ({ ...p, progress: p.sub_total > 0 ? Math.round(p.sub_done / p.sub_total * 100) : 0 })))
}

async function createProject(c) {
  const { company_id, id: user_id } = c.get('user')
  const body = await c.req.json()
  try {
    // Try with V2 columns (history, state, target_end_date)
    const history = JSON.stringify([{ date: new Date().toISOString(), action: 'created', details: body.name || 'Nouveau projet', user_id }])
    const row = await c.env.DB.prepare(
      `INSERT INTO sm_projects (company_id, name, description, emoji, color, start_date, end_date, target_end_date, state, history, working_days_year, days_off_year, hours_per_day, working_days_week)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(company_id, body.name || 'Nouveau projet', body.description || '', body.emoji || '📁', body.color || '#3b82f6',
      body.start_date || null, body.end_date || null, body.target_end_date || body.end_date || null, body.state || 'active', history,
      body.working_days_year || 260, body.days_off_year || 14, body.hours_per_day || 8, body.working_days_week || 5).first()
    return c.json({ ...row, history: JSON.parse(row.history || '[]') }, 201)
  } catch {
    // Fallback for V1 schema (no history/state columns)
    const row = await c.env.DB.prepare(
      `INSERT INTO sm_projects (company_id, name, description, emoji, color, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(company_id, body.name || 'Nouveau projet', body.description || '', body.emoji || '📁', body.color || '#3b82f6',
      body.start_date || null, body.end_date || null, body.state || body.status || 'active').first()
    return c.json(row, 201)
  }
}

async function updateProject(c) {
  const { company_id, id: user_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const fields = [], values = []
  const allowed = ['name', 'description', 'emoji', 'color', 'status', 'start_date', 'end_date', 'target_end_date', 'actual_end_date', 'sort_order', 'state']
  for (const key of allowed) { if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]) } }
  if (body.is_paused !== undefined) { fields.push('is_paused = ?'); values.push(body.is_paused ? 1 : 0); fields.push(body.is_paused ? "paused_at = datetime('now')" : 'paused_at = NULL') }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)
  const existing = await c.env.DB.prepare('SELECT history FROM sm_projects WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (existing) { const hist = JSON.parse(existing.history || '[]'); hist.push({ date: new Date().toISOString(), action: 'updated', details: Object.keys(body).filter(k => allowed.includes(k)).join(', '), user_id }); fields.push('history = ?'); values.push(JSON.stringify(hist.slice(-50))) }
  fields.push("updated_at = datetime('now')"); values.push(id, company_id)
  const row = await c.env.DB.prepare(`UPDATE sm_projects SET ${fields.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`).bind(...values).first()
  if (!row) return c.json({ error: 'Project not found' }, 404)
  return c.json({ ...row, is_paused: !!row.is_paused, history: JSON.parse(row.history || '[]') })
}

async function deleteProject(c) {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM sm_projects WHERE id = ? AND company_id = ?').bind(id, company_id).run()
  return c.json({ status: 'deleted' })
}

async function getTasks(c) {
  const { company_id } = c.get('user')
  const projectId = parseInt(c.req.param('projectId'), 10)
  const { results: tasks } = await c.env.DB.prepare('SELECT * FROM sm_tasks WHERE project_id = ? AND company_id = ? ORDER BY sort_order ASC, created_at ASC').bind(projectId, company_id).all()
  // Also get legacy subtasks
  const taskIds = (tasks || []).map(t => t.id)
  let subtaskMap = {}
  if (taskIds.length) {
    const ph = taskIds.map(() => '?').join(',')
    const { results: subs } = await c.env.DB.prepare(`SELECT * FROM sm_subtasks WHERE task_id IN (${ph}) ORDER BY sort_order ASC`).bind(...taskIds).all()
    for (const s of (subs || [])) { if (!subtaskMap[s.task_id]) subtaskMap[s.task_id] = []; subtaskMap[s.task_id].push(s) }
  }
  // Build tree: tasks with parent_id are children
  const flat = (tasks || []).map(t => {
    const subs = subtaskMap[t.id] || []
    const subProgress = subs.length > 0 ? Math.round(subs.filter(s => s.done).length / subs.length * 100) : null
    return { ...t, is_paused: !!t.is_paused, subtasks: subs.map(s => ({ ...s, done: !!s.done })), progress: t.progress || subProgress || 0, history: JSON.parse(t.history || '[]') }
  })
  // Build hierarchy
  const map = {}
  for (const t of flat) { map[t.id] = { ...t, children: [] } }
  const roots = []
  for (const t of flat) {
    if (t.parent_id && map[t.parent_id]) map[t.parent_id].children.push(map[t.id])
    else roots.push(map[t.id])
  }
  // Calculate aggregates bottom-up
  function calcAggregates(node) {
    if (node.children.length) {
      for (const child of node.children) calcAggregates(child)
      const kids = node.children
      node.dur_estimated = node.dur_estimated || kids.reduce((s, k) => s + (k.dur_estimated || 0), 0)
      node.actual_duration = node.actual_duration || kids.reduce((s, k) => s + (k.actual_duration || 0), 0)
      node.progress = kids.length ? Math.round(kids.reduce((s, k) => s + (k.progress || 0), 0) / kids.length) : node.progress
      if (node.dur_estimated && node.actual_duration) node.accuracy = Math.round((1 - Math.abs(node.actual_duration - node.dur_estimated) / node.dur_estimated) * 100)
    }
  }
  for (const root of roots) calcAggregates(root)
  return c.json(roots)
}

async function createTask(c) {
  const { company_id, id: user_id } = c.get('user')
  const body = await c.req.json()
  if (!body.project_id) return c.json({ error: 'project_id required' }, 400)
  const history = JSON.stringify([{ date: new Date().toISOString(), action: 'created', details: body.name || 'Nouvelle tâche', user_id }])
  const row = await c.env.DB.prepare(
    `INSERT INTO sm_tasks (project_id, company_id, name, group_name, status, priority, quadrant, start_date, end_date, dur_min, dur_max, dur_estimated, assigned_to, sort_order, description, referent_name, waiting_for, parent_id, depth, difficulty, importance, urgency, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(body.project_id, company_id, body.name || 'Nouvelle tâche', body.group_name || '', body.status || 'todo', body.priority || 'normal', body.quadrant || 0,
    body.start_date || null, body.end_date || null, body.dur_min || null, body.dur_max || null, body.dur_estimated || null, body.assigned_to || null, body.sort_order || 0,
    body.description || '', body.referent_name || '', body.waiting_for || '',
    body.parent_id || null, body.depth || 0, body.difficulty || 'medium', body.importance || 'normal', body.urgency || 'normal', history).first()
  return c.json({ ...row, is_paused: false, subtasks: [], children: [], progress: 0, history: JSON.parse(row.history || '[]') }, 201)
}

async function updateTask(c) {
  const { company_id, id: user_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const allowed = ['name', 'group_name', 'status', 'priority', 'quadrant', 'start_date', 'end_date', 'dur_min', 'dur_max', 'dur_estimated', 'dur_ai', 'dur_real', 'assigned_to', 'is_paused', 'sort_order', 'description', 'referent_name', 'waiting_for', 'actual_end_date', 'is_repetitive', 'cycle_count', 'parent_id', 'depth', 'progress', 'difficulty', 'importance', 'urgency', 'actual_duration', 'accuracy', 'ai_recommendation']
  const fields = [], values = []
  for (const key of allowed) { if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(['is_paused', 'is_repetitive'].includes(key) ? (body[key] ? 1 : 0) : body[key]) } }
  if (body.is_paused === true) fields.push("paused_at = datetime('now')")
  else if (body.is_paused === false) fields.push('paused_at = NULL')
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)
  const existing = await c.env.DB.prepare('SELECT history FROM sm_tasks WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (existing) { const hist = JSON.parse(existing.history || '[]'); hist.push({ date: new Date().toISOString(), action: 'updated', details: Object.keys(body).filter(k => allowed.includes(k)).join(', '), user_id }); fields.push('history = ?'); values.push(JSON.stringify(hist.slice(-50))) }
  fields.push("updated_at = datetime('now')"); values.push(id, company_id)
  const row = await c.env.DB.prepare(`UPDATE sm_tasks SET ${fields.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`).bind(...values).first()
  if (!row) return c.json({ error: 'Task not found' }, 404)
  return c.json({ ...row, is_paused: !!row.is_paused, is_repetitive: !!row.is_repetitive, history: JSON.parse(row.history || '[]') })
}

async function deleteTask(c) {
  const { company_id } = c.get('user')
  await c.env.DB.prepare('DELETE FROM sm_tasks WHERE id = ? AND company_id = ?').bind(parseInt(c.req.param('id'), 10), company_id).run()
  return c.json({ status: 'deleted' })
}

async function createSubtask(c) {
  const { company_id } = c.get('user')
  const taskId = parseInt(c.req.param('taskId'), 10)
  const task = await c.env.DB.prepare('SELECT id FROM sm_tasks WHERE id = ? AND company_id = ?').bind(taskId, company_id).first()
  if (!task) return c.json({ error: 'Task not found' }, 404)
  const body = await c.req.json()
  const row = await c.env.DB.prepare('INSERT INTO sm_subtasks (task_id, name, sort_order) VALUES (?, ?, ?) RETURNING *').bind(taskId, body.name || '', body.sort_order || 0).first()
  return c.json({ ...row, done: false }, 201)
}

async function updateSubtask(c) {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const sub = await c.env.DB.prepare('SELECT s.id FROM sm_subtasks s JOIN sm_tasks t ON t.id = s.task_id WHERE s.id = ? AND t.company_id = ?').bind(id, company_id).first()
  if (!sub) return c.json({ error: 'Subtask not found' }, 404)
  const body = await c.req.json()
  const fields = [], values = []
  if (body.done !== undefined) { fields.push('done = ?'); values.push(body.done ? 1 : 0) }
  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(body.sort_order) }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)
  values.push(id)
  const row = await c.env.DB.prepare(`UPDATE sm_subtasks SET ${fields.join(', ')} WHERE id = ? RETURNING *`).bind(...values).first()
  return c.json({ ...row, done: !!row.done })
}

async function deleteSubtask(c) {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const sub = await c.env.DB.prepare('SELECT s.id FROM sm_subtasks s JOIN sm_tasks t ON t.id = s.task_id WHERE s.id = ? AND t.company_id = ?').bind(id, company_id).first()
  if (!sub) return c.json({ error: 'Subtask not found' }, 404)
  await c.env.DB.prepare('DELETE FROM sm_subtasks WHERE id = ?').bind(id).run()
  return c.json({ status: 'deleted' })
}

async function getTeamWorkload(c) {
  const { company_id } = c.get('user')
  const db = c.env.DB
  const { results: members } = await db.prepare('SELECT id, email, display_name, role FROM users WHERE company_id = ?').bind(company_id).all()
  const { results: taskStats } = await db.prepare('SELECT assigned_to, COUNT(*) as task_count, SUM(CASE WHEN status = \'done\' THEN 1 ELSE 0 END) as done_count FROM sm_tasks WHERE company_id = ? GROUP BY assigned_to').bind(company_id).all()
  const statsMap = {}
  for (const s of (taskStats || [])) { if (s.assigned_to) statsMap[s.assigned_to] = s }
  return c.json((members || []).map(m => ({ ...m, initials: (m.display_name || m.email || '').slice(0, 2).toUpperCase(), ...(statsMap[m.id] || { task_count: 0, done_count: 0 }) })))
}

async function getStats(c) {
  const { company_id } = c.get('user')
  const projectId = parseInt(c.req.param('projectId'), 10)
  const db = c.env.DB
  const project = await db.prepare('SELECT * FROM sm_projects WHERE id = ? AND company_id = ?').bind(projectId, company_id).first()
  if (!project) return c.json({ error: 'Project not found' }, 404)
  const { results: tasks } = await db.prepare('SELECT * FROM sm_tasks WHERE project_id = ? AND company_id = ?').bind(projectId, company_id).all()
  const taskIds = (tasks || []).map(t => t.id)
  let subTotal = 0, subDone = 0
  if (taskIds.length) { const ph = taskIds.map(() => '?').join(','); const row = await db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN done=1 THEN 1 ELSE 0 END) as done FROM sm_subtasks WHERE task_id IN (${ph})`).bind(...taskIds).first(); subTotal = row?.total || 0; subDone = row?.done || 0 }
  const byStatus = { todo: 0, in_progress: 0, blocked: 0, done: 0 }
  for (const t of (tasks || [])) byStatus[t.status] = (byStatus[t.status] || 0) + 1
  const byGroup = {}
  for (const t of (tasks || [])) { const g = t.group_name || 'Sans groupe'; if (!byGroup[g]) byGroup[g] = { total: 0, done: 0 }; byGroup[g].total++; if (t.status === 'done') byGroup[g].done++ }
  let config = await db.prepare('SELECT * FROM sm_config WHERE company_id = ?').bind(company_id).first()
  const hoursPerDay = config?.hours_per_day || 8, daysPerWeek = config?.days_per_week || 5
  const dailyFixed = JSON.parse(config?.daily_tasks || '[]').reduce((s, dt) => s + (dt.duration || 0), 0)
  const effectiveHPD = Math.max(1, hoursPerDay - dailyFixed)
  const activeTasks = (tasks || []).filter(t => t.status !== 'done' && !t.is_paused)
  const rem = { min: 0, est: 0, max: 0 }
  for (const t of activeTasks) { rem.min += t.dur_min || t.dur_estimated || 1; rem.est += t.dur_estimated || t.dur_min || 1; rem.max += t.dur_max || t.dur_estimated || 2 }
  function addWD(from, wd, dpw) { const d = new Date(from || new Date()); let a = 0; while (a < wd) { d.setDate(d.getDate() + 1); const dow = d.getDay(); if (dpw >= 7 || (dow !== 0 && (dpw >= 6 || dow !== 6))) a++ } return d.toISOString().slice(0, 10) }
  const now = new Date().toISOString().slice(0, 10)
  const byAssignee = {}
  for (const t of (tasks || [])) { const n = t.referent_name || 'Non assigné'; if (!byAssignee[n]) byAssignee[n] = { total: 0, done: 0, hours: 0 }; byAssignee[n].total++; if (t.status === 'done') byAssignee[n].done++; byAssignee[n].hours += t.dur_estimated || 0 }
  return c.json({
    project: { ...project, history: JSON.parse(project.history || '[]'), is_paused: !!project.is_paused },
    task_count: (tasks || []).length, sub_total: subTotal, sub_done: subDone, progress: subTotal > 0 ? Math.round(subDone / subTotal * 100) : 0,
    by_status: byStatus, by_group: Object.entries(byGroup).map(([name, d]) => ({ name, total: d.total, done: d.done, progress: d.total > 0 ? Math.round(d.done / d.total * 100) : 0 })),
    by_assignee: Object.entries(byAssignee).map(([name, d]) => ({ name, ...d })),
    dates: { best: addWD(now, Math.ceil(rem.min / effectiveHPD), daysPerWeek), probable: addWD(now, Math.ceil(rem.est / effectiveHPD), daysPerWeek), worst: addWD(now, Math.ceil(rem.max / effectiveHPD), daysPerWeek), target: project.target_end_date || project.end_date, remaining_days: Math.ceil(rem.est / effectiveHPD) },
    time: { total_estimated: rem.est, effective_hours_day: effectiveHPD, paused_count: (tasks || []).filter(t => t.is_paused).length, waiting_count: (tasks || []).filter(t => t.waiting_for).length },
  })
}

async function getConfig(c) {
  const { company_id } = c.get('user')
  let config = await c.env.DB.prepare('SELECT * FROM sm_config WHERE company_id = ?').bind(company_id).first()
  if (!config) config = await c.env.DB.prepare("INSERT INTO sm_config (company_id) VALUES (?) RETURNING *").bind(company_id).first()
  return c.json({ ...config, daily_tasks: JSON.parse(config.daily_tasks || '[]') })
}

async function updateConfig(c) {
  const { company_id } = c.get('user')
  const body = await c.req.json()
  const fields = [], values = []
  for (const key of ['country', 'company_name', 'days_per_week', 'hours_per_day', 'days_off_per_year', 'national_holidays', 'extra_days_off', 'company_type', 'contract_type', 'user_first_name']) { if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]) } }
  if (body.daily_tasks !== undefined) { fields.push('daily_tasks = ?'); values.push(JSON.stringify(body.daily_tasks)) }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)
  fields.push("updated_at = datetime('now')"); values.push(company_id)
  let config = await c.env.DB.prepare(`UPDATE sm_config SET ${fields.join(', ')} WHERE company_id = ? RETURNING *`).bind(...values).first()
  if (!config) config = await c.env.DB.prepare("INSERT INTO sm_config (company_id) VALUES (?) RETURNING *").bind(company_id).first()
  return c.json({ ...config, daily_tasks: JSON.parse(config.daily_tasks || '[]') })
}

async function importTasks(c) {
  const { company_id } = c.get('user')
  const { project_id, tasks: importT } = await c.req.json()
  if (!project_id || !Array.isArray(importT)) return c.json({ error: 'project_id and tasks[] required' }, 400)
  const project = await c.env.DB.prepare('SELECT id FROM sm_projects WHERE id = ? AND company_id = ?').bind(project_id, company_id).first()
  if (!project) return c.json({ error: 'Project not found' }, 404)
  let created = 0
  for (const t of importT) {
    const task = await c.env.DB.prepare('INSERT INTO sm_tasks (project_id, company_id, name, group_name, status, priority, dur_estimated, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id').bind(project_id, company_id, t.name || 'Tâche importée', t.group_name || '', t.status || 'todo', t.priority || 'normal', t.dur_estimated || null, t.sort_order || created).first()
    if (task && Array.isArray(t.subtasks)) { for (let i = 0; i < t.subtasks.length; i++) { await c.env.DB.prepare('INSERT INTO sm_subtasks (task_id, name, sort_order) VALUES (?, ?, ?)').bind(task.id, t.subtasks[i].name || '', i).run() } }
    created++
  }
  return c.json({ imported: created })
}

// AI Estimation — calcule les temps et recommandations
async function aiEstimate(c) {
  try {
  const { company_id } = c.get('user')
  const body = await c.req.json()
  const db = c.env.DB
  const projectId = body.project_id
  if (!projectId) return c.json({ error: 'project_id required' }, 400)

  const { results: tasks } = await db.prepare('SELECT * FROM sm_tasks WHERE project_id = ? AND company_id = ?').bind(projectId, company_id).all()
  if (!tasks?.length) return c.json({ error: 'No tasks' }, 400)

  const project = await db.prepare('SELECT * FROM sm_projects WHERE id = ? AND company_id = ?').bind(projectId, company_id).first()
  const hpd = project?.hours_per_day || 8
  const dpw = project?.working_days_week || 5

  const updates = []
  const recommendations = []

  for (const task of tasks) {
    if (task.status === 'done') continue
    const est = task.dur_estimated || 0
    const min = task.dur_min || est * 0.7
    const max = task.dur_max || est * 1.5
    // IA: moyenne pondérée (PERT: (min + 4*est + max) / 6)
    const aiDur = est > 0 ? Math.round(((min + 4 * est + max) / 6) * 100) / 100 : null

    // Accuracy: si on a actual_duration, calculer la précision
    let accuracy = null
    if (task.actual_duration && est > 0) {
      accuracy = Math.round((1 - Math.abs(task.actual_duration - est) / est) * 100)
    }

    // Urgency auto-calculée
    let autoUrgency = task.urgency || 'normal'
    if (task.end_date) {
      const daysLeft = Math.ceil((new Date(task.end_date) - new Date()) / 86400000)
      if (daysLeft < 0) autoUrgency = 'critical'
      else if (daysLeft < 3) autoUrgency = 'high'
      else if (daysLeft < 7) autoUrgency = 'medium'
    }

    // Recommendation
    let rec = ''
    if (task.end_date) {
      const daysLeft = Math.ceil((new Date(task.end_date) - new Date()) / 86400000)
      const daysNeeded = aiDur ? Math.ceil(aiDur / hpd) : 0
      if (daysNeeded > daysLeft && daysLeft > 0) {
        rec = `⚠ Retard probable : ${daysNeeded}j nécessaires, ${daysLeft}j restants. Réduire le scope ou ajouter des ressources.`
      } else if (daysLeft < 0) {
        rec = `🔴 En retard de ${Math.abs(daysLeft)}j. Reprioriser immédiatement.`
      } else if (daysLeft <= 2 && task.status === 'todo') {
        rec = `⚡ Échéance dans ${daysLeft}j et pas commencé. Démarrer maintenant.`
      }
    }
    if (task.dur_estimated && task.actual_duration && task.actual_duration > task.dur_estimated * 1.3) {
      rec += rec ? ' ' : ''
      rec += `📊 Durée réelle (${task.actual_duration}h) dépasse l'estimation (${task.dur_estimated}h) de ${Math.round((task.actual_duration / task.dur_estimated - 1) * 100)}%.`
    }

    if (aiDur !== null || accuracy !== null || rec) {
      const sets = []
      const vals = []
      if (aiDur !== null) { sets.push('dur_ai = ?'); vals.push(aiDur) }
      if (accuracy !== null) { sets.push('accuracy = ?'); vals.push(accuracy) }
      if (autoUrgency !== task.urgency) { sets.push('urgency = ?'); vals.push(autoUrgency) }
      if (rec) { sets.push('ai_recommendation = ?'); vals.push(rec) }
      if (sets.length) {
        sets.push("updated_at = datetime('now')")
        vals.push(task.id, company_id)
        updates.push(db.prepare(`UPDATE sm_tasks SET ${sets.join(', ')} WHERE id = ? AND company_id = ?`).bind(...vals))
      }
      if (rec) recommendations.push({ task_id: task.id, task_name: task.name, recommendation: rec })
    }
  }

  if (updates.length) await db.batch(updates)

  // Project-level stats
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const totalEst = activeTasks.reduce((s, t) => s + (t.dur_estimated || 0), 0)
  const totalActual = tasks.reduce((s, t) => s + (t.actual_duration || 0), 0)
  const doneCount = tasks.filter(t => t.status === 'done').length
  const overallProgress = tasks.length ? Math.round(doneCount / tasks.length * 100) : 0
  const daysToComplete = Math.ceil(totalEst / hpd)

  return c.json({
    tasks_analyzed: tasks.length,
    updates_applied: updates.length,
    recommendations,
    summary: {
      total_estimated_hours: totalEst,
      total_actual_hours: totalActual,
      overall_progress: overallProgress,
      days_to_complete: daysToComplete,
      tasks_at_risk: recommendations.length,
    }
  })
  } catch (err) {
    console.error('AI estimate error:', err.message)
    return c.json({ error: 'AI analysis failed', detail: err.message }, 500)
  }
}
