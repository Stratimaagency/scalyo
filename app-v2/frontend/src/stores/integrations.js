import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { INTEGRATIONS, getIntegrationsByCategory, getAvailableForPlan } from '@/config/integrations'

export const useIntegrationStore = defineStore('integrations', () => {
  const connections = ref([])
  const loading = ref(false)
  const lastError = ref(null)

  const connectedIds = computed(() => connections.value.filter(c => c.status === 'active').map(c => c.integration_id))

  function isConnected(integrationId) {
    return connectedIds.value.includes(integrationId)
  }

  function getConnection(integrationId) {
    return connections.value.find(c => c.integration_id === integrationId) || null
  }

  async function loadConnections() {
    loading.value = true
    lastError.value = null
    try {
      const { data, error } = await supabase.from('org_integrations').select('*').order('connected_at', { ascending: false })
      if (error) throw error
      connections.value = data || []
    } catch (err) {
      lastError.value = err.message
      connections.value = []
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(integrationId, config) {
    lastError.value = null
    try {
      const existing = getConnection(integrationId)
      if (!existing) throw new Error('not_connected')
      const { error } = await supabase.from('org_integrations').update({ config, updated_at: new Date().toISOString() }).eq('id', existing.id)
      if (error) throw error
      existing.config = config
    } catch (err) { lastError.value = err.message; throw err }
  }

  async function disconnect(integrationId) {
    lastError.value = null
    try {
      const existing = getConnection(integrationId)
      if (!existing) return
      const { error } = await supabase.from('org_integrations').delete().eq('id', existing.id)
      if (error) throw error
      connections.value = connections.value.filter(c => c.id !== existing.id)
    } catch (err) { lastError.value = err.message; throw err }
  }

  async function connectWebhook(integrationId, config) {
    lastError.value = null
    try {
      const { data, error } = await supabase.from('org_integrations').insert({ integration_id: integrationId, status: 'active', config, connected_at: new Date().toISOString() }).select().single()
      if (error) throw error
      connections.value.unshift(data)
      return data
    } catch (err) { lastError.value = err.message; throw err }
  }

  function getCatalog(locale = 'fr') { return getIntegrationsByCategory(locale) }
  function getAvailable(plan) { return getAvailableForPlan(plan) }
  function getIntegrationMeta(id) { return INTEGRATIONS[id] || null }

  return { connections, loading, lastError, connectedIds, isConnected, getConnection, loadConnections, saveConfig, disconnect, connectWebhook, getCatalog, getAvailable, getIntegrationMeta }
})
