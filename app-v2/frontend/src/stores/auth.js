import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    id: 'u1',
    firstName: 'Lidia',
    lastName: 'Chikhoune',
    email: 'stratimaagency@gmail.com',
    displayName: 'lidia',
    avatar: null,
    role: 'manager_cs',
    roleLabel: 'Manager CS',
  })

  const company = ref({
    id: 'c1',
    name: 'stratima',
    plan: 'elite',
    planLabel: 'Elite',
    country: 'FR',
    industry: 'SaaS',
    createdAt: '2025-01-15',
  })

  const loading = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const fullName = computed(() => `${user.value?.firstName} ${user.value?.lastName}`)
  const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
  })

  function logout() {
    user.value = null
    company.value = null
  }

  return { user, company, loading, isAuthenticated, fullName, greeting, logout }
})
