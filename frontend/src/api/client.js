import axios from 'axios'
import { getTokens, setTokens, clearAuth } from '../composables/useStorage'

const api = axios.create({
  baseURL: '/api',
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
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh: tokens.refresh })
          const newTokens = { ...tokens, access: data.access }
          if (data.refresh) newTokens.refresh = data.refresh
          setTokens(newTokens)
          original.headers.Authorization = `Bearer ${data.access}`
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
