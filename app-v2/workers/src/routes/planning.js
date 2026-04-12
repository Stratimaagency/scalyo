import { detectLanguage, t } from '../middleware/i18n.js'

// Mock events store
const events = [
  { id: 'ev1', title: 'QBR Acme Corp', start: '2026-04-14T10:00:00', end: '2026-04-14T11:00:00', projectId: 'p3', clientId: 'cl2', assignee: 'tm1', color: '#3b82f6', type: 'qbr' },
  { id: 'ev2', title: 'Check-in TechScale', start: '2026-04-15T14:00:00', end: '2026-04-15T14:30:00', projectId: 'p1', clientId: 'cl1', assignee: 'tm1', color: '#10b981', type: 'checkin' },
  { id: 'ev3', title: 'Rétention Leroy Finance', start: '2026-04-16T09:00:00', end: '2026-04-16T10:00:00', projectId: 'p3', clientId: 'cl4', assignee: 'tm2', color: '#ef4444', type: 'retention' },
  { id: 'ev4', title: 'Onboarding Biotech', start: '2026-04-17T11:00:00', end: '2026-04-17T12:00:00', projectId: 'p1', clientId: 'cl3', assignee: 'tm1', color: '#7c3aed', type: 'onboarding' },
  { id: 'ev5', title: 'Expansion NovaTech', start: '2026-04-18T15:00:00', end: '2026-04-18T16:00:00', projectId: 'p2', clientId: 'cl5', assignee: 'tm3', color: '#f59e0b', type: 'expansion' },
]

const dateFormats = {
  fr: { weekStart: 1, format: 'DD/MM/YYYY', locale: 'fr-FR' },
  en: { weekStart: 0, format: 'MM/DD/YYYY', locale: 'en-US' },
  ko: { weekStart: 1, format: 'YYYY년 MM월 DD일', locale: 'ko-KR' },
}

export function handlePlanning(request) {
  const lang = detectLanguage(request)
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  const path = url.pathname

  // GET /api/planning/events
  if (path === '/api/planning/events' && request.method === 'GET') {
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    let filtered = events
    if (start) filtered = filtered.filter(e => e.start >= start)
    if (end) filtered = filtered.filter(e => e.start <= end + 'T23:59:59')
    return new Response(JSON.stringify({
      events: filtered,
      dateConfig: dateFormats[lang] || dateFormats.fr,
      labels: {
        today: t(lang, 'success.synced').replace('Synchronisation réussie.', '') || (lang === 'fr' ? "Aujourd'hui" : lang === 'ko' ? '오늘' : 'Today'),
        noEvents: lang === 'fr' ? 'Aucun événement' : lang === 'ko' ? '일정 없음' : 'No events',
      },
    }), { headers })
  }

  // POST /api/planning/events
  if (path === '/api/planning/events' && request.method === 'POST') {
    return new Response(JSON.stringify({
      message: t(lang, 'success.created', { resource: lang === 'fr' ? 'Événement' : lang === 'ko' ? '일정' : 'Event' }),
      id: 'ev_' + Date.now(),
    }), { status: 201, headers })
  }

  // PUT /api/planning/events/:id
  if (path.match(/^\/api\/planning\/events\/\w+$/) && request.method === 'PUT') {
    return new Response(JSON.stringify({
      message: t(lang, 'success.updated', { resource: lang === 'fr' ? 'Événement' : lang === 'ko' ? '일정' : 'Event' }),
    }), { headers })
  }

  // DELETE /api/planning/events/:id
  if (path.match(/^\/api\/planning\/events\/\w+$/) && request.method === 'DELETE') {
    return new Response(JSON.stringify({
      message: t(lang, 'success.deleted', { resource: lang === 'fr' ? 'Événement' : lang === 'ko' ? '일정' : 'Event' }),
    }), { headers })
  }

  // GET /api/planning/sync/google
  if (path === '/api/planning/sync/google') {
    return new Response(JSON.stringify({
      message: t(lang, 'success.synced'),
      provider: 'Google Calendar',
      status: 'connected',
      lastSync: new Date().toISOString(),
      mode: 'bidirectional',
    }), { headers })
  }

  // GET /api/planning/sync/outlook
  if (path === '/api/planning/sync/outlook') {
    return new Response(JSON.stringify({
      message: t(lang, 'success.synced'),
      provider: 'Microsoft Outlook',
      status: 'connected',
      lastSync: new Date().toISOString(),
      mode: 'bidirectional',
    }), { headers })
  }

  // GET /api/planning/caldav
  if (path === '/api/planning/caldav') {
    return new Response(JSON.stringify({
      url: 'https://caldav.scalyo.app/user/calendar',
      instructions: lang === 'fr'
        ? 'Paramètres → Calendrier → Comptes → Ajouter un compte CalDAV'
        : lang === 'ko'
          ? '설정 → 캘린더 → 계정 → CalDAV 계정 추가'
          : 'Settings → Calendar → Accounts → Add CalDAV Account',
    }), { headers })
  }

  return new Response(JSON.stringify({ error: t(lang, 'errors.notFound') }), { status: 404, headers })
}
