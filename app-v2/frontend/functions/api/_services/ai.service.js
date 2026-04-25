import { getConfig } from '../_config/index.js'
import { callAnthropic } from '../_providers/anthropic.js'

const providers = {
  anthropic: callAnthropic,
}

export async function callAI(env, { systemPrompt, messages, maxTokens }) {
  const config = getConfig(env)
  const providerFn = providers[config.aiProvider]

  if (!providerFn) {
    throw new Error('Unknown AI provider: ' + config.aiProvider)
  }

  return providerFn({
    apiKey: config.anthropicApiKey,
    model: config.aiModel,
    version: config.anthropicVersion,
    maxTokens: maxTokens || config.maxTokens,
    systemPrompt,
    messages,
  })
}
