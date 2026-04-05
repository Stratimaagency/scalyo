import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const router = new Hono()
router.use('/*', authMiddleware(), companyRequired(), trialGuard())

// GET /alerts — List alerts for company
router.get('/', async (c) => {
  try {
    const { company_id } = c.get('user')
    const db = c.env.DB

    const status = c.req.query('status')
    const account_id = c.req.query('account_id')
    const severity = c.req.query('severity')

    let query = 'SELECT * FROM alerts WHERE company_id = ?'
    const params = [company_id]

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    if (account_id) {
      query += ' AND account_id = ?'
      params.push(account_id)
    }
    if (severity) {
      query += ' AND severity = ?'
      params.push(severity)
    }

    query += ' ORDER BY triggered_at DESC LIMIT 100'

    const { results } = await db.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (err) {
    console.error('GET /alerts error:', err.message)
    return c.json({ error: 'Failed to fetch alerts' }, 500)
  }
})

// GET /alerts/rules — List alert rules for company
router.get('/rules', async (c) => {
  try {
    const { company_id } = c.get('user')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM alert_rules WHERE company_id = ? ORDER BY created_at DESC'
    ).bind(company_id).all()
    return c.json(results)
  } catch (err) {
    console.error('GET /alerts/rules error:', err.message)
    return c.json({ error: 'Failed to fetch alert rules' }, 500)
  }
})

// POST /alerts/rules — Create alert rule
router.post('/rules', async (c) => {
  try {
    const { company_id } = c.get('user')
    const data = await c.req.json()

    if (!data.name || !data.name.trim()) {
      return c.json({ error: 'name is required' }, 400)
    }
    if (!data.metric) {
      return c.json({ error: 'metric is required' }, 400)
    }

    const validOperators = ['lt', 'gt', 'lte', 'gte', 'eq']
    if (!data.operator || !validOperators.includes(data.operator)) {
      return c.json({ error: 'operator must be one of: lt, gt, lte, gte, eq' }, 400)
    }

    if (data.threshold === undefined || data.threshold === null) {
      return c.json({ error: 'threshold is required' }, 400)
    }

    const validSeverities = ['critical', 'warning', 'info']
    if (!data.severity || !validSeverities.includes(data.severity)) {
      return c.json({ error: 'severity must be one of: critical, warning, info' }, 400)
    }

    const rule = await c.env.DB.prepare(
      `INSERT INTO alert_rules (company_id, name, metric, operator, threshold, severity, notify_email, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now')) RETURNING *`
    ).bind(
      company_id,
      data.name.trim(),
      data.metric,
      data.operator,
      data.threshold,
      data.severity,
      data.notify_email ? 1 : 0
    ).first()

    return c.json(rule, 201)
  } catch (err) {
    console.error('POST /alerts/rules error:', err.message)
    return c.json({ error: 'Failed to create alert rule' }, 500)
  }
})

// PUT /alerts/rules/:id — Update alert rule
router.put('/rules/:id', async (c) => {
  try {
    const { company_id } = c.get('user')
    const id = c.req.param('id')
    const data = await c.req.json()

    const existing = await c.env.DB.prepare(
      'SELECT id FROM alert_rules WHERE id = ? AND company_id = ?'
    ).bind(id, company_id).first()
    if (!existing) return c.json({ error: 'Not found' }, 404)

    const allowed = ['name', 'metric', 'operator', 'threshold', 'severity', 'active']
    const sets = []
    const values = []

    for (const key of allowed) {
      if (data[key] !== undefined) {
        sets.push(`${key} = ?`)
        values.push(data[key])
      }
    }

    if (data.notify_email !== undefined) {
      sets.push('notify_email = ?')
      values.push(data.notify_email ? 1 : 0)
    }

    if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

    values.push(id, company_id)

    const rule = await c.env.DB.prepare(
      `UPDATE alert_rules SET ${sets.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`
    ).bind(...values).first()

    return c.json(rule)
  } catch (err) {
    console.error('PUT /alerts/rules/:id error:', err.message)
    return c.json({ error: 'Failed to update alert rule' }, 500)
  }
})

