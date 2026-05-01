<template>
  <div class="auth-page">
    <div class="auth-card" style="max-width:560px">
      <div class="auth-logo">
        <ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span>
      </div>
      <h1>{{ t('support_title') }}</h1>
      <p class="auth-sub">{{ t('support_subtitle') }}</p>

      <div style="text-align:left;margin:2rem 0">
        <p style="line-height:1.8;color:var(--text-secondary)">
          {{ t('support_pitch') }}
        </p>

        <div style="margin:1.5rem 0;padding:1.2rem;border-radius:12px;background:var(--bg-secondary)">
          <p style="margin:0 0 .5rem;font-weight:600;color:var(--text-primary)">
            {{ t('support_response_title') }}
          </p>
          <p style="margin:0;color:var(--text-secondary)">
            {{ t('support_response_desc') }}
          </p>
        </div>

        <div style="margin:1.5rem 0;padding:1.2rem;border-radius:12px;background:var(--bg-secondary)">
          <p style="margin:0 0 .5rem;font-weight:600;color:var(--text-primary)">
            {{ t('support_email_label') }}
          </p>
          <a href="mailto:support@scalyo.app" style="color:var(--color-primary);text-decoration:none;font-weight:500">
            support@scalyo.app
          </a>
        </div>

        <div style="margin:1.5rem 0;padding:1.2rem;border-radius:12px;background:var(--bg-secondary)">
          <p style="margin:0 0 .5rem;font-weight:600;color:var(--text-primary)">
            {{ t('support_langs_label') }}
          </p>
          <p style="margin:0;color:var(--text-secondary)">
            {{ t('support_langs_desc') }}
          </p>
        </div>
      </div>

      <a href="/" class="link" style="display:inline-block;margin-top:1rem">← {{ t('support_back') }}</a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t } = useI18n({ useScope: 'global' })
</script>