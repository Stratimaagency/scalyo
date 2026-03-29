<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar-desktop">
      <div class="sidebar-logo">
        <ScalyoLogo :markSize="34" :fontSize="22" :gap="9" />
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in mainNavItems"
          :key="item.key"
          :to="{ name: item.routeName }"
          class="nav-btn"
          active-class="active"
        >
          <span class="nav-icon"><ScalyoIcon :name="item.icon" :size="18" /></span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.locked" style="font-size: 11px; opacity: 0.5; margin-left: auto;">&#x1F512;</span>
          <span
            v-if="item.key === 'portfolio' && criticalCount > 0"
            class="nav-badge-critical"
          >{{ criticalCount }}</span>
          <span v-if="$route.name === item.routeName" class="nav-active-bar"></span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <!-- Language switcher -->
        <div class="lang-switcher">
          <button
            v-for="l in ['fr', 'en', 'kr']"
            :key="l"
            class="lang-btn"
            :class="{ active: prefsStore.lang === l }"
            @click="prefsStore.setLang(l)"
          >{{ langLabel(l) }}</button>
        </div>
        <!-- Settings -->
        <router-link :to="{ name: 'settings' }" class="nav-btn" active-class="active">
          <span class="nav-icon"><ScalyoIcon name="gear" :size="18" /></span>
          <span class="nav-label">{{ t('settings') }}</span>
          <span v-if="$route.name === 'settings'" class="nav-active-bar"></span>
        </router-link>
        <!-- User info -->
        <div class="sidebar-user">
          <div class="sidebar-user-avatar" :style="{ background: company?.color || 'var(--teal)' }">
            {{ userInitial }}
          </div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ company?.name || t('myCompany') }}</div>
            <div class="sidebar-user-meta">
              <span :style="{ color: planColor }">{{ company?.plan || 'Starter' }}</span>
              · {{ roleLabel }}
            </div>
            <div v-if="trialDaysLeft !== null && !trialExpired" class="sidebar-trial-badge">
              {{ t('trialDaysLeft').replace('{days}', trialDaysLeft) }}
            </div>
          </div>
          <button class="sidebar-logout-btn" :title="t('logout')" @click="logout"><ScalyoIcon name="power" :size="16" /></button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
      <div class="topbar-area">
        <div class="topbar-left">
          <div class="topbar-dot" :style="{ background: company?.color || 'var(--teal)' }"></div>
          <span class="topbar-title">{{ company?.name || t('myCompany') }}</span>
          <span class="topbar-role">· {{ roleLabel }}</span>
        </div>
        <div class="topbar-right">
          <router-link
            v-if="criticalCount > 0"
            :to="{ name: 'portfolio' }"
            class="topbar-critical-badge"
          >
            <span class="pulse"><ScalyoIcon name="siren" :size="16" /></span>
            {{ criticalCount }} {{ criticalLabel }}
          </router-link>
          <div class="topbar-online">
            <span class="topbar-online-dot"></span>
            <span class="topbar-online-text">{{ onlineLabel }}</span>
          </div>
        </div>
      </div>
      <main class="main-scroll" style="flex: 1; overflow-y: auto;">
        <!-- Email verification banner -->
        <div v-if="showVerifyBanner"
          style="background: #FEF3C7; border-bottom: 1px solid #F59E0B; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; color: #92400E;">
          <span>{{ t('verifyEmailBanner') }}</span>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button @click="checkVerified" style="background: #92400E; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
              {{ checkMsg || t('verifyDone') }}
            </button>
            <button @click="resendVerification" style="background: #F59E0B; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
              {{ resendMsg || t('verifyResend') }}
            </button>
          </div>
        </div>
        <!-- Trial expiry warning banner -->
        <div v-if="trialDaysLeft !== null && trialDaysLeft <= 3 && trialDaysLeft > 0 && !trialExpired"
          style="background: #FEF3C7; border-bottom: 1px solid #F59E0B; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; color: #92400E;">
          <span>{{ t('trialBanner').replace('{days}', trialDaysLeft) }}</span>
          <router-link :to="{ name: 'settings' }" style="background: #92400E; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none;">
            {{ t('trialSubscribe') }}
          </router-link>
        </div>
        <!-- Trial expired overlay -->
        <div v-if="trialExpired" class="trial-expired-overlay">
          <div class="trial-expired-card">
            <div style="font-size: 48px; margin-bottom: 16px;">&#x23F0;</div>
            <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">{{ t('trialExpiredTitle') }}</h2>
            <p style="color: var(--muted); font-size: 14px; margin-bottom: 24px; max-width: 400px;">
              {{ t('trialExpiredDesc') }}
            </p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
              <router-link :to="{ name: 'settings' }" class="btn btn-primary" style="padding: 12px 32px; font-size: 15px;">
                {{ t('trialExpiredBtn') }}
              </router-link>
            </div>
            <p style="color: var(--muted); font-size: 12px; margin-top: 16px;">
              {{ t('trialExpiredHelp') }} <a href="mailto:support@scalyo.app" style="color: var(--teal);">support@scalyo.app</a>
            </p>
          </div>
        </div>
        <div v-else class="view-pad">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="bottom-nav">
      <router-link
        v-for="item in mobileNavItems"
        :key="item.key"
        :to="{ name: item.routeName }"
        class="bottom-nav-item"
        active-class="active"
      >
        <span style="font-size: 20px;"><ScalyoIcon :name="item.icon" :size="20" /></span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { usePortfolioStore } from '../stores/portfolio'
