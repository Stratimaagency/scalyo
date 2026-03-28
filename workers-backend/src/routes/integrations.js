import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'
import { getService } from '../services/registry.js'

const integrations = new Hono()
integrations.use('/*', authMiddleware(), companyRequired(), trialGuard())

// ─── LIST connected integrations ────────────────────────────────
integrations.get('/', async (c) => {
  try {
    const { company_id } = c.get('user')
    const rows = await c.env.DB.prepare(
      'SELECT * FROM integrations WHERE company_id = ? ORDER BY created_at DESC'
    ).bind(company_id).all()

    // Get last sync status for each integration
    let syncMap = {}
    try {
      const syncLogs = await c.env.DB.prepare(
        'SELECT integration_key, status, details, synced_at FROM integration_sync_log WHERE company_id = ?'
      ).bind(company_id).all()
      for (const log of syncLogs.results || []) {
        syncMap[log.integration_key] = {
          syncStatus: log.status,
          syncDetails: JSON.parse(log.details || '{}'),
          lastSyncAt: log.synced_at,
        }
      }
    } catch {
      // Table might not exist yet — ignore
    }

    const results = (rows.results || []).map(row => ({
      id: row.id,
      integration_key: row.integration_key,
      config: JSON.parse(row.config || '{}'),
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...(syncMap[row.integration_key] || {}),
    }))

    return c.json(results)
  } catch (err) {
    console.error('GET /integrations error:', err)
    return c.json({ error: 'Failed to load integrations' }, 500)
  }
})

// ─── CONNECT (create/update) an integration ─────────────────────
integrations.post('/', async (c) => {
  try {
    const { company_id } = c.get('user')
    const { integration_key, config } = await c.req.json()

    if (!integration_key) return c.json({ error: 'integration_key is required' }, 400)

    const configStr = JSON.stringify(config || {})

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
  } catch (err) {
    console.error('POST /integrations error:', err)
    return c.json({ error: 'Failed to save integration' }, 500)
  }
})

// ─── TEST connection ────────────────────────────────────────────
integrations.post('/test', async (c) => {
  try {
    const { company_id } = c.get('user')
    const { integration_key, config } = await c.req.json()

    if (!integration_key) return c.json({ error: 'integration_key is required' }, 400)

    const service = getService(integration_key)
    if (!service) return c.json({ error: `No service for integration: ${integration_key}` }, 400)

    const result = await service.testConnection(config)

    // Update integration status to active on success
    await c.env.DB.prepare(
      "UPDATE integrations SET status = 'active', updated_at = datetime('now') WHERE company_id = ? AND integration_key = ?"
    ).bind(company_id, integration_key).run()

    return c.json(result)
  } catch (err) {
    console.error('POST /integrations/test error:', err)

    try {
      const { company_id } = c.get('user')
      const { integration_key } = await c.req.json().catch(() => ({}))
      if (integration_key) {
        await c.env.DB.prepare(
          "UPDATE integrations SET status = 'error', updated_at = datetime('now') WHERE company_id = ? AND integration_key = ?"
        ).bind(company_id, integration_key).run()
      }
    } catch {}

    return c.json({ error: err.message || 'Connection test failed' }, 400)
  }
})

// ─── SYNC data from integration ─────────────────────────────────
integrations.post('/sync/:key', async (c) => {
  try {
    const { company_id } = c.get('user')
    const key = c.req.param('key')

    const integ = await c.env.DB.prepare(
      'SELECT * FROM integrations WHERE company_id = ? AND integration_key = ?'
    ).bind(company_id, key).first()

    if (!integ) return c.json({ error: 'Integration not connected' }, 404)

    const config = JSON.parse(integ.config || '{}')

    const service = getService(key)
    if (!service || !service.sync) return c.json({ error: `No sync for: ${key}` }, 400)

    const result = await service.sync(config, c.env, company_id)

    // Log sync result
    try {
      await c.env.DB.prepare(
        `INSERT INTO integration_sync_log (company_id, integration_key, status, details)
         VALUES (?, ?, 'success', ?)
         ON CONFLICT(company_id, integration_key) DO UPDATE SET status = 'success', details = ?, synced_at = datetime('now')`
      ).bind(company_id, key, JSON.stringify(result), JSON.stringify(result)).run()
    } catch {}

    await c.env.DB.prepare(
      "UPDATE integrations SET status = 'active', updated_at = datetime('now') WHERE company_id = ? AND integration_key = ?"
    ).bind(company_id, key).run()

    return c.json({ ok: true, ...result })
  } catch (err) {
    console.error(`POST /integrations/sync error:`, err)

    try {
      const { company_id } = c.get('user')
      const key = c.req.param('key')
      await c.env.DB.prepare(
        `INSERT INTO integration_sync_log (company_id, integration_key, status, details)
         VALUES (?, ?, 'error', ?)
         ON CONFLICT(company_id, integration_key) DO UPDATE SET status = 'error', details = ?, synced_at = datetime('now')`
      ).bind(company_id, key, JSON.stringify({ error: err.message }), JSON.stringify({ error: err.message })).run()

      await c.env.DB.prepare(
        "UPDATE integrations SET status = 'error', updated_at = datetime('now') WHERE company_id = ? AND integration_key = ?"
      ).bind(company_id, key).run()
    } catch {}

    return c.json({ error: 'Sync failed' }, 500)
  }
})

// ─── DELETE (disconnect) ─────────────────────────────────────────
integrations.delete('/:key', async (c) => {
  try {
    const { company_id } = c.get('user')
    const key = c.req.param('key')

    await c.env.DB.prepare(
      'DELETE FROM integrations WHERE company_id = ? AND integration_key = ?'
    ).bind(company_id, key).run()

    // Clean up sync log
    try {
      await c.env.DB.prepare(
        'DELETE FROM integration_sync_log WHERE company_id = ? AND integration_key = ?'
      ).bind(company_id, key).run()
    } catch {}

    return c.json({ status: 'disconnected' })
  } catch (err) {
    console.error('DELETE /integrations error:', err)
    return c.json({ error: 'Failed to disconnect integration' }, 500)
  }
})

export default integrations
