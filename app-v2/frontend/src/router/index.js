import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isModuleAllowed } from '@/utils/planGating'

const routes = [
  { path: '/', name: 'landing', component: () => import('@/views/LandingPage.vue'), meta: { guest: true } },
  { path: '/paywall', name: 'paywall', component: () => import('@/views/PaywallView.vue') },
  { path: '/payment-success', name: 'payment-success', component: () => import('@/views/PaymentSuccessView.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'manager', name: 'manager', component: () => import('@/views/ManagerView.vue') },
      { path: 'portfolio', name: 'portfolio', component: () => import('@/views/PortfolioView.vue') },
      { path: 'satisfaction', name: 'satisfaction', component: () => import('@/views/SatisfactionView.vue') },
      { path: 'playbooks', name: 'playbooks', component: () => import('@/views/PlaybooksView.vue'), meta: { requiredModule: 'playbook' } },
      { path: 'kpis', name: 'kpis', component: () => import('@/views/KpisView.vue') },
      { path: 'kpis/new', name: 'kpis-builder-new', component: () => import('@/views/kpis/KpisBuilder.vue') },
      { path: 'kpis/:id', name: 'kpis-builder', component: () => import('@/views/kpis/KpisBuilder.vue'), props: true },
      { path: 'kpis/:id/preview', name: 'kpis-preview', component: () => import('@/views/kpis/KpisPreview.vue'), props: true },
      { path: 'kpis/:id/present', name: 'kpis-present', component: () => import('@/views/kpis/KpisPresent.vue'), props: true },
      { path: 'okr', name: 'okr', component: () => import('@/views/OkrView.vue') },
      { path: 'roadmap', name: 'roadmap', component: () => import('@/views/RoadmapView.vue') },
      { path: 'tasks', name: 'tasks', redirect: { name: 'tasks-stats' } },
      { path: 'tasks/stats', name: 'tasks-stats', component: () => import('@/views/tasks/StatsView.vue') },
      { path: 'tasks/planning', name: 'tasks-planning', component: () => import('@/views/tasks/PlanningView.vue') },
      { path: 'tasks/projects', name: 'tasks-projects', component: () => import('@/views/tasks/ProjectsView.vue') },
      { path: 'tasks/kanban', name: 'tasks-kanban', component: () => import('@/views/tasks/KanbanView.vue') },
      { path: 'tasks/priorities', name: 'tasks-priorities', component: () => import('@/views/tasks/PrioritiesView.vue') },
      { path: 'tasks/team', name: 'tasks-team', component: () => import('@/views/tasks/TeamView.vue') },
      { path: 'tasks/settings', name: 'tasks-settings', component: () => import('@/views/tasks/SettingsView.vue') },
      { path: 'workload', name: 'workload', component: () => import('@/views/WorkloadView.vue') },
      { path: 'wellbeing', name: 'wellbeing', component: () => import('@/views/WellbeingView.vue') },
      { path: 'coach', name: 'coach', component: () => import('@/views/CoachView.vue') },
      { path: 'email-studio', name: 'email-studio', component: () => import('@/views/EmailStudioView.vue'), meta: { requiredModule: 'email' } },
      { path: 'quotes', name: 'quotes', component: () => import('@/views/QuotesView.vue') },
      { path: 'import', name: 'import', component: () => import('@/views/ImportView.vue'), meta: { requiredModule: 'import' } },
      { path: 'integrations', name: 'integrations', component: () => import('@/views/IntegrationsView.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
        { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
      { path: 'resources', name: 'resources', redirect: { name: 'resources-library' } },
      { path: 'resources/library', name: 'resources-library', component: () => import('@/views/resources/LibraryView.vue') },
      { path: 'resources/masterclass', name: 'resources-masterclass', component: () => import('@/views/resources/MasterclassView.vue') },
      { path: 'resources/guides', name: 'resources-guides', component: () => import('@/views/resources/GuidesView.vue') },
      { path: 'resources/tools', name: 'resources-tools', component: () => import('@/views/resources/ToolsView.vue') },
      { path: 'resources/wellbeing', name: 'resources-wellbeing', component: () => import('@/views/resources/WellbeingResourcesView.vue') },
    ],
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { guest: true }
  },
  {
    path: '/reset-password-confirm',
    name: 'ResetPasswordConfirm',
    component: () => import('@/views/auth/ResetPasswordConfirmView.vue')
  },
  {
    path: '/cgu',
    name: 'CGU',
    component: () => import('@/views/legal/CguView.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/legal/PrivacyView.vue')
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/SupportView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.user && !authStore.loading) {
    await authStore.init()
  }
  // Unauthenticated → login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  // Authenticated + guest route → dashboard or paywall
  if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.needsPayment) return { name: 'paywall' }
    return { name: 'dashboard' }
  }
  // Plan gating: check module access
  if (to.meta.requiredModule && authStore.isAuthenticated) {
    const plan = authStore.currentPlan || 'starter'
    if (!isModuleAllowed(plan, to.meta.requiredModule)) {
      return { name: 'paywall' }
    }
  }

  // Authenticated + requiresAuth + trial expired → paywall (except paywall itself)
  if (to.meta.requiresAuth && authStore.isAuthenticated && authStore.needsPayment && to.name !== 'paywall') {
    return { name: 'paywall' }
  }
})

// SEO: dynamic title per route
router.afterEach((to) => {
  const titles = {
    'login': 'Connexion — Scalyo',
    'register': 'Inscription — Scalyo',
    'dashboard': 'Dashboard — Scalyo',
    'portfolio': 'Portefeuille clients — Scalyo',
    'kpis': 'KPIs COPIL — Scalyo',
    'import': 'Import intelligent — Scalyo',
    'settings': 'Paramètres — Scalyo',
    'profile': 'Mon profil — Scalyo',
    'payment-success': 'Paiement confirmé — Scalyo',
    'paywall': 'Choisissez votre forfait — Scalyo',
    'NotFound': 'Page introuvable — Scalyo',
    'ResetPassword': 'Mot de passe oublié — Scalyo',
    'ResetPasswordConfirm': 'Nouveau mot de passe — Scalyo',
    'CGU': 'Conditions d\'utilisation — Scalyo',
    'Support': 'Support — Scalyo',
    'Privacy': 'Politique de confidentialité — Scalyo',
  }
  document.title = (to.name && titles[to.name]) || to.meta?.title || 'Scalyo — Customer Success Platform'
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc) }
  metaDesc.setAttribute('content', to.meta?.description || 'Scalyo — La plateforme SaaS B2B Customer Success. Gérez vos clients, KPIs et équipes efficacement.')
})

export default router
