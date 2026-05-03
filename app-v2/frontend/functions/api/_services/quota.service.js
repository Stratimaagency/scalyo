import { getConfig } from '../_config/index.js'
import { getQuota } from '../_config/plans.js'

// Only chat modules have quota limits
// All other AI modules (dashboard, matrice, copil, playbook, email, import, notif)
// are unlimited — AI is the core of the product experience
const QUOTA_MODULES = ['coach', 'nova']

export async function checkQuota(env, userId, userJwt, planId, moduleName) {
  // Non-chat modules: always allowed, no quota
  if (!QUOTA_MODULES.includes(moduleName)) {
    return { allowed: true, used: 0, limit: -1 }
  }

  const config = getConfig(env)
  const maxQuota = getQuota(planId, moduleName)

  if (maxQuota <= 0) return { allowed: false, used: 0, limit: 0 }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const url = config.supabaseUrl + '/rest/v1/ai_messages'
      + '?user_id=eq.' + userId
      + '&module=eq.' + moduleName
      + '&role=eq.usage'
      + '&created_at=gte.' + today + 'T00:00:00Z'
      + '&created_at=lt.' + today + 'T23:59:59Z'
      + '&select=id'

    const res = await fetch(url, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': 'Bearer ' + userJwt,
      }
    })
    if (!res.ok) return { allowed: false, used: 0, limit: maxQuota }
    const rows = await res.json()
    const used = Array.isArray(rows) ? rows.length : 0
    return { allowed: used < maxQuota, used, limit: maxQuota }
  } catch {
    return { allowed: false, used: 0, limit: maxQuota }
  }
}

export async function logUsage(env, userId, userJwt, moduleName) {
  // Only log usage for quota-limited modules
  if (!QUOTA_MODULES.includes(moduleName)) return

  const config = getConfig(env)
  try {
    await fetch(config.supabaseUrl + '/rest/v1/ai_messages', {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': 'Bearer ' + userJwt,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        module: moduleName,
        role: 'usage',
        content: 'q',
      }),
    })
  } catch { /* non-blocking */ }
}
