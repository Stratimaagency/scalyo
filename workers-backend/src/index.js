import { Hono } from 'hono'
import { corsMiddleware, corsHeaders } from './middleware/cors.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { authMiddleware, companyRequired, trialGuard } from './middleware/auth.js'

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
import quotes from './routes/quotes.js'
import smartImport from './routes/smart-import.js'
import { registerIntegrationRoutes } from './routes/integrations.js'
import { registerTeamRoutes } from './routes/team.js'

const app = new Hono()

// CORS
app.use('*', corsMiddleware())

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'scalyo-api' }))

// Rate limiting on sensitive routes
app.use('/api/auth/login/*', rateLimitMiddleware({ maxRequests: 10, windowMs: 60000 }))
app.use('/api/auth/register/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/auth/forgot-password/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/auth/reset-password/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/auth/resend-verification/*', rateLimitMiddleware({ maxRequests: 3, windowMs: 60000 }))
app.use('/api/coach/*', rateLimitMiddleware({ maxRequests: 20, windowMs: 60000 }))

// Auth middleware at app level for ALL protected routes
const protectedPaths = ['/api/kpis', '/api/tasks', '/api/planning', '/api/roadmap', '/api/coach', '/api/email-studio', '/api/feedback', '/api/quotes', '/api/import']
for (const path of protectedPaths) {
  app.use(`${path}/*`, authMiddleware(), companyRequired(), trialGuard())
  app.use(`${path}`, authMiddleware(), companyRequired(), trialGuard())
}

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
app.route('/api/quotes', quotes)
app.route('/api/import/smart', smartImport)
registerIntegrationRoutes(app)
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
