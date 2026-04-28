<template>
    <section class="integ-section anim-section" data-anim="fade-up">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">{{ t('integ_tag') }}</span>
          <h2 v-html="t('integ_h2')"></h2>
          <p class="section-sub">{{ t('integ_sub') }}</p>
        </div>
        <div class="integ-grid">
          <div v-for="ig in integrations" :key="ig.name" class="integ-card">
            <span class="integ-icon">{{ ig.icon }}</span>
            <strong>{{ ig.name }}</strong>
            <small>{{ ig.tag }}</small>
            <span class="integ-avail">{{ t('integ_available') }}</span>
          </div>
        </div>
        <p class="integ-more">{{ t('integ_more') }}</p>
      </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const integrations = computed(() => [
  { icon: '☁️', name: 'Salesforce', tag: t('integ_sf_tag') },
  { icon: '📧', name: 'Gmail', tag: t('integ_gmail_tag') },
  { icon: '📬', name: 'IMAP', tag: t('integ_imap_tag') },
  { icon: '💬', name: 'Slack', tag: t('integ_slack_tag') },
  { icon: '📹', name: 'Zoom', tag: t('integ_zoom_tag') },
  { icon: '📆', name: 'Calendly', tag: t('integ_calendly_tag') },
  { icon: '📋', name: 'Asana', tag: t('integ_asana_tag') },
])
</script>

<style scoped>
/* ═══════════════════ INTEGRATIONS ═══════════════════ */
.integ-section { padding: 80px 0; }
.integ-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 32px 0 20px; }
.integ-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 14px; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.3s; }
.integ-card:hover { border-color: var(--lp-purple); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(124,58,237,0.1); }
.integ-icon { font-size: 2rem; margin-bottom: 4px; }
.integ-card strong { font-size: 0.9rem; }
.integ-card small { font-size: 0.72rem; color: var(--lp-muted); }
.integ-avail { font-size: 0.68rem; color: var(--lp-green); background: rgba(16,185,129,0.1); padding: 2px 10px; border-radius: 999px; }
.integ-more { text-align: center; font-size: 0.82rem; color: var(--lp-muted); margin-top: 20px; }

</style>