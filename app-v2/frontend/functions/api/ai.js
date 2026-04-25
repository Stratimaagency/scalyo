import { getConfig, getApiKey } from './_config/index.js'
import { validateAiRequest } from './_utils/validate.js'
import { jsonOk, jsonError } from './_utils/response.js'
import { extractLang } from './_services/auth.service.js'
import { getModule } from './_modules/index.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const lang = extractLang(request)

  try {
    const config = getConfig(env)
    if (!getApiKey(config)) {
      return jsonError('ai_not_configured', 503, lang)
    }

    const body = await request.json()
    body.lang = body.lang || lang

    const validation = validateAiRequest(body)
    if (!validation.valid) {
      return jsonError(validation.reason, 400, lang)
    }

    const handler = getModule(body.module)
    if (!handler) {
      return jsonError('module_not_found', 400, lang)
    }

    const result = await handler(env, body, request)
    return jsonOk(result)
  } catch (e) {
    console.error('AI route error:', e)
    if (e.message === 'NO_API_KEY') return jsonError('ai_not_configured', 503, lang)
    return jsonError('ai_unavailable', 502, lang)
  }
}
