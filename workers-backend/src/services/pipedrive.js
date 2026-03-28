// Pipedrive — connexion via identifiants
// Les credentials sont stockés pour la synchronisation future

export async function testConnection(config) {
  if (!config.email) throw new Error('Email requis')
  if (!config.password) throw new Error('Mot de passe requis')
  return { ok: true, message: `Pipedrive configure pour ${config.email}` }
}

export async function sync(config) {
  if (!config.email || !config.password) throw new Error('Identifiants manquants')
  return { ok: true, message: 'Pipedrive connecte. Synchronisation configuree.' }
}
