// Jira Cloud — Email + API Token
// Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

export async function testConnection(config) {
  if (!config.email) throw new Error('Email Atlassian requis')
  if (!config.apiKey) throw new Error('Token API Atlassian requis')
  if (!config.domain) throw new Error('Sous-domaine Jira requis')

  const auth = btoa(`${config.email}:${config.apiKey}`)
  const res = await fetch(`https://${config.domain}.atlassian.net/rest/api/3/myself`, {
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
  })

  if (res.status === 401) throw new Error('Identifiants invalides. Verifiez email, token et sous-domaine.')
  if (!res.ok) throw new Error(`Erreur Jira (${res.status})`)

  return { ok: true, message: `Jira connecte (${config.domain}.atlassian.net)` }
}

export async function sync(config, env, companyId) {
  if (!config.email || !config.apiKey || !config.domain) throw new Error('Configuration Jira incomplete')

  const auth = btoa(`${config.email}:${config.apiKey}`)
  const h = { Authorization: `Basic ${auth}`, Accept: 'application/json' }
  const base = `https://${config.domain}.atlassian.net/rest/api/3`
  const results = { issues: 0 }

  // Fetch open issues
  const jql = encodeURIComponent('status != Done ORDER BY updated DESC')
  const res = await fetch(
    `${base}/search?jql=${jql}&maxResults=50&fields=summary,status,assignee,priority,updated`,
    { headers: h }
  )
  if (!res.ok) throw new Error(`Jira issues: erreur ${res.status}`)
  const data = await res.json()

  // Load existing task_boards JSON singleton
  const existing = await env.DB.prepare(
    'SELECT id, tasks FROM task_boards WHERE company_id = ?'
  ).bind(companyId).first()

  let currentTasks = []
  if (existing) {
    try { currentTasks = JSON.parse(existing.tasks || '[]') } catch { currentTasks = [] }
  }

  // Build map of existing Jira tasks
  const existingMap = new Map()
  for (const t of currentTasks) {
    if (t.externalId && t.externalId.startsWith('jira_')) {
      existingMap.set(t.externalId, t)
    }
  }

  // Process Jira issues
  const newJiraTasks = []
  for (const issue of data.issues || []) {
    const externalId = `jira_${issue.id}`
    const statusName = issue.fields.status?.name || ''
    const isInProgress = statusName.toLowerCase().includes('progress')
    const isDone = statusName.toLowerCase() === 'done'

    // Map to Eisenhower quadrant based on priority
    let quadrant = 'q2' // default: schedule it
    const priority = issue.fields.priority?.name?.toLowerCase() || ''
    if (priority.includes('highest') || priority.includes('critical')) quadrant = 'q1'
    else if (priority.includes('high')) quadrant = 'q1'
    else if (priority.includes('low') || priority.includes('lowest')) quadrant = 'q4'

    const task = {
      id: existingMap.get(externalId)?.id || Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: `[${issue.key}] ${issue.fields.summary}`,
      note: `Jira | ${statusName}`,
      color: isInProgress ? 'teal' : 'orange',
      quadrant,
      dueDate: '',
      account: '',
      done: isDone,
      externalId,
      createdAt: existingMap.get(externalId)?.createdAt || new Date().toISOString(),
    }

    newJiraTasks.push(task)
    results.issues++
  }

  // Merge: keep non-Jira tasks, replace Jira ones
  const nonJiraTasks = currentTasks.filter(t => !t.externalId || !t.externalId.startsWith('jira_'))
  const mergedTasks = [...nonJiraTasks, ...newJiraTasks]

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
