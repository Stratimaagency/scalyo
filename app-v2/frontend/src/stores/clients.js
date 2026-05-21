import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  } catch (err) {
    if (window.Sentry) window.Sentry.captureException(err)
    return null
  }
}

export const useClientStore = defineStore('clients', () => {
  const clients = ref([])
  const loading = ref(false)
  const lastError = ref(null)

  function getEffectiveStatus(c) {
    if (c.status === 'critical' || c.health <= 3) return 'critical'
    if (c.status === 'watch' || c.status === 'todo' || (c.health > 3 && c.health <= 6)) return 'watch'
    return 'healthy'
  }

  const totalArr = computed(() => clients.value.reduce((s, c) => s + (c.arr || 0), 0))
  const avgHealth = computed(() => {
    if (!clients.value.length) return 0
    return parseFloat((clients.value.reduce((s, c) => s + (c.health || 0), 0) / clients.value.length).toFixed(1))
  })
  const avgNps = computed(() => {
    if (!clients.value.length) return 0
    return Math.round(clients.value.reduce((s, c) => s + (c.nps || 0), 0) / clients.value.length)
  })
  const churnRate = computed(() => {
    if (!clients.value.length) return 0
    return parseFloat(((clients.value.filter(c => c.churn_risk > 30).length / clients.value.length) * 100).toFixed(1))
  })
  const nrr = computed(() => {
    if (totalArr.value <= 0) return 100
    const lostArr = clients.value.filter(c => getEffectiveStatus(c) === 'critical').reduce((s, c) => s + (c.arr || 0), 0)
    return parseFloat((((totalArr.value - lostArr) / totalArr.value) * 100).toFixed(1))
  })

  const criticalCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'critical').length)
  const watchCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'watch').length)
  const healthyCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'healthy').length)
  const arrAtRisk = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'critical').reduce((s, c) => s + (c.arr || 0), 0))
  const activeCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) !== 'critical').length)

  async function loadClients() {
    loading.value = true
    lastError.value = null
    try {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (data) clients.value = data.map(dbToClient)
    } catch (err) {
      lastError.value = err.message || 'Failed to load clients'
      if (window.Sentry) window.Sentry.captureException(err)
    } finally {
      loading.value = false
    }
  }

  async function addClient(client) {
    lastError.value = null
    try {
      const { data, error } = await supabase.from('clients').insert([await clientToDb(client)]).select().single()
      if (error) throw error
      if (data) clients.value.unshift(dbToClient(data))
      return data
    } catch (err) {
      lastError.value = err.message || 'Failed to add client'
      if (window.Sentry) window.Sentry.captureException(err)
      return null
    }
  }

  async function updateClient(client) {
    lastError.value = null
    try {
      const { error } = await supabase.from('clients').update(await clientToDb(client)).eq('id', client.id)
      if (error) throw error
      const idx = clients.value.findIndex(c => c.id === client.id)
      if (idx > -1) clients.value[idx] = { ...clients.value[idx], ...client }
    } catch (err) {
      lastError.value = err.message || 'Failed to update client'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  async function deleteClient(id) {
    lastError.value = null
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      clients.value = clients.value.filter(c => c.id !== id)
    } catch (err) {
      lastError.value = err.message || 'Failed to delete client'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  async function resetAll() {
    lastError.value = null
    try {
      const { error } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      clients.value = []
    } catch (err) {
      lastError.value = err.message || 'Failed to reset clients'
      if (window.Sentry) window.Sentry.captureException(err)
    }
  }

  function dbToClient(r) {
    return {
      id: r.id,
      name: r.name,
      industry: r.industry || '',
      arr: r.arr || 0,
      mrr: r.mrr || 0,
      health: r.health || 5,
      nps: r.nps || 0,
      status: r.status || 'healthy',
      csm: r.csm || '',
      churn_risk: r.churn_risk || 0,
      renewalDate: r.renewal_date || '',
      contacts: r.contacts || [],
      logo: r.logo || '',
      notes: r.notes || '',
    }
  }

  async function clientToDb(c) {
    const user_id = await getCurrentUserId()
    if (!user_id) throw new Error('User not authenticated')
    return { user_id,
      name: c.name,
      industry: c.industry || '',
      arr: c.arr || 0,
      mrr: c.mrr || 0,
      health: c.health || 5,
      nps: c.nps || 0,
      status: c.status || 'healthy',
      csm: c.csm || '',
      churn_risk: c.churn_risk ?? c.churnRisk ?? 0,
      renewal_date: c.renewalDate || null,
      contacts: c.contacts || [],
      logo: c.logo || '',
      notes: c.notes || '',
      updated_at: new Date().toISOString(),
    }
  }

  return {
    clients, loading, lastError, totalArr, avgHealth, avgNps, churnRate, nrr,
    criticalCount, watchCount, healthyCount, arrAtRisk, activeCount,
    getEffectiveStatus,
    loadClients, addClient, updateClient, deleteClient, resetAll,
  }
})
