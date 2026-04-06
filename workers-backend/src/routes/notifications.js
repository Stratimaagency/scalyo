import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const P = '/api/notifications'
const mw = [authMiddleware(), companyRequired(), trialGuard()]

export function registerNotificationRoutes(app) {
  app.get(`${P}`, ...mw, listNotifications)
  app.get(`${P}/`, ...mw, listNotifications)
  app.get(`${P}/count`, ...mw, getCount)
  app.get(`${P}/count/`, ...mw, getCount)
  app.put(`${P}/read-all`, ...mw, readAll)
  app.put(`${P}/read-all/`, ...mw, readAll)
  app.put(`${P}/:id/read`, ...mw, readOne)
  app.delete(`${P}/:id`, ...mw, deleteOne)
}

async function listNotifications(c) {
  try {
    const user = c.get('user')
    const read = c.req.query('read')
    const limit = parseInt(c.req.query('limit')) || 20
    let query = 'SELECT * FROM notifications WHERE user_id = ?'
    const params = [user.id]
    if (read === 'true') { query += ' AND read_at IS NOT NULL' }
    else if (read === 'false') { query += ' AND read_at IS NULL' }
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (err) {
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
}

async function getCount(c) {
  try {
    const user = c.get('user')
    const row = await c.env.DB.prepare('SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND read_at IS NULL').bind(user.id).first()
    return c.json({ unread: row?.unread || 0 })
  } catch (err) {
    return c.json({ error: 'Failed to fetch notification count' }, 500)
  }
}

async function readAll(c) {
  try {
    const user = c.get('user')
    await c.env.DB.prepare("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL").bind(user.id).run()
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to mark notifications as read' }, 500)
  }
}

async function readOne(c) {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    const notification = await c.env.DB.prepare("UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ? RETURNING *").bind(id, user.id).first()
    if (!notification) return c.json({ error: 'Not found' }, 404)
    return c.json(notification)
  } catch (err) {
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
}

async function deleteOne(c) {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    const result = await c.env.DB.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').bind(id, user.id).run()
    if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
    return c.body(null, 204)
  } catch (err) {
    return c.json({ error: 'Failed to delete notification' }, 500)
  }
}
