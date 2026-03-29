// HubSpot CRM — Private App Token
// Docs: https://developers.hubspot.com/docs/api/crm/contacts

const BASE = 'https://api.hubapi.com'

function headers(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Clé d\'accès HubSpot requise')

  const res = await fetch(`${BASE}/crm/v3/objects/contacts?limit=1`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Clé invalide. Vérifiez votre clé HubSpot.')
  if (!res.ok) throw new Error('Erreur de connexion HubSpot')

  return { ok: true, message: 'HubSpot connecté avec succès' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Clé d\'accès manquante')

  const h = headers(config.apiKey)
  const results = { contacts: 0, deals: 0 }

  const contactsRes = await fetch(
    `${BASE}/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company`,
    { headers: h }
  )
  if (!contactsRes.ok) throw new Error('Impossible de charger les contacts HubSpot')
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

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const h = headers(config.apiKey)

  // Contacts
  const contactsRes = await fetch(
    `${BASE}/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company,lifecyclestage,createdate`,
    { headers: h }
  )
  if (!contactsRes.ok) throw new Error('Impossible de charger les contacts HubSpot')
  const contactsData = await contactsRes.json()

  const contacts = (contactsData.results || []).map(c => {
    const p = c.properties || {}
    return {
      id: c.id,
      name: [p.firstname, p.lastname].filter(Boolean).join(' ') || p.email || `Contact ${c.id}`,
      firstname: p.firstname || '',
      lastname: p.lastname || '',
      email: p.email || '',
      phone: p.phone || '',
      company: p.company || '',
      stage: p.lifecyclestage || '',
      createdAt: p.createdate || '',
    }
  })

  // Deals
  const dealsRes = await fetch(
    `${BASE}/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,pipeline`,
    { headers: h }
  )
  let deals = []
  if (dealsRes.ok) {
    const dealsData = await dealsRes.json()
    deals = (dealsData.results || []).map(d => {
      const p = d.properties || {}
      return {
        id: d.id,
        name: p.dealname || `Deal ${d.id}`,
        amount: p.amount ? parseFloat(p.amount) : 0,
        stage: p.dealstage || '',
        closeDate: p.closedate || '',
        pipeline: p.pipeline || '',
      }
    })
  }

  return {
    sections: [
      { key: 'contacts', title: 'Contacts', icon: '👥', items: contacts, total: contacts.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Téléphone' },
          { key: 'company', label: 'Entreprise' },
          { key: 'stage', label: 'Étape' },
        ],
        actions: ['create', 'edit'],
      },
      { key: 'deals', title: 'Deals', icon: '💰', items: deals, total: deals.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'amount', label: 'Montant', type: 'currency' },
          { key: 'stage', label: 'Étape' },
          { key: 'closeDate', label: 'Date fermeture', type: 'date' },
        ],
        actions: ['create'],
      },
    ],
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const h = headers(config.apiKey)

  if (action === 'createContact') {
    const res = await fetch(`${BASE}/crm/v3/objects/contacts`, {
      method: 'POST', headers: h,
      body: JSON.stringify({ properties: {
        firstname: payload.firstname || '',
        lastname: payload.lastname || '',
        email: payload.email || '',
        phone: payload.phone || '',
        company: payload.company || '',
      }}),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Impossible de créer le contact')
    }
    return { ok: true, message: 'Contact créé dans HubSpot' }
  }

  if (action === 'editContact') {
    const res = await fetch(`${BASE}/crm/v3/objects/contacts/${payload.id}`, {
      method: 'PATCH', headers: h,
      body: JSON.stringify({ properties: {
        ...(payload.firstname !== undefined && { firstname: payload.firstname }),
        ...(payload.lastname !== undefined && { lastname: payload.lastname }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.phone !== undefined && { phone: payload.phone }),
        ...(payload.company !== undefined && { company: payload.company }),
      }}),
    })
    if (!res.ok) throw new Error('Impossible de modifier le contact')
    return { ok: true, message: 'Contact modifié dans HubSpot' }
  }

  if (action === 'createDeal') {
    const res = await fetch(`${BASE}/crm/v3/objects/deals`, {
      method: 'POST', headers: h,
      body: JSON.stringify({ properties: {
        dealname: payload.name || '',
        amount: payload.amount ? String(payload.amount) : '',
        dealstage: payload.stage || 'appointmentscheduled',
      }}),
    })
    if (!res.ok) throw new Error('Impossible de créer le deal')
    return { ok: true, message: 'Deal créé dans HubSpot' }
  }

  throw new Error('Action non reconnue')
}
