export async function onRequestGet(context) {
  const env = context.env
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env_check: {
      DEEPSEEK_API_KEY: !!env.DEEPSEEK_API_KEY,
      SUPABASE_JWT_SECRET: !!env.SUPABASE_JWT_SECRET,
      STRIPE_WEBHOOK_SECRET: !!env.STRIPE_WEBHOOK_SECRET,
      SUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: !!env.RESEND_API_KEY,
    }
  })
}
