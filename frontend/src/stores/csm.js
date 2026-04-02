import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useClientsStore } from './clients'
import api from '../api/client'

export const useCSMStore = defineStore('csm', () => {
  const csms = ref([])
  const loading = ref(false)

  const workloadByCSM = computed(() => {
    const clientsStore = useClientsStore()
    return csms.value.map(csm => {
      const csmClients = clientsStore.clientsByCSM[csm.id] || []
      return {
        ...csm,
        clients: csmClients,
        clientCount: csmClients.length || csm.clientCount || 0,
        atRiskCount: csmClients.filter(c => c.status === 'at-risk').length,
        avgHealth: csmClients.length
          ? Math.round(csmClients.reduce((a, c) => a + c.healthScore, 0) / csmClients.length)
          : (csm.avgHealth || 0),
      }
    })
  })

  const overloadedCSMs = computed(() => workloadByCSM.value.filter(c => c.workloadPct >= 85))
  const teamAvgLoad = computed(() => {
    if (!csms.value.length) return 0
    return Math.round(csms.value.reduce((a, c) => a + (c.workloadPct || 0), 0) / csms.value.length)
  })

  async function fetchCSMs() {
    loading.value = true
    try {
      const { data } = await api.get('/modules/csms/workload')
      csms.value = data.data || []
    } catch { /* API not ready */ }
    loading.value = false
  }

  return { csms, loading, workloadByCSM, overloadedCSMs, teamAvgLoad, fetchCSMs }
})
