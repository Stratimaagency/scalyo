import { Hono } from 'hono'
import { corsMiddleware, corsHeaders } from './middleware/cors.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { authMiddleware, companyRequired, trialGuard } from './middleware/auth.js'

import auth from './routes/auth.js'
import portfolio from './routes/portfolio.js'
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
import { registerSmartMatriceRoutes } from './routes/smart-matrice.js'
import modules from './routes/modules.js'
import alerts from './routes/alerts.js'
import notifications from './routes/notifications.js'
import healthHistory from './routes/health-history.js'
import exportsRoutes from './routes/exports.js'

const app = new Hono()

// CORS
app.use('*', corsMiddleware())

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'scalyo-api' }))
app.get('/api/health', (c) => c.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() }))

// Rate limiting on sensitive routes
app.use('/api/auth/login/*', rateLimitMiddleware({ maxRequests: 10, windowMs: 60000 }))
app.use('/api/auth/register/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/auth/forgot-password/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/auth/reset-password/*', rateLimitMiddleware({ maxRequests: 5, windowMs: 60000 }))
app.use('/api/auth/resend-verification/*', rateLimitMiddleware({ maxRequests: 3, windowMs: 60000 }))
app.use('/api/coach/*', rateLimitMiddleware({ maxRequests: 20, windowMs: 60000 }))

// Auth middleware helper
const mw = [authMiddleware(), companyRequired(), trialGuard()]

// Sub-routers
app.route('/api/auth', auth)
app.route('/api/portfolio', portfolio)
registerWellbeingRoutes(app)
app.route('/api/billing', billing)
app.route('/api/import/smart', smartImport)
registerIntegrationRoutes(app)
registerTeamRoutes(app)
registerSmartMatriceRoutes(app)
app.route('/api/modules', modules)
app.route('/api/roadmap', roadmap)
app.route('/api/coach', coach)
app.route('/api/email-studio', emailStudio)
app.route('/api/feedback', feedback)
app.route('/api/quotes', quotes)
app.route('/api/alerts', alerts)
app.route('/api/notifications', notifications)
app.route('/api/health-history', healthHistory)
app.route('/api/exports', exportsRoutes)

// === TASKS (direct mount — Hono sub-router bug workaround) ===
async function handleGetTasks(c) {
  const { company_id } = c.get('user')
  let board = await c.env.DB.prepare('SELECT * FROM task_boards WHERE company_id = ?').bind(company_id).first()
  if (!board) board = await c.env.DB.prepare('INSERT INTO task_boards (company_id) VALUES (?) RETURNING *').bind(company_id).first()
  return c.json({ id: board.id, tasks: JSON.parse(board.tasks || '[]'), updated_at: board.updated_at })
}
async function handleSaveTasks(c) {
  const { company_id } = c.get('user')
  const { tasks: tasksData } = await c.req.json()
  const board = await c.env.DB.prepare(
    `INSERT INTO task_boards (company_id, tasks, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(company_id) DO UPDATE SET tasks = excluded.tasks, updated_at = datetime('now') RETURNING *`
  ).bind(company_id, JSON.stringify(tasksData || [])).first()
  return c.json({ id: board.id, tasks: JSON.parse(board.tasks || '[]'), updated_at: board.updated_at })
}
app.get('/api/tasks', ...mw, handleGetTasks)
app.get('/api/tasks/', ...mw, handleGetTasks)
app.post('/api/tasks/save', ...mw, handleSaveTasks)
app.post('/api/tasks/save/', ...mw, handleSaveTasks)

