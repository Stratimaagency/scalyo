// GET /api/quotes/
export async function handleGetQuotes(c) {
  const user = c.get('user')
  const { company_id } = user

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM quotes WHERE company_id = ? ORDER BY created_at DESC'
  ).bind(company_id).all()

  return c.json(results || [])
}

// POST /api/quotes/
export async function handleCreateQuote(c) {
  const user = c.get('user')
  const data = await c.req.json()

  if (!data.title || !data.title.trim()) {
    return c.json({ error: 'Title is required' }, 400)
  }
  if (!data.client || !data.client.trim()) {
    return c.json({ error: 'Client is required' }, 400)
  }

  const validStatuses = ['draft', 'sent', 'won', 'lost']
  const status = validStatuses.includes(data.status) ? data.status : 'draft'
  const now = new Date().toISOString().slice(0, 10)

  const quote = await c.env.DB.prepare(
    `INSERT INTO quotes (company_id, user_id, title, client, amount, status, notes, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    user.company_id,
    user.id,
    data.title.trim(),
    data.client.trim(),
    parseFloat(data.amount) || 0,
    status,
    data.notes || '',
    data.date || now
  ).first()

  return c.json(quote, 201)
}

// PATCH /api/quotes/:id/
export async function handleUpdateQuote(c) {
  const user = c.get('user')
  const id = c.req.param('id')
  const data = await c.req.json()

  const allowed = ['title', 'client', 'amount', 'status', 'notes']
  const sets = []
  const values = []

  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === 'status') {
        const validStatuses = ['draft', 'sent', 'won', 'lost']
        if (!validStatuses.includes(data[key])) continue
      }
      if (key === 'amount') {
        sets.push(`${key} = ?`)
        values.push(parseFloat(data[key]) || 0)
      } else {
        sets.push(`${key} = ?`)
        values.push(data[key])
      }
    }
  }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  sets.push("updated_at = datetime('now')")
  values.push(id, user.company_id)

  const quote = await c.env.DB.prepare(
    `UPDATE quotes SET ${sets.join(', ')} WHERE id = ? AND company_id = ? RETURNING *`
  ).bind(...values).first()

  if (!quote) return c.json({ error: 'Not found' }, 404)
  return c.json(quote)
}

// DELETE /api/quotes/:id/
export async function handleDeleteQuote(c) {
  const user = c.get('user')
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    'DELETE FROM quotes WHERE id = ? AND company_id = ?'
  ).bind(id, user.company_id).run()

  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
}
