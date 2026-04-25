// In-memory rate limiter — resets when Worker isolate recycles
// For production scale, consider Cloudflare Durable Objects or KV
const requests = new Map()
const MAX_REQUESTS = 10
const WINDOW_MS = 60 * 1000 // 1 minute

export function checkRateLimit(userId) {
  const now = Date.now()

  // Lazy cleanup when map grows large
  if (requests.size > 500) {
    for (const [key, timestamps] of requests.entries()) {
      if (timestamps.every(t => now - t >= WINDOW_MS)) requests.delete(key)
    }
  }

  if (!requests.has(userId)) {
    requests.set(userId, [now])
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  const timestamps = requests.get(userId).filter(t => now - t < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS) {
    requests.set(userId, timestamps)
    return { allowed: false, remaining: 0 }
  }

  timestamps.push(now)
  requests.set(userId, timestamps)
  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length }
}