// === KPIS ===
function parseKpiRow(row) {
  return { id: row.id, period: row.period, kpis: JSON.parse(row.kpis || '{}'), goals: JSON.parse(row.goals || '{}'), custom_kpis: JSON.parse(row.custom_kpis || '[]'), history: JSON.parse(row.history || '{}'), updated_at: row.updated_at }
}
async function handleGetKpis(c) {
  const { company_id } = c.get('user')
  const { results } = await c.env.DB.prepare('SELECT * FROM kpi_data WHERE company_id = ?').bind(company_id).all()
  return c.json(results.map(parseKpiRow))
}
async function handleSaveMonthlyKpis(c) {
  const { company_id } = c.get('user')
  const { period, kpis: kpisData } = await c.req.json()
  if (!period || period.startsWith('__')) return c.json({ error: 'Invalid period' }, 400)
  const row = await c.env.DB.prepare(
    `INSERT INTO kpi_data (company_id, period, kpis, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(company_id, period) DO UPDATE SET kpis = excluded.kpis, updated_at = datetime('now') RETURNING *`
  ).bind(company_id, period, JSON.stringify(kpisData || {})).first()
  return c.json(parseKpiRow(row))
}
async function handleSaveCustomKpis(c) {
  const { company_id } = c.get('user')
  const { custom_kpis, history } = await c.req.json()
  const row = await c.env.DB.prepare(
    `INSERT INTO kpi_data (company_id, period, custom_kpis, history, updated_at) VALUES (?, '__custom__', ?, ?, datetime('now'))
     ON CONFLICT(company_id, period) DO UPDATE SET custom_kpis = excluded.custom_kpis, history = excluded.history, updated_at = datetime('now') RETURNING *`
  ).bind(company_id, JSON.stringify(custom_kpis || []), JSON.stringify(history || {})).first()
  return c.json(parseKpiRow(row))
}
async function handleSaveGoals(c) {
  const { company_id } = c.get('user')
  const { goals } = await c.req.json()
  if (!goals) return c.json({ error: 'goals is required' }, 400)
  const row = await c.env.DB.prepare(
    `INSERT INTO kpi_data (company_id, period, goals, updated_at) VALUES (?, '__goals__', ?, datetime('now'))
     ON CONFLICT(company_id, period) DO UPDATE SET goals = excluded.goals, updated_at = datetime('now') RETURNING *`
  ).bind(company_id, JSON.stringify(goals)).first()
  return c.json(parseKpiRow(row))
}
app.get('/api/kpis', ...mw, handleGetKpis)
app.get('/api/kpis/', ...mw, handleGetKpis)
app.post('/api/kpis/monthly', ...mw, handleSaveMonthlyKpis)
app.post('/api/kpis/monthly/', ...mw, handleSaveMonthlyKpis)
app.post('/api/kpis/custom', ...mw, handleSaveCustomKpis)
app.post('/api/kpis/custom/', ...mw, handleSaveCustomKpis)
app.post('/api/kpis/goals', ...mw, handleSaveGoals)
app.post('/api/kpis/goals/', ...mw, handleSaveGoals)

// === PLANNING ===
async function handleGetPlanning(c) {
  const { company_id } = c.get('user')
  let cal = await c.env.DB.prepare('SELECT * FROM calendar_events WHERE company_id = ?').bind(company_id).first()
  if (!cal) cal = await c.env.DB.prepare('INSERT INTO calendar_events (company_id) VALUES (?) RETURNING *').bind(company_id).first()
  return c.json({ id: cal.id, events: JSON.parse(cal.events || '[]'), updated_at: cal.updated_at })
}
async function handleSavePlanning(c) {
  const { company_id } = c.get('user')
  const { events } = await c.req.json()
  const cal = await c.env.DB.prepare(
    `INSERT INTO calendar_events (company_id, events, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(company_id) DO UPDATE SET events = excluded.events, updated_at = datetime('now') RETURNING *`
  ).bind(company_id, JSON.stringify(events || [])).first()
  return c.json({ id: cal.id, events: JSON.parse(cal.events || '[]'), updated_at: cal.updated_at })
}
app.get('/api/planning', ...mw, handleGetPlanning)
app.get('/api/planning/', ...mw, handleGetPlanning)
app.post('/api/planning/save', ...mw, handleSavePlanning)
app.post('/api/planning/save/', ...mw, handleSavePlanning)

// 404 fallback
app.notFound((c) => {
  const headers = corsHeaders(c)
  return c.json({ error: 'Not found', path: c.req.path, method: c.req.method }, 404, headers)
})

// Error handler
app.onError(async (err, c) => {
  const headers = corsHeaders(c)
  if (err instanceof SyntaxError && err.message?.includes('JSON')) {
    return c.json({ error: 'Invalid JSON request body' }, 400, headers)
  }
  console.error('Unhandled error:', err)
  try {
    await c.env.DB.prepare(
      'INSERT INTO error_log (path, method, status, message) VALUES (?, ?, 500, ?)'
    ).bind(c.req.path, c.req.method, (err.message || 'Unknown error').slice(0, 500)).run()
  } catch {}
  const requestId = crypto.randomUUID()
  return c.json({ error: 'Internal server error', requestId }, 500, headers)
})

export default app
