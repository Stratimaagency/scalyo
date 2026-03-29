// Slack — connexion via lien de notification (webhook)
// Le webhook permet d'envoyer des notifications dans un canal Slack

export async function testConnection(config) {
  if (!config.webhookUrl) throw new Error('Lien de notification Slack requis')

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '✅ Scalyo connecte ! Vous recevrez vos alertes ici.' }),
  })

  if (!res.ok) throw new Error('Le lien Slack ne fonctionne pas. Vérifiez-le.')
  return { ok: true, message: 'Slack connecté — message test envoyé !' }
}

export async function sendNotification(config, message) {
  if (!config.webhookUrl) return
  const payload = { text: message }
  if (config.channel) payload.channel = config.channel

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Envoi Slack échoué')
  return { ok: true }
}

export async function sync() {
  return { ok: true, message: 'Slack configuré — les notifications sont actives.' }
}

export async function fetchData() {
  return { sections: [] }
}

export async function performAction() {
  throw new Error('Slack est en mode notification uniquement')
}
