<template>
  <div class="integ-embed">
    <div v-if="integration" class="integ-header">
      <span class="integ-icon">{{ integration.icon }}</span>
      <h2>{{ integration.title }}</h2>
      <router-link to="/app/integrations" class="integ-close">\u2715</router-link>
    </div>
    <div v-if="integration" class="integ-frame-wrap">
      <p class="integ-loading">{{ t('integ_loading') }}</p>
      <iframe
        :src="integration.url"
        class="integ-frame"
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      ></iframe>
    </div>
    <div v-else class="integ-not-found">
      <p>{{ t('integ_not_found') }}</p>
      <router-link to="/app/integrations">\u2190 Back</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const INTEGRATIONS_MAP = {
  slack: { url: 'https://app.slack.com', title: 'Slack', icon: '\uD83D\uDCAC' },
  hubspot: { url: 'https://app.hubspot.com', title: 'HubSpot', icon: '\uD83D\uDD17' },
  intercom: { url: 'https://app.intercom.com', title: 'Intercom', icon: '\uD83D\uDCE8' },
  zendesk: { url: 'https://www.zendesk.com', title: 'Zendesk', icon: '\uD83C\uDFAB' }
}

const integration = computed(() => INTEGRATIONS_MAP[route.params.service] || null)
</script>

<style scoped>
.integ-embed { height: 100vh; display: flex; flex-direction: column; }
.integ-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border, #e5e7eb);
  background: var(--bg-surface, #fff);
}
.integ-header h2 { font-size: 1rem; font-weight: 600; margin: 0; flex: 1; }
.integ-icon { font-size: 1.25rem; }
.integ-close {
  font-size: 1.1rem; color: var(--text-secondary, #6b7280);
  text-decoration: none; padding: 0.25rem 0.5rem;
}
.integ-frame-wrap { flex: 1; position: relative; }
.integ-loading {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  color: var(--text-secondary, #6b7280); font-size: 0.9rem;
}
.integ-frame { width: 100%; height: 100%; border: none; position: relative; z-index: 1; }
.integ-not-found {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh; gap: 1rem;
  color: var(--text-secondary, #6b7280);
}
</style>