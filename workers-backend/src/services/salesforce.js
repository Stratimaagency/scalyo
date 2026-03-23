export async function testConnection(config) {
  // Salesforce uses OAuth — apiKey here is the access token from OAuth flow
  // or a connected app token
  if (!config.apiKey || !config.instanceUrl) {
    throw new Error('Access token and instance URL are required')
  }

  const res = await fetch(`${config.instanceUrl}/services/data/v59.0/sobjects`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  })
  if (!res.ok) throw new Error(`Salesforce API error ${res.status}`)
  return { ok: true, message: 'Salesforce connected' }
}

export async function sync(config, env, companyId) {
  const h = { Authorization: `Bearer ${config.apiKey}` }
  const base = config.instanceUrl
  const results = { contacts: 0, opportunities: 0 }

  // Fetch accounts (companies/contacts)
  const accRes = await fetch(
    `${base}/services/data/v59.0/query?q=${encodeURIComponent('SELECT Id, Name, Phone, Website, Industry FROM Account LIMIT 200')}`,
    { headers: h }
  )
  if (!accRes.ok) throw new Error(`Salesforce accounts fetch failed: ${accRes.status}`)
  const accData = await accRes.json()

  for (const acc of accData.records || []) {
    const externalId = `salesforce_${acc.Id}`
    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
    ).bind(companyId, externalId).first()

    if (existing) {
      await env.DB.prepare(
        "UPDATE accounts SET name = ?, company_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(acc.Name, acc.Name, acc.Phone || '', existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, company_name, phone, status, external_id, source) VALUES (?, ?, ?, ?, 'active', ?, 'salesforce')"
      ).bind(companyId, acc.Name, acc.Name, acc.Phone || '', externalId).run()
    }
    results.contacts++
  }

  // Fetch open opportunities
  const oppRes = await fetch(
    `${base}/services/data/v59.0/query?q=${encodeURIComponent('SELECT Id, Name, Amount, StageName FROM Opportunity WHERE IsClosed = false LIMIT 200')}`,
    { headers: h }
  )
  if (oppRes.ok) {
    const oppData = await oppRes.json()
    results.opportunities = (oppData.records || []).length
  }

  return results
}
