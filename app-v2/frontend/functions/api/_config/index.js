// === SCALYO — Configuration centralisee ===
// Valeurs publiques (Supabase) = constantes. Cles secretes (IA/Stripe) = env vars Cloudflare.

const SUPABASE_URL = 'https://hcqninmpmzpqjtedyjyj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ggGyERhPutrfMdrQ7Ig0Ow_2R_vrRJA'

export function getConfig(env) {
  const provider = env.AI_PROVIDER || 'mistral'
  return {
    aiProvider: provider,
    aiModel: env.AI_MODEL || ({ deepseek: 'deepseek-chat', anthropic: 'claude-sonnet-4-20250514', mistral: 'mistral-medium-latest' }[provider] || 'deepseek-chat'),
    maxTokens: parseInt(env.AI_MAX_TOKENS || '2048', 10),
    deepseekApiKey: env.DEEPSEEK_API_KEY || '',
    mistralApiKey: env.MISTRAL_API_KEY || '',
    anthropicApiKey: env.ANTHROPIC_API_KEY || '',
    anthropicVersion: env.ANTHROPIC_VERSION || '2023-06-01',
    supabaseUrl: env.SUPABASE_URL || SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    supabaseJwtSecret: env.SUPABASE_JWT_SECRET || '',
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    resendApiKey: env.RESEND_API_KEY || '',
  }
}

export function getApiKey(config) {
  const keys = { anthropic: config.anthropicApiKey, deepseek: config.deepseekApiKey, mistral: config.mistralApiKey }
  return keys[config.aiProvider] || ''
}
