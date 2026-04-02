import { defineStore } from 'pinia'
import { ref } from 'vue'
import { portfolioApi } from '../api'

export const usePortfolioStore = defineStore('portfolio', () => {
  const accounts = ref([])
  const loading = ref(false)

  async function fetchAccounts(params = {}) {
    loading.value = true
    try {
      const { data } = await portfolioApi.getAccounts(params)
      accounts.value = data.results || data
    } catch (e) {
      console.error('fetchAccounts error:', e)
    }
    loading.value = false

    // Sync to clients store (for Health Tracker, Manager Dashboard, etc.)
    try {
      const { useClientsStore } = await import('./clients')
      const clientsStore = useClientsStore()
      if (accounts.value.length && !clientsStore.lastUpdated) {
        await clientsStore.fetchClients()
      }
    } catch { /* clients store not ready */ }
  }

  async function createAccount(data) {
    const res = await portfolioApi.createAccount(data)
    accounts.value.push(res.data)
    return res.data
  }

  async function updateAccount(id, data) {
    const res = await portfolioApi.updateAccount(id, data)
    const idx = accounts.value.findIndex(a => a.id === id)
    if (idx >= 0) accounts.value.splice(idx, 1, res.data)
    return res.data
  }

  async function deleteAccount(id) {
    await portfolioApi.deleteAccount(id)
    accounts.value = accounts.value.filter(a => a.id !== id)
  }

  async function bulkDeleteAccounts(ids, all = false) {
    const { data } = await portfolioApi.bulkDelete(all ? { all: true } : { ids })
    if (all) accounts.value = []
    else accounts.value = accounts.value.filter(a => !ids.includes(a.id))
    return data.deleted
  }

  async function importAccounts(data) {
    return portfolioApi.importAccounts(data)
  }

  return { accounts, loading, fetchAccounts, createAccount, updateAccount, deleteAccount, bulkDeleteAccounts, importAccounts }
})
