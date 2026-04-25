import { getConfig, getApiKey } from './_config/index.js'
import { isModuleAllowed } from './_config/plans.js'
import { validateAiRequest } from './_utils/validate.js'
import { jsonOk, jsonError } from './_utils/response.js'
import { extractLang, extractAuth, verifyJwt } from './_services/auth.service.js'
import { checkRateLimit } from './_services/rate-limit.service.js'
import { checkQuota, logUsage } from './_services/quota.service.js'
import { getModule } from './_modules/index.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const lang = extractLang(request)

  try {
    // 1. Auth — verify JWT signature (HMAC-SHA256)
    const { token } = extractAuth(request)
    const config = getConfig(env)
    const auth = await verifyJwt(token, config.supabaseJwtSecret)
    if (!auth.valid) return jsonError('unauthorized', 401, lang)

    // 2. Rate limit — 10 req/min per user (in-memory)
    const rate = checkRateLimit(auth.userId)
    if (!rate.allowed) return jsonError('rate_limited', 429, lang)

    // 3. API key available?
    if (!getApiKey(config)) return jsonError('ai_not_configured', 503, lang)

    // 4. Parse + validate inputs (module, message length, history length)
    const body = await request.json()
    body.lang = body.lang || lang
    const validation = validateAiRequest(body)
    if (!validation.valid) return jsonError(validation.reason, 400, lang)

    // 5. Get user plan from profile
    const planId = await getUserPlan(config, auth.userId, token)

    // 6. Module access — check plan allows this module
    if (!isModuleAllowed(planId, body.module)) {
      return jsonError('module_not_allowed', 403, lang)
    }

    // 7. Quota — check daily usage limit
    const quota = await checkQuota(env, auth.userId, token, planId, body.module)
    if (!quota.allowed) return jsonError('quota_exceeded', 429, lang)

    // 8. Execute module
    const handler = getModule(body.module)
    if (!handler) return jsonError('module_not_found', 400, lang)
    const result = await handler(env, body, request)

    // 9. Log usage (fire-and-forget)
    logUsage(env, auth.userId, token, body.module).catch(() => {})

    return jsonOk({
      ...result,
      quota: { used: (quota.used || 0) + 1, limit: quota.limit },
    })
  } catch (e) {
    console.error('AI error:', e)
    if (e.message === 'NO_API_KEY') return jsonError('ai_not_configured', 503, lang)
    return jsonError('ai_unavailable', 502, lang)
  }
}

async function getUserPlan(config, userId, userJwt) {
  try {
    const url = config.supabaseUrl + '/rest/v1/profiles?id=eq.' + userId + '&select=plan'
    const res = await fetch(url, {
      headers: { 'apikey': config.supabaseAnonKey, 'Authorization': 'Bearer ' + userJwt }
    })
    if (!res.ok) return 'starter'
    const rows = await res.json()
    return rows[0]?.plan || 'starter'
  } catch {
    return 'starter'
  }
}
