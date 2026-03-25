import { Hono } from 'hono'
import { corsMiddleware, corsHeaders } from './middleware/cors.js'

import auth from './routes/auth.js'
import portfolio from './routes/portfolio.js'
import kpis from './routes/kpis.js'
import tasks from './routes/tasks.js'
import planning from './routes/planning.js'
import wellbeing from './routes/wellbeing.js'
import roadmap from './routes/roadmap.js'
import coach from './routes/coach.js'
import emailStudio from './routes/email-studio.js'
import billing from './routes/billing.js'
import feedback from './routes/feedback.js'
import integrations from './routes/integrations.js'
import oauth from './routes/oauth.js'
import team from './routes/team.js'

const app = new Hono()

// CORS
app.use('*', corsMiddleware())

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'scalyo-api' }))

// Mount all routes
app.route('/api/auth', auth)
app.route('/api/portfolio', portfolio)
app.route('/api/kpis', kpis)
app.route('/api/tasks', tasks)
app.route('/api/planning', planning)
app.route('/api/wellbeing', wellbeing)
app.route('/api/roadmap', roadmap)
app.route('/api/coach', coach)
app.route('/api/email-studio', emailStudio)
app.route('/api/billing', billing)
app.route('/api/feedback', feedback)
app.route('/api/integrations', integrations)
app.route('/api/oauth', oauth)
app.route('/api/team', team)

// 404 fallback
app.notFound((c) => {
  console.error('404 NOT FOUND:', c.req.method, c.req.url, c.req.path)
  return c.json({ error: 'Not found' }, 404)
})

// Error handler — include CORS headers so browser doesn't block the response
app.onError((err, c) => {
  const headers = corsHeaders(c)
  if (err instanceof SyntaxError && err.message?.includes('JSON')) {
    return c.json({ error: 'Invalid JSON request body' }, 400, headers)
  }
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500, headers)
})

export default app
