import { callAI } from '../_services/ai.service.js'
import { getDashboardPrompt } from '../_prompts/dashboard.prompts.js'
import { buildRichContext, getUserIdFromJwt } from '../_services/context.service.js'
import { extractAuth } from '../_services/auth.service.js'

export async function handle(env, body, request) {
  const { token } = extractAuth(request)
  const userId = getUserIdFromJwt(token)
  const ctx = await buildRichContext(env, userId)
  const systemPrompt = getDashboardPrompt(body.lang, ctx.summary)

  const messages = [
    { role: 'user', content: body.message || 'Analyse mon portfolio et donne-moi les insights cles.' },
  ]

  const response = await callAI(env, { systemPrompt, messages, maxTokens: 2000 })
  return { response }
}
