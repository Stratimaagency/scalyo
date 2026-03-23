const BASE = 'https://api.zoom.us/v2'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

export async function testConnection(config) {
  // Zoom Server-to-Server OAuth or JWT token
  const token = config.apiKey || config.accessToken
  if (!token) throw new Error('Zoom API token is required')

  const res = await fetch(`${BASE}/users/me`, { headers: headers(token) })
  if (!res.ok) throw new Error(`Zoom API error ${res.status}`)
  return { ok: true, message: 'Zoom connected' }
}

export async function sync(config, env, companyId) {
  const token = config.apiKey || config.accessToken
  const h = headers(token)
  const results = { meetings: 0 }

  // Fetch upcoming meetings
  const res = await fetch(`${BASE}/users/me/meetings?type=upcoming&page_size=50`, { headers: h })
  if (!res.ok) throw new Error(`Zoom meetings fetch failed: ${res.status}`)
  const data = await res.json()

  results.meetings = (data.meetings || []).length
  return results
}
