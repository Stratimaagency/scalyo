import { getConfig, getApiKey } from './_config/index.js'
import { jsonOk, jsonError } from './_utils/response.js'
import { extractLang, extractAuth, verifyJwt } from './_services/auth.service.js'
import { checkQuota, logUsage } from './_services/quota.service.js'
import { callAI } from './_services/ai.service.js'

const PROMPT = 'Tu es Nova Sante, expert en sante mentale et physique dedie aux professionnels du Customer Success. Ton : Chaleureux, rassurant, professionnel. Domaines : stress, anxiete, burnout, sommeil, nutrition, equilibre vie pro/perso. REFUS ABSOLU sur business/client/sales/CS : redirige vers Coach IA. LIMITES : pas medecin, pas psychotherapeute. FORMAT : validation emotionnelle, 2-3 techniques concretes, question douce. CONFIDENTIALITE ABSOLUE.'
const LANG = { fr: 'Reponds en francais.', en: 'Reply in English.', ko: '\uD55C\uAD6D\uC5B4\uB85C \uB2F5\uBCC0\uD558\uC138\uC694.' }

export async function onRequestPost(context) {
  const { request, env } = context
  const lang = extractLang(request)
  try {
    const { token } = extractAuth(request)
    const config = getConfig(env)
    const auth = await verifyJwt(token, config)
    if (!auth.valid) return jsonError('unauthorized', 401, lang)
    if (!getApiKey(config)) return jsonError('ai_not_configured', 503, lang)

    const body = await request.json()
    const userLang = body.lang || lang
    const systemPrompt = PROMPT + ' ' + (LANG[userLang] || LANG.fr)
    const messages = [
      ...(body.history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: body.message || '' },
    ]

    const response = await callAI(env, { systemPrompt, messages })
    context.waitUntil(logUsage(env, auth.userId, token, 'wellbeing'))
    return jsonOk({ response })
  } catch (e) {
    console.error('wellbeing error:', e)
    return jsonError('ai_unavailable', 503, lang)
  }
}
