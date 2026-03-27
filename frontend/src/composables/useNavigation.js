import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'

const ALL_NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard', role: 'all' },
  { key: 'portfolio', icon: 'briefcase', role: 'all' },
  { key: 'kpis', icon: 'chart-up', role: 'all' },
  { key: 'planning', icon: 'calendar', role: 'all', minPlan: 'Growth' },
  { key: 'tasks', icon: 'check-circle', role: 'all' },
  { key: 'wellbeing', icon: 'heart', role: 'all' },
  { key: 'coach', icon: 'robot', role: 'all' },
  { key: 'resources', icon: 'books', role: 'manager' },
  { key: 'quotes', icon: 'document', role: 'manager', minPlan: 'Growth' },
  { key: 'email-studio', icon: 'envelope', role: 'all', minPlan: 'Growth' },
  { key: 'integrations', icon: 'bolt', role: 'manager', minPlan: 'Growth' },
  { key: 'roadmap', icon: 'map', role: 'manager', minPlan: 'Growth' },
  { key: 'tips', icon: 'lightbulb', role: 'all' },
  { key: 'settings', icon: 'gear', role: 'all' },
]

const PLAN_RANK = { Starter: 0, Growth: 1, Elite: 2 }

const LABEL_KEYS = {
  dashboard: 'dashboard',
  portfolio: 'portfolio',
  kpis: 'kpi',
  planning: 'planning',
  tasks: 'tasks',
  wellbeing: 'wellbeing',
  coach: 'coach',
  resources: 'resources',
  quotes: 'quotes',
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
    const currentPlanRank = PLAN_RANK[authStore.company?.plan || 'Starter'] ?? 0
    return ALL_NAV_ITEMS
      .filter(item => item.role === 'all' || item.role === role)
      .map(item => ({
        ...item,
        label: t(LABEL_KEYS[item.key] || item.key),
        routeName: item.key,
        locked: item.minPlan ? currentPlanRank < (PLAN_RANK[item.minPlan] ?? 1) : false,
      }))
  })

  const mobileNavItems = computed(() =>
    navItems.value
      .filter(item => ['dashboard', 'portfolio', 'tasks', 'kpis', 'wellbeing', 'email-studio'].includes(item.key))
      .slice(0, 6)
  )

  return { navItems, mobileNavItems }
}
