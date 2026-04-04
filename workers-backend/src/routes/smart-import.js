import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const smartImport = new Hono()

// Auth middleware on all routes
smartImport.use('*', authMiddleware(), companyRequired(), trialGuard())

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

const ANALYZE_PROMPT = `Tu es un expert Customer Success senior. Tu analyses des fichiers Excel pour la plateforme Scalyo.

## RÈGLE ABSOLUE
EXTRAIS LE MAXIMUM de chaque feuille. Ne marque JAMAIS "skip" sauf si la feuille est totalement vide ou contient uniquement des graphiques. Une feuille avec des chiffres, des noms, des KPIs = TOUJOURS exploitable.

## MODULES SCALYO

### portfolio — comptes CLIENTS réels (1 ligne = 1 entreprise cliente)
Champs : name (obligatoire), csm, arr, mrr, health (0-100), risk (low/medium/critical), industry, contact, contact_email, notes, renewal
ATTENTION : Ce module est UNIQUEMENT pour des comptes clients (entreprises, sociétés). PAS pour des tâches, sprints, phases de projet, ou actions internes.

### smart_matrice — projets et tâches internes (sprints, phases, actions, livrables)
Champs : project_name (obligatoire), tasks (array de {name, group_name, status, priority})
Utilise ce module quand les lignes représentent des tâches, actions, sprints, phases de projet, fonctionnalités à développer, livrables, etc.

### kpis — indicateurs extraits de tableaux de synthèse/dashboard
Champs : mrr, nps, churn_rate, csat, renewal_rate, total_arr, avg_health, adoption_rate, total_clients, at_risk_revenue

### tasks — tâches générées par TON ANALYSE
Champs : title, note, quadrant (q1=urgent+important, q2=important), color (red/orange/teal), account

### team — données d'équipe CSM (1 ligne = 1 CSM)
Champs : name, seniority, clients, arr, health, critical, risk_count, churn_rate

## CE QUE TU DOIS FAIRE

### 1. MAPPER chaque feuille
- Feuille avec liste de CLIENTS/COMPTES (entreprises, sociétés, contacts commerciaux) → "portfolio"
- Feuille avec des TÂCHES, SPRINTS, PHASES, ACTIONS, LIVRABLES, FONCTIONNALITÉS → "smart_matrice" (PAS portfolio !)
- Feuille avec résumé/dashboard/KPIs globaux → "kpis" (JAMAIS skip)
- Feuille avec profils CSM/équipe → "team" (JAMAIS skip)
- Feuille avec tâches générées par ton analyse → "tasks"

RÈGLE CRITIQUE : Si les noms de lignes ressemblent à des tâches/actions (ex: "Refactoring", "Tests", "Déploiement", "Phase 1", "Sprint 3") → c'est "smart_matrice", PAS "portfolio".

### 2. EXTRAIRE les KPIs depuis TOUTES les feuilles qui contiennent des chiffres
Cherche dans les tableaux de synthèse :
- "Total Clients" / "Nombre de clients" → total_clients
- "CA Total" / "ARR Total" / "Revenue" → total_arr
- "Health Score Moyen" → avg_health (SI sur /10, multiplier par 10)
- "NPS Moyen" / "NPS" → nps
- "Churn" / "Taux de churn" → churn_rate
- "CA à Risque" → at_risk_revenue
- "Taux Adoption" → adoption_rate
- "CSAT" → csat

### 3. ANALYSER les données et GÉNÉRER des tâches pertinentes

Pour chaque CSM avec churn > 35% :
→ Tâche rouge : "⚠️ Review portefeuille [Prénom Nom] — churn [X]% (seuil critique dépassé)"

Pour chaque CSM avec > 50 comptes critiques :
→ Tâche rouge : "🔥 Plan d'action urgent — [Prénom Nom] a [X] comptes critiques"

Pour chaque CSM junior (< 2 ans) avec health < 6/10 :
→ Tâche orange : "🎯 Coaching [Prénom Nom] — junior avec health [X]/10, accompagnement nécessaire"

Si NPS < 30 :
→ Tâche orange : "📊 Plan d'amélioration NPS — score actuel [X] (objectif > 40)"

Si CA à risque > 30% du CA total :
→ Tâche rouge : "💰 [X]€ de CA à risque churn — plan de rétention prioritaire"

Si health moyen < 6/10 :
→ Tâche orange : "📉 Health score global bas ([X]/10) — revoir les critères et actions"

### 4. RÉSUMÉ
Écris 2-3 phrases qui résument la situation : forces, faiblesses, actions prioritaires.

## FORMAT DE SORTIE — JSON STRICT
{
  "sheets": [
    {
      "name": "...",
      "module": "portfolio|smart_matrice|kpis|team|tasks|skip",
      "confidence": 0.99,
      "columns": { "Colonne Excel": "champ_scalyo" },
      "notes": "..."
    }
  ],
  "computed_kpis": {
    "total_arr": 20000000,
    "total_clients": 1230,
    "avg_health": 56,
    "nps": 30,
    "churn_rate": 45,
    "at_risk_revenue": 8007582,
    "adoption_rate": 55.1
  },
  "generated_tasks": [
    { "title": "...", "note": "...", "quadrant": "q1", "color": "red", "account": "" }
  ],
  "summary": "..."
}`

