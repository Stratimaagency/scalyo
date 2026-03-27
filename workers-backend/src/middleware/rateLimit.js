/**
 * Simple rate limiter using D1.
 * Limits requests per IP per minute on sensitive routes.
 */
export function rateLimitMiddleware({ maxRequests = 30, windowMs = 60000 } = {}) {
  return async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs
    const key = `rate:${ip}`

    try {
      const db = c.env.DB

      // Clean old entries + count recent requests
      await db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run()
      const row = await db.prepare('SELECT count FROM rate_limits WHERE key = ?').bind(key).first()

      if (row && row.count >= maxRequests) {
        return c.json({ error: 'Too many requests. Please try again later.' }, 429)
      }

      if (row) {
        await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run()
      } else {
        await db.prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)').bind(key, now + windowMs).run()
      }
    } catch {
      // If rate limiting fails, allow the request through
    }

    await next()
  }
}
