export function getConfig(env) {
  const provider = env.AI_PROVIDER || 'deepseek'
  return {
    aiProvider: provider,
    aiModel: env.AI_MODEL || (provider === 'deepseek' ? 'deepseek-chat' : 'claude-sonnet-4-20250514'),
    maxTokens: parseInt(env.AI_MAX_TOKENS || '2048', 10),
    anthropicApiKey: env.ANTHROPIC_API_KEY || '',
    anthropicVersion: env.ANTHROPIC_VERSION || '2023-06-01',
    deepseekApiKey: env.DEEPSEEK_API_KEY || '',
    supabaseUrl: env.SUPABASE_URL || 'https://hcqninmpmzpqjtedyjyj.supabase.co',
    supabaseAnonKey: env.SUPABASE_ANON_KEY || 'sb_publishable_ggGyERhPutrfMdrQ7Ig0Ow_2R_vrRJA',
  }
}

export function getApiKey(config) {
  const keys = { anthropic: config.anthropicApiKey, deepseek: config.deepseekApiKey }
  return keys[config.aiProvider] || ''
}
