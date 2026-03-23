import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'
import { getService, isOAuth, getOAuthProvider } from '../services/registry.js'
import * as gmailService from '../services/gmail.js'
import * as outlookService from '../services/outlook.js'
import { signJwt, verifyJwt } from '../utils/jwt.js'

const integrations = new Hono()
integrations.use('/*', authMiddleware(), companyRequired())

// ─── LIST connected integrations ────────────────────────────────
integrations.get('/', async (c) => {
  try {
    const { company_id } = c.get('user')
    const rows = await c.env.DB.prepare(
      'SELECT * FROM integrations WHERE company_id = ? ORDER BY created_at DESC'
    ).bind(company_id).all()

    // Get last sync status for each integration
    const syncLogs = await c.env.DB.prepare(
      'SELECT integration_key, status, details, synced_at FROM integration_sync_log WHERE company_id = ?'
    ).bind(company_id).all()

    const syncMap = {}
    for (const log of syncLogs.results || []) {
      syncMap[log.integration_key] = {
        syncStatus: log.status,
        syncDetails: JSON.parse(log.details || '{}'),
        lastSyncAt: log.synced_at,
      }
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

    // For OAuth integrations, inject access token from DB
    let finalConfig = { ...config }
    if (isOAuth(integration_key)) {
      const provider = getOAuthProvider(integration_key)
      const token = await c.env.DB.prepare(
        'SELECT access_token, refresh_token, expires_at FROM oauth_tokens WHERE company_id = ? AND provider = ?'
      ).bind(company_id, provider).first()

      if (!token) return c.json({ error: 'OAuth not connected. Please authorize first.' }, 400)

      // Refresh token if expired
      finalConfig.accessToken = await getValidToken(token, provider, company_id, c.env)
    }

    const service = getService(integration_key)
    if (!service) return c.json({ error: `No service for integration: ${integration_key}` }, 400)

    const result = await service.testConnection(finalConfig)

    // Update integration status to active on success
    await c.env.DB.prepare(
      "UPDATE integrations SET status = 'active', updated_at = datetime('now') WHERE company_id = ? AND integration_key = ?"
    ).bind(company_id, integration_key).run()

    return c.json(result)
  } catch (err) {
    console.error('POST /integrations/test error:', err)

    // Update integration status to error
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

    // Get integration config
    const integ = await c.env.DB.prepare(
      'SELECT * FROM integrations WHERE company_id = ? AND integration_key = ?'
    ).bind(company_id, key).first()

    if (!integ) return c.json({ error: 'Integration not connected' }, 404)

    let config = JSON.parse(integ.config || '{}')

    // Inject OAuth token if needed
    if (isOAuth(key)) {
      const provider = getOAuthProvider(key)
      const token = await c.env.DB.prepare(
        'SELECT access_token, refresh_token, expires_at FROM oauth_tokens WHERE company_id = ? AND provider = ?'
      ).bind(company_id, provider).first()

      if (!token) return c.json({ error: 'OAuth not connected' }, 400)
      config.accessToken = await getValidToken(token, provider, company_id, c.env)
    }

    const service = getService(key)
    if (!service || !service.sync) return c.json({ error: `No sync for: ${key}` }, 400)

    const result = await service.sync(config, c.env, company_id)

    // Log sync result
    await c.env.DB.prepare(
      `INSERT INTO integration_sync_log (company_id, integration_key, status, details)
       VALUES (?, ?, 'success', ?)
       ON CONFLICT(company_id, integration_key) DO UPDATE SET status = 'success', details = ?, synced_at = datetime('now')`
    ).bind(company_id, key, JSON.stringify(result), JSON.stringify(result)).run()

    // Update integration status
    await c.env.DB.prepare(
      "UPDATE integrations SET status = 'active', updated_at = datetime('now') WHERE company_id = ? AND integration_key = ?"
    ).bind(company_id, key).run()

    return c.json({ ok: true, ...result })
  } catch (err) {
    console.error(`POST /integrations/sync/${c.req.param('key')} error:`, err)

    // Log error
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

    return c.json({ error: err.message || 'Sync failed' }, 500)
  }
})

// ─── OAUTH: Start authorization flow ─────────────────────────────
integrations.get('/oauth/authorize/:provider', async (c) => {
  try {
    const { company_id, id: userId } = c.get('user')
    const provider = c.req.param('provider')

    // Create a signed state token to prevent CSRF
    const state = await signJwt({ company_id, userId, provider }, c.env.JWT_SECRET, 600)

    let authUrl
    if (provider === 'google') {
      authUrl = gmailService.getAuthUrl(c.env, state)
    } else if (provider === 'microsoft') {
      authUrl = outlookService.getAuthUrl(c.env, state)
    } else {
      return c.json({ error: `Unknown OAuth provider: ${provider}` }, 400)
    }

    return c.json({ authUrl })
  } catch (err) {
    console.error('OAuth authorize error:', err)
    return c.json({ error: 'Failed to start OAuth flow' }, 500)
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

    // Clean up OAuth token if applicable
    if (isOAuth(key)) {
      const provider = getOAuthProvider(key)
      // Only delete OAuth token if no other integration uses this provider
      const otherUses = await c.env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM integrations WHERE company_id = ? AND integration_key IN (SELECT key FROM json_each(?) )"
      ).bind(company_id, JSON.stringify(getKeysForProvider(provider))).first()

      if (!otherUses || otherUses.cnt === 0) {
        await c.env.DB.prepare(
          'DELETE FROM oauth_tokens WHERE company_id = ? AND provider = ?'
        ).bind(company_id, provider).run()
      }
    }

    // Clean up sync log
    await c.env.DB.prepare(
      'DELETE FROM integration_sync_log WHERE company_id = ? AND integration_key = ?'
    ).bind(company_id, key).run()

    return c.json({ status: 'disconnected' })
  } catch (err) {
    console.error('DELETE /integrations error:', err)
    return c.json({ error: 'Failed to disconnect integration' }, 500)
  }
})

// ─── Helpers ─────────────────────────────────────────────────────

function getKeysForProvider(provider) {
  if (provider === 'google') return ['gmail', 'google-meet']
  if (provider === 'microsoft') return ['outlook']
  return []
}

async function getValidToken(tokenRow, provider, companyId, env) {
  // Check if token is expired (with 5 min buffer)
  if (tokenRow.expires_at) {
    const expiresAt = new Date(tokenRow.expires_at).getTime()
    if (Date.now() < expiresAt - 300000) {
      return tokenRow.access_token
    }
  }

  // Token expired or no expiry info — try to refresh
  if (!tokenRow.refresh_token) throw new Error('Token expired and no refresh token available')

  let refreshed
  if (provider === 'google') {
    refreshed = await gmailService.refreshToken(tokenRow.refresh_token, env)
  } else if (provider === 'microsoft') {
    refreshed = await outlookService.refreshToken(tokenRow.refresh_token, env)
  } else {
    throw new Error(`Unknown provider for refresh: ${provider}`)
  }

  // Save new token
  const expiresAt = new Date(Date.now() + (refreshed.expires_in || 3600) * 1000).toISOString()
  await env.DB.prepare(
    "UPDATE oauth_tokens SET access_token = ?, expires_at = ?, updated_at = datetime('now') WHERE company_id = ? AND provider = ?"
  ).bind(refreshed.access_token, expiresAt, companyId, provider).run()

  return refreshed.access_token
}

export default integrations
