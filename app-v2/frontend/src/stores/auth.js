import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const TRIAL_DAYS = 14

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

  // ─── Subscription ─────────────────────────────────────────────────────────
  const hasActiveSubscription = computed(() => {
    const sub = profile.value?.stripe_subscription_id
    return !!sub && sub !== '' && sub !== 'none'
  })

  // ─── Trial ────────────────────────────────────────────────────────────────
  const trialStartedAt = computed(() => {
    const d = profile.value?.trial_started_at
    return d ? new Date(d) : null
  })

  const trialUsed = computed(() => !!profile.value?.trial_used)

  const trialDaysLeft = computed(() => {
    if (!trialStartedAt.value) return 0
    const elapsed = (Date.now() - trialStartedAt.value.getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(0, TRIAL_DAYS - Math.floor(elapsed))
  })

  // Active trial = started + days remaining + not already consumed
  const isOnTrial = computed(() => {
    if (hasActiveSubscription.value) return false
    if (!trialStartedAt.value) return false
    if (trialUsed.value) return false
    return trialDaysLeft.value > 0
  })

  // Expired = trial started but 0 days left, OR trial_used flag
  // NEVER expired while isOnTrial is true
  const trialExpired = computed(() => {
    if (hasActiveSubscription.value) return false
    if (isOnTrial.value) return false  // ← clé : trial actif = jamais expired
    if (!trialStartedAt.value && !trialUsed.value) return false  // jamais commencé = pas expired
    if (trialStartedAt.value && trialDaysLeft.value === 0) return true
    if (trialUsed.value) return true
    return false
  })

  const needsPayment = computed(() => trialExpired.value && !hasActiveSubscription.value)

  // ─── Locale ───────────────────────────────────────────────────────────────
  const userLocale = computed(() => profile.value?.locale || 'fr')

  // ─── Store cleanup ────────────────────────────────────────────────────────
  function clearAllStores() {
    const keys = ['scalyo_clients','scalyo_tasks','scalyo_team','scalyo_projects',
      'scalyo_kpis','scalyo_playbooks','scalyo_snapshots','scalyo_okr',
      'scalyo_roadmap','scalyo_quotes','scalyo_dashboard_kpis']
    keys.forEach(k => localStorage.removeItem(k))
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
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

  // ─── Fetch profile ────────────────────────────────────────────────────────
  async function fetchProfile(userId) {
    const { data, error: err } = await supabase
      .from('profiles').select('*').eq('id', userId).single()
    if (!err && data) {
      profile.value = data
      // Auto-mark trial as used when it expires
      if (data.trial_started_at && !data.trial_used) {
        const elapsed = (Date.now() - new Date(data.trial_started_at).getTime()) / (1000 * 60 * 60 * 24)
        if (elapsed >= TRIAL_DAYS) {
          await supabase.from('profiles').update({ trial_used: true }).eq('id', userId)
          profile.value = { ...profile.value, trial_used: true }
        }
      }
    }
  }

  // ─── Login ────────────────────────────────────────────────────────────────
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

  // ─── Register ─────────────────────────────────────────────────────────────
  async function register(email, password, firstName, lastName, locale = 'fr') {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name: firstName, last_name: lastName, locale },
        emailRedirectTo: `${window.location.origin}/login?verified=true`
      },
    })
    loading.value = false
    if (err) { error.value = err.message; return { success: false, error: err.message } }
    if (data.user) {
      fetch(SUPABASE_URL + '/functions/v1/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, firstName, lastName })
      }).catch(() => {})
    }
    return { success: true, needsConfirmation: !data.session }
  }

  // ─── Save locale ──────────────────────────────────────────────────────────
  async function saveLocale(locale) {
    if (!user.value) return
    await supabase.from('profiles').update({ locale }).eq('id', user.value.id)
    if (profile.value) profile.value = { ...profile.value, locale }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  async function logout() {
    clearAllStores()
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user, profile, loading, error,
    isAuthenticated, fullName, greeting,
    hasActiveSubscription, isOnTrial, trialExpired, trialDaysLeft, trialUsed, needsPayment,
    userLocale,
    init, login, register, logout, clearAllStores, saveLocale, fetchProfile
  }
})
