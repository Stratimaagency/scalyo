<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar-desktop">
      <div class="sidebar-logo">
        <ScalyoLogo :markSize="38" :fontSize="20" :gap="10" :showSub="isSmartMatrice" />
      </div>
      <nav class="sidebar-nav">
        <!-- Smart Matrice sub-nav -->
        <template v-if="isSmartMatrice && smNavItems.length">
          <template v-for="(group, gi) in smNavGroups" :key="'sm-'+gi">
            <div class="nav-group-label">{{ group.label }}</div>
            <button
              v-for="item in group.items"
              :key="item.key"
              class="nav-btn"
              :class="{ active: smCurrentView === item.key }"
              @click="setSmView(item.key)"
            >
              <span class="nav-emoji">{{ item.emoji }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="item.key === 'tasks' && smTaskCount > 0" class="nav-badge-count">{{ smTaskCount }}</span>
              <span v-if="item.key === 'projects' && smProjectCount > 0" class="nav-badge-count">{{ smProjectCount }}</span>
            </button>
          </template>
        </template>

        <!-- Global nav -->
        <template v-else>
          <template v-for="(group, gi) in navGroups" :key="gi">
            <div class="nav-group-label">{{ group.label }}</div>
            <router-link
              v-for="item in group.items"
              :key="item.key"
              :to="{ name: item.routeName }"
              class="nav-btn"
              active-class="active"
            >
              <span class="nav-emoji">{{ item.emoji }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="item.locked" class="nav-lock">🔒</span>
              <span v-if="item.key === 'portfolio' && criticalCount > 0" class="nav-badge-critical">{{ criticalCount }}</span>
            </router-link>
          </template>
        </template>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <!-- Profile switcher (Smart Matrice) -->
        <div v-if="isSmartMatrice" class="sm-profile-switcher">
          <div class="nav-group-label" style="padding-top: 0;">VUE ACTIVE</div>
          <div class="sm-profile-pills">
            <button class="sm-pill" :class="{ active: smProfile === 'moi' }" @click="setSmProfile('moi')">
              {{ smUserName || 'Moi' }}
            </button>
            <button class="sm-pill" :class="{ active: smProfile === 'manager' }" @click="setSmProfile('manager')">Manager</button>
            <button class="sm-pill" :class="{ active: smProfile === 'direction' }" @click="setSmProfile('direction')">Direction</button>
          </div>
        </div>

        <!-- Settings link -->
        <router-link :to="{ name: 'settings' }" class="nav-btn" active-class="active">
          <span class="nav-emoji">⚙️</span>
          <span class="nav-label">{{ t('settings') }}</span>
        </router-link>

        <!-- Language switcher -->
        <div class="lang-switcher">
          <button v-for="l in ['fr', 'en', 'kr']" :key="l" class="lang-btn"
            :class="{ active: prefsStore.lang === l }" @click="prefsStore.setLang(l)">{{ langLabel(l) }}</button>
        </div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { usePortfolioStore } from '../stores/portfolio'
import { useSmartMatriceStore } from '../stores/smartMatrice'
import { authApi } from '../api'
import { useI18n } from '../i18n'
import { useNavigation } from '../composables/useNavigation'
import ScalyoLogo from '../components/ScalyoLogo.vue'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const portfolioStore = usePortfolioStore()
const smStore = useSmartMatriceStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { navItems, mobileNavItems } = useNavigation()

const company = computed(() => authStore.company)
const showVerifyBanner = ref(authStore.user && !authStore.user.email_verified)
const resendMsg = ref('')
const checkMsg = ref('')

// Smart Matrice detection
const isSmartMatrice = computed(() => route.name === 'tasks')

// Inject SM nav from SmartMatrice.vue
const smCurrentView = inject('sm-current-view', ref('projects'))
const smNavItems = inject('sm-nav-items', [])

const smNavGroups = computed(() => {
  if (!smNavItems.length) return []
  const groups = {}
  for (const item of smNavItems) {
    const g = item.group || 'AUTRE'
    if (!groups[g]) groups[g] = { label: g, items: [] }
    groups[g].items.push(item)
  }
  return Object.values(groups)
})

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
    { label: 'VUE D\'ENSEMBLE', keys: ['dashboard', 'portfolio', 'kpis'] },
    { label: 'GESTION', keys: ['tasks', 'planning'] },
    { label: 'VUES', keys: ['wellbeing', 'coach', 'roadmap'] },
    { label: 'OUTILS', keys: ['email-studio', 'quotes', 'integrations', 'resources', 'tips'] },
    { label: 'IMPORT', keys: ['smart-import', 'feedback'] },
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

onMounted(() => { if (!portfolioStore.accounts.length) portfolioStore.fetchAccounts() })
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
.main-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.trial-expired-overlay { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px; background: var(--bg); }
.trial-expired-card { text-align: center; max-width: 480px; padding: 48px 32px; background: white; border: 1px solid var(--border); border-radius: 16px; }
</style>
