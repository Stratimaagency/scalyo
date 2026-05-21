<template>
  <div class="settings-view">
    <div class="sv-header">
      <h1>⚙️ {{ t('stg_title') }}</h1>
      <p class="sv-sub">{{ t('stg_subtitle') }}</p>
    </div>

    <!-- Tabs -->
    <div class="sv-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="sv-tab"
        :class="{ active: activeTab === tab.key, danger: tab.danger }"
        @click="activeTab = tab.key"
      >
        {{ t(tab.label) }}
      </button>
    </div>

    <!-- Profile -->
    <SettingsProfile
      v-if="activeTab === 'profile'"
      :local-profile="profile"
      :local-pwd="pwd"
      @save="saveProfile"
    />

    <!-- Team -->
    <SettingsTeam v-else-if="activeTab === 'team'" />

    <!-- Billing -->
    <SettingsBilling v-else-if="activeTab === 'billing'" />

    <!-- Integrations -->
    <SettingsIntegrations v-else-if="activeTab === 'integrations'" />

    <!-- Preferences (Language + Theme) -->
    <SettingsPreferences v-else-if="activeTab === 'appearance'" />

    <!-- Notifications -->
    <div v-else-if="activeTab === 'notifications'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_notif') }}</h3>
        <div class="notif-settings">
          <label class="ns-row">
            <input type="checkbox" v-model="notif.churn" />
            {{ t('stg_notif_churn') }}
          </label>
          <label class="ns-row">
            <input type="checkbox" v-model="notif.renewal" />
            {{ t('stg_notif_renewal') }}
          </label>
          <label class="ns-row">
            <input type="checkbox" v-model="notif.burnout" />
            {{ t('stg_notif_burnout') }}
          </label>
          <label class="ns-row">
            <input type="checkbox" v-model="notif.late_tasks" />
            {{ t('stg_notif_late_tasks') }}
          </label>
          <label class="ns-row">
            <input type="checkbox" v-model="notif.nps" />
            {{ t('stg_notif_nps') }}
          </label>
        </div>
      </div>
    </div>

    <!-- Data & Account Deletion -->
    <div v-else-if="activeTab === 'delete'" class="sv-panel">
      <!-- Export Data (RGPD Art. 20) -->
      <div class="sv-section">
        <h3>{{ t('stg_export_title') }}</h3>
        <p class="sv-desc">{{ t('stg_export_desc') }}</p>
        <button
          class="sv-btn-secondary"
          :disabled="exportLoading"
          @click="handleExport"
        >
          {{ exportLoading ? t('stg_export_loading') : t('stg_export_btn') }}
        </button>
        <p v-if="exportError" class="sv-field-error">{{ t('stg_export_error') }}</p>
        <p v-if="exportSuccess" class="sv-field-success">{{ t('stg_export_success') }}</p>
      </div>

      <!-- Delete Account (RGPD Art. 17) -->
      <div class="sv-section danger-section">
        <h3>{{ t('stg_delete_title') }}</h3>
        <p>{{ t('stg_delete_warning') }}</p>
        <div v-if="!deleteConfirmStep" class="delete-action">
          <button class="btn-danger" @click="deleteConfirmStep = true">
            {{ t('stg_delete_btn') }}
          </button>
        </div>
        <div v-else class="delete-confirm">
          <p class="delete-confirm-msg">{{ t('stg_delete_confirm_msg') }}</p>
          <input
            v-model="deleteEmail"
            type="email"
            :placeholder="auth.user?.email"
            class="sv-input"
          />
          <div class="delete-confirm-actions">
            <button
              class="btn-danger"
              :disabled="deleteEmail !== auth.user?.email || deleteLoading"
              @click="handleDelete"
            >
              {{ deleteLoading ? t('stg_delete_loading') : t('stg_delete_confirm_btn') }}
            </button>
            <button class="sv-btn-ghost" @click="cancelDelete">
              {{ t('stg_delete_cancel') }}
            </button>
          </div>
          <p v-if="deleteError" class="sv-field-error">{{ t('stg_delete_error') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import SettingsProfile from '@/components/settings/SettingsProfile.vue'
import SettingsTeam from '@/components/settings/SettingsTeam.vue'
import SettingsBilling from '@/components/settings/SettingsBilling.vue'
import SettingsIntegrations from '@/components/settings/SettingsIntegrations.vue'
import SettingsPreferences from '@/components/settings/SettingsPreferences.vue'
import '@/assets/settings.css'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: 'stg_tab_profile' },
  { key: 'team', label: 'stg_tab_team' },
  { key: 'billing', label: 'stg_tab_billing' },
  { key: 'integrations', label: 'stg_tab_integrations' },
  { key: 'notifications', label: 'stg_tab_notif' },
  { key: 'appearance', label: 'stg_tab_appearance' },
  { key: 'delete', label: 'stg_tab_delete', danger: true }
]

const profile = reactive({
  displayName: auth.user?.displayName || '',
  email: auth.user?.email || '',
  company: auth.profile?.company || auth.profile?.company_name || ''
})

const pwd = reactive({ current: '', newPwd: '', confirm: '' })

const notif = reactive({
  churn: true,
  renewal: true,
  burnout: true,
  late_tasks: true,
  nps: false
})

// --- Export data (RGPD Art. 20) ---
const exportLoading = ref(false)
const exportError = ref(false)
const exportSuccess = ref(false)

async function handleExport() {
  exportLoading.value = true
  exportError.value = false
  exportSuccess.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')
    const resp = await fetch('/api/export', {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    if (!resp.ok) throw new Error('Export failed')
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scalyo-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    exportSuccess.value = true
  } catch (e) {
    exportError.value = true
  } finally {
    exportLoading.value = false
  }
}

// --- Delete account (RGPD Art. 17) ---
const deleteConfirmStep = ref(false)
const deleteEmail = ref('')
const deleteLoading = ref(false)
const deleteError = ref(false)

async function handleDelete() {
  if (deleteEmail.value !== auth.user?.email) return
  deleteLoading.value = true
  deleteError.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')
    const resp = await fetch('/api/users/me', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    if (!resp.ok) throw new Error('Delete failed')
    await auth.logout?.()
    router.push('/login')
  } catch (e) {
    deleteError.value = true
    deleteLoading.value = false
  }
}

function cancelDelete() {
  deleteConfirmStep.value = false
  deleteEmail.value = ''
  deleteError.value = false
}

function saveProfile() {
  // TODO: Implement Supabase profile save
}
</script>
