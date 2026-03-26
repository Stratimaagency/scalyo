<template>
  <div :data-theme="authStore.theme" class="app-root">
    <AppLoader v-if="authStore.loading" :text="t('initializingApp')" />
    <router-view v-else />
    <AppToast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useI18n } from './i18n'
import AppLoader from './components/AppLoader.vue'
import AppToast from './components/AppToast.vue'

const authStore = useAuthStore()
const { t } = useI18n()

onMounted(() => {
  authStore.init()
})
</script>
