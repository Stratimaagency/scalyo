<template>
  <div class="send-modal-overlay" @click.self="$emit('close')">
    <div class="send-modal">
      <div class="sm-header">
        <h3>{{ t('es_send_title') }}</h3>
        <button class="sm-close" @click="$emit('close')">✕</button>
      </div>

      <div class="sm-body">
        <div v-if="sendResult?.success" class="sm-success">
          ✅ {{ t('es_send_success') }}
        </div>
        <div v-else-if="sendResult?.error" class="sm-error">
          ❌ {{ sendResult.error }}
        </div>
        <template v-else>
          <div class="sm-field">
            <label>{{ t('es_send_to') }}</label>
            <input
              v-model="sendTo"
              type="email"
              :placeholder="t('es_send_to_placeholder')"
              class="sm-input"
            />
          </div>
          <div class="sm-field">
            <label>{{ t('es_send_from_name') }}</label>
            <input
              v-model="sendFromName"
              type="text"
              :placeholder="auth.fullName || t('es_send_from_placeholder')"
              class="sm-input"
            />
          </div>
          <div class="sm-preview">
            <strong>{{ t('es_subject') }} :</strong>
            {{ selected ? t(selected.subjectKey) : '' }}
          </div>
          <button
            class="btn-primary sm-send-btn"
            @click="sendEmail"
            :disabled="!sendTo || sending"
          >
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
  selected: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const sendTo = ref('')
const sendFromName = ref('')
const sending = ref(false)
const sendResult = ref(null)

async function sendEmail() {
  if (!props.selected || !sendTo.value) return
  sending.value = true
  sendResult.value = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const resp = await fetch(
      '/api/email/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          to: sendTo.value,
          subject: t(props.selected.subjectKey),
          html: `<div style="font-family:sans-serif;line-height:1.6;max-width:600px;margin:0 auto">${t(props.selected.bodyKey).replace(/\n/g, '<br>')}</div>`,
          from_name: sendFromName.value || auth.fullName || 'Scalyo',
          replyTo: auth.user?.email,
        })
      }
    )
    const data = await resp.json()
    if (resp.ok && (data.sent || data.success)) {
      sendResult.value = { success: true }
      sendTo.value = ''
      setTimeout(() => { emit('close'); sendResult.value = null }, 2000)
    } else {
      sendResult.value = { error: data.error || 'Erreur envoi' }
    }
  } catch (e) {
    sendResult.value = { error: e.message }
  } finally {
    sending.value = false
  }
}
</script>
