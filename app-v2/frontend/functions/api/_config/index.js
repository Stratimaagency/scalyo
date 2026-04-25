export function getConfig(env) {
  return {
    aiProvider: env.AI_PROVIDER || 'anthropic',
    aiModel: env.AI_MODEL || 'claude-sonnet-4-20250514',
    maxTokens: parseInt(env.AI_MAX_TOKENS || '1024', 10),
    anthropicApiKey: env.ANTHROPIC_API_KEY || '',
    anthropicVersion: env.ANTHROPIC_VERSION || '2023-06-01',
    supabaseUrl: env.SUPABASE_URL || '',
    supabaseServiceKey: env.SUPABASE_SERVICE_KEY || '',
  }
}
