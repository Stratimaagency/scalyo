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
