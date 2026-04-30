<template>
  <div class="sv-panel">
    <div class="sv-section">
      <h3>{{ t('stg_resend_title') }}</h3>
      <p class="stg-resend-desc">{{ t('stg_resend_desc') }}</p>

      <div class="stg-resend-box">
        <div class="stg-resend-header">
          <span class="stg-resend-logo">📧</span>
          <div>
            <strong>Resend</strong>
            <span
              :class="['stg-resend-badge', auth.profile?.resend_api_key ? 'active' : '']"
            >
              {{
                auth.profile?.resend_api_key
                  ? '✓ ' + t('stg_resend_active')
                  : t('stg_resend_inactive')
              }}
            </span>
          </div>
        </div>

        <div class="fg">
          <label>{{ t('stg_resend_key_label') }}</label>
          <input
            v-model="resendKey"
            type="password"
            :placeholder="t('stg_resend_key_placeholder')"
            class="fi"
            autocomplete="off"
          />
        </div>

        <p class="stg-resend-help">
          {{ t('stg_resend_help') }}
          <a href="https://resend.com/api-keys" target="_blank" rel="noopener">resend.com →</a>
        </p>

        <div v-if="resendError" class="stg-resend-error">{{ resendError }}</div>
        <div v-if="resendSaved" class="stg-resend-success">✓ {{ t('stg_resend_saved') }}</div>

        <button class="btn-save" @click="saveResendKey" :disabled="resendSaving">
          {{ resendSaving ? t('stg_saving') : t('stg_resend_save') }}
        </button>
      </div>

      <div class="stg-resend-info">
        <span>💡</span>
        <span>{{ t('stg_resend_free_info') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()

const resendKey = ref(auth.profile?.resend_api_key || '')
const resendSaving = ref(false)
const resendSaved = ref(false)
const resendError = ref('')

async function saveResendKey() {
  resendSaving.value = true
  resendError.value = ''
  resendSaved.value = false
  try {
    if (resendKey.value && !resendKey.value.startsWith('re_')) {
      resendError.value = t('stg_resend_invalid')
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({ resend_api_key: resendKey.value || null })
      .eq('id', auth.user?.id)
    if (error) throw error
    await auth.fetchProfile(auth.user?.id)
    resendSaved.value = true
    setTimeout(() => { resendSaved.value = false }, 3000)
  } catch (e) {
    resendError.value = e.message
  } finally {
    resendSaving.value = false
  }
}
</script>
