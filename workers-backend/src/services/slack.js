export async function testConnection(config) {
  if (!config.webhookUrl) throw new Error('Webhook URL is required')

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '✅ Scalyo connected successfully! You will receive customer alerts here.' }),
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
