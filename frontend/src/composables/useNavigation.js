import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'

const ALL_NAV_ITEMS = [
  // Tableau de bord
  { key: 'dashboard', icon: 'dashboard', emoji: '🏠', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'manager-dashboard', icon: 'dashboard', emoji: '📊', roles: ['manager'] },
  // Clients
  { key: 'portfolio', icon: 'briefcase', emoji: '💼', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'health-tracker', icon: 'heart', emoji: '❤️', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'playbook-runner', icon: 'refresh', emoji: '🔄', roles: ['manager', 'csm', 'commercial', 'kam'] },
  // Performance
  { key: 'kpis', icon: 'chart-up', emoji: '📈', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'okr-tracker', icon: 'target', emoji: '🎯', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'roadmap', icon: 'map', emoji: '🗺️', roles: ['manager', 'csm', 'commercial', 'kam'], minPlan: 'Growth' },
  // Projets
  { key: 'tasks', icon: 'check-circle', emoji: '🚀', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'gantt-timeline', icon: 'calendar', emoji: '📅', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'planning', icon: 'calendar', emoji: '🗓️', roles: ['manager', 'csm', 'commercial', 'kam'], minPlan: 'Growth' },
  // Équipe
  { key: 'workload', icon: 'chart-up', emoji: '⚖️', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'wellbeing', icon: 'heart', emoji: '💖', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'coach', icon: 'robot', emoji: '🪄', roles: ['manager', 'csm', 'commercial', 'kam'] },
  // Outils
  { key: 'email-studio', icon: 'envelope', emoji: '💌', roles: ['manager', 'csm', 'commercial', 'kam'], minPlan: 'Growth' },
  { key: 'quotes', icon: 'document', emoji: '✍️', roles: ['manager', 'csm', 'commercial', 'kam'], minPlan: 'Growth' },
  { key: 'smart-import', icon: 'upload', emoji: '📥', roles: ['manager', 'csm', 'commercial', 'kam'] },
  { key: 'integrations', icon: 'bolt', emoji: '⚡', roles: ['manager', 'csm', 'commercial', 'kam'], minPlan: 'Growth' },
  // Paramètres (reste en bas)
  { key: 'settings', icon: 'gear', emoji: '⚙️', roles: ['manager', 'csm', 'commercial', 'kam'] },
]

const PLAN_RANK = { Starter: 0, Growth: 1, Elite: 2 }

const LABEL_KEYS = {
  dashboard: 'dashboard',
  portfolio: 'portfolio',
  kpis: 'kpi',
  planning: 'planning',
  tasks: 'smartMatrice',
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
  'health-tracker': 'healthTracker',
  'gantt-timeline': 'ganttTimeline',
  'okr-tracker': 'okrTracker',
  'workload': 'workload',
  'playbook-runner': 'playbookRunner',
  'manager-dashboard': 'managerDashboard',
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
      .filter(item => ['dashboard', 'portfolio', 'tasks', 'kpis', 'wellbeing', 'coach'].includes(item.key))
      .slice(0, 6)
  )

  return { navItems, mobileNavItems }
}
