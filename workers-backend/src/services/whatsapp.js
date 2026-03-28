// WhatsApp Business integration
// User provides their phone number — connection stored for future messaging features

export async function testConnection(config) {
  if (!config.phone) throw new Error('Numero de telephone requis')
  // Validate phone format (basic check)
  const cleaned = config.phone.replace(/[\s\-().]/g, '')
  if (cleaned.length < 8) throw new Error('Numero de telephone invalide')
  return { ok: true, message: `WhatsApp configure pour ${config.phone}` }
}

export async function sync(config) {
  if (!config.phone) throw new Error('Numero de telephone requis')
  return { ok: true, message: 'WhatsApp configure. Les notifications seront envoyees a ce numero.' }
}
