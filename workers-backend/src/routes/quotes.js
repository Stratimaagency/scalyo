// Country-specific defaults
const COUNTRY_DEFAULTS = {
  FR: { tax_rate: 20, prefix: 'DEV', payment_terms: 'Net 30', currency: 'EUR', label: 'Devis', legal: 'TVA non applicable, art. 293 B du CGI (si applicable)' },
  DE: { tax_rate: 19, prefix: 'ANG', payment_terms: 'Net 14', currency: 'EUR', label: 'Angebot', legal: '' },
  ES: { tax_rate: 21, prefix: 'PRE', payment_terms: 'Net 30', currency: 'EUR', label: 'Presupuesto', legal: '' },
  IT: { tax_rate: 22, prefix: 'PRV', payment_terms: 'Net 30', currency: 'EUR', label: 'Preventivo', legal: '' },
  GB: { tax_rate: 20, prefix: 'QUO', payment_terms: 'Net 30', currency: 'GBP', label: 'Quote', legal: '' },
  US: { tax_rate: 0, prefix: 'EST', payment_terms: 'Net 30', currency: 'USD', label: 'Estimate', legal: '' },
  CH: { tax_rate: 8.1, prefix: 'DEV', payment_terms: 'Net 30', currency: 'CHF', label: 'Devis', legal: '' },
  BE: { tax_rate: 21, prefix: 'DEV', payment_terms: 'Net 30', currency: 'EUR', label: 'Devis', legal: '' },
  KR: { tax_rate: 10, prefix: 'EST', payment_terms: 'Net 30', currency: 'KRW', label: '견적서', legal: '' },
}
function getDefaults(country) { return COUNTRY_DEFAULTS[country] || COUNTRY_DEFAULTS.FR }

// GET /api/quotes/
export async function handleGetQuotes(c) {
  const { company_id } = c.get('user')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM quotes WHERE company_id = ? ORDER BY created_at DESC'
  ).bind(company_id).all()
  return c.json(results || [])
}

