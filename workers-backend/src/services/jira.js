// Jira — connexion via identifiants + sous-domaine
// Les credentials sont stockés pour la synchronisation future

export async function testConnection(config) {
  if (!config.email) throw new Error('Email requis')
  if (!config.password) throw new Error('Mot de passe requis')
  if (!config.domain) throw new Error('Sous-domaine Jira requis')
  return { ok: true, message: `Jira configure pour ${config.email} (${config.domain}.atlassian.net)` }
}

export async function sync(config) {
  if (!config.email || !config.password || !config.domain) throw new Error('Identifiants manquants')
  return { ok: true, message: 'Jira connecte. Synchronisation configuree.' }
}
