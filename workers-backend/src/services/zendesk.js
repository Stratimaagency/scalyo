// Zendesk Support — Email + API Token
// Docs: https://developer.zendesk.com/api-reference/

function getAuth(config) {
  return btoa(`${config.email}/token:${config.apiKey}`)
}

function getBase(config) {
  return `https://${config.domain}.zendesk.com/api/v2`
}

function getHeaders(config) {
  return { Authorization: `Basic ${getAuth(config)}`, 'Content-Type': 'application/json' }
}

export async function testConnection(config) {
  if (!config.email) throw new Error('Email Zendesk requis')
  if (!config.apiKey) throw new Error('Token API Zendesk requis')
  if (!config.domain) throw new Error('Sous-domaine Zendesk requis')

  const res = await fetch(`${getBase(config)}/users/me.json`, { headers: getHeaders(config) })
  if (res.status === 401) throw new Error('Identifiants invalides. Verifiez email, token et sous-domaine.')
  if (!res.ok) throw new Error(`Erreur Zendesk (${res.status})`)

  return { ok: true, message: `Zendesk connecte (${config.domain}.zendesk.com)` }
}

export async function sync(config, env, companyId) {
  if (!config.email || !config.apiKey || !config.domain) throw new Error('Configuration Zendesk incomplete')

  const base = getBase(config)
  const h = getHeaders(config)
  const results = { tickets: 0, users: 0 }

  const ticketsRes = await fetch(`${base}/tickets.json?sort_by=updated_at&sort_order=desc&per_page=100`, { headers: h })
  if (!ticketsRes.ok) throw new Error(`Zendesk tickets: erreur ${ticketsRes.status}`)
  const ticketsData = await ticketsRes.json()
  results.tickets = (ticketsData.tickets || []).length

  const usersRes = await fetch(`${base}/users.json?role=end-user&per_page=100`, { headers: h })
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

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const base = getBase(config)
  const h = getHeaders(config)

  // Tickets
  const ticketsRes = await fetch(`${base}/tickets.json?sort_by=updated_at&sort_order=desc&per_page=100`, { headers: h })
  if (!ticketsRes.ok) throw new Error(`Erreur Zendesk tickets (${ticketsRes.status})`)
  const ticketsData = await ticketsRes.json()

  const tickets = (ticketsData.tickets || []).map(t => ({
    id: t.id,
    subject: t.subject || `Ticket #${t.id}`,
    status: t.status || '',
    priority: t.priority || 'normal',
    type: t.type || '',
    requester: t.requester_id || '',
    assignee: t.assignee_id || '',
    createdAt: t.created_at || '',
    updatedAt: t.updated_at || '',
  }))

  // Users
  const usersRes = await fetch(`${base}/users.json?role=end-user&per_page=100`, { headers: h })
  let users = []
  if (usersRes.ok) {
    const usersData = await usersRes.json()
    users = (usersData.users || []).map(u => ({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || '',
      createdAt: u.created_at || '',
    }))
  }

  return {
    sections: [
      { key: 'tickets', title: 'Tickets', icon: '🎫', items: tickets, total: tickets.length,
        columns: [
          { key: 'id', label: '#' },
          { key: 'subject', label: 'Sujet' },
          { key: 'status', label: 'Statut' },
          { key: 'priority', label: 'Priorite' },
          { key: 'type', label: 'Type' },
          { key: 'updatedAt', label: 'Mis a jour', type: 'date' },
        ],
        actions: ['create', 'updateStatus'],
      },
      { key: 'users', title: 'Utilisateurs', icon: '👥', items: users, total: users.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Telephone' },
        ],
        actions: [],
      },
    ],
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const base = getBase(config)
  const h = getHeaders(config)

  if (action === 'createTicket') {
    const res = await fetch(`${base}/tickets.json`, {
      method: 'POST', headers: h,
      body: JSON.stringify({ ticket: {
        subject: payload.subject || '',
        description: payload.description || '',
        priority: payload.priority || 'normal',
        type: payload.type || 'problem',
      }}),
    })
    if (!res.ok) throw new Error(`Erreur creation ticket (${res.status})`)
    return { ok: true, message: 'Ticket cree dans Zendesk' }
  }

  if (action === 'updateStatus') {
    const res = await fetch(`${base}/tickets/${payload.ticketId}.json`, {
      method: 'PUT', headers: h,
      body: JSON.stringify({ ticket: { status: payload.status } }),
    })
    if (!res.ok) throw new Error(`Erreur mise a jour ticket (${res.status})`)
    return { ok: true, message: 'Ticket mis a jour' }
  }

  throw new Error(`Action inconnue: ${action}`)
}
