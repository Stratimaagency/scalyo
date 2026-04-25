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
  if (body.message && typeof body.message === 'string' && body.message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, reason: 'input_too_long' }
  }
  if (body.history && Array.isArray(body.history)) {
    if (body.history.length > MAX_HISTORY_LENGTH) {
      return { valid: false, reason: 'history_too_long' }
    }
    for (const entry of body.history) {
      if (entry.content && typeof entry.content === 'string' && entry.content.length > MAX_MESSAGE_LENGTH) {
        return { valid: false, reason: 'input_too_long' }
      }
    }
  }
  return { valid: true }
}
