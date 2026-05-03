// === SCALYO — Email Send via Resend (org-level config) ===
// POST /api/email
// Elite plan only. Key stored per-org in org_email_config (not env var).

import { getConfig } from './_config/index.js'
import { isModuleAllowed } from './_config/plans.js'
import { extractLang, extractAuth, verifyJwt } from './_services/auth.service.js'
import { jsonOk, jsonError } from './_utils/response.js'

export async function onRequestPost(context) {
  const config = getConfig(context.env)
  const lang = extractLang(context.request)

  try {
    const { token } = extractAuth(context.request)
    const jwt = await verifyJwt(token, config)
    if (!jwt.valid) return jsonError('unauthorized', 401, lang)

    // Check plan
    const profileResp = await fetch(
      config.supabaseUrl + '/rest/v1/profiles?id=eq.' + jwt.userId + '&select=plan',
      { headers: { 'apikey': config.supabaseAnonKey, 'Authorization': 'Bearer ' + token } }
    )
    const profiles = await profileResp.json()
    const planId = profiles[0]?.plan || 'starter'

    if (!isModuleAllowed(planId, 'email')) {
      return jsonError('module_not_allowed', 403, lang)
    }

    // Get Resend key from org config via SECURITY DEFINER RPC
    const rpcResp = await fetch(
      config.supabaseUrl + '/rest/v1/rpc/get_org_email_config',
      {
        method: 'POST',
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_owner_id: jwt.userId }),
      }
    )

    if (!rpcResp.ok) {
      console.error('RPC error:', rpcResp.status, await rpcResp.text())
      return jsonError('email_not_configured', 400, lang)
    }

    const emailConfig = await rpcResp.json()
    const configRow = Array.isArray(emailConfig) ? emailConfig[0] : emailConfig
    const resendKey = configRow?.resend_api_key || null

    if (!resendKey) {
      return jsonError('email_not_configured', 400, lang)
    }

    // Parse request body
    let body
    try { body = await context.request.json() } catch { return jsonError('invalid_request', 400, lang) }

    const { to, subject, html, replyTo } = body
    if (!to || !subject || !html) {
      return jsonError('invalid_request', 400, lang)
    }

    // Build sender
    const senderName = configRow?.sender_name || ''
    const senderDomain = configRow?.sender_domain || ''
    let fromAddress = 'Scalyo <contact@scalyo.app>'

    if (senderDomain) {
      const localName = senderName || 'CS Team'
      fromAddress = localName + ' <noreply@' + senderDomain + '>'
    } else if (body.from_name) {
      fromAddress = body.from_name + ' via Scalyo <contact@scalyo.app>'
    }

    // Send via Resend
    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo || undefined,
      }),
    })

    if (!resendResp.ok) {
      const err = await resendResp.text()
      console.error('Resend error:', err)
      return jsonError('server_error', 500, lang)
    }

    const resendData = await resendResp.json()

    // Log in sent_emails
    context.waitUntil(
      fetch(config.supabaseUrl + '/rest/v1/sent_emails', {
        method: 'POST',
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: jwt.userId,
          recipient: Array.isArray(to) ? to.join(', ') : to,
          subject,
          resend_id: resendData.id || null,
        }),
      })
    )

    return jsonOk({ sent: true, id: resendData.id })
  } catch (err) {
    console.error('email.js crash:', err?.message || err)
    return jsonError('server_error', 500, lang)
  }
}
