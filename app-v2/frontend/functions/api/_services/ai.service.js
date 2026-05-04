import { getConfig, getApiKey } from '../_config/index.js'
import { callAnthropic } from '../_providers/anthropic.js'
import { callDeepSeek } from '../_providers/deepseek.js'
import { callMistral } from '../_providers/mistral.js'

const providers = { anthropic: callAnthropic, deepseek: callDeepSeek, mistral: callMistral }

export async function callAI(env, { systemPrompt, messages, maxTokens }) {
  const config = getConfig(env)
  const providerFn = providers[config.aiProvider]
  if (!providerFn) throw new Error('Unknown provider: ' + config.aiProvider)

  const apiKey = getApiKey(config)
  if (!apiKey) throw new Error('NO_API_KEY')

  return providerFn({
    apiKey,
    model: config.aiModel,
    version: config.anthropicVersion,
    maxTokens: maxTokens || config.maxTokens,
    systemPrompt,
    messages,
  })
}
