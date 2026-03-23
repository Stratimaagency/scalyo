// Google Meet uses the same OAuth as Gmail (Google Calendar API)
// Reuses Google OAuth flow from gmail.js

export { getAuthUrl, exchangeCode, refreshToken } from './gmail.js'

export async function testConnection(config) {
  if (!config.accessToken) throw new Error('Google Meet requires OAuth connection')
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
    headers: { Authorization: `Bearer ${config.accessToken}` },
  })
  if (!res.ok) throw new Error(`Google Calendar API error ${res.status}`)
  return { ok: true, message: 'Google Meet connected via Calendar' }
}

export async function sync(config) {
  const h = { Authorization: `Bearer ${config.accessToken}` }
  const results = { events: 0 }

  const now = new Date().toISOString()
  const maxTime = new Date(Date.now() + 14 * 86400000).toISOString()

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${maxTime}&maxResults=50&singleEvents=true&orderBy=startTime`,
    { headers: h }
  )
  if (!res.ok) throw new Error(`Google Calendar events fetch failed: ${res.status}`)
  const data = await res.json()

  // Filter events with Google Meet links
  const meetEvents = (data.items || []).filter(e => e.hangoutLink || e.conferenceData)
  results.events = meetEvents.length

  return results
}
