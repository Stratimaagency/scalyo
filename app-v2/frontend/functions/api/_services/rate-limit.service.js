// === SCALYO — Rate Limiter ===
// In-memory sliding window: max 10 requests per minute per user
// Resets on cold starts (acceptable for Pages Functions)

const MAX_REQUESTS = 10
const WINDOW_MS = 60 * 1000
const userTimestamps = new Map()

export function checkRateLimit(userId) {
  const now = Date.now()
  const cutoff = now - WINDOW_MS

  let timestamps = userTimestamps.get(userId)
  if (!timestamps) {
    timestamps = []
    userTimestamps.set(userId, timestamps)
  }

  // Remove expired entries
  timestamps = timestamps.filter(ts => ts > cutoff)
  userTimestamps.set(userId, timestamps)

  if (timestamps.length >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: timestamps[0] + WINDOW_MS - now }
  }

  timestamps.push(now)
  return { allowed: true }
}

// Cleanup old entries periodically (every 100 checks)
let checkCount = 0
export function maybeCleanup() {
  checkCount++
  if (checkCount % 100 !== 0) return
  const now = Date.now()
  const cutoff = now - WINDOW_MS * 2
  for (const [userId, timestamps] of userTimestamps.entries()) {
    const filtered = timestamps.filter(ts => ts > cutoff)
    if (filtered.length === 0) {
      userTimestamps.delete(userId)
    } else {
      userTimestamps.set(userId, filtered)
    }
  }
}
