<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('integrationsTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('integrationsDesc') }}</p>
    </div>

    <!-- Load error banner -->
    <div v-if="loadError" class="integ-error-banner mb-lg">
      {{ loadError }}
      <button class="integ-error-retry" @click="loadConnectedIntegrations">{{ t('retry') }}</button>
    </div>

    <!-- Category filter tabs -->
    <div class="integ-tabs mb-lg">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="integ-tab"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        <span class="integ-tab-icon">{{ cat.icon }}</span>
        {{ cat.label }}
        <span class="integ-tab-count">{{ getCategoryCount(cat.key) }}</span>
      </button>
    </div>

    <!-- Connected integrations summary -->
    <div v-if="connectedKeys.size > 0 && activeCategory === 'all'" class="integ-connected-summary mb-lg">
      <h4 class="integ-section-title">
        <span class="integ-dot integ-dot-teal"></span>
        {{ t('integConnected') }} ({{ connectedKeys.size }})
      </h4>
      <div class="integ-connected-chips">
        <span v-for="integ in connectedIntegrations" :key="integ.key" class="integ-connected-chip">
          <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" style="width: 16px; height: 16px;" /> <span v-else>{{ integ.icon }}</span> {{ integ.name }}
          <button class="integ-disconnect-x" @click.stop="disconnectIntegration(integ)" title="Disconnect">&times;</button>
        </span>
      </div>
    </div>

    <!-- Available integrations -->
    <div v-if="filteredAvailable.length" class="mb-lg">
      <h4 class="integ-section-title">
        <span class="integ-dot integ-dot-green"></span>
        {{ t('integrationsAvailable') }}
      </h4>
      <div class="integ-grid">
        <AppCard v-for="integ in filteredAvailable" :key="integ.key" class="card-lift integ-card">
          <div class="integ-card-header">
            <div class="integ-icon-wrap" :style="{ background: integ.color + '15', border: '1px solid ' + integ.color + '30' }">
              <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" class="integ-card-logo" /><span v-else class="integ-card-icon">{{ integ.icon }}</span>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
              <span v-if="connectedKeys.has(integ.key)" class="tag risk-low" style="font-size: 10px; padding: 2px 8px;">{{ t('integConnected') }}</span>
              <span v-else class="tag" style="font-size: 10px; padding: 2px 8px; background: var(--surface); border: 1px solid var(--border);">{{ t('integrationsActive') }}</span>
            </div>
          </div>
          <p class="integ-card-desc">{{ integ.desc }}</p>
          <div class="integ-card-features">
            <span v-for="feat in integ.features" :key="feat" class="integ-feature-tag">{{ feat }}</span>
          </div>
          <!-- Sync status for connected integrations -->
          <div v-if="connectedKeys.has(integ.key) && syncStatus[integ.key]" class="integ-sync-status" :class="'integ-sync-' + syncStatus[integ.key].syncStatus">
            <span v-if="syncStatus[integ.key].syncStatus === 'success'">{{ t('integSyncOk') }}</span>
            <span v-else-if="syncStatus[integ.key].syncStatus === 'error'">{{ t('integSyncError') }}</span>
            <span v-if="syncStatus[integ.key].lastSyncAt" style="font-size: 10px; opacity: 0.7;">{{ formatDate(syncStatus[integ.key].lastSyncAt) }}</span>
          </div>

          <div v-if="connectedKeys.has(integ.key)" style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary integ-connect-btn" style="flex: 1;" @click="testIntegration(integ)" :disabled="testing === integ.key">
              {{ testing === integ.key ? t('integTesting') : t('integTest') }}
            </button>
            <button class="btn btn-primary integ-connect-btn" style="flex: 1;" @click="syncIntegration(integ)" :disabled="syncing === integ.key">
              {{ syncing === integ.key ? t('integSyncing') : t('integSync') }}
            </button>
            <button class="btn btn-secondary integ-connect-btn" style="flex: 0;" @click="openConnectModal(integ)">
              <ScalyoIcon name="settings" :size="12" />
            </button>
            <button class="btn btn-secondary integ-connect-btn" style="flex: 0; color: var(--red);" @click="disconnectIntegration(integ)">
              <ScalyoIcon name="x" :size="12" />
            </button>
          </div>
          <button v-else class="btn btn-primary integ-connect-btn" @click="handleConnect(integ)">
            <ScalyoIcon name="bolt" :size="12" /> {{ t('integConnect') }}
          </button>
        </AppCard>
      </div>
    </div>

    <!-- Coming soon -->
    <div v-if="filteredComingSoon.length" class="mb-lg">
      <h4 class="integ-section-title">
        <span class="integ-dot integ-dot-amber"></span>
        {{ t('integrationsComingSoon') }}
      </h4>
      <div class="integ-grid">
        <AppCard v-for="integ in filteredComingSoon" :key="integ.key" class="integ-card">
          <div class="integ-card-header">
            <div class="integ-icon-wrap" style="opacity: 0.6;">
              <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" class="integ-card-logo" /><span v-else class="integ-card-icon">{{ integ.icon }}</span>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
              <span class="tag" style="font-size: 10px; padding: 2px 8px; background: var(--surface); border: 1px solid var(--border);">{{ t('integrationsPlanned') }}</span>
            </div>
          </div>
          <p class="integ-card-desc">{{ integ.desc }}</p>
          <div class="integ-card-features">
            <span v-for="feat in integ.features" :key="feat" class="integ-feature-tag">{{ feat }}</span>
          </div>
          <button v-if="!integ.voted" class="btn btn-secondary integ-vote-btn" @click="voteIntegration(integ)">
            {{ t('integrationsVote') }}
          </button>
          <span v-else class="integ-voted-label">
            {{ t('integrationsVoted') }}
          </span>
        </AppCard>
      </div>
    </div>

    <!-- Empty state for filtered category -->
    <div v-if="!filteredAvailable.length && !filteredComingSoon.length" class="integ-empty">
      <ScalyoIcon name="search" :size="32" style="opacity: 0.3; margin-bottom: 8px;" />
      <p style="font-size: 13px; color: var(--muted);">{{ t('integNoResults') }}</p>
    </div>

    <!-- Request integration -->
    <AppCard>
      <div style="text-align: center; padding: 20px;">
        <ScalyoIcon name="bolt" :size="28" style="margin-bottom: 8px;" />
        <h4 style="font-weight: 800; margin-bottom: 6px;">{{ t('integrationsRequestTitle') }}</h4>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px;">{{ t('integrationsRequestDesc') }}</p>
        <router-link :to="{ name: 'feedback' }" class="btn btn-primary" style="text-decoration: none;">
          {{ t('integrationsRequestBtn') }}
        </router-link>
      </div>
    </AppCard>

    <!-- Connect modal -->
    <AppModal v-if="connectModal" :title="t('integConnectTitle') + ' ' + connectModal.name" @close="connectModal = null">
      <div class="integ-modal-body">
        <div class="integ-modal-icon-row">
          <span style="font-size: 40px;">{{ connectModal.icon }}</span>
          <div>
            <div style="font-weight: 700; font-size: 16px;">{{ connectModal.name }}</div>
            <p style="font-size: 13px; color: var(--muted);">{{ connectModal.desc }}</p>
          </div>
        </div>

        <div v-if="connectError" class="integ-error" style="margin-bottom: 12px;">
          {{ connectError }}
        </div>

        <!-- Config fields based on integration type -->

        <!-- OAuth integrations (Gmail, Outlook, Google Meet) -->
        <div v-if="isOAuthIntegration(connectModal.key)" class="integ-config">
          <div v-if="oauthEmail" class="integ-oauth-connected">
            <span style="color: var(--green); font-weight: 700;">{{ t('integOAuthConnected') }}</span>
            <span style="font-size: 13px;">{{ oauthEmail }}</span>
          </div>
          <button v-else class="btn btn-primary integ-connect-btn" @click="startOAuth(connectModal.key)" :disabled="oauthLoading">
            {{ oauthLoading ? t('integOAuthRedirecting') : t('integOAuthAuthorize') }}
          </button>
          <div v-if="connectModal.configType === 'email'">
            <label class="integ-label" style="margin-top: 12px;">{{ t('integEmailSync') }}</label>
            <div class="integ-toggle-row">
              <span style="font-size: 13px;">{{ t('integEmailIncoming') }}</span>
              <button class="integ-toggle" :class="{ on: configForm.syncIncoming }" @click="configForm.syncIncoming = !configForm.syncIncoming"></button>
            </div>
            <div class="integ-toggle-row">
              <span style="font-size: 13px;">{{ t('integEmailOutgoing') }}</span>
              <button class="integ-toggle" :class="{ on: configForm.syncOutgoing }" @click="configForm.syncOutgoing = !configForm.syncOutgoing"></button>
            </div>
          </div>
          <div v-if="connectModal.configType === 'meeting'">
            <div class="integ-toggle-row" style="margin-top: 12px;">
              <span style="font-size: 13px;">{{ t('integAutoCreateMeeting') }}</span>
              <button class="integ-toggle" :class="{ on: configForm.autoCreateMeeting }" @click="configForm.autoCreateMeeting = !configForm.autoCreateMeeting"></button>
            </div>
            <div class="integ-toggle-row">
              <span style="font-size: 13px;">{{ t('integSyncCalendar') }}</span>
              <button class="integ-toggle" :class="{ on: configForm.syncCalendar }" @click="configForm.syncCalendar = !configForm.syncCalendar"></button>
            </div>
          </div>
        </div>

        <!-- IMAP manual email -->
        <div v-else-if="connectModal.configType === 'email'" class="integ-config">
          <label class="integ-label">{{ t('integEmailProvider') }}</label>
          <div class="integ-provider-grid">
            <button
              v-for="p in emailProviders"
              :key="p.key"
              class="integ-provider-btn"
              :class="{ selected: configForm.provider === p.key }"
              @click="configForm.provider = p.key"
            >
              <span style="font-size: 20px;">{{ p.icon }}</span>
              <span style="font-size: 12px; font-weight: 600;">{{ p.name }}</span>
            </button>
          </div>
          <label class="integ-label">{{ t('integEmailAddress') }}</label>
          <input v-model="configForm.email" type="email" class="integ-input" placeholder="team@company.com" />
          <label class="integ-label">{{ t('integEmailSync') }}</label>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integEmailIncoming') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.syncIncoming }" @click="configForm.syncIncoming = !configForm.syncIncoming"></button>
          </div>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integEmailOutgoing') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.syncOutgoing }" @click="configForm.syncOutgoing = !configForm.syncOutgoing"></button>
          </div>
        </div>

        <div v-else-if="connectModal.configType === 'crm'" class="integ-config">
          <label class="integ-label">{{ t('integApiKey') }}</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="sk-xxxxxxxx" />
          <div v-if="connectModal.key === 'salesforce'">
            <label class="integ-label">{{ t('integInstanceUrl') }}</label>
            <input v-model="configForm.instanceUrl" type="url" class="integ-input" placeholder="https://yourorg.salesforce.com" />
          </div>
          <div v-if="connectModal.key === 'zendesk'">
            <label class="integ-label">Sous-domaine Zendesk</label>
            <input v-model="configForm.domain" type="text" class="integ-input" placeholder="yourcompany" />
            <span style="font-size: 11px; color: var(--muted);">yourcompany.zendesk.com</span>
            <label class="integ-label" style="margin-top: 10px;">Email admin</label>
            <input v-model="configForm.email" type="email" class="integ-input" placeholder="admin@yourcompany.com" />
          </div>
          <label class="integ-label">{{ t('integSyncFreq') }}</label>
          <select v-model="configForm.syncFreq" class="integ-input">
            <option value="realtime">{{ t('integRealtime') }}</option>
            <option value="hourly">{{ t('integHourly') }}</option>
            <option value="daily">{{ t('integDaily') }}</option>
          </select>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integAutoSync') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.autoSync }" @click="configForm.autoSync = !configForm.autoSync"></button>
          </div>
        </div>

        <div v-else-if="connectModal.configType === 'chat'" class="integ-config">
          <template v-if="connectModal.key === 'whatsapp'">
            <label class="integ-label">WhatsApp Business API Token</label>
            <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="EAAxxxxxxxx..." />
            <label class="integ-label">Phone Number ID</label>
            <input v-model="configForm.phoneNumberId" type="text" class="integ-input" placeholder="1234567890" />
            <label class="integ-label">{{ t('integChannel') || 'Numéro destinataire (test)' }}</label>
            <input v-model="configForm.recipientPhone" type="text" class="integ-input" placeholder="+33612345678" />
          </template>
          <template v-else>
            <label class="integ-label">{{ t('integWebhookUrl') }}</label>
            <input v-model="configForm.webhookUrl" type="url" class="integ-input" placeholder="https://hooks.slack.com/..." />
            <label class="integ-label">{{ t('integChannel') }}</label>
            <input v-model="configForm.channel" type="text" class="integ-input" placeholder="#customer-success" />
          </template>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integNotifChurn') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.notifChurn }" @click="configForm.notifChurn = !configForm.notifChurn"></button>
          </div>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integNotifWellbeing') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.notifWellbeing }" @click="configForm.notifWellbeing = !configForm.notifWellbeing"></button>
          </div>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integNotifRenewal') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.notifRenewal }" @click="configForm.notifRenewal = !configForm.notifRenewal"></button>
          </div>
        </div>

        <div v-else-if="connectModal.configType === 'meeting'" class="integ-config">
          <label class="integ-label">{{ connectModal.key === 'calendly' ? t('integApiKey') : t('integMeetingAccount') }}</label>
          <input v-if="connectModal.key === 'calendly'" v-model="configForm.apiKey" type="text" class="integ-input" placeholder="Personal access token" />
          <input v-else v-model="configForm.meetingEmail" type="email" class="integ-input" placeholder="team@company.com" />
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integAutoCreateMeeting') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.autoCreateMeeting }" @click="configForm.autoCreateMeeting = !configForm.autoCreateMeeting"></button>
          </div>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integSyncCalendar') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.syncCalendar }" @click="configForm.syncCalendar = !configForm.syncCalendar"></button>
          </div>
        </div>

        <div v-else-if="connectModal.configType === 'project'" class="integ-config">
          <label class="integ-label">{{ connectModal.key === 'notion' ? 'Notion Integration Token' : t('integApiKey') }}</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" :placeholder="connectModal.key === 'jira' ? 'email@domain.com:api_token' : connectModal.key === 'notion' ? 'secret_xxxxxxxx' : 'sk-xxxxxxxx'" />
          <div v-if="connectModal.key === 'jira'">
            <label class="integ-label">{{ t('integJiraDomain') }}</label>
            <input v-model="configForm.domain" type="text" class="integ-input" placeholder="yourcompany" />
            <span style="font-size: 11px; color: var(--muted);">yourcompany.atlassian.net</span>
          </div>
          <div v-if="connectModal.key === 'notion'">
            <label class="integ-label">Database ID (optionnel)</label>
            <input v-model="configForm.databaseId" type="text" class="integ-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            <span style="font-size: 11px; color: var(--muted);">ID de la base Notion à synchroniser (visible dans l'URL)</span>
          </div>
          <template v-if="connectModal.key !== 'notion'">
          <label class="integ-label">{{ t('integProjectKey') }}</label>
          <input v-model="configForm.projectKey" type="text" class="integ-input" placeholder="CS-BOARD" />
          </template>
          <div class="integ-toggle-row">
            <span style="font-size: 13px;">{{ t('integSyncTasks') }}</span>
            <button class="integ-toggle" :class="{ on: configForm.syncTasks }" @click="configForm.syncTasks = !configForm.syncTasks"></button>
          </div>
        </div>

        <div v-else-if="connectModal.configType === 'import'" class="integ-config">
          <p style="font-size: 13px; color: var(--muted); line-height: 1.6;">
            {{ t('integImportDesc') }}
          </p>
          <router-link :to="{ name: 'portfolio' }" class="btn btn-primary integ-connect-btn" style="text-decoration: none;" @click="connectModal = null">
            {{ t('integImportGoToPortfolio') }}
          </router-link>
        </div>

        <div v-else class="integ-config">
          <label class="integ-label">{{ t('integApiKey') }}</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="sk-xxxxxxxx" />
        </div>

        <div v-if="connectModal.configType !== 'import'" style="display: flex; gap: 8px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" @click="saveConnection" :disabled="saving">
            {{ saving ? t('saving') : t('integSaveConnect') }}
          </button>
          <button class="btn btn-secondary" @click="connectModal = null">{{ t('cancel') }}</button>
        </div>

        <div v-if="connectError" class="integ-error">
          {{ connectError }}
        </div>
        <div v-if="connectSuccess" class="integ-success">
          {{ t('integConnectSuccess') }}
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../i18n'
import { integrationsApi } from '../api'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const route = useRoute()

const activeCategory = ref('all')
const connectModal = ref(null)
const saving = ref(false)
const connectSuccess = ref(false)
const connectedKeys = ref(new Set())
const testing = ref(null)
const syncing = ref(null)
const syncStatus = ref({})
const oauthLoading = ref(false)
const oauthEmail = ref('')

// OAuth integrations map
const OAUTH_KEYS = { gmail: 'google', outlook: 'microsoft', 'google-meet': 'google' }
function isOAuthIntegration(key) { return key in OAUTH_KEYS }

const configForm = reactive({
  provider: '',
  email: '',
  syncIncoming: true,
  syncOutgoing: false,
  apiKey: '',
  syncFreq: 'daily',
  autoSync: true,
  webhookUrl: '',
  channel: '',
  notifChurn: true,
  notifWellbeing: true,
  notifRenewal: true,
  meetingEmail: '',
  autoCreateMeeting: false,
  syncCalendar: true,
  projectKey: '',
  syncTasks: true,
  instanceUrl: '',
  domain: '',
})

const emailProviders = [
  { key: 'gmail', name: 'Gmail', icon: '📧' },
  { key: 'outlook', name: 'Outlook', icon: '📬' },
  { key: 'imap', name: 'IMAP', icon: '📨' },
]

const categories = computed(() => [
  { key: 'all', icon: '🔌', label: t('integCatAll') },
  { key: 'crm', icon: '🏢', label: t('integCatCrm') },
  { key: 'email', icon: '📧', label: t('integCatEmail') },
  { key: 'chat', icon: '💬', label: t('integCatChat') },
  { key: 'meeting', icon: '📅', label: t('integCatMeeting') },
  { key: 'project', icon: '📋', label: t('integCatProject') },
  { key: 'data', icon: '📊', label: t('integCatData') },
])

const integrationsList = ref([
  // Data / Import
  { key: 'csv', name: 'Import CSV', icon: '📄', category: 'data', available: true, color: '#6B7280', desc: t('integDescCsv'), features: [t('integFeatOneClick'), t('integFeatMapping')], configType: 'import', voted: false },
  { key: 'excel', name: 'Import Excel', icon: '📊', category: 'data', available: true, color: '#16A34A', desc: t('integDescExcel'), features: [t('integFeatXlsx'), t('integFeatMultiSheet')], configType: 'import', voted: false },

  // Email
  { key: 'gmail', name: 'Gmail', logo: 'https://cdn.simpleicons.org/gmail', category: 'email', available: true, color: '#EA4335', desc: t('integDescGmail'), features: [t('integFeatInbox'), t('integFeatAutoLog'), t('integFeatTemplates')], configType: 'email', voted: false },
  { key: 'outlook', name: 'Outlook / Office 365', logo: 'https://cdn.simpleicons.org/microsoftoutlook', category: 'email', available: true, color: '#0078D4', desc: t('integDescOutlook'), features: [t('integFeatInbox'), t('integFeatCalendar'), t('integFeatContacts')], configType: 'email', voted: false },
  { key: 'imap', name: 'IMAP / SMTP', icon: '📨', category: 'email', available: true, color: '#6B7280', desc: t('integDescImap'), features: [t('integFeatAnyProvider'), t('integFeatSsl')], configType: 'email', voted: false },

  // CRM
  { key: 'hubspot', name: 'HubSpot CRM', logo: 'https://cdn.simpleicons.org/hubspot', category: 'crm', available: true, color: '#FF7A59', desc: t('integDescHubspot'), features: [t('integFeatContacts'), t('integFeatDeals'), t('integFeatAutoSync')], configType: 'crm', voted: false },
  { key: 'salesforce', name: 'Salesforce', logo: 'https://cdn.simpleicons.org/salesforce', category: 'crm', available: true, color: '#00A1E0', desc: t('integDescSalesforce'), features: [t('integFeatAccounts'), t('integFeatOpportunities'), t('integFeatBiDir')], configType: 'crm', voted: false },
  { key: 'pipedrive', name: 'Pipedrive', logo: 'https://cdn.simpleicons.org/pipedrive', category: 'crm', available: true, color: '#25C16F', desc: t('integDescPipedrive'), features: [t('integFeatDeals'), t('integFeatContacts'), t('integFeatActivity')], configType: 'crm', voted: false },

  // Chat
  { key: 'slack', name: 'Slack', logo: 'https://cdn.simpleicons.org/slack', category: 'chat', available: true, color: '#4A154B', desc: t('integDescSlack'), features: [t('integFeatAlerts'), t('integFeatCommands'), t('integFeatChannels')], configType: 'chat', voted: false },
  { key: 'teams', name: 'Microsoft Teams', logo: 'https://cdn.simpleicons.org/microsoftteams', category: 'chat', available: true, color: '#5B5FC7', desc: t('integDescTeams'), features: [t('integFeatAlerts'), t('integFeatBot'), t('integFeatChannels')], configType: 'chat', voted: false },
  { key: 'intercom', name: 'Intercom', logo: 'https://cdn.simpleicons.org/intercom', category: 'chat', available: true, color: '#286EFA', desc: t('integDescIntercom'), features: [t('integFeatConversations'), t('integFeatHealthData'), t('integFeatAutoTag')], configType: 'chat', voted: false },
  { key: 'whatsapp', name: 'WhatsApp Business', logo: 'https://cdn.simpleicons.org/whatsapp', category: 'chat', available: true, color: '#25D366', desc: t('integDescWhatsapp'), features: [t('integFeatMessages'), t('integFeatAutoLog')], configType: 'chat', voted: false },
  { key: 'zendesk', name: 'Zendesk', logo: 'https://cdn.simpleicons.org/zendesk', category: 'chat', available: true, color: '#03363D', desc: t('integDescZendesk'), features: [t('integFeatTickets'), t('integFeatHealthData'), t('integFeatAutoSync')], configType: 'crm', voted: false },

  // Meeting
  { key: 'google-meet', name: 'Google Meet', logo: 'https://cdn.simpleicons.org/googlemeet', category: 'meeting', available: true, color: '#0F9D58', desc: t('integDescGoogleMeet'), features: [t('integFeatAutoLink'), t('integFeatCalSync'), t('integFeatOneClick')], configType: 'meeting', voted: false },
  { key: 'zoom', name: 'Zoom', logo: 'https://cdn.simpleicons.org/zoom', category: 'meeting', available: true, color: '#2D8CFF', desc: t('integDescZoom'), features: [t('integFeatAutoLink'), t('integFeatRecording'), t('integFeatSchedule')], configType: 'meeting', voted: false },
  { key: 'calendly', name: 'Calendly', logo: 'https://cdn.simpleicons.org/calendly', category: 'meeting', available: true, color: '#006BFF', desc: t('integDescCalendly'), features: [t('integFeatBooking'), t('integFeatAutoAssign'), t('integFeatReminders')], configType: 'meeting', voted: false },

  // Project
  { key: 'jira', name: 'Jira', logo: 'https://cdn.simpleicons.org/jira', category: 'project', available: true, color: '#0052CC', desc: t('integDescJira'), features: [t('integFeatTickets'), t('integFeatSyncTasks'), t('integFeatBiDir')], configType: 'project', voted: false },
  { key: 'asana', name: 'Asana', logo: 'https://cdn.simpleicons.org/asana', category: 'project', available: true, color: '#F06A6A', desc: t('integDescAsana'), features: [t('integFeatProjects'), t('integFeatSyncTasks'), t('integFeatTimeline')], configType: 'project', voted: false },
  { key: 'notion', name: 'Notion', logo: 'https://cdn.simpleicons.org/notion', category: 'project', available: true, color: '#000000', desc: t('integDescNotion'), features: [t('integFeatDocs'), t('integFeatSyncTasks')], configType: 'project', voted: false },

  // Coming soon
  { key: 'segment', name: 'Segment', logo: 'https://cdn.simpleicons.org/segment', category: 'data', available: false, color: '#52BD94', desc: t('integDescSegment'), features: [t('integFeatEvents'), t('integFeatHealthData')], configType: 'crm', voted: false },
  { key: 'freshdesk', name: 'Freshdesk', logo: 'https://cdn.simpleicons.org/freshdesk', category: 'chat', available: false, color: '#2CA01C', desc: t('integDescFreshdesk'), features: [t('integFeatTickets'), t('integFeatAutoSync')], configType: 'crm', voted: false },
  { key: 'crisp', name: 'Crisp', logo: 'https://cdn.simpleicons.org/crisp', category: 'chat', available: false, color: '#1972F5', desc: t('integDescCrisp'), features: [t('integFeatLiveChat'), t('integFeatConversations')], configType: 'chat', voted: false },
])

const availableIntegrations = computed(() => integrationsList.value.filter(i => i.available))
const comingSoonIntegrations = computed(() => integrationsList.value.filter(i => !i.available))
const connectedIntegrations = computed(() => integrationsList.value.filter(i => connectedKeys.value.has(i.key)))

const filteredAvailable = computed(() => {
  if (activeCategory.value === 'all') return availableIntegrations.value
  return availableIntegrations.value.filter(i => i.category === activeCategory.value)
})

const filteredComingSoon = computed(() => {
  if (activeCategory.value === 'all') return comingSoonIntegrations.value
  return comingSoonIntegrations.value.filter(i => i.category === activeCategory.value)
})

function getCategoryCount(key) {
  if (key === 'all') return integrationsList.value.length
  return integrationsList.value.filter(i => i.category === key).length
}

function openConnectModal(integ) {
  connectSuccess.value = false
  connectError.value = ''
  oauthLoading.value = false
  // Always reset first, then apply existing config if editing
  resetForm()
  const existingConfig = connectedConfigs.value[integ.key]
  if (existingConfig) {
    Object.assign(configForm, existingConfig)
  }
  // Set OAuth email if already connected
  if (isOAuthIntegration(integ.key) && existingConfig?.email) {
    oauthEmail.value = existingConfig.email
  } else {
    oauthEmail.value = ''
  }
  connectModal.value = integ
}

function resetForm() {
  Object.assign(configForm, {
    provider: '', email: '', syncIncoming: true, syncOutgoing: false,
    apiKey: '', syncFreq: 'daily', autoSync: true,
    webhookUrl: '', channel: '',
    notifChurn: true, notifWellbeing: true, notifRenewal: true,
    meetingEmail: '', autoCreateMeeting: false, syncCalendar: true,
    projectKey: '', syncTasks: true, instanceUrl: '', domain: '',
    phoneNumberId: '', recipientPhone: '', databaseId: '',
  })
}

function voteIntegration(integ) {
  integ.voted = true
  try {
    const votes = JSON.parse(localStorage.getItem('scalyo_integ_votes') || '[]')
    if (!votes.includes(integ.key)) { votes.push(integ.key); localStorage.setItem('scalyo_integ_votes', JSON.stringify(votes)) }
  } catch {}
}

// Store configs from server
const connectedConfigs = ref({})

const loadError = ref('')

async function loadConnectedIntegrations() {
  loadError.value = ''
  try {
    const res = await integrationsApi.list()
    const data = res.data || res
    const keys = new Set()
    const configs = {}
    const syncs = {}
    for (const item of data) {
      keys.add(item.integration_key)
      configs[item.integration_key] = item.config || {}
      if (item.syncStatus) {
        syncs[item.integration_key] = {
          syncStatus: item.syncStatus,
          syncDetails: item.syncDetails || {},
          lastSyncAt: item.lastSyncAt,
        }
      }
    }
    connectedKeys.value = keys
    connectedConfigs.value = configs
    syncStatus.value = syncs
  } catch (err) {
    loadError.value = err.response?.data?.error || err.message || 'Failed to load integrations'
  }
}


function validateConfig(type, integKey) {
  // OAuth integrations are validated by the OAuth flow, not the form
  if (isOAuthIntegration(integKey)) return true
  switch (type) {
    case 'email':
      return configForm.provider && configForm.email
    case 'crm':
      return configForm.apiKey
    case 'chat':
      return configForm.webhookUrl
    case 'meeting':
      return configForm.apiKey || configForm.meetingEmail
    case 'project':
      return configForm.apiKey && configForm.projectKey
    default:
      return configForm.apiKey
  }
}

const connectError = ref('')

async function saveConnection() {
  connectError.value = ''

  if (!validateConfig(connectModal.value.configType, connectModal.value.key)) {
    connectError.value = t('integErrorRequired')
    return
  }

  saving.value = true
  try {
    const config = getConfigForType(connectModal.value.configType, connectModal.value.key)
    await integrationsApi.connect(connectModal.value.key, config)
    connectedKeys.value = new Set([...connectedKeys.value, connectModal.value.key])
    connectedConfigs.value[connectModal.value.key] = config
    connectSuccess.value = true
    setTimeout(() => { connectModal.value = null }, 1200)
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unknown error'
    connectError.value = t('integErrorConnect') + ' ' + msg
  } finally {
    saving.value = false
  }
}

async function disconnectIntegration(integ) {
  try {
    await integrationsApi.disconnect(integ.key)
    const newKeys = new Set(connectedKeys.value)
    newKeys.delete(integ.key)
    connectedKeys.value = newKeys
    delete connectedConfigs.value[integ.key]
  } catch (err) {
    loadError.value = err.response?.data?.error || err.message || 'Failed to disconnect'
  }
}

// Handle connect: OAuth redirect or open modal
function handleConnect(integ) {
  if (isOAuthIntegration(integ.key)) {
    openConnectModal(integ)
  } else {
    openConnectModal(integ)
  }
}

// Test an integration connection
async function testIntegration(integ) {
  testing.value = integ.key
  loadError.value = ''
  try {
    const config = connectedConfigs.value[integ.key] || {}
    const res = await integrationsApi.test(integ.key, config)
    const data = res.data || res
    loadError.value = ''
    // Show brief success in syncStatus
    syncStatus.value[integ.key] = { syncStatus: 'success', lastSyncAt: new Date().toISOString(), syncDetails: { message: data.message } }
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Test failed'
    syncStatus.value[integ.key] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
  } finally {
    testing.value = null
  }
}

// Sync data from integration
async function syncIntegration(integ) {
  syncing.value = integ.key
  loadError.value = ''
  try {
    const res = await integrationsApi.sync(integ.key)
    const data = res.data || res
    syncStatus.value[integ.key] = { syncStatus: 'success', lastSyncAt: new Date().toISOString(), syncDetails: data }
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Sync failed'
    syncStatus.value[integ.key] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
  } finally {
    syncing.value = null
  }
}

// Start OAuth flow
async function startOAuth(integKey) {
  oauthLoading.value = true
  connectError.value = ''
  try {
    const provider = OAUTH_KEYS[integKey]
    if (!provider) {
      connectError.value = `No OAuth provider for: ${integKey}`
      oauthLoading.value = false
      return
    }
    const res = await integrationsApi.getOAuthUrl(provider)
    const data = res.data || res
    if (data.authUrl) {
      window.location.href = data.authUrl
    } else {
      connectError.value = data.error || 'No auth URL returned from server'
      oauthLoading.value = false
    }
  } catch (err) {
    console.error('[OAuth] Error:', err)
    connectError.value = err.response?.data?.error || err.message || 'OAuth authorization failed'
    oauthLoading.value = false
  }
}

// Handle OAuth return (query params)
function handleOAuthReturn() {
  const params = route.query
  if (params.oauth === 'success') {
    oauthEmail.value = params.email || ''
    // Refresh integrations list
    loadConnectedIntegrations()
  } else if (params.oauth === 'error') {
    loadError.value = params.message || 'OAuth failed'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getConfigForType(type, integKey) {
  if (isOAuthIntegration(integKey)) {
    if (type === 'email') return { syncIncoming: configForm.syncIncoming, syncOutgoing: configForm.syncOutgoing }
    if (type === 'meeting') return { autoCreateMeeting: configForm.autoCreateMeeting, syncCalendar: configForm.syncCalendar }
    return {}
  }
  switch (type) {
    case 'email':
      return { provider: configForm.provider, email: configForm.email, syncIncoming: configForm.syncIncoming, syncOutgoing: configForm.syncOutgoing }
    case 'crm':
      return { apiKey: configForm.apiKey, syncFreq: configForm.syncFreq, autoSync: configForm.autoSync, ...(configForm.instanceUrl ? { instanceUrl: configForm.instanceUrl } : {}) }
    case 'chat':
      return { webhookUrl: configForm.webhookUrl, channel: configForm.channel, notifChurn: configForm.notifChurn, notifWellbeing: configForm.notifWellbeing, notifRenewal: configForm.notifRenewal }
    case 'meeting':
      return { ...(configForm.apiKey ? { apiKey: configForm.apiKey } : {}), meetingEmail: configForm.meetingEmail, autoCreateMeeting: configForm.autoCreateMeeting, syncCalendar: configForm.syncCalendar }
    case 'project':
      return { apiKey: configForm.apiKey, projectKey: configForm.projectKey, syncTasks: configForm.syncTasks, ...(configForm.domain ? { domain: configForm.domain } : {}) }
    default:
      return { apiKey: configForm.apiKey }
  }
}

onMounted(() => {
  loadConnectedIntegrations()
  handleOAuthReturn()
  // Restore votes from localStorage
  try {
    const votes = JSON.parse(localStorage.getItem('scalyo_integ_votes') || '[]')
    for (const integ of integrationsList.value) {
      if (votes.includes(integ.key)) integ.voted = true
    }
  } catch {}
})
</script>

<style scoped>
.integ-tabs {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.integ-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer;
  transition: all 0.15s;
}
.integ-tab:hover { border-color: var(--teal); color: var(--text); }
.integ-tab.active { background: var(--tealBg); border-color: var(--teal); color: var(--teal); }
.integ-tab-icon { font-size: 15px; }
.integ-tab-count {
  font-size: 10px; font-weight: 700;
  background: var(--border); color: var(--muted);
  padding: 1px 6px; border-radius: 100px;
}
.integ-tab.active .integ-tab-count { background: var(--teal); color: #fff; }

.integ-section-title {
  font-weight: 700; font-size: 14px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.integ-dot { width: 8px; height: 8px; border-radius: 50%; }
.integ-dot-green { background: var(--green); }
.integ-dot-amber { background: var(--amber); }
.integ-dot-teal { background: var(--teal); }

.integ-connected-summary {
  padding: 14px;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.integ-connected-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.integ-connected-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 100px;
  background: var(--tealBg); border: 1px solid var(--teal);
  color: var(--teal); font-size: 12px; font-weight: 600;
}
.integ-disconnect-x {
  background: none; border: none; color: var(--muted);
  font-size: 16px; cursor: pointer; padding: 0 0 0 4px; line-height: 1;
}
.integ-disconnect-x:hover { color: var(--red); }

.integ-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;
}

.integ-card-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
}
.integ-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center; flex-shrink: 0;
  background: var(--surface);
}
.integ-card-icon { font-size: 22px; }
.integ-card-logo { width: 24px; height: 24px; object-fit: contain; }
.integ-card-desc {
  font-size: 12px; color: var(--muted); line-height: 1.6; margin-bottom: 10px;
}
.integ-card-features {
  display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;
}
.integ-feature-tag {
  font-size: 10px; font-weight: 600; padding: 2px 8px;
  border-radius: 100px; background: var(--surface);
  border: 1px solid var(--border); color: var(--muted);
}
.integ-connect-btn { font-size: 12px; padding: 8px 16px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; }
.integ-vote-btn { margin-top: 0; font-size: 11px; padding: 6px 14px; width: 100%; }
.integ-voted-label { font-size: 11px; color: var(--teal); font-weight: 600; display: block; text-align: center; }

.integ-empty { text-align: center; padding: 40px; }

/* Modal */
.integ-modal-body { }
.integ-modal-icon-row { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.integ-config { display: flex; flex-direction: column; gap: 10px; }
.integ-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 4px; }
.integ-input {
  width: 100%; padding: 10px 14px; border-radius: 8px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text); font-size: 14px; font-family: inherit;
  transition: border 0.15s;
}
.integ-input:focus { outline: none; border-color: var(--teal); }

.integ-provider-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.integ-provider-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 8px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--border);
  cursor: pointer; transition: all 0.15s; color: var(--text);
}
.integ-provider-btn:hover { border-color: var(--teal); }
.integ-provider-btn.selected { border-color: var(--teal); background: var(--tealBg); }

