import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useClientsStore } from './clients'
import { useCSMStore } from './csm'
import { useTasksStore } from './tasks'

export const useManagerStore = defineStore('manager', () => {
  const clientsStore = useClientsStore()
  const csmStore = useCSMStore()
  const tasksStore = useTasksStore()

  const dashboard = computed(() => ({
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

    alerts: [
      ...clientsStore.atRiskClients.map(c => ({
        type: 'at-risk', severity: 'high',
        message: `⚠️ ${c.name} — Score santé critique : ${c.healthScore}/100`,
        clientId: c.id, csmId: c.csmId, route: { name: 'health-tracker' }
      })),
      ...csmStore.overloadedCSMs.map(c => ({
        type: 'overload', severity: 'medium',
        message: `🔴 ${c.name} surchargé(e) — Charge : ${c.workloadPct}%`,
        csmId: c.id, route: { name: 'workload' }
      })),
      ...tasksStore.urgentTasks.map(t => ({
        type: 'urgent-task', severity: 'medium',
        message: `📌 Tâche urgente sur client à risque : ${t.title} (${t.clientName})`,
        route: { name: 'gantt-timeline' }
      }))
    ].sort((a, b) => a.severity === 'high' ? -1 : 1)
  }))

  async function fetchAll() {
    await Promise.all([
      clientsStore.fetchClients(),
      csmStore.fetchCSMs(),
      tasksStore.fetchAll(),
    ])
  }

  return { dashboard, fetchAll }
})
