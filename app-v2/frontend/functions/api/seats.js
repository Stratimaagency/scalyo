// === SCALYO — Seat Management ===
// POST /api/seats — Update subscription seat quantity via Stripe API

import { getConfig } from './_config/index.js'
import { extractAuth, extractLang, verifyJwt } from './_services/auth.service.js'

const MAX_SEATS_BY_PLAN = { starter: 3, growth: 7, elite: 24 }

async function getProfile(config, userId) {
  const url = config.supabaseUrl + '/rest/v1/profiles?id=eq.' + userId
    + '&select=id,plan,seats_paid,stripe_subscription_id'
  const res = await fetch(url, {
    headers: {
      'apikey': config.supabaseServiceRoleKey,
      'Authorization': 'Bearer ' + config.supabaseServiceRoleKey,
    },
  })
  if (!res.ok) return null
  const rows = await res.json()
  return rows.length > 0 ? rows[0] : null
}

async function stripeRequest(secretKey, method, path, body) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers: {
      'Authorization': 'Basic ' + btoa(secretKey + ':'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body || undefined,
  })
  return { ok: res.ok, status: res.status, data: await res.json() }
}

export async function onRequestPost(context) {
  const config = getConfig(context.env)
  const { token } = extractAuth(context.request)
  const jwt = await verifyJwt(token, config)
  if (!jwt.valid) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!config.stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'stripe_not_configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    })
  }
  let body
  try { body = await context.request.json() }
  catch { return new Response(JSON.stringify({ error: 'invalid_body' }), {
    status: 400, headers: { 'Content-Type': 'application/json' },
  })}
  const quantity = parseInt(body.quantity, 10)
  if (!quantity || quantity < 1) {
    return new Response(JSON.stringify({ error: 'invalid_quantity' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }
  const profile = await getProfile(config, jwt.userId)
  if (!profile || !profile.stripe_subscription_id) {
    return new Response(JSON.stringify({ error: 'no_subscription' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }
  const maxSeats = MAX_SEATS_BY_PLAN[profile.plan] || 0
  if (maxSeats > 0 && quantity > maxSeats) {
    return new Response(JSON.stringify({
      error: 'max_seats_exceeded', max: maxSeats, plan: profile.plan,
    }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
  const sub = await stripeRequest(config.stripeSecretKey, 'GET',
    '/subscriptions/' + profile.stripe_subscription_id)
  if (!sub.ok || !sub.data.items?.data?.length) {
    return new Response(JSON.stringify({ error: 'stripe_subscription_not_found' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }
  const itemId = sub.data.items.data[0].id
  const update = await stripeRequest(config.stripeSecretKey, 'POST',
    '/subscriptions/' + profile.stripe_subscription_id,
    'items[0][id]=' + encodeURIComponent(itemId)
    + '&items[0][quantity]=' + quantity
    + '&proration_behavior=create_prorations')
  if (!update.ok) {
    return new Response(JSON.stringify({
      error: 'stripe_update_failed',
      detail: update.data.error?.message || 'unknown',
    }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
  return new Response(JSON.stringify({
    success: true, quantity,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}