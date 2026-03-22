import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const roadmap = new Hono()
roadmap.use('/*', authMiddleware(), companyRequired())

function parseRoadmap(row) {
  return {
    id: row.id,
    phase: row.phase,
    progress: row.progress,
    items: JSON.parse(row.items || '[]'),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// GET /api/roadmap/
roadmap.get('/', async (c) => {
  const { company_id } = c.get('user')
  let row = await c.env.DB.prepare(
    'SELECT * FROM roadmap WHERE company_id = ?'
  ).bind(company_id).first()

  if (!row) {
    row = await c.env.DB.prepare(
      'INSERT INTO roadmap (company_id) VALUES (?) RETURNING *'
    ).bind(company_id).first()
  }

  return c.json(parseRoadmap(row))
})

// PATCH /api/roadmap/update/
roadmap.patch('/update/', async (c) => {
  const { company_id } = c.get('user')
  const data = await c.req.json()

  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO roadmap (company_id) VALUES (?)'
  ).bind(company_id).run()

  const sets = []
  const values = []

  if (data.phase !== undefined) { sets.push('phase = ?'); values.push(data.phase) }
  if (data.progress !== undefined) { sets.push('progress = ?'); values.push(data.progress) }
  if (data.items !== undefined) { sets.push('items = ?'); values.push(JSON.stringify(data.items)) }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  sets.push("updated_at = datetime('now')")
  values.push(company_id)

  const row = await c.env.DB.prepare(
    `UPDATE roadmap SET ${sets.join(', ')} WHERE company_id = ? RETURNING *`
  ).bind(...values).first()

  return c.json(parseRoadmap(row))
})

export default roadmap