// GET /api/quotes/config
export async function handleGetQuoteConfig(c) {
  const { company_id } = c.get('user')
  const db = c.env.DB
  let config = await db.prepare('SELECT * FROM quote_config WHERE company_id = ?').bind(company_id).first()
  if (!config) {
    const company = await db.prepare('SELECT country FROM companies WHERE id = ?').bind(company_id).first()
    const country = company?.country || 'FR'
    const defs = getDefaults(country)
    config = await db.prepare(
      `INSERT INTO quote_config (company_id, country, quote_prefix, default_tax_rate, default_payment_terms, default_conditions, legal_mentions)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(company_id, country, defs.prefix, defs.tax_rate, defs.payment_terms, '', defs.legal).first()
  }
  return c.json({ ...config, country_defaults: getDefaults(config.country) })
}

// PATCH /api/quotes/config
export async function handleUpdateQuoteConfig(c) {
  const { company_id } = c.get('user')
  const data = await c.req.json()
  const allowed = ['country', 'quote_prefix', 'default_validity_days', 'default_payment_terms', 'default_tax_rate', 'default_conditions', 'legal_mentions']
  const sets = [], values = []
  for (const key of allowed) {
    if (data[key] !== undefined) { sets.push(`${key} = ?`); values.push(data[key]) }
  }
  if (data.country) {
    const defs = getDefaults(data.country)
    if (!sets.find(s => s.startsWith('default_tax_rate'))) { sets.push('default_tax_rate = ?'); values.push(defs.tax_rate) }
    if (!sets.find(s => s.startsWith('quote_prefix'))) { sets.push('quote_prefix = ?'); values.push(defs.prefix) }
  }
  if (!sets.length) return c.json({ error: 'No valid fields' }, 400)
  sets.push("updated_at = datetime('now')")
  values.push(company_id)
  const config = await c.env.DB.prepare(
    `UPDATE quote_config SET ${sets.join(', ')} WHERE company_id = ? RETURNING *`
  ).bind(...values).first()
  if (!config) return c.json({ error: 'Config not found' }, 404)
  return c.json({ ...config, country_defaults: getDefaults(config.country) })
}

// POST /api/quotes/
export async function handleCreateQuote(c) {
  const user = c.get('user')
  const data = await c.req.json()
  const db = c.env.DB

  if (!data.customer_name?.trim()) return c.json({ error: 'customer_name is required' }, 400)

  // Get config for auto-numbering
  let config = await db.prepare('SELECT * FROM quote_config WHERE company_id = ?').bind(user.company_id).first()
  if (!config) {
    const company = await db.prepare('SELECT country FROM companies WHERE id = ?').bind(user.company_id).first()
    const country = company?.country || 'FR'
    const defs = getDefaults(country)
    config = await db.prepare(
      `INSERT INTO quote_config (company_id, country, quote_prefix, default_tax_rate, default_payment_terms)
       VALUES (?, ?, ?, ?, ?) RETURNING *`
    ).bind(user.company_id, country, defs.prefix, defs.tax_rate, defs.payment_terms).first()
  }

  // Generate quote number
  const year = new Date().getFullYear()
  const num = config.next_number || 1
  const quote_number = `${config.quote_prefix}-${year}-${String(num).padStart(4, '0')}`

  // Increment counter
  await db.prepare('UPDATE quote_config SET next_number = ? WHERE company_id = ?').bind(num + 1, user.company_id).run()

  const now = new Date().toISOString().slice(0, 10)
  const subtotal = parseFloat(data.subtotal) || 0
  const tax_rate = data.tax_rate !== undefined ? parseFloat(data.tax_rate) : (config.default_tax_rate || 0)
  const discount_pct = parseFloat(data.discount_pct) || 0
  const discounted = subtotal * (1 - discount_pct / 100)
  const tax_amount = discounted * tax_rate / 100
  const total_ttc = discounted + tax_amount

  const validStatuses = ['draft', 'sent', 'won', 'lost']
  const status = validStatuses.includes(data.status) ? data.status : 'draft'

  const quote = await db.prepare(
    `INSERT INTO quotes (company_id, user_id, title, client, amount, status, notes, date,
      quote_number, customer_name, customer_email, customer_address, customer_vat,
      issue_date, validity_days, payment_terms, currency, subtotal, discount_pct,
      tax_rate, tax_amount, total_ttc, conditions, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    user.company_id, user.id,
    data.title?.trim() || quote_number,
    data.customer_name.trim(),
    total_ttc,
    status,
    data.notes || '',
    data.date || now,
    quote_number,
    data.customer_name.trim(),
    data.customer_email || '',
    data.customer_address || '',
    data.customer_vat || '',
    data.issue_date || now,
    data.validity_days || config.default_validity_days || 30,
    data.payment_terms || config.default_payment_terms || '',
    data.currency || getDefaults(config.country).currency,
    subtotal, discount_pct, tax_rate, tax_amount, total_ttc,
    data.conditions || config.default_conditions || '',
    config.country
  ).first()

  // Insert line items (batched)
  if (data.items?.length) {
    const stmts = data.items.map((item, i) => {
      const qty = parseFloat(item.quantity) || 1
      const price = parseFloat(item.unit_price) || 0
      return db.prepare(
        `INSERT INTO quote_items (quote_id, description, quantity, unit_price, tax_rate, total, position)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(quote.id, item.description || '', qty, price, parseFloat(item.tax_rate) || tax_rate, qty * price, i)
    })
    await db.batch(stmts)
  }

  return c.json(quote, 201)
}

// GET /api/quotes/:id/items
export async function handleGetQuoteItems(c) {
  const { company_id } = c.get('user')
  const id = c.req.param('id')
  const quote = await c.env.DB.prepare('SELECT id FROM quotes WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (!quote) return c.json({ error: 'Not found' }, 404)
  const { results } = await c.env.DB.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY position').bind(id).all()
  return c.json(results || [])
}

// PUT /api/quotes/:id/items — Replace all items
export async function handleSetQuoteItems(c) {
  const { company_id } = c.get('user')
  const id = c.req.param('id')
  const data = await c.req.json()
  const db = c.env.DB

  const quote = await db.prepare('SELECT id, tax_rate, discount_pct FROM quotes WHERE id = ? AND company_id = ?').bind(id, company_id).first()
  if (!quote) return c.json({ error: 'Not found' }, 404)

  // Delete existing + batch insert new items
  await db.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(id).run()

  let subtotal = 0
  const items = data.items || []
  const stmts = items.map((item, i) => {
    const qty = parseFloat(item.quantity) || 1
    const price = parseFloat(item.unit_price) || 0
    const lineTotal = qty * price
    subtotal += lineTotal
    return db.prepare(
      `INSERT INTO quote_items (quote_id, description, quantity, unit_price, tax_rate, total, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, item.description || '', qty, price, parseFloat(item.tax_rate) || quote.tax_rate || 0, lineTotal, i)
  })
  if (stmts.length) await db.batch(stmts)

  // Recalculate totals (reuse first SELECT)
  const discounted = subtotal * (1 - (quote.discount_pct || 0) / 100)
  const tax_amount = discounted * (quote.tax_rate || 0) / 100
  const total_ttc = discounted + tax_amount

  await db.prepare(
    `UPDATE quotes SET subtotal = ?, tax_amount = ?, total_ttc = ?, amount = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(subtotal, tax_amount, total_ttc, total_ttc, id).run()

  return c.json({ subtotal, tax_amount, total_ttc })
}

// PATCH /api/quotes/:id/
export async function handleUpdateQuote(c) {
  const user = c.get('user')
  const id = c.req.param('id')
  const data = await c.req.json()

  const allowed = ['title', 'client', 'amount', 'status', 'notes', 'customer_name', 'customer_email',
    'customer_address', 'customer_vat', 'validity_days', 'payment_terms', 'currency',
    'subtotal', 'discount_pct', 'tax_rate', 'conditions']
  const sets = [], values = []

  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === 'status') {
        if (!['draft', 'sent', 'won', 'lost'].includes(data[key])) continue
      }
      sets.push(`${key} = ?`)
      values.push(['amount', 'subtotal', 'discount_pct', 'tax_rate'].includes(key) ? parseFloat(data[key]) || 0 : data[key])
    }
  }

  if (sets.length === 0) return c.json({ error: 'No valid fields' }, 400)

  // Recalculate if financial fields changed
  if (data.subtotal !== undefined || data.discount_pct !== undefined || data.tax_rate !== undefined) {
    const existing = await c.env.DB.prepare('SELECT subtotal, discount_pct, tax_rate FROM quotes WHERE id = ? AND company_id = ?').bind(id, user.company_id).first()
    if (existing) {
      const sub = data.subtotal !== undefined ? parseFloat(data.subtotal) : existing.subtotal || 0
      const disc = data.discount_pct !== undefined ? parseFloat(data.discount_pct) : existing.discount_pct || 0
      const tax = data.tax_rate !== undefined ? parseFloat(data.tax_rate) : existing.tax_rate || 0
      const discounted = sub * (1 - disc / 100)
      const tax_amount = discounted * tax / 100
      const total_ttc = discounted + tax_amount
      sets.push('tax_amount = ?', 'total_ttc = ?', 'amount = ?')
      values.push(tax_amount, total_ttc, total_ttc)
    }
  }

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
  await c.env.DB.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(id).run()
  const result = await c.env.DB.prepare('DELETE FROM quotes WHERE id = ? AND company_id = ?').bind(id, user.company_id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
}
