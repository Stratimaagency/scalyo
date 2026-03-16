<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar-desktop">
      <div class="sidebar-logo">
        <div class="logo-icon">⚡</div>
        <span class="logo-text">Scalyo</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="{ name: item.routeName }"
          class="nav-btn"
          active-class="active"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link :to="{ name: 'feedback' }" class="nav-btn" active-class="active">
          <span class="nav-icon">💬</span>
          <span class="nav-label">Feedback</span>
        </router-link>
        <button class="nav-btn logout-btn" @click="logout">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">{{ t('close') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-scroll">
      <div class="topbar-area">
        <div class="topbar-left">
          <h2 class="topbar-title">{{ pageTitle }}</h2>
        </div>
        <div class="topbar-right">
          <span class="topbar-user">{{ displayName }}</span>
        </div>
      </div>
      <div class="view-pad">
        <router-view />
      </div>
    </main>

    <!-- Mobile bottom nav -->
    <nav class="bottom-nav">
      <router-link
        v-for="item in mobileNavItems"
        :key="item.key"
        :to="{ name: item.routeName }"
        class="bottom-nav-item"
        active-class="active"
      >
        <span v-html="item.icon"></span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'
import { useNavigation } from '../composables/useNavigation'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { navItems, mobileNavItems } = useNavigation()

const pageTitle = computed(() => {
  const item = navItems.value.find(i => i.routeName === route.name)
  return item?.label || 'Dashboard'
})

const displayName = computed(() =>
  authStore.user?.display_name || authStore.user?.email || ''
)

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
