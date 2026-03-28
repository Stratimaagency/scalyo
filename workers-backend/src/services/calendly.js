// Calendly — Personal Access Token
// Docs: https://developer.calendly.com/api-docs/

const BASE = 'https://api.calendly.com'

function headers(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Token d\'acces Calendly requis')

  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Token invalide. Verifiez votre token Calendly.')
  if (!res.ok) throw new Error(`Erreur Calendly (${res.status})`)

  return { ok: true, message: 'Calendly connecte avec succes' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Token d\'acces manquant')

  const h = headers(config.apiKey)
  const results = { events: 0 }

  // Get current user URI
  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Calendly: impossible de recuperer l\'utilisateur')
  const me = await meRes.json()
  const userUri = me.resource?.uri
  if (!userUri) throw new Error('Calendly: URI utilisateur introuvable')

  // Fetch upcoming events
  const now = new Date().toISOString()
  const eventsRes = await fetch(
    `${BASE}/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${now}&count=50&status=active`,
    { headers: h }
  )
  if (!eventsRes.ok) throw new Error(`Calendly events: erreur ${eventsRes.status}`)
  const eventsData = await eventsRes.json()

  // Load existing calendar_events JSON singleton
  const existing = await env.DB.prepare(
    'SELECT id, events FROM calendar_events WHERE company_id = ?'
  ).bind(companyId).first()

  let currentEvents = []
  if (existing) {
    try { currentEvents = JSON.parse(existing.events || '[]') } catch { currentEvents = [] }
  }

  // Build a map of existing Calendly events by external key
  const existingMap = new Map()
  for (const ev of currentEvents) {
    if (ev.externalId && ev.externalId.startsWith('calendly_')) {
      existingMap.set(ev.externalId, ev)
    }
  }

  // Process Calendly events
  const newCalendlyEvents = []
  for (const event of eventsData.collection || []) {
    const externalId = `calendly_${event.uri?.split('/').pop() || Date.now()}`
    const startTime = event.start_time ? new Date(event.start_time) : new Date()
    const endTime = event.end_time ? new Date(event.end_time) : new Date()

    const calEvent = {
      id: existingMap.get(externalId)?.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: event.name || 'RDV Calendly',
      date: startTime.toISOString().slice(0, 10),
      time: startTime.toISOString().slice(11, 16),
      endTime: endTime.toISOString().slice(11, 16),
      color: 'purple',
      note: `Source: Calendly`,
      account: '',
      externalId,
      createdAt: existingMap.get(externalId)?.createdAt || new Date().toISOString(),
    }

    newCalendlyEvents.push(calEvent)
    results.events++
  }

  // Merge: keep non-Calendly events, replace Calendly ones
  const nonCalendlyEvents = currentEvents.filter(ev => !ev.externalId || !ev.externalId.startsWith('calendly_'))
  const mergedEvents = [...nonCalendlyEvents, ...newCalendlyEvents]

  // Upsert into calendar_events singleton
  if (existing) {
    await env.DB.prepare(
      "UPDATE calendar_events SET events = ?, updated_at = datetime('now') WHERE company_id = ?"
    ).bind(JSON.stringify(mergedEvents), companyId).run()
  } else {
    await env.DB.prepare(
      "INSERT INTO calendar_events (company_id, events) VALUES (?, ?)"
    ).bind(companyId, JSON.stringify(mergedEvents)).run()
  }

  return results
}
