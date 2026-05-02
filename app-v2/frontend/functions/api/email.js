// === SCALYO — Email Send via Resend ===
// POST /api/email/send
// Elite plan only. Sends transactional email via Resend API.

import { getConfig } from './_config/index.js'
import { getPlan, isModuleAllowed } from './_config/plans.js'
import { extractLang, extractAuth, verifyJwt } from './_services/auth.service.js'
import { jsonOk, jsonError } from './_utils/response.js'

export async function onRequestPost(context) {
  const config = getConfig(context.env)
  const lang = extractLang(context.request)
  const { token } = extractAuth(context.request)
  const jwt = await verifyJwt(token, config)

  if (!jwt.valid) return jsonError('unauthorized', 401, lang)

  const resendKey = config.resendApiKey
  if (!resendKey) {
    return jsonError('server_error', 503, lang)
  }

  // Check plan — email module is Elite only
  const profileResp = await fetch(
    config.supabaseUrl + '/rest/v1/profiles?id=eq.' + jwt.userId + '&select=plan',
    { headers: { 'apikey': config.supabaseAnonKey, 'Authorization': 'Bearer ' + token } }
  )
  const profiles = await profileResp.json()
  const planId = profiles[0]?.plan || 'starter'

  if (!isModuleAllowed(planId, 'email')) {
    return jsonError('forbidden', 403, lang)
  }

  // Parse request body
  let body
  try {
    body = await context.request.json()
  } catch {
    return jsonError('invalid_input', 400, lang)
  }

  const { to, subject, html, replyTo } = body
  if (!to || !subject || !html) {
    return jsonError('invalid_input', 400, lang)
  }

  // Send via Resend
  const resendResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + resendKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: body.from_name ? (body.from_name + ' via Scalyo <contact@scalyo.app>') : 'Scalyo <contact@scalyo.app>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo || undefined,
    }),
  })

  if (!resendResp.ok) {
    const err = await resendResp.text()
    console.error('Resend error:', err)
    return jsonError('server_error', 502, lang)
  }

  const resendData = await resendResp.json()

  // Log in sent_emails table
  await fetch(
    config.supabaseUrl + '/rest/v1/sent_emails',
    {
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
    }
  )

  return jsonOk({ sent: true, id: resendData.id })
}
