// HubSpot CRM — Private App Token
// Docs: https://developers.hubspot.com/docs/api/crm/contacts

const BASE = 'https://api.hubapi.com'

function headers(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Cle d\'acces HubSpot requise')

  const res = await fetch(`${BASE}/crm/v3/objects/contacts?limit=1`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Cle invalide. Verifiez votre token HubSpot.')
  if (!res.ok) throw new Error(`Erreur HubSpot (${res.status})`)

  return { ok: true, message: 'HubSpot connecte avec succes' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Cle d\'acces manquante')

  const h = headers(config.apiKey)
  const results = { contacts: 0, deals: 0 }

  // Fetch contacts
  const contactsRes = await fetch(
    `${BASE}/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company`,
    { headers: h }
  )
  if (!contactsRes.ok) throw new Error(`HubSpot contacts: erreur ${contactsRes.status}`)
  const contactsData = await contactsRes.json()

  for (const contact of contactsData.results || []) {
    const props = contact.properties || {}
    const name = [props.firstname, props.lastname].filter(Boolean).join(' ') || props.email || `Contact ${contact.id}`
    const email = props.email || ''
    const phone = props.phone || ''
    const company = props.company || ''
    const externalId = `hubspot_${contact.id}`

    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
    ).bind(companyId, externalId).first()

    if (existing) {
      await env.DB.prepare(
        "UPDATE accounts SET name = ?, email = ?, phone = ?, company_name = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, email, phone, company, existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, email, phone, company_name, external_id, source) VALUES (?, ?, ?, ?, ?, ?, 'hubspot')"
      ).bind(companyId, name, email, phone, company, externalId).run()
    }
    results.contacts++
  }

  // Fetch deals
  const dealsRes = await fetch(
    `${BASE}/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage`,
    { headers: h }
  )
  if (dealsRes.ok) {
    const dealsData = await dealsRes.json()
    results.deals = (dealsData.results || []).length
  }

  return results
}
