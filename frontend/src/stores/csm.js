import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useClientsStore } from './clients'
import api from '../api/client'
import { seedCSMs } from '../tests/seed'

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
      const { data } = await api.get('/csms/workload')
      const apiData = data.data || []
      if (apiData.length) {
        csms.value = apiData
        return
      }
    } catch {
      // API not ready
    }

    // Fallback: seed data
    if (!csms.value.length) {
      csms.value = JSON.parse(JSON.stringify(seedCSMs))
    }

    loading.value = false
  }

  return { csms, loading, workloadByCSM, overloadedCSMs, teamAvgLoad, fetchCSMs }
})
