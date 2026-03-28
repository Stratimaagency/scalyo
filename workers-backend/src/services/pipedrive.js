// Pipedrive CRM — API Token
// Docs: https://developers.pipedrive.com/docs/api/v1

const BASE = 'https://api.pipedrive.com/v1'

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Token API Pipedrive requis')

  const res = await fetch(`${BASE}/users/me?api_token=${config.apiKey}`)
  if (res.status === 401) throw new Error('Token invalide. Verifiez votre token Pipedrive.')
  if (!res.ok) throw new Error(`Erreur Pipedrive (${res.status})`)

  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Authentification Pipedrive echouee')

  return { ok: true, message: 'Pipedrive connecte avec succes' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Token API manquant')

  const token = config.apiKey
  const results = { contacts: 0, deals: 0 }

  // Fetch persons (contacts)
  const personsRes = await fetch(`${BASE}/persons?limit=100&api_token=${token}`)
  if (!personsRes.ok) throw new Error(`Pipedrive contacts: erreur ${personsRes.status}`)
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
        "UPDATE accounts SET name = ?, email = ?, phone = ?, company_name = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, email, phone, company, existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, email, phone, company_name, external_id, source) VALUES (?, ?, ?, ?, ?, ?, 'pipedrive')"
      ).bind(companyId, name, email, phone, company, externalId).run()
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
