<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar-desktop">
      <div class="sidebar-logo">
        <div class="logo-icon">⚡</div>
        <span class="logo-text">scal<span class="logo-accent">yo</span></span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in mainNavItems"
          :key="item.key"
          :to="{ name: item.routeName }"
          class="nav-btn"
          active-class="active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
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
          <span class="nav-icon">⚙️</span>
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
          <button class="sidebar-logout-btn" :title="t('close')" @click="logout">⏻</button>
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
            <span class="pulse">🚨</span>
            {{ criticalCount }} {{ criticalLabel }}
          </router-link>
          <div class="topbar-online">
            <span class="topbar-online-dot"></span>
            <span class="topbar-online-text">{{ onlineLabel }}</span>
          </div>
        </div>
      </div>
      <main class="main-scroll" style="flex: 1; overflow-y: auto;">
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
        <span style="font-size: 20px;">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import { useNavigation } from '../composables/useNavigation'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { navItems, mobileNavItems } = useNavigation()

const company = computed(() => authStore.company)

// Filter out settings from main nav (it's in the footer)
const mainNavItems = computed(() =>
  navItems.value.filter(item => item.key !== 'settings')
)

const criticalCount = computed(() => {
  // This will be populated from the portfolio store if available
  return 0
})

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
  const role = authStore.user?.role
  if (role === 'manager') {
    return prefsStore.lang === 'kr' ? 'CS 매니저' : prefsStore.lang === 'en' ? 'Manager CS' : 'Manager CS'
  }
  return 'Customer Success Manager'
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
  fontSize: 10px;
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
