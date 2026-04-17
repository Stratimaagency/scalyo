import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  const fullName = computed(() => {
    if (!profile.value) return ''
    return (profile.value.first_name + ' ' + profile.value.last_name).trim()
  })

  const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
  })

  async function init() {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (session && session.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
    loading.value = false
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      } else {
        user.value = null
        profile.value = null
      }
    })
  }

  async function fetchProfile(userId) {
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!err && data) profile.value = data
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    loading.value = false
    if (err) { error.value = err.message; return { success: false, error: err.message } }
    clearAllStores()
    user.value = data.user
    await fetchProfile(data.user.id)
    return { success: true }
  }

  async function register(email, password, firstName, lastName) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName }, emailRedirectTo: `${window.location.origin}/login?verified=true` },
    })
    loading.value = false
    if (err) { error.value = err.message; return { success: false, error: err.message } }

    // Envoyer l'email de bienvenue via Edge Function (best-effort)
    if (data.user) {
      fetch(SUPABASE_URL + '/functions/v1/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, firstName, lastName })
      }).catch(() => {}) // silent fail — ne bloque pas l'inscription
    }

    return { success: true, needsConfirmation: !data.session }
  }

  async 
  // Clear all user data stores (called on login/logout to ensure clean state)
  function clearAllStores() {
    const storeKeys = ['scalyo_clients', 'scalyo_tasks', 'scalyo_team', 'scalyo_projects',
      'scalyo_kpis', 'scalyo_playbooks', 'scalyo_snapshots', 'scalyo_okr',
      'scalyo_roadmap', 'scalyo_quotes', 'scalyo_dashboard_kpis']
    storeKeys.forEach(k => localStorage.removeItem(k))
  }
  function logout() {
    clearAllStores()
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return { user, profile, loading, error, isAuthenticated, fullName, greeting, init, login, clearAllStores, register, logout }
})
