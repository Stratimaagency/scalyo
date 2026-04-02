import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useClientsStore } from './clients'
import api from '../api/client'

export const useCSMStore = defineStore('csm', () => {
  const csms = ref([])
  const loading = ref(false)

  const workloadByCSM = computed(() => {
    const clientsStore = useClientsStore()
    return csms.value.map(csm => ({
      ...csm,
      clients: clientsStore.clientsByCSM[csm.id] || [],
      atRiskCount: (clientsStore.clientsByCSM[csm.id] || []).filter(c => c.status === 'at-risk').length,
    }))
  })

  const overloadedCSMs = computed(() => workloadByCSM.value.filter(c => c.workloadPct >= 85))
  const teamAvgLoad = computed(() => {
    if (!csms.value.length) return 0
    return Math.round(csms.value.reduce((a, c) => a + (c.workloadPct || 0), 0) / csms.value.length)
  })

  async function fetchCSMs() {
    loading.value = true
    try {
      const { data } = await api.get('/csms/workload')
      csms.value = data.data || []
    } catch {
      // Fallback: build from clients store
      const clientsStore = useClientsStore()
      const csmMap = {}
      clientsStore.clients.forEach(c => {
        const name = c.csmName || 'Non assigné'
        if (!csmMap[name]) csmMap[name] = { id: c.csmId || name, name, workloadPct: 0, clientCount: 0 }
        csmMap[name].clientCount++
      })
      const total = Object.keys(csmMap).length || 1
      Object.values(csmMap).forEach(c => {
        c.workloadPct = Math.min(100, Math.round((c.clientCount / (total * 3)) * 100))
      })
      csms.value = Object.values(csmMap)
    } finally {
      loading.value = false
    }
  }

  return { csms, loading, workloadByCSM, overloadedCSMs, teamAvgLoad, fetchCSMs }
})
