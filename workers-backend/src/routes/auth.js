import { Hono } from 'hono'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signJwt } from '../utils/jwt.js'
import { authMiddleware, companyRequired, managerRequired } from '../middleware/auth.js'
import { sendEmail } from '../utils/email.js'
import { verificationEmail, verificationSubject, resetPasswordEmail, resetPasswordSubject } from '../utils/email-templates.js'

const auth = new Hono()

// Helper: validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Helper: generate verification token (random hex)
function generateVerificationToken() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

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
    must_change_password: !!user.must_change_password,
    email_verified: !!user.email_verified,
  }
}

// POST /api/auth/register/
auth.post('/register/', async (c) => {
  const { email, password, display_name, company_name, role, plan } = await c.req.json()

  if (!email || !password || !company_name) {
    return c.json({ error: 'email, password and company_name are required' }, 400)
  }
  if (!isValidEmail(email)) {
    return c.json({ error: 'Invalid email format' }, 400)
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

  // Create company with selected plan + trial
  const validPlan = ['Starter', 'Growth', 'Elite'].includes(plan) ? plan : 'Starter'
  const companyResult = await db.prepare(
    "INSERT INTO companies (name, plan, subscription_status) VALUES (?, ?, 'trialing') RETURNING id"
  ).bind(company_name, validPlan).first()

  if (!companyResult) {
    return c.json({ error: 'Failed to create company' }, 500)
  }

  // Create user with verification token
  const passwordHash = await hashPassword(password)
  const validRoles = ['manager', 'csm', 'commercial', 'kam']
  const validRole = validRoles.includes(role) ? role : 'manager'
  const verificationToken = generateVerificationToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h

  const userResult = await db.prepare(
    `INSERT INTO users (email, password_hash, display_name, role, company_id, email_verified, verification_token, verification_expires)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?) RETURNING *`
  ).bind(email, passwordHash, display_name || '', validRole, companyResult.id, verificationToken, expires).first()

  // Create notification preferences
  await db.prepare(
    'INSERT INTO notification_preferences (user_id) VALUES (?)'
  ).bind(userResult.id).run()

  // Send verification email (non-blocking, in user's language)
  const userLang = ['fr', 'en', 'kr'].includes(userResult.language) ? userResult.language : 'fr'
  const frontendUrl = c.env.FRONTEND_URL || 'https://scalyo.app'
  const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/login?verify=${verificationToken}`
  await sendEmail(c.env, {
    to: email,
    subject: verificationSubject(userLang),
    html: verificationEmail(verifyUrl, userLang),
  }).catch(() => {})

  const tokens = await generateTokens(userResult, c.env.JWT_SECRET)

  // Track signup
  try {
    await db.prepare('INSERT INTO analytics (event, user_id, company_id) VALUES (?, ?, ?)').bind('signup', userResult.id, companyResult.id).run()
  } catch {}

  return c.json({ user: serializeUser(userResult), tokens }, 201)
})

// POST /api/auth/login/
auth.post('/login/', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    return c.json({ error: 'email and password are required' }, 400)
  }
  if (!isValidEmail(email)) {
    return c.json({ error: 'Invalid email format' }, 400)
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

  // Track login
  try {
    await c.env.DB.prepare('INSERT INTO analytics (event, user_id, company_id) VALUES (?, ?, ?)').bind('login', user.id, user.company_id).run()
  } catch {}

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


// GET /api/auth/verify/:token — verify email (public)
auth.get('/verify/:token', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ error: 'Invalid verification token' }, 400)
  }

  const db = c.env.DB
  const user = await db.prepare(
    'SELECT id, verification_expires FROM users WHERE verification_token = ? AND email_verified = 0'
  ).bind(token).first()

  if (!user) {
    return c.json({ error: 'Invalid or already used token' }, 400)
  }

  // Check expiry
  if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
    return c.json({ error: 'Token expired. Please request a new verification email.' }, 400)
  }

  await db.prepare(
    "UPDATE users SET email_verified = 1, verification_token = '', verification_expires = '' WHERE id = ?"
  ).bind(user.id).run()

  return c.json({ message: 'Email verified successfully' })
})

// POST /api/auth/forgot-password/ — send reset email (public)
auth.post('/forgot-password/', async (c) => {
  const { email } = await c.req.json()
  if (!email || !isValidEmail(email)) {
    return c.json({ message: 'Si un compte existe, un email a été envoyé.' })
  }

  const db = c.env.DB
  const user = await db.prepare('SELECT id, email, language FROM users WHERE email = ?').bind(email).first()

  // Always return success (don't leak if email exists)
  if (!user) {
    return c.json({ message: 'Si un compte existe, un email a été envoyé.' })
  }

  const token = generateVerificationToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h

  await db.prepare(
    'UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?'
  ).bind(token, expires, user.id).run()

  const forgotLang = ['fr', 'en', 'kr'].includes(user.language) ? user.language : 'fr'
  const frontendUrl = c.env.FRONTEND_URL || 'https://scalyo.app'
  const resetUrl = `${frontendUrl.replace(/\/$/, '')}/login?reset=${token}`
  const sent = await sendEmail(c.env, {
    to: user.email,
    subject: resetPasswordSubject(forgotLang),
    html: resetPasswordEmail(resetUrl, forgotLang),
  })
  if (!sent) console.error('Failed to send reset email to:', user.email)

  return c.json({ message: 'Si un compte existe, un email a été envoyé.' })
})

// POST /api/auth/reset-password/ — reset password with token (public)
auth.post('/reset-password/', async (c) => {
  const { token, password } = await c.req.json()

  if (!token || !password) {
    return c.json({ error: 'Token et mot de passe requis' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Le mot de passe doit faire au moins 8 caractères' }, 400)
  }

  const db = c.env.DB
  const user = await db.prepare(
    'SELECT id, verification_expires FROM users WHERE verification_token = ?'
  ).bind(token).first()

  if (!user) {
    return c.json({ error: 'Lien invalide ou expiré' }, 400)
  }

  if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
    return c.json({ error: 'Lien expiré. Veuillez refaire une demande.' }, 400)
  }

  const newHash = await hashPassword(password)
  await db.prepare(
    "UPDATE users SET password_hash = ?, verification_token = '', verification_expires = '', must_change_password = 0, updated_at = datetime('now') WHERE id = ?"
  ).bind(newHash, user.id).run()

  return c.json({ message: 'Mot de passe modifié avec succès' })
})

// --- Protected routes ---
auth.use('/*', authMiddleware())

// POST /api/auth/resend-verification/ — resend verification email
auth.post('/resend-verification/', async (c) => {
  const { id } = c.get('user')
  const db = c.env.DB
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.email_verified) return c.json({ message: 'Email already verified' })

  const token = generateVerificationToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await db.prepare(
    'UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?'
  ).bind(token, expires, id).run()

  const resendLang = ['fr', 'en', 'kr'].includes(user.language) ? user.language : 'fr'
  const frontendUrl = c.env.FRONTEND_URL || 'https://scalyo.app'
  const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/login?verify=${token}`
  await sendEmail(c.env, {
    to: user.email,
    subject: verificationSubject(resendLang),
    html: verificationEmail(verifyUrl, resendLang),
  })

  return c.json({ message: 'Verification email sent' })
})

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

  // Calculate trial info
  const status = company.subscription_status || 'trialing'
  let trial_days_left = 0
  let trial_expired = false
  if (status === 'trialing' && company.created_at) {
    const created = new Date(company.created_at)
    const now = new Date()
    const daysSince = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    trial_days_left = Math.max(0, 14 - daysSince)
    trial_expired = trial_days_left === 0
  }

  return c.json({ ...company, subscription_status: status, trial_days_left, trial_expired })
})

// PATCH /api/auth/company/ — manager only
auth.patch('/company/', companyRequired(), managerRequired(), async (c) => {
  const { company_id } = c.get('user')
  const data = await c.req.json()
  const allowed = ['name', 'arr', 'churn', 'nps', 'color', 'logo', 'country', 'legal_name', 'registration_number', 'vat_number', 'address', 'city', 'postal_code']
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


// POST /api/auth/change-password/
auth.post('/change-password/', async (c) => {
  const { id } = c.get('user')
  const { current_password, new_password } = await c.req.json()

  if (!new_password || new_password.length < 8) {
    return c.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }, 400)
  }

  const db = c.env.DB
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ error: 'User not found' }, 404)

  // If not forced change, require current password
  if (!user.must_change_password) {
    if (!current_password) {
      return c.json({ error: 'Mot de passe actuel requis' }, 400)
    }
    const valid = await verifyPassword(current_password, user.password_hash)
    if (!valid) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 401)
    }
  }

  const newHash = await hashPassword(new_password)
  const updated = await db.prepare(
    `UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = datetime('now') WHERE id = ? RETURNING *`
  ).bind(newHash, id).first()

  return c.json(serializeUser(updated))
})

export default auth
