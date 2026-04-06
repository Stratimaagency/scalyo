<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar-desktop" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-logo">
        <ScalyoLogo v-if="!sidebarCollapsed" :markSize="38" :fontSize="20" :gap="10" :showSub="isSmartMatrice" />
        <ScalyoLogo v-else :markSize="28" :fontSize="0" :gap="0" />
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '»' : '«' }}
        </button>
      </div>
      <nav class="sidebar-nav">
        <!-- Global nav with SM sub-nav inline -->
        <template v-for="(group, gi) in navGroups" :key="gi">
          <div class="nav-group-label">{{ group.label }}</div>
          <template v-for="item in group.items" :key="item.key">
            <router-link
              :to="{ name: item.routeName }"
              class="nav-btn"
              active-class="active"
            >
              <span class="nav-emoji">{{ item.emoji }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="item.locked" class="nav-lock">🔒</span>
              <span v-if="item.key === 'portfolio' && criticalCount > 0" class="nav-badge-critical">{{ criticalCount }}</span>
            </router-link>
            <!-- SM sub-nav: appears right under Smart Matrice when on that page -->
            <template v-if="item.key === 'tasks' && isSmartMatrice">
              <button
                v-for="sm in smNavItems"
                :key="'sm-' + sm.key"
                class="nav-btn nav-btn--sub"
                :class="{ active: smCurrentView === sm.key }"
                @click="setSmView(sm.key)"
              >
                <span class="nav-emoji">{{ sm.emoji }}</span>
                <span class="nav-label">{{ sm.label }}</span>
                <span v-if="sm.key === 'tasks' && smTaskCount > 0" class="nav-badge-count">{{ smTaskCount }}</span>
                <span v-if="sm.key === 'projects' && smProjectCount > 0" class="nav-badge-count">{{ smProjectCount }}</span>
              </button>
            </template>
          </template>
        </template>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <!-- Settings link -->
        <router-link :to="{ name: 'settings' }" class="nav-btn" active-class="active">
          <span class="nav-emoji">⚙️</span>
          <span class="nav-label">{{ t('settings') }}</span>
        </router-link>

        <!-- User info -->
        <div class="sidebar-user">
          <div class="sidebar-user-avatar" :style="{ background: 'var(--sm-grad)' }">
            {{ userInitial }}
          </div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ company?.name || t('myCompany') }}</div>
            <div class="sidebar-user-meta">
              <span :style="{ color: planColor }">{{ company?.plan || 'Starter' }}</span>
              · {{ roleLabel }}
            </div>
          </div>
          <button class="sidebar-logout-btn" :title="t('logout')" @click="logout">🚪</button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-wrapper">
      <!-- Top bar with notifications -->
      <div class="topbar">
        <div></div>
        <NotificationCenter />
      </div>
      <main class="main-scroll">
        <!-- Banners -->
        <div v-if="showVerifyBanner" class="banner banner--warn">
          <span>{{ t('verifyEmailBanner') }}</span>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button class="banner-btn" @click="checkVerified">{{ checkMsg || t('verifyDone') }}</button>
            <button class="banner-btn banner-btn--alt" @click="resendVerification">{{ resendMsg || t('verifyResend') }}</button>
          </div>
        </div>
        <div v-if="trialExpired" class="trial-expired-overlay">
          <div class="trial-expired-card">
            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
            <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">{{ t('trialExpiredTitle') }}</h2>
            <p style="color: var(--muted); font-size: 14px; margin-bottom: 24px;">{{ t('trialExpiredDesc') }}</p>
            <router-link :to="{ name: 'settings' }" class="btn btn-primary" style="padding: 12px 32px;">{{ t('trialExpiredBtn') }}</router-link>
          </div>
        </div>
        <div v-else class="view-pad">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="bottom-nav">
      <router-link v-for="item in mobileNavItems" :key="item.key"
        :to="{ name: item.routeName }" class="bottom-nav-item" active-class="active">
        <span style="font-size: 20px;">{{ item.emoji }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Test Panel removed -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { usePortfolioStore } from '../stores/portfolio'
import { useSmartMatriceStore } from '../stores/smartMatrice'
import { useManagerStore } from '../stores/manager'
import { authApi } from '../api'
import { useI18n } from '../i18n'
import { useNavigation } from '../composables/useNavigation'
import ScalyoLogo from '../components/ScalyoLogo.vue'
import NotificationCenter from '../components/NotificationCenter.vue'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const portfolioStore = usePortfolioStore()
const smStore = useSmartMatriceStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { navItems, mobileNavItems } = useNavigation()

const sidebarCollapsed = ref(false)
const company = computed(() => authStore.company)
const showVerifyBanner = ref(authStore.user && !authStore.user.email_verified)
const resendMsg = ref('')
const checkMsg = ref('')

// Smart Matrice detection
const isSmartMatrice = computed(() => route.name === 'tasks')

// SM nav — read from store (shared state)
const smCurrentView = computed({
  get: () => smStore.currentView,
  set: (v) => { smStore.currentView = v }
})
const smNavItems = computed(() => [
  { key: 'stats', emoji: '📊', label: t('smNavStats') },
  { key: 'planning', emoji: '📅', label: t('smNavPlanning') },
  { key: 'projects', emoji: '📁', label: t('smNavProjects') },
  { key: 'kanban', emoji: '🔥', label: t('smNavKanban') },
  { key: 'eisenhower', emoji: '🎯', label: t('smNavPriorities') },
  { key: 'team', emoji: '👥', label: t('smNavTeam') },
  { key: 'config', emoji: '⚙️', label: t('smNavSettings') },
])

// smNavGroups removed — sub-nav is flat list now

function setSmView(key) {
  smCurrentView.value = key
}

const smProfile = computed(() => smStore.profile)
const smUserName = computed(() => smStore.userName || authStore.user?.display_name || '')
function setSmProfile(p) { smStore.setProfile(p) }

const smTaskCount = computed(() => {
  const all = []
  for (const pid in smStore.tasks) all.push(...smStore.tasks[pid])
  return all.length
})
const smProjectCount = computed(() => smStore.projects.length)

// Global nav groups
const mainNavItems = computed(() => navItems.value.filter(item => item.key !== 'settings'))

const navGroups = computed(() => {
  const items = mainNavItems.value
  const groups = [
    { label: 'TABLEAU DE BORD', keys: ['dashboard', 'manager-dashboard'] },
    { label: 'CLIENTS', keys: ['portfolio', 'health-tracker', 'playbook-runner'] },
    { label: 'PERFORMANCE', keys: ['kpis', 'okr-tracker', 'roadmap'] },
    { label: 'PROJETS', keys: ['tasks'] },
    { label: 'ÉQUIPE', keys: ['workload', 'wellbeing', 'coach'] },
    { label: 'OUTILS', keys: ['email-studio', 'quotes', 'smart-import', 'integrations'] },
  ]
  return groups
    .map(g => ({ label: g.label, items: g.keys.map(k => items.find(i => i.key === k)).filter(Boolean) }))
    .filter(g => g.items.length > 0)
})

const criticalCount = computed(() => portfolioStore.accounts.filter(a => a.risk === 'critical').length)
const userInitial = computed(() => (authStore.user?.email || 'U').charAt(0).toUpperCase())
const planColor = computed(() => {
  const plan = company.value?.plan || 'Starter'
  if (plan === 'Growth') return '#f43f5e'
  if (plan === 'Elite') return '#3b82f6'
  return 'rgba(255,255,255,.4)'
})

const trialDaysLeft = computed(() => {
  const c = company.value
  if (!c || c.subscription_status === 'active' || c.subscription_status === 'paid') return null
  return c.trial_days_left ?? null
})
const trialExpired = computed(() => {
  const c = company.value
  if (!c || c.subscription_status === 'active' || c.subscription_status === 'paid') return false
  return c.trial_expired === true
})

const ROLE_KEYS = { manager: 'roleManager', csm: 'roleCSM', commercial: 'roleCommercial', kam: 'roleKAM' }
const roleLabel = computed(() => t(ROLE_KEYS[authStore.user?.role] || 'roleCSM'))
const criticalLabel = computed(() => t('critical'))
const onlineLabel = computed(() => t('online'))

function langLabel(l) { return l === 'fr' ? '🇫🇷 FR' : l === 'kr' ? '🇰🇷 KR' : '🇬🇧 EN' }

async function resendVerification() {
  try { resendMsg.value = '...'; await authApi.resendVerification(); resendMsg.value = t('verifySent'); setTimeout(() => { resendMsg.value = '' }, 5000) }
  catch { resendMsg.value = t('verifyError'); setTimeout(() => { resendMsg.value = '' }, 3000) }
}
async function checkVerified() {
  checkMsg.value = '...'
  try { const { data } = await authApi.getProfile(); if (data.email_verified) { authStore.user = data; showVerifyBanner.value = false } else { checkMsg.value = t('verifyNotYet'); setTimeout(() => { checkMsg.value = '' }, 3000) } }
  catch { checkMsg.value = t('verifyError'); setTimeout(() => { checkMsg.value = '' }, 3000) }
}

function logout() { authStore.logout(); router.push({ name: 'login' }) }

const managerStore = useManagerStore()

onMounted(async () => {
  if (!portfolioStore.accounts.length) portfolioStore.fetchAccounts()
  // Load module stores (clients, csm, tasks, okrs, playbooks)
  await managerStore.fetchAll()
})
</script>

<style scoped>
/* Nav groups */
.nav-group-label {
  font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  color: #64748b; padding: 14px 10px 4px; font-family: 'DM Sans', sans-serif;
}
.nav-group-label:first-child { padding-top: 0; }
.nav-emoji { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; line-height: 1; }
.nav-lock { font-size: 11px; opacity: 0.5; margin-left: auto; }
.nav-badge-critical {
  background: #dc2626; color: #fff; font-weight: 800; min-width: 18px; height: 18px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 10px; margin-left: auto;
}
.nav-badge-count {
  background: linear-gradient(135deg, rgba(244,63,94,.1), rgba(139,92,246,.1)); color: #f43f5e; font-weight: 700;
  min-width: 20px; height: 18px; border-radius: 9px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; font-size: 10px; margin-left: auto; padding: 0 5px;
}

/* Profile switcher */
.sm-profile-switcher { padding: 0 10px 8px; }
.sm-profile-pills { display: flex; gap: 4px; }
.sm-pill {
  flex: 1; padding: 6px 0; border-radius: 20px; border: none;
  font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;
  font-family: 'DM Sans', sans-serif; transition: all .2s;
  background: rgba(255,255,255,.5); color: #475569;
}
.sm-pill:hover { background: rgba(255,255,255,.8); color: #0f172a; }
.sm-pill.active { background: var(--sm-grad); color: white; box-shadow: 0 3px 10px rgba(244,63,94,.25); }

/* Banners */
.banner { padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; }
.banner--warn { background: #FEF3C7; border-bottom: 1px solid #F59E0B; color: #92400E; }
.banner-btn { background: #92400E; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
.banner-btn--alt { background: #F59E0B; }

.sidebar-trial-badge { font-size: 10px; color: #F59E0B; font-weight: 700; margin-top: 2px; }
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
@media (max-width: 768px) { .topbar { padding: 6px 12px; } }
.main-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.trial-expired-overlay { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px; background: var(--bg); }
.trial-expired-card { text-align: center; max-width: 480px; padding: 48px 32px; background: white; border: 1px solid var(--border); border-radius: 16px; }

.sidebar-toggle {
  background: none; border: none; cursor: pointer; font-size: 14px;
  color: var(--muted); padding: 4px 6px; border-radius: 6px;
  transition: all .2s; margin-left: auto;
}
.sidebar-toggle:hover { background: rgba(0,0,0,.06); color: var(--text); }

.sidebar-collapsed { width: 60px !important; padding: 16px 6px; }
.sidebar-collapsed .nav-label,
.sidebar-collapsed .nav-group-label,
.sidebar-collapsed .nav-lock,
.sidebar-collapsed .nav-badge-count,
.sidebar-collapsed .sidebar-user-info,
.sidebar-collapsed .lang-switcher { display: none; }
.sidebar-collapsed .nav-btn { justify-content: center; padding: 9px 6px; }
.sidebar-collapsed .nav-btn--sub { padding-left: 6px; }
.sidebar-collapsed .nav-emoji { width: auto; }
.sidebar-collapsed .sidebar-logo { justify-content: center; margin-bottom: 16px; }
</style>
