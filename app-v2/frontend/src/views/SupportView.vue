<template>
  <div class="support-page">
    <div class="support-container">
      <header class="support-header">
        <ScalyoLogo :size="36" />
        <h1>{{ t('support_title') }}</h1>
        <p class="support-sub">{{ t('support_subtitle') }}</p>
      </header>

      <section class="support-card">
        <p class="support-pitch">{{ t('support_pitch') }}</p>
      </section>

      <div class="support-grid">
        <section class="support-card">
          <h2>{{ t('support_email_label') }}</h2>
          <a :href="'mailto:' + t('support_email_value')" class="support-email">{{ t('support_email_value') }}</a>
        </section>

        <section class="support-card">
          <h2>{{ t('support_response_title') }}</h2>
          <p>{{ t('support_response_desc') }}</p>
        </section>

        <section class="support-card">
          <h2>{{ t('support_langs_label') }}</h2>
          <p>{{ t('support_langs_desc') }}</p>
        </section>
      </div>

      <section class="support-card support-privacy">
        <h2>🔒 {{ t('support_privacy_title') }}</h2>
        <p>{{ t('support_privacy_desc') }}</p>
      </section>

      <section class="support-card support-legal">
        <h2>{{ t('support_legal_title') }}</h2>
        <div class="legal-links">
          <router-link to="/cgu">{{ t('support_cgu_link') }}</router-link>
          <router-link to="/privacy">{{ t('support_privacy_link') }}</router-link>
        </div>
      </section>

      <div class="support-back">
        <router-link to="/">{{ t('support_back') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.support-page { min-height: 100vh; background: var(--bg-primary, #f8f9fa); display: flex; align-items: center; justify-content: center; padding: 2rem; }
.support-container { max-width: 640px; width: 100%; }
.support-header { text-align: center; margin-bottom: 2rem; }
.support-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
.support-sub { color: var(--text-secondary, #6b7280); font-size: 0.95rem; }
.support-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid var(--border, #e5e7eb); }
.support-pitch { line-height: 1.7; color: var(--text-primary, #1f2937); }
.support-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.support-grid .support-card h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary, #6b7280); margin: 0 0 0.5rem; }
.support-email { font-size: 1.1rem; font-weight: 600; color: var(--primary, #6366f1); text-decoration: none; }
.support-email:hover { text-decoration: underline; }
.support-privacy { border-left: 3px solid var(--primary, #6366f1); }
.support-privacy h2 { font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem; }
.support-legal h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary, #6b7280); margin: 0 0 0.75rem; }
.legal-links { display: flex; gap: 1.5rem; }
.legal-links a { color: var(--primary, #6366f1); text-decoration: none; font-weight: 500; }
.legal-links a:hover { text-decoration: underline; }
.support-back { text-align: center; margin-top: 2rem; }
.support-back a { color: var(--text-secondary, #6b7280); text-decoration: none; font-size: 0.9rem; }
.support-back a:hover { color: var(--primary, #6366f1); }
</style>