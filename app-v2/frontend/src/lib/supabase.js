import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required')
}

// Custom lock with timeout to prevent Web Locks API deadlocks across tabs.
// Default behavior: navigator.locks.request() waits INDEFINITELY for the lock.
// If any tab holds the lock (e.g. stale token refresh), ALL other tabs freeze.
// This wrapper adds AbortController-based timeout so the lock always resolves.
async function lockWithTimeout(name, acquireTimeout, fn) {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), Math.max(acquireTimeout, 5000))
    try {
      return await navigator.locks.request(name, { signal: ac.signal }, async () => fn())
    } catch (e) {
      if (e.name === 'AbortError') {
        // Lock timed out — execute without lock (worst case: duplicate refresh, harmless)
        console.warn('Auth lock timed out, proceeding without lock')
        return await fn()
      }
      throw e
    } finally {
      clearTimeout(timer)
    }
  }
  // No Web Locks API (SSR, older browsers) — execute directly
  return await fn()
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: lockWithTimeout,
  },
})
