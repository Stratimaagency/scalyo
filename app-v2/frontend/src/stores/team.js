import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export const useTeamStore = defineStore('team', () => {
  const members = ref([])
  const loading = ref(false)

  // ─── Computed ─────────────────────────────────────────────────
  const teamHealthScore = computed(() => {
    if (!members.value.length) return 0
    return Math.round(members.value.reduce((s, m) => s + (m.wellbeingScore || 0), 0) / members.value.length)
  })
  const healthyMembers = computed(() => members.value.filter(m => (m.workload || 0) < 80))
  const overloadedMembers = computed(() => members.value.filter(m => (m.workload || 0) >= 80))
  const totalArrManaged = computed(() => members.value.reduce((s, m) => s + (m.arrManaged || 0), 0))

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
    const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true })
    if (!error && data) members.value = data.map(dbToMember)
    loading.value = false
  }

  // ─── Add ──────────────────────────────────────────────────────
  async function addMember(member) {
    const { data, error } = await supabase.from('team_members').insert([await memberToDb(member)]).select().single()
    if (!error && data) members.value.push(dbToMember(data))
    return data
  }

  // ─── Update ───────────────────────────────────────────────────
  async function updateMember(member) {
    const { error } = await supabase.from('team_members').update(await memberToDb(member)).eq('id', member.id)
    if (!error) {
      const idx = members.value.findIndex(m => m.id === member.id)
      if (idx > -1) members.value[idx] = { ...members.value[idx], ...member }
    }
  }

  // ─── Delete ───────────────────────────────────────────────────
  async function deleteMember(id) {
    const { error } = await supabase.from('team_members').delete().eq('id', id)
    if (!error) members.value = members.value.filter(m => m.id !== id)
  }

  // ─── Reset ────────────────────────────────────────────────────
  async function resetAll() {
    await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    members.value = []
  }

  // ─── Record mood ──────────────────────────────────────────────
  async function recordDailyMood(memberId, mood) {
    const member = members.value.find(m => m.id === memberId)
    if (!member) return
    const history = [...(member.moodHistory || []), { date: new Date().toISOString().slice(0, 10), mood }]
    await supabase.from('team_members').update({ mood_history: history, updated_at: new Date().toISOString() }).eq('id', memberId)
    member.moodHistory = history
  }

  // ─── Mappers ──────────────────────────────────────────────────
  function dbToMember(r) {
    return {
      id: r.id,
      name: r.name,
      email: r.email || '',
      role: r.role || '',
      wellbeingScore: r.wellbeing_score || 75,
      workload: r.workload || 60,
      clientCount: r.client_count || 0,
      arrManaged: r.arr_managed || 0,
      moodHistory: r.mood_history || [],
    }
  }

  async function memberToDb(m) {
    const user_id = await getCurrentUserId()
    return { user_id,
      name: m.name,
      email: m.email || '',
      role: m.role || '',
      wellbeing_score: m.wellbeingScore ?? 75,
      workload: m.workload ?? 60,
      client_count: m.clientCount ?? 0,
      arr_managed: m.arrManaged ?? 0,
      mood_history: m.moodHistory || [],
      updated_at: new Date().toISOString(),
    }
  }

  return {
    members, loading, teamHealthScore, healthyMembers, overloadedMembers,
    totalArrManaged, enrichedMembers, calcBurnoutRisk,
    loadMembers, addMember, updateMember, deleteMember, resetAll, recordDailyMood,
  }
})
