<template>
  <div :data-theme="authStore.theme" class="app-root">
    <template v-if="authStore.loading">
      <AppLoader :text="t('initializingApp')" />
    </template>
    <template v-else-if="!authStore.isAuthenticated">
      <router-view />
    </template>
    <template v-else>
      <div class="app-shell">
        <!-- Desktop sidebar -->
        <aside class="sidebar-desktop">
          <div class="sidebar-logo">
            <div class="logo-icon">⚡</div>
            <span class="logo-text">Scalyo</span>
          </div>
          <nav class="sidebar-nav">
            <button
              v-for="item in navItems"
              :key="item.key"
              class="nav-btn"
              :class="{ active: currentScreen === item.key }"
              @click="currentScreen = item.key"
            >
              <span class="nav-icon" v-html="item.icon"></span>
              <span class="nav-label">{{ item.label }}</span>
            </button>
          </nav>
          <div class="sidebar-footer">
            <button class="nav-btn" @click="currentScreen = 'feedback'">
              <span class="nav-icon">💬</span>
              <span class="nav-label">Feedback</span>
            </button>
            <button class="nav-btn logout-btn" @click="authStore.logout()">
              <span class="nav-icon">🚪</span>
              <span class="nav-label">{{ t('close') }}</span>
            </button>
          </div>
        </aside>
        <!-- Main content -->
        <main class="main-scroll">
          <div class="topbar-area">
            <div class="topbar-left">
              <h2 class="topbar-title">{{ currentNavItem?.label || t('dashboard') }}</h2>
            </div>
            <div class="topbar-right">
              <span class="topbar-user">{{ authStore.user?.display_name || authStore.user?.email }}</span>
            </div>
          </div>
          <div class="view-pad">
            <component :is="currentView" />
          </div>
        </main>
        <!-- Mobile bottom nav -->
        <nav class="bottom-nav">
          <button
            v-for="item in mobileNavItems"
            :key="item.key"
            class="bottom-nav-item"
            :class="{ active: currentScreen === item.key }"
            @click="currentScreen = item.key"
          >
            <span v-html="item.icon"></span>
            <span>{{ item.shortLabel || item.label }}</span>
          </button>
        </nav>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useI18n } from './i18n'
import AppLoader from './components/AppLoader.vue'
import DashboardView from './views/DashboardView.vue'
import PortfolioView from './views/PortfolioView.vue'
import KPIView from './views/KPIView.vue'
import PlanningView from './views/PlanningView.vue'
import TaskBoardView from './views/TaskBoardView.vue'
import WellbeingView from './views/WellbeingView.vue'
import CoachView from './views/CoachView.vue'
import ResourcesView from './views/ResourcesView.vue'
import EmailStudioView from './views/EmailStudioView.vue'
import SettingsView from './views/SettingsView.vue'
import TipsView from './views/TipsView.vue'
import FeedbackView from './views/FeedbackView.vue'
import RoadmapView from './views/RoadmapView.vue'

const authStore = useAuthStore()
const { t } = useI18n()

const currentScreen = ref('dashboard')

onMounted(() => {
  authStore.init()
})

const navManagerItems = computed(() => [
  { key: 'dashboard', icon: '📊', label: t('dashboard') },
  { key: 'portfolio', icon: '💼', label: t('portfolio'), shortLabel: 'Portfolio' },
  { key: 'kpi', icon: '📈', label: t('kpi'), shortLabel: 'KPIs' },
  { key: 'planning', icon: '📅', label: t('planning') },
  { key: 'tasks', icon: '✅', label: t('tasks'), shortLabel: 'Tasks' },
  { key: 'wellbeing', icon: '💚', label: t('wellbeing') },
  { key: 'coach', icon: '🤖', label: t('coach'), shortLabel: 'Coach' },
  { key: 'resources', icon: '📚', label: t('resources') },
  { key: 'email', icon: '✉️', label: t('email'), shortLabel: 'Email' },
  { key: 'roadmap', icon: '🗺️', label: t('roadmap') },
  { key: 'tips', icon: '💡', label: t('tips'), shortLabel: 'Tips' },
  { key: 'settings', icon: '⚙️', label: t('settings') },
])

const navCsmItems = computed(() => [
  { key: 'dashboard', icon: '📊', label: t('dashboard') },
  { key: 'portfolio', icon: '💼', label: t('portfolio'), shortLabel: 'Portfolio' },
  { key: 'kpi', icon: '📈', label: t('kpi'), shortLabel: 'KPIs' },
  { key: 'planning', icon: '📅', label: t('planning') },
  { key: 'tasks', icon: '✅', label: t('tasks'), shortLabel: 'Tasks' },
  { key: 'wellbeing', icon: '💚', label: t('wellbeing') },
  { key: 'coach', icon: '🤖', label: t('coach'), shortLabel: 'Coach' },
  { key: 'email', icon: '✉️', label: t('email'), shortLabel: 'Email' },
  { key: 'tips', icon: '💡', label: t('tips'), shortLabel: 'Tips' },
  { key: 'settings', icon: '⚙️', label: t('settings') },
])

const navItems = computed(() =>
  authStore.user?.role === 'manager' ? navManagerItems.value : navCsmItems.value
)

const mobileNavItems = computed(() => navItems.value.slice(0, 5))

const currentNavItem = computed(() =>
  navItems.value.find(i => i.key === currentScreen.value)
)

const viewMap = {
  dashboard: DashboardView,
  portfolio: PortfolioView,
  kpi: KPIView,
  planning: PlanningView,
  tasks: TaskBoardView,
  wellbeing: WellbeingView,
  coach: CoachView,
  resources: ResourcesView,
  email: EmailStudioView,
  roadmap: RoadmapView,
  tips: TipsView,
  settings: SettingsView,
  feedback: FeedbackView,
}

const currentView = computed(() => viewMap[currentScreen.value] || DashboardView)
</script>
