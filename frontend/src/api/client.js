import axios from 'axios'
import { getTokens, setTokens, clearAuth } from '../composables/useStorage'

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const tokens = getTokens()
      if (tokens.refresh) {
        try {
          // If a refresh is already in progress, wait for it
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
          return new Promise(() => {}) // prevent error flash before reload
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
