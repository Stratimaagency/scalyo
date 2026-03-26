// WhatsApp Business API integration (via Meta Cloud API)
const BASE = 'https://graph.facebook.com/v18.0'

export async function testConnection(config) {
  if (!config.apiKey) throw new Error('WhatsApp Business API token is required')
  if (!config.phoneNumberId) throw new Error('Phone Number ID is required')

  const res = await fetch(`${BASE}/${config.phoneNumberId}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `WhatsApp API error ${res.status}`)
  }
  return { ok: true, message: 'WhatsApp Business connected' }
}

export async function sendNotification(config, message) {
  if (!config.apiKey || !config.phoneNumberId || !config.recipientPhone) return

  const res = await fetch(`${BASE}/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: config.recipientPhone,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!res.ok) throw new Error(`WhatsApp send failed: ${res.status}`)
  return { ok: true }
}

export async function sync() {
  return { ok: true, message: 'WhatsApp is push-only — notifications active' }
}
