import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useClientStore = defineStore('clients', () => {
  const clients = ref([
    { id: 'cl1', name: 'TechScale', industry: 'SaaS', arr: 120000, health: 9.1, nps: 72, status: 'healthy', csm: 'Sophie M.', csmId: 'tm1', logo: '🟢', renewalDate: '2026-09-15', mrr: 10000, churnRisk: 0.02, contacts: [{ name: 'Marc Duval', email: 'marc@techscale.io', role: 'CTO' }], createdAt: '2024-06-01', lastActivity: '2026-04-10' },
    { id: 'cl2', name: 'Acme Corp', industry: 'Manufacturing', arr: 85000, health: 6.4, nps: 35, status: 'watch', csm: 'Thomas R.', csmId: 'tm2', logo: '🟡', renewalDate: '2026-06-20', mrr: 7083, churnRisk: 0.15, contacts: [{ name: 'Claire Petit', email: 'claire@acme.fr', role: 'VP Ops' }], createdAt: '2024-09-10', lastActivity: '2026-04-08' },
    { id: 'cl3', name: 'Biotech Group', industry: 'Healthcare', arr: 210000, health: 8.7, nps: 68, status: 'healthy', csm: 'Sophie M.', csmId: 'tm1', logo: '🟢', renewalDate: '2026-12-01', mrr: 17500, churnRisk: 0.03, contacts: [{ name: 'Dr. Faure', email: 'faure@biotech.com', role: 'CEO' }], createdAt: '2024-03-15', lastActivity: '2026-04-11' },
    { id: 'cl4', name: 'Leroy Finance', industry: 'Finance', arr: 65000, health: 3.2, nps: 12, status: 'critical', csm: 'Thomas R.', csmId: 'tm2', logo: '🔴', renewalDate: '2026-05-10', mrr: 5417, churnRisk: 0.45, contacts: [{ name: 'Jean Leroy', email: 'j.leroy@leroyfinance.fr', role: 'DG' }], createdAt: '2025-01-20', lastActivity: '2026-03-28' },
    { id: 'cl5', name: 'NovaTech', industry: 'SaaS', arr: 95000, health: 7.8, nps: 55, status: 'healthy', csm: 'Julie K.', csmId: 'tm3', logo: '🟢', renewalDate: '2026-08-15', mrr: 7917, churnRisk: 0.05, contacts: [{ name: 'Yuki Tanaka', email: 'yuki@novatech.io', role: 'Head CS' }], createdAt: '2024-11-01', lastActivity: '2026-04-09' },
    { id: 'cl6', name: 'MegaCorp', industry: 'Retail', arr: 180000, health: 7.2, nps: 48, status: 'watch', csm: 'Julie K.', csmId: 'tm3', logo: '🟡', renewalDate: '2026-07-30', mrr: 15000, churnRisk: 0.10, contacts: [{ name: 'Sophie Martin', email: 'smartin@megacorp.com', role: 'COO' }], createdAt: '2024-05-20', lastActivity: '2026-04-07' },
    { id: 'cl7', name: 'Rapid SaaS', industry: 'SaaS', arr: 42000, health: 8.5, nps: 65, status: 'healthy', csm: 'Sophie M.', csmId: 'tm1', logo: '🟢', renewalDate: '2026-10-01', mrr: 3500, churnRisk: 0.04, contacts: [{ name: 'Alex Dubois', email: 'alex@rapidsaas.com', role: 'Founder' }], createdAt: '2025-03-01', lastActivity: '2026-04-11' },
    { id: 'cl8', name: 'DataVault', industry: 'Security', arr: 156000, health: 4.5, nps: 22, status: 'critical', csm: 'Thomas R.', csmId: 'tm2', logo: '🔴', renewalDate: '2026-05-25', mrr: 13000, churnRisk: 0.35, contacts: [{ name: 'Pierre Noir', email: 'pnoir@datavault.eu', role: 'CISO' }], createdAt: '2024-07-10', lastActivity: '2026-04-02' },
  ])

  const totalArr = computed(() => clients.value.reduce((s, c) => s + c.arr, 0))
  const avgHealth = computed(() => {
    if (!clients.value.length) return 0
    return +(clients.value.reduce((s, c) => s + c.health, 0) / clients.value.length).toFixed(1)
  })
  const avgNps = computed(() => {
    if (!clients.value.length) return 0
    return Math.round(clients.value.reduce((s, c) => s + c.nps, 0) / clients.value.length)
  })
  const criticalCount = computed(() => clients.value.filter(c => c.status === 'critical').length)
  const watchCount = computed(() => clients.value.filter(c => c.status === 'watch').length)
  const healthyCount = computed(() => clients.value.filter(c => c.status === 'healthy').length)
  const churnRate = computed(() => {
    if (!clients.value.length) return 0
    return +(clients.value.reduce((s, c) => s + c.churnRisk, 0) / clients.value.length * 100).toFixed(1)
  })
  const arrAtRisk = computed(() => clients.value.filter(c => c.status === 'critical').reduce((s, c) => s + c.arr, 0))
  const renewalsNext30 = computed(() => {
    const now = new Date()
    const in30 = new Date(now.getTime() + 30 * 86400000)
    return clients.value.filter(c => {
      const d = new Date(c.renewalDate)
      return d >= now && d <= in30
    })
  })

  function addClient(client) {
    clients.value.push({ id: 'cl' + Date.now(), createdAt: new Date().toISOString().slice(0, 10), lastActivity: new Date().toISOString().slice(0, 10), ...client })
  }

  function updateClient(id, data) {
    const i = clients.value.findIndex(c => c.id === id)
    if (i !== -1) Object.assign(clients.value[i], data)
  }

  function deleteClient(id) {
    clients.value = clients.value.filter(c => c.id !== id)
  }

  return {
    clients, totalArr, avgHealth, avgNps, criticalCount, watchCount, healthyCount,
    churnRate, arrAtRisk, renewalsNext30,
    addClient, updateClient, deleteClient,
  }
})
