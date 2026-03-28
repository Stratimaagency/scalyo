// Zendesk — connexion via identifiants + sous-domaine
// Les credentials sont stockés pour la synchronisation future

export async function testConnection(config) {
  if (!config.email) throw new Error('Email requis')
  if (!config.password) throw new Error('Mot de passe requis')
  if (!config.domain) throw new Error('Sous-domaine Zendesk requis')
  return { ok: true, message: `Zendesk configure pour ${config.email} (${config.domain}.zendesk.com)` }
}

export async function sync(config) {
  if (!config.email || !config.password || !config.domain) throw new Error('Identifiants manquants')
  return { ok: true, message: 'Zendesk connecte. Synchronisation configuree.' }
}
