// Zendesk Support — Email + API Token
// Docs: https://developer.zendesk.com/api-reference/

export async function testConnection(config) {
  if (!config.email) throw new Error('Email Zendesk requis')
  if (!config.apiKey) throw new Error('Token API Zendesk requis')
  if (!config.domain) throw new Error('Sous-domaine Zendesk requis')

  const base = `https://${config.domain}.zendesk.com/api/v2`
  const auth = btoa(`${config.email}/token:${config.apiKey}`)

  const res = await fetch(`${base}/users/me.json`, {
    headers: { Authorization: `Basic ${auth}` },
  })

  if (res.status === 401) throw new Error('Identifiants invalides. Verifiez email, token et sous-domaine.')
  if (!res.ok) throw new Error(`Erreur Zendesk (${res.status})`)

  return { ok: true, message: `Zendesk connecte (${config.domain}.zendesk.com)` }
}

export async function sync(config, env, companyId) {
  if (!config.email || !config.apiKey || !config.domain) throw new Error('Configuration Zendesk incomplete')

  const base = `https://${config.domain}.zendesk.com/api/v2`
  const auth = btoa(`${config.email}/token:${config.apiKey}`)
  const headers = { Authorization: `Basic ${auth}` }
  const results = { tickets: 0, users: 0 }

  // Fetch recent tickets
  const ticketsRes = await fetch(
    `${base}/tickets.json?sort_by=updated_at&sort_order=desc&per_page=100`,
    { headers }
  )
  if (!ticketsRes.ok) throw new Error(`Zendesk tickets: erreur ${ticketsRes.status}`)
  const ticketsData = await ticketsRes.json()
  results.tickets = (ticketsData.tickets || []).length

  // Fetch end-users and import as accounts
  const usersRes = await fetch(`${base}/users.json?role=end-user&per_page=100`, { headers })
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
          "INSERT INTO accounts (company_id, name, email, external_id, source) VALUES (?, ?, ?, ?, 'zendesk')"
        ).bind(companyId, name, email, externalId).run()
      }
      results.users++
    }
  }

  return results
}
