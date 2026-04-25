import { callAI } from '../_services/ai.service.js'
import { getNotifPrompt } from '../_prompts/notif.prompts.js'
import { buildRichContext, getUserIdFromJwt } from '../_services/context.service.js'
import { extractAuth } from '../_services/auth.service.js'

export async function handle(env, body, request) {
  const { token } = extractAuth(request)
  const userId = getUserIdFromJwt(token)
  const ctx = await buildRichContext(env, userId)
  const alertData = body.alerts ? JSON.stringify(body.alerts) : body.message || ''
  const systemPrompt = getNotifPrompt(body.lang, ctx.summary)

  const messages = [
    { role: 'user', content: 'Enrichis ces alertes : ' + alertData },
  ]

  const response = await callAI(env, { systemPrompt, messages })
  return { response }
}
