import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'
import { planGate } from '../middleware/planGate.js'

const planning = new Hono()

const mw = [authMiddleware(), companyRequired(), trialGuard()]

// GET /api/planning/
planning.get('/', ...mw, async (c) => {
  const { company_id } = c.get('user')
  let cal = await c.env.DB.prepare(
    'SELECT * FROM calendar_events WHERE company_id = ?'
  ).bind(company_id).first()

  if (!cal) {
    cal = await c.env.DB.prepare(
      'INSERT INTO calendar_events (company_id) VALUES (?) RETURNING *'
    ).bind(company_id).first()
  }

  return c.json({ id: cal.id, events: JSON.parse(cal.events || '[]'), updated_at: cal.updated_at })
})

// POST /api/planning/save/ — Growth+ only
planning.post('/save/', ...mw, planGate('Growth'), async (c) => {
  const { company_id } = c.get('user')
  const { events } = await c.req.json()

  const cal = await c.env.DB.prepare(
    `INSERT INTO calendar_events (company_id, events, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(company_id) DO UPDATE SET
       events = excluded.events, updated_at = datetime('now')
     RETURNING *`
  ).bind(company_id, JSON.stringify(events || [])).first()

  return c.json({ id: cal.id, events: JSON.parse(cal.events || '[]'), updated_at: cal.updated_at })
})

export default planning
