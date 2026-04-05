import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const router = new Hono()
router.use('*', authMiddleware(), companyRequired(), trialGuard())

// GET /health-history/:accountId — Get health score history
router.get('/:accountId', async (c) => {
  try {
    const { company_id } = c.get('user')
    const accountId = c.req.param('accountId')
    const db = c.env.DB

    // Validate account belongs to company
    const account = await db.prepare(
      'SELECT id FROM accounts WHERE id = ? AND company_id = ?'
    ).bind(accountId, company_id).first()
    if (!account) return c.json({ error: 'Account not found' }, 404)

    const from = c.req.query('from')
    const to = c.req.query('to')
    const limit = parseInt(c.req.query('limit')) || 90

    let query = 'SELECT id, score, previous_score, recorded_at, notes, source FROM health_score_history WHERE account_id = ?'
    const params = [accountId]

    if (from) {
      query += ' AND recorded_at >= ?'
      params.push(from)
    }
    if (to) {
      query += ' AND recorded_at <= ?'
      params.push(to)
    }

    query += ' ORDER BY recorded_at DESC LIMIT ?'
    params.push(limit)

    const { results } = await db.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (err) {
    console.error('GET /health-history/:accountId error:', err.message)
    return c.json({ error: 'Failed to fetch health history' }, 500)
  }
})

// GET /health-history/:accountId/trend — Trend analysis
router.get('/:accountId/trend', async (c) => {
  try {
    const { company_id } = c.get('user')
    const accountId = c.req.param('accountId')
    const db = c.env.DB

    // Validate account belongs to company
    const account = await db.prepare(
      'SELECT id, health FROM accounts WHERE id = ? AND company_id = ?'
    ).bind(accountId, company_id).first()
    if (!account) return c.json({ error: 'Account not found' }, 404)

    // Last 30 days average
    const recent = await db.prepare(
      "SELECT AVG(score) as avg_score FROM health_score_history WHERE account_id = ? AND recorded_at >= datetime('now', '-30 days')"
    ).bind(accountId).first()

    // Previous 30 days average (30-60 days ago)
    const previous = await db.prepare(
      "SELECT AVG(score) as avg_score FROM health_score_history WHERE account_id = ? AND recorded_at >= datetime('now', '-60 days') AND recorded_at < datetime('now', '-30 days')"
    ).bind(accountId).first()

    const current = Math.round((recent?.avg_score ?? account.health) * 100) / 100
    const previous_avg = Math.round((previous?.avg_score ?? current) * 100) / 100

    let change_pct = 0
    if (previous_avg > 0) {
      change_pct = Math.round(((current - previous_avg) / previous_avg) * 10000) / 100
    }

    let trend = 'stable'
    if (change_pct > 2) trend = 'up'
    else if (change_pct < -2) trend = 'down'

    return c.json({ current, previous_avg, change_pct, trend })
  } catch (err) {
    console.error('GET /health-history/:accountId/trend error:', err.message)
    return c.json({ error: 'Failed to compute trend' }, 500)
  }
})

// POST /health-history/:accountId — Record new health score
router.post('/:accountId', async (c) => {
  try {
    const user = c.get('user')
    const { company_id } = user
    const accountId = c.req.param('accountId')
    const db = c.env.DB

    // Validate account belongs to company
    const account = await db.prepare(
      'SELECT id, health FROM accounts WHERE id = ? AND company_id = ?'
    ).bind(accountId, company_id).first()
    if (!account) return c.json({ error: 'Account not found' }, 404)

    const data = await c.req.json()

    if (data.score === undefined || data.score === null) {
      return c.json({ error: 'score is required' }, 400)
    }

    const score = parseFloat(data.score)
    if (isNaN(score) || score < 0 || score > 100) {
      return c.json({ error: 'score must be between 0 and 100' }, 400)
    }

    const previousScore = account.health ?? null

    // Insert history entry
    const entry = await db.prepare(
      `INSERT INTO health_score_history (account_id, company_id, score, previous_score, notes, source, recorded_at)
       VALUES (?, ?, ?, ?, ?, 'manual', datetime('now')) RETURNING *`
    ).bind(
      accountId,
      company_id,
      score,
      previousScore,
      data.notes || null
    ).first()

    // Update account health
    await db.prepare(
      "UPDATE accounts SET health = ?, updated_at = datetime('now') WHERE id = ? AND company_id = ?"
    ).bind(score, accountId, company_id).run()

    // Create notification if score dropped below 40
    if (score < 40 && (previousScore === null || previousScore >= 40)) {
      await db.prepare(
        `INSERT INTO notifications (user_id, company_id, type, title, message, created_at)
         VALUES (?, ?, 'health_alert', ?, ?, datetime('now'))`
      ).bind(
        user.id,
        company_id,
        'Health score critical',
        `Account health dropped to ${score} (was ${previousScore ?? 'N/A'})`
      ).run()
    }

    return c.json(entry, 201)
  } catch (err) {
    console.error('POST /health-history/:accountId error:', err.message)
    return c.json({ error: 'Failed to record health score' }, 500)
  }
})

export default router
