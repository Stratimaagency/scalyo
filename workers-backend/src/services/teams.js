// Microsoft Teams — connexion via lien de notification (webhook)
// Le webhook permet d'envoyer des notifications dans un canal Teams

export async function testConnection(config) {
  if (!config.webhookUrl) throw new Error('Lien de notification Teams requis')

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      summary: 'Scalyo Connecte',
      themeColor: '00BFA6',
      title: 'Scalyo Connecte',
      text: '✅ Scalyo connecte ! Vous recevrez vos alertes ici.',
    }),
  })

  if (!res.ok) throw new Error('Le lien Teams ne fonctionne pas. Verifiez-le.')
  return { ok: true, message: 'Teams connecte — message test envoye !' }
}

export async function sendNotification(config, message, title = 'Alerte Scalyo') {
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
  if (!res.ok) throw new Error('Envoi Teams echoue')
  return { ok: true }
}

export async function sync() {
  return { ok: true, message: 'Teams configure — les notifications sont actives.' }
}
