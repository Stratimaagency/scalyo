import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('scalyo_tokens') || '{}')
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
      const tokens = JSON.parse(localStorage.getItem('scalyo_tokens') || '{}')
      if (tokens.refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh: tokens.refresh })
          const newTokens = { ...tokens, access: data.access }
          if (data.refresh) newTokens.refresh = data.refresh
          localStorage.setItem('scalyo_tokens', JSON.stringify(newTokens))
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('scalyo_tokens')
          localStorage.removeItem('scalyo_user')
          window.location.reload()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
