<template>
<div class="send-modal-overlay" @click.self="$emit('close')">
  <div class="send-modal">
    <div class="sm-header">
      <h3>{{ t('es_send_title') }}</h3>
      <button class="sm-close" @click="$emit('close')">\u2715</button>
    </div>
    <div class="sm-body">
      <div v-if="sendResult?.success" class="sm-success">
        \u2705 {{ t('es_send_success') }}
      </div>
      <div v-else-if="sendResult?.error" class="sm-error">
        \u274c {{ sendResult.error }}
      </div>
      <template v-else>
        <div class="sm-field">
          <label>{{ t('es_send_to') }}</label>
          <input v-model="sendTo" type="email" :placeholder="t('es_send_to_placeholder')" class="sm-input" />
        </div>
        <div class="sm-field">
          <label>{{ t('es_send_from_name') }}</label>
          <input v-model="sendFromName" type="text" :placeholder="auth.fullName || t('es_send_from_placeholder')" class="sm-input" />
        </div>
        <div class="sm-preview">
          <strong>{{ t('es_subject') }} :</strong> {{ editSubject }}
        </div>
        <div class="sm-preview sm-preview-body">
          <strong>{{ t('es_body') }} :</strong>
          <p class="sm-body-text">{{ editBody.substring(0, 200) }}{{ editBody.length > 200 ? '...' : '' }}</p>
        </div>
        <button class="btn-primary sm-send-btn" @click="sendEmail" :disabled="!sendTo || sending">
          {{ sending ? t('es_sending') : t('es_send_btn') }}
        </button>
      </template>
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

const props = defineProps({
  selected: { type: Object, default: null },
  editSubject: { type: String, default: '' },
  editBody: { type: String, default: '' },
})

const emit = defineEmits(['close'])
const sendTo = ref('')
const sendFromName = ref('')
const sending = ref(false)
const sendResult = ref(null)

async function sendEmail() {
  if (!sendTo.value || !props.editSubject) return
  sending.value = true
  sendResult.value = null

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      sendResult.value = { error: t('es_send_auth_error') || 'Session expired' }
      return
    }

    const htmlBody = props.editBody
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')

    const resp = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
      },
      body: JSON.stringify({
        to: sendTo.value,
        subject: props.editSubject,
        html: '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.6;max-width:600px;margin:0 auto">' + htmlBody + '</div>',
        from_name: sendFromName.value || auth.fullName || 'Scalyo',
        replyTo: auth.user?.email,
      }),
    })

    const data = await resp.json()

    if (resp.ok && (data.sent || data.success)) {
      sendResult.value = { success: true }
      sendTo.value = ''
      setTimeout(() => { emit('close'); sendResult.value = null }, 2000)
    } else {
      sendResult.value = { error: data.error || t('es_send_error') || 'Send failed' }
    }
  } catch (e) {
    sendResult.value = { error: e.message || t('es_send_error') }
  } finally {
    sending.value = false
  }
}
</script>
