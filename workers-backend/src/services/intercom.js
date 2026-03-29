// Intercom — Access Token
// Docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/

const BASE = 'https://api.intercom.io'

function headers(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Clé d\'accès Intercom requise')

  const res = await fetch(`${BASE}/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Clé invalide. Vérifiez votre clé Intercom.')
  if (!res.ok) throw new Error('Erreur de connexion Intercom')

  return { ok: true, message: 'Intercom connecté avec succès' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Clé d\'accès manquante')

  const h = headers(config.apiKey)
  const results = { contacts: 0, conversations: 0 }

  const contactsRes = await fetch(`${BASE}/contacts?per_page=50`, { headers: h })
  if (!contactsRes.ok) throw new Error('Impossible de charger les contacts Intercom')
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

  const convRes = await fetch(`${BASE}/conversations?open=true&per_page=1`, { headers: h })
  if (convRes.ok) {
    const convData = await convRes.json()
    results.conversations = convData.total_count || 0
  }

  return results
}

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const h = headers(config.apiKey)

  // Contacts
  const contactsRes = await fetch(`${BASE}/contacts?per_page=50`, { headers: h })
  if (!contactsRes.ok) throw new Error('Impossible de charger les contacts Intercom')
  const contactsData = await contactsRes.json()

  const contacts = (contactsData.data || []).map(c => ({
    id: c.id,
    name: c.name || c.email || 'Sans nom',
    email: c.email || '',
    phone: c.phone || '',
    role: c.role || '',
    lastSeen: c.last_seen_at ? new Date(c.last_seen_at * 1000).toISOString() : '',
    createdAt: c.created_at ? new Date(c.created_at * 1000).toISOString() : '',
  }))

  // Conversations
  const convRes = await fetch(`${BASE}/conversations?per_page=20&sort_field=updated_at&sort_order=desc`, { headers: h })
  let conversations = []
  if (convRes.ok) {
    const convData = await convRes.json()
    conversations = (convData.conversations || []).map(c => ({
      id: c.id,
      title: c.source?.subject || c.source?.body?.slice(0, 80) || `Conversation ${c.id}`,
      state: c.state || '',
      priority: c.priority || 'normal',
      assignee: c.assignee?.name || 'Non assigné',
      updatedAt: c.updated_at ? new Date(c.updated_at * 1000).toISOString() : '',
    }))
  }

  return {
    sections: [
      { key: 'contacts', title: 'Contacts', icon: '👥', items: contacts, total: contactsData.total_count || contacts.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Téléphone' },
          { key: 'role', label: 'Role' },
          { key: 'lastSeen', label: 'Derniere visite', type: 'date' },
        ],
        actions: ['create'],
      },
      { key: 'conversations', title: 'Conversations', icon: '💬', items: conversations, total: conversations.length,
        columns: [
          { key: 'title', label: 'Sujet' },
          { key: 'state', label: 'Statut' },
          { key: 'priority', label: 'Priorité' },
          { key: 'assignee', label: 'Assigné à' },
          { key: 'updatedAt', label: 'Mis à jour', type: 'date' },
        ],
        actions: [],
      },
    ],
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const h = headers(config.apiKey)

  if (action === 'createContact') {
    const res = await fetch(`${BASE}/contacts`, {
      method: 'POST', headers: h,
      body: JSON.stringify({
        role: 'user',
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone || '',
      }),
    })
    if (!res.ok) throw new Error('Impossible de créer le contact')
    return { ok: true, message: 'Contact créé dans Intercom' }
  }

  throw new Error('Action non reconnue')
}
