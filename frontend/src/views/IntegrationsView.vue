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
  apiKey: '',
  email: '',
  domain: '',
  webhookUrl: '',
  channel: '',
})

// ── Integrations list ──────────────────────────────────
const integrations = [
  // CRM — importent les contacts dans le portefeuille
  { key: 'hubspot', name: 'HubSpot', icon: '🟠', color: '#FF7A59', available: true,
    desc: 'Importe automatiquement vos contacts et deals dans le portefeuille.',
    fields: [
      { key: 'apiKey', label: 'Cle d\'acces HubSpot', type: 'password', placeholder: 'pat-na1-xxxxxxxx-xxxx-xxxx...',
        hint: 'Connectez-vous a HubSpot → Parametres (roue dentee en haut a droite) → Integrations → Applications privees → Creer une application privee → Donnez un nom (ex: Scalyo) → Onglet "Portees" : cochez CRM (contacts, entreprises, transactions) → Creer → Copiez le token et collez-le ici.' },
    ]},
  { key: 'pipedrive', name: 'Pipedrive', icon: '🟢', color: '#25C16F', available: true,
    desc: 'Importe vos contacts et deals dans le portefeuille.',
    fields: [
      { key: 'apiKey', label: 'Token API Pipedrive', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Connectez-vous a Pipedrive → Cliquez sur votre avatar en haut a droite → Parametres personnels → API → Copiez votre "Token API personnel" et collez-le ici.' },
    ]},
  { key: 'intercom', name: 'Intercom', icon: '💬', color: '#286EFA', available: true,
    desc: 'Importe vos contacts et conversations dans le portefeuille.',
    fields: [
      { key: 'apiKey', label: 'Token d\'acces Intercom', type: 'password', placeholder: 'dG9rOmxxxxxxxxxxxxxxxx',
        hint: 'Connectez-vous a Intercom → Parametres → Integrations → Developer Hub → Nouvelle application → Authentification → Copiez l\'Access Token et collez-le ici.' },
    ]},

  // Support — importent les tickets
  { key: 'zendesk', name: 'Zendesk', icon: '🎫', color: '#17A2B8', available: true,
    desc: 'Importe vos tickets de support et contacts clients.',
    fields: [
      { key: 'email', label: 'Email de votre compte Zendesk', type: 'email', placeholder: 'vous@entreprise.com' },
      { key: 'apiKey', label: 'Token API Zendesk', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Connectez-vous a Zendesk → Admin (roue dentee) → Canaux → API → Activez "Acces par token" → Ajoutez un token → Copiez-le et collez-le ici.' },
      { key: 'domain', label: 'Nom de votre espace Zendesk', type: 'text', placeholder: 'votre-entreprise',
        hint: 'C\'est le debut de votre adresse : votre-entreprise.zendesk.com' },
    ]},
  { key: 'jira', name: 'Jira', icon: '🔷', color: '#0052CC', available: true,
    desc: 'Importe vos tickets et taches dans le Task Board.',
    fields: [
      { key: 'email', label: 'Email de votre compte Atlassian', type: 'email', placeholder: 'vous@entreprise.com' },
      { key: 'apiKey', label: 'Token API Atlassian', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Allez sur id.atlassian.com → Securite → Tokens API → Creer un token API → Copiez-le et collez-le ici.' },
      { key: 'domain', label: 'Nom de votre espace Jira', type: 'text', placeholder: 'votre-entreprise',
        hint: 'C\'est le debut de votre adresse : votre-entreprise.atlassian.net' },
    ]},

  // Productivite — synchronisent les taches
  { key: 'notion', name: 'Notion', icon: '📝', color: '#787878', available: true,
    desc: 'Importe vos bases de donnees et pages dans Scalyo.',
    fields: [
      { key: 'apiKey', label: 'Cle d\'integration Notion', type: 'password', placeholder: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Allez sur notion.so/my-integrations → Nouvelle integration → Donnez un nom (ex: Scalyo) → Validez → Copiez le "Secret interne" et collez-le ici. Ensuite, dans Notion, ouvrez la page ou base a synchroniser → ... → Connexions → Ajoutez votre integration.' },
    ]},
  { key: 'asana', name: 'Asana', icon: '🔶', color: '#F06A6A', available: true,
    desc: 'Importe vos taches et projets dans le Task Board.',
    fields: [
      { key: 'apiKey', label: 'Token d\'acces personnel Asana', type: 'password', placeholder: '1/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Connectez-vous a Asana → Cliquez sur votre photo de profil → Parametres du profil → Applications → Tokens d\'acces personnel → Creer un token → Copiez-le et collez-le ici.' },
    ]},

  // Calendrier
  { key: 'calendly', name: 'Calendly', icon: '📅', color: '#006BFF', available: true,
    desc: 'Importe vos rendez-vous dans le planning.',
    fields: [
      { key: 'apiKey', label: 'Token d\'acces personnel Calendly', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiJ9...',
        hint: 'Connectez-vous a Calendly → Integrations → API et Webhooks → Generer un nouveau token → Copiez-le et collez-le ici.' },
    ]},

  // Notifications — envoient des alertes
  { key: 'slack', name: 'Slack', icon: '💜', color: '#4A154B', available: true,
    desc: 'Recevez des alertes quand un compte client est en danger.',
    fields: [
      { key: 'webhookUrl', label: 'Lien de notification Slack', type: 'url', placeholder: 'https://hooks.slack.com/services/...',
        hint: 'Dans Slack : Administration → Applications → Cherchez "Incoming Webhooks" → Activez-le → Ajoutez un webhook pour un canal (ex: #alertes-clients) → Copiez le lien et collez-le ici.' },
      { key: 'channel', label: 'Nom du canal (optionnel)', type: 'text', placeholder: '#alertes-clients', optional: true },
    ]},
  { key: 'teams', name: 'Microsoft Teams', icon: '🟦', color: '#5B5FC7', available: true,
    desc: 'Recevez des alertes quand un compte client est en danger.',
    fields: [
      { key: 'webhookUrl', label: 'Lien de notification Teams', type: 'url', placeholder: 'https://...webhook.office.com/...',
        hint: 'Dans Teams : clic droit sur un canal → Connecteurs → Incoming Webhook → Donnez un nom (ex: Scalyo) → Creer → Copiez le lien et collez-le ici.' },
      { key: 'channel', label: 'Nom du canal (optionnel)', type: 'text', placeholder: '#alertes-clients', optional: true },
    ]},
]

const connectedList = computed(() => integrations.filter(i => connectedKeys.value.has(i.key)))
const availableList = computed(() => integrations.filter(i => i.available && !connectedKeys.value.has(i.key)))

function resetForm() {
  Object.assign(configForm, { apiKey: '', email: '', domain: '', webhookUrl: '', channel: '' })
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

    // Auto-test then auto-sync
    try {
      await integrationsApi.test(integKey, config)
      // Test passed — now sync data
      try {
        const syncRes = await integrationsApi.sync(integKey)
        const syncData = syncRes.data || syncRes
        syncStatus.value[integKey] = { syncStatus: 'success', lastSyncAt: new Date().toISOString(), syncDetails: syncData }
      } catch (syncErr) {
        const msg = syncErr.response?.data?.error || syncErr.message || 'Sync echoue'
        syncStatus.value[integKey] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
      }
    } catch (testErr) {
      const msg = testErr.response?.data?.error || testErr.message || 'Test echoue'
      syncStatus.value[integKey] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
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
    const res = await integrationsApi.sync(integ.key)
    const data = res.data || res
    syncStatus.value[integ.key] = { syncStatus: 'success', lastSyncAt: new Date().toISOString(), syncDetails: data }
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
