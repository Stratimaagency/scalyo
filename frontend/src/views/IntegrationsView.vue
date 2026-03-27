<template>
  <PlanGate requiredPlan="Growth" moduleName="Integrations">
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
          <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" style="width: 16px; height: 16px;" @error="integ.logo = ''" /><span v-else>{{ integ.icon }}</span> {{ integ.name }}
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
              <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" class="integ-card-logo" @error="integ.logo = ''" /><span v-else class="integ-card-icon">{{ integ.icon }}</span>
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
              <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" class="integ-card-logo" @error="integ.logo = ''" /><span v-else class="integ-card-icon">{{ integ.icon }}</span>
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

        <!-- Config fields — simplified per integration -->

        <!-- Gmail -->
        <div v-if="connectModal.key === 'gmail'" class="integ-config">
          <label class="integ-label">Adresse Gmail</label>
          <input v-model="configForm.email" type="email" class="integ-input" placeholder="team@gmail.com" />
          <label class="integ-label">Mot de passe d'application</label>
          <input v-model="configForm.apiKey" type="password" class="integ-input" placeholder="xxxx xxxx xxxx xxxx" />
          <span class="integ-hint">Google > Compte > Securite > Mots de passe des applications > generer un mot de passe</span>
        </div>

        <!-- Outlook -->
        <div v-else-if="connectModal.key === 'outlook'" class="integ-config">
          <label class="integ-label">Adresse Outlook / Office 365</label>
          <input v-model="configForm.email" type="email" class="integ-input" placeholder="team@outlook.com" />
          <label class="integ-label">Mot de passe d'application</label>
          <input v-model="configForm.apiKey" type="password" class="integ-input" placeholder="xxxx xxxx xxxx xxxx" />
          <span class="integ-hint">Microsoft > Compte > Securite > Mots de passe des applications</span>
        </div>

        <!-- Google Meet -->
        <div v-else-if="connectModal.key === 'google-meet'" class="integ-config">
          <label class="integ-label">Adresse Google</label>
          <input v-model="configForm.email" type="email" class="integ-input" placeholder="team@gmail.com" />
          <label class="integ-label">Mot de passe d'application</label>
          <input v-model="configForm.apiKey" type="password" class="integ-input" placeholder="xxxx xxxx xxxx xxxx" />
          <span class="integ-hint">Meme mot de passe d'application que Gmail</span>
        </div>

        <!-- Import CSV/Excel -->
        <div v-else-if="connectModal.configType === 'import'" class="integ-config">
          <p style="font-size: 13px; color: var(--muted); line-height: 1.6;">
            {{ t('integImportDesc') }}
          </p>
          <router-link :to="{ name: 'portfolio' }" class="btn btn-primary integ-connect-btn" style="text-decoration: none;" @click="connectModal = null">
            {{ t('integImportGoToPortfolio') }}
          </router-link>
        </div>

        <!-- Slack -->
        <div v-else-if="connectModal.key === 'slack'" class="integ-config">
          <label class="integ-label">URL du Webhook Slack</label>
          <input v-model="configForm.webhookUrl" type="url" class="integ-input" placeholder="https://hooks.slack.com/services/..." />
          <span class="integ-hint">Slack > Apps > Incoming Webhooks > copier l'URL</span>
          <label class="integ-label">Channel (optionnel)</label>
          <input v-model="configForm.channel" type="text" class="integ-input" placeholder="#customer-success" />
        </div>

        <!-- Teams -->
        <div v-else-if="connectModal.key === 'teams'" class="integ-config">
          <label class="integ-label">URL du Webhook Teams</label>
          <input v-model="configForm.webhookUrl" type="url" class="integ-input" placeholder="https://...webhook.office.com/..." />
          <span class="integ-hint">Teams > Channel > Connecteurs > Incoming Webhook > copier l'URL</span>
          <label class="integ-label">Channel (optionnel)</label>
          <input v-model="configForm.channel" type="text" class="integ-input" placeholder="#customer-success" />
        </div>

        <!-- HubSpot -->
        <div v-else-if="connectModal.key === 'hubspot'" class="integ-config">
          <label class="integ-label">Token d'acces HubSpot</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="pat-na1-xxxxxxxx..." />
          <span class="integ-hint">HubSpot > Parametres > Integrations > Private Apps > copier le token</span>
        </div>

        <!-- Salesforce -->
        <div v-else-if="connectModal.key === 'salesforce'" class="integ-config">
          <label class="integ-label">Token d'acces Salesforce</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="Bearer token..." />
          <label class="integ-label">URL de votre instance</label>
          <input v-model="configForm.instanceUrl" type="url" class="integ-input" placeholder="https://yourorg.salesforce.com" />
          <span class="integ-hint">Setup > Apps > Connected App > Consumer Key + votre URL Salesforce</span>
        </div>

        <!-- Pipedrive -->
        <div v-else-if="connectModal.key === 'pipedrive'" class="integ-config">
          <label class="integ-label">Token Pipedrive</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          <span class="integ-hint">Pipedrive > Avatar > Parametres > API > copier le token</span>
        </div>

        <!-- Intercom -->
        <div v-else-if="connectModal.key === 'intercom'" class="integ-config">
          <label class="integ-label">Token d'acces Intercom</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="dG9rOjxxxxxxxx..." />
          <span class="integ-hint">Intercom > Settings > Integrations > Developer Hub > Access Token</span>
        </div>

        <!-- WhatsApp -->
        <div v-else-if="connectModal.key === 'whatsapp'" class="integ-config">
          <label class="integ-label">Token WhatsApp Business API</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="EAAxxxxxxxx..." />
          <label class="integ-label">Phone Number ID</label>
          <input v-model="configForm.phoneNumberId" type="text" class="integ-input" placeholder="1234567890" />
          <span class="integ-hint">Meta for Developers > Votre app > WhatsApp > API Setup</span>
        </div>

        <!-- Zendesk -->
        <div v-else-if="connectModal.key === 'zendesk'" class="integ-config">
          <label class="integ-label">Sous-domaine Zendesk</label>
          <input v-model="configForm.domain" type="text" class="integ-input" placeholder="votre-entreprise" />
          <span class="integ-hint">votre-entreprise.zendesk.com</span>
          <label class="integ-label">Email administrateur</label>
          <input v-model="configForm.email" type="email" class="integ-input" placeholder="admin@votre-entreprise.com" />
          <label class="integ-label">Token API</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          <span class="integ-hint">Admin > Apps > APIs > Zendesk API > Add API Token</span>
        </div>

        <!-- Jira -->
        <div v-else-if="connectModal.key === 'jira'" class="integ-config">
          <label class="integ-label">Domaine Atlassian</label>
          <input v-model="configForm.domain" type="text" class="integ-input" placeholder="votre-entreprise" />
          <span class="integ-hint">votre-entreprise.atlassian.net</span>
          <label class="integ-label">Email + Token API</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="email@domain.com:api_token" />
          <span class="integ-hint">id.atlassian.com > Security > API Tokens > Create</span>
          <label class="integ-label">Cle du projet (optionnel)</label>
          <input v-model="configForm.projectKey" type="text" class="integ-input" placeholder="CS-BOARD" />
        </div>

        <!-- Asana -->
        <div v-else-if="connectModal.key === 'asana'" class="integ-config">
          <label class="integ-label">Token personnel Asana</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="1/1234567890:abcdef..." />
          <span class="integ-hint">Asana > Mon profil > Apps > Personal Access Tokens</span>
        </div>

        <!-- Notion -->
        <div v-else-if="connectModal.key === 'notion'" class="integ-config">
          <label class="integ-label">Token d'integration Notion</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxx" />
          <span class="integ-hint">notion.so/my-integrations > New integration > copier le secret</span>
          <label class="integ-label">ID de la base (optionnel)</label>
          <input v-model="configForm.databaseId" type="text" class="integ-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          <span class="integ-hint">Visible dans l'URL de votre base Notion</span>
        </div>

        <!-- Zoom -->
        <div v-else-if="connectModal.key === 'zoom'" class="integ-config">
          <label class="integ-label">Token d'acces Zoom</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="eyJhbGciOiJIUzI..." />
          <span class="integ-hint">marketplace.zoom.us > Server-to-Server OAuth > Access Token</span>
        </div>

        <!-- Calendly -->
        <div v-else-if="connectModal.key === 'calendly'" class="integ-config">
          <label class="integ-label">Token personnel Calendly</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="eyJhbGciOiJIUzI..." />
          <span class="integ-hint">Calendly > Integrations > API & Webhooks > Personal Access Token</span>
        </div>

        <!-- IMAP -->
        <div v-else-if="connectModal.key === 'imap'" class="integ-config">
          <label class="integ-label">Fournisseur</label>
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
          <label class="integ-label">Adresse email</label>
          <input v-model="configForm.email" type="email" class="integ-input" placeholder="team@company.com" />
        </div>

        <!-- Fallback generique -->
        <div v-else class="integ-config">
          <label class="integ-label">Token d'acces</label>
          <input v-model="configForm.apiKey" type="text" class="integ-input" placeholder="Collez votre token ici..." />
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
  </PlanGate>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../i18n'
