import { authMiddleware, companyRequired } from '../middleware/auth.js'

function parseWellbeing(row) {
  return {
    id: row.id,
    score: row.score,
    burnout: row.burnout,
    charge: row.charge,
    trend: row.trend,
    alerts: JSON.parse(row.alerts || '[]'),
    team: JSON.parse(row.team || '[]'),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function getWellbeing(c) {
  const { company_id } = c.get('user')
  let row = await c.env.DB.prepare(
    'SELECT * FROM wellbeing WHERE company_id = ?'
  ).bind(company_id).first()

  if (!row) {
    row = await c.env.DB.prepare(
      'INSERT INTO wellbeing (company_id) VALUES (?) RETURNING *'
    ).bind(company_id).first()
  }

  return c.json(parseWellbeing(row))
}

async function updateWellbeing(c) {
  const { company_id } = c.get('user')
  const data = await c.req.json()

  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO wellbeing (company_id) VALUES (?)'
  ).bind(company_id).run()

  const sets = []
  const values = []

  if (data.burnout !== undefined && !['none', 'low', 'moderate', 'high'].includes(data.burnout)) {
    return c.json({ error: 'burnout must be none, low, moderate, or high' }, 400)
  }
  for (const key of ['score', 'burnout', 'charge', 'trend']) {
    if (data[key] !== undefined) { sets.push(`${key} = ?`); values.push(data[key]) }
  }
  for (const key of ['alerts', 'team']) {
    if (data[key] !== undefined) { sets.push(`${key} = ?`); values.push(JSON.stringify(data[key])) }
  }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  sets.push("updated_at = datetime('now')")
  values.push(company_id)

  const row = await c.env.DB.prepare(
    `UPDATE wellbeing SET ${sets.join(', ')} WHERE company_id = ? RETURNING *`
  ).bind(...values).first()

  return c.json(parseWellbeing(row))
}

export function registerWellbeingRoutes(app) {
  const auth = authMiddleware()
  const company = companyRequired()

  app.get('/api/wellbeing', auth, company, getWellbeing)
  app.get('/api/wellbeing/', auth, company, getWellbeing)
  app.patch('/api/wellbeing/update/', auth, company, updateWellbeing)
}
