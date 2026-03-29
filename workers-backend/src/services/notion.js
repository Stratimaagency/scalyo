// Notion — Internal Integration Token
// Docs: https://developers.notion.com/

const BASE = 'https://api.notion.com/v1'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Clé d\'intégration Notion requise')

  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Clé invalide. Vérifiez votre clé Notion.')
  if (!res.ok) throw new Error('Erreur de connexion Notion')

  return { ok: true, message: 'Notion connecté avec succès' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Clé d\'intégration manquante')

  const h = headers(config.apiKey)
  const results = { databases: 0, entries: 0 }

  const searchRes = await fetch(`${BASE}/search`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ filter: { value: 'database', property: 'object' }, page_size: 10 }),
  })
  if (!searchRes.ok) throw new Error('Impossible de charger les données Notion')
  const searchData = await searchRes.json()

  for (const db of searchData.results || []) {
    results.databases++

    const dbRes = await fetch(`${BASE}/databases/${db.id}/query`, {
      method: 'POST', headers: h, body: JSON.stringify({ page_size: 100 }),
    })
    if (!dbRes.ok) continue
    const dbData = await dbRes.json()

    for (const page of dbData.results || []) {
      const props = page.properties || {}
      const name = extractTitle(props) || `Notion ${page.id.slice(0, 8)}`
      const email = extractEmail(props) || ''
      const externalId = `notion_${page.id}`

      const existing = await env.DB.prepare(
        'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
      ).bind(companyId, externalId).first()

      if (existing) {
        await env.DB.prepare(
          "UPDATE accounts SET name = ?, email = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(name, email, existing.id).run()
      } else {
        await env.DB.prepare(
          "INSERT INTO accounts (company_id, name, email, external_id, source) VALUES (?, ?, ?, ?, 'notion')"
        ).bind(companyId, name, email, externalId).run()
      }
      results.entries++
    }
  }

  return results
}

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const h = headers(config.apiKey)

  // Fetch databases
  const dbSearchRes = await fetch(`${BASE}/search`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ filter: { value: 'database', property: 'object' }, page_size: 20 }),
  })
  if (!dbSearchRes.ok) throw new Error('Impossible de charger les données Notion')
  const dbSearchData = await dbSearchRes.json()

  const databases = []
  for (const db of dbSearchData.results || []) {
    const title = db.title?.map(t => t.plain_text).join('') || 'Base sans nom'
    const dbId = db.id

    // Query entries for this database
    const queryRes = await fetch(`${BASE}/databases/${dbId}/query`, {
      method: 'POST', headers: h, body: JSON.stringify({ page_size: 50 }),
    })

    let entries = []
    let columns = []
    if (queryRes.ok) {
      const queryData = await queryRes.json()

      // Build columns from database properties
      const propNames = Object.keys(db.properties || {}).slice(0, 6)
      columns = propNames.map(name => ({ key: name, label: name, propType: db.properties[name]?.type }))

      entries = (queryData.results || []).map(page => {
        const row = { id: page.id, url: page.url || '' }
        for (const col of columns) {
          row[col.key] = extractPropertyValue(page.properties?.[col.key])
        }
        return row
      })
    }

    databases.push({
      id: dbId, title, entries, columns, total: entries.length,
    })
  }

  // Fetch recent pages
  const pageSearchRes = await fetch(`${BASE}/search`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ filter: { value: 'page', property: 'object' }, page_size: 20, sort: { direction: 'descending', timestamp: 'last_edited_time' } }),
  })
  let recentPages = []
  if (pageSearchRes.ok) {
    const pageData = await pageSearchRes.json()
    recentPages = (pageData.results || []).map(p => ({
      id: p.id,
      title: p.properties ? (extractTitle(p.properties) || 'Page sans titre') : 'Page sans titre',
      url: p.url || '',
      lastEdited: p.last_edited_time || '',
      icon: p.icon?.emoji || '📄',
    }))
  }

  return {
    databases,
    recentPages,
    sections: [
      { key: 'pages', title: 'Pages récentes', icon: '📄', items: recentPages, total: recentPages.length,
        columns: [
          { key: 'icon', label: '' },
          { key: 'title', label: 'Titre' },
          { key: 'lastEdited', label: 'Modifie le', type: 'date' },
        ],
        actions: ['view'],
      },
    ],
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const h = headers(config.apiKey)

  if (action === 'createPage') {
    if (!payload.databaseId) throw new Error('Base de données requise')
    if (!payload.title) throw new Error('Titre requis')

    const body = {
      parent: { database_id: payload.databaseId },
      properties: {
        ...(payload.titleProperty ? {
          [payload.titleProperty]: { title: [{ text: { content: payload.title } }] },
        } : {
          Name: { title: [{ text: { content: payload.title } }] },
        }),
      },
    }

    // Add extra properties if provided
    if (payload.properties) {
      for (const [key, val] of Object.entries(payload.properties)) {
        if (val.type === 'rich_text') {
          body.properties[key] = { rich_text: [{ text: { content: val.value || '' } }] }
        } else if (val.type === 'email') {
          body.properties[key] = { email: val.value || null }
        } else if (val.type === 'number') {
          body.properties[key] = { number: parseFloat(val.value) || null }
        } else if (val.type === 'select') {
          body.properties[key] = { select: { name: val.value } }
        }
      }
    }

    const res = await fetch(`${BASE}/pages`, { method: 'POST', headers: h, body: JSON.stringify(body) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Impossible de créer la page')
    }
    return { ok: true, message: 'Page créée dans Notion' }
  }

  if (action === 'updatePage') {
    if (!payload.pageId) throw new Error('Page requise')

    const body = { properties: {} }
    for (const [key, val] of Object.entries(payload.properties || {})) {
      if (val.type === 'title') {
        body.properties[key] = { title: [{ text: { content: val.value || '' } }] }
      } else if (val.type === 'rich_text') {
        body.properties[key] = { rich_text: [{ text: { content: val.value || '' } }] }
      } else if (val.type === 'email') {
        body.properties[key] = { email: val.value || null }
      } else if (val.type === 'number') {
        body.properties[key] = { number: parseFloat(val.value) || null }
      } else if (val.type === 'select') {
        body.properties[key] = { select: { name: val.value } }
      }
    }

    const res = await fetch(`${BASE}/pages/${payload.pageId}`, {
      method: 'PATCH', headers: h, body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Impossible de modifier la page')
    return { ok: true, message: 'Page modifiée dans Notion' }
  }

  if (action === 'getPage') {
    const res = await fetch(`${BASE}/pages/${payload.pageId}`, { headers: h })
    if (!res.ok) throw new Error('Impossible de charger la page')
    const page = await res.json()

    // Get page content (blocks)
    const blocksRes = await fetch(`${BASE}/blocks/${payload.pageId}/children?page_size=100`, { headers: h })
    let blocks = []
    if (blocksRes.ok) {
      const blocksData = await blocksRes.json()
      blocks = (blocksData.results || []).map(b => ({
        id: b.id, type: b.type,
        content: extractBlockContent(b),
      }))
    }

    return { page, blocks }
  }

  throw new Error('Action non reconnue')
}

// ─── HELPERS ────────────────────────────────────────────
function extractTitle(props) {
  for (const [, val] of Object.entries(props)) {
    if (val.type === 'title' && val.title?.length > 0) {
      return val.title.map(t => t.plain_text).join('')
    }
  }
  return null
}

function extractEmail(props) {
  for (const [, val] of Object.entries(props)) {
    if (val.type === 'email' && val.email) return val.email
  }
  return null
}

function extractPropertyValue(prop) {
  if (!prop) return ''
  switch (prop.type) {
    case 'title': return prop.title?.map(t => t.plain_text).join('') || ''
    case 'rich_text': return prop.rich_text?.map(t => t.plain_text).join('') || ''
    case 'number': return prop.number ?? ''
    case 'select': return prop.select?.name || ''
    case 'multi_select': return prop.multi_select?.map(s => s.name).join(', ') || ''
    case 'date': return prop.date?.start || ''
    case 'email': return prop.email || ''
    case 'phone_number': return prop.phone_number || ''
    case 'url': return prop.url || ''
    case 'checkbox': return prop.checkbox ? 'Oui' : 'Non'
    case 'status': return prop.status?.name || ''
    case 'people': return prop.people?.map(p => p.name).join(', ') || ''
    case 'formula': return prop.formula?.string || prop.formula?.number || ''
    default: return ''
  }
}

function extractBlockContent(block) {
  const type = block.type
  const data = block[type]
  if (!data) return ''
  if (data.rich_text) return data.rich_text.map(t => t.plain_text).join('')
  if (data.text) return data.text.map(t => t.plain_text).join('')
  return ''
}
