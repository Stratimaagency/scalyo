const BASE = 'https://api.pipedrive.com/v1'

export async function testConnection(config) {
  const res = await fetch(`${BASE}/users/me?api_token=${config.apiKey}`)
  if (!res.ok) throw new Error(`Pipedrive API error ${res.status}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Pipedrive authentication failed')
  return { ok: true, message: 'Pipedrive connected' }
}

export async function sync(config, env, companyId) {
  const token = config.apiKey
  const results = { contacts: 0, deals: 0 }

  // Fetch persons (contacts)
  const personsRes = await fetch(`${BASE}/persons?limit=100&api_token=${token}`)
  if (!personsRes.ok) throw new Error(`Pipedrive persons fetch failed: ${personsRes.status}`)
  const personsData = await personsRes.json()

  for (const person of personsData.data || []) {
    const name = person.name || ''
    const email = person.primary_email || (person.email?.[0]?.value) || ''
    const phone = person.phone?.[0]?.value || ''
    const company = person.org_name || ''
    const externalId = `pipedrive_${person.id}`

    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
    ).bind(companyId, externalId).first()

    if (existing) {
      await env.DB.prepare(
        "UPDATE accounts SET name = ?, email = ?, company_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, email, company, phone, existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, email, company_name, phone, status, external_id, source) VALUES (?, ?, ?, ?, ?, 'active', ?, 'pipedrive')"
      ).bind(companyId, name, email, company, phone, externalId).run()
    }
    results.contacts++
  }

  // Fetch deals
  const dealsRes = await fetch(`${BASE}/deals?limit=100&api_token=${token}`)
  if (dealsRes.ok) {
    const dealsData = await dealsRes.json()
    results.deals = (dealsData.data || []).length
  }

  return results
}
