import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'

const ALL_NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', role: 'all' },
  { key: 'portfolio', icon: '💼', role: 'all' },
  { key: 'kpis', icon: '📈', role: 'all' },
  { key: 'planning', icon: '📅', role: 'all' },
  { key: 'tasks', icon: '✅', role: 'all' },
  { key: 'wellbeing', icon: '💚', role: 'all' },
  { key: 'coach', icon: '🤖', role: 'all' },
  { key: 'resources', icon: '📚', role: 'manager' },
  { key: 'email-studio', icon: '✉️', role: 'all' },
  { key: 'roadmap', icon: '🗺️', role: 'manager' },
  { key: 'tips', icon: '💡', role: 'all' },
  { key: 'settings', icon: '⚙️', role: 'all' },
]

const LABEL_KEYS = {
  dashboard: 'dashboard',
  portfolio: 'portfolio',
  kpis: 'kpi',
  planning: 'planning',
  tasks: 'tasks',
  wellbeing: 'wellbeing',
  coach: 'coach',
  resources: 'resources',
  'email-studio': 'email',
  roadmap: 'roadmap',
  tips: 'tips',
  settings: 'settings',
}

export function useNavigation() {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const navItems = computed(() => {
    const role = authStore.user?.role || 'csm'
    return ALL_NAV_ITEMS
      .filter(item => item.role === 'all' || item.role === role)
      .map(item => ({
        ...item,
        label: t(LABEL_KEYS[item.key] || item.key),
        routeName: item.key,
      }))
  })

  const mobileNavItems = computed(() => navItems.value.slice(0, 5))

  return { navItems, mobileNavItems }
}
