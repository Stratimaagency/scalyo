// ─── OAuth ────────────────────────────────────────────
export function getAuthUrl(env, state) {
  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/oauth/callback/slack`,
    scope: 'incoming-webhook',
    state,
  })
  return `https://slack.com/oauth/v2/authorize?${params}`
}

export async function exchangeCode(code, env) {
  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
      redirect_uri: `${env.APP_URL}/api/oauth/callback/slack`,
    }),
  })
  if (!res.ok) throw new Error('Slack OAuth failed')
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Slack OAuth failed')
  // Slack returns webhook in incoming_webhook.url
  return {
    access_token: data.access_token || '',
    webhook_url: data.incoming_webhook?.url || '',
    channel: data.incoming_webhook?.channel || '',
    team: data.team?.name || '',
  }
}

// ─── Connection ───────────────────────────────────────
export async function testConnection(config) {
  if (!config.webhookUrl) throw new Error('Webhook URL is required')

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Scalyo connected! You will receive customer alerts here.' }),
  })

  if (!res.ok) {
    throw new Error(`Slack webhook error: ${res.status}`)
  }
  return { ok: true, message: 'Slack connected — test message sent' }
}

export async function sendNotification(config, message) {
  if (!config.webhookUrl) return

  const channel = config.channel || undefined
  const payload = { text: message }
  if (channel) payload.channel = channel

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`Slack send failed: ${res.status}`)
  return { ok: true }
}

export async function sync() {
  // Slack is push-only (notifications), no data to pull
  return { ok: true, message: 'Slack is push-only — notifications active' }
}
