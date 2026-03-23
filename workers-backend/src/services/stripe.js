const BASE = 'https://api.stripe.com/v1'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
}

export async function testConnection(config) {
  const res = await fetch(`${BASE}/customers?limit=1`, { headers: headers(config.apiKey) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Stripe API error ${res.status}`)
  }
  return { ok: true, message: 'Stripe connected' }
}

export async function sync(config, env, companyId) {
  const h = headers(config.apiKey)
  const results = { customers: 0, subscriptions: 0, mrr: 0 }

  // Fetch all active customers
  let hasMore = true
  let startingAfter = null
  const customers = []

  while (hasMore) {
    const params = new URLSearchParams({ limit: '100' })
    if (startingAfter) params.set('starting_after', startingAfter)

    const res = await fetch(`${BASE}/customers?${params}`, { headers: h })
    if (!res.ok) throw new Error(`Stripe customers fetch failed: ${res.status}`)
    const data = await res.json()

    customers.push(...data.data)
    hasMore = data.has_more
    if (data.data.length) startingAfter = data.data[data.data.length - 1].id
  }

  // Fetch active subscriptions for MRR
  const subRes = await fetch(`${BASE}/subscriptions?status=active&limit=100`, { headers: h })
  if (!subRes.ok) throw new Error(`Stripe subscriptions fetch failed: ${subRes.status}`)
  const subData = await subRes.json()

  let totalMrr = 0
  for (const sub of subData.data) {
    for (const item of sub.items.data) {
      const amount = item.price?.unit_amount || 0
      const interval = item.price?.recurring?.interval
      if (interval === 'month') totalMrr += amount
      else if (interval === 'year') totalMrr += Math.round(amount / 12)
    }
  }
  results.mrr = totalMrr / 100 // Convert cents to dollars/euros

  // Upsert customers into portfolio accounts
  for (const cust of customers) {
    const name = cust.name || cust.email || cust.id
    const email = cust.email || ''

    // Find matching subscription
    const custSub = subData.data.find(s => s.customer === cust.id)
    let mrr = 0
    if (custSub) {
      for (const item of custSub.items.data) {
        const amount = item.price?.unit_amount || 0
        const interval = item.price?.recurring?.interval
        if (interval === 'month') mrr += amount
        else if (interval === 'year') mrr += Math.round(amount / 12)
      }
    }
    mrr = mrr / 100

    // Check if account exists with this external_id
    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE company_id = ? AND external_id = ?'
    ).bind(companyId, `stripe_${cust.id}`).first()

    if (existing) {
      await env.DB.prepare(
        "UPDATE accounts SET name = ?, email = ?, mrr = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, email, mrr, existing.id).run()
    } else {
      await env.DB.prepare(
        "INSERT INTO accounts (company_id, name, email, mrr, status, external_id, source) VALUES (?, ?, ?, ?, 'active', ?, 'stripe')"
      ).bind(companyId, name, email, mrr, `stripe_${cust.id}`).run()
    }

    results.customers++
  }

  results.subscriptions = subData.data.length
  return results
}
