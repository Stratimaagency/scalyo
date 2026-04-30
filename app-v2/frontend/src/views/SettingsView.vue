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

    <!-- Delete Account -->
    <div v-else-if="activeTab === 'delete'" class="sv-panel">
      <div class="sv-section danger-section">
        <h3>{{ t('stg_tab_delete') }}</h3>
        <p>{{ t('stg_delete_warning') }}</p>
        <button class="btn-danger">{{ t('stg_delete_btn') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SettingsProfile from '@/components/settings/SettingsProfile.vue'
import SettingsTeam from '@/components/settings/SettingsTeam.vue'
import SettingsBilling from '@/components/settings/SettingsBilling.vue'
import SettingsIntegrations from '@/components/settings/SettingsIntegrations.vue'
import SettingsPreferences from '@/components/settings/SettingsPreferences.vue'
import '@/assets/settings.css'

const { t } = useI18n({ useScope: 'global' })
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

function saveProfile() {
  // TODO: Implement Supabase profile save
}
</script>
