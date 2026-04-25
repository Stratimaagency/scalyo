// === SCALYO — Quota Service (Supabase ai_usage) ===
import { getConfig } from '../_config/index.js'
import { getQuota } from '../_config/plans.js'

// Count today's usage for a user+module from ai_usage table
async function countTodayUsage(env, userId, moduleName, userJwt) {
  const config = getConfig(env)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const url = config.supabaseUrl +
    '/rest/v1/ai_usage?select=id&user_id=eq.' + userId +
    '&module=eq.' + moduleName +
    '&created_at=gte.' + today + 'T00:00:00Z' +
    '&created_at=lt.' + today + 'T23:59:59Z'
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': 'Bearer ' + userJwt,
        'Accept': 'application/json',
        'Prefer': 'count=exact',
      },
    })
    const countHeader = res.headers.get('content-range')
    if (countHeader) {
      const match = countHeader.match(/\/(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    }
    const rows = await res.json()
    return Array.isArray(rows) ? rows.length : 0
  } catch { return 0 }
}

// Log a usage entry after successful AI call
export async function logUsage(env, userId, moduleName, userJwt) {
  const config = getConfig(env)
  const url = config.supabaseUrl + '/rest/v1/ai_usage'
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': 'Bearer ' + userJwt,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ user_id: userId, module: moduleName }),
    })
  } catch { /* non-blocking */ }
}

// Check if user has quota remaining
export async function checkQuota(env, userId, moduleName, planId, userJwt) {
  const maxQuota = getQuota(planId, moduleName)
  if (maxQuota <= 0) return { allowed: false, used: 0, max: 0 }
  const used = await countTodayUsage(env, userId, moduleName, userJwt)
  return { allowed: used < maxQuota, used, max: maxQuota }
}
