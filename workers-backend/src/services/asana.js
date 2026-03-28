// Asana — Personal Access Token
// Docs: https://developers.asana.com/docs/

const BASE = 'https://app.asana.com/api/1.0'

function headers(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('Token d\'acces Asana requis')

  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Token invalide. Verifiez votre token Asana.')
  if (!res.ok) throw new Error(`Erreur Asana (${res.status})`)

  return { ok: true, message: 'Asana connecte avec succes' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error('Token d\'acces manquant')

  const h = headers(config.apiKey)
  const results = { tasks: 0, projects: 0 }

  // Get user's workspace
  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Asana: impossible de recuperer l\'utilisateur')
  const me = await meRes.json()
  const workspace = me.data?.workspaces?.[0]?.gid
  if (!workspace) throw new Error('Asana: aucun workspace trouve')

  // Fetch projects
  const projRes = await fetch(`${BASE}/projects?workspace=${workspace}&limit=100`, { headers: h })
  if (projRes.ok) {
    const projData = await projRes.json()
    results.projects = (projData.data || []).length
  }

  // Fetch my incomplete tasks
  const tasksRes = await fetch(
    `${BASE}/tasks?workspace=${workspace}&assignee=me&completed_since=now&limit=50&opt_fields=name,completed,assignee.name,due_on`,
    { headers: h }
  )
  if (!tasksRes.ok) throw new Error(`Asana taches: erreur ${tasksRes.status}`)
  const tasksData = await tasksRes.json()

  // Load existing task_boards JSON singleton
  const existing = await env.DB.prepare(
    'SELECT id, tasks FROM task_boards WHERE company_id = ?'
  ).bind(companyId).first()

  let currentTasks = []
  if (existing) {
    try { currentTasks = JSON.parse(existing.tasks || '[]') } catch { currentTasks = [] }
  }

  // Build map of existing Asana tasks
  const existingMap = new Map()
  for (const t of currentTasks) {
    if (t.externalId && t.externalId.startsWith('asana_')) {
      existingMap.set(t.externalId, t)
    }
  }

  // Process Asana tasks
  const newAsanaTasks = []
  for (const task of tasksData.data || []) {
    const externalId = `asana_${task.gid}`
    const isDone = task.completed || false

    const taskObj = {
      id: existingMap.get(externalId)?.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: task.name || 'Tache Asana',
      note: 'Source: Asana',
      color: 'blue',
      quadrant: 'q2',
      dueDate: task.due_on || '',
      account: '',
      done: isDone,
      externalId,
      createdAt: existingMap.get(externalId)?.createdAt || new Date().toISOString(),
    }

    newAsanaTasks.push(taskObj)
    results.tasks++
  }

  // Merge: keep non-Asana tasks, replace Asana ones
  const nonAsanaTasks = currentTasks.filter(t => !t.externalId || !t.externalId.startsWith('asana_'))
  const mergedTasks = [...nonAsanaTasks, ...newAsanaTasks]

  // Upsert into task_boards singleton
  if (existing) {
    await env.DB.prepare(
      "UPDATE task_boards SET tasks = ?, updated_at = datetime('now') WHERE company_id = ?"
    ).bind(JSON.stringify(mergedTasks), companyId).run()
  } else {
    await env.DB.prepare(
      "INSERT INTO task_boards (company_id, tasks) VALUES (?, ?)"
    ).bind(companyId, JSON.stringify(mergedTasks)).run()
  }

  return results
}
