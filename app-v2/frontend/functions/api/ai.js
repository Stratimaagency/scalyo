import { getConfig, getApiKey } from './_config/index.js'
import { isModuleAllowed } from './_config/plans.js'
import { validateAiRequest } from './_utils/validate.js'
import { jsonOk, jsonError } from './_utils/response.js'
import { extractLang, extractAuth, verifyJwt, getUserPlan } from './_services/auth.service.js'
import { checkRateLimit } from './_services/rate-limit.service.js'
import { checkQuota, logUsage } from './_services/quota.service.js'
import { getModule } from './_modules/index.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const lang = extractLang(request)

  try {
    // 1. Auth — JWT signature verification
    const { token } = extractAuth(request)
    const config = getConfig(env)
    const auth = await verifyJwt(token, config.supabaseJwtSecret)
    if (!auth.valid) return jsonError('unauthorized', 401, lang)

    // 2. Rate limit — 10 req/min per user
    const rate = checkRateLimit(auth.userId)
    if (!rate.allowed) return jsonError('rate_limited', 429, lang)

    // 3. API key check
    if (!getApiKey(config)) return jsonError('ai_not_configured', 503, lang)

    // 4. Parse + validate (size limits enforced)
    const body = await request.json()
    body.lang = body.lang || lang
    const validation = validateAiRequest(body)
    if (!validation.valid) return jsonError(validation.reason, 400, lang)

    // 5. Plan + module access check
    const planId = await getUserPlan(auth.userId, config.supabaseUrl, config.supabaseAnonKey, token)
    if (!isModuleAllowed(planId, body.module)) {
      return jsonError('module_not_allowed', 403, lang)
    }

    // 6. Quota check
    const quota = await checkQuota(env, auth.userId, body.module, planId, token)
    if (!quota.allowed) return jsonError('quota_exceeded', 429, lang)

    // 7. Execute module
    const handler = getModule(body.module)
    if (!handler) return jsonError('module_not_found', 400, lang)
    const result = await handler(env, body, request)

    // 8. Log usage (non-blocking)
    logUsage(env, auth.userId, body.module, token)

    return jsonOk({ ...result, usage: { used: quota.used + 1, max: quota.max } })
  } catch (e) {
    console.error('AI error:', e)
    if (e.message === 'NO_API_KEY') return jsonError('ai_not_configured', 503, lang)
    return jsonError('ai_unavailable', 502, lang)
  }
}
