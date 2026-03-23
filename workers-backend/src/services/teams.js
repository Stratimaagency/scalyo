export async function testConnection(config) {
  if (!config.webhookUrl) throw new Error('Webhook URL is required')

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      summary: 'Scalyo Connected',
      themeColor: '00BFA6',
      title: 'Scalyo Connected',
      text: '✅ Scalyo connected successfully! You will receive customer alerts here.',
    }),
  })

  if (!res.ok) throw new Error(`Teams webhook error: ${res.status}`)
  return { ok: true, message: 'Teams connected — test message sent' }
}

export async function sendNotification(config, message, title = 'Scalyo Alert') {
  if (!config.webhookUrl) return

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      summary: title,
      themeColor: '00BFA6',
      title,
      text: message,
    }),
  })

  if (!res.ok) throw new Error(`Teams send failed: ${res.status}`)
  return { ok: true }
}

export async function sync() {
  return { ok: true, message: 'Teams is push-only — notifications active' }
}
