// POST /api/alpha/verify — Validate alpha invite code
// Compares submitted code against ALPHA_INVITE_CODE env var
// Returns 200 { valid: true } or 403 { valid: false }

import { jsonResponse, errorResponse } from '../_utils/response.js'
import { t } from '../_i18n/messages.js'

export async function onRequestPost(context) {
  const { request, env } = context

  // Validate env var exists
  const validCode = env.ALPHA_INVITE_CODE
  if (!validCode) {
    return errorResponse(503, t('alpha_not_configured', 'en'))
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, t('invalid_request', 'en'))
  }

  const { code, lang = 'fr' } = body

  // Validate input
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return errorResponse(400, t('alpha_code_required', lang))
  }

  // Constant-time comparison
  const submitted = code.trim().toUpperCase()
  const expected = validCode.trim().toUpperCase()

  if (submitted.length !== expected.length) {
    return errorResponse(403, t('alpha_code_invalid', lang))
  }

  let match = true
  for (let i = 0; i < expected.length; i++) {
    if (submitted.charCodeAt(i) !== expected.charCodeAt(i)) {
      match = false
    }
  }

  if (!match) {
    return errorResponse(403, t('alpha_code_invalid', lang))
  }

  return jsonResponse({ valid: true })
}
