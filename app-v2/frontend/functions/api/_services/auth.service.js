export function extractLang(request) {
  const accept = request.headers.get('Accept-Language') || 'fr'
  if (accept.startsWith('ko')) return 'ko'
  if (accept.startsWith('en')) return 'en'
  return 'fr'
}

export function extractAuth(request) {
  const header = request.headers.get('Authorization') || ''
  const token = header.replace('Bearer ', '')
  return { token, hasToken: !!token }
}

export function verifyJwt(token) {
  if (!token) return { valid: false, reason: 'unauthorized' }
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, reason: 'unauthorized' }
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.sub) return { valid: false, reason: 'unauthorized' }
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'unauthorized' }
    }
    return { valid: true, userId: payload.sub, role: payload.role, email: payload.email }
  } catch {
    return { valid: false, reason: 'unauthorized' }
  }
}
