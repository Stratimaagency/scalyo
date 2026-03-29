import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const smartImport = new Hono()
smartImport.use('/*', authMiddleware(), companyRequired(), trialGuard())

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

const ANALYZE_PROMPT = `You are a data mapping assistant for a Customer Success Management platform called Scalyo.

Given Excel sheet data (headers + sample rows), map each sheet to ONE of these Scalyo modules:
- "portfolio": client/account data (name, ARR/MRR/revenue, health score, risk level, CSM, industry, contact, email, renewal date, notes)
- "kpis": KPI metrics (MRR, NPS, churn rate, CSAT, renewal rate, total ARR)
- "tasks": action items (title, note, due date, account, priority)
- "roadmap": project phases (title, phase, status, due date, progress, owner)
- "team": team/CSM data (name, seniority, managed revenue, client count, health score, churn rate)
- "skip": decorative/summary data that shouldn't be imported

For each sheet, return:
1. The module it maps to
2. A column mapping: which Excel column → which Scalyo field
3. Any rows to skip (headers, totals, empty rows)

IMPORTANT RULES:
- Column names can be in ANY language (French, English, Korean, etc.)
- "CA" means "Chiffre d'Affaires" (revenue) in French
- "H.Score" means Health Score
- Health scores on 0-10 scale should be multiplied by 10
- If a sheet has both team data AND KPI summaries, map it as "team"
- Skip rows that are clearly totals, averages, or section headers
- Currency symbols (€, $, ₩) should be stripped from numbers

Return ONLY valid JSON in this exact format:
{
  "sheets": [
    {
      "name": "Sheet Name",
      "module": "portfolio|kpis|tasks|roadmap|team|skip",
      "confidence": 0.95,
      "columns": {
        "Excel Column Name": "scalyo_field_name",
        ...
      },
      "skipRows": [0, 1],
      "notes": "brief explanation"
    }
  ]
}`

/**
 * POST /api/import/analyze
 * Receives sheet schemas (headers + sample rows) and uses AI to determine mapping
 */
smartImport.post('/analyze', async (c) => {
  const data = await c.req.json()

  if (!data.sheets || !Array.isArray(data.sheets)) {
    return c.json({ error: 'sheets array required' }, 400)
  }

  if (!c.env.DEEPSEEK_API_KEY) {
    return c.json({ error: 'AI service not configured' }, 500)
  }

  // Build the prompt with sheet data
  let sheetsDesc = ''
  for (const sheet of data.sheets) {
    sheetsDesc += `\n--- Sheet: "${sheet.name}" ---\n`
    sheetsDesc += `Headers: ${JSON.stringify(sheet.headers)}\n`
    sheetsDesc += `Sample rows (first 3):\n`
    for (const row of (sheet.sampleRows || []).slice(0, 3)) {
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
        max_tokens: 2048,
        temperature: 0.1,
        messages: [
          { role: 'system', content: ANALYZE_PROMPT },
          { role: 'user', content: `Analyze these Excel sheets and provide column mappings:\n${sheetsDesc}` },
        ],
      }),
    })

    const result = await response.json()
    const text = result.choices?.[0]?.message?.content || ''

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return c.json({ error: 'AI returned invalid mapping', raw: text }, 502)
    }

    const mapping = JSON.parse(jsonMatch[0])
    return c.json(mapping)
  } catch (e) {
    return c.json({ error: `AI analysis failed: ${e.message}` }, 500)
  }
})

/**
 * POST /api/import/execute
 * Receives pre-mapped data and inserts into the database
 * Body: { portfolio: [...], kpis: {...}, tasks: [...], roadmap: [...] }
 */
