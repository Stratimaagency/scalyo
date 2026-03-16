import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const company = ref(null)
  const loading = ref(true)
  const theme = ref(localStorage.getItem('scalyo_theme') || 'dark')
  const lang = ref(localStorage.getItem('scalyo_lang') || 'fr')
  const currency = ref(localStorage.getItem('scalyo_currency') || 'EUR')

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    const tokens = JSON.parse(localStorage.getItem('scalyo_tokens') || '{}')
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
      if (user.value.theme) {
        theme.value = user.value.theme
        localStorage.setItem('scalyo_theme', user.value.theme)
      }
      if (user.value.language) {
        lang.value = user.value.language
        localStorage.setItem('scalyo_lang', user.value.language)
      }
      if (user.value.currency) {
        currency.value = user.value.currency
        localStorage.setItem('scalyo_currency', user.value.currency)
      }
    } catch {
      localStorage.removeItem('scalyo_tokens')
      localStorage.removeItem('scalyo_user')
      user.value = null
      company.value = null
    }
    loading.value = false
  }

  async function login(email, password) {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('scalyo_tokens', JSON.stringify(data.tokens))
    user.value = data.user
    await init()
    return data
  }

  async function register(payload) {
    const { data } = await authApi.register(payload)
    localStorage.setItem('scalyo_tokens', JSON.stringify(data.tokens))
    user.value = data.user
    await init()
    return data
  }

  function logout() {
    localStorage.removeItem('scalyo_tokens')
    localStorage.removeItem('scalyo_user')
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

  function setTheme(t) {
    theme.value = t
    localStorage.setItem('scalyo_theme', t)
    document.documentElement.setAttribute('data-theme', t)
    authApi.updateProfile({ theme: t }).catch(() => {})
  }

  function setLang(l) {
    lang.value = l
    localStorage.setItem('scalyo_lang', l)
    authApi.updateProfile({ language: l }).catch(() => {})
  }

  function setCurrency(c) {
    currency.value = c
    localStorage.setItem('scalyo_currency', c)
    authApi.updateProfile({ currency: c }).catch(() => {})
  }

  return {
    user, company, loading, theme, lang, currency,
    isAuthenticated,
    init, login, register, logout,
    updateProfile, updateCompany,
    setTheme, setLang, setCurrency,
  }
})
