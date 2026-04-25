import { callAI } from '../_services/ai.service.js'
import { getImportPrompt } from '../_prompts/import.prompts.js'

export async function handle(env, { data, action, lang }) {
  const systemPrompt = getImportPrompt(lang)

  const messages = [
    { role: 'user', content: JSON.stringify({ action, data }) },
  ]

  const response = await callAI(env, { systemPrompt, messages })
  return { response }
}
