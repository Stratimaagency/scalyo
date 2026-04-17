import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useClientStore = defineStore('clients', () => {
  const clients = ref([])
  const loading = ref(false)

  // ─── Computed ─────────────────────────────────────────────────
  const totalArr = computed(() => clients.value.reduce((s, c) => s + (c.arr || 0), 0))
  const avgHealth = computed(() => {
    if (!clients.value.length) return 0
    return (clients.value.reduce((s, c) => s + (c.health || 0), 0) / clients.value.length).toFixed(1)
  })
  const avgNps = computed(() => {
    if (!clients.value.length) return 0
    return Math.round(clients.value.reduce((s, c) => s + (c.nps || 0), 0) / clients.value.length)
  })
  const churnRate = computed(() => {
    if (!clients.value.length) return 0
    return ((clients.value.filter(c => c.churn_risk > 0.3).length / clients.value.length) * 100).toFixed(1)
  })
  const nrr = computed(() => {
    const expanded = clients.value.filter(c => c.status === 'healthy').reduce((s, c) => s + (c.arr || 0), 0)
    return totalArr.value > 0 ? ((expanded / totalArr.value) * 100).toFixed(1) : 100
  })
  const criticalCount = computed(() => clients.value.filter(c => c.status === 'critical' || c.health <= 3).length)
  const watchCount = computed(() => clients.value.filter(c => c.status === 'watch' || (c.health > 3 && c.health <= 6)).length)
  const healthyCount = computed(() => clients.value.filter(c => c.status === 'healthy' && c.health > 6).length)
  const arrAtRisk = computed(() => clients.value.filter(c => c.churn_risk > 0.3).reduce((s, c) => s + (c.arr || 0), 0))

  // ─── Load from Supabase ───────────────────────────────────────
  async function loadClients() {
    loading.value = true
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (!error && data) clients.value = data.map(dbToClient)
    loading.value = false
  }

  // ─── Add ──────────────────────────────────────────────────────
  async function addClient(client) {
    const { data, error } = await supabase.from('clients').insert([clientToDb(client)]).select().single()
    if (!error && data) clients.value.unshift(dbToClient(data))
    return data
  }

  // ─── Update ───────────────────────────────────────────────────
  async function updateClient(client) {
    const { error } = await supabase.from('clients').update(clientToDb(client)).eq('id', client.id)
    if (!error) {
      const idx = clients.value.findIndex(c => c.id === client.id)
      if (idx > -1) clients.value[idx] = { ...clients.value[idx], ...client }
    }
  }

  // ─── Delete ───────────────────────────────────────────────────
  async function deleteClient(id) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) clients.value = clients.value.filter(c => c.id !== id)
  }

  // ─── Reset ────────────────────────────────────────────────────
  async function resetAll() {
    await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    clients.value = []
  }

  // ─── Mappers DB ↔ Store ───────────────────────────────────────
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
      churnRisk: r.churn_risk || 0,
      churn_risk: r.churn_risk || 0,
      renewalDate: r.renewal_date || '',
      contacts: r.contacts || [],
      logo: r.logo || '',
      notes: r.notes || '',
    }
  }

  function clientToDb(c) {
    return {
      name: c.name,
      industry: c.industry || '',
      arr: c.arr || 0,
      mrr: c.mrr || 0,
      health: c.health || 5,
      nps: c.nps || 0,
      status: c.status || 'healthy',
      csm: c.csm || '',
      churn_risk: c.churnRisk ?? c.churn_risk ?? 0,
      renewal_date: c.renewalDate || null,
      contacts: c.contacts || [],
      logo: c.logo || '',
      notes: c.notes || '',
      updated_at: new Date().toISOString(),
    }
  }

  return {
    clients, loading, totalArr, avgHealth, avgNps, churnRate, nrr,
    criticalCount, watchCount, healthyCount, arrAtRisk,
    loadClients, addClient, updateClient, deleteClient, resetAll,
  }
})
