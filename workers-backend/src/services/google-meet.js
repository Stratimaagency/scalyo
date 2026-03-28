// Google Meet integration — coming soon
// Credentials stored for future use

export async function testConnection(config) {
  if (!config.email) throw new Error('Adresse email requise')
  if (!config.password) throw new Error('Mot de passe requis')
  return { ok: true, message: `Google Meet configure pour ${config.email}` }
}

export async function sync(config) {
  return { ok: true, message: 'Google Meet configure.' }
}
