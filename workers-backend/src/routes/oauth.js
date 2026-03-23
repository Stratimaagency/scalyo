import { Hono } from 'hono'
import { verifyJwt } from '../utils/jwt.js'
import * as gmailService from '../services/gmail.js'
import * as outlookService from '../services/outlook.js'

const oauth = new Hono()

// OAuth callback — no auth middleware (this is a redirect from Google/Microsoft)
oauth.get('/callback/:provider', async (c) => {
  try {
    const provider = c.req.param('provider')
    const code = c.req.query('code')
    const state = c.req.query('state')
    const error = c.req.query('error')

    if (error) {
      return redirectWithError(c, `OAuth denied: ${error}`)
    }

    if (!code || !state) {
      return redirectWithError(c, 'Missing OAuth code or state')
    }

    // Verify state token (CSRF protection)
    const statePayload = await verifyJwt(state, c.env.JWT_SECRET)
    if (!statePayload) {
      return redirectWithError(c, 'Invalid or expired OAuth state')
    }

    const { company_id, provider: expectedProvider } = statePayload
    if (expectedProvider !== provider) {
      return redirectWithError(c, 'OAuth provider mismatch')
    }

    // Exchange code for tokens
    let tokens
    if (provider === 'google') {
      tokens = await gmailService.exchangeCode(code, c.env)
    } else if (provider === 'microsoft') {
      tokens = await outlookService.exchangeCode(code, c.env)
    } else {
      return redirectWithError(c, `Unknown provider: ${provider}`)
    }

    // Get user email from token
    let email = ''
    if (provider === 'google') {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (res.ok) {
        const info = await res.json()
        email = info.email || ''
      }
    } else if (provider === 'microsoft') {
      const res = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (res.ok) {
        const info = await res.json()
        email = info.mail || info.userPrincipalName || ''
      }
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString()

    // Store OAuth tokens
    await c.env.DB.prepare(
      `INSERT INTO oauth_tokens (company_id, provider, access_token, refresh_token, expires_at, scope, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(company_id, provider) DO UPDATE SET
         access_token = ?, refresh_token = COALESCE(?, refresh_token), expires_at = ?, scope = ?, email = ?, updated_at = datetime('now')`
    ).bind(
      company_id, provider,
      tokens.access_token, tokens.refresh_token || null, expiresAt, tokens.scope || '', email,
      tokens.access_token, tokens.refresh_token || null, expiresAt, tokens.scope || '', email,
    ).run()

    // Auto-create/update the integration entry
    const integrationKey = provider === 'google' ? 'gmail' : 'outlook'
    const config = JSON.stringify({ email, provider: provider === 'google' ? 'gmail' : 'outlook' })

    const existing = await c.env.DB.prepare(
      'SELECT id FROM integrations WHERE company_id = ? AND integration_key = ?'
    ).bind(company_id, integrationKey).first()

    if (existing) {
      await c.env.DB.prepare(
        "UPDATE integrations SET config = ?, status = 'active', updated_at = datetime('now') WHERE id = ?"
      ).bind(config, existing.id).run()
    } else {
      await c.env.DB.prepare(
        "INSERT INTO integrations (company_id, integration_key, config, status) VALUES (?, ?, ?, 'active')"
      ).bind(company_id, integrationKey, config).run()
    }

    // Redirect back to integrations page with success
    const frontendUrl = c.env.FRONTEND_URL || c.env.APP_URL || ''
    return c.redirect(`${frontendUrl}/app/integrations?oauth=success&provider=${provider}&email=${encodeURIComponent(email)}`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    return redirectWithError(c, err.message || 'OAuth callback failed')
  }
})

function redirectWithError(c, message) {
  const frontendUrl = c.env.FRONTEND_URL || c.env.APP_URL || ''
  return c.redirect(`${frontendUrl}/app/integrations?oauth=error&message=${encodeURIComponent(message)}`)
}

export default oauth
