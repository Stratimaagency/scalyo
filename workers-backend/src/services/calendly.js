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

  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Calendly: impossible de recuperer l\'utilisateur')
  const me = await meRes.json()
  const userUri = me.resource?.uri
  if (!userUri) throw new Error('Calendly: URI utilisateur introuvable')

  const now = new Date().toISOString()
  const eventsRes = await fetch(
    `${BASE}/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${now}&count=50&status=active`,
    { headers: h }
  )
  if (!eventsRes.ok) throw new Error(`Calendly events: erreur ${eventsRes.status}`)
  const eventsData = await eventsRes.json()

  const existing = await env.DB.prepare(
    'SELECT id, events FROM calendar_events WHERE company_id = ?'
  ).bind(companyId).first()

  let currentEvents = []
  if (existing) {
    try { currentEvents = JSON.parse(existing.events || '[]') } catch { currentEvents = [] }
  }

  const existingMap = new Map()
  for (const ev of currentEvents) {
    if (ev.externalId && ev.externalId.startsWith('calendly_')) existingMap.set(ev.externalId, ev)
  }

  const newCalendlyEvents = []
  for (const event of eventsData.collection || []) {
    const externalId = `calendly_${event.uri?.split('/').pop() || Date.now()}`
    const startTime = event.start_time ? new Date(event.start_time) : new Date()
    const endTime = event.end_time ? new Date(event.end_time) : new Date()

    newCalendlyEvents.push({
      id: existingMap.get(externalId)?.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: event.name || 'RDV Calendly',
      date: startTime.toISOString().slice(0, 10),
      time: startTime.toISOString().slice(11, 16),
      endTime: endTime.toISOString().slice(11, 16),
      color: 'purple', note: 'Source: Calendly', account: '', externalId,
      createdAt: existingMap.get(externalId)?.createdAt || new Date().toISOString(),
    })
    results.events++
  }

  const nonCalendlyEvents = currentEvents.filter(ev => !ev.externalId || !ev.externalId.startsWith('calendly_'))
  const mergedEvents = [...nonCalendlyEvents, ...newCalendlyEvents]

  if (existing) {
    await env.DB.prepare("UPDATE calendar_events SET events = ?, updated_at = datetime('now') WHERE company_id = ?")
      .bind(JSON.stringify(mergedEvents), companyId).run()
  } else {
    await env.DB.prepare("INSERT INTO calendar_events (company_id, events) VALUES (?, ?)")
      .bind(companyId, JSON.stringify(mergedEvents)).run()
  }

  return results
}

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const h = headers(config.apiKey)

  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Erreur Calendly')
  const me = await meRes.json()
  const userUri = me.resource?.uri
  if (!userUri) throw new Error('Calendly: URI introuvable')

  // Upcoming events
  const now = new Date().toISOString()
  const eventsRes = await fetch(
    `${BASE}/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${now}&count=50&status=active`,
    { headers: h }
  )
  if (!eventsRes.ok) throw new Error(`Erreur Calendly events (${eventsRes.status})`)
  const eventsData = await eventsRes.json()

  const events = (eventsData.collection || []).map(e => ({
    id: e.uri?.split('/').pop() || '',
    name: e.name || 'RDV',
    startTime: e.start_time || '',
    endTime: e.end_time || '',
    status: e.status || '',
    location: e.location?.location || e.location?.join_url || '',
    inviteesCount: e.invitees_counter?.total || 0,
  }))

  // Event types
  const typesRes = await fetch(
    `${BASE}/event_types?user=${encodeURIComponent(userUri)}&active=true`,
    { headers: h }
  )
  let eventTypes = []
  if (typesRes.ok) {
    const typesData = await typesRes.json()
    eventTypes = (typesData.collection || []).map(t => ({
      id: t.uri?.split('/').pop() || '',
      name: t.name || '',
      duration: t.duration || 0,
      slug: t.slug || '',
      schedulingUrl: t.scheduling_url || '',
    }))
  }

  return {
    sections: [
      { key: 'events', title: 'Prochains RDV', icon: '📅', items: events, total: events.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'startTime', label: 'Debut', type: 'datetime' },
          { key: 'endTime', label: 'Fin', type: 'datetime' },
          { key: 'status', label: 'Statut' },
          { key: 'inviteesCount', label: 'Invites' },
          { key: 'location', label: 'Lieu/Lien' },
        ],
        actions: [],
      },
      { key: 'eventTypes', title: 'Types d\'evenements', icon: '⚙️', items: eventTypes, total: eventTypes.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'duration', label: 'Duree (min)' },
          { key: 'schedulingUrl', label: 'Lien', type: 'url' },
        ],
        actions: [],
      },
    ],
  }
}

export async function performAction(config, action, payload) {
  throw new Error('Calendly ne supporte pas cette action')
}
