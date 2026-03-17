import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api'
import { getPreference, setPreference } from '../composables/useStorage'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref(getPreference('theme') || 'dark')
  const lang = ref(getPreference('lang') || 'fr')
  const currency = ref(getPreference('currency') || 'EUR')

  function syncFromUser(user) {
    if (user.theme) { theme.value = user.theme; setPreference('theme', user.theme) }
    if (user.language) { lang.value = user.language; setPreference('lang', user.language) }
    if (user.currency) { currency.value = user.currency; setPreference('currency', user.currency) }
  }

  function setTheme(value) {
    theme.value = value
    setPreference('theme', value)
    document.documentElement.setAttribute('data-theme', value)
    authApi.updateProfile({ theme: value }).catch(() => {})
  }

  function setLang(value) {
    lang.value = value
    setPreference('lang', value)
    authApi.updateProfile({ language: value }).catch(() => {})
  }

  function setCurrency(value) {
    currency.value = value
    setPreference('currency', value)
    authApi.updateProfile({ currency: value }).catch(() => {})
  }

  return { theme, lang, currency, syncFromUser, setTheme, setLang, setCurrency }
})
