// POST /api/invite — Send team invitation
import { jsonResponse, errorResponse } from '../_utils/response.js'
import { createSupabaseClient, getAuthUser, getUserMembership } from '../_utils/supabase.js'
import { canPerform, canAddSeat, canAddViewer, getAvailableRolesForInvite, ORG_SETTINGS } from '../_config/plans.config.js'
import { t } from '../_i18n/messages.js'

export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const user = await getAuthUser(request, env)
    if (!user) return errorResponse(401, t('unauthorized'))
    const db = createSupabaseClient(env)
    const membership = await getUserMembership(db, user.id)
    if (!membership) return errorResponse(403, 'No organization')
    if (!canPerform(membership.role, 'canInvite')) return errorResponse(403, 'Permission denied')

    const body = await request.json()
    const { email, role = 'member' } = body
    if (!email || typeof email !== 'string') return errorResponse(400, 'Email required')
    const normalizedEmail = email.trim().toLowerCase()

    const org = await db.selectOne('organizations', 'id=eq.' + membership.organization_id)
    if (!org) return errorResponse(404, 'Organization not found')

    const allowedRoles = getAvailableRolesForInvite(org.plan)
    if (!allowedRoles.includes(role)) return errorResponse(400, 'Invalid role for this plan')

    // Check if already a member
    const existing = await db.select('organization_members', 'organization_id=eq.' + org.id)
    const profiles = await db.select('profiles', 'organization_id=eq.' + org.id + '&select=id,email')
    // Note: email is on auth.users, not profiles. Check via existing members.

    // Check seat quota for non-viewer roles
    if (role !== 'viewer') {
      const seatsUsed = existing.filter(m => m.role !== 'viewer').length
      if (!canAddSeat(org.plan, seatsUsed)) return errorResponse(403, 'Seat limit reached')
    } else if (!canAddViewer(org.plan)) {
      return errorResponse(403, 'Viewers not available on this plan')
    }

    // Check no pending invitation for this email
    const pendingInvites = await db.select('invitations', 'organization_id=eq.' + org.id + '&email=eq.' + encodeURIComponent(normalizedEmail) + '&status=eq.pending')
    if (pendingInvites.length > 0) return errorResponse(409, 'Invitation already pending for this email')

    // Create invitation
    const [invitation] = await db.insert('invitations', {
      organization_id: org.id,
      invited_by: user.id,
      email: normalizedEmail,
      role: role,
    })

    // Send invitation email via Resend
    if (env.RESEND_API_KEY) {
      try {
        const joinUrl = 'https://scalyo.app/join?token=' + invitation.token
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + env.RESEND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Scalyo <noreply@scalyo.app>',
            to: [normalizedEmail],
            subject: org.name + ' vous invite sur Scalyo',
            html: [
              '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">',
              '<h2 style="color:#111827;margin-bottom:8px">Rejoignez ' + org.name + ' sur Scalyo</h2>',
              '<p style="color:#6b7280;font-size:15px;line-height:1.6">Vous avez \u00e9t\u00e9 invit\u00e9(e) \u00e0 rejoindre l\u2019\u00e9quipe en tant que <strong>' + role + '</strong>.</p>',
              '<a href="' + joinUrl + '" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">Accepter l\u2019invitation</a>',
              '<p style="color:#9ca3af;font-size:13px">Ce lien expire dans 7 jours. Si vous n\u2019avez pas demand\u00e9 cette invitation, ignorez cet email.</p>',
              '</div>'
            ].join('')
          })
        })
      } catch (emailErr) {
        console.error('Invitation email error:', emailErr.message)
      }
    }

    return jsonResponse({ invitation: { id: invitation.id, email: invitation.email, role: invitation.role, token: invitation.token, status: invitation.status, expires_at: invitation.expires_at } })
  } catch (err) {
    return errorResponse(500, err.message || 'Server error')
  }
}
