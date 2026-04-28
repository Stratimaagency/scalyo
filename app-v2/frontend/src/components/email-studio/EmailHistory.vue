<template>
  <div class="es-history">
    <div v-if="!isElite" class="es-history-gate">
      <span class="es-elite-gate">
        <span>Elite</span>
        <span class="es-elite-lock">🔒 {{ t('es_history_elite') }}</span>
      </span>
    </div>

    <template v-else>
      <!-- KPI bar -->
      <div class="es-history-kpis">
        <div class="es-kpi">
          <span class="es-kpi-value">{{ sentEmails.length }}</span>
          <span class="es-kpi-label">{{ t('es_history_sent') }}</span>
        </div>
        <div class="es-kpi">
          <span class="es-kpi-value">{{ openedCount }}</span>
          <span class="es-kpi-label">{{ t('es_history_opened') }}</span>
        </div>
        <div class="es-kpi">
          <span class="es-kpi-value">{{ openRate }}</span>
          <span class="es-kpi-label">{{ t('es_history_rate') }}</span>
        </div>
      </div>

      <!-- Loading / Error / Empty -->
      <div v-if="loading" class="es-history-loading">⏳ {{ t('es_history_loading') }}</div>
      <div v-else-if="error" class="es-history-error">{{ error }}</div>
      <div v-else-if="!sentEmails.length" class="es-history-empty">
        {{ t('es_history_empty') }}
      </div>

      <!-- Table -->
      <div v-else class="es-history-table">
        <div class="es-history-head">
          <span>{{ t('es_history_col_to') }}</span>
          <span>{{ t('es_history_col_subject') }}</span>
          <span>{{ t('es_history_col_sent') }}</span>
          <span>{{ t('es_history_col_status') }}</span>
          <span>{{ t('es_history_col_opens') }}</span>
        </div>
        <div
          v-for="email in sentEmails"
          :key="email.id"
          class="es-history-row"
        >
          <span class="es-history-to" :title="email.to_email">{{ email.to_email }}</span>
          <span class="es-history-subject" :title="email.subject">{{ email.subject }}</span>
          <span class="es-history-date">{{ formatDate(email.sent_at) }}</span>
          <span
            :class="['es-history-status', email.opened_at ? 'opened' : 'pending']"
          >
            {{ email.opened_at ? '✅ ' + t('es_history_read') : t('es_history_unread') }}
          </span>
          <span class="es-history-opens">{{ email.open_count || 0 }}x</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  isElite: { type: Boolean, default: false }
})

const sentEmails = ref([])
const loading = ref(false)
const error = ref(null)

const openedCount = computed(() => sentEmails.value.filter(e => e.opened_at).length)

const openRate = computed(() => {
  if (!sentEmails.value.length) return '0%'
  return Math.round((openedCount.value / sentEmails.value.length) * 100) + '%'
})

async function loadSentEmails() {
  if (!props.isElite) return
  loading.value = true
  error.value = null
  try {
    const { data, error: err } = await supabase
      .from('sent_emails')
      .select('id, to_email, subject, template_id, sent_at, opened_at, open_count, from_name')
      .order('sent_at', { ascending: false })
      .limit(50)
    if (err) throw err
    sentEmails.value = data || []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => loadSentEmails())
</script>