import { integrationsApi } from '../api'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'
import PlanGate from '../components/PlanGate.vue'

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
  { key: 'gmail', name: 'Gmail', icon: '📧', logo: 'https://cdn.simpleicons.org/gmail/EA4335', category: 'email', available: true, color: '#EA4335', desc: t('integDescGmail'), features: [t('integFeatInbox'), t('integFeatAutoLog'), t('integFeatTemplates')], configType: 'email', voted: false },
  { key: 'outlook', name: 'Outlook / Office 365', icon: '📬', logo: 'https://cdn.simpleicons.org/microsoftoutlook/0078D4', category: 'email', available: true, color: '#0078D4', desc: t('integDescOutlook'), features: [t('integFeatInbox'), t('integFeatCalendar'), t('integFeatContacts')], configType: 'email', voted: false },
  { key: 'imap', name: 'IMAP / SMTP', icon: '📨', category: 'email', available: true, color: '#6B7280', desc: t('integDescImap'), features: [t('integFeatAnyProvider'), t('integFeatSsl')], configType: 'email', voted: false },

  // CRM
  { key: 'hubspot', name: 'HubSpot CRM', icon: '🟠', logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', category: 'crm', available: true, color: '#FF7A59', desc: t('integDescHubspot'), features: [t('integFeatContacts'), t('integFeatDeals'), t('integFeatAutoSync')], configType: 'crm', voted: false },
  { key: 'salesforce', name: 'Salesforce', icon: '☁️', logo: 'https://cdn.simpleicons.org/salesforce/00A1E0', category: 'crm', available: true, color: '#00A1E0', desc: t('integDescSalesforce'), features: [t('integFeatAccounts'), t('integFeatOpportunities'), t('integFeatBiDir')], configType: 'crm', voted: false },
  { key: 'pipedrive', name: 'Pipedrive', icon: '🟢', logo: 'https://cdn.simpleicons.org/pipedrive/25C16F', category: 'crm', available: true, color: '#25C16F', desc: t('integDescPipedrive'), features: [t('integFeatDeals'), t('integFeatContacts'), t('integFeatActivity')], configType: 'crm', voted: false },

  // Chat
  { key: 'slack', name: 'Slack', icon: '💜', logo: 'https://cdn.simpleicons.org/slack/E01E5A', category: 'chat', available: true, color: '#4A154B', desc: t('integDescSlack'), features: [t('integFeatAlerts'), t('integFeatCommands'), t('integFeatChannels')], configType: 'chat', voted: false },
  { key: 'teams', name: 'Microsoft Teams', icon: '🟦', logo: 'https://cdn.simpleicons.org/microsoftteams/6264A7', category: 'chat', available: true, color: '#5B5FC7', desc: t('integDescTeams'), features: [t('integFeatAlerts'), t('integFeatBot'), t('integFeatChannels')], configType: 'chat', voted: false },
  { key: 'intercom', name: 'Intercom', icon: '💬', logo: 'https://cdn.simpleicons.org/intercom/6AFDEF', category: 'chat', available: true, color: '#286EFA', desc: t('integDescIntercom'), features: [t('integFeatConversations'), t('integFeatHealthData'), t('integFeatAutoTag')], configType: 'chat', voted: false },
  { key: 'whatsapp', name: 'WhatsApp Business', icon: '💚', logo: 'https://cdn.simpleicons.org/whatsapp/25D366', category: 'chat', available: true, color: '#25D366', desc: t('integDescWhatsapp'), features: [t('integFeatMessages'), t('integFeatAutoLog')], configType: 'chat', voted: false },
  { key: 'zendesk', name: 'Zendesk', icon: '🎫', logo: 'https://cdn.simpleicons.org/zendesk/17A2B8', category: 'chat', available: true, color: '#17A2B8', desc: t('integDescZendesk'), features: [t('integFeatTickets'), t('integFeatHealthData'), t('integFeatAutoSync')], configType: 'crm', voted: false },

  // Meeting
  { key: 'google-meet', name: 'Google Meet', icon: '🎥', logo: 'https://cdn.simpleicons.org/googlemeet/00897B', category: 'meeting', available: true, color: '#0F9D58', desc: t('integDescGoogleMeet'), features: [t('integFeatAutoLink'), t('integFeatCalSync'), t('integFeatOneClick')], configType: 'meeting', voted: false },
  { key: 'zoom', name: 'Zoom', icon: '📹', logo: 'https://cdn.simpleicons.org/zoom/0B5CFF', category: 'meeting', available: true, color: '#2D8CFF', desc: t('integDescZoom'), features: [t('integFeatAutoLink'), t('integFeatRecording'), t('integFeatSchedule')], configType: 'meeting', voted: false },
  { key: 'calendly', name: 'Calendly', icon: '📅', logo: 'https://cdn.simpleicons.org/calendly/006BFF', category: 'meeting', available: true, color: '#006BFF', desc: t('integDescCalendly'), features: [t('integFeatBooking'), t('integFeatAutoAssign'), t('integFeatReminders')], configType: 'meeting', voted: false },

  // Project
  { key: 'jira', name: 'Jira', icon: '🔷', logo: 'https://cdn.simpleicons.org/jira/0052CC', category: 'project', available: true, color: '#0052CC', desc: t('integDescJira'), features: [t('integFeatTickets'), t('integFeatSyncTasks'), t('integFeatBiDir')], configType: 'project', voted: false },
  { key: 'asana', name: 'Asana', icon: '🔶', logo: 'https://cdn.simpleicons.org/asana/F06A6A', category: 'project', available: true, color: '#F06A6A', desc: t('integDescAsana'), features: [t('integFeatProjects'), t('integFeatSyncTasks'), t('integFeatTimeline')], configType: 'project', voted: false },
  { key: 'notion', name: 'Notion', icon: '📝', logo: 'https://cdn.simpleicons.org/notion/787878', category: 'project', available: true, color: '#787878', desc: t('integDescNotion'), features: [t('integFeatDocs'), t('integFeatSyncTasks')], configType: 'project', voted: false },

  // Coming soon
  { key: 'segment', name: 'Segment', icon: '📊', logo: 'https://cdn.simpleicons.org/segment/52BD94', category: 'data', available: false, color: '#52BD94', desc: t('integDescSegment'), features: [t('integFeatEvents'), t('integFeatHealthData')], configType: 'crm', voted: false },
  { key: 'freshdesk', name: 'Freshdesk', icon: '🎫', logo: 'https://cdn.simpleicons.org/freshdesk/2CA01C', category: 'chat', available: false, color: '#2CA01C', desc: t('integDescFreshdesk'), features: [t('integFeatTickets'), t('integFeatAutoSync')], configType: 'crm', voted: false },
  { key: 'crisp', name: 'Crisp', icon: '💬', logo: 'https://cdn.simpleicons.org/crisp/1972F5', category: 'chat', available: false, color: '#1972F5', desc: t('integDescCrisp'), features: [t('integFeatLiveChat'), t('integFeatConversations')], configType: 'chat', voted: false },
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
  // Always reset first, then apply existing config if editing
  resetForm()
  const existingConfig = connectedConfigs.value[integ.key]
  if (existingConfig) {
    Object.assign(configForm, existingConfig)
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
  // Per-integration validation
  switch (integKey) {
    case 'gmail': case 'outlook': case 'google-meet':
      return configForm.email && configForm.apiKey
    case 'imap':
      return configForm.provider && configForm.email
    case 'slack': case 'teams':
      return configForm.webhookUrl
    case 'whatsapp':
      return configForm.apiKey && configForm.phoneNumberId
    case 'zendesk':
      return configForm.apiKey && configForm.domain && configForm.email
    case 'jira':
      return configForm.apiKey && configForm.domain
    case 'salesforce':
      return configForm.apiKey && configForm.instanceUrl
    case 'notion':
      return configForm.apiKey
    case 'csv': case 'excel':
      return true
    default:
      return configForm.apiKey
  }
}

const connectError = ref('')

async function saveConnection() {
  connectError.value = ''
  connectSuccess.value = false

  if (!validateConfig(connectModal.value.configType, connectModal.value.key)) {
    connectError.value = t('integErrorRequired')
    return
  }

  saving.value = true
  const integKey = connectModal.value.key
  const config = getConfigForType(connectModal.value.configType, integKey)

  try {
    // 1. Save config
    await integrationsApi.connect(integKey, config)
    connectedKeys.value = new Set([...connectedKeys.value, integKey])
    connectedConfigs.value[integKey] = config

    // 2. Auto-test connection
    try {
      await integrationsApi.test(integKey, config)
      syncStatus.value[integKey] = { syncStatus: 'success', lastSyncAt: new Date().toISOString() }
    } catch {
      // Test failed but connection is saved — user can retry
      syncStatus.value[integKey] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: 'Test failed' } }
    }

    // 3. Auto-sync first data (skip for push-only like Slack/Teams and import)
    const pushOnly = ['slack', 'teams', 'csv', 'excel', 'imap']
    if (!pushOnly.includes(integKey)) {
      try {
        await integrationsApi.sync(integKey)
        syncStatus.value[integKey] = { syncStatus: 'success', lastSyncAt: new Date().toISOString() }
      } catch {}
    }

    connectSuccess.value = true
    setTimeout(() => { connectModal.value = null }, 800)
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unknown error'
    connectError.value = msg
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

function handleConnect(integ) {
  openConnectModal(integ)
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

// Handle OAuth return (query params) — kept for backward compatibility
function handleOAuthReturn() {
  const params = route.query
  if (params.oauth === 'success') {
    loadConnectedIntegrations()
  } else if (params.oauth === 'error') {
    loadError.value = params.message || 'Connexion echouee'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getConfigForType(type, integKey) {
  switch (integKey) {
    case 'gmail': case 'outlook': case 'google-meet':
      return { email: configForm.email, apiKey: configForm.apiKey }
    case 'imap':
      return { provider: configForm.provider, email: configForm.email }
    case 'slack': case 'teams':
      return { webhookUrl: configForm.webhookUrl, channel: configForm.channel }
    case 'whatsapp':
      return { apiKey: configForm.apiKey, phoneNumberId: configForm.phoneNumberId }
    case 'hubspot': case 'pipedrive': case 'intercom': case 'asana': case 'zoom': case 'calendly':
      return { apiKey: configForm.apiKey }
    case 'salesforce':
      return { apiKey: configForm.apiKey, instanceUrl: configForm.instanceUrl }
    case 'zendesk':
      return { apiKey: configForm.apiKey, domain: configForm.domain, email: configForm.email }
    case 'jira':
      return { apiKey: configForm.apiKey, domain: configForm.domain, projectKey: configForm.projectKey }
    case 'notion':
      return { apiKey: configForm.apiKey, databaseId: configForm.databaseId }
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

/* Hint text under inputs */
.integ-hint {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  margin-bottom: 4px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .integ-tabs { gap: 4px; }
  .integ-tab { padding: 6px 10px; font-size: 12px; }
  .integ-tab-icon { font-size: 13px; }
  .integ-grid { grid-template-columns: 1fr; }
  .integ-provider-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
