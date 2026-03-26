// Zendesk Support integration
export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Zendesk API token is required')
  if (!config.domain) throw new Error('Zendesk subdomain is required')
  if (!config.email) throw new Error('Zendesk admin email is required')

  const base = `https://${config.domain}.zendesk.com/api/v2`
  const auth = btoa(`${config.email}/token:${config.apiKey}`)

  const res = await fetch(`${base}/users/me.json`, {
    headers: { Authorization: `Basic ${auth}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Zendesk API error ${res.status}`)
  }
  return { ok: true, message: 'Zendesk connected' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey || !config.domain || !config.email) {
    throw new Error('Zendesk config incomplete')
  }

  const base = `https://${config.domain}.zendesk.com/api/v2`
  const auth = btoa(`${config.email}/token:${config.apiKey}`)
  const headers = { Authorization: `Basic ${auth}` }
  const results = { tickets: 0, users: 0 }

  // Fetch recent tickets (open/pending)
  const ticketsRes = await fetch(
    `${base}/tickets.json?sort_by=updated_at&sort_order=desc&per_page=100`,
    { headers }
  )
  if (!ticketsRes.ok) throw new Error(`Zendesk tickets fetch failed: ${ticketsRes.status}`)
  const ticketsData = await ticketsRes.json()
  results.tickets = (ticketsData.tickets || []).length

  // Fetch end-users (customers) and upsert as accounts
  const usersRes = await fetch(
    `${base}/users.json?role=end-user&per_page=100`,
    { headers }
  )
  if (usersRes.ok) {
    const usersData = await usersRes.json()
    for (const user of usersData.users || []) {
      const name = user.name || user.email || `User ${user.id}`
      const email = user.email || ''
      const externalId = `zendesk_${user.id}`

      const existing = await env.DB.prepare(
        'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
      ).bind(companyId, externalId).first()

      if (existing) {
        await env.DB.prepare(
          "UPDATE accounts SET name = ?, email = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(name, email, existing.id).run()
      } else {
        await env.DB.prepare(
          "INSERT INTO accounts (company_id, name, email, status, external_id, source) VALUES (?, ?, ?, 'active', ?, 'zendesk')"
        ).bind(companyId, name, email, externalId).run()
      }
      results.users++
    }
  }

  return results
}
