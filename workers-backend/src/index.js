import { Hono } from 'hono'
import { corsMiddleware, corsHeaders } from './middleware/cors.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'

import auth from './routes/auth.js'
import portfolio from './routes/portfolio.js'
import kpis from './routes/kpis.js'
import tasks from './routes/tasks.js'
import planning from './routes/planning.js'
import { registerWellbeingRoutes } from './routes/wellbeing.js'
import roadmap from './routes/roadmap.js'
import coach from './routes/coach.js'
import emailStudio from './routes/email-studio.js'
import billing from './routes/billing.js'
import feedback from './routes/feedback.js'
import integrations from './routes/integrations.js'
import oauth from './routes/oauth.js'
import { registerTeamRoutes } from './routes/team.js'

const app = new Hono()

// CORS
app.use('*', corsMiddleware())

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'scalyo-api' }))

// Rate limiting on sensitive routes (10 req/min for auth, 20 for coach)
app.use('/api/auth/login/*', rateLimitMiddleware({ maxRequests: 10, windowMs: 60000 }))
app.use('/api/auth/register/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/coach/*', rateLimitMiddleware({ maxRequests: 20, windowMs: 60000 }))

// Mount all routes
app.route('/api/auth', auth)
app.route('/api/portfolio', portfolio)
app.route('/api/kpis', kpis)
app.route('/api/tasks', tasks)
app.route('/api/planning', planning)
registerWellbeingRoutes(app)
app.route('/api/roadmap', roadmap)
app.route('/api/coach', coach)
app.route('/api/email-studio', emailStudio)
app.route('/api/billing', billing)
app.route('/api/feedback', feedback)
app.route('/api/integrations', integrations)
app.route('/api/oauth', oauth)
registerTeamRoutes(app)

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found', path: c.req.path, method: c.req.method }, 404))

// Error handler — include CORS headers so browser doesn't block the response
app.onError(async (err, c) => {
  const headers = corsHeaders(c)
  if (err instanceof SyntaxError && err.message?.includes('JSON')) {
    return c.json({ error: 'Invalid JSON request body' }, 400, headers)
  }
  console.error('Unhandled error:', err)
  // Log to D1 for monitoring
  try {
    await c.env.DB.prepare(
      'INSERT INTO error_log (path, method, status, message) VALUES (?, ?, 500, ?)'
    ).bind(c.req.path, c.req.method, (err.message || 'Unknown error').slice(0, 500)).run()
  } catch {}
  return c.json({ error: 'Internal server error' }, 500, headers)
})

export default app
