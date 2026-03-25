import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const portfolio = new Hono()
portfolio.use('/*', authMiddleware(), companyRequired())

// GET /api/portfolio/accounts/
portfolio.get('/accounts/', async (c) => {
  const { company_id } = c.get('user')
  const db = c.env.DB

  const search = c.req.query('search')
  const risk = c.req.query('risk')
  const csm = c.req.query('csm')

  let query = 'SELECT * FROM accounts WHERE company_id = ?'
  const params = [company_id]

  if (search) {
    query += ' AND name LIKE ?'
    params.push(`%${search}%`)
  }
  if (risk) {
    query += ' AND risk = ?'
    params.push(risk)
  }
  if (csm) {
    query += ' AND csm = ?'
    params.push(csm)
  }

  query += ' ORDER BY arr DESC'

  const { results } = await db.prepare(query).bind(...params).all()

  // Parse JSON fields
  const accounts = results.map(a => ({
    ...a,
    issues: JSON.parse(a.issues || '[]'),
  }))

  return c.json(accounts)
})

// Plan limits for accounts
const ACCOUNT_LIMITS = { Starter: 6, Growth: -1, Elite: -1 }

// POST /api/portfolio/accounts/
portfolio.post('/accounts/', async (c) => {
  const { company_id } = c.get('user')
  const data = await c.req.json()

  if (!data.name || !data.name.trim()) {
    return c.json({ error: 'Account name is required' }, 400)
  }

  // Check plan account limit
  const company = await c.env.DB.prepare('SELECT plan FROM companies WHERE id = ?').bind(company_id).first()
  const plan = company?.plan || 'Starter'
  const limit = ACCOUNT_LIMITS[plan] ?? 6
  if (limit > 0) {
    const count = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM accounts WHERE company_id = ?').bind(company_id).first()
    if ((count?.cnt || 0) >= limit) {
      return c.json({ error: `Plan ${plan}: max ${limit} accounts. Upgrade to add more.` }, 400)
    }
  }

  const account = await c.env.DB.prepare(
    `INSERT INTO accounts (company_id, name, csm, mrr, arr, industry, usage, health, risk, plan, contact, contact_email, issues, notes, onboarding_date, renewal_date, renewal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    company_id,
    data.name || '',
    data.csm || '',
    data.mrr || 0,
    data.arr || ((data.mrr || 0) * 12),
    data.industry || '',
    data.usage ?? 70,
    data.health ?? 70,
    data.risk || 'low',
    data.plan || '',
    data.contact || '',
    data.contact_email || '',
    JSON.stringify(data.issues || []),
    data.notes || '',
    data.onboarding_date || null,
    data.renewal_date || null,
    data.renewal || ''
  ).first()

  return c.json({ ...account, issues: JSON.parse(account.issues || '[]') }, 201)
})

// GET /api/portfolio/accounts/:id/
portfolio.get('/accounts/:id/', async (c) => {
  const { company_id } = c.get('user')
  const id = c.req.param('id')

  const account = await c.env.DB.prepare(
    'SELECT * FROM accounts WHERE id = ? AND company_id = ?'
  ).bind(id, company_id).first()

  if (!account) return c.json({ error: 'Not found' }, 404)

  // Get todos
  const { results: todos } = await c.env.DB.prepare(
    'SELECT id, type, label, text, done, date, notes, created_at FROM account_todos WHERE account_id = ? AND company_id = ? ORDER BY created_at DESC'
  ).bind(id, company_id).all()

  return c.json({
    ...account,
    issues: JSON.parse(account.issues || '[]'),
    todos: todos.map(t => ({ ...t, done: !!t.done })),
  })
})

// PATCH /api/portfolio/accounts/:id/
portfolio.patch('/accounts/:id/', async (c) => {
  const { company_id } = c.get('user')
  const id = c.req.param('id')
  const data = await c.req.json()

  const allowed = ['name', 'csm', 'mrr', 'arr', 'industry', 'usage', 'health', 'risk', 'plan', 'contact', 'contact_email', 'notes', 'onboarding_date', 'renewal_date', 'renewal']
  const sets = []
  const values = []

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`)
      values.push(data[key])
    }
  }

  // Auto-sync arr when mrr changes
  if (data.mrr !== undefined && data.arr === undefined) {
    sets.push('arr = ?')
    values.push((parseFloat(data.mrr) || 0) * 12)
  }

  if (data.issues !== undefined) {
    sets.push('issues = ?')
    values.push(JSON.stringify(data.issues))
  }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  sets.push("updated_at = datetime('now')")
  values.push(id, company_id)

  const account = await c.env.DB.prepare(
    `UPDATE accounts SET ${sets.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`
  ).bind(...values).first()

  if (!account) return c.json({ error: 'Not found' }, 404)

  return c.json({ ...account, issues: JSON.parse(account.issues || '[]') })
})

