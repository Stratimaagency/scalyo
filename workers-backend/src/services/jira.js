// Jira Cloud — Email + API Token
// Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

function getAuth(config) {
  return btoa(`${config.email}:${config.apiKey}`)
}

function getBase(config) {
  return `https://${config.domain}.atlassian.net/rest/api/3`
}

function getHeaders(config) {
  return { Authorization: `Basic ${getAuth(config)}`, Accept: 'application/json', 'Content-Type': 'application/json' }
}

export async function testConnection(config) {
  if (!config.email) throw new Error('Email Atlassian requis')
  if (!config.apiKey) throw new Error("Clé d'accès Atlassian requise")
  if (!config.domain) throw new Error('Sous-domaine Jira requis')

  const res = await fetch(`${getBase(config)}/myself`, { headers: getHeaders(config) })
  if (res.status === 401) throw new Error('Identifiants invalides. Vérifiez votre email, clé et sous-domaine.')
  if (!res.ok) throw new Error(`Erreur Jira (${res.status})`)

  return { ok: true, message: `Jira connecté (${config.domain}.atlassian.net)` }
}

export async function sync(config, env, companyId) {
  if (!config.email || !config.apiKey || !config.domain) throw new Error('Configuration Jira incomplète')

  const h = getHeaders(config)
  const base = getBase(config)
  const results = { issues: 0 }

  const jql = encodeURIComponent('status != Done ORDER BY updated DESC')
  const res = await fetch(
    `${base}/search?jql=${jql}&maxResults=50&fields=summary,status,assignee,priority,updated`,
    { headers: h }
  )
  if (!res.ok) throw new Error(`Impossible de charger les tickets Jira`)
  const data = await res.json()

  const existing = await env.DB.prepare(
    'SELECT id, tasks FROM task_boards WHERE company_id = ?'
  ).bind(companyId).first()

  let currentTasks = []
  if (existing) {
    try { currentTasks = JSON.parse(existing.tasks || '[]') } catch { currentTasks = [] }
  }

  const existingMap = new Map()
  for (const t of currentTasks) {
    if (t.externalId && t.externalId.startsWith('jira_')) existingMap.set(t.externalId, t)
  }

  const newJiraTasks = []
  for (const issue of data.issues || []) {
    const externalId = `jira_${issue.id}`
    const statusName = issue.fields.status?.name || ''
    const isInProgress = statusName.toLowerCase().includes('progress')
    const isDone = statusName.toLowerCase() === 'done'

    let quadrant = 'q2'
    const priority = issue.fields.priority?.name?.toLowerCase() || ''
    if (priority.includes('highest') || priority.includes('critical')) quadrant = 'q1'
    else if (priority.includes('high')) quadrant = 'q1'
    else if (priority.includes('low') || priority.includes('lowest')) quadrant = 'q4'

    newJiraTasks.push({
      id: existingMap.get(externalId)?.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: `[${issue.key}] ${issue.fields.summary}`,
      note: `Jira | ${statusName}`,
      color: isInProgress ? 'teal' : 'orange',
      quadrant, dueDate: '', account: '', done: isDone, externalId,
      createdAt: existingMap.get(externalId)?.createdAt || new Date().toISOString(),
    })
    results.issues++
  }

  const nonJiraTasks = currentTasks.filter(t => !t.externalId || !t.externalId.startsWith('jira_'))
  const mergedTasks = [...nonJiraTasks, ...newJiraTasks]

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

// ─── LIVE DATA ──────────────────────────────────────────
export async function fetchData(config) {
  const h = getHeaders(config)
  const base = getBase(config)

  // Projects
  const projRes = await fetch(`${base}/project/search?maxResults=50`, { headers: h })
  let projects = []
  if (projRes.ok) {
    const projData = await projRes.json()
    projects = (projData.values || []).map(p => ({
      id: p.id, key: p.key, name: p.name, style: p.style || '',
    }))
  }

  // Issues — open ones
  const jql = encodeURIComponent('status != Done ORDER BY updated DESC')
  const issuesRes = await fetch(
    `${base}/search?jql=${jql}&maxResults=100&fields=summary,status,assignee,priority,updated,project,issuetype,created`,
    { headers: h }
  )
  if (!issuesRes.ok) throw new Error(`Impossible de charger les tickets Jira`)
  const issuesData = await issuesRes.json()

  const issues = (issuesData.issues || []).map(i => {
    const f = i.fields || {}
    return {
      id: i.id, key: i.key,
      summary: f.summary || '',
      status: f.status?.name || '',
      statusCategory: f.status?.statusCategory?.key || '',
      priority: f.priority?.name || '',
      assignee: f.assignee?.displayName || 'Non assigné',
      project: f.project?.name || '',
      projectKey: f.project?.key || '',
      type: f.issuetype?.name || '',
      updatedAt: f.updated || '',
      createdAt: f.created || '',
    }
  })

  // Statuses for the projects
  let statuses = []
  if (projects.length > 0) {
    try {
      const stRes = await fetch(`${base}/status`, { headers: h })
      if (stRes.ok) {
        const stData = await stRes.json()
        statuses = stData.map(s => ({ id: s.id, name: s.name, category: s.statusCategory?.key || '' }))
      }
    } catch {}
  }

  return {
    sections: [
      { key: 'issues', title: 'Tickets', icon: '🎫', items: issues, total: issuesData.total || issues.length,
        columns: [
          { key: 'key', label: 'Clé' },
          { key: 'summary', label: 'Résumé' },
          { key: 'status', label: 'Statut' },
          { key: 'priority', label: 'Priorité' },
          { key: 'assignee', label: 'Assigné à' },
          { key: 'project', label: 'Projet' },
          { key: 'type', label: 'Type' },
        ],
        actions: ['create', 'updateStatus'],
      },
      { key: 'projects', title: 'Projets', icon: '📂', items: projects, total: projects.length,
        columns: [
          { key: 'key', label: 'Clé' },
          { key: 'name', label: 'Nom' },
        ],
        actions: [],
      },
    ],
    meta: { statuses, projects },
  }
}

// ─── ACTIONS ────────────────────────────────────────────
export async function performAction(config, action, payload) {
  const h = getHeaders(config)
  const base = getBase(config)

  if (action === 'createIssue') {
    if (!payload.project) throw new Error('Veuillez sélectionner un projet')
    if (!payload.summary) throw new Error('Veuillez entrer un résumé')

    const body = {
      fields: {
        project: { key: payload.project },
        summary: payload.summary,
        issuetype: { name: payload.type || 'Task' },
        ...(payload.description && { description: {
          type: 'doc', version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: payload.description }] }],
        }}),
        ...(payload.priority && { priority: { name: payload.priority } }),
      },
    }

    const res = await fetch(`${base}/issue`, { method: 'POST', headers: h, body: JSON.stringify(body) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.errors ? Object.values(err.errors).join(', ') : `Impossible de créer le ticket`)
    }
    const created = await res.json()
    return { ok: true, message: `Ticket ${created.key} créé` }
  }

  if (action === 'updateStatus') {
    if (!payload.issueId || !payload.transitionId) throw new Error('Veuillez sélectionner un nouveau statut')

    const res = await fetch(`${base}/issue/${payload.issueId}/transitions`, {
      method: 'POST', headers: h,
      body: JSON.stringify({ transition: { id: payload.transitionId } }),
    })
    if (!res.ok) throw new Error(`Impossible de mettre à jour le statut`)
    return { ok: true, message: 'Statut mis à jour' }
  }

  if (action === 'getTransitions') {
    const res = await fetch(`${base}/issue/${payload.issueId}/transitions`, { headers: h })
    if (!res.ok) throw new Error('Impossible de charger les statuts disponibles')
    const data = await res.json()
    return { transitions: (data.transitions || []).map(t => ({ id: t.id, name: t.name })) }
  }

  throw new Error('Action non reconnue')
}
