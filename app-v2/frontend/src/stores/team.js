import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTeamStore = defineStore('team', () => {
  const members = ref([
    { id: 'tm1', name: 'Sophie M.', email: 'sophie@stratima.com', role: 'CSM Senior', avatar: null, status: 'healthy', wellbeingScore: 78, workload: 65, clientCount: 3, arrManaged: 372000, mood: 'happy', burnoutRisk: 'low', weekMoods: ['happy', 'happy', 'neutral', 'happy', 'happy'] },
    { id: 'tm2', name: 'Thomas R.', email: 'thomas@stratima.com', role: 'CSM', avatar: null, status: 'overloaded', wellbeingScore: 52, workload: 92, clientCount: 3, arrManaged: 306000, mood: 'stressed', burnoutRisk: 'high', weekMoods: ['stressed', 'stressed', 'exhausted', 'stressed', 'neutral'] },
    { id: 'tm3', name: 'Julie K.', email: 'julie@stratima.com', role: 'CSM', avatar: null, status: 'healthy', wellbeingScore: 85, workload: 55, clientCount: 2, arrManaged: 275000, mood: 'great', burnoutRisk: 'none', weekMoods: ['happy', 'great', 'happy', 'great', 'great'] },
  ])

  const teamHealthScore = computed(() => {
    if (!members.value.length) return 0
    return Math.round(members.value.reduce((s, m) => s + m.wellbeingScore, 0) / members.value.length)
  })
  const healthyMembers = computed(() => members.value.filter(m => m.status === 'healthy').length)
  const overloadedMembers = computed(() => members.value.filter(m => m.status === 'overloaded').length)
  const totalArrManaged = computed(() => members.value.reduce((s, m) => s + m.arrManaged, 0))

  function updateMember(id, data) {
    const i = members.value.findIndex(m => m.id === id)
    if (i !== -1) Object.assign(members.value[i], data)
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
  }

  return { members, teamHealthScore, healthyMembers, overloadedMembers, totalArrManaged, updateMember, addMember }
}, { persist: true })
