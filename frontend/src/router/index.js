import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../views/LandingPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  // Authenticated routes — lazy loaded
  {
    path: '/app',
    component: () => import('../layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'portfolio', name: 'portfolio', component: () => import('../views/PortfolioView.vue') },
      { path: 'kpis', name: 'kpis', component: () => import('../views/KPIView.vue') },
      { path: 'tasks', name: 'tasks', component: () => import('../views/TaskBoardView.vue') },
      { path: 'planning', name: 'planning', component: () => import('../views/PlanningView.vue') },
      { path: 'wellbeing', name: 'wellbeing', component: () => import('../views/WellbeingView.vue') },
      { path: 'coach', name: 'coach', component: () => import('../views/CoachView.vue') },
      { path: 'resources', name: 'resources', component: () => import('../views/ResourcesView.vue') },
      { path: 'email-studio', name: 'email-studio', component: () => import('../views/EmailStudioView.vue') },
      { path: 'settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
      { path: 'tips', name: 'tips', component: () => import('../views/TipsView.vue') },
      { path: 'roadmap', name: 'roadmap', component: () => import('../views/RoadmapView.vue') },
      { path: 'feedback', name: 'feedback', component: () => import('../views/FeedbackView.vue') },
      { path: 'integrations', name: 'integrations', component: () => import('../views/IntegrationsView.vue') },
      { path: 'quotes', name: 'quotes', component: () => import('../views/QuotesView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const tokens = localStorage.getItem('scalyo_tokens')
  const isAuthenticated = !!tokens

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }
  if (to.meta.guest && isAuthenticated && to.name !== 'landing') {
    return next({ name: 'dashboard' })
  }

  // Force password change: redirect to settings if must_change_password
  if (to.meta.requiresAuth && isAuthenticated && to.name !== 'settings') {
    try {
      const authStore = useAuthStore()
      if (authStore.user?.must_change_password) {
        return next({ name: 'settings' })
      }
    } catch (e) {
      console.error('Failed to check password change requirement:', e)
    }
  }

  next()
})

export default router
