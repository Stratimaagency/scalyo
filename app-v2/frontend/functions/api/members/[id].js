// DELETE /api/members/[id] — Remove a member from the org
import { jsonResponse, errorResponse } from '../_utils/response.js'
import { createSupabaseClient, getAuthUser, getUserMembership } from '../_utils/supabase.js'
import { canPerform, isRoleAbove } from '../_config/plans.config.js'

export async function onRequestDelete(context) {
  const { request, env, params } = context
  try {
    const targetId = params.id
    if (!targetId) return errorResponse(400, 'Member ID required')

    const user = await getAuthUser(request, env)
    if (!user) return errorResponse(401, 'Unauthorized')
    const db = createSupabaseClient(env)
    const membership = await getUserMembership(db, user.id)
    if (!membership) return errorResponse(403, 'No organization')
    if (!canPerform(membership.role, 'canRevoke')) return errorResponse(403, 'Permission denied')

    // Get target member
    const target = await db.selectOne('organization_members', 'id=eq.' + targetId + '&organization_id=eq.' + membership.organization_id)
    if (!target) return errorResponse(404, 'Member not found')

    // Cannot remove yourself
    if (target.user_id === user.id) return errorResponse(400, 'Cannot remove yourself')
    // Cannot remove someone with higher or equal role
    if (!isRoleAbove(membership.role, target.role) && membership.role !== 'owner') return errorResponse(403, 'Cannot remove this role')
    // Cannot remove owner
    if (target.role === 'owner') return errorResponse(403, 'Cannot remove the owner')

    await db.remove('organization_members', 'id=eq.' + targetId)
    await db.update('profiles', 'id=eq.' + target.user_id, { organization_id: null, org_role: 'member' })

    // Log
    await db.insert('activity_log', {
      organization_id: membership.organization_id,
      user_id: user.id,
      action: 'delete',
      entity_type: 'team',
      entity_id: target.user_id,
      changes: { role: { old: target.role, new: null } },
    })

    return jsonResponse({ success: true })
  } catch (err) {
    return errorResponse(500, err.message || 'Server error')
  }
}
