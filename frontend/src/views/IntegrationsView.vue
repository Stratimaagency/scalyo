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

    <!-- Connected integrations -->
    <div v-if="connectedList.length" class="mb-lg">
      <h4 class="integ-section-title">
        <span class="integ-dot integ-dot-teal"></span>
        {{ t('integConnected') }} ({{ connectedList.length }})
      </h4>
      <div class="integ-grid">
        <AppCard v-for="integ in connectedList" :key="integ.key" class="integ-card">
          <div class="integ-card-header">
            <div class="integ-icon-wrap" :style="{ background: integ.color + '15', border: '1px solid ' + integ.color + '30' }">
              <span class="integ-card-icon">{{ integ.icon }}</span>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
              <span class="tag risk-low" style="font-size: 10px; padding: 2px 8px;">{{ t('integConnected') }}</span>
            </div>
          </div>
          <div v-if="syncStatus[integ.key]" class="integ-sync-status" :class="'integ-sync-' + syncStatus[integ.key].syncStatus">
            <span v-if="syncStatus[integ.key].syncStatus === 'success'">{{ t('integSyncOk') }}</span>
            <span v-else>{{ t('integSyncError') }}</span>
            <span v-if="syncStatus[integ.key].lastSyncAt" style="font-size: 10px; opacity: 0.7;">{{ formatDate(syncStatus[integ.key].lastSyncAt) }}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary integ-btn" style="flex: 1;" @click="testIntegration(integ)" :disabled="testing === integ.key">
              {{ testing === integ.key ? '...' : t('integTest') }}
            </button>
            <button class="btn btn-primary integ-btn" style="flex: 1;" @click="syncIntegration(integ)" :disabled="syncing === integ.key">
              {{ syncing === integ.key ? '...' : t('integSync') }}
            </button>
            <button class="btn btn-secondary integ-btn" style="flex: 0;" @click="openModal(integ)">
              <ScalyoIcon name="settings" :size="12" />
            </button>
            <button class="btn btn-secondary integ-btn" style="flex: 0; color: var(--red);" @click="disconnectIntegration(integ)">
              <ScalyoIcon name="x" :size="12" />
            </button>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Available integrations -->
    <div v-if="availableList.length" class="mb-lg">
      <h4 class="integ-section-title">
        <span class="integ-dot integ-dot-green"></span>
        {{ t('integrationsAvailable') }}
      </h4>
      <div class="integ-grid">
        <AppCard v-for="integ in availableList" :key="integ.key" class="card-lift integ-card">
          <div class="integ-card-header">
            <div class="integ-icon-wrap" :style="{ background: integ.color + '15', border: '1px solid ' + integ.color + '30' }">
              <span class="integ-card-icon">{{ integ.icon }}</span>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
            </div>
          </div>
          <p class="integ-card-desc">{{ integ.desc }}</p>
          <button class="btn btn-primary integ-btn" @click="openModal(integ)">
            <ScalyoIcon name="bolt" :size="12" /> {{ t('integConnect') }}
          </button>
        </AppCard>
      </div>
    </div>

    <!-- Request -->
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
    <AppModal v-if="modal" :title="'Connecter ' + modal.name" @close="modal = null">
      <div class="integ-modal-body">
        <div class="integ-modal-icon-row">
          <span style="font-size: 40px;">{{ modal.icon }}</span>
          <div>
            <div style="font-weight: 700; font-size: 16px;">{{ modal.name }}</div>
            <p style="font-size: 13px; color: var(--muted);">{{ modal.desc }}</p>
          </div>
        </div>

        <div v-if="connectError" class="integ-error" style="margin-bottom: 12px;">{{ connectError }}</div>

        <div class="integ-config">
          <template v-for="field in modal.fields" :key="field.key">
            <label class="integ-label">{{ field.label }}</label>
            <input
              v-model="configForm[field.key]"
              :type="field.type || 'text'"
              class="integ-input"
              :placeholder="field.placeholder"
            />
            <span v-if="field.hint" class="integ-hint">{{ field.hint }}</span>
          </template>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" @click="saveConnection" :disabled="saving">
            {{ saving ? '...' : 'Connecter' }}
          </button>
          <button class="btn btn-secondary" @click="modal = null">Annuler</button>
        </div>

        <div v-if="connectSuccess" class="integ-success">Connecte avec succes !</div>
      </div>
    </AppModal>
  </div>
  </PlanGate>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from '../i18n'
