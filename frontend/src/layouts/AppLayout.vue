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
              · {{ authStore.user?.role === 'manager' ? 'Manager' : 'CSM' }}
            </div>
          </div>
          <button class="sidebar-logout-btn" :title="t('close')" @click="logout"><ScalyoIcon name="power" :size="16" /></button>
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
          <span>Veuillez vérifier votre adresse email. Consultez votre boîte de réception.</span>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button @click="checkVerified" style="background: #92400E; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
              {{ checkMsg || "C'est fait" }}
            </button>
            <button @click="resendVerification" style="background: #F59E0B; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
              {{ resendMsg || 'Renvoyer' }}
            </button>
          </div>
        </div>
        <div class="view-pad">
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
    resendMsg.value = 'Envoyé !'
    setTimeout(() => { resendMsg.value = '' }, 5000)
  } catch {
    resendMsg.value = 'Erreur'
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
      checkMsg.value = 'Pas encore'
      setTimeout(() => { checkMsg.value = '' }, 3000)
    }
  } catch {
    checkMsg.value = 'Erreur'
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

const roleLabel = computed(() => {
  if (authStore.user?.role === 'manager') return t('csManager')
  return 'CSM'
})

const criticalLabel = computed(() => {
  const count = criticalCount.value
  if (prefsStore.lang === 'kr') return '위험'
  if (prefsStore.lang === 'en') return count > 1 ? 'criticals' : 'critical'
  return count > 1 ? 'critiques' : 'critique'
})

const onlineLabel = computed(() => {
  if (prefsStore.lang === 'en') return 'Online'
  if (prefsStore.lang === 'kr') return '온라인'
  return 'En ligne'
})

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
</style>