/**
 * POST /api/import/analyze
 * Sends sheet schemas + MORE data to AI for deep analysis
 */
smartImport.post('/analyze', async (c) => {
  const data = await c.req.json()
  if (!data.sheets || !Array.isArray(data.sheets)) return c.json({ error: 'sheets array required' }, 400)
  if (!c.env.DEEPSEEK_API_KEY) return c.json({ error: 'AI service not configured' }, 500)

  // Send up to 10 sample rows per sheet for better analysis
  let sheetsDesc = ''
  for (const sheet of data.sheets) {
    sheetsDesc += `\n=== Feuille: "${sheet.name}" (${sheet.totalRows} lignes) ===\n`
    sheetsDesc += `Colonnes: ${JSON.stringify(sheet.headers)}\n`
    sheetsDesc += `Données (échantillon):\n`
    for (const row of (sheet.sampleRows || []).slice(0, 10)) {
      sheetsDesc += `  ${JSON.stringify(row)}\n`
    }
  }

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 4096,
        temperature: 0.1,
        messages: [
          { role: 'system', content: ANALYZE_PROMPT },
          { role: 'user', content: `Analyse ce fichier Excel et génère les mappings + tâches + KPIs :\n${sheetsDesc}` },
        ],
      }),
    })

    const result = await response.json()
    const text = result.choices?.[0]?.message?.content || ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return c.json({ error: 'AI returned invalid response', raw: text.slice(0, 500) }, 502)

    const mapping = JSON.parse(jsonMatch[0])
    return c.json(mapping)
  } catch (e) {
    return c.json({ error: `AI analysis failed: ${e.message}` }, 500)
  }
})

/**
 * POST /api/import/execute
 * Batch insert mapped data into Scalyo
 */
