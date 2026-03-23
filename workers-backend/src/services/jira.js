export async function testConnection(config) {
  if (!config.apiKey || !config.projectKey) {
    throw new Error('API token and project key are required')
  }

  // Jira Cloud uses email:apiToken as basic auth
  // config.apiKey = "email:api_token" or just the token if email is separate
  const domain = config.domain || config.projectKey.split('-')[0]
  const auth = btoa(config.apiKey)

  const res = await fetch(`https://${domain}.atlassian.net/rest/api/3/myself`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) throw new Error(`Jira API error ${res.status}`)
  return { ok: true, message: 'Jira connected' }
}

export async function sync(config, env, companyId) {
  const domain = config.domain || config.projectKey.split('-')[0]
  const auth = btoa(config.apiKey)
  const h = { Authorization: `Basic ${auth}`, Accept: 'application/json' }
  const results = { issues: 0 }

  // Fetch project issues
  const jql = encodeURIComponent(`project = ${config.projectKey} AND status != Done ORDER BY updated DESC`)
  const res = await fetch(
    `https://${domain}.atlassian.net/rest/api/3/search?jql=${jql}&maxResults=50&fields=summary,status,assignee,priority,updated`,
    { headers: h }
  )
  if (!res.ok) throw new Error(`Jira issues fetch failed: ${res.status}`)
  const data = await res.json()

  // Sync Jira issues as tasks
  if (config.syncTasks) {
    for (const issue of data.issues || []) {
      const title = `[${issue.key}] ${issue.fields.summary}`
      const status = issue.fields.status?.name?.toLowerCase().includes('progress') ? 'in_progress' : 'todo'
      const externalId = `jira_${issue.id}`

      const existing = await env.DB.prepare(
        'SELECT id FROM tasks WHERE company_id = ? AND external_id = ?'
      ).bind(companyId, externalId).first()

      if (existing) {
        await env.DB.prepare(
          "UPDATE tasks SET title = ?, status = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(title, status, existing.id).run()
      } else {
        await env.DB.prepare(
          "INSERT INTO tasks (company_id, title, status, external_id, source) VALUES (?, ?, ?, ?, 'jira')"
        ).bind(companyId, title, status, externalId).run()
      }
    }
  }

  results.issues = (data.issues || []).length
  return results
}
