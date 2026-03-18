import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'

const ALL_NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard', role: 'all' },
  { key: 'portfolio', icon: 'briefcase', role: 'all' },
  { key: 'kpis', icon: 'chart-up', role: 'all' },
  { key: 'planning', icon: 'calendar', role: 'all' },
  { key: 'tasks', icon: 'check-circle', role: 'all' },
  { key: 'wellbeing', icon: 'heart', role: 'all' },
  { key: 'coach', icon: 'robot', role: 'all' },
  { key: 'resources', icon: 'books', role: 'manager' },
  { key: 'email-studio', icon: 'envelope', role: 'all' },
  { key: 'integrations', icon: 'bolt', role: 'manager' },
  { key: 'roadmap', icon: 'map', role: 'manager' },
  { key: 'tips', icon: 'lightbulb', role: 'all' },
  { key: 'settings', icon: 'gear', role: 'all' },
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
  integrations: 'integrations',
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

  const mobileNavItems = computed(() =>
    navItems.value
      .filter(item => ['dashboard', 'portfolio', 'tasks', 'kpis', 'wellbeing', 'email-studio'].includes(item.key))
      .slice(0, 6)
  )

  return { navItems, mobileNavItems }
}
