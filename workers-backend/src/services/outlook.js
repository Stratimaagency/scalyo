// Outlook integration via Microsoft OAuth2
// Requires MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in env

export function getAuthUrl(env, state) {
  const params = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/oauth/callback/microsoft`,
    response_type: 'code',
    scope: 'openid email Mail.Read Mail.Send Calendars.Read offline_access',
    state,
  })
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
}

export async function exchangeCode(code, env) {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.MICROSOFT_CLIENT_ID,
      client_secret: env.MICROSOFT_CLIENT_SECRET,
      redirect_uri: `${env.APP_URL}/api/oauth/callback/microsoft`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description || 'Microsoft OAuth token exchange failed')
  }
  return res.json()
}

export async function refreshToken(refresh_token, env) {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id: env.MICROSOFT_CLIENT_ID,
      client_secret: env.MICROSOFT_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Microsoft OAuth refresh failed')
  return res.json()
}

export async function testConnection(config) {
  if (!config.accessToken) throw new Error('Outlook requires OAuth connection')
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${config.accessToken}` },
  })
  if (!res.ok) throw new Error(`Outlook API error ${res.status}`)
  const data = await res.json()
  return { ok: true, message: `Outlook connected as ${data.mail || data.userPrincipalName}` }
}

export async function sync(config) {
  const h = { Authorization: `Bearer ${config.accessToken}` }
  const results = { emails: 0, events: 0 }

  // Fetch recent emails
  const mailRes = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=20&$orderby=receivedDateTime desc', { headers: h })
  if (mailRes.ok) {
    const data = await mailRes.json()
    results.emails = (data.value || []).length
  }

  // Fetch calendar events
  const now = new Date().toISOString()
  const calRes = await fetch(`https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${now}&endDateTime=${new Date(Date.now() + 7 * 86400000).toISOString()}&$top=20`, { headers: h })
  if (calRes.ok) {
    const data = await calRes.json()
    results.events = (data.value || []).length
  }

  return results
}
