// === SCALYO — Auth Service ===
// JWT verification with HMAC-SHA256 signature check via Web Crypto API

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

function base64urlToUint8Array(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function verifyJwt(token, jwtSecret) {
  if (!token) return { valid: false, reason: 'unauthorized' }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, reason: 'unauthorized' }

    // 1. Decode payload first (needed for expiry check)
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlToUint8Array(parts[1]))
    )

    if (!payload.sub) return { valid: false, reason: 'unauthorized' }

    // 2. Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'unauthorized' }
    }

    // 3. Verify HMAC signature if secret is available
    if (jwtSecret) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      const sigBytes = base64urlToUint8Array(parts[2])
      const dataBytes = encoder.encode(parts[0] + '.' + parts[1])
      const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes)
      if (!isValid) return { valid: false, reason: 'unauthorized' }
    }

    return {
      valid: true,
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
    }
  } catch {
    return { valid: false, reason: 'unauthorized' }
  }
}

export async function getUserPlan(config, userId, userJwt) {
  try {
    const url = `${config.supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=plan`
    const res = await fetch(url, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${userJwt}`,
      },
    })
    if (!res.ok) return 'starter'
    const rows = await res.json()
    return (rows[0] && rows[0].plan) || 'starter'
  } catch {
    return 'starter'
  }
}
