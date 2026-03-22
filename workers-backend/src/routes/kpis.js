import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const kpis = new Hono()
kpis.use('/*', authMiddleware(), companyRequired())

function parseKpiRow(row) {
  return {
    id: row.id,
    period: row.period,
    kpis: JSON.parse(row.kpis || '{}'),
    goals: JSON.parse(row.goals || '{}'),
    custom_kpis: JSON.parse(row.custom_kpis || '[]'),
    history: JSON.parse(row.history || '{}'),
    updated_at: row.updated_at,
  }
}

// GET /api/kpis/
kpis.get('/', async (c) => {
  const { company_id } = c.get('user')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM kpi_data WHERE company_id = ?'
  ).bind(company_id).all()
  return c.json(results.map(parseKpiRow))
})

// POST /api/kpis/monthly/
kpis.post('/monthly/', async (c) => {
  const { company_id } = c.get('user')
  const { period, kpis: kpisData, goals } = await c.req.json()

  if (!period || period.startsWith('__')) {
    return c.json({ error: 'Invalid period' }, 400)
  }

  const row = await c.env.DB.prepare(
    `INSERT INTO kpi_data (company_id, period, kpis, goals, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(company_id, period) DO UPDATE SET
       kpis = excluded.kpis, goals = excluded.goals, updated_at = datetime('now')
     RETURNING *`
  ).bind(company_id, period, JSON.stringify(kpisData || {}), JSON.stringify(goals || {})).first()

  return c.json(parseKpiRow(row))
})

// POST /api/kpis/custom/
kpis.post('/custom/', async (c) => {
  const { company_id } = c.get('user')
  const { custom_kpis, history } = await c.req.json()

  const row = await c.env.DB.prepare(
    `INSERT INTO kpi_data (company_id, period, custom_kpis, history, updated_at)
     VALUES (?, '__custom__', ?, ?, datetime('now'))
     ON CONFLICT(company_id, period) DO UPDATE SET
       custom_kpis = excluded.custom_kpis, history = excluded.history, updated_at = datetime('now')
     RETURNING *`
  ).bind(company_id, JSON.stringify(custom_kpis || []), JSON.stringify(history || {})).first()

  return c.json(parseKpiRow(row))
})

// POST /api/kpis/goals/
kpis.post('/goals/', async (c) => {
  const { company_id } = c.get('user')
  const { goals } = await c.req.json()

  if (!goals) return c.json({ error: 'goals is required' }, 400)

  const row = await c.env.DB.prepare(
    `INSERT INTO kpi_data (company_id, period, goals, updated_at)
     VALUES (?, '__goals__', ?, datetime('now'))
     ON CONFLICT(company_id, period) DO UPDATE SET
       goals = excluded.goals, updated_at = datetime('now')
     RETURNING *`
  ).bind(company_id, JSON.stringify(goals)).first()

  return c.json(parseKpiRow(row))
})

export default kpis
