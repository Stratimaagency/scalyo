import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const smartImport = new Hono()
smartImport.use('/*', authMiddleware(), companyRequired(), trialGuard())

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

const ANALYZE_PROMPT = `Tu es un expert Customer Success qui analyse des fichiers Excel pour la plateforme Scalyo.

Ton rôle : analyser les données, les mapper intelligemment, ET générer des actions pertinentes.

## MODULES SCALYO

### portfolio (comptes clients)
Champs : name (obligatoire), csm, arr, mrr, health (0-100), risk (low/medium/critical), industry, contact, contact_email, notes, renewal

### kpis (indicateurs)
Champs : mrr, nps, churn_rate, csat, renewal_rate, total_arr, resolved_tickets, avg_health, adoption_rate

### tasks (tâches à créer automatiquement)
Champs : title, note, quadrant (q1=urgent+important, q2=important, q3=urgent, q4=autre), color (red/orange/teal/blue), account, due

### roadmap (étapes)
Champs : title, phase, status (pending/in_progress/done), due, progress (0-100), owner

## TES INSTRUCTIONS

1. **MAPPER** chaque feuille vers le bon module avec les bonnes colonnes
2. **NORMALISER** les données :
   - Health score sur /10 → multiplier par 10
   - "CA" / "Chiffre d'affaires" = ARR
   - Devises (€, $, etc.) → nombres purs
   - Risque : élevé/critique/high → critical, moyen/watch/medium → medium, faible/low/sain → low
3. **ANALYSER** et générer des tâches intelligentes basées sur les patterns :
   - Comptes avec health < 50 → tâche "Appel urgent — [nom du compte] (health: X/100)"
   - CSM avec churn > 40% → tâche "Review portefeuille de [CSM] — churn élevé (X%)"
   - Comptes avec renouvellement < 30 jours → tâche "Préparer renouvellement — [nom]"
   - NPS < 20 → tâche "Plan d'action NPS — score critique"
   - Données sans CSM assigné → tâche "Assigner un CSM aux comptes orphelins"
4. **CALCULER** les KPIs globaux à partir des données portfolio/team :
   - Total ARR = somme des ARR de tous les comptes
   - Health Score Moyen = moyenne des health scores
   - Nombre de comptes critiques
   - Taux de churn moyen si disponible

## FORMAT DE SORTIE

Retourne UNIQUEMENT du JSON valide :
{
  "sheets": [
    {
      "name": "Nom de la feuille",
      "module": "portfolio|kpis|tasks|roadmap|team|skip",
      "confidence": 0.95,
      "columns": { "Colonne Excel": "champ_scalyo", ... },
      "skipRows": [],
      "notes": "explication courte"
    }
  ],
  "generated_tasks": [
    { "title": "...", "note": "...", "quadrant": "q1", "color": "red", "account": "..." }
  ],
  "computed_kpis": {
    "total_arr": 0,
    "avg_health": 0,
    "critical_count": 0,
    "nps": 0,
    "churn_rate": 0
  },
  "summary": "Résumé en 2-3 phrases de l'analyse"
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
  const results = { portfolio: 0, kpis: 0, tasks: 0, roadmap: 0, errors: [] }
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

  // --- Tasks (JSON blob in task_boards) ---
  if (data.tasks?.length) {
    try {
      const board = await db.prepare('SELECT * FROM task_boards WHERE company_id = ?').bind(company_id).first()
      const existing = board ? JSON.parse(board.tasks || '[]') : []
      const now = new Date().toISOString()
      const newTasks = data.tasks.map((t, i) => ({
        id: Date.now() + i, title: String(t.title || '').slice(0, 200),
        note: String(t.note || '').slice(0, 500), quadrant: t.quadrant || 'q1',
        color: t.color || 'teal', status: 'todo', due: String(t.due || ''),
        account: String(t.account || ''), created: now,
      }))
      await db.prepare(
        `INSERT INTO task_boards (company_id, tasks, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET tasks = excluded.tasks, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...newTasks])).run()
      results.tasks = newTasks.length
    } catch (e) { results.errors.push(`Tasks: ${e.message}`) }
  }

  // --- Roadmap (JSON blob) ---
  if (data.roadmap?.length) {
    try {
      const rm = await db.prepare('SELECT * FROM roadmap WHERE company_id = ?').bind(company_id).first()
      const existing = rm ? JSON.parse(rm.items || '[]') : []
      const newItems = data.roadmap.map((item, i) => ({
        id: Date.now() + i, title: String(item.title || '').slice(0, 200),
        phase: String(item.phase || '1'), status: item.status || 'pending',
        due: String(item.due || ''), progress: parseInt(item.progress) || 0,
        owner: String(item.owner || ''),
      }))
      await db.prepare(
        `INSERT INTO roadmap (company_id, items, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET items = excluded.items, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...newItems])).run()
      results.roadmap = newItems.length
    } catch (e) { results.errors.push(`Roadmap: ${e.message}`) }
  }

  return c.json({ ok: true, imported: results, total: results.portfolio + results.kpis + results.tasks + results.roadmap })
})

export default smartImport