smartImport.post('/execute', async (c) => {
  const user = c.get('user')
  const { company_id } = user
  const db = c.env.DB
  const data = await c.req.json()

  const results = { portfolio: 0, kpis: 0, tasks: 0, roadmap: 0, errors: [] }
  const validRisks = ['low', 'medium', 'critical']

  // --- 1. Portfolio accounts (batch insert) ---
  if (data.portfolio && Array.isArray(data.portfolio) && data.portfolio.length) {
    const BATCH = 50
    for (let i = 0; i < data.portfolio.length; i += BATCH) {
      const batch = data.portfolio.slice(i, i + BATCH)
      const stmts = batch.map(acc => {
        const risk = validRisks.includes(acc.risk) ? acc.risk : 'low'
        const health = Math.min(100, Math.max(0, parseInt(acc.health) || 70))
        return db.prepare(
          `INSERT INTO accounts (company_id, name, csm, mrr, arr, health, risk, industry, contact, contact_email, notes, renewal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          company_id,
          String(acc.name || '').slice(0, 200),
          String(acc.csm || '').slice(0, 100),
          parseFloat(acc.mrr) || 0,
          parseFloat(acc.arr) || ((parseFloat(acc.mrr) || 0) * 12),
          health, risk,
          String(acc.industry || '').slice(0, 100),
          String(acc.contact || '').slice(0, 100),
          String(acc.contact_email || '').slice(0, 200),
          String(acc.notes || '').slice(0, 1000),
          String(acc.renewal || '').slice(0, 50)
        )
      })
      try {
        await db.batch(stmts)
        results.portfolio += batch.length
      } catch (e) {
        results.errors.push(`Portfolio batch ${i}: ${e.message}`)
      }
    }
  }

  // --- 2. KPIs ---
  if (data.kpis && typeof data.kpis === 'object' && Object.keys(data.kpis).length) {
    const k = data.kpis
    const period = k.period || new Date().toISOString().slice(0, 7)
    try {
      await db.prepare(
        `INSERT INTO kpi_data (company_id, period, kpis, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(company_id, period) DO UPDATE SET
           kpis = excluded.kpis, updated_at = datetime('now')`
      ).bind(company_id, period, JSON.stringify(k)).run()
      results.kpis++
    } catch (e) {
      results.errors.push(`KPIs: ${e.message}`)
    }

    // Update company-level
    try {
      const sets = [], vals = []
      if (k.total_arr) { sets.push('arr = ?'); vals.push(parseFloat(k.total_arr)) }
      if (k.churn_rate) { sets.push('churn = ?'); vals.push(parseFloat(k.churn_rate)) }
      if (k.nps) { sets.push('nps = ?'); vals.push(parseFloat(k.nps)) }
      if (sets.length) {
        sets.push("updated_at = datetime('now')")
        vals.push(company_id)
        await db.prepare(`UPDATE companies SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
      }
    } catch (e) {
      results.errors.push(`Company KPIs: ${e.message}`)
    }
  }

  // --- 3. Tasks (JSON blob in task_boards) ---
  if (data.tasks && Array.isArray(data.tasks) && data.tasks.length) {
    try {
      let board = await db.prepare('SELECT * FROM task_boards WHERE company_id = ?').bind(company_id).first()
      const existing = board ? JSON.parse(board.tasks || '[]') : []
      const now = new Date().toISOString()
      const newTasks = data.tasks.map((t, i) => ({
        id: Date.now() + i,
        title: String(t.title || '').slice(0, 200),
        note: String(t.note || '').slice(0, 500),
        quadrant: t.quadrant || 'q1',
        color: t.color || 'teal',
        status: 'todo',
        due: String(t.due || ''),
        account: String(t.account || ''),
        created: now,
      }))
      await db.prepare(
        `INSERT INTO task_boards (company_id, tasks, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET tasks = excluded.tasks, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...newTasks])).run()
      results.tasks = newTasks.length
    } catch (e) {
      results.errors.push(`Tasks: ${e.message}`)
    }
  }

  // --- 4. Roadmap (JSON blob in roadmap) ---
  if (data.roadmap && Array.isArray(data.roadmap) && data.roadmap.length) {
    try {
      let rm = await db.prepare('SELECT * FROM roadmap WHERE company_id = ?').bind(company_id).first()
      const existing = rm ? JSON.parse(rm.items || '[]') : []
      const newItems = data.roadmap.map((item, i) => ({
        id: Date.now() + i,
        title: String(item.title || '').slice(0, 200),
        phase: String(item.phase || '1'),
        status: item.status || 'pending',
        due: String(item.due || ''),
        progress: parseInt(item.progress) || 0,
        owner: String(item.owner || ''),
      }))
      await db.prepare(
        `INSERT INTO roadmap (company_id, items, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET items = excluded.items, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify([...existing, ...newItems])).run()
      results.roadmap = newItems.length
    } catch (e) {
      results.errors.push(`Roadmap: ${e.message}`)
    }
  }

  return c.json({ ok: true, imported: results, total: results.portfolio + results.kpis + results.tasks + results.roadmap })
})

// Keep old endpoint as alias
smartImport.post('/', async (c) => {
  // Redirect to /execute
  const url = new URL(c.req.url)
  url.pathname = url.pathname.replace(/\/$/, '/execute')
  return c.redirect(url.toString(), 307)
})

export default smartImport
