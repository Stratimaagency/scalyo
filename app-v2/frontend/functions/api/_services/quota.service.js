// === SCALYO — Quota Service ===
// Tracks and enforces AI usage quotas per user per module per day

import { getQuota } from '../_config/plans.js'

export async function checkQuota(config, userId, userJwt, planId, moduleName) {
  const quota = getQuota(planId, moduleName)
  if (quota <= 0) return { allowed: false, used: 0, limit: 0 }

  try {
    const today = new Date().toISOString().split('T')[0]
    const url = `${config.supabaseUrl}/rest/v1/ai_usage?user_id=eq.${userId}&module=eq.${moduleName}&created_at=gte.${today}T00:00:00Z&select=id`
    const headers = {
      'apikey': config.supabaseAnonKey,
      'Authorization': `Bearer ${userJwt}`,
      'Prefer': 'count=exact',
    }
    const res = await fetch(url, { headers })
    const countHeader = res.headers.get('content-range')
    let used = 0
    if (countHeader) {
      const match = countHeader.match(/\/(\d+)/)
      if (match) used = parseInt(match[1], 10)
    } else {
      const rows = await res.json()
      used = Array.isArray(rows) ? rows.length : 0
    }
    return { allowed: used < quota, used, limit: quota }
  } catch {
    // If quota check fails, allow the request (fail-open for availability)
    return { allowed: true, used: 0, limit: quota }
  }
}

export async function logUsage(config, userId, userJwt, moduleName, tokensUsed) {
  try {
    const url = `${config.supabaseUrl}/rest/v1/ai_usage`
    await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${userJwt}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        module: moduleName,
        tokens_used: tokensUsed || 0,
      }),
    })
  } catch {
    // Non-blocking: log failure silently
    console.error('Failed to log AI usage')
  }
}
