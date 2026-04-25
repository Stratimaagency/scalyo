// === SCALYO — Auth Service (HMAC-SHA256 verified) ===

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

async function verifyHmacSignature(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  const data = encoder.encode(parts[0] + '.' + parts[1])
  const signature = base64UrlDecode(parts[2])
  return crypto.subtle.verify('HMAC', key, signature, data)
}

export async function verifyJwt(token, jwtSecret) {
  if (!token) return { valid: false, reason: 'unauthorized' }
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, reason: 'unauthorized' }

    // Decode payload first
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])))
    if (!payload.sub) return { valid: false, reason: 'unauthorized' }

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'unauthorized' }
    }

    // Verify HMAC signature if secret is available
    if (jwtSecret) {
      const valid = await verifyHmacSignature(token, jwtSecret)
      if (!valid) return { valid: false, reason: 'unauthorized' }
    }

    return { valid: true, userId: payload.sub, role: payload.role, email: payload.email }
  } catch {
    return { valid: false, reason: 'unauthorized' }
  }
}

// Resolve plan from profiles table via Supabase REST
export async function getUserPlan(userId, supabaseUrl, supabaseAnonKey, userJwt) {
  try {
    const url = supabaseUrl + '/rest/v1/profiles?select=stripe_subscription_id,plan&id=eq.' + userId
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': 'Bearer ' + userJwt,
        'Accept': 'application/json',
      },
    })
    if (!res.ok) return 'starter'
    const rows = await res.json()
    if (!rows || rows.length === 0) return 'starter'
    const profile = rows[0]
    const sub = profile.stripe_subscription_id
    if (!sub || sub === '' || sub === 'none') return 'starter'
    if (sub.startsWith('stripe_') || sub.startsWith('plan_')) return sub.split('_').pop()
    return profile.plan || 'starter'
  } catch {
    return 'starter'
  }
}
