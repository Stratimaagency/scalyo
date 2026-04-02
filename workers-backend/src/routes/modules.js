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

  const data = Object.values(csmMap).map(c => ({
    ...c,
    avgHealth: c.clientCount ? Math.round(c.healthSum / c.clientCount) : 0,
    workloadPct: Math.min(100, Math.round((c.clientCount / 15) * 100)), // 15 clients = 100%
  }))

  return c.json({ data })
})

// === PROJECTS (Gantt) ===
modules.get('/projects', ...mw, async (c) => {
  // TODO: brancher sur une table projects D1
  return c.json({ data: [] })
})

// === OKRs ===
modules.get('/okrs', ...mw, async (c) => {
  // TODO: brancher sur une table okrs D1
  return c.json({ data: [] })
})

modules.put('/okrs/:id/kr/:krId', ...mw, async (c) => {
  // TODO: brancher API
  return c.json({ ok: true })
})

// === PLAYBOOKS ===
modules.get('/playbooks', ...mw, async (c) => {
  // TODO: brancher sur une table playbooks D1
  return c.json({ data: [] })
})

modules.get('/playbooks/progress', ...mw, async (c) => {
  // TODO: brancher API
  return c.json({ data: {} })
})

modules.post('/playbooks/progress', ...mw, async (c) => {
  // TODO: brancher API
  return c.json({ ok: true })
})

export default modules
