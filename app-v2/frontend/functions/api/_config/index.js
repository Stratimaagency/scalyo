// === SCALYO — Configuration centralisee ===
// Provider IA : Mistral (Paris, EU) — RGPD conforme
// Cles secretes dans Cloudflare env vars uniquement.

const SUPABASE_URL = 'https://hcqninmpmzpqjtedyjyj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ggGyERhPutrfMdrQ7Ig0Ow_2R_vrRJA'

export function getConfig(env) {
  return {
    aiModel: env.AI_MODEL || 'mistral-medium-latest',
    maxTokens: parseInt(env.AI_MAX_TOKENS || '2048', 10),
    mistralApiKey: env.MISTRAL_API_KEY || '',
    supabaseUrl: env.SUPABASE_URL || SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    supabaseJwtSecret: env.SUPABASE_JWT_SECRET || '',
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    resendApiKey: env.RESEND_API_KEY || '',
  }
}

export function getApiKey(config) {
  return config.mistralApiKey
}
