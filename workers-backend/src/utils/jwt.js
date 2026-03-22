/**
 * JWT implementation using Web Crypto API (HMAC SHA-256).
 */

function base64url(data) {
  if (typeof data === 'string') {
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signJwt(payload, secret, expiresInSeconds = 43200) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds }

  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`

  const key = await getKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))

  return `${data}.${base64url(signature)}`
}

export async function verifyJwt(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [headerB64, payloadB64, signatureB64] = parts
  const data = `${headerB64}.${payloadB64}`

  const key = await getKey(secret)

  // Decode signature
  const sigStr = base64urlDecode(signatureB64)
  const sigBuf = new Uint8Array(sigStr.length)
  for (let i = 0; i < sigStr.length; i++) sigBuf[i] = sigStr.charCodeAt(i)

  const valid = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(data))
  if (!valid) return null

  const payload = JSON.parse(base64urlDecode(payloadB64))

  // Check expiration
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

  return payload
}
