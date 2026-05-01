// === SCALYO — Stripe Webhook Handler ===
// POST /api/stripe-webhook
// Verifies HMAC signature, updates user plan in Supabase.

import { getConfig } from './_config/index.js'

// --- Price (EUR cents) to plan mapping ---
const AMOUNT_TO_PLAN = {
  7900: 'starter',
  11900: 'growth',
  15900: 'elite',
}

// --- HMAC-SHA256 Stripe signature verification ---
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false

  const parts = {}
  for (const item of sigHeader.split(',')) {
    const [key, value] = item.split('=')
    parts[key] = value
  }

  const timestamp = parts.t
  const expectedSig = parts.v1
  if (!timestamp || !expectedSig) return false

  // Reject if older than 5 minutes
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false

  // Compute HMAC-SHA256
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign(
    'HMAC', key, encoder.encode(timestamp + '.' + rawBody)
  )
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time comparison
  if (computed.length !== expectedSig.length) return false
  let result = 0
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ expectedSig.charCodeAt(i)
  }
  return result === 0
}

// --- Supabase helpers (service role key, bypasses RLS) ---
async function updateProfile(config, userId, updates) {
  const url = config.supabaseUrl + '/rest/v1/profiles?id=eq.' + userId
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': config.supabaseServiceRoleKey,
      'Authorization': 'Bearer ' + config.supabaseServiceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(updates),
  })
  return response.ok
}

async function findUserByCustomerId(config, customerId) {
  const url = config.supabaseUrl + '/rest/v1/profiles?stripe_customer_id=eq.' + customerId + '&select=id'
  const response = await fetch(url, {
    headers: {
      'apikey': config.supabaseServiceRoleKey,
      'Authorization': 'Bearer ' + config.supabaseServiceRoleKey,
    },
  })
  if (!response.ok) return null
  const rows = await response.json()
  return rows.length > 0 ? rows[0].id : null
}

function planFromAmount(amountCents) {
  return AMOUNT_TO_PLAN[amountCents] || null
}

// --- Event handlers ---
async function handleCheckoutCompleted(session, config) {
  const userId = session.client_reference_id
  if (!userId) return false

  const plan = planFromAmount(session.amount_total)
  if (!plan) return false

  return await updateProfile(config, userId, {
    plan,
    stripe_subscription_id: session.subscription || null,
    stripe_customer_id: session.customer || null,
    trial_used: true,
  })
}

async function handleSubscriptionUpdated(subscription, config) {
  const customerId = subscription.customer
  const userId = await findUserByCustomerId(config, customerId)
  if (!userId) return false

  // If canceled or unpaid, clear plan
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    return await updateProfile(config, userId, {
      plan: null,
      stripe_subscription_id: null,
    })
  }

  // Get plan from subscription items
  const items = subscription.items?.data || []
  const price = items[0]?.price
  if (!price) return false

  const plan = planFromAmount(price.unit_amount)
  if (!plan) return false

  return await updateProfile(config, userId, {
    plan,
    stripe_subscription_id: subscription.id,
  })
}

async function handleSubscriptionDeleted(subscription, config) {
  const customerId = subscription.customer
  const userId = await findUserByCustomerId(config, customerId)
  if (!userId) return false

  return await updateProfile(config, userId, {
    plan: null,
    stripe_subscription_id: null,
  })
}

// --- Main handler (POST only) ---
export async function onRequestPost(context) {
  const config = getConfig(context.env)

  if (!config.stripeWebhookSecret) {
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!config.supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: 'Service role not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Read raw body for HMAC verification
  const rawBody = await context.request.text()
  const sigHeader = context.request.headers.get('stripe-signature')

  const isValid = await verifyStripeSignature(rawBody, sigHeader, config.stripeWebhookSecret)
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const obj = event.data?.object
  if (!obj) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let handled = false
  switch (event.type) {
    case 'checkout.session.completed':
      handled = await handleCheckoutCompleted(obj, config)
      break
    case 'customer.subscription.updated':
      handled = await handleSubscriptionUpdated(obj, config)
      break
    case 'customer.subscription.deleted':
      handled = await handleSubscriptionDeleted(obj, config)
      break
  }

  return new Response(JSON.stringify({ received: true, handled }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
