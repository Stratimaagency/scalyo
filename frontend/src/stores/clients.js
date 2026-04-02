import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([])
  const loading = ref(false)
  const lastUpdated = ref(null)

  const atRiskClients = computed(() => clients.value.filter(c => c.status === 'at-risk'))
  const healthyClients = computed(() => clients.value.filter(c => c.status === 'healthy'))
  const avgHealthScore = computed(() => {
    if (!clients.value.length) return 0
    return Math.round(clients.value.reduce((a, c) => a + c.healthScore, 0) / clients.value.length)
  })
  const totalARR = computed(() => clients.value.reduce((a, c) => a + (c.arrValue || 0), 0))
  const clientsByCSM = computed(() => {
    return clients.value.reduce((acc, c) => {
      if (!acc[c.csmId]) acc[c.csmId] = []
      acc[c.csmId].push(c)
      return acc
    }, {})
  })

  async function fetchClients() {
    loading.value = true
    try {
      const { data } = await api.get('/clients/health')
      clients.value = data.data || []
      lastUpdated.value = new Date()
    } catch {
      // Fallback: build from portfolio store if API not ready
      const { usePortfolioStore } = await import('./portfolio')
      const portfolioStore = usePortfolioStore()
      if (portfolioStore.accounts.length) {
        clients.value = portfolioStore.accounts.map(a => ({
          id: a.id,
          name: a.name,
          healthScore: a.health || 0,
          status: (a.health || 0) >= 75 ? 'healthy' : (a.health || 0) >= 60 ? 'neutral' : 'at-risk',
          arrValue: a.arr || (a.mrr ? a.mrr * 12 : 0),
          csmId: a.assigned_csm_id || null,
          csmName: a.csm || '',
          renewal: a.renewal || null,
          issues: [],
        }))
        lastUpdated.value = new Date()
      }
    } finally {
      loading.value = false
    }
  }

  function updateClientHealth(clientId, newScore) {
    const idx = clients.value.findIndex(c => c.id === clientId)
    if (idx !== -1) {
      clients.value[idx].healthScore = newScore
      clients.value[idx].status = newScore >= 75 ? 'healthy' : newScore >= 60 ? 'neutral' : 'at-risk'
    }
  }

  return { clients, loading, lastUpdated, atRiskClients, healthyClients, avgHealthScore, totalARR, clientsByCSM, fetchClients, updateClientHealth }
})
