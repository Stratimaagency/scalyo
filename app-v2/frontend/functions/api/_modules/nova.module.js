import { callAI } from '../_services/ai.service.js'
import { getNovaPrompt } from '../_prompts/nova.prompts.js'
import { buildRichContext } from '../_services/context.service.js'
import { extractAuth, verifyJwt } from '../_services/auth.service.js'

export async function handle(env, body, request) {
  const { token } = extractAuth(request)
  const { userId } = verifyJwt(token)
  const ctx = await buildRichContext(env, userId)
  const cd = body.clientData || body.client || ''
  const systemPrompt = getNovaPrompt(body.lang, ctx.summary, typeof cd === 'object' ? JSON.stringify(cd) : cd)

  const messages = [
    ...(body.history || []).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: body.message },
  ]
  const response = await callAI(env, { systemPrompt, messages })
  return { response }
}
