import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useClientStore } from '@/stores/clients'

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}


export const useTeamStore = defineStore('team', () => {
  const members = ref(load('scalyo_team', []))

  // Members enrichis avec burnoutRisk et mood calculés en temps réel
  const enrichedMembers = computed(() => {
    // Importer le store clients ici pour éviter les imports circulaires
    const clientStore = useClientStore()
    return members.value.map(m => {
      const csmClients = clientStore.clients.filter(c => c.csmId === m.id)
      return {
        ...m,
        burnoutRisk: calcBurnoutRisk(m.wellbeingScore, m.workload),
        mood: calcMood(m.wellbeingScore),
        status: m.workload > 80 || m.wellbeingScore < 55 ? 'overloaded' : 'healthy',
        clientCount: csmClients.length,
        arrManaged: csmClients.reduce((s, c) => s + (c.arr || 0), 0),
      }
    })
  })

  const teamHealthScore = computed(() => {
    if (!members.value.length) return 0
    return Math.round(members.value.reduce((s, m) => s + m.wellbeingScore, 0) / members.value.length)
  })
  const healthyMembers = computed(() => members.value.filter(m => m.status === 'healthy').length)
  const overloadedMembers = computed(() => members.value.filter(m => m.status === 'overloaded').length)
  const totalArrManaged = computed(() => members.value.reduce((s, m) => s + m.arrManaged, 0))

  function updateMember(id, data) {
    const i = members.value.findIndex(m => m.id === id)
    if (i !== -1) {
      Object.assign(members.value[i], data)
      save('scalyo_team', members.value)
    }
  }

  // Calcule burnoutRisk depuis wellbeingScore + workload en temps réel
  function calcBurnoutRisk(wellbeingScore, workload) {
    if (wellbeingScore < 40 || workload > 90) return 'high'
    if (wellbeingScore < 55 || workload > 80) return 'medium'
    if (wellbeingScore < 70 || workload > 70) return 'low'
    return 'none'
  }

  // Calcule mood depuis wellbeingScore
  function calcMood(wellbeingScore) {
    if (wellbeingScore >= 80) return 'great'
    if (wellbeingScore >= 65) return 'happy'
    if (wellbeingScore >= 50) return 'neutral'
    if (wellbeingScore >= 35) return 'stressed'
    return 'exhausted'
  }

  // Enregistre le mood du jour pour un membre (appelé depuis WellbeingView)
  function recordDailyMood(memberId, mood) {
    const i = members.value.findIndex(m => m.id === memberId)
    if (i === -1) return
    const m = members.value[i]
    // Décaler les moods — garder les 5 derniers jours
    const moods = [...(m.weekMoods || []), mood].slice(-5)
    Object.assign(members.value[i], { mood, weekMoods: moods })
    save('scalyo_team', members.value)
  }

  function addMember(member) {
    members.value.push({
      id: 'tm' + Date.now(),
      avatar: null,
      status: 'healthy',
      wellbeingScore: 70,
      workload: 50,
      clientCount: 0,
      arrManaged: 0,
      mood: 'neutral',
      burnoutRisk: 'low',
      weekMoods: ['neutral', 'neutral', 'neutral', 'neutral', 'neutral'],
      ...member,
    })
    save('scalyo_team', members.value)
  }

  function deleteMember(id) {
    members.value = members.value.filter(m => m.id !== id)
    save('scalyo_team', members.value)
  }

  function resetAll() {
    members.value = []
    save('scalyo_team', [])
  }

  return {
    members, enrichedMembers, teamHealthScore, healthyMembers, overloadedMembers, totalArrManaged,
    updateMember, addMember, deleteMember, resetAll, recordDailyMood, calcBurnoutRisk, calcMood,
  }
}, { persist: false })
