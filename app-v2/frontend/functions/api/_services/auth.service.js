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

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}

export async function verifyJwt(token, jwtSecret) {
  if (!token) return { valid: false, reason: 'unauthorized' }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, reason: 'unauthorized' }

    // 1. Verify HMAC-SHA256 signature if secret is available
    if (jwtSecret) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      const signatureBytes = base64UrlDecode(parts[2])
      const dataBytes = encoder.encode(parts[0] + '.' + parts[1])
      const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes)
      if (!isValid) return { valid: false, reason: 'unauthorized' }
    }

    // 2. Decode payload
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])))
    if (!payload.sub) return { valid: false, reason: 'unauthorized' }

    // 3. Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'unauthorized' }
    }

    return { valid: true, userId: payload.sub, role: payload.role, email: payload.email }
  } catch {
    return { valid: false, reason: 'unauthorized' }
  }
}
