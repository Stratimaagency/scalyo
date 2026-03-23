const BASE = 'https://api.calendly.com'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

export async function testConnection(config) {
  // Calendly uses personal access token
  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey || config.meetingEmail) })
  if (!res.ok) throw new Error(`Calendly API error ${res.status}`)
  return { ok: true, message: 'Calendly connected' }
}

export async function sync(config, env, companyId) {
  const h = headers(config.apiKey || config.meetingEmail)
  const results = { events: 0 }

  // Get current user URI
  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Calendly: failed to get user')
  const me = await meRes.json()
  const userUri = me.resource?.uri

  if (!userUri) throw new Error('Calendly: no user URI found')

  // Fetch upcoming scheduled events
  const now = new Date().toISOString()
  const eventsRes = await fetch(
    `${BASE}/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${now}&count=50&status=active`,
    { headers: h }
  )
  if (!eventsRes.ok) throw new Error(`Calendly events fetch failed: ${eventsRes.status}`)
  const eventsData = await eventsRes.json()

  results.events = (eventsData.collection || []).length
  return results
}
