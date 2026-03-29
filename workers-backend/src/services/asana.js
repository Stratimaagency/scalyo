// Asana — Personal Access Token
// Docs: https://developers.asana.com/docs/

const BASE = 'https://app.asana.com/api/1.0'

function headers(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, Accept: 'application/json', 'Content-Type': 'application/json' }
}

export async function testConnection(config) {
  if (!config.apiKey) throw new Error("Clé d'accès Asana requise")

  const res = await fetch(`${BASE}/users/me`, { headers: headers(config.apiKey) })
  if (res.status === 401) throw new Error('Clé invalide. Vérifiez votre clé Asana.')
  if (!res.ok) throw new Error('Erreur de connexion Asana')

  return { ok: true, message: 'Asana connecté avec succès' }
}

export async function sync(config, env, companyId) {
  if (!config.apiKey) throw new Error("Clé d'accès manquante")

  const h = headers(config.apiKey)
  const results = { tasks: 0, projects: 0 }

  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error("Impossible de récupérer les informations Asana")
  const me = await meRes.json()
  const workspace = me.data?.workspaces?.[0]?.gid
  if (!workspace) throw new Error('Aucun espace de travail Asana trouvé')

  const projRes = await fetch(`${BASE}/projects?workspace=${workspace}&limit=100`, { headers: h })
  if (projRes.ok) {
    const projData = await projRes.json()
    results.projects = (projData.data || []).length
  }

  const tasksRes = await fetch(
    `${BASE}/tasks?workspace=${workspace}&assignee=me&completed_since=now&limit=50&opt_fields=name,completed,assignee.name,due_on`,
    { headers: h }
  )
  if (!tasksRes.ok) throw new Error('Impossible de charger les tâches Asana')
  const tasksData = await tasksRes.json()

  const existing = await env.DB.prepare(
    'SELECT id, tasks FROM task_boards WHERE company_id = ?'
  ).bind(companyId).first()

  let currentTasks = []
  if (existing) {
    try { currentTasks = JSON.parse(existing.tasks || '[]') } catch { currentTasks = [] }
  }

  const existingMap = new Map()
  for (const t of currentTasks) {
    if (t.externalId && t.externalId.startsWith('asana_')) existingMap.set(t.externalId, t)
  }

  const newAsanaTasks = []
  for (const task of tasksData.data || []) {
    const externalId = `asana_${task.gid}`
    newAsanaTasks.push({
      id: existingMap.get(externalId)?.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: task.name || 'Tâche Asana',
      note: 'Source: Asana', color: 'blue', quadrant: 'q2',
      dueDate: task.due_on || '', account: '', done: task.completed || false, externalId,
      createdAt: existingMap.get(externalId)?.createdAt || new Date().toISOString(),
    })
    results.tasks++
  }

  const nonAsanaTasks = currentTasks.filter(t => !t.externalId || !t.externalId.startsWith('asana_'))
  const mergedTasks = [...nonAsanaTasks, ...newAsanaTasks]

  if (existing) {
    await env.DB.prepare("UPDATE task_boards SET tasks = ?, updated_at = datetime('now') WHERE company_id = ?")
      .bind(JSON.stringify(mergedTasks), companyId).run()
  } else {
    await env.DB.prepare("INSERT INTO task_boards (company_id, tasks) VALUES (?, ?)")
      .bind(companyId, JSON.stringify(mergedTasks)).run()
  }

  return results
}

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const h = headers(config.apiKey)

  const meRes = await fetch(`${BASE}/users/me`, { headers: h })
  if (!meRes.ok) throw new Error('Erreur de connexion Asana')
  const me = await meRes.json()
  const workspace = me.data?.workspaces?.[0]?.gid
  if (!workspace) throw new Error('Aucun espace de travail Asana trouvé')

  // Projects
  const projRes = await fetch(`${BASE}/projects?workspace=${workspace}&limit=100&opt_fields=name,color,created_at`, { headers: h })
  let projects = []
  if (projRes.ok) {
    const projData = await projRes.json()
    projects = (projData.data || []).map(p => ({
      gid: p.gid, name: p.name || '', color: p.color || '',
    }))
  }

  // Tasks
  const tasksRes = await fetch(
    `${BASE}/tasks?workspace=${workspace}&assignee=me&completed_since=now&limit=100&opt_fields=name,completed,due_on,assignee.name,projects.name,notes`,
    { headers: h }
  )
  if (!tasksRes.ok) throw new Error('Impossible de charger les tâches Asana')
  const tasksData = await tasksRes.json()

  const tasks = (tasksData.data || []).map(t => ({
    gid: t.gid,
    name: t.name || '',
    completed: t.completed || false,
    dueOn: t.due_on || '',
    project: t.projects?.[0]?.name || '',
    notes: (t.notes || '').slice(0, 200),
  }))

  return {
    sections: [
      { key: 'tasks', title: 'Tâches', icon: '✅', items: tasks, total: tasks.length,
        columns: [
          { key: 'name', label: 'Nom' },
          { key: 'project', label: 'Projet' },
          { key: 'dueOn', label: 'Échéance', type: 'date' },
          { key: 'completed', label: 'Fait', type: 'boolean' },
        ],
        actions: ['create', 'complete'],
      },
      { key: 'projects', title: 'Projets', icon: '📂', items: projects, total: projects.length,
        columns: [
          { key: 'name', label: 'Nom' },
        ],
        actions: [],
      },
    ],
    meta: { workspace, projects },
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const h = headers(config.apiKey)

  if (action === 'createTask') {
    const meRes = await fetch(`${BASE}/users/me`, { headers: h })
    const me = await meRes.json()
    const workspace = me.data?.workspaces?.[0]?.gid

    const body = {
      data: {
        name: payload.name || '',
        workspace, assignee: 'me',
        ...(payload.dueOn && { due_on: payload.dueOn }),
        ...(payload.notes && { notes: payload.notes }),
        ...(payload.project && { projects: [payload.project] }),
      },
    }

    const res = await fetch(`${BASE}/tasks`, { method: 'POST', headers: h, body: JSON.stringify(body) })
    if (!res.ok) throw new Error('Impossible de créer la tâche')
    return { ok: true, message: 'Tâche créée dans Asana' }
  }

  if (action === 'completeTask') {
    const res = await fetch(`${BASE}/tasks/${payload.gid}`, {
      method: 'PUT', headers: h,
      body: JSON.stringify({ data: { completed: true } }),
    })
    if (!res.ok) throw new Error('Impossible de terminer la tâche')
    return { ok: true, message: 'Tâche terminée dans Asana' }
  }

  throw new Error('Action non reconnue')
}
