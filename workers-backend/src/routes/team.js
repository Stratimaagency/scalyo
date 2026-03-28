import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'
import { hashPassword } from '../utils/password.js'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

async function sendInviteEmail(env, { to, displayName, inviterName, companyName, tempPassword }) {
  const from = env.FROM_EMAIL || 'noreply@scalyo.app'
  const loginUrl = env.APP_URL || 'https://scalyo.app/login'
  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px; font-weight: 900; letter-spacing: -1px;">scal<span style="color: #4DB6A0;">yo</span></span>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Bienvenue sur Scalyo !</h2>
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        ${inviterName} vous a invité(e) à rejoindre <strong>${companyName}</strong> sur Scalyo.
      </p>
      <div style="background: #f4f4f5; border-radius: 10px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #666;">Vos identifiants :</p>
        <p style="margin: 0 0 4px; font-size: 14px;"><strong>Email :</strong> ${to}</p>
        <p style="margin: 0; font-size: 14px;"><strong>Mot de passe temporaire :</strong> ${tempPassword}</p>
      </div>
      <p style="color: #e74c3c; font-size: 13px; font-weight: 600;">Vous devrez changer votre mot de passe à la première connexion.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #4DB6A0; color: #fff; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">Se connecter</a>
      </div>
      <p style="color: #999; font-size: 11px; text-align: center;">Cet email a été envoyé automatiquement par Scalyo.</p>
    </div>
  `
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: 'Scalyo' },
    subject: `${inviterName} vous invite sur Scalyo`,
    content: [{ type: 'text/html', value: body }],
  }

  try {
    if (env.SENDGRID_API_KEY) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.SENDGRID_API_KEY}` },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
  } catch (err) {
    console.error('sendInviteEmail error:', err)
  }
}

// Plan limits
const PLAN_LIMITS = {
  Starter: { managers: 1, csms: 2, accounts: 6 },
  Growth: { managers: 3, csms: -1, accounts: -1 },
  Elite: { managers: 5, csms: -1, accounts: -1 },
}

// GET /api/team — list team members
async function listMembers(c) {
  try {
    const { company_id } = c.get('user')
    const rows = await c.env.DB.prepare(
      'SELECT id, email, display_name, role, created_at FROM users WHERE company_id = ? ORDER BY role ASC, created_at ASC'
    ).bind(company_id).all()

    const companyRow = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(company_id).first()
    const plan = companyRow?.plan || 'Starter'
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter

    return c.json({ members: rows.results || [], limits, plan })
  } catch (err) {
    console.error('GET /team error:', err)
    return c.json({ error: 'Failed to load team' }, 500)
  }
}

// POST /api/team — invite (create) a new team member
async function inviteMember(c) {
  try {
    const user = c.get('user')
    if (user.role !== 'manager') {
      return c.json({ error: 'Only managers can invite team members' }, 403)
    }

    const { email, display_name, role, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    if (!isValidEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }
    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400)
    }

    const validRole = ['manager', 'csm'].includes(role) ? role : 'csm'

    // Check plan limits
    const companyRow = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(user.company_id).first()
    const plan = companyRow?.plan || 'Starter'
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

    // Try with must_change_password first, fallback without if column doesn't exist
    let newUser
    try {
      newUser = await c.env.DB.prepare(
        `INSERT INTO users (email, password_hash, display_name, role, company_id, must_change_password)
         VALUES (?, ?, ?, ?, ?, 1) RETURNING id, email, display_name, role, created_at`
      ).bind(email, passwordHash, display_name || '', validRole, user.company_id).first()
    } catch (dbErr) {
      console.error('INSERT with must_change_password failed, retrying without:', dbErr.message)
      newUser = await c.env.DB.prepare(
        `INSERT INTO users (email, password_hash, display_name, role, company_id)
         VALUES (?, ?, ?, ?, ?) RETURNING id, email, display_name, role, created_at`
      ).bind(email, passwordHash, display_name || '', validRole, user.company_id).first()
    }

    // Create notification preferences (non-blocking)
    try {
      await c.env.DB.prepare('INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)').bind(newUser.id).run()
    } catch (npErr) {
      console.error('notification_preferences insert failed (non-fatal):', npErr.message)
    }

    // Send invitation email (non-blocking)
    try {
      const companyInfo = await c.env.DB.prepare('SELECT name FROM companies WHERE id = ?').bind(user.company_id).first()
      c.executionCtx.waitUntil(sendInviteEmail(c.env, {
        to: email,
        displayName: display_name || email,
        inviterName: user.display_name || user.email,
        companyName: companyInfo?.name || 'votre entreprise',
        tempPassword: password,
      }))
    } catch (emailErr) {
      console.error('sendInviteEmail error (non-fatal):', emailErr.message)
    }

    return c.json(newUser, 201)
  } catch (err) {
    console.error('POST /team error:', err)
    return c.json({ error: 'Failed to create team member' }, 500)
  }
}

