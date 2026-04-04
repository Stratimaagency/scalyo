<template>
  <div :data-theme="authStore.theme" class="app-root">
    <AppLoader v-if="authStore.loading" :text="t('initializingApp')" />
    <router-view v-else />
    <AppToast />
    <ApiStatusBanner />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { usePreferencesStore } from './stores/preferences'
import { useI18n } from './i18n'
import AppLoader from './components/AppLoader.vue'
import AppToast from './components/AppToast.vue'
import ApiStatusBanner from './components/ApiStatusBanner.vue'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const { t } = useI18n()

onMounted(() => {
  // Ensure light theme is applied on document
  document.documentElement.setAttribute('data-theme', prefsStore.theme)
  authStore.init()
})
</script>
