import { Hono } from 'hono'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signJwt } from '../utils/jwt.js'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const auth = new Hono()

// Helper: generate tokens
async function generateTokens(user, secret) {
  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
  }
  const access = await signJwt(payload, secret, 43200) // 12h
  const refresh = await signJwt({ ...payload, type: 'refresh' }, secret, 604800) // 7d
  return { access, refresh }
}

// Helper: serialize user
function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    language: user.language,
    theme: user.theme,
    currency: user.currency,
    company: user.company_id,
  }
}

// POST /api/auth/register/
auth.post('/register/', async (c) => {
  const { email, password, display_name, company_name, role } = await c.req.json()

  if (!email || !password || !company_name) {
    return c.json({ error: 'email, password and company_name are required' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }

  const db = c.env.DB

  // Check existing
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) {
    return c.json({ error: 'A user with this email already exists.' }, 400)
  }

  // Create company
  const companyResult = await db.prepare(
    'INSERT INTO companies (name) VALUES (?) RETURNING id'
  ).bind(company_name).first()

  if (!companyResult) {
    return c.json({ error: 'Failed to create company' }, 500)
  }

  // Create user
  const passwordHash = await hashPassword(password)
  const validRole = ['manager', 'csm'].includes(role) ? role : 'csm'
  const userResult = await db.prepare(
    `INSERT INTO users (email, password_hash, display_name, role, company_id)
     VALUES (?, ?, ?, ?, ?) RETURNING *`
  ).bind(email, passwordHash, display_name || '', validRole, companyResult.id).first()

  // Create notification preferences
  await db.prepare(
    'INSERT INTO notification_preferences (user_id) VALUES (?)'
  ).bind(userResult.id).run()

  const tokens = await generateTokens(userResult, c.env.JWT_SECRET)
  return c.json({ user: serializeUser(userResult), tokens }, 201)
})

// POST /api/auth/login/
auth.post('/login/', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    return c.json({ error: 'email and password are required' }, 400)
  }

  const db = c.env.DB
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const tokens = await generateTokens(user, c.env.JWT_SECRET)
  return c.json({ user: serializeUser(user), tokens })
})

// POST /api/auth/token/refresh/
auth.post('/token/refresh/', async (c) => {
  const { refresh } = await c.req.json()
  if (!refresh) return c.json({ error: 'Refresh token required' }, 400)

  const { verifyJwt } = await import('../utils/jwt.js')
  const payload = await verifyJwt(refresh, c.env.JWT_SECRET)
  if (!payload || payload.type !== 'refresh') {
    return c.json({ error: 'Invalid refresh token' }, 401)
  }

  const db = c.env.DB
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(payload.user_id).first()
  if (!user) return c.json({ error: 'User not found' }, 401)

  const tokens = await generateTokens(user, c.env.JWT_SECRET)
  return c.json({ tokens })
})

// --- Protected routes ---
auth.use('/*', authMiddleware())

// GET /api/auth/profile/
auth.get('/profile/', async (c) => {
  const { id } = c.get('user')
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(serializeUser(user))
})

// PATCH /api/auth/profile/
auth.patch('/profile/', async (c) => {
  const { id } = c.get('user')
  const data = await c.req.json()
  const allowed = ['display_name', 'language', 'theme', 'currency']
  const sets = []
  const values = []

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`)
      values.push(data[key])
    }
  }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  sets.push("updated_at = datetime('now')")
  values.push(id)

  const user = await c.env.DB.prepare(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ? RETURNING *`
  ).bind(...values).first()

  return c.json(serializeUser(user))
})

// GET /api/auth/company/
auth.get('/company/', companyRequired(), async (c) => {
  const { company_id } = c.get('user')
  const company = await c.env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(company_id).first()
  return c.json(company)
})

// PATCH /api/auth/company/
auth.patch('/company/', companyRequired(), async (c) => {
  const { company_id } = c.get('user')
  const data = await c.req.json()
  const allowed = ['name', 'arr', 'churn', 'nps', 'color', 'logo']
  const sets = []
  const values = []

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`)
      values.push(data[key])
    }
  }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  sets.push("updated_at = datetime('now')")
  values.push(company_id)

  const company = await c.env.DB.prepare(
    `UPDATE companies SET ${sets.join(', ')} WHERE id = ? RETURNING *`
  ).bind(...values).first()

  return c.json(company)
})

// GET /api/auth/notifications/
auth.get('/notifications/', async (c) => {
  const { id } = c.get('user')
  let prefs = await c.env.DB.prepare(
    'SELECT * FROM notification_preferences WHERE user_id = ?'
  ).bind(id).first()

  if (!prefs) {
    await c.env.DB.prepare('INSERT INTO notification_preferences (user_id) VALUES (?)').bind(id).run()
    prefs = await c.env.DB.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').bind(id).first()
  }

  return c.json({
    churn_alerts: !!prefs.churn_alerts,
    weekly_report: !!prefs.weekly_report,
    wellbeing_alerts: !!prefs.wellbeing_alerts,
    renewal_alerts: !!prefs.renewal_alerts,
  })
})

// PATCH /api/auth/notifications/
auth.patch('/notifications/', async (c) => {
  const { id } = c.get('user')
  const data = await c.req.json()

  // Ensure row exists
  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)'
  ).bind(id).run()

  const allowed = ['churn_alerts', 'weekly_report', 'wellbeing_alerts', 'renewal_alerts']
  const sets = []
  const values = []

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`)
      values.push(data[key] ? 1 : 0)
    }
  }

  if (sets.length > 0) {
    values.push(id)
    await c.env.DB.prepare(
      `UPDATE notification_preferences SET ${sets.join(', ')} WHERE user_id = ?`
    ).bind(...values).run()
  }

  const prefs = await c.env.DB.prepare(
    'SELECT * FROM notification_preferences WHERE user_id = ?'
  ).bind(id).first()

  return c.json({
    churn_alerts: !!prefs.churn_alerts,
    weekly_report: !!prefs.weekly_report,
    wellbeing_alerts: !!prefs.wellbeing_alerts,
    renewal_alerts: !!prefs.renewal_alerts,
  })
})

// DELETE /api/auth/delete-account/
auth.delete('/delete-account/', async (c) => {
  const { id, company_id } = c.get('user')
  const db = c.env.DB

  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

  // Delete company if no users left
  if (company_id) {
    const remaining = await db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ?'
    ).bind(company_id).first()
    if (remaining.count === 0) {
      await db.prepare('DELETE FROM companies WHERE id = ?').bind(company_id).run()
    }
  }

  return c.body(null, 204)
})

// GET /api/auth/stripe-urls/
auth.get('/stripe-urls/', async (c) => {
  return c.json({
    starter: c.env.STRIPE_STARTER_URL || '',
    growth: c.env.STRIPE_GROWTH_URL || '',
    elite: c.env.STRIPE_ELITE_URL || '',
  })
})

export default auth
