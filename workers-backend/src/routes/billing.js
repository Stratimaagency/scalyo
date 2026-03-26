import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const billing = new Hono()

const PLAN_PRICE_MAP = {
  Starter: 'STRIPE_STARTER_PRICE_ID',
  Growth: 'STRIPE_GROWTH_PRICE_ID',
  Elite: 'STRIPE_ELITE_PRICE_ID',
}

async function sendTransactionalEmail(env, { to, subject, body }) {
  const from = env.FROM_EMAIL || 'noreply@scalyo.app'
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: 'Scalyo' },
    subject,
    content: [{ type: 'text/html', value: body }],
  }

  if (env.SENDGRID_API_KEY) {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })
  } else {
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
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

// --- Protected routes (webhook excluded below) ---
billing.use('/checkout/', authMiddleware(), companyRequired())
billing.use('/portal/', authMiddleware(), companyRequired())
billing.use('/status/', authMiddleware(), companyRequired())
billing.use('/change-plan/', authMiddleware(), companyRequired())

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
  if (!company) return c.json({ error: 'Company not found' }, 404)
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

  if (!company) return c.json({ error: 'Company not found' }, 404)
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

  if (!company) return c.json({ error: 'Company not found' }, 404)

  return c.json({
    plan: company.plan,
    subscription_status: company.subscription_status,
    has_subscription: !!company.stripe_subscription_id,
  })
})

// POST /api/billing/change-plan/ — upgrade/downgrade for existing subscribers
billing.post('/change-plan/', async (c) => {
  const { plan } = await c.req.json()
  if (!['Starter', 'Growth', 'Elite'].includes(plan)) {
    return c.json({ error: 'Invalid plan' }, 400)
  }

  const priceId = c.env[PLAN_PRICE_MAP[plan]]
  if (!priceId) return c.json({ error: `No price configured for plan: ${plan}` }, 400)

  const user = c.get('user')
  const db = c.env.DB
  const stripe = getStripe(c.env)

  const company = await db.prepare('SELECT * FROM companies WHERE id = ?').bind(user.company_id).first()
  if (!company) return c.json({ error: 'Company not found' }, 404)

  // If no active subscription, redirect to checkout
  if (!company.stripe_subscription_id) {
    return c.json({ error: 'no_subscription', message: 'No active subscription — use checkout instead' }, 400)
  }

  // Get current subscription to find the item ID
  const sub = await stripe.request('GET', `/subscriptions/${company.stripe_subscription_id}`)
  if (sub.error) {
    return c.json({ error: sub.error.message || 'Failed to fetch subscription' }, 400)
  }

  const itemId = sub.items?.data?.[0]?.id
  if (!itemId) {
    return c.json({ error: 'No subscription item found' }, 400)
  }

  // Update the subscription with the new price (proration by default)
  const updated = await stripe.request('POST', `/subscriptions/${company.stripe_subscription_id}`, {
    'items[0][id]': itemId,
    'items[0][price]': priceId,
    proration_behavior: 'create_prorations',
  })

  if (updated.error) {
    return c.json({ error: updated.error.message || 'Failed to change plan' }, 400)
  }

  // Update plan in DB immediately
  await db.prepare(
    "UPDATE companies SET plan = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(plan, company.id).run()

  return c.json({ ok: true, plan, message: `Plan changed to ${plan}` })
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

      // Constant-time comparison using double HMAC
      if (computed.length !== expectedSig.length) return c.body(null, 400)
      const cmpKey = await crypto.subtle.importKey(
        'raw', crypto.getRandomValues(new Uint8Array(32)),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      )
      const mac1 = await crypto.subtle.sign('HMAC', cmpKey, new TextEncoder().encode(computed))
      const mac2 = await crypto.subtle.sign('HMAC', cmpKey, new TextEncoder().encode(expectedSig))
      const arr1 = new Uint8Array(mac1)
      const arr2 = new Uint8Array(mac2)
      let diff = 0
      for (let i = 0; i < arr1.length; i++) diff |= arr1[i] ^ arr2[i]
      if (diff !== 0) return c.body(null, 400)

      // Reject events older than 5 minutes to prevent replay attacks
      const now = Math.floor(Date.now() / 1000)
      if (Math.abs(now - parseInt(timestamp)) > 300) return c.body(null, 400)

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
    const companyIdInt = parseInt(companyId, 10)
    if (companyIdInt) {
      await db.prepare(
        `UPDATE companies SET plan = ?, stripe_subscription_id = ?, subscription_status = 'active', updated_at = datetime('now')
         WHERE id = ?`
      ).bind(plan || 'Starter', subscriptionId || '', companyIdInt).run()

      // Send subscription confirmation email
      const customerEmail = obj.customer_details?.email || obj.customer_email
      if (customerEmail) {
        const selectedPlan = plan || 'Starter'
        try {
          await sendTransactionalEmail(c.env, {
            to: customerEmail,
            subject: `Bienvenue sur Scalyo — Plan ${selectedPlan} activé !`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Bienvenue sur Scalyo ! 🎉</h2>
                <p>Votre abonnement <strong>${selectedPlan}</strong> est maintenant actif.</p>
                <p>Vous pouvez dès maintenant profiter de toutes les fonctionnalités de votre plan.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 14px; color: #6b7280;">
                  Gérez votre abonnement à tout moment depuis vos <a href="https://app.scalyo.app/settings">paramètres</a>.
                </p>
                <p style="font-size: 14px; color: #6b7280;">L'équipe Scalyo</p>
              </div>
            `,
          })
        } catch (e) {
          // Don't fail the webhook if email fails
          console.error('Failed to send subscription confirmation email:', e)
        }
      }
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