// DELETE /api/portfolio/accounts/:id/
portfolio.delete('/accounts/:id/', async (c) => {
  const { company_id } = c.get('user')
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    'DELETE FROM accounts WHERE id = ? AND company_id = ?'
  ).bind(id, company_id).run()

  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
})

// POST /api/portfolio/accounts/import_accounts/
portfolio.post('/accounts/import_accounts/', async (c) => {
  const { company_id } = c.get('user')
  const { accounts } = await c.req.json()

  if (!accounts || !accounts.length) {
    return c.json({ error: 'At least one account is required.' }, 400)
  }

  const ids = []
  for (const row of accounts) {
    const mrrVal = row.mrr || 0
    const result = await c.env.DB.prepare(
      `INSERT INTO accounts (company_id, name, csm, mrr, arr, industry, usage, health, risk, plan, contact, contact_email, renewal, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    ).bind(
      company_id,
      row.name || '',
      row.csm || '',
      mrrVal,
      row.arr || (mrrVal * 12) || 0,
      row.industry || '',
      row.usage ?? 70,
      row.health ?? 70,
      row.risk || 'low',
      row.plan || '',
      row.contact || '',
      row.contact_email || '',
      row.renewal || '',
      row.notes || ''
    ).first()
    ids.push(result.id)
  }

  return c.json({ created: ids.length, ids }, 201)
})

// --- Account Todos ---

// GET /api/portfolio/accounts/:account_pk/todos/
portfolio.get('/accounts/:account_pk/todos/', async (c) => {
  const { company_id } = c.get('user')
  const accountId = c.req.param('account_pk')

  const { results } = await c.env.DB.prepare(
    'SELECT id, type, label, text, done, date, notes, created_at FROM account_todos WHERE account_id = ? AND company_id = ? ORDER BY created_at DESC'
  ).bind(accountId, company_id).all()

  return c.json(results.map(t => ({ ...t, done: !!t.done })))
})

// POST /api/portfolio/accounts/:account_pk/todos/
portfolio.post('/accounts/:account_pk/todos/', async (c) => {
  const { company_id } = c.get('user')
  const accountId = c.req.param('account_pk')

  // Verify account belongs to this company
  const account = await c.env.DB.prepare(
    'SELECT id FROM accounts WHERE id = ? AND company_id = ?'
  ).bind(accountId, company_id).first()
  if (!account) return c.json({ error: 'Account not found' }, 404)

  const data = await c.req.json()

  const label = data.label || data.text || ''
  if (!label) return c.json({ error: 'label or text is required' }, 400)

  const todo = await c.env.DB.prepare(
    'INSERT INTO account_todos (account_id, company_id, type, label, text, done, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(
    accountId, company_id,
    data.type || '',
    label,
    label,
    data.done ? 1 : 0,
    data.date || '',
    data.notes || ''
  ).first()

  return c.json({ ...todo, done: !!todo.done }, 201)
})

// PATCH /api/portfolio/accounts/:account_pk/todos/:id/
portfolio.patch('/accounts/:account_pk/todos/:id/', async (c) => {
  const { company_id } = c.get('user')
  const todoId = c.req.param('id')
  const data = await c.req.json()

  const sets = []
  const values = []

  if (data.label !== undefined) {
    sets.push('label = ?'); values.push(data.label)
    sets.push('text = ?'); values.push(data.label)
  } else if (data.text !== undefined) {
    sets.push('text = ?'); values.push(data.text)
  }
  if (data.done !== undefined) { sets.push('done = ?'); values.push(data.done ? 1 : 0) }
  if (data.type !== undefined) { sets.push('type = ?'); values.push(data.type) }
  if (data.date !== undefined) { sets.push('date = ?'); values.push(data.date) }
  if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes) }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  values.push(todoId, company_id)

  const todo = await c.env.DB.prepare(
    `UPDATE account_todos SET ${sets.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`
  ).bind(...values).first()

  if (!todo) return c.json({ error: 'Not found' }, 404)
  return c.json({ ...todo, done: !!todo.done })
})

// DELETE /api/portfolio/accounts/:account_pk/todos/:id/
portfolio.delete('/accounts/:account_pk/todos/:id/', async (c) => {
  const { company_id } = c.get('user')
  const todoId = c.req.param('id')

  const result = await c.env.DB.prepare(
    'DELETE FROM account_todos WHERE id = ? AND company_id = ?'
  ).bind(todoId, company_id).run()

  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
})

export default portfolio
