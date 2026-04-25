const VALID_MODULES = [
  'coach', 'import', 'matrice', 'copil',
  'playbook', 'email', 'dashboard', 'notif',
]

export function validateAiRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, reason: 'invalid_request' }
  }
  if (!body.module || !VALID_MODULES.includes(body.module)) {
    return { valid: false, reason: 'module_not_found' }
  }
  if (!body.action && body.module !== 'coach') {
    return { valid: false, reason: 'invalid_request' }
  }
  return { valid: true }
}
