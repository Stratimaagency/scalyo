// === SCALYO — Stripe Checkout Session ===
// POST /api/stripe/checkout
// Creates a Stripe Checkout session for plan subscription with per-seat billing.
// Multi-currency: EUR (FR), USD (EN), KRW (KO).

import { getConfig } from '../_config/index.js'
import { extractAuth, extractLang, verifyJwt } from '../_services/auth.service.js'

function getPriceId(env, plan, currency) {
  const key = 'STRIPE_PRICE_' + plan.toUpperCase() + '_' + currency.toUpperCase()
  if (env[key]) return env[key]
  const fallback = 'STRIPE_PRICE_' + plan.toUpperCase()
  return env[fallback] || null
}

const LOCALE_MAP = {
  fr: { currency: 'eur', stripeLocale: 'fr' },
  en: { currency: 'usd', stripeLocale: 'en' },
  ko: { currency: 'krw', stripeLocale: 'ko' },
}

const MAX_SEATS_BY_PLAN = { starter: 3, growth: 7, elite: 24 }
const VALID_PLANS = ['starter', 'growth', 'elite']

async function getProfile(config, userId) {
  const url = config.supabaseUrl + '/rest/v1/profiles?id=eq.' + userId + '&select=id,stripe_customer_id,plan'
  const res = await fetch(url, {
    headers: { 'apikey': config.supabaseServiceRoleKey, 'Authorization': 'Bearer ' + config.supabaseServiceRoleKey },
  })
  if (!res.ok) return null
  const rows = await res.json()
  return rows.length > 0 ? rows[0] : null
}

async function getUserEmail(config, userId) {
  const url = config.supabaseUrl + '/auth/v1/admin/users/' + userId
  const res = await fetch(url, {
    headers: { 'apikey': config.supabaseServiceRoleKey, 'Authorization': 'Bearer ' + config.supabaseServiceRoleKey },
  })
  if (!res.ok) return null
  const user = await res.json()
  return user.email || null
}

async function stripeRequest(secretKey, method, path, body) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers: { 'Authorization': 'Basic ' + btoa(secretKey + ':'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body || undefined,
  })
  return { ok: res.ok, status: res.status, data: await res.json() }
}

export async function onRequestPost(context) {
  const config = getConfig(context.env)
  const { token } = extractAuth(context.request)
  const lang = extractLang(context.request)
  const jwt = await verifyJwt(token, config)

  if (!jwt.valid) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }
  if (!config.stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'stripe_not_configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }

  let body
  try { body = await context.request.json() }
  catch { return new Response(JSON.stringify({ error: 'invalid_body' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }

  const { plan, seats } = body
  if (!plan || !VALID_PLANS.includes(plan)) {
    return new Response(JSON.stringify({ error: 'invalid_plan', valid: VALID_PLANS }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const seatCount = parseInt(seats, 10) || 1
  const maxSeats = MAX_SEATS_BY_PLAN[plan] || 3
  if (seatCount < 1 || seatCount > maxSeats) {
    return new Response(JSON.stringify({ error: 'invalid_seats', min: 1, max: maxSeats }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const localeConfig = LOCALE_MAP[lang] || LOCALE_MAP.fr
  const priceId = getPriceId(context.env, plan, localeConfig.currency)
  if (!priceId) {
    return new Response(JSON.stringify({ error: 'price_not_configured', plan, currency: localeConfig.currency }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }

  const profile = await getProfile(config, jwt.userId)
  const email = await getUserEmail(config, jwt.userId)

  const params = new URLSearchParams()
  params.append('mode', 'subscription')
  params.append('payment_method_types[0]', 'card')
  params.append('line_items[0][price]', priceId)
  params.append('line_items[0][quantity]', seatCount.toString())
  params.append('client_reference_id', jwt.userId)
  params.append('success_url', 'https://scalyo.app/app/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}')
  params.append('cancel_url', 'https://scalyo.app/app/settings?checkout=cancel')
  params.append('allow_promotion_codes', 'true')
  params.append('billing_address_collection', 'required')
  params.append('tax_id_collection[enabled]', 'true')
  params.append('locale', localeConfig.stripeLocale)
  params.append('subscription_data[metadata][user_id]', jwt.userId)
  params.append('subscription_data[metadata][plan]', plan)

  if (profile && profile.stripe_customer_id) {
    params.append('customer', profile.stripe_customer_id)
  } else if (email) {
    params.append('customer_email', email)
  }

  const result = await stripeRequest(config.stripeSecretKey, 'POST', '/checkout/sessions', params.toString())
  if (!result.ok) {
    return new Response(JSON.stringify({ error: 'checkout_failed' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ url: result.data.url, session_id: result.data.id }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}