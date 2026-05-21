import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  try { const { data: { user } } = await supabase.auth.getUser(); return user?.id } catch (err) { if (window.Sentry) window.Sentry.captureException(err); return null }
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

  // Real Churn Rate: clients lost in period / clients at start of period x 100
  function getChurnRate(periodDays = 30) {
    if (!clients.value.length) return 0
    const periodStart = new Date(Date.now() - periodDays * 86400000)
    const churnedInPeriod = clients.value.filter(c => c.churned_at && new Date(c.churned_at) >= periodStart).length
    const existedAtStart = clients.value.filter(c => new Date(c.created_at || 0) < periodStart).length
    if (existedAtStart <= 0) return 0
    return parseFloat(((churnedInPeriod / existedAtStart) * 100).toFixed(1))
  }

  // Real NRR: current ARR of beginning cohort / beginning ARR x 100
  // beginningArr comes from snapshot store (ARR at period start)
  function getNrr(beginningArr, periodDays = 30) {
    if (!beginningArr || beginningArr <= 0) return null
    const periodStart = new Date(Date.now() - periodDays * 86400000)
    const cohortCurrentArr = clients.value
      .filter(c => new Date(c.created_at || 0) < periodStart)
      .reduce((s, c) => s + (c.arr || 0), 0)
    return parseFloat(((cohortCurrentArr / beginningArr) * 100).toFixed(1))
  }

  const criticalCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'critical').length)
  const watchCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'watch').length)
  const healthyCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'healthy').length)
  const arrAtRisk = computed(() => clients.value.filter(c => getEffectiveStatus(c) === 'critical').reduce((s, c) => s + (c.arr || 0), 0))
  const activeCount = computed(() => clients.value.filter(c => getEffectiveStatus(c) !== 'critical').length)

  async function loadClients() {
    loading.value = true; lastError.value = null
    try {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (data) clients.value = data.map(dbToClient)
    } catch (err) { lastError.value = err.message || 'Failed to load'; if (window.Sentry) window.Sentry.captureException(err) } finally { loading.value = false }
  }
  async function addClient(client) {
    lastError.value = null
    try { const { data, error } = await supabase.from('clients').insert([await clientToDb(client)]).select().single(); if (error) throw error; if (data) clients.value.unshift(dbToClient(data)); return data } catch (err) { lastError.value = err.message; if (window.Sentry) window.Sentry.captureException(err); return null }
  }
  async function updateClient(client) {
    lastError.value = null
    try { const { error } = await supabase.from('clients').update(await clientToDb(client)).eq('id', client.id); if (error) throw error; const idx = clients.value.findIndex(c => c.id === client.id); if (idx > -1) clients.value[idx] = { ...clients.value[idx], ...client } } catch (err) { lastError.value = err.message; if (window.Sentry) window.Sentry.captureException(err) }
  }
  async function deleteClient(id) {
    lastError.value = null
    try { const { error } = await supabase.from('clients').delete().eq('id', id); if (error) throw error; clients.value = clients.value.filter(c => c.id !== id) } catch (err) { lastError.value = err.message; if (window.Sentry) window.Sentry.captureException(err) }
  }
  async function resetAll() {
    lastError.value = null
    try { const { error } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000'); if (error) throw error; clients.value = [] } catch (err) { lastError.value = err.message; if (window.Sentry) window.Sentry.captureException(err) }
  }

  function dbToClient(r) {
    return { id: r.id, name: r.name, industry: r.industry || '', arr: r.arr || 0, mrr: r.mrr || 0, health: r.health || 5, nps: r.nps || 0, status: r.status || 'healthy', csm: r.csm || '', churn_risk: r.churn_risk || 0, renewalDate: r.renewal_date || '', contacts: r.contacts || [], logo: r.logo || '', notes: r.notes || '', created_at: r.created_at || null, churned_at: r.churned_at || null }
  }
  async function clientToDb(c) {
    const user_id = await getCurrentUserId()
    if (!user_id) throw new Error('User not authenticated')
    return { user_id, name: c.name, industry: c.industry || '', arr: c.arr || 0, mrr: c.mrr || 0, health: c.health || 5, nps: c.nps || 0, status: c.status || 'healthy', csm: c.csm || '', churn_risk: c.churn_risk ?? c.churnRisk ?? 0, renewal_date: c.renewalDate || null, contacts: c.contacts || [], logo: c.logo || '', notes: c.notes || '', churned_at: c.churned_at || null, updated_at: new Date().toISOString() }
  }

  return {
    clients, loading, lastError, totalArr, avgHealth, avgNps,
    criticalCount, watchCount, healthyCount, arrAtRisk, activeCount,
    getEffectiveStatus, getChurnRate, getNrr,
    loadClients, addClient, updateClient, deleteClient, resetAll,
  }
})
