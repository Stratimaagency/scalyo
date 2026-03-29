import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const smartImport = new Hono()
smartImport.use('/*', authMiddleware(), companyRequired(), trialGuard())

/**
 * POST /api/import/smart
 * Receives pre-parsed Excel data from frontend and dispatches to the right modules.
 * Body: { portfolio: [...], kpis: {...}, tasks: [...], roadmap: [...] }
 */
smartImport.post('/', async (c) => {
  const user = c.get('user')
  const { company_id } = user
  const db = c.env.DB
  const data = await c.req.json()

  const results = { portfolio: 0, kpis: 0, tasks: 0, roadmap: 0, errors: [] }

  // --- 1. Portfolio accounts (individual rows in accounts table) ---
  if (data.portfolio && Array.isArray(data.portfolio)) {
    for (const acc of data.portfolio) {
      try {
        await db.prepare(
          `INSERT INTO accounts (company_id, name, csm, mrr, arr, health, risk, industry, contact, contact_email, notes, renewal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          company_id,
          acc.name || '',
          acc.csm || '',
          acc.mrr || 0,
          acc.arr || ((acc.mrr || 0) * 12),
          acc.health ?? 70,
          acc.risk || 'low',
          acc.industry || '',
          acc.contact || '',
          acc.contact_email || '',
          acc.notes || '',
          acc.renewal || ''
        ).run()
        results.portfolio++
      } catch (e) {
        results.errors.push(`Portfolio "${acc.name}": ${e.message}`)
      }
    }
  }

  // --- 2. KPIs (stored as JSON in kpi_data.kpis column) ---
  if (data.kpis && typeof data.kpis === 'object') {
    const k = data.kpis
    const period = k.period || new Date().toISOString().slice(0, 7) // YYYY-MM
    const kpisJson = {
      mrr: k.mrr ?? 0,
      churned: k.churned ?? 0,
      nps: k.nps ?? 0,
      csat: k.csat ?? 0,
      renewal_rate: k.renewal_rate ?? 0,
      resolved_tickets: k.resolved_tickets ?? 0,
    }

    try {
      await db.prepare(
        `INSERT INTO kpi_data (company_id, period, kpis, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(company_id, period) DO UPDATE SET
           kpis = excluded.kpis, updated_at = datetime('now')`
      ).bind(company_id, period, JSON.stringify(kpisJson)).run()
      results.kpis++
    } catch (e) {
      results.errors.push(`KPIs: ${e.message}`)
    }

    // Update company-level KPIs (arr, churn, nps on companies table)
    try {
      const sets = []
      const vals = []
      if (k.total_arr !== undefined) { sets.push('arr = ?'); vals.push(k.total_arr) }
      if (k.churn_rate !== undefined) { sets.push('churn = ?'); vals.push(k.churn_rate) }
      if (k.nps !== undefined) { sets.push('nps = ?'); vals.push(k.nps) }
      if (sets.length > 0) {
        sets.push("updated_at = datetime('now')")
        vals.push(company_id)
        await db.prepare(`UPDATE companies SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
      }
    } catch (e) {
      results.errors.push(`Company KPIs: ${e.message}`)
    }
  }

  // --- 3. Tasks (stored as JSON array in task_boards.tasks) ---
  if (data.tasks && Array.isArray(data.tasks) && data.tasks.length) {
    try {
      // Get or create the task board
      let board = await db.prepare(
        'SELECT * FROM task_boards WHERE company_id = ?'
      ).bind(company_id).first()

      let existingTasks = []
      if (board) {
        existingTasks = JSON.parse(board.tasks || '[]')
      }

      // Append new tasks with unique IDs
      const now = new Date().toISOString()
      const newTasks = data.tasks.map((task, i) => ({
        id: Date.now() + i,
        title: task.title || '',
        note: task.note || '',
        quadrant: task.quadrant || 'q1',
        color: task.color || 'teal',
        status: task.status || 'todo',
        due: task.due || '',
        account: task.account || '',
        created: now,
      }))

      const allTasks = [...existingTasks, ...newTasks]

      await db.prepare(
        `INSERT INTO task_boards (company_id, tasks, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET
           tasks = excluded.tasks, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify(allTasks)).run()

      results.tasks = newTasks.length
    } catch (e) {
      results.errors.push(`Tasks: ${e.message}`)
    }
  }

  // --- 4. Roadmap (stored as JSON array in roadmap.items) ---
  if (data.roadmap && Array.isArray(data.roadmap) && data.roadmap.length) {
    try {
      // Get or create roadmap
      let rm = await db.prepare(
        'SELECT * FROM roadmap WHERE company_id = ?'
      ).bind(company_id).first()

      let existingItems = []
      if (rm) {
        existingItems = JSON.parse(rm.items || '[]')
      }

      // Append new items with unique IDs
      const newItems = data.roadmap.map((item, i) => ({
        id: Date.now() + i,
        title: item.title || '',
        phase: item.phase || '1',
        status: item.status || 'pending',
        due: item.due || '',
        progress: item.progress ?? 0,
        owner: item.owner || '',
      }))

      const allItems = [...existingItems, ...newItems]

      await db.prepare(
        `INSERT INTO roadmap (company_id, items, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(company_id) DO UPDATE SET
           items = excluded.items, updated_at = datetime('now')`
      ).bind(company_id, JSON.stringify(allItems)).run()

      results.roadmap = newItems.length
    } catch (e) {
      results.errors.push(`Roadmap: ${e.message}`)
    }
  }

  return c.json({
    ok: true,
    imported: results,
    total: results.portfolio + results.kpis + results.tasks + results.roadmap,
  })
})

export default smartImport
