import { ref } from 'vue'

/**
 * Composable for consistent error handling across views.
 * Replaces silent catch blocks with user-visible feedback.
 */
export function useErrorHandler() {
  const error = ref(null)
  const loading = ref(false)

  async function withLoading(fn) {
    loading.value = true
    error.value = null
    try {
      const result = await fn()
      return result
    } catch (e) {
      error.value = e.response?.data?.error || e.response?.data?.detail || e.message || 'An error occurred'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return { error, loading, withLoading, clearError }
}
