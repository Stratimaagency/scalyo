import { callAI } from '../_services/ai.service.js'
import { getCoachPrompt } from '../_prompts/coach.prompts.js'
import { buildRichContext } from '../_services/context.service.js'
import { extractAuth, verifyJwt } from '../_services/auth.service.js'

export async function handle(env, body, request) {
  const { token } = extractAuth(request)
  const { userId } = verifyJwt(token)
  const ctx = await buildRichContext(env, userId)
  const systemPrompt = getCoachPrompt(body.lang, ctx.summary || body.context || '')

  const messages = [
    ...(body.history || []).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: body.message },
  ]
  const response = await callAI(env, { systemPrompt, messages })
  return { response }
}
