// POST /api/invite/accept — Accept invitation and join org
import { jsonResponse, errorResponse } from '../../_utils/response.js'
import { createSupabaseClient, getAuthUser } from '../../_utils/supabase.js'

export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const body = await request.json()
    const { token } = body
    if (!token) return errorResponse(400, 'Token required')

    const db = createSupabaseClient(env)

    // Verify invitation
    const invitation = await db.selectOne('invitations', 'token=eq.' + token + '&status=eq.pending')
    if (!invitation) return errorResponse(404, 'Invalid or expired invitation')
    if (new Date(invitation.expires_at) < new Date()) {
      await db.update('invitations', 'id=eq.' + invitation.id, { status: 'expired' })
      return errorResponse(410, 'Invitation expired')
    }

    // Get authenticated user
    const user = await getAuthUser(request, env)
    if (!user) return errorResponse(401, 'Authentication required')

    // Add user to org
    await db.insert('organization_members', {
      organization_id: invitation.organization_id,
      user_id: user.id,
      role: invitation.role,
    })

    // Update profile with org id
    await db.update('profiles', 'id=eq.' + user.id, {
      organization_id: invitation.organization_id,
    })

    // Mark invitation as accepted
    await db.update('invitations', 'id=eq.' + invitation.id, {
      status: 'accepted',
      activated_at: new Date().toISOString(),
    })

    // Log in activity
    await db.insert('activity_log', {
      organization_id: invitation.organization_id,
      user_id: user.id,
      action: 'create',
      entity_type: 'team',
      entity_id: user.id,
      changes: { role: { old: null, new: invitation.role }, email: { old: null, new: invitation.email } },
    })

    return jsonResponse({ success: true, organization_id: invitation.organization_id, role: invitation.role })
  } catch (err) {
    return errorResponse(500, err.message || 'Server error')
  }
}
