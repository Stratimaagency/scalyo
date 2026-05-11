<template>
<div class="email-studio">
  <div class="es-header">
    <h1>{{ t('es_title') }}</h1>
    <p class="es-sub">{{ t('es_subtitle') }}</p>
  </div>

  <div :class="['es-email-banner', hasResendKey ? 'connected' : 'setup-needed']">
    <span class="es-banner-icon">{{ hasResendKey ? '\u2705' : '\u26a0\ufe0f' }}</span>
    <div class="es-banner-text">
      <strong>{{ hasResendKey ? t('es_resend_connected') : t('es_resend_setup_title') }}</strong>
      <span>{{ hasResendKey ? t('es_resend_connected_desc') : t('es_resend_setup_desc') }}</span>
    </div>
    <router-link v-if="!hasResendKey" to="/app/settings?tab=integrations" class="es-banner-link">
      {{ t('es_resend_setup_link') }}
    </router-link>
  </div>

  <AiInsightPanel
    module="email"
    :title="t('ai_email_title')"
    :button-label="t('ai_email_btn')"
    :message="t('ai_email_prompt')"
    :context="{ selectedTemplate: selected?.id, currentSubject: editSubject, currentBody: editBody }"
    @result="onAiResult"
  />

  <div v-if="activeTab !== 'history'" class="es-layout">
    <EmailTemplateList
      :active-tab="activeTab"
      :active-cat="activeCat"
      :selected-id="selectedId"
      :search="search"
      @update:activeTab="activeTab = $event"
      @update:activeCat="activeCat = $event"
      @update:selectedId="onSelectTemplate"
      @update:search="search = $event"
    />
    <EmailPreview
      :selected="selected"
      :is-elite="isElite"
      :has-resend-key="hasResendKey"
      :edit-subject="editSubject"
      :edit-body="editBody"
      @update:editSubject="editSubject = $event"
      @update:editBody="editBody = $event"
      @open-send="openSendModal"
    />
  </div>

  <div v-else>
    <div class="es-tabs" style="max-width: 340px; margin-bottom: 16px;">
      <button v-for="tab in tabKeys" :key="tab.key" class="es-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        {{ t(tab.label) }}
      </button>
    </div>
    <EmailHistory :is-elite="isElite" />
  </div>

  <EmailSendModal
    v-if="showSendModal"
    :selected="selected"
    :edit-subject="editSubject"
    :edit-body="editBody"
    @close="showSendModal = false"
  />

  <ResendSetupWizard v-if="showResendWizard" @close="showResendWizard = false" @connected="loadEmailConfig" />
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { templates } from '@/components/email-studio/emailTemplates.js'
import EmailTemplateList from '@/components/email-studio/EmailTemplateList.vue'
import EmailPreview from '@/components/email-studio/EmailPreview.vue'
import EmailHistory from '@/components/email-studio/EmailHistory.vue'
import EmailSendModal from '@/components/email-studio/EmailSendModal.vue'
import ResendSetupWizard from '@/components/modals/ResendSetupWizard.vue'
import AiInsightPanel from '@/components/ai/AiInsightPanel.vue'
import '@/assets/emailStudio.css'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()

const activeTab = ref('all')
const activeCat = ref('all')
const search = ref('')
const selectedId = ref(null)
const showSendModal = ref(false)
const showResendWizard = ref(false)
const editSubject = ref('')
const editBody = ref('')
const emailConfigured = ref(false)

const isElite = computed(() => auth.currentPlan === 'elite')
const hasResendKey = computed(() => emailConfigured.value)

const selected = computed(() =>
  templates.find(tpl => tpl.id === selectedId.value) || null
)

const tabKeys = [
  { key: 'all', label: 'es_tab_all' },
  { key: 'csm', label: 'es_tab_csm' },
  { key: 'commercial', label: 'es_tab_commercial' },
  { key: 'kam', label: 'es_tab_kam' },
  { key: 'history', label: 'es_tab_history' }
]

async function loadEmailConfig() {
  try {
    const { data } = await supabase.rpc('get_org_email_config', { p_owner_id: auth.user?.id })
    const row = Array.isArray(data) ? data[0] : data
    emailConfigured.value = !!row?.resend_api_key
  } catch {
    emailConfigured.value = false
  }
}

onMounted(() => { loadEmailConfig() })

function onSelectTemplate(id) {
  selectedId.value = id
  const tpl = templates.find(t2 => t2.id === id)
  if (tpl) {
    editSubject.value = t(tpl.subjectKey)
    editBody.value = t(tpl.bodyKey).replace(/<[^>]*>/g, '')
  }
}

function openSendModal() { showSendModal.value = true }

function onAiResult(result) {
  if (result?.response) { editBody.value = result.response }
}
</script>
