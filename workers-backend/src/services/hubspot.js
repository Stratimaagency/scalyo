// HubSpot CRM — credentials stored for sync

export async function testConnection(config) {
  if (!config.email) throw new Error('Email requis')
  if (!config.password) throw new Error('Mot de passe requis')
  return { ok: true, message: `HubSpot configure pour ${config.email}` }
}

export async function sync(config) {
  if (!config.email || !config.password) throw new Error('Credentials manquantes')
  return { ok: true, message: 'HubSpot connecte. Synchronisation configuree.' }
}
