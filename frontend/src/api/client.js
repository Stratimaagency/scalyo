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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const tokens = getTokens()
      if (tokens.refresh) {
        try {
          const refreshUrl = (import.meta.env.VITE_API_URL || '/api') + '/auth/token/refresh/'
          const { data } = await axios.post(refreshUrl, { refresh: tokens.refresh })
          const refreshed = data.tokens || data
          const newTokens = { ...tokens, access: refreshed.access }
          if (refreshed.refresh) newTokens.refresh = refreshed.refresh
          setTokens(newTokens)
          original.headers.Authorization = `Bearer ${refreshed.access}`
          return api(original)
        } catch {
          clearAuth()
          window.location.reload()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
