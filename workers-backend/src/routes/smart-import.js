import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const smartImport = new Hono()
smartImport.use('/*', authMiddleware(), companyRequired(), trialGuard())

/**
 * POST /api/import/smart
 * Receives pre-parsed Excel data from frontend and dispatches to the right modules.
 * Body: { portfolio: [...], kpis: {...}, tasks: [...], roadmap: [...], team: [...] }
 */
smartImport.post('/', async (c) => {
  const user = c.get('user')
  const { company_id } = user
  const db = c.env.DB
  const data = await c.req.json()

  const results = { portfolio: 0, kpis: 0, tasks: 0, roadmap: 0, team: 0, errors: [] }

  // --- 1. Portfolio accounts ---
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

  // --- 2. KPIs ---
  if (data.kpis && typeof data.kpis === 'object') {
    const k = data.kpis
    const period = k.period || new Date().toISOString().slice(0, 7)
    try {
      // Upsert monthly KPIs
      const existing = await db.prepare(
        'SELECT id FROM kpi_data WHERE company_id = ? AND period = ?'
      ).bind(company_id, period).first()

      if (existing) {
        await db.prepare(
          `UPDATE kpi_data SET mrr = ?, churned = ?, nps = ?, csat = ?, renewal_rate = ?, resolved_tickets = ?, updated_at = datetime('now')
           WHERE id = ?`
        ).bind(
          k.mrr ?? 0, k.churned ?? 0, k.nps ?? 0, k.csat ?? 0,
          k.renewal_rate ?? 0, k.resolved_tickets ?? 0, existing.id
        ).run()
      } else {
        await db.prepare(
          `INSERT INTO kpi_data (company_id, period, mrr, churned, nps, csat, renewal_rate, resolved_tickets)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          company_id, period,
          k.mrr ?? 0, k.churned ?? 0, k.nps ?? 0, k.csat ?? 0,
          k.renewal_rate ?? 0, k.resolved_tickets ?? 0
        ).run()
      }
      results.kpis++
    } catch (e) {
      results.errors.push(`KPIs: ${e.message}`)
    }

    // Update company-level KPIs
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

  // --- 3. Tasks ---
  if (data.tasks && Array.isArray(data.tasks)) {
    for (const task of data.tasks) {
      try {
        await db.prepare(
          `INSERT INTO tasks (company_id, user_id, title, note, quadrant, color, status, due, account)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          company_id, user.id,
          task.title || '',
          task.note || '',
          task.quadrant || 'q1',
          task.color || 'teal',
          task.status || 'todo',
          task.due || '',
          task.account || ''
        ).run()
        results.tasks++
      } catch (e) {
        results.errors.push(`Task "${task.title}": ${e.message}`)
      }
    }
  }

  // --- 4. Roadmap ---
  if (data.roadmap && Array.isArray(data.roadmap)) {
    for (const item of data.roadmap) {
      try {
        await db.prepare(
          `INSERT INTO roadmap_items (company_id, phase, title, status, due, progress, owner)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          company_id,
          item.phase || '1',
          item.title || '',
          item.status || 'pending',
          item.due || '',
          item.progress ?? 0,
          item.owner || ''
        ).run()
        results.roadmap++
      } catch (e) {
        results.errors.push(`Roadmap "${item.title}": ${e.message}`)
      }
    }
  }

  return c.json({
    ok: true,
    imported: results,
    total: results.portfolio + results.kpis + results.tasks + results.roadmap,
  })
})

export default smartImport
