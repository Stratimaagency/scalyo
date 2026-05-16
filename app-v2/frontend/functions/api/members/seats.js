// PATCH /api/members/seats — Update seat quantity (Stripe sync)
import { jsonResponse, errorResponse } from '../_utils/response.js'
import { createSupabaseClient, getAuthUser, getUserMembership } from '../_utils/supabase.js'
import { canPerform } from '../_config/plans.config.js'

export async function onRequestPatch(context) {
  const { request, env } = context
  try {
    const user = await getAuthUser(request, env)
    if (!user) return errorResponse(401, 'Unauthorized')
    const db = createSupabaseClient(env)
    const membership = await getUserMembership(db, user.id)
    if (!membership) return errorResponse(403, 'No organization')
    if (!canPerform(membership.role, 'canManageBilling')) return errorResponse(403, 'Permission denied')

    const body = await request.json()
    const { quantity } = body
    if (!quantity || typeof quantity !== 'number' || quantity < 1) return errorResponse(400, 'Invalid quantity')

    const org = await db.selectOne('organizations', 'id=eq.' + membership.organization_id)
    if (!org) return errorResponse(404, 'Organization not found')

    // Check current usage
    const members = await db.select('organization_members', 'organization_id=eq.' + org.id)
    const seatsUsed = members.filter(m => m.role !== 'viewer').length
    if (quantity < seatsUsed) return errorResponse(400, 'Cannot reduce below current usage (' + seatsUsed + ' seats in use)')

    // Update Stripe subscription quantity
    if (org.stripe_subscription_id && env.STRIPE_SECRET_KEY) {
      const stripeResp = await fetch('https://api.stripe.com/v1/subscriptions/' + org.stripe_subscription_id, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'items[0][quantity]=' + quantity + '&proration_behavior=create_prorations',
      })
      if (!stripeResp.ok) return errorResponse(502, 'Stripe update failed')
    }

    // Update org
    await db.update('organizations', 'id=eq.' + org.id, { seats_paid: quantity })

    // Log
    await db.insert('activity_log', {
      organization_id: org.id,
      user_id: user.id,
      action: 'update',
      entity_type: 'settingsOrg',
      entity_id: org.id,
      changes: { seats_paid: { old: org.seats_paid, new: quantity } },
    })

    return jsonResponse({ success: true, seats_paid: quantity })
  } catch (err) {
    return errorResponse(500, err.message || 'Server error')
  }
}
