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
  if (!config.apiKey) throw new Error('Cle d\'integration Notion requise')

  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Cle invalide. Verifiez votre secret d\'integration Notion.')
  if (!res.ok) throw new Error(`Erreur Notion (${res.status})`)

  return { ok: true, message: 'Notion connecte avec succes' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Cle d\'integration manquante')

  const h = headers(config.apiKey)
  const results = { databases: 0, pages: 0 }

  // Search for databases shared with the integration
  const searchRes = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ filter: { value: 'database', property: 'object' }, page_size: 10 }),
  })
  if (!searchRes.ok) throw new Error(`Notion search: erreur ${searchRes.status}`)
  const searchData = await searchRes.json()

  for (const db of searchData.results || []) {
    results.databases++

    // Query each database and import entries as accounts
    const dbRes = await fetch(`${BASE}/databases/${db.id}/query`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ page_size: 100 }),
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
      results.pages++
    }
  }

  return results
}

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
