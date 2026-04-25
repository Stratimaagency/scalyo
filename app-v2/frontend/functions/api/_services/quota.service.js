import { getConfig } from '../_config/index.js'
import { getQuota } from '../_config/plans.js'

export async function checkQuota(env, userId, userJwt, planId, moduleName) {
  const config = getConfig(env)
  const maxQuota = getQuota(planId, moduleName)
  if (maxQuota === 0) return { allowed: false, remaining: 0, used: 0, limit: 0 }

  try {
    const today = new Date().toISOString().split('T')[0]
    const params = new URLSearchParams({
      user_id: 'eq.' + userId,
      module: 'eq.' + moduleName,
      created_at: 'gte.' + today + 'T00:00:00Z',
      select: 'id',
    })
    const res = await fetch(config.supabaseUrl + '/rest/v1/ai_usage?' + params.toString(), {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': 'Bearer ' + userJwt,
      }
    })
    if (!res.ok) return { allowed: true, remaining: maxQuota, used: 0, limit: maxQuota }
    const rows = await res.json()
    const used = rows.length
    return { allowed: used < maxQuota, remaining: Math.max(0, maxQuota - used), used, limit: maxQuota }
  } catch {
    return { allowed: true, remaining: maxQuota, used: 0, limit: maxQuota }
  }
}

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
      body: JSON.stringify({ user_id: userId, module: moduleName })
    })
  } catch { /* fire and forget */ }
}
