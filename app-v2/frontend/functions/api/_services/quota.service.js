import { getConfig } from '../_config/index.js'
import { getQuota } from '../_config/plans.js'

// Check if user has remaining quota for the module today
export async function checkQuota(env, userId, userJwt, planId, moduleName) {
  const config = getConfig(env)
  const maxQuota = getQuota(planId, moduleName)
  if (maxQuota <= 0) return { allowed: false, used: 0, limit: 0 }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const url = config.supabaseUrl + '/rest/v1/ai_usage'
      + '?user_id=eq.' + userId
      + '&module=eq.' + moduleName
      + '&created_at=gte.' + today + 'T00:00:00Z'
      + '&created_at=lt.' + today + 'T23:59:59Z'
      + '&select=id'
    const headers = {
      'apikey': config.supabaseAnonKey,
      'Authorization': 'Bearer ' + userJwt,
    }
    const res = await fetch(url, { headers })
    if (!res.ok) return { allowed: true, used: 0, limit: maxQuota } // fail open on error
    const rows = await res.json()
    const used = rows.length
    return { allowed: used < maxQuota, used, limit: maxQuota }
  } catch {
    return { allowed: true, used: 0, limit: maxQuota } // fail open
  }
}

// Log a usage entry after successful AI call
export async function logUsage(env, userId, userJwt, moduleName) {
  const config = getConfig(env)
  try {
    await fetch(config.supabaseUrl + '/rest/v1/ai_usage', {
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