// DELETE /api/team/:id — remove a team member
async function removeMember(c) {
  try {
    const user = c.get('user')
    if (user.role !== 'manager') {
      return c.json({ error: 'Only managers can remove team members' }, 403)
    }

    const memberId = parseInt(c.req.param('id'), 10)
    if (isNaN(memberId)) return c.json({ error: 'Invalid member ID' }, 400)
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
}

// GET /api/team/limits — get current plan limits and usage
async function getLimits(c) {
  try {
    const { company_id } = c.get('user')
    const companyRow = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(company_id).first()
    const plan = companyRow?.plan || 'Starter'
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
}

// GET /api/team/:id/accounts — list accounts assigned to a CSM
async function getCsmAccounts(c) {
  try {
    const user = c.get('user')
    if (user.role !== 'manager') {
      return c.json({ error: 'Only managers can view CSM assignments' }, 403)
    }
    const csmId = parseInt(c.req.param('id'), 10)
    if (isNaN(csmId)) return c.json({ error: 'Invalid member ID' }, 400)

    const { results } = await c.env.DB.prepare(
      'SELECT id, name FROM accounts WHERE company_id = ? AND assigned_csm_id = ?'
    ).bind(user.company_id, csmId).all()

    return c.json({ accounts: results || [] })
  } catch (err) {
    console.error('GET /team/:id/accounts error:', err)
    return c.json({ error: 'Failed to load CSM accounts' }, 500)
  }
}

// PUT /api/team/:id/accounts — set accounts assigned to a CSM (replaces all)
async function setCsmAccounts(c) {
  try {
    const user = c.get('user')
    if (user.role !== 'manager') {
      return c.json({ error: 'Only managers can assign accounts' }, 403)
    }
    const csmId = parseInt(c.req.param('id'), 10)
    if (isNaN(csmId)) return c.json({ error: 'Invalid member ID' }, 400)

    // Verify CSM exists and belongs to company
    const csm = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ? AND company_id = ?'
    ).bind(csmId, user.company_id).first()
    if (!csm) return c.json({ error: 'CSM not found' }, 404)

    const { account_ids } = await c.req.json()
    if (!Array.isArray(account_ids)) {
      return c.json({ error: 'account_ids must be an array' }, 400)
    }

    // Unassign all accounts currently assigned to this CSM
    await c.env.DB.prepare(
      'UPDATE accounts SET assigned_csm_id = NULL WHERE company_id = ? AND assigned_csm_id = ?'
    ).bind(user.company_id, csmId).run()

    // Assign selected accounts
    for (const accId of account_ids) {
      await c.env.DB.prepare(
        'UPDATE accounts SET assigned_csm_id = ? WHERE id = ? AND company_id = ?'
      ).bind(csmId, accId, user.company_id).run()
    }

    return c.json({ assigned: account_ids.length })
  } catch (err) {
    console.error('PUT /team/:id/accounts error:', err)
    return c.json({ error: 'Failed to assign accounts' }, 500)
  }
}

// Register team routes directly on the app (no sub-router)
export function registerTeamRoutes(app) {
  const auth = authMiddleware()
  const company = companyRequired()
  const trial = trialGuard()

  app.get('/api/team', auth, company, trial, listMembers)
  app.get('/api/team/', auth, company, trial, listMembers)
  app.post('/api/team', auth, company, trial, inviteMember)
  app.post('/api/team/', auth, company, trial, inviteMember)
  app.delete('/api/team/:id', auth, company, trial, removeMember)
  app.get('/api/team/limits', auth, company, trial, getLimits)
  app.get('/api/team/:id/accounts', auth, company, trial, getCsmAccounts)
  app.put('/api/team/:id/accounts', auth, company, trial, setCsmAccounts)
}
