const BASE = 'https://app.asana.com/api/1.0'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  }
}

export async function testConnection(config) {
  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey) })
  if (!res.ok) throw new Error(`Asana API error ${res.status}`)
  return { ok: true, message: 'Asana connected' }
}

export async function sync(config, env, companyId) {
  const h = headers(config.apiKey)
  const results = { tasks: 0, projects: 0 }

  // Find workspace
  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Asana: failed to get user')
  const me = await meRes.json()
  const workspace = me.data?.workspaces?.[0]?.gid
  if (!workspace) throw new Error('Asana: no workspace found')

  // Find project by key if provided
  let projectGid = null
  if (config.projectKey) {
    const projRes = await fetch(`${BASE}/projects?workspace=${workspace}&limit=100`, { headers: h })
    if (projRes.ok) {
      const projData = await projRes.json()
      const match = (projData.data || []).find(p => p.name.toLowerCase().includes(config.projectKey.toLowerCase()))
      if (match) projectGid = match.gid
      results.projects = (projData.data || []).length
    }
  }

  // Fetch tasks
  if (config.syncTasks) {
    let url = projectGid
      ? `${BASE}/tasks?project=${projectGid}&completed_since=now&limit=50&opt_fields=name,completed,assignee.name,due_on`
      : `${BASE}/tasks?workspace=${workspace}&assignee=me&completed_since=now&limit=50&opt_fields=name,completed,assignee.name,due_on`

    const tasksRes = await fetch(url, { headers: h })
    if (!tasksRes.ok) throw new Error(`Asana tasks fetch failed: ${tasksRes.status}`)
    const tasksData = await tasksRes.json()

    for (const task of tasksData.data || []) {
      const externalId = `asana_${task.gid}`
      const status = task.completed ? 'done' : 'todo'

      const existing = await env.DB.prepare(
        'SELECT id FROM tasks WHERE company_id = ? AND external_id = ?'
      ).bind(companyId, externalId).first()

      if (existing) {
        await env.DB.prepare(
          "UPDATE tasks SET title = ?, status = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(task.name, status, existing.id).run()
      } else {
        await env.DB.prepare(
          "INSERT INTO tasks (company_id, title, status, external_id, source) VALUES (?, ?, ?, ?, 'asana')"
        ).bind(companyId, task.name, status, externalId).run()
      }
    }

    results.tasks = (tasksData.data || []).length
  }

  return results
}
