import axios from 'axios'
import { getTokens, setTokens, clearAuth } from '../composables/useStorage'
import { useToast } from '../composables/useToast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const tokens = getTokens()
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

// Shared refresh promise to avoid multiple simultaneous refresh calls
let refreshPromise = null

// Debounce network error toasts to avoid spam
let lastNetworkToast = 0

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    // Token refresh on 401
    if (status === 401 && !original._retry) {
      original._retry = true
      const tokens = getTokens()
      if (tokens.refresh) {
        try {
          if (!refreshPromise) {
            const refreshUrl = (import.meta.env.VITE_API_URL || '/api') + '/auth/token/refresh/'
            refreshPromise = axios.post(refreshUrl, { refresh: tokens.refresh })
              .finally(() => { refreshPromise = null })
          }
          const { data } = await refreshPromise
          const refreshed = data.tokens || data
          const newTokens = { ...tokens, access: refreshed.access }
          if (refreshed.refresh) newTokens.refresh = refreshed.refresh
          setTokens(newTokens)
          original.headers.Authorization = `Bearer ${refreshed.access}`
          return api(original)
        } catch {
          clearAuth()
          window.location.reload()
          return new Promise(() => {})
        }
      }
    }

    // Show toast for API errors (except 401 handled above)
    const toast = useToast()
    if (!error.response) {
      // Network error — debounce to avoid toast spam
      const now = Date.now()
      if (now - lastNetworkToast > 10000) {
        lastNetworkToast = now
        toast.error('Connexion au serveur impossible. Vérifiez votre connexion.')
      }
    } else if (status === 403) {
      toast.warning('Accès refusé — permissions insuffisantes.')
    } else if (status === 500) {
      toast.error('Erreur serveur. Réessayez dans quelques instants.')
    } else if (status && status >= 400 && status !== 401 && status !== 422) {
      const msg = error.response.data?.error || error.response.data?.message || `Erreur ${status}`
      toast.error(msg)
    }

    return Promise.reject(error)
  }
)

export default api
