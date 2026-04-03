import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const modules = new Hono()
const mw = [authMiddleware(), companyRequired(), trialGuard()]

// === CLIENTS HEALTH ===
modules.get('/clients/health', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const db = c.env.DB
  const { results } = await db.prepare(
    'SELECT id, name, health, arr, mrr, csm, renewal, risk FROM accounts WHERE company_id = ?'
  ).bind(company_id).all()

  const data = (results || []).map(a => ({
    id: a.id,
    name: a.name,
    healthScore: a.health || 0,
    status: (a.health || 0) >= 75 ? 'healthy' : (a.health || 0) >= 60 ? 'neutral' : 'at-risk',
    arrValue: a.arr || (a.mrr ? a.mrr * 12 : 0),
    csmId: a.csm || null,
    csmName: a.csm || '',
    renewal: a.renewal || null,
    issues: [],
  }))

  return c.json({ data })
})

modules.post('/clients/:id/health', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const clientId = c.req.param('id')
  const { healthScore } = await c.req.json()
  await c.env.DB.prepare(
    "UPDATE accounts SET health = ?, updated_at = datetime('now') WHERE id = ? AND company_id = ?"
  ).bind(healthScore, clientId, company_id).run()
  return c.json({ ok: true })
})

// === CSM WORKLOAD ===
modules.get('/csms/workload', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const db = c.env.DB
  const { results: accounts } = await db.prepare(
    'SELECT csm, health, arr, mrr FROM accounts WHERE company_id = ?'
  ).bind(company_id).all()

  const csmMap = {}
  ;(accounts || []).forEach(a => {
    const name = a.csm || 'Non assigné'
    if (!csmMap[name]) {
      csmMap[name] = { id: name, name, clientCount: 0, totalArr: 0, avgHealth: 0, healthSum: 0, atRisk: 0 }
    }
    csmMap[name].clientCount++
    csmMap[name].totalArr += a.arr || (a.mrr ? a.mrr * 12 : 0)
    csmMap[name].healthSum += a.health || 0
    if ((a.health || 0) < 60) csmMap[name].atRisk++
  })

  const data = Object.values(csmMap).map(csm => ({
    ...csm,
    avgHealth: csm.clientCount ? Math.round(csm.healthSum / csm.clientCount) : 0,
    workloadPct: Math.min(100, Math.round((csm.clientCount / 15) * 100)),
  }))

  return c.json({ data })
})

// === PLAYBOOKS ===
modules.get('/playbooks', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const db = c.env.DB
  try {
    const { results } = await db.prepare('SELECT * FROM playbooks WHERE company_id = ? ORDER BY created_at DESC').bind(company_id).all()
    const data = (results || []).map(pb => ({
      ...pb,
      clients: JSON.parse(pb.clients || '[]'),
      steps: JSON.parse(pb.steps || '[]'),
    }))
    return c.json({ data })
  } catch {
    return c.json({ data: [] })
  }
})

modules.post('/playbooks', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const body = await c.req.json()
  const row = await c.env.DB.prepare(
    `INSERT INTO playbooks (company_id, name, emoji, type, description, trigger_condition, total_days, clients, steps, status, started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')) RETURNING *`
  ).bind(
    company_id, body.name || '', body.emoji || '📋', body.type || '',
    body.description || '', body.trigger_condition || '', body.total_days || 30,
    JSON.stringify(body.clients || []), JSON.stringify(body.steps || []),
    body.status || 'active'
  ).first()
  return c.json({ ...row, clients: JSON.parse(row.clients || '[]'), steps: JSON.parse(row.steps || '[]') }, 201)
})

modules.patch('/playbooks/:id', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const fields = [], values = []
  for (const key of ['name', 'emoji', 'type', 'description', 'status', 'trigger_condition', 'total_days']) {
    if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]) }
  }
  if (body.clients) { fields.push('clients = ?'); values.push(JSON.stringify(body.clients)) }
  if (body.steps) { fields.push('steps = ?'); values.push(JSON.stringify(body.steps)) }
  if (body.status === 'completed') { fields.push("completed_at = datetime('now')") }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)
  fields.push("updated_at = datetime('now')")
  values.push(id, company_id)
  const row = await c.env.DB.prepare(`UPDATE playbooks SET ${fields.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`).bind(...values).first()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({ ...row, clients: JSON.parse(row.clients || '[]'), steps: JSON.parse(row.steps || '[]') })
})

modules.delete('/playbooks/:id', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM playbooks WHERE id = ? AND company_id = ?').bind(id, company_id).run()
  return c.json({ ok: true })
})

