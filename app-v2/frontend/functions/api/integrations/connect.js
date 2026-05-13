import { INTEGRATIONS } from '../_config/integrations-server.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const provider = url.searchParams.get('provider')
  if (!provider || !INTEGRATIONS[provider]) return Response.json({ error: 'invalid_provider' }, { status: 400 })
  const integration = INTEGRATIONS[provider]
  if (!integration.oauth?.authUrl) return Response.json({ error: 'oauth_not_configured' }, { status: 400 })
  const clientId = env[integration.oauth.envKey]
  if (!clientId) return Response.json({ error: 'provider_not_configured' }, { status: 503 })
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const supabaseUrl = env.SUPABASE_URL || 'https://hcqninmpmzpqjtedyjyj.supabase.co'
  const userRes = await fetch(supabaseUrl + '/auth/v1/user', { headers: { 'Authorization': authHeader, 'apikey': env.SUPABASE_SERVICE_ROLE_KEY } })
  if (!userRes.ok) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const user = await userRes.json()
  const state = btoa(JSON.stringify({ uid: user.id, provider, ts: Date.now() }))
  const redirectUri = url.origin + '/api/integrations/callback'
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope: integration.oauth.scopes.join(' '), response_type: 'code', state })
  return Response.redirect(integration.oauth.authUrl + '?' + params.toString(), 302)
}