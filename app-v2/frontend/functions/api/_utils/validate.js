// === SCALYO — Input Validation ===
// Validates and sanitizes AI request inputs

const VALID_MODULES = [
  'coach', 'nova', 'import', 'matrice', 'copil',
  'playbook', 'email', 'dashboard', 'notif',
]

const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_LENGTH = 10

export function validateAiRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, reason: 'invalid_request' }
  }
  if (!body.module || !VALID_MODULES.includes(body.module)) {
    return { valid: false, reason: 'module_not_found' }
  }

  // Sanitize message length
  if (body.message && typeof body.message === 'string') {
    if (body.message.length > MAX_MESSAGE_LENGTH) {
      body.message = body.message.slice(0, MAX_MESSAGE_LENGTH)
    }
  }

  // Sanitize history length
  if (Array.isArray(body.history)) {
    if (body.history.length > MAX_HISTORY_LENGTH) {
      body.history = body.history.slice(-MAX_HISTORY_LENGTH)
    }
    // Truncate each history message too
    body.history = body.history.map(msg => {
      if (msg && typeof msg.content === 'string' && msg.content.length > MAX_MESSAGE_LENGTH) {
        return { ...msg, content: msg.content.slice(0, MAX_MESSAGE_LENGTH) }
      }
      return msg
    })
  }

  return { valid: true }
}
