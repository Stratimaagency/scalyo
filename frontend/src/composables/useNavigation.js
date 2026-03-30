import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'

const ALL_NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'portfolio', icon: 'briefcase', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'kpis', icon: 'chart-up', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'planning', icon: 'calendar', roles: ['manager', 'csm', 'kam'], minPlan: 'Growth' },
  { key: 'tasks', icon: 'check-circle', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'smart-matrice', icon: 'chart-up', roles: ['manager', 'csm', 'kam'] },
  { key: 'wellbeing', icon: 'heart', roles: ['manager', 'csm', 'kam'] },
  { key: 'coach', icon: 'robot', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'resources', icon: 'books', roles: ['manager'] },
  { key: 'quotes', icon: 'document', roles: ['manager', 'commercial', 'kam'], minPlan: 'Growth' },
  { key: 'email-studio', icon: 'envelope', roles: ['manager', 'csm', 'commercial', 'kam'], minPlan: 'Growth' },
  { key: 'integrations', icon: 'bolt', roles: ['manager'], minPlan: 'Growth' },
  { key: 'roadmap', icon: 'map', roles: ['manager'], minPlan: 'Growth' },
  { key: 'smart-import', icon: 'upload', roles: ['manager'] },
  { key: 'tips', icon: 'lightbulb', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'settings', icon: 'gear', roles: ['manager', 'csm', 'commercial', 'kam'] },
]

const PLAN_RANK = { Starter: 0, Growth: 1, Elite: 2 }

const LABEL_KEYS = {
  dashboard: 'dashboard',
  portfolio: 'portfolio',
  kpis: 'kpi',
  planning: 'planning',
  tasks: 'tasks',
  'smart-matrice': 'smartMatrice',
  wellbeing: 'wellbeing',
  coach: 'coach',
  resources: 'resources',
  quotes: 'quotes',
  'email-studio': 'email',
  integrations: 'integrations',
  roadmap: 'roadmap',
  'smart-import': 'smartImport',
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
      .filter(item => item.roles.includes(role))
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