// Playbook Progress
modules.get('/playbooks/progress', ...mw, async (c) => {
  const { company_id } = c.get('user')
  try {
    const { results } = await c.env.DB.prepare('SELECT playbook_id, step_index FROM playbook_progress WHERE company_id = ?').bind(company_id).all()
    const data = {}
    for (const r of (results || [])) {
      if (!data[r.playbook_id]) data[r.playbook_id] = []
      data[r.playbook_id].push(r.step_index)
    }
    return c.json({ data })
  } catch {
    return c.json({ data: {} })
  }
})

modules.post('/playbooks/progress', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const { playbookId, stepIndex, done } = await c.req.json()
  if (done) {
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO playbook_progress (company_id, playbook_id, step_index) VALUES (?, ?, ?)'
    ).bind(company_id, playbookId, stepIndex).run()
  } else {
    await c.env.DB.prepare(
      'DELETE FROM playbook_progress WHERE company_id = ? AND playbook_id = ? AND step_index = ?'
    ).bind(company_id, playbookId, stepIndex).run()
  }
  return c.json({ ok: true })
})

// === OKRs ===
modules.get('/okrs', ...mw, async (c) => {
  const { company_id } = c.get('user')
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM okrs WHERE company_id = ? ORDER BY created_at DESC').bind(company_id).all()
    const data = (results || []).map(okr => ({
      ...okr,
      keyResults: JSON.parse(okr.key_results || '[]'),
    }))
    return c.json({ data })
  } catch {
    return c.json({ data: [] })
  }
})

modules.post('/okrs', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const body = await c.req.json()
  const row = await c.env.DB.prepare(
    `INSERT INTO okrs (company_id, objective, emoji, period, owner, key_results, status)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    company_id, body.objective || '', body.emoji || '🎯',
    body.period || '', body.owner || '',
    JSON.stringify(body.keyResults || body.key_results || []),
    body.status || 'active'
  ).first()
  return c.json({ ...row, keyResults: JSON.parse(row.key_results || '[]') }, 201)
})

modules.put('/okrs/:id', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const fields = [], values = []
  for (const key of ['objective', 'emoji', 'period', 'owner', 'status']) {
    if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]) }
  }
  if (body.keyResults || body.key_results) {
    fields.push('key_results = ?')
    values.push(JSON.stringify(body.keyResults || body.key_results))
  }
  if (!fields.length) return c.json({ error: 'Nothing to update' }, 400)
  fields.push("updated_at = datetime('now')")
  values.push(id, company_id)
  const row = await c.env.DB.prepare(`UPDATE okrs SET ${fields.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`).bind(...values).first()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({ ...row, keyResults: JSON.parse(row.key_results || '[]') })
})

modules.put('/okrs/:id/kr/:krId', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const okr = await c.env.DB.prepare('SELECT * FROM okrs WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (!okr) return c.json({ error: 'Not found' }, 404)
  const krs = JSON.parse(okr.key_results || '[]')
  const krId = c.req.param('krId')
  const idx = krs.findIndex(k => k.id === krId)
  if (idx === -1) return c.json({ error: 'KR not found' }, 404)
  Object.assign(krs[idx], body)
  await c.env.DB.prepare("UPDATE okrs SET key_results = ?, updated_at = datetime('now') WHERE id = ? AND company_id = ?")
    .bind(JSON.stringify(krs), id, company_id).run()
  return c.json({ ok: true, keyResults: krs })
})

modules.delete('/okrs/:id', ...mw, async (c) => {
  const { company_id } = c.get('user')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM okrs WHERE id = ? AND company_id = ?').bind(id, company_id).run()
  return c.json({ ok: true })
})

// === PROJECTS (Gantt) — reads from SM projects ===
modules.get('/projects', ...mw, async (c) => {
  const { company_id } = c.get('user')
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, emoji, color, start_date, end_date FROM sm_projects WHERE company_id = ? ORDER BY sort_order ASC'
    ).bind(company_id).all()
    const projects = []
    for (const p of (results || [])) {
      const { results: tasks } = await c.env.DB.prepare(
        'SELECT id, name, status, start_date, end_date, dur_estimated, group_name FROM sm_tasks WHERE project_id = ? AND company_id = ?'
      ).bind(p.id, company_id).all()
      projects.push({
        ...p,
        clientName: '',
        tasks: (tasks || []).map(t => ({
          id: t.id, title: t.name, done: t.status === 'done',
          startWeek: t.start_date ? Math.ceil((new Date(t.start_date) - new Date(new Date().getFullYear(), 0, 1)) / 604800000) : 0,
          durationWeeks: Math.max(1, Math.ceil((t.dur_estimated || 1) / 40)),
          tag: t.group_name || '',
        }))
      })
    }
    return c.json({ data: projects })
  } catch {
    return c.json({ data: [] })
  }
})

export default modules
