import { defineStore } from 'pinia'
import { useClientsStore } from './clients'
import { useCsmStore } from './csm'
import { useTasksStore } from './tasks'

export const useManagerStore = defineStore('manager', {
  getters: {
    dashboard() {
      const clientsStore = useClientsStore()
      const csmStore = useCsmStore()
      const tasksStore = useTasksStore()

      const alerts = []

      // Clients at risk → high severity
      for (const c of clientsStore.atRiskClients) {
        alerts.push({
          severity: 1,
          type: 'client_at_risk',
          message: `${c.name} — Health Score ${c.healthScore}%`,
          clientId: c.id,
        })
      }

      // Overloaded CSMs → medium severity
      for (const csm of csmStore.overloadedCSMs) {
        alerts.push({
          severity: 2,
          type: 'csm_overloaded',
          message: `${csm.name} — Charge ${csm.workloadPct}%`,
          csmId: csm.id,
        })
      }

      // Active churn playbooks → medium severity
      for (const pb of tasksStore.activeChurnPlaybooks) {
        alerts.push({
          severity: 2,
          type: 'churn_playbook',
          message: `Playbook anti-churn actif : ${pb.name}`,
          playbookId: pb.id,
        })
      }

      alerts.sort((a, b) => a.severity - b.severity)

      return {
        avgHealthScore: clientsStore.avgHealthScore,
        totalClients: clientsStore.clients.length,
        atRiskCount: clientsStore.atRiskClients.length,
        healthyCount: clientsStore.healthyClients.length,
        totalARR: clientsStore.totalARR,
        teamAvgLoad: csmStore.teamAvgLoad,
        overloadedCSMs: csmStore.overloadedCSMs,
        csmCount: csmStore.csms.length,
        urgentTasks: tasksStore.urgentTasks,
        activeChurnPlaybooks: tasksStore.activeChurnPlaybooks,
        globalOKRScore: tasksStore.globalOKRScore,
        alerts,
      }
    },
  },

  actions: {
    async fetchAll() {
      const clientsStore = useClientsStore()
      const csmStore = useCsmStore()
      const tasksStore = useTasksStore()

      await Promise.all([
        clientsStore.fetchClients(),
        csmStore.fetchCSMs(),
        tasksStore.fetchAll(),
      ])
    },
  },
})
