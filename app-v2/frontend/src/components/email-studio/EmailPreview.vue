<template>
  <div class="es-right">
    <div v-if="selected" class="es-preview">
      <div class="esp-header">
        <h2>{{ t(selected.nameKey) }}</h2>
        <div class="esp-actions">
          <span class="esp-cat" :class="catClass(selected.categoryKey)">
            {{ t('es_cat_' + selected.categoryKey) }}
          </span>
          <button class="btn-primary" @click="copyEmail">
            {{ copied ? t('es_copied') : t('es_copy') }}
          </button>
          <template v-if="isElite">
            <button
              class="btn-send"
              @click="$emit('open-send')"
              :disabled="!selected || !hasResendKey"
            >
              {{ !hasResendKey ? t('es_resend_required') : t('es_send') }}
            </button>
          </template>
          <template v-else>
            <div class="es-elite-gate" :title="t('es_elite_tooltip')">
              <span>{{ t('es_elite_badge') }}</span>
              <span class="es-elite-lock">🔒 {{ t('es_elite_required') }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="esp-field">
        <strong>{{ t('es_subject') }}</strong>
        <p>{{ t(selected.subjectKey) }}</p>
      </div>

      <div class="esp-body">
        <strong>{{ t('es_body') }}</strong>
        <div class="esp-content" v-html="t(selected.bodyKey)" />
      </div>
    </div>

    <div v-else class="esp-empty">
      <span class="esp-empty-icon">📧</span>
      <p>{{ t('es_preview') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { catClass } from './emailTemplates.js'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  selected: { type: Object, default: null },
  isElite: { type: Boolean, default: false },
  hasResendKey: { type: Boolean, default: false }
})

defineEmits(['open-send'])

const copied = ref(false)

function copyEmail() {
  if (!props.selected) return
  const text =
    t(props.selected.subjectKey) +
    '\n\n' +
    t(props.selected.bodyKey).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>
