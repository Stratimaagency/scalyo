import { defineStore } from 'pinia'
import api from '../api/client'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [],
    loading: false,
    lastUpdated: null,
  }),

  getters: {
    atRiskClients: (state) => state.clients.filter(c => c.healthScore < 60),
    healthyClients: (state) => state.clients.filter(c => c.healthScore >= 75),
    neutralClients: (state) => state.clients.filter(c => c.healthScore >= 60 && c.healthScore < 75),
    avgHealthScore: (state) => {
      if (!state.clients.length) return 0
      return Math.round(state.clients.reduce((sum, c) => sum + c.healthScore, 0) / state.clients.length)
    },
    totalARR: (state) => state.clients.reduce((sum, c) => sum + (c.arrValue || 0), 0),
    clientsByCSM: (state) => {
      const grouped = {}
      for (const c of state.clients) {
        if (!grouped[c.csmId]) grouped[c.csmId] = []
        grouped[c.csmId].push(c)
      }
      return grouped
    },
  },

  actions: {
    async fetchClients() {
      this.loading = true
      try {
        const { data } = await api.get('/clients/health')
        this.clients = data
        this.lastUpdated = new Date().toISOString()
      } finally {
        this.loading = false
      }
    },

    async updateClientHealth(clientId, newScore) {
      const { data } = await api.post(`/clients/${clientId}/health`, { score: newScore })
      const idx = this.clients.findIndex(c => c.id === clientId)
      if (idx !== -1) this.clients[idx] = data
      return data
    },
  },
})
