import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'
import { hashPassword } from '../utils/password.js'

const team = new Hono()
team.use('/*', authMiddleware(), companyRequired())

// Plan limits
const PLAN_LIMITS = {
  Starter: { managers: 1, csms: 2, accounts: 6 },
  Growth: { managers: 3, csms: -1, accounts: -1 },  // -1 = unlimited
  Elite: { managers: 5, csms: -1, accounts: -1 },
}

// GET /api/team/ — list team members
team.get('/', async (c) => {
  try {
    const { company_id } = c.get('user')
    const rows = await c.env.DB.prepare(
      'SELECT id, email, display_name, role, created_at FROM users WHERE company_id = ? ORDER BY role ASC, created_at ASC'
    ).bind(company_id).all()

    const company = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(company_id).first()
    const plan = company?.plan || 'Starter'
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter

    return c.json({ members: rows.results || [], limits, plan })
  } catch (err) {
    console.error('GET /team error:', err)
    return c.json({ error: 'Failed to load team' }, 500)
  }
})

// POST /api/team/ — invite (create) a new team member
team.post('/', async (c) => {
  try {
    const user = c.get('user')
    if (user.role !== 'manager') {
      return c.json({ error: 'Only managers can invite team members' }, 403)
    }

    const { email, display_name, role, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400)
    }

    const validRole = ['manager', 'csm'].includes(role) ? role : 'csm'

    // Check plan limits
    const company = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(user.company_id).first()
    const plan = company?.plan || 'Starter'
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter

    const counts = await c.env.DB.prepare(
      'SELECT role, COUNT(*) as cnt FROM users WHERE company_id = ? GROUP BY role'
    ).bind(user.company_id).all()

    const countMap = {}
    for (const r of counts.results || []) countMap[r.role] = r.cnt

    if (validRole === 'manager' && limits.managers > 0 && (countMap.manager || 0) >= limits.managers) {
      return c.json({ error: `Plan ${plan} allows max ${limits.managers} manager(s)` }, 400)
    }
    if (validRole === 'csm' && limits.csms > 0 && (countMap.csm || 0) >= limits.csms) {
      return c.json({ error: `Plan ${plan} allows max ${limits.csms} CSM(s)` }, 400)
    }

    // Check email uniqueness
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) {
      return c.json({ error: 'A user with this email already exists' }, 400)
    }

    const passwordHash = await hashPassword(password)
    const newUser = await c.env.DB.prepare(
      `INSERT INTO users (email, password_hash, display_name, role, company_id)
       VALUES (?, ?, ?, ?, ?) RETURNING id, email, display_name, role, created_at`
    ).bind(email, passwordHash, display_name || '', validRole, user.company_id).first()

    // Create notification preferences
    await c.env.DB.prepare('INSERT INTO notification_preferences (user_id) VALUES (?)').bind(newUser.id).run()

    return c.json(newUser, 201)
  } catch (err) {
    console.error('POST /team error:', err)
    return c.json({ error: 'Failed to create team member' }, 500)
  }
})

// DELETE /api/team/:id — remove a team member
team.delete('/:id', async (c) => {
  try {
    const user = c.get('user')
    if (user.role !== 'manager') {
      return c.json({ error: 'Only managers can remove team members' }, 403)
    }

    const memberId = parseInt(c.req.param('id'))
    if (memberId === user.id) {
      return c.json({ error: 'You cannot remove yourself' }, 400)
    }

    const member = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ? AND company_id = ?'
    ).bind(memberId, user.company_id).first()

    if (!member) {
      return c.json({ error: 'Team member not found' }, 404)
    }

    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(memberId).run()

    return c.json({ status: 'removed' })
  } catch (err) {
    console.error('DELETE /team error:', err)
    return c.json({ error: 'Failed to remove team member' }, 500)
  }
})

// GET /api/team/limits — get current plan limits and usage
team.get('/limits', async (c) => {
  try {
    const { company_id } = c.get('user')
    const company = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(company_id).first()
    const plan = company?.plan || 'Starter'
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter

    const counts = await c.env.DB.prepare(
      'SELECT role, COUNT(*) as cnt FROM users WHERE company_id = ? GROUP BY role'
    ).bind(company_id).all()

    const accountCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM accounts WHERE company_id = ?'
    ).bind(company_id).first()

    const usage = { managers: 0, csms: 0, accounts: accountCount?.cnt || 0 }
    for (const r of counts.results || []) {
      if (r.role === 'manager') usage.managers = r.cnt
      if (r.role === 'csm') usage.csms = r.cnt
    }

    return c.json({ plan, limits, usage })
  } catch (err) {
    console.error('GET /team/limits error:', err)
    return c.json({ error: 'Failed to load limits' }, 500)
  }
})

export default team
