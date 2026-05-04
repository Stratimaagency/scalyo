import { getConfig, getApiKey } from '../_config/index.js'
import { callMistral } from '../_providers/mistral.js'

export async function callAI(env, { systemPrompt, messages, maxTokens }) {
  const config = getConfig(env)
  const apiKey = getApiKey(config)
  if (!apiKey) throw new Error('NO_API_KEY')

  return callMistral({
    apiKey,
    model: config.aiModel,
    maxTokens: maxTokens || config.maxTokens,
    systemPrompt,
    messages,
  })
}
