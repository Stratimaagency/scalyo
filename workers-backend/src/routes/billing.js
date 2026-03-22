import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const billing = new Hono()

const PLAN_PRICE_MAP = {
  Starter: 'STRIPE_STARTER_PRICE_ID',
  Growth: 'STRIPE_GROWTH_PRICE_ID',
  Elite: 'STRIPE_ELITE_PRICE_ID',
}

function getStripe(env) {
  // We use fetch-based Stripe API calls (no SDK needed in Workers)
  const apiKey = env.STRIPE_SECRET_KEY
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY not configured')
  return {
    async request(method, path, body) {
      const res = await fetch(`https://api.stripe.com/v1${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body ? new URLSearchParams(body).toString() : undefined,
      })
      return res.json()
    }
  }
}

// --- Protected routes ---
billing.use('/checkout', authMiddleware(), companyRequired())
billing.use('/portal', authMiddleware(), companyRequired())
billing.use('/status', authMiddleware(), companyRequired())

// POST /api/billing/checkout/
billing.post('/checkout/', async (c) => {
  const { plan } = await c.req.json()
  if (!['Starter', 'Growth', 'Elite'].includes(plan)) {
    return c.json({ error: 'Invalid plan' }, 400)
  }

  const priceId = c.env[PLAN_PRICE_MAP[plan]]
  if (!priceId) return c.json({ error: `No price configured for plan: ${plan}` }, 400)

  const user = c.get('user')
  const db = c.env.DB
  const stripe = getStripe(c.env)

  // Get or create customer
  const company = await db.prepare('SELECT * FROM companies WHERE id = ?').bind(user.company_id).first()
  let customerId = company.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.request('POST', '/customers', {
      email: user.email,
      name: company.name,
      'metadata[company_id]': String(company.id),
    })
    customerId = customer.id
    await db.prepare(
      "UPDATE companies SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(customerId, company.id).run()
  }

  const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:5173'
  const session = await stripe.request('POST', '/checkout/sessions', {
    customer: customerId,
    'payment_method_types[0]': 'card',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    mode: 'subscription',
    success_url: `${frontendUrl}/settings?billing=success`,
    cancel_url: `${frontendUrl}/settings?billing=cancelled`,
    'metadata[company_id]': String(company.id),
    'metadata[plan]': plan,
  })

  return c.json({ checkout_url: session.url })
})

// POST /api/billing/portal/
billing.post('/portal/', async (c) => {
  const user = c.get('user')
  const company = await c.env.DB.prepare(
    'SELECT * FROM companies WHERE id = ?'
  ).bind(user.company_id).first()

  if (!company.stripe_customer_id) {
    return c.json({ error: 'No Stripe customer for this company' }, 400)
  }

  const stripe = getStripe(c.env)
  const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:5173'
  const session = await stripe.request('POST', '/billing_portal/sessions', {
    customer: company.stripe_customer_id,
    return_url: `${frontendUrl}/settings`,
  })

  return c.json({ portal_url: session.url })
})

// GET /api/billing/status/
billing.get('/status/', async (c) => {
  const user = c.get('user')
  const company = await c.env.DB.prepare(
    'SELECT * FROM companies WHERE id = ?'
  ).bind(user.company_id).first()

  return c.json({
    plan: company.plan,
    subscription_status: company.subscription_status,
    has_subscription: !!company.stripe_subscription_id,
  })
})

// POST /api/billing/webhook/ (no auth — Stripe calls this)
billing.post('/webhook/', async (c) => {
  const body = await c.req.text()
  const sig = c.req.header('stripe-signature') || ''
  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET

  let event
  if (webhookSecret) {
    // Verify signature using Stripe's method
    try {
      // Simple HMAC verification for Stripe webhooks
      const parts = sig.split(',').reduce((acc, part) => {
        const [k, v] = part.split('=')
        acc[k] = v
        return acc
      }, {})

      const timestamp = parts.t
      const expectedSig = parts.v1

      if (!timestamp || !expectedSig) return c.body(null, 400)

      const payload = `${timestamp}.${body}`
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
      const computed = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')

      if (computed !== expectedSig) return c.body(null, 400)

      event = JSON.parse(body)
    } catch {
      return c.body(null, 400)
    }
  } else {
    try {
      event = JSON.parse(body)
    } catch {
      return c.body(null, 400)
    }
  }

  const db = c.env.DB
  const eventType = event.type
  const obj = event.data?.object || {}

  if (eventType === 'checkout.session.completed') {
    const companyId = obj.metadata?.company_id
    const plan = obj.metadata?.plan
    const subscriptionId = obj.subscription
    if (companyId) {
      await db.prepare(
        `UPDATE companies SET plan = ?, stripe_subscription_id = ?, subscription_status = 'active', updated_at = datetime('now')
         WHERE id = ?`
      ).bind(plan || 'Starter', subscriptionId || '', parseInt(companyId)).run()
    }
  } else if (eventType === 'customer.subscription.updated') {
    const subId = obj.id
    const status = obj.status
    const company = await db.prepare(
      'SELECT * FROM companies WHERE stripe_subscription_id = ?'
    ).bind(subId).first()
    if (company) {
      let plan = company.plan
      const items = obj.items?.data
      if (items?.length) {
        const priceId = items[0].price?.id
        // Reverse lookup plan from price
        for (const [p, envKey] of Object.entries(PLAN_PRICE_MAP)) {
          if (c.env[envKey] === priceId) { plan = p; break }
        }
      }
      await db.prepare(
        "UPDATE companies SET plan = ?, subscription_status = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(plan, status || '', company.id).run()
    }
  } else if (eventType === 'customer.subscription.deleted') {
    const subId = obj.id
    await db.prepare(
      `UPDATE companies SET plan = 'Starter', subscription_status = 'canceled', stripe_subscription_id = '', updated_at = datetime('now')
       WHERE stripe_subscription_id = ?`
    ).bind(subId).run()
  }

  return c.body(null, 200)
})

export default billing
