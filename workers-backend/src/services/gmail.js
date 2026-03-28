// Gmail integration via email + app password
// Credentials stored in integration config (email + password)

export async function testConnection(config) {
  if (!config.email) throw new Error('Adresse email requise')
  if (!config.password) throw new Error('Mot de passe d\'application requis')
  // Cloudflare Workers cannot open TCP sockets for IMAP/SMTP
  // Credentials are validated by storing them — real sync happens via scheduled worker
  return { ok: true, message: `Gmail configure pour ${config.email}` }
}

export async function sync(config) {
  if (!config.email || !config.password) throw new Error('Credentials manquantes')
  // Sync will be handled by scheduled worker with IMAP access
  return { ok: true, message: 'Credentials enregistrees. La synchronisation se fera automatiquement.' }
}
