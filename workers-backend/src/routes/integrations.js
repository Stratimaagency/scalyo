import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const integrations = new Hono()
integrations.use('/*', authMiddleware(), companyRequired())

// GET /api/integrations/ — list all connected integrations for the company
integrations.get('/', async (c) => {
  const { company_id } = c.get('user')
  const rows = await c.env.DB.prepare(
    'SELECT * FROM integrations WHERE company_id = ? ORDER BY created_at DESC'
  ).bind(company_id).all()

  const results = (rows.results || []).map(row => ({
    id: row.id,
    integration_key: row.integration_key,
    config: JSON.parse(row.config || '{}'),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  return c.json(results)
})

// POST /api/integrations/ — connect a new integration
integrations.post('/', async (c) => {
  const { company_id } = c.get('user')
  const { integration_key, config } = await c.req.json()

  if (!integration_key) return c.json({ error: 'integration_key is required' }, 400)

  const configStr = JSON.stringify(config || {})

  // Upsert: update if exists, insert if not
  const existing = await c.env.DB.prepare(
    'SELECT id FROM integrations WHERE company_id = ? AND integration_key = ?'
  ).bind(company_id, integration_key).first()

  if (existing) {
    await c.env.DB.prepare(
      "UPDATE integrations SET config = ?, status = 'active', updated_at = datetime('now') WHERE id = ?"
    ).bind(configStr, existing.id).run()

    return c.json({ id: existing.id, integration_key, config: config || {}, status: 'active' })
  }

  const row = await c.env.DB.prepare(
    "INSERT INTO integrations (company_id, integration_key, config, status) VALUES (?, ?, ?, 'active') RETURNING *"
  ).bind(company_id, integration_key, configStr).first()

  return c.json({
    id: row.id,
    integration_key: row.integration_key,
    config: JSON.parse(row.config || '{}'),
    status: row.status,
  }, 201)
})

// DELETE /api/integrations/:key/ — disconnect an integration
integrations.delete('/:key/', async (c) => {
  const { company_id } = c.get('user')
  const key = c.req.param('key')

  await c.env.DB.prepare(
    'DELETE FROM integrations WHERE company_id = ? AND integration_key = ?'
  ).bind(company_id, key).run()

  return c.json({ status: 'disconnected' })
})

export default integrations
