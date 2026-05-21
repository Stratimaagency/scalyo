import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required')
}

// Bypass Web Locks API entirely.
// The lock caused deadlocks: init() timeout -> stale lock -> login() hangs on same lock -> login_timeout.
// Worst case without lock: duplicate token refresh (two HTTP reqs). Harmless.
async function noLock(name, acquireTimeout, fn) {
  return await fn()
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: noLock,
  },
})

export { supabaseUrl, supabaseAnonKey }
