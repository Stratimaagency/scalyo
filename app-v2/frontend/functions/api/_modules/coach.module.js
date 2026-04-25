import { callAI } from '../_services/ai.service.js'
import { getCoachPrompt } from '../_prompts/coach.prompts.js'

export async function handle(env, { message, context, history, lang }) {
  const systemPrompt = getCoachPrompt(lang, context)

  const messages = [
    ...(history || []).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  const response = await callAI(env, { systemPrompt, messages })
  return { response }
}
