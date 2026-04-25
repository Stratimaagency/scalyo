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

function base64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4
  const base64 = pad ? padded + '='.repeat(4 - pad) : padded
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function verifyJwt(token, jwtSecret) {
  if (!token) return { valid: false, reason: 'unauthorized' }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, reason: 'unauthorized' }

    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])))
    if (!payload.sub) return { valid: false, reason: 'unauthorized' }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'unauthorized' }
    }

    // Verify HMAC-SHA256 signature when secret is configured
    if (jwtSecret) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
      )
      const data = encoder.encode(parts[0] + '.' + parts[1])
      const sig = base64urlDecode(parts[2])
      const valid = await crypto.subtle.verify('HMAC', key, sig, data)
      if (!valid) return { valid: false, reason: 'unauthorized' }
    }

    return { valid: true, userId: payload.sub, role: payload.role, email: payload.email }
  } catch {
    return { valid: false, reason: 'unauthorized' }
  }
}
