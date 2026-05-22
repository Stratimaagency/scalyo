import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

async function getCurrentUserId() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  } catch (err) {
    if (window.Sentry) window.Sentry.captureException(err)
    return null
  }
}

export const useTeamStore = defineStore('team', () => {
  const members = ref([])
  const loading = ref(false)
  const lastError = ref(null)

  // ─── Computed ─────────────────────────────────────────────────
  const teamHealthScore = computed(() => {
    if (!members.value.length) return 0
    return Math.round(members.value.reduce((s, m) => s + (m.wellbeingScore || 0), 0) / members.value.length)
  })
  const healthyMembers = computed(() => members.value.filter(m => (m.workload || 0) < 80))
  const overloadedMembers = computed(() => members.value.filter(m => (m.workload || 0) >= 80))
  const totalArrManaged = computed(() => members.value.reduce((s, m) => s + (m.arrManaged || 0), 0))
  const seatsUsed = computed(() => members.value.length + 1) // +1 = manager

  function calcBurnoutRisk(member) {
    const wl = member.workload || 0
    const wb = member.wellbeingScore || 75
    if (wl >= 90 && wb < 50) return 'Élevé'
    if (wl >= 80 || wb < 60) return 'Faible'
    return 'Aucun'
  }

  const enrichedMembers = computed(() => members.value.map(m => ({
    ...m,
    burnoutRisk: calcBurnoutRisk(m),
    statusLabel: (m.workload || 0) >= 90 ? 'En surcharge' : (m.workload || 0) >= 75 ? 'Chargé' : 'En forme',
  })))

  // ─── Load ─────────────────────────────────────────────────────
  async function loadMembers() {
    loading.value = true
    lastError.value = null
    try {
      const authStore = useAuthStore()
      const orgId = authStore.profile?.organization_id
      if (!orgId) { members.value = []; return }
      const { data: omData, error } = await supabase
        .from('organization_members')
        .select('user_id, role, created_at')
        .eq('organization_id', orgId)
        .neq('user_id', authStore.user?.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      if (!omData?.length) { members.value = []; return }
      const userIds = omData.map(m => m.user_id)
      const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name').in('id', userIds)
      const pMap = {}
      profs?.forEach(p => { pMap[p.id] = p })
      members.value = omData.map(m => {
        const p = pMap[m.user_id] || {}
        return {
          id: m.user_id,
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') || '',
          email: '', role: m.role || 'member',
          wellbeingScore: 75, workload: 60,
          clientCount: 0, arrManaged: 0,
          moodHistory: [], canSendEmail: false,
        }
      })
    } catch (err) {
      lastError.value = err.message || 'Failed to load team members'
      if (window.Sentry) window.Sentry.captureException(err)
    } finally {
      loading.value = false
    }
  }

  // ─── Add ──────────────────────────────────────────────────────
  async function addMember(member) {
    lastError.value = null
    try {
      const authStore = useAuthStore()
      const orgId = authStore.profile?.organization_id
      if (!orgId) throw new Error('No organization')
      const { data, error } = await supabase.from('organization_members').insert([{
        organization_id: orgId,
        user_id: member.userId,
        role: member.role || 'member',
        can_send_email: member.canSendEmail ?? false,
      }]).select().single()
      if (error) {
        if (error.message?.includes('SEAT_LIMIT_REACHED')) {
          const err = new Error('SEAT_LIMIT_REACHED')
          err.code = 'SEAT_LIMIT_REACHED'
          throw err
        }
        throw error
      }
      if (data) await loadMembers()
      return data
    } catch (err) {
      lastError.value = err.message || 'Failed to add member'
      if (err.code !== 'SEAT_LIMIT_REACHED' && window.Sentry) {
        window.Sentry.captureException(err)
      }
      throw err
    }
  }

  // ─── Update ───────────────────────────────────────────────────
  async function updateMember(member) {
    lastError.value = null
    try {
      const { error } = await supabase.from('organization_members').update({ role: member.role || 'member', can_send_email: member.canSendEmail ?? false }).eq('id', member.id)
      if (error) throw error
      const idx = members.value.findIndex(m => m.id === member.id)
      if (idx > -1) members.value[idx] = { ...members.value[idx], ...member }
    } catch (err) {
      lastError.value = err.message || 'Failed to update member'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────
  async function deleteMember(id) {
    lastError.value = null
    try {
      const { error } = await supabase.from('organization_members').delete().eq('user_id', id)
      if (error) throw error
      members.value = members.value.filter(m => m.id !== id)
    } catch (err) {
      lastError.value = err.message || 'Failed to delete member'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ─── Reset ────────────────────────────────────────────────────
  async function resetAll() {
    lastError.value = null
    try {
      const { error } = await supabase.from('organization_members').delete().eq('organization_id', useAuthStore().profile?.organization_id).neq('user_id', useAuthStore().user?.id)
      if (error) throw error
      members.value = []
    } catch (err) {
      lastError.value = err.message || 'Failed to reset team'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ─── Record mood ──────────────────────────────────────────────
  async function recordDailyMood(memberId, mood) {
    lastError.value = null
    try {
      const member = members.value.find(m => m.id === memberId)
      if (!member) return
      const history = [...(member.moodHistory || []), { date: new Date().toISOString().slice(0, 10), mood }]
      const { error } = await supabase.from('organization_members').update({ mood_history: history, updated_at: new Date().toISOString() }).eq('id', memberId)
      if (error) throw error
      member.moodHistory = history
    } catch (err) {
      lastError.value = err.message || 'Failed to record mood'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  // ─── Mappers ──────────────────────────────────────────────────
  function dbToMember(r) {
    return {
      id: r.id, name: r.name, email: r.email || '', role: r.role || '',
      wellbeingScore: r.wellbeing_score || 75, workload: r.workload || 60,
      clientCount: r.client_count || 0, arrManaged: r.arr_managed || 0,
      moodHistory: r.mood_history || [],
      canSendEmail: r.can_send_email || false,
    }
  }

  function memberToDb(m) {
    return {
      role: m.role || 'member',
      can_send_email: m.canSendEmail ?? false,
    }
  }

  return {
    members, loading, lastError, teamHealthScore, healthyMembers, overloadedMembers,
    totalArrManaged, enrichedMembers,
    seatsUsed, calcBurnoutRisk, loadMembers,
    addMember, updateMember, deleteMember, resetAll, recordDailyMood,
  }
})
