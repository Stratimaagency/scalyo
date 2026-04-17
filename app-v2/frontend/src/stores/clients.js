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


export const useClientStore = defineStore('clients', () => {
  const clients = ref(load('scalyo_clients', []))

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