// DELETE /alerts/rules/:id — Delete alert rule
router.delete('/rules/:id', async (c) => {
  try {
    const { company_id } = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(
      'DELETE FROM alert_rules WHERE id = ? AND company_id = ?'
    ).bind(id, company_id).run()

    if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
    return c.body(null, 204)
  } catch (err) {
    console.error('DELETE /alerts/rules/:id error:', err.message)
    return c.json({ error: 'Failed to delete alert rule' }, 500)
  }
})

// PUT /alerts/:id/resolve — Resolve an alert
router.put('/:id/resolve', async (c) => {
  try {
    const user = c.get('user')
    const { company_id } = user
    const id = c.req.param('id')

    const alert = await c.env.DB.prepare(
      `UPDATE alerts SET status = 'resolved', resolved_at = datetime('now'), resolved_by = ?
       WHERE id = ? AND company_id = ? AND status = 'open' RETURNING *`
    ).bind(user.id, id, company_id).first()

    if (!alert) return c.json({ error: 'Not found or already resolved' }, 404)
    return c.json(alert)
  } catch (err) {
    console.error('PUT /alerts/:id/resolve error:', err.message)
    return c.json({ error: 'Failed to resolve alert' }, 500)
  }
})

// POST /alerts/check — Manual alert check
router.post('/check', async (c) => {
  try {
    const user = c.get('user')
    const { company_id } = user
    const db = c.env.DB

    // Get all active rules for company
    const { results: rules } = await db.prepare(
      'SELECT * FROM alert_rules WHERE company_id = ? AND active = 1'
    ).bind(company_id).all()

    // Get all accounts for company
    const { results: accounts } = await db.prepare(
      'SELECT id, name, health FROM accounts WHERE company_id = ?'
    ).bind(company_id).all()

    let checked = 0
    let created = 0
    let resolved = 0

    for (const rule of rules) {
      for (const account of accounts) {
        checked++
        const value = account[rule.metric]
        if (value === undefined || value === null) continue

        const conditionMet = evaluateCondition(value, rule.operator, rule.threshold)

        // Check if open alert already exists for this account+rule
        const existing = await db.prepare(
          "SELECT id FROM alerts WHERE company_id = ? AND account_id = ? AND rule_id = ? AND status = 'open'"
        ).bind(company_id, account.id, rule.id).first()

        if (conditionMet && !existing) {
          // Create alert
          await db.prepare(
            `INSERT INTO alerts (company_id, account_id, rule_id, severity, status, message, triggered_at)
             VALUES (?, ?, ?, ?, 'open', ?, datetime('now'))`
          ).bind(
            company_id,
            account.id,
            rule.id,
            rule.severity,
            `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.operator} ${rule.threshold})`
          ).run()

          // Create notification
          await db.prepare(
            `INSERT INTO notifications (user_id, company_id, type, title, message, created_at)
             VALUES (?, ?, 'alert', ?, ?, datetime('now'))`
          ).bind(
            user.id,
            company_id,
            `Alert: ${rule.name}`,
            `${account.name}: ${rule.metric} is ${value} (${rule.operator} ${rule.threshold})`
          ).run()

          created++
        } else if (!conditionMet && existing) {
          // Auto-resolve
          await db.prepare(
            `UPDATE alerts SET status = 'resolved', resolved_at = datetime('now'), resolved_by = ?
             WHERE id = ?`
          ).bind(user.id, existing.id).run()
          resolved++
        }
      }
    }

    return c.json({ checked, created, resolved })
  } catch (err) {
    console.error('POST /alerts/check error:', err.message)
    return c.json({ error: 'Failed to check alerts' }, 500)
  }
})

function evaluateCondition(value, operator, threshold) {
  const v = parseFloat(value)
  const t = parseFloat(threshold)
  switch (operator) {
    case 'lt': return v < t
    case 'gt': return v > t
    case 'lte': return v <= t
    case 'gte': return v >= t
    case 'eq': return v === t
    default: return false
  }
}

export default router
