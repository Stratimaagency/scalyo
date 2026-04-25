// === SCALYO — Rate Limiter (in-memory, per Worker isolate) ===
// 10 requests per minute per user. Resets automatically.

const limits = new Map()
const MAX_REQUESTS = 10
const WINDOW_MS = 60 * 1000 // 1 minute

export function checkRateLimit(userId) {
  const now = Date.now()
  let entry = limits.get(userId)

  // Cleanup: remove stale entries periodically
  if (limits.size > 10000) {
    for (const [key, val] of limits) {
      if (now - val.windowStart > WINDOW_MS * 2) limits.delete(key)
    }
  }

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entry = { count: 1, windowStart: now }
    limits.set(userId, entry)
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}
