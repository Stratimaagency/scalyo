// Intercom — Access Token
// Docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/

const BASE = 'https://api.intercom.io'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Token d\'acces Intercom requis')

  const res = await fetch(`${BASE}/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Token invalide. Verifiez votre Access Token Intercom.')
  if (!res.ok) throw new Error(`Erreur Intercom (${res.status})`)

  return { ok: true, message: 'Intercom connecte avec succes' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Token d\'acces manquant')

  const h = headers(config.apiKey)
  const results = { contacts: 0, conversations: 0 }

  // Fetch contacts
  const contactsRes = await fetch(`${BASE}/contacts?per_page=50`, { headers: h })
  if (!contactsRes.ok) throw new Error(`Intercom contacts: erreur ${contactsRes.status}`)
  const contactsData = await contactsRes.json()

  for (const contact of contactsData.data || []) {
    const name = contact.name || contact.email || contact.id
    const email = contact.email || ''
    const phone = contact.phone || ''
    const externalId = `intercom_${contact.id}`

    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
    ).bind(companyId, externalId).first()

    if (existing) {
      await env.DB.prepare(
        "UPDATE accounts SET name = ?, email = ?, phone = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, email, phone, existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, email, phone, external_id, source) VALUES (?, ?, ?, ?, ?, 'intercom')"
      ).bind(companyId, name, email, phone, externalId).run()
    }
    results.contacts++
  }

  // Fetch open conversations count
  const convRes = await fetch(`${BASE}/conversations?open=true&per_page=1`, { headers: h })
  if (convRes.ok) {
    const convData = await convRes.json()
    results.conversations = convData.total_count || 0
  }

  return results
}
