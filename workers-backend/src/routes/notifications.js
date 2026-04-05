import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const router = new Hono()
router.use('*', authMiddleware(), companyRequired(), trialGuard())

// GET /notifications — List notifications for current user
router.get('/', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB

    const read = c.req.query('read')
    const limit = parseInt(c.req.query('limit')) || 20

    let query = 'SELECT * FROM notifications WHERE user_id = ?'
    const params = [user.id]

    if (read === 'true') {
      query += ' AND read_at IS NOT NULL'
    } else if (read === 'false') {
      query += ' AND read_at IS NULL'
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const { results } = await db.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (err) {
    console.error('GET /notifications error:', err.message)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

// GET /notifications/count — Unread count for badge
router.get('/count', async (c) => {
  try {
    const user = c.get('user')

    const row = await c.env.DB.prepare(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND read_at IS NULL'
    ).bind(user.id).first()

    return c.json({ unread: row?.unread || 0 })
  } catch (err) {
    console.error('GET /notifications/count error:', err.message)
    return c.json({ error: 'Failed to fetch notification count' }, 500)
  }
})

// PUT /notifications/read-all — Mark all as read
router.put('/read-all', async (c) => {
  try {
    const user = c.get('user')

    await c.env.DB.prepare(
      "UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL"
    ).bind(user.id).run()

    return c.json({ success: true })
  } catch (err) {
    console.error('PUT /notifications/read-all error:', err.message)
    return c.json({ error: 'Failed to mark notifications as read' }, 500)
  }
})

// PUT /notifications/:id/read — Mark single notification as read
router.put('/:id/read', async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')

    const notification = await c.env.DB.prepare(
      "UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ? RETURNING *"
    ).bind(id, user.id).first()

    if (!notification) return c.json({ error: 'Not found' }, 404)
    return c.json(notification)
  } catch (err) {
    console.error('PUT /notifications/:id/read error:', err.message)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
})

// DELETE /notifications/:id — Delete notification
router.delete('/:id', async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).run()

    if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
    return c.body(null, 204)
  } catch (err) {
    console.error('DELETE /notifications/:id error:', err.message)
    return c.json({ error: 'Failed to delete notification' }, 500)
  }
})

export default router
