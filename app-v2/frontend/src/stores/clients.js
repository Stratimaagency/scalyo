import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const DEMO_CLIENTS = [
  { id: 'cl1', name: 'TechScale', industry: 'SaaS', arr: 120000, mrr: 10000, health: 8.2, nps: 45, status: 'healthy', csm: 'Lidia', csmId: 'tm1', logo: '🟢', churnRisk: 0.05, renewalDate: '2026-09-01', contacts: [{ name: 'Marc Dupont', email: 'marc@techscale.io', role: 'CTO' }] },
  { id: 'cl2', name: 'Acme Corp', industry: 'Retail', arr: 85000, mrr: 7083, health: 7.1, nps: 38, status: 'healthy', csm: 'Thomas', csmId: 'tm2', logo: '🟢', churnRisk: 0.08, renewalDate: '2026-07-15', contacts: [] },
  { id: 'cl3', name: 'Biotech Group', industry: 'Santé', arr: 200000, mrr: 16667, health: 9.1, nps: 72, status: 'healthy', csm: 'Lidia', csmId: 'tm1', logo: '🟢', churnRisk: 0.02, renewalDate: '2026-11-30', contacts: [] },
  { id: 'cl4', name: 'Leroy Finance', industry: 'Finance', arr: 95000, mrr: 7917, health: 3.2, nps: 12, status: 'critical', csm: 'Thomas', csmId: 'tm2', logo: '🔴', churnRisk: 0.72, renewalDate: '2026-05-10', contacts: [{ name: 'Sophie Leroy', email: 'sleroy@leroyfi.com', role: 'CEO' }] },
  { id: 'cl5', name: 'NovaTech', industry: 'Tech', arr: 150000, mrr: 12500, health: 7.8, nps: 55, status: 'healthy', csm: 'Lidia', csmId: 'tm1', logo: '🟢', churnRisk: 0.06, renewalDate: '2026-08-20', contacts: [] },
  { id: 'cl6', name: 'MediaGroup', industry: 'Média', arr: 60000, mrr: 5000, health: 5.5, nps: 22, status: 'watch', csm: 'Sarah', csmId: 'tm3', logo: '🟡', churnRisk: 0.28, renewalDate: '2026-06-01', contacts: [] },
  { id: 'cl7', name: 'LogiPro', industry: 'Logistique', arr: 75000, mrr: 6250, health: 6.3, nps: 31, status: 'watch', csm: 'Thomas', csmId: 'tm2', logo: '🟡', churnRisk: 0.19, renewalDate: '2026-10-15', contacts: [] },
  { id: 'cl8', name: 'DataVault', industry: 'Data', arr: 110000, mrr: 9167, health: 2.8, nps: 8, status: 'critical', csm: 'Sarah', csmId: 'tm3', logo: '🔴', churnRisk: 0.81, renewalDate: '2026-04-30', contacts: [] },
]

export const useClientStore = defineStore('clients', () => {
  const clients = ref(load('scalyo_clients', DEMO_CLIENTS))

  const totalArr = computed(() => clients.value.reduce((s, c) => s + (c.arr || 0), 0))
  const avgHealth = computed(() => clients.value.length ? parseFloat((clients.value.reduce((s, c) => s + (c.health || 0), 0) / clients.value.length).toFixed(1)) : 0)
  const avgNps = computed(() => clients.value.length ? Math.round(clients.value.reduce((s, c) => s + (c.nps || 0), 0) / clients.value.length) : 0)
  const criticalCount = computed(() => clients.value.filter(c => c.status === 'critical').length)
  const watchCount = computed(() => clients.value.filter(c => c.status === 'watch').length)
  const healthyCount = computed(() => clients.value.filter(c => c.status === 'healthy').length)
  const churnRate = computed(() => clients.value.length ? parseFloat((clients.value.reduce((s, c) => s + (c.churnRisk || 0), 0) / clients.value.length * 100).toFixed(1)) : 0)
  const arrAtRisk = computed(() => clients.value.filter(c => c.status === 'critical').reduce((s, c) => s + (c.arr || 0), 0))
  const renewalsNext30 = computed(() => {
    const now = new Date()
    const in30 = new Date(now.getTime() + 30 * 86400000)
    return clients.value.filter(c => {
      if (!c.renewalDate) return false
      const d = new Date(c.renewalDate)
      return d >= now && d <= in30
    }).length
  })

  function addClient(client) {
    clients.value.push({
      id: 'cl' + Date.now(),
      logo: '🟡',
      contacts: [],
      churnRisk: 0.1,
      renewalDate: '',
      ...client,
    })
    save('scalyo_clients', clients.value)
  }

  function updateClient(id, data) {
    const i = clients.value.findIndex(c => c.id === id)
    if (i !== -1) {
      Object.assign(clients.value[i], data)
      save('scalyo_clients', clients.value)
    }
  }

  function deleteClient(id) {
    clients.value = clients.value.filter(c => c.id !== id)
    save('scalyo_clients', clients.value)
  }

  function resetAll() {
    clients.value = []
    save('scalyo_clients', [])
  }

  return {
    clients, totalArr, avgHealth, avgNps, criticalCount, watchCount, healthyCount,
    churnRate, arrAtRisk, renewalsNext30,
    addClient, updateClient, deleteClient, resetAll,
  }
}, { persist: false })
