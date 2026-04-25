import { callAI } from '../_services/ai.service.js'
import { getCopilPrompt } from '../_prompts/copil.prompts.js'
import { buildRichContext, getUserIdFromJwt } from '../_services/context.service.js'
import { extractAuth } from '../_services/auth.service.js'

export async function handle(env, body, request) {
  const { token } = extractAuth(request)
  const userId = getUserIdFromJwt(token)
  const ctx = await buildRichContext(env, userId)
  const systemPrompt = getCopilPrompt(body.lang, ctx.summary)

  const messages = [
    { role: 'user', content: body.message || 'Genere un rapport COPIL avec les donnees disponibles.' },
  ]

  const response = await callAI(env, { systemPrompt, messages, maxTokens: 3000 })
  return { response }
}