import { integrationsApi } from '../api'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'
import PlanGate from '../components/PlanGate.vue'

const { t } = useI18n()

const modal = ref(null)
const saving = ref(false)
const connectSuccess = ref(false)
const connectError = ref('')
const connectedKeys = ref(new Set())
const connectedConfigs = ref({})
const testing = ref(null)
const syncing = ref(null)
const syncStatus = ref({})
const loadError = ref('')

const configForm = reactive({
  email: '',
  password: '',
  webhookUrl: '',
  channel: '',
  phone: '',
  domain: '',
})

// ── Integrations list ──────────────────────────────────
// Each integration only asks for what the USER knows (no tokens, no dev stuff)
const integrations = [
  // Email
  { key: 'gmail', name: 'Gmail', icon: '📧', color: '#EA4335', available: true,
    desc: 'Recevez et envoyez vos emails clients directement depuis Scalyo.',
    fields: [
      { key: 'email', label: 'Votre adresse Gmail', type: 'email', placeholder: 'vous@gmail.com' },
      { key: 'password', label: 'Mot de passe d\'application', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx',
        hint: 'Ce n\'est pas votre mot de passe habituel. Allez sur myaccount.google.com > Securite > "Mots de passe des applications" > Creez-en un et collez-le ici.' },
    ]},
  { key: 'outlook', name: 'Outlook / Office 365', icon: '📬', color: '#0078D4', available: true,
    desc: 'Recevez et envoyez vos emails clients depuis votre compte Outlook.',
    fields: [
      { key: 'email', label: 'Votre adresse Outlook', type: 'email', placeholder: 'vous@outlook.com' },
      { key: 'password', label: 'Mot de passe d\'application', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx',
        hint: 'Allez sur account.microsoft.com > Securite > "Mots de passe des applications" > Creez-en un et collez-le ici.' },
    ]},

  // Notifications
  { key: 'slack', name: 'Slack', icon: '💜', color: '#4A154B', available: true,
    desc: 'Recevez vos alertes clients dans votre canal Slack prefere.',
    fields: [
      { key: 'webhookUrl', label: 'Lien de notification Slack', type: 'url', placeholder: 'https://hooks.slack.com/services/...',
        hint: 'Dans Slack : allez dans "Administration" > "Applications" > cherchez "Incoming Webhooks" > activez-le > copiez le lien et collez-le ici.' },
      { key: 'channel', label: 'Nom du canal (optionnel)', type: 'text', placeholder: '#alertes-clients', optional: true },
    ]},
  { key: 'teams', name: 'Microsoft Teams', icon: '🟦', color: '#5B5FC7', available: true,
    desc: 'Recevez vos alertes clients dans votre canal Teams prefere.',
    fields: [
      { key: 'webhookUrl', label: 'Lien de notification Teams', type: 'url', placeholder: 'https://...webhook.office.com/...',
        hint: 'Dans Teams : clic droit sur un canal > "Connecteurs" > "Incoming Webhook" > donnez un nom > copiez le lien et collez-le ici.' },
      { key: 'channel', label: 'Nom du canal (optionnel)', type: 'text', placeholder: '#alertes-clients', optional: true },
    ]},

  // WhatsApp
  { key: 'whatsapp', name: 'WhatsApp Business', icon: '💚', color: '#25D366', available: true,
    desc: 'Envoyez des messages a vos clients via WhatsApp.',
    fields: [
      { key: 'phone', label: 'Votre numero WhatsApp', type: 'tel', placeholder: '+33 6 12 34 56 78',
        hint: 'Le numero de telephone lie a votre compte WhatsApp Business.' },
    ]},

  // CRM
  { key: 'hubspot', name: 'HubSpot', icon: '🟠', color: '#FF7A59', available: true,
    desc: 'Synchronisez vos contacts et vos affaires depuis HubSpot.',
    fields: [
      { key: 'email', label: 'Email de connexion HubSpot', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a HubSpot.' },
      { key: 'password', label: 'Mot de passe HubSpot', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
  { key: 'salesforce', name: 'Salesforce', icon: '☁️', color: '#00A1E0', available: true,
    desc: 'Synchronisez vos contacts et opportunites depuis Salesforce.',
    fields: [
      { key: 'email', label: 'Email de connexion Salesforce', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Salesforce.' },
      { key: 'password', label: 'Mot de passe Salesforce', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
  { key: 'pipedrive', name: 'Pipedrive', icon: '🟢', color: '#25C16F', available: true,
    desc: 'Synchronisez vos contacts et vos affaires depuis Pipedrive.',
    fields: [
      { key: 'email', label: 'Email de connexion Pipedrive', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Pipedrive.' },
      { key: 'password', label: 'Mot de passe Pipedrive', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
  { key: 'intercom', name: 'Intercom', icon: '💬', color: '#286EFA', available: true,
    desc: 'Synchronisez vos conversations clients depuis Intercom.',
    fields: [
      { key: 'email', label: 'Email de connexion Intercom', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Intercom.' },
      { key: 'password', label: 'Mot de passe Intercom', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
  { key: 'zendesk', name: 'Zendesk', icon: '🎫', color: '#17A2B8', available: true,
    desc: 'Synchronisez vos tickets de support depuis Zendesk.',
    fields: [
      { key: 'email', label: 'Email de connexion Zendesk', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Zendesk.' },
      { key: 'password', label: 'Mot de passe Zendesk', type: 'password', placeholder: 'Votre mot de passe' },
      { key: 'domain', label: 'Nom de votre espace Zendesk', type: 'text', placeholder: 'votre-entreprise',
        hint: 'C\'est le debut de votre adresse Zendesk : votre-entreprise.zendesk.com' },
    ]},

  // Gestion de projet
  { key: 'jira', name: 'Jira', icon: '🔷', color: '#0052CC', available: true,
    desc: 'Synchronisez vos taches et tickets depuis Jira.',
    fields: [
      { key: 'email', label: 'Email de connexion Atlassian', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Jira / Atlassian.' },
      { key: 'password', label: 'Mot de passe Atlassian', type: 'password', placeholder: 'Votre mot de passe' },
      { key: 'domain', label: 'Nom de votre espace Jira', type: 'text', placeholder: 'votre-entreprise',
        hint: 'C\'est le debut de votre adresse Jira : votre-entreprise.atlassian.net' },
    ]},
  { key: 'notion', name: 'Notion', icon: '📝', color: '#787878', available: true,
    desc: 'Synchronisez vos bases de donnees et pages Notion.',
    fields: [
      { key: 'email', label: 'Email de connexion Notion', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Notion.' },
      { key: 'password', label: 'Mot de passe Notion', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
  { key: 'asana', name: 'Asana', icon: '🔶', color: '#F06A6A', available: true,
    desc: 'Synchronisez vos taches et projets depuis Asana.',
    fields: [
      { key: 'email', label: 'Email de connexion Asana', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Asana.' },
      { key: 'password', label: 'Mot de passe Asana', type: 'password', placeholder: 'Votre mot de passe' },
    ]},

  // Visioconference
  { key: 'google-meet', name: 'Google Meet', icon: '🎥', color: '#00897B', available: true,
    desc: 'Planifiez et gerez vos appels video Google Meet.',
    fields: [
      { key: 'email', label: 'Votre adresse Gmail', type: 'email', placeholder: 'vous@gmail.com',
        hint: 'L\'email Google que vous utilisez pour vos reunions Meet.' },
      { key: 'password', label: 'Mot de passe d\'application', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx',
        hint: 'Meme mot de passe d\'application que pour Gmail (myaccount.google.com > Securite).' },
    ]},
  { key: 'zoom', name: 'Zoom', icon: '📹', color: '#2D8CFF', available: true,
    desc: 'Planifiez et gerez vos appels video Zoom.',
    fields: [
      { key: 'email', label: 'Email de connexion Zoom', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Zoom.' },
      { key: 'password', label: 'Mot de passe Zoom', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
  { key: 'calendly', name: 'Calendly', icon: '📅', color: '#006BFF', available: true,
    desc: 'Synchronisez vos rendez-vous et creneaux Calendly.',
    fields: [
      { key: 'email', label: 'Email de connexion Calendly', type: 'email', placeholder: 'vous@entreprise.com',
        hint: 'L\'email que vous utilisez pour vous connecter a Calendly.' },
      { key: 'password', label: 'Mot de passe Calendly', type: 'password', placeholder: 'Votre mot de passe' },
    ]},
]

const connectedList = computed(() => integrations.filter(i => connectedKeys.value.has(i.key)))
const availableList = computed(() => integrations.filter(i => i.available && !connectedKeys.value.has(i.key)))

function resetForm() {
  Object.assign(configForm, { email: '', password: '', webhookUrl: '', channel: '', phone: '', domain: '' })
}

function openModal(integ) {
  connectSuccess.value = false
  connectError.value = ''
  resetForm()
  const existing = connectedConfigs.value[integ.key]
  if (existing) Object.assign(configForm, existing)
  modal.value = integ
}

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
    loadError.value = err.response?.data?.error || err.message || 'Erreur de chargement'
  }
}

function getConfig(integ) {
  const config = {}
  for (const field of integ.fields) {
    if (configForm[field.key]) config[field.key] = configForm[field.key]
  }
  return config
}

function isFormValid(integ) {
  return integ.fields.filter(f => !f.optional).every(f => configForm[f.key])
}

async function saveConnection() {
  connectError.value = ''
  connectSuccess.value = false

  if (!isFormValid(modal.value)) {
    connectError.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }

  saving.value = true
  const integKey = modal.value.key
  const config = getConfig(modal.value)

  try {
    await integrationsApi.connect(integKey, config)
    connectedKeys.value = new Set([...connectedKeys.value, integKey])
    connectedConfigs.value[integKey] = config

    // Auto-test
    try {
      await integrationsApi.test(integKey, config)
      syncStatus.value[integKey] = { syncStatus: 'success', lastSyncAt: new Date().toISOString() }
    } catch {
      syncStatus.value[integKey] = { syncStatus: 'error', lastSyncAt: new Date().toISOString() }
    }

    connectSuccess.value = true
    setTimeout(() => { modal.value = null }, 800)
  } catch (err) {
    connectError.value = err.response?.data?.error || err.message || 'Erreur'
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
    loadError.value = err.response?.data?.error || err.message || 'Erreur'
  }
}

async function testIntegration(integ) {
  testing.value = integ.key
  try {
    await integrationsApi.test(integ.key, connectedConfigs.value[integ.key] || {})
    syncStatus.value[integ.key] = { syncStatus: 'success', lastSyncAt: new Date().toISOString() }
  } catch {
    syncStatus.value[integ.key] = { syncStatus: 'error', lastSyncAt: new Date().toISOString() }
  } finally {
    testing.value = null
  }
}

async function syncIntegration(integ) {
  syncing.value = integ.key
  try {
    await integrationsApi.sync(integ.key)
    syncStatus.value[integ.key] = { syncStatus: 'success', lastSyncAt: new Date().toISOString() }
  } catch {
    syncStatus.value[integ.key] = { syncStatus: 'error', lastSyncAt: new Date().toISOString() }
  } finally {
    syncing.value = null
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadConnectedIntegrations()
})
</script>

<style scoped>
.integ-section-title {
  font-weight: 700; font-size: 14px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.integ-dot { width: 8px; height: 8px; border-radius: 50%; }
.integ-dot-green { background: var(--green); }
.integ-dot-teal { background: var(--teal); }

.integ-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;
}
.integ-card-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
}
.integ-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center; flex-shrink: 0;
}
.integ-card-icon { font-size: 22px; }
.integ-card-desc {
  font-size: 12px; color: var(--muted); line-height: 1.6; margin-bottom: 12px;
}
.integ-btn {
  font-size: 12px; padding: 8px 16px; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}

.integ-modal-body { }
.integ-modal-icon-row { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.integ-config { display: flex; flex-direction: column; gap: 10px; }
.integ-label {
  font-size: 12px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.04em; margin-top: 4px;
}
.integ-input {
  width: 100%; padding: 10px 14px; border-radius: 8px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text); font-size: 14px; font-family: inherit;
  transition: border 0.15s;
}
.integ-input:focus { outline: none; border-color: var(--teal); }
.integ-hint {
  display: block; font-size: 11px; color: var(--muted);
  margin-top: 2px; margin-bottom: 4px; line-height: 1.4;
}

.integ-sync-status {
  font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px;
  margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;
}
.integ-sync-success { background: var(--greenBg, #f0fdf4); color: var(--green); border: 1px solid var(--greenBorder, #bbf7d0); }
.integ-sync-error { background: var(--redBg, #fef2f2); color: var(--red); border: 1px solid var(--redBorder, #fecaca); }

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
  padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
}
.integ-success {
  margin-top: 12px; padding: 10px; border-radius: 8px;
  background: var(--greenBg); border: 1px solid var(--greenBorder);
  color: var(--green); font-size: 13px; font-weight: 600; text-align: center;
}

@media (max-width: 768px) {
  .integ-grid { grid-template-columns: 1fr; }
}
</style>
