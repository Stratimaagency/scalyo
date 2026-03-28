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

  const dealsRes = await fetch(`${BASE}/deals?limit=100&api_token=${token}`)
  if (dealsRes.ok) {
    const dealsData = await dealsRes.json()
    results.deals = (dealsData.data || []).length
  }

  return results
}

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const token = config.apiKey

  const personsRes = await fetch(`${BASE}/persons?limit=100&api_token=${token}`)
  if (!personsRes.ok) throw new Error(`Erreur Pipedrive (${personsRes.status})`)
  const personsData = await personsRes.json()

  const contacts = (personsData.data || []).map(p => ({
    id: p.id,
    name: p.name || '',
    email: p.primary_email || p.email?.[0]?.value || '',
    phone: p.phone?.[0]?.value || '',
    company: p.org_name || '',
    openDeals: p.open_deals_count || 0,
    wonDeals: p.won_deals_count || 0,
  }))

  const dealsRes = await fetch(`${BASE}/deals?limit=100&api_token=${token}`)
  let deals = []
  if (dealsRes.ok) {
    const dealsData = await dealsRes.json()
    deals = (dealsData.data || []).map(d => ({
      id: d.id,
      name: d.title || '',
      value: d.value || 0,
      currency: d.currency || 'EUR',
      status: d.status || '',
      stage: d.stage_id || '',
      person: d.person_name || '',
      org: d.org_name || '',
    }))
  }

  return {
    sections: [
      { key: 'contacts', title: 'Contacts', icon: '👥', items: contacts, total: contacts.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Telephone' },
          { key: 'company', label: 'Entreprise' },
          { key: 'openDeals', label: 'Deals ouverts' },
        ],
        actions: ['create', 'edit'],
      },
      { key: 'deals', title: 'Deals', icon: '💰', items: deals, total: deals.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'value', label: 'Montant', type: 'currency' },
          { key: 'status', label: 'Statut' },
          { key: 'person', label: 'Contact' },
          { key: 'org', label: 'Entreprise' },
        ],
        actions: ['create'],
      },
    ],
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const token = config.apiKey

  if (action === 'createContact') {
    const res = await fetch(`${BASE}/persons?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name || '',
        email: payload.email ? [{ value: payload.email, primary: true }] : undefined,
        phone: payload.phone ? [{ value: payload.phone, primary: true }] : undefined,
      }),
    })
    if (!res.ok) throw new Error(`Erreur creation contact (${res.status})`)
    return { ok: true, message: 'Contact cree dans Pipedrive' }
  }

  if (action === 'createDeal') {
    const res = await fetch(`${BASE}/deals?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: payload.name || '',
        value: payload.value || '',
        currency: payload.currency || 'EUR',
      }),
    })
    if (!res.ok) throw new Error(`Erreur creation deal (${res.status})`)
    return { ok: true, message: 'Deal cree dans Pipedrive' }
  }

  if (action === 'editContact') {
    const res = await fetch(`${BASE}/persons/${payload.id}?api_token=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(payload.name && { name: payload.name }),
        ...(payload.email && { email: [{ value: payload.email, primary: true }] }),
        ...(payload.phone && { phone: [{ value: payload.phone, primary: true }] }),
      }),
    })
    if (!res.ok) throw new Error(`Erreur modification contact (${res.status})`)
    return { ok: true, message: 'Contact modifie dans Pipedrive' }
  }

  throw new Error(`Action inconnue: ${action}`)
}
