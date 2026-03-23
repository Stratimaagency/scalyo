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

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler — include CORS headers so browser doesn't block the response
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  const headers = corsHeaders(c)
  return c.json({ error: 'Internal server error' }, 500, headers)
})

export default app
