// POST /api/stripe/webhook.js — Handle Stripe webhook events
// Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET env vars
import { createSupabaseClient } from '../_utils/supabase.js'
import { getPlan } from '../_config/plans.config.js'

async function verifyStripeSignature(request, secret) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig || !secret) return { body: null, error: 'Missing signature' }

  const parts = Object.fromEntries(sig.split(',').map(p => { const [k,v] = p.split('='); return [k,v] }))
  const timestamp = parts.t
  const expected = parts.v1
  if (!timestamp || !expected) return { body: null, error: 'Invalid signature format' }

  // Verify timestamp (reject if older than 5 min)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp)
  if (age > 300) return { body: null, error: 'Timestamp too old' }

  // HMAC-SHA256 verification
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp + '.' + body))
  const computed = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (computed !== expected) return { body: null, error: 'Signature mismatch' }
  return { body: JSON.parse(body), error: null }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const headers = { 'Content-Type': 'application/json' }

  const { body: event, error } = await verifyStripeSignature(request, env.STRIPE_WEBHOOK_SECRET)
  if (error) return new Response(JSON.stringify({ error }), { status: 400, headers })

  const db = createSupabaseClient(env)

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode !== 'subscription') break

        const customerId = session.customer
        const subscriptionId = session.subscription
        const email = session.customer_details?.email
        const companyName = session.custom_fields?.find(f => f.key === 'company')?.text?.value || ''

        // Get subscription details from Stripe
        const subResp = await fetch('https://api.stripe.com/v1/subscriptions/' + subscriptionId, {
          headers: { 'Authorization': 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':') }
        })
        const sub = await subResp.json()
        const quantity = sub.items?.data?.[0]?.quantity || 1
        const priceId = sub.items?.data?.[0]?.price?.id || ''

        // Determine plan from price
        const planMap = {}
        for (const [key, plan] of Object.entries((await import('../_config/plans.config.js')).PLANS)) {
          planMap[key] = plan
        }
        // Match by price amount (cents)
        const unitAmount = sub.items?.data?.[0]?.price?.unit_amount
        let planKey = 'starter'
        if (unitAmount === 11900) planKey = 'growth'
        else if (unitAmount === 15900) planKey = 'elite'
        else if (unitAmount === 7900) planKey = 'starter'

        const planConfig = getPlan(planKey)

        // Find user by email
        const authResp = await fetch(env.SUPABASE_URL + '/auth/v1/admin/users?filter=' + encodeURIComponent(email), {
          headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY }
        })

        let userId = null
        if (authResp.ok) {
          const users = await authResp.json()
          const match = (users.users || users || []).find(u => u.email === email)
          if (match) userId = match.id
        }

        if (!userId) break

        // Check if org already exists for this user
        const existingMember = await db.selectOne('organization_members', 'user_id=eq.' + userId)
        if (existingMember) {
          // Update existing org with Stripe data
          await db.update('organizations', 'id=eq.' + existingMember.organization_id, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            seats_paid: quantity,
            plan: planKey,
          })
          break
        }

        // Create new org
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
        const [org] = await db.insert('organizations', {
          name: companyName || email.split('@')[0],
          owner_id: userId,
          plan: planKey,
          seats_paid: quantity,
          max_clients: planConfig ? planConfig.maxClients : null,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          trial_ends_at: trialEnd,
        })

        await db.insert('organization_members', { organization_id: org.id, user_id: userId, role: 'owner' })
        await db.update('profiles', 'id=eq.' + userId, { organization_id: org.id })

        await db.insert('activity_log', {
          organization_id: org.id, user_id: userId, action: 'create',
          entity_type: 'settingsOrg', entity_id: org.id,
          changes: { plan: { old: null, new: planKey }, source: { old: null, new: 'stripe_checkout' } },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object
        const quantity = sub.items?.data?.[0]?.quantity || 1
        const customerId = sub.customer

        const org = await db.selectOne('organizations', 'stripe_customer_id=eq.' + customerId)
        if (!org) break

        const oldSeats = org.seats_paid
        if (quantity !== oldSeats) {
          await db.update('organizations', 'id=eq.' + org.id, { seats_paid: quantity })
          await db.insert('activity_log', {
            organization_id: org.id, user_id: org.owner_id, action: 'update',
            entity_type: 'settingsOrg', entity_id: org.id,
            changes: { seats_paid: { old: oldSeats, new: quantity } },
          })
        }

        // Sync plan if price changed
        const unitAmount = sub.items?.data?.[0]?.price?.unit_amount
        let newPlan = org.plan
        if (unitAmount === 7900) newPlan = 'starter'
        else if (unitAmount === 11900) newPlan = 'growth'
        else if (unitAmount === 15900) newPlan = 'elite'
        if (newPlan !== org.plan) {
          await db.update('organizations', 'id=eq.' + org.id, { plan: newPlan })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const customerId = sub.customer
        const org = await db.selectOne('organizations', 'stripe_customer_id=eq.' + customerId)
        if (!org) break
        await db.update('organizations', 'id=eq.' + org.id, { plan: 'expired', seats_paid: 0 })
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}
