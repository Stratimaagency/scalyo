<template>
  <div v-if="showBanner" class="api-banner">
    <span class="api-banner-icon">⚠</span>
    <span>{{ message }}</span>
    <button class="api-banner-retry" @click="retry">Réessayer</button>
    <button class="api-banner-close" @click="dismiss">&times;</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'

const showBanner = ref(false)
const message = ref('')

async function checkApi() {
  try {
    await api.get('/auth/profile/')
    showBanner.value = false
  } catch (e) {
    if (!e.response) {
      message.value = 'Impossible de contacter le serveur. Les données affichées peuvent être obsolètes.'
      showBanner.value = true
    } else if (e.response.status === 401) {
      // Not logged in — expected, don't show banner
      showBanner.value = false
    } else if (e.response.status >= 500) {
      message.value = 'Le serveur rencontre des erreurs. Certaines fonctionnalités peuvent ne pas fonctionner.'
      showBanner.value = true
    }
  }
}

function retry() {
  showBanner.value = false
  checkApi()
}

function dismiss() {
  showBanner.value = false
}

onMounted(() => {
  // Only check if user has tokens (is supposed to be logged in)
  const tokens = localStorage.getItem('scalyo_tokens')
  if (tokens) {
    checkApi()
  }
})
</script>

<style scoped>
.api-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #fef3c7;
  border-bottom: 2px solid #f59e0b;
  color: #92400e;
  font-size: 13px;
  font-weight: 600;
}
.api-banner-icon {
  font-size: 16px;
}
.api-banner-retry {
  margin-left: auto;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.api-banner-retry:hover { background: #d97706; }
.api-banner-close {
  background: none;
  border: none;
  color: #92400e;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

[data-theme="dark"] .api-banner {
  background: #78350f;
  border-color: #b45309;
  color: #fef3c7;
}
[data-theme="dark"] .api-banner-close { color: #fef3c7; }
</style>