smartImport.post('/execute', async (c) => {
  const user = c.get('user')
  const { company_id } = user
  const db = c.env.DB
  const data = await c.req.json()
  const results = { portfolio: 0, smart_matrice: 0, kpis: 0, tasks: 0, roadmap: 0, errors: [] }
  const validRisks = ['low', 'medium', 'critical']

  // --- Portfolio (batch of 50) ---
  if (data.portfolio?.length) {
    const BATCH = 50
    for (let i = 0; i < data.portfolio.length; i += BATCH) {
      const batch = data.portfolio.slice(i, i + BATCH)
      const stmts = batch.map(acc => {
        const risk = validRisks.includes(acc.risk) ? acc.risk : 'low'
        const health = Math.min(100, Math.max(0, parseInt(acc.health) || 70))
        return db.prepare(
          `INSERT INTO accounts (company_id, name, csm, mrr, arr, health, risk, industry, contact, contact_email, notes, renewal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(company_id,
          String(acc.name || '').slice(0, 200), String(acc.csm || '').slice(0, 100),
          parseFloat(acc.mrr) || 0, parseFloat(acc.arr) || ((parseFloat(acc.mrr) || 0) * 12),
          health, risk,
          String(acc.industry || '').slice(0, 100), String(acc.contact || '').slice(0, 100),
          String(acc.contact_email || '').slice(0, 200), String(acc.notes || '').slice(0, 1000),
          String(acc.renewal || '').slice(0, 50))
      })
      try { await db.batch(stmts); results.portfolio += batch.length }
      catch (e) { results.errors.push(`Portfolio batch ${i}: ${e.message}`) }
    }
  }

  // --- Smart Matrice (projects + tasks) ---
  if (data.smart_matrice?.length) {
    // Group tasks by project_name
    const projectMap = {}
    for (const item of data.smart_matrice) {
      const projName = item.project_name || item.name || 'Projet importé'
      if (!projectMap[projName]) projectMap[projName] = []
      if (item.tasks && Array.isArray(item.tasks)) {
        projectMap[projName].push(...item.tasks)
      } else {
        // Each row is a task itself
        projectMap[projName].push({
          name: item.task_name || item.name || projName,
          group_name: item.group_name || item.phase || item.category || '',
          status: item.status === 'done' || item.status === 'completed' ? 'done' : item.status === 'doing' || item.status === 'in_progress' ? 'doing' : 'todo',
          priority: item.priority || 'medium',
        })
      }
    }

    for (const [projName, tasks] of Object.entries(projectMap)) {
      try {
        // Create project
        const project = await db.prepare(
          `INSERT INTO sm_projects (company_id, name, description, emoji, status, color, sort_order)
           VALUES (?, ?, ?, ?, 'active', ?, 0) RETURNING id`
        ).bind(company_id, projName.slice(0, 200), '', '📋', '#4285F4').first()

        if (project) {
          // Create tasks
          const taskStmts = tasks.map((t, i) => db.prepare(
            `INSERT INTO sm_tasks (project_id, company_id, name, group_name, status, priority, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(project.id, company_id,
            String(t.name || '').slice(0, 200),
            String(t.group_name || '').slice(0, 100),
            t.status || 'todo',
            t.priority || 'medium',
            i))
          if (taskStmts.length) {
            const BATCH = 50
            for (let i = 0; i < taskStmts.length; i += BATCH) {
              await db.batch(taskStmts.slice(i, i + BATCH))
            }
          }
          results.smart_matrice += 1 + tasks.length
        }
      } catch (e) { results.errors.push(`SM project "${projName}": ${e.message}`) }
    }
  }

  // --- KPIs (JSON blob) ---
  if (data.kpis && Object.keys(data.kpis).length) {
    const period = data.kpis.period || new Date().toISOString().slice(0, 7)
    try {
      await db.prepare(
        `INSERT INTO kpi_data (company_id, period, kpis, updated_at) VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(company_id, period) DO UPDATE SET kpis = excluded.kpis, updated_at = datetime('now')`
      ).bind(company_id, period, JSON.stringify(data.kpis)).run()
      results.kpis++
      // Update company-level KPIs
      const sets = [], vals = []
      if (data.kpis.total_arr) { sets.push('arr = ?'); vals.push(parseFloat(data.kpis.total_arr)) }
      if (data.kpis.churn_rate) { sets.push('churn = ?'); vals.push(parseFloat(data.kpis.churn_rate)) }
      if (data.kpis.nps) { sets.push('nps = ?'); vals.push(parseFloat(data.kpis.nps)) }
      if (sets.length) { sets.push("updated_at = datetime('now')"); vals.push(company_id); await db.prepare(`UPDATE companies SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run() }
    } catch (e) { results.errors.push(`KPIs: ${e.message}`) }
  }

  // --- Tasks (JSON blob in task_boards — match TaskBoardView field names) ---
  if (data.tasks?.length) {
    try {
      const board = await db.prepare('SELECT * FROM task_boards WHERE company_id = ?').bind(company_id).first()
      const existing = board ? JSON.parse(board.tasks || '[]') : []
      const now = new Date().toISOString()
      const newTasks = data.tasks.map((t, i) => ({
        id: (Date.now() + i).toString(),
        title: String(t.title || '').slice(0, 200),
        note: String(t.note || '').slice(0, 500),
        quadrant: t.quadrant || 'q1',
        color: t.color || 'teal',
        done: false,
        dueDate: String(t.due || t.dueDate || ''),
        account: String(t.account || ''),
        createdAt: now,
      }))
      await db.prepare(
        `INSERT INTO task_boards (company_id, tasks, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET tasks = excluded.tasks, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...newTasks])).run()
      results.tasks = newTasks.length
    } catch (e) { results.errors.push(`Tasks: ${e.message}`) }
  }

  // --- Roadmap (JSON blob — match RoadmapView field names) ---
  if (data.roadmap?.length) {
    try {
      const rm = await db.prepare('SELECT * FROM roadmap WHERE company_id = ?').bind(company_id).first()
      const existing = rm ? JSON.parse(rm.items || '[]') : []
      const newItems = data.roadmap.map((item, i) => ({
        id: 'r_' + (Date.now() + i),
        label: String(item.title || item.label || '').slice(0, 200),
        phase: String(item.phase || '1'),
        done: item.status === 'done' || item.status === 'completed' || false,
        due: String(item.due || ''),
        prio: item.prio || (item.progress > 70 ? 'low' : item.progress > 30 ? 'medium' : 'high'),
      }))
      await db.prepare(
        `INSERT INTO roadmap (company_id, items, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET items = excluded.items, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...newItems])).run()
      results.roadmap = newItems.length
    } catch (e) { results.errors.push(`Roadmap: ${e.message}`) }
  }

  // --- Planning events (JSON blob in calendar_events) ---
  if (data.events?.length) {
    try {
      let cal = await db.prepare('SELECT * FROM calendar_events WHERE company_id = ?').bind(company_id).first()
      const existing = cal ? JSON.parse(cal.events || '[]') : []
      await db.prepare(
        `INSERT INTO calendar_events (company_id, events, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET events = excluded.events, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...data.events])).run()
      results.events = data.events.length
    } catch (e) { results.errors.push(`Events: ${e.message}`) }
  }

  return c.json({ ok: true, imported: results, total: results.portfolio + results.smart_matrice + results.kpis + results.tasks + results.roadmap + (results.events || 0) })
})

export default smartImport
