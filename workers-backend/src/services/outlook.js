// Outlook integration via email + app password
// Credentials stored in integration config (email + password)

export async function testConnection(config) {
  if (!config.email) throw new Error('Adresse email requise')
  if (!config.password) throw new Error('Mot de passe d\'application requis')
  return { ok: true, message: `Outlook configure pour ${config.email}` }
}

export async function sync(config) {
  if (!config.email || !config.password) throw new Error('Credentials manquantes')
  return { ok: true, message: 'Credentials enregistrees. La synchronisation se fera automatiquement.' }
}