.integ-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 0;
}
.integ-toggle {
  width: 40px; height: 22px; border-radius: 11px;
  background: var(--border); border: none;
  position: relative; cursor: pointer; transition: background 0.2s;
}
.integ-toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.integ-toggle.on { background: var(--teal); }
.integ-toggle.on::after { transform: translateX(18px); }

.integ-sync-status {
  font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px;
  margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;
}
.integ-sync-success { background: var(--greenBg, #f0fdf4); color: var(--green); border: 1px solid var(--greenBorder, #bbf7d0); }
.integ-sync-error { background: var(--redBg, #fef2f2); color: var(--red); border: 1px solid var(--redBorder, #fecaca); }

.integ-oauth-connected {
  padding: 12px; border-radius: 8px;
  background: var(--greenBg, #f0fdf4); border: 1px solid var(--greenBorder, #bbf7d0);
  display: flex; flex-direction: column; gap: 4px; text-align: center;
}

.integ-error {
  margin-top: 12px; padding: 10px; border-radius: 8px;
  background: var(--redBg, #fef2f2); border: 1px solid var(--redBorder, #fecaca);
  color: var(--red); font-size: 13px; font-weight: 600; text-align: center;
}
.integ-error-banner {
  padding: 12px 16px; border-radius: 10px;
  background: var(--redBg, #fef2f2); border: 1px solid var(--redBorder, #fecaca);
  color: var(--red); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: space-between;
}
.integ-error-retry {
  background: none; border: 1px solid var(--red); color: var(--red);
  padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  cursor: pointer;
}
.integ-success {
  margin-top: 12px; padding: 10px; border-radius: 8px;
  background: var(--greenBg); border: 1px solid var(--greenBorder);
  color: var(--green); font-size: 13px; font-weight: 600; text-align: center;
}

@media (max-width: 768px) {
  .integ-tabs { gap: 4px; }
  .integ-tab { padding: 6px 10px; font-size: 12px; }
  .integ-tab-icon { font-size: 13px; }
  .integ-grid { grid-template-columns: 1fr; }
  .integ-provider-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
