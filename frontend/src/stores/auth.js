import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'
import { usePreferencesStore } from './preferences'
import { getTokens, setTokens, clearAuth } from '../composables/useStorage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const company = ref(null)
  const loading = ref(true)

  const prefsStore = usePreferencesStore()

  const isAuthenticated = computed(() => !!user.value)
  const theme = computed(() => prefsStore.theme)

  async function init() {
    const tokens = getTokens()
    if (!tokens.access) {
      loading.value = false
      return
    }
    try {
      const [profileRes, companyRes] = await Promise.all([
        authApi.getProfile(),
        authApi.getCompany(),
      ])
      user.value = profileRes.data
      company.value = companyRes.data
      prefsStore.syncFromUser(user.value)
    } catch {
      clearAuth()
      user.value = null
      company.value = null
    }
    loading.value = false
  }

  async function login(email, password) {
    const { data } = await authApi.login({ email, password })
    setTokens(data.tokens)
    user.value = data.user
    await init()
    return data
  }

  async function register(payload) {
    const { data } = await authApi.register(payload)
    setTokens(data.tokens)
    user.value = data.user
    await init()
    return data
  }

  function logout() {
    clearAuth()
    user.value = null
    company.value = null
  }

  async function updateProfile(data) {
    const res = await authApi.updateProfile(data)
    user.value = res.data
    return res.data
  }

  async function updateCompany(data) {
    const res = await authApi.updateCompany(data)
    company.value = res.data
    return res.data
  }

  return {
    user, company, loading, theme,
    isAuthenticated,
    init, login, register, logout,
    updateProfile, updateCompany,
  }
})
