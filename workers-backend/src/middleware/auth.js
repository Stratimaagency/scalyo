import { verifyJwt } from '../utils/jwt.js'

/**
 * JWT auth middleware for Hono.
 * Sets c.set('user', { id, email, role, company_id }) on success.
 */
export function authMiddleware() {
  return async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header || !header.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const token = header.slice(7)
    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (!payload) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    c.set('user', {
      id: payload.user_id,
      email: payload.email,
      role: payload.role,
      company_id: payload.company_id,
    })

    await next()
  }
}

/**
 * Requires user to belong to a company.
 */
export function companyRequired() {
  return async (c, next) => {
    const user = c.get('user')
    if (!user?.company_id) {
      return c.json({ error: 'You must belong to a company to access this resource.' }, 403)
    }
    await next()
  }
}

/**
 * Blocks access if trial has expired and no active subscription.
 * Allows: auth, billing, settings routes (so user can still pay/upgrade).
 */
export function trialGuard() {
  return async (c, next) => {
    const user = c.get('user')
    if (!user?.company_id) return await next()

    const company = await c.env.DB.prepare('SELECT subscription_status, created_at FROM companies WHERE id = ?').bind(user.company_id).first()
    if (!company) return await next()

    const status = company.subscription_status || 'trialing'
    // Active or paid subscriptions pass through
    if (status === 'active' || status === 'paid') return await next()

    // Check trial expiry
    if (status === 'trialing' && company.created_at) {
      const created = new Date(company.created_at)
      const now = new Date()
      const daysSince = Math.floor((now - created) / (1000 * 60 * 60 * 24))
      if (daysSince < 14) return await next()
    }

    return c.json({ error: 'trial_expired', message: 'Votre période d\'essai est terminée. Veuillez souscrire un abonnement pour continuer.' }, 403)
  }
}
