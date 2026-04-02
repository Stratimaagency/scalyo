import { defineStore } from 'pinia'
import api from '../api/client'
import { useClientsStore } from './clients'

export const useCsmStore = defineStore('csm', {
  state: () => ({
    csms: [],
    loading: false,
  }),

  getters: {
    workloadByCSM() {
      const clientsStore = useClientsStore()
      const clientsByCSM = clientsStore.clientsByCSM
      return this.csms.map(csm => ({
        ...csm,
        clients: clientsByCSM[csm.id] || [],
      }))
    },
    overloadedCSMs: (state) => state.csms.filter(csm => csm.workloadPct >= 85),
    teamAvgLoad: (state) => {
      if (!state.csms.length) return 0
      return Math.round(state.csms.reduce((sum, csm) => sum + csm.workloadPct, 0) / state.csms.length)
    },
  },

  actions: {
    async fetchCSMs() {
      this.loading = true
      try {
        const { data } = await api.get('/csms/workload')
        this.csms = data
      } finally {
        this.loading = false
      }
    },
  },
})
