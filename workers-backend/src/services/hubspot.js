const BASE = 'https://api.hubapi.com'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

export async function testConnection(config) {
  const res = await fetch(`${BASE}/crm/v3/objects/contacts?limit=1`, { headers: headers(config.apiKey) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HubSpot API error ${res.status}`)
  }
  return { ok: true, message: 'HubSpot connected' }
}

export async function sync(config, env, companyId) {
  const h = headers(config.apiKey)
  const results = { contacts: 0, deals: 0 }

  // Fetch contacts
  const contactsRes = await fetch(
    `${BASE}/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,company,phone`,
    { headers: h }
  )
  if (!contactsRes.ok) throw new Error(`HubSpot contacts fetch failed: ${contactsRes.status}`)
  const contactsData = await contactsRes.json()

  for (const contact of contactsData.results || []) {
    const props = contact.properties || {}
    const name = [props.firstname, props.lastname].filter(Boolean).join(' ') || props.email || contact.id
    const email = props.email || ''
    const company = props.company || ''
    const phone = props.phone || ''
    const externalId = `hubspot_${contact.id}`

    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
    ).bind(companyId, externalId).first()

    if (existing) {
      await env.DB.prepare(
        "UPDATE accounts SET name = ?, email = ?, company_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, email, company, phone, existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, email, company_name, phone, status, external_id, source) VALUES (?, ?, ?, ?, ?, 'active', ?, 'hubspot')"
      ).bind(companyId, name, email, company, phone, externalId).run()
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
