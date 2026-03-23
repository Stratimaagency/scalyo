// Gmail integration via Google OAuth2
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env

export function getAuthUrl(env, state) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/oauth/callback/google`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCode(code, env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${env.APP_URL}/api/oauth/callback/google`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description || 'Google OAuth token exchange failed')
  }
  return res.json()
}

export async function refreshToken(refresh_token, env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Google OAuth refresh failed')
  return res.json()
}

export async function testConnection(config) {
  if (!config.accessToken) throw new Error('Gmail requires OAuth connection')
  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${config.accessToken}` },
  })
  if (!res.ok) throw new Error(`Gmail API error ${res.status}`)
  const data = await res.json()
  return { ok: true, message: `Gmail connected as ${data.emailAddress}` }
}

export async function sync(config, env, companyId) {
  const h = { Authorization: `Bearer ${config.accessToken}` }
  const results = { emails: 0 }

  // Fetch recent emails
  const res = await fetch(
    'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX',
    { headers: h }
  )
  if (!res.ok) throw new Error(`Gmail messages fetch failed: ${res.status}`)
  const data = await res.json()
  results.emails = (data.messages || []).length

  return results
}
