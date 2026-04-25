import { getConfig, getApiKey } from './_config/index.js'
import { jsonError } from './_utils/response.js'
import { extractLang } from './_services/auth.service.js'
import { handle as coachHandle } from './_modules/coach.module.js'

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

    const result = await coachHandle(env, body, request)
    return Response.json(result)
  } catch (e) {
    console.error('Coach error:', e)
    return jsonError('ai_unavailable', 502, lang)
  }
}