import { authApi } from '../api'
import { useI18n } from '../i18n'
import { useNavigation } from '../composables/useNavigation'
import ScalyoIcon from '../components/ScalyoIcon.vue'
import ScalyoLogo from '../components/ScalyoLogo.vue'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const portfolioStore = usePortfolioStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { navItems, mobileNavItems } = useNavigation()

const company = computed(() => authStore.company)
const showVerifyBanner = ref(authStore.user && !authStore.user.email_verified)
const resendMsg = ref('')
const checkMsg = ref('')

async function resendVerification() {
  try {
    resendMsg.value = '...'
    await authApi.resendVerification()
    resendMsg.value = t('verifySent')
    setTimeout(() => { resendMsg.value = '' }, 5000)
  } catch {
    resendMsg.value = t('verifyError')
    setTimeout(() => { resendMsg.value = '' }, 3000)
  }
}

async function checkVerified() {
  checkMsg.value = '...'
  try {
    const { data } = await authApi.getProfile()
    if (data.email_verified) {
      authStore.user = data
      showVerifyBanner.value = false
    } else {
      checkMsg.value = t('verifyNotYet')
      setTimeout(() => { checkMsg.value = '' }, 3000)
    }
  } catch {
    checkMsg.value = t('verifyError')
    setTimeout(() => { checkMsg.value = '' }, 3000)
  }
}

onMounted(() => {
  if (!portfolioStore.accounts.length) {
    portfolioStore.fetchAccounts()
  }
})

// Filter out settings from main nav (it's in the footer)
const mainNavItems = computed(() =>
  navItems.value.filter(item => item.key !== 'settings')
)

const criticalCount = computed(() =>
  portfolioStore.accounts.filter(a => a.risk === 'critical').length
)

const userInitial = computed(() => {
  const email = authStore.user?.email || 'U'
  return email.charAt(0).toUpperCase()
})

const planColor = computed(() => {
  const plan = company.value?.plan || 'Starter'
  if (plan === 'Growth') return 'var(--teal)'
  if (plan === 'Elite') return 'var(--purple)'
  return 'var(--muted)'
})

const trialDaysLeft = computed(() => {
  const c = company.value
  if (!c) return null
  if (c.subscription_status === 'active' || c.subscription_status === 'paid') return null
  if (c.trial_days_left !== undefined) return c.trial_days_left
  return null
})

const trialExpired = computed(() => {
  const c = company.value
  if (!c) return false
  if (c.subscription_status === 'active' || c.subscription_status === 'paid') return false
  return c.trial_expired === true
})

const ROLE_KEYS = { manager: 'roleManager', csm: 'roleCSM', commercial: 'roleCommercial', kam: 'roleKAM' }
const roleLabel = computed(() => {
  const role = authStore.user?.role || 'csm'
  return t(ROLE_KEYS[role] || 'roleCSM')
})

const criticalLabel = computed(() => t('critical'))

const onlineLabel = computed(() => t('online'))

function langLabel(l) {
  if (l === 'fr') return '🇫🇷 FR'
  if (l === 'kr') return '🇰🇷 KR'
  return '🇬🇧 EN'
}

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.nav-badge-critical {
  background: var(--red);
  color: #fff;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
}
.sidebar-trial-badge {
  font-size: 10px;
  color: #F59E0B;
  font-weight: 700;
  margin-top: 2px;
}
.trial-expired-overlay {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: var(--bg);
}
.trial-expired-card {
  text-align: center;
  max-width: 480px;
  padding: 48px 32px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
}
</style>
