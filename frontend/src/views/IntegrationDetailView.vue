<template>
  <PlanGate requiredPlan="Growth" moduleName="Integrations">
  <div class="fade-in">
    <!-- Header -->
    <div class="id-header">
      <router-link :to="{ name: 'integrations' }" class="id-back">
        <ScalyoIcon name="arrow-left" :size="14" /> Integrations
      </router-link>
      <div class="id-title-row">
        <div class="id-icon-wrap" :style="{ background: integDef?.color + '15', border: '1px solid ' + (integDef?.color || '#888') + '30' }">
          <span style="font-size: 28px;">{{ integDef?.icon || '🔌' }}</span>
        </div>
        <div>
          <h3 style="font-weight: 800; margin: 0;">{{ integDef?.name || key }}</h3>
          <p style="font-size: 13px; color: var(--muted); margin: 2px 0 0;">{{ integDef?.desc || '' }}</p>
        </div>
        <div style="margin-left: auto; display: flex; gap: 8px;">
          <button class="btn btn-secondary" @click="refreshData" :disabled="loading">
            {{ loading ? 'Chargement...' : 'Actualiser' }}
          </button>
          <button class="btn btn-primary" @click="doSync" :disabled="syncing">
            {{ syncing ? 'Synchronisation...' : 'Synchroniser' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="id-error">
      {{ error }}
      <button class="btn btn-secondary" style="margin-left: 8px; font-size: 12px;" @click="refreshData">Réessayer</button>
    </div>

    <!-- Success message -->
    <div v-if="successMsg" class="id-success">{{ successMsg }}</div>

    <!-- Loading -->
    <div v-if="loading && !data" class="id-loading">Chargement des données...</div>

    <!-- Notion: no databases warning -->
    <div v-if="key === 'notion' && data && !data.databases?.length && !loading" class="id-error" style="background: #1e293b; border-color: #334155; color: #94a3b8;">
      <strong style="color: #f59e0b;">Aucune base de données trouvée.</strong><br>
      Pour que Scalyo voie vos données Notion :<br>
      1. Ouvrez la page ou base dans Notion<br>
      2. Cliquez <strong>...</strong> (3 points en haut à droite)<br>
      3. <strong>Connexions</strong> → <strong>Connecter à</strong> → choisissez votre intégration Scalyo<br>
      Puis cliquez "Actualiser" ci-dessus.
    </div>

    <!-- Notion: special databases view -->
    <template v-if="key === 'notion' && data?.databases?.length">
      <div v-for="db in data.databases" :key="db.id" class="id-section">
        <div class="id-section-header">
          <h4 class="id-section-title">📊 {{ db.title }} <span class="id-count">({{ db.total }})</span></h4>
          <button v-if="canCreate(key)" class="btn btn-primary btn-sm" @click="openCreateForm('createPage', { databaseId: db.id, titleProperty: db.columns.find(c => c.propType === 'title')?.key || 'Name' })">
            + Ajouter
          </button>
        </div>
        <div class="id-table-wrap">
          <table class="id-table">
            <thead>
              <tr>
                <th v-for="col in db.columns" :key="col.key">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in db.entries" :key="entry.id">
                <td v-for="col in db.columns" :key="col.key">
                  <a v-if="entry.url && col === db.columns[0]" :href="entry.url" target="_blank" class="id-link">{{ entry[col.key] || '-' }}</a>
                  <span v-else>{{ formatCell(entry[col.key], col) }}</span>
                </td>
              </tr>
              <tr v-if="!db.entries.length">
                <td :colspan="db.columns.length" style="text-align: center; color: var(--muted);">Aucune entrée</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Generic sections -->
    <template v-if="data?.sections">
      <div v-for="section in data.sections" :key="section.key" class="id-section">
        <div class="id-section-header">
          <h4 class="id-section-title">{{ section.icon }} {{ section.title }} <span class="id-count">({{ section.total }})</span></h4>
          <button v-if="section.actions?.includes('create')" class="btn btn-primary btn-sm" @click="openCreateForm(getCreateAction(section.key), {})">
            + Ajouter
          </button>
        </div>
        <div class="id-table-wrap">
          <table class="id-table">
            <thead>
              <tr>
                <th v-for="col in section.columns" :key="col.key">{{ col.label }}</th>
                <th v-if="section.actions?.length" style="width: 80px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in section.items" :key="item.id || item.gid || item.key">
                <td v-for="col in section.columns" :key="col.key">
                  <span v-if="col.type === 'currency'">{{ formatCurrency(item[col.key]) }}</span>
                  <span v-else-if="col.type === 'date'">{{ formatDate(item[col.key]) }}</span>
                  <span v-else-if="col.type === 'datetime'">{{ formatDateTime(item[col.key]) }}</span>
                  <span v-else-if="col.type === 'boolean'">{{ item[col.key] ? '✅' : '' }}</span>
                  <span v-else-if="col.type === 'url' && item[col.key]"><a :href="item[col.key]" target="_blank" class="id-link">Lien</a></span>
                  <span v-else :class="getStatusClass(col.key, item[col.key])">{{ item[col.key] || '-' }}</span>
                </td>
                <td v-if="section.actions?.length" class="id-actions-cell">
                  <button v-if="section.actions.includes('edit')" class="id-action-btn" @click="openEditForm(section.key, item)">
                    <ScalyoIcon name="settings" :size="11" /> Modifier
                  </button>
                  <button v-if="section.actions.includes('complete') && !item.completed" class="id-action-btn id-action-complete" @click="completeItem(section.key, item)">
                    ✓ Terminer
                  </button>
                  <button v-if="section.actions.includes('updateStatus')" class="id-action-btn" @click="openUpdateStatusForm(section.key, item)">
                    Modifier statut
                  </button>
                </td>
              </tr>
              <tr v-if="!section.items?.length">
                <td :colspan="section.columns.length + (section.actions?.length ? 1 : 0)" style="text-align: center; color: var(--muted); padding: 20px;">
                  <div>Aucune donnée pour le moment</div>
                  <div style="font-size: 12px; margin-top: 6px;">
                    {{ getEmptyHint(section.key) }}
                  </div>
                  <button class="btn btn-secondary" style="margin-top: 10px; font-size: 12px;" @click="doSync">
                    Synchroniser maintenant
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Notion recent pages -->
    <template v-if="key === 'notion' && data?.recentPages?.length">
      <div class="id-section">
        <h4 class="id-section-title">📄 Pages récentes</h4>
        <div class="id-pages-grid">
          <a v-for="page in data.recentPages" :key="page.id" :href="page.url" target="_blank" class="id-page-card">
            <span class="id-page-icon">{{ page.icon }}</span>
            <div>
              <div class="id-page-title">{{ page.title }}</div>
              <div class="id-page-date">{{ formatDate(page.lastEdited) }}</div>
            </div>
          </a>
        </div>
      </div>
    </template>

    <!-- Action Modal -->
    <AppModal v-if="actionModal" :title="actionModal.title" @close="actionModal = null">
      <div class="id-form">
        <div v-if="actionModal.loading" style="text-align: center; padding: 20px; color: var(--muted);">
          Chargement des statuts disponibles...
        </div>
        <div v-if="actionError" class="id-error" style="margin-bottom: 12px;">{{ actionError }}</div>
        <template v-if="!actionModal.loading" v-for="field in actionModal.fields" :key="field.key">
          <label class="id-form-label">{{ field.label }}</label>
          <select v-if="field.type === 'select'" v-model="actionForm[field.key]" class="id-form-input">
            <option value="">-- Choisir --</option>
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <textarea v-else-if="field.type === 'textarea'" v-model="actionForm[field.key]" class="id-form-input" rows="3" :placeholder="field.placeholder || ''"></textarea>
          <input v-else v-model="actionForm[field.key]" :type="field.type || 'text'" class="id-form-input" :placeholder="field.placeholder || ''" />
        </template>
        <div v-if="!actionModal.loading" style="display: flex; gap: 8px; margin-top: 16px;">
          <button class="btn btn-primary" style="flex: 1;" @click="submitAction" :disabled="submitting">
            {{ submitting ? '...' : actionModal.submitLabel || 'Créer' }}
          </button>
          <button class="btn btn-secondary" @click="actionModal = null">Annuler</button>
        </div>
      </div>
    </AppModal>
  </div>
  </PlanGate>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { integrationsApi } from '../api'
import AppModal from '../components/AppModal.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'
import PlanGate from '../components/PlanGate.vue'

const route = useRoute()
const router = useRouter()
const key = computed(() => route.params.key)

const data = ref(null)
const loading = ref(false)
const syncing = ref(false)
const error = ref('')
const successMsg = ref('')

const actionModal = ref(null)
const actionForm = reactive({})
const actionError = ref('')
const submitting = ref(false)
const loadingTransitions = ref(false)

// Transforme les erreurs techniques en messages compréhensibles
function friendlyError(err) {
  const raw = err.response?.data?.error || err.message || ''
  const lower = raw.toLowerCase()
  // Erreurs réseau
  if (err.code === 'ERR_NETWORK' || lower.includes('failed to fetch') || lower.includes('network'))
    return 'Problème de connexion internet. Vérifiez votre réseau et réessayez.'
  // Token/clé invalide ou expiré
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid') || lower.includes('expired') || lower.includes('invalide'))
    return `Votre clé d'accès ${integDef.value?.name || ''} est invalide ou expirée. Allez dans Intégrations → Modifier pour la renouveler.`
  // Accès refusé
  if (lower.includes('403') || lower.includes('forbidden'))
    return `Accès refusé par ${integDef.value?.name || 'le service'}. Vérifiez les permissions de votre clé d'accès.`
  // Ressource non trouvée
  if (lower.includes('404') || lower.includes('not found'))
    return `La ressource demandée n'existe pas ou plus dans ${integDef.value?.name || 'le service'}.`
  // Erreur serveur externe
  if (lower.includes('500') || lower.includes('502') || lower.includes('503') || lower.includes('server'))
    return `${integDef.value?.name || 'Le service'} est temporairement indisponible. Réessayez dans quelques minutes.`
  // Rate limit
  if (lower.includes('429') || lower.includes('rate') || lower.includes('too many'))
    return 'Trop de requêtes envoyées. Attendez une minute puis réessayez.'
  // Message du backend déjà en français (commence par majuscule et contient des accents ou mots français)
  if (raw && /^[A-ZÀ-Ü]/.test(raw)) return raw
  // Fallback
  return raw || 'Une erreur est survenue. Réessayez ou vérifiez votre configuration.'
}

// Integration definitions (same as IntegrationsView)
const integrations = {
  hubspot: { name: 'HubSpot', icon: '🟠', color: '#FF7A59', desc: 'CRM — Contacts et deals' },
  pipedrive: { name: 'Pipedrive', icon: '🟢', color: '#25C16F', desc: 'CRM — Contacts et deals' },
  intercom: { name: 'Intercom', icon: '💬', color: '#286EFA', desc: 'Contacts et conversations' },
  zendesk: { name: 'Zendesk', icon: '🎫', color: '#17A2B8', desc: 'Tickets de support' },
  jira: { name: 'Jira', icon: '🔷', color: '#0052CC', desc: 'Tickets et tâches' },
  notion: { name: 'Notion', icon: '📝', color: '#787878', desc: 'Bases de données et pages' },
  asana: { name: 'Asana', icon: '🔶', color: '#F06A6A', desc: 'Tâches et projets' },
  calendly: { name: 'Calendly', icon: '📅', color: '#006BFF', desc: 'Rendez-vous' },
  slack: { name: 'Slack', icon: '💜', color: '#4A154B', desc: 'Notifications' },
  teams: { name: 'Teams', icon: '🟦', color: '#5B5FC7', desc: 'Notifications' },
}

const integDef = computed(() => integrations[key.value] || null)

async function refreshData() {
  loading.value = true
  error.value = ''
  try {
    const res = await integrationsApi.fetchData(key.value)
    data.value = res.data || res
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    loading.value = false
  }
}

async function doSync() {
  syncing.value = true
  error.value = ''
  try {
    const res = await integrationsApi.sync(key.value)
    const result = res.data || res
    successMsg.value = 'Synchronisation terminée !'
    setTimeout(() => { successMsg.value = '' }, 3000)
    // Refresh data after sync
    await refreshData()
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    syncing.value = false
  }
}

function canCreate(key) {
  return !['slack', 'teams', 'calendly'].includes(key)
}

function getCreateAction(sectionKey) {
  const map = {
    contacts: 'createContact',
    deals: 'createDeal',
    issues: 'createIssue',
    tickets: 'createTicket',
    tasks: 'createTask',
    pages: 'createPage',
    conversations: 'createConversation',
  }
  return map[sectionKey] || 'create'
}

function getCreateFields(action, extraData) {
  switch (action) {
    case 'createContact':
      if (key.value === 'hubspot') return [
        { key: 'firstname', label: 'Prénom', placeholder: 'Jean' },
        { key: 'lastname', label: 'Nom', placeholder: 'Dupont' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@example.com' },
        { key: 'phone', label: 'Téléphone', placeholder: '+33 6 00 00 00 00' },
        { key: 'company', label: 'Entreprise', placeholder: 'Acme Inc.' },
      ]
      if (key.value === 'pipedrive') return [
        { key: 'name', label: 'Nom complet', placeholder: 'Jean Dupont' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@example.com' },
        { key: 'phone', label: 'Téléphone', placeholder: '+33 6 00 00 00 00' },
      ]
      return [
        { key: 'name', label: 'Nom', placeholder: 'Jean Dupont' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@example.com' },
        { key: 'phone', label: 'Téléphone', placeholder: '+33 6 00 00 00 00' },
      ]
    case 'createDeal':
      if (key.value === 'hubspot') return [
        { key: 'name', label: 'Nom du deal', placeholder: 'Contrat Acme' },
        { key: 'amount', label: 'Montant', type: 'number', placeholder: '10000' },
      ]
      return [
        { key: 'name', label: 'Nom du deal', placeholder: 'Contrat Acme' },
        { key: 'value', label: 'Montant', type: 'number', placeholder: '10000' },
      ]
    case 'createIssue': {
      const projects = data.value?.meta?.projects || []
      return [
        { key: 'project', label: 'Projet', type: 'select', options: projects.map(p => ({ value: p.key, label: `${p.key} - ${p.name}` })) },
        { key: 'summary', label: 'Résumé', placeholder: 'Description courte du ticket' },
        { key: 'type', label: 'Type', type: 'select', options: [
          { value: 'Task', label: 'Tâche' }, { value: 'Bug', label: 'Bug' }, { value: 'Story', label: 'Story' },
        ]},
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Détails...' },
        { key: 'priority', label: 'Priorité', type: 'select', options: [
          { value: 'Highest', label: 'Critique' }, { value: 'High', label: 'Haute' },
          { value: 'Medium', label: 'Moyenne' }, { value: 'Low', label: 'Basse' },
        ]},
      ]
    }
    case 'createTicket':
      return [
        { key: 'subject', label: 'Sujet', placeholder: 'Problème de connexion...' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Détails...' },
        { key: 'priority', label: 'Priorité', type: 'select', options: [
          { value: 'urgent', label: 'Urgente' }, { value: 'high', label: 'Haute' },
          { value: 'normal', label: 'Normale' }, { value: 'low', label: 'Basse' },
        ]},
      ]
    case 'createTask': {
      const projects = data.value?.meta?.projects || []
      return [
        { key: 'name', label: 'Nom de la tâche', placeholder: 'Ma nouvelle tâche' },
        { key: 'dueOn', label: 'Échéance', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Détails...' },
        ...(projects.length ? [{ key: 'project', label: 'Projet', type: 'select', options: projects.map(p => ({ value: p.gid, label: p.name })) }] : []),
      ]
    }
    case 'createPage':
      return [
        { key: 'title', label: 'Titre de la page', placeholder: 'Nouvelle page' },
      ]
    default:
      return [{ key: 'name', label: 'Nom', placeholder: '' }]
  }
}

function openCreateForm(action, extraData) {
  actionError.value = ''
  const fields = getCreateFields(action, extraData)
  // Reset form
  for (const k of Object.keys(actionForm)) delete actionForm[k]
  // Pre-fill extra data
  if (extraData) Object.assign(actionForm, extraData)

  actionModal.value = {
    title: getActionTitle(action),
    action,
    fields,
    extraData,
    submitLabel: 'Créer',
  }
}

function openEditForm(sectionKey, item) {
  actionError.value = ''
  const action = sectionKey === 'contacts' ? 'editContact' : 'edit'
  const fields = getCreateFields(getCreateAction(sectionKey), {})
  // Reset and pre-fill
  for (const k of Object.keys(actionForm)) delete actionForm[k]
  Object.assign(actionForm, { id: item.id, ...item })

  actionModal.value = {
    title: `Modifier ${item.name || item.summary || ''}`,
    action,
    fields,
    submitLabel: 'Enregistrer',
  }
}

async function completeItem(sectionKey, item) {
  try {
    if (key.value === 'asana') {
      await integrationsApi.performAction(key.value, 'completeTask', { gid: item.gid })
    }
    successMsg.value = 'Tâche terminée !'
    setTimeout(() => { successMsg.value = '' }, 2000)
    await refreshData()
  } catch (err) {
    error.value = friendlyError(err)
  }
}

async function openUpdateStatusForm(sectionKey, item) {
  actionError.value = ''
  for (const k of Object.keys(actionForm)) delete actionForm[k]

  if (key.value === 'jira') {
    // Show loading modal immediately
    loadingTransitions.value = true
    actionModal.value = {
      title: `Modifier statut — ${item.key || item.summary || ''}`,
      action: 'updateStatus',
      fields: [],
      submitLabel: 'Mettre à jour',
      loading: true,
    }
    try {
      const res = await integrationsApi.performAction(key.value, 'getTransitions', { issueId: item.id })
      const transitions = res.data?.transitions || res.transitions || []
      actionForm.issueId = item.id
      actionModal.value = {
        title: `Modifier statut — ${item.key || item.summary || ''}`,
        action: 'updateStatus',
        fields: [{
          key: 'transitionId', label: 'Nouveau statut', type: 'select',
          options: transitions.map(t => ({ value: t.id, label: t.name })),
        }],
        submitLabel: 'Mettre à jour',
      }
    } catch (err) {
      actionModal.value = null
      error.value = friendlyError(err)
    } finally {
      loadingTransitions.value = false
    }
  } else if (key.value === 'zendesk') {
    actionForm.ticketId = item.id
    actionModal.value = {
      title: `Modifier statut — Ticket #${item.id}`,
      action: 'updateStatus',
      fields: [{
        key: 'status', label: 'Nouveau statut', type: 'select',
        options: [
          { value: 'open', label: 'Ouvert' },
          { value: 'pending', label: 'En attente' },
          { value: 'hold', label: 'En pause' },
          { value: 'solved', label: 'Résolu' },
          { value: 'closed', label: 'Fermé' },
        ],
      }],
      submitLabel: 'Mettre à jour',
    }
  }
}

async function submitAction() {
  actionError.value = ''
  submitting.value = true
  try {
    const payload = { ...actionForm }
    // Merge extra data from modal
    if (actionModal.value?.extraData) {
      Object.assign(payload, actionModal.value.extraData)
    }
    const res = await integrationsApi.performAction(key.value, actionModal.value.action, payload)
    const result = res.data || res
    successMsg.value = result.message || 'Action effectuée !'
    setTimeout(() => { successMsg.value = '' }, 3000)
    actionModal.value = null
    await refreshData()
  } catch (err) {
    actionError.value = friendlyError(err)
  } finally {
    submitting.value = false
  }
}

function getActionTitle(action) {
  const titles = {
    createContact: 'Nouveau contact',
    createDeal: 'Nouveau deal',
    createIssue: 'Nouveau ticket Jira',
    createTicket: 'Nouveau ticket Zendesk',
    createTask: 'Nouvelle tâche',
    createPage: 'Nouvelle page Notion',
  }
  return titles[action] || 'Nouvelle entrée'
}

function getEmptyHint(sectionKey) {
  const name = integDef.value?.name || 'l\'outil'
  const hints = {
    contacts: `Si vous avez des contacts dans ${name}, cliquez "Synchroniser" pour les importer.`,
    deals: `Si vous avez des deals dans ${name}, cliquez "Synchroniser" pour les importer.`,
    issues: `Si vous avez des tickets dans ${name}, cliquez "Synchroniser" pour les importer.`,
    tickets: `Si vous avez des tickets dans ${name}, cliquez "Synchroniser" pour les importer.`,
    tasks: `Si vous avez des tâches dans ${name}, cliquez "Synchroniser" pour les importer.`,
    events: `Si vous avez des événements dans ${name}, cliquez "Synchroniser" pour les importer.`,
    projects: `Les projets apparaîtront après la synchronisation avec ${name}.`,
    users: `Les utilisateurs apparaîtront après la synchronisation avec ${name}.`,
    conversations: `Si vous avez des conversations dans ${name}, cliquez "Synchroniser".`,
  }
  return hints[sectionKey] || `Cliquez "Synchroniser" pour importer les données depuis ${name}.`
}

function getStatusClass(colKey, value) {
  if (!value || !['status', 'priority', 'state'].includes(colKey)) return ''
  const v = String(value).toLowerCase()
  if (['open', 'active', 'new', 'to do', 'todo'].includes(v)) return 'id-status id-status-blue'
  if (['in progress', 'in_progress', 'pending'].includes(v)) return 'id-status id-status-teal'
  if (['done', 'closed', 'resolved', 'solved', 'won'].includes(v)) return 'id-status id-status-green'
  if (['critical', 'urgent', 'highest', 'high'].includes(v)) return 'id-status id-status-red'
  if (['low', 'lowest'].includes(v)) return 'id-status id-status-muted'
  return 'id-status'
}

function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('fr-FR')
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatCell(val, col) {
  if (val === null || val === undefined || val === '') return '-'
  if (col?.type === 'date') return formatDate(val)
  return String(val)
}

onMounted(() => {
  if (!integDef.value) {
    router.push({ name: 'integrations' })
    return
  }
  // Slack and Teams have no data view
  if (['slack', 'teams'].includes(key.value)) {
    router.push({ name: 'integrations' })
    return
  }
  refreshData()
})
</script>

<style scoped>
.id-header { margin-bottom: 24px; }
.id-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--muted); text-decoration: none;
  margin-bottom: 12px; font-weight: 600;
}
.id-back:hover { color: var(--teal); }
.id-title-row {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.id-icon-wrap {
  width: 56px; height: 56px; border-radius: 14px;
  display: grid; place-items: center; flex-shrink: 0;
}

.id-error {
  padding: 12px 16px; border-radius: 10px;
  background: var(--redBg, #fef2f2); border: 1px solid var(--redBorder, #fecaca);
  color: var(--red); font-size: 13px; font-weight: 600; margin-bottom: 16px;
}
.id-success {
  padding: 12px 16px; border-radius: 10px;
  background: var(--greenBg, #f0fdf4); border: 1px solid var(--greenBorder, #bbf7d0);
  color: var(--green); font-size: 13px; font-weight: 600; margin-bottom: 16px;
}
.id-loading {
  text-align: center; padding: 40px; color: var(--muted); font-size: 14px;
}

.id-section {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px; margin-bottom: 16px;
}
.id-section-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.id-section-title {
  font-weight: 700; font-size: 15px; margin: 0;
  display: flex; align-items: center; gap: 6px;
}
.id-count { font-weight: 400; color: var(--muted); font-size: 13px; }

.btn-sm { font-size: 12px; padding: 6px 14px; }

.id-table-wrap { overflow-x: auto; }
.id-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.id-table th {
  text-align: left; font-weight: 600; color: var(--muted);
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 8px 12px; border-bottom: 1px solid var(--border);
}
.id-table td {
  padding: 10px 12px; border-bottom: 1px solid var(--border);
  max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.id-table tr:hover { background: var(--bg); }
.id-table tr:last-child td { border-bottom: none; }

.id-link { color: var(--teal); text-decoration: none; font-weight: 600; }
.id-link:hover { text-decoration: underline; }

.id-actions-cell { text-align: right; white-space: nowrap; }
.id-action-btn {
  background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
  padding: 6px 12px; cursor: pointer; color: var(--muted); font-size: 12px;
  transition: all 0.15s; display: inline-flex; align-items: center; gap: 4px; margin-left: 4px;
}
.id-action-btn:hover { border-color: var(--teal); color: var(--teal); }
.id-action-complete { color: var(--green); border-color: var(--green); font-weight: 700; }

.id-status {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 600;
}
.id-status-blue { background: #eff6ff; color: #3b82f6; }
.id-status-teal { background: #f0fdfa; color: #14b8a6; }
.id-status-green { background: #f0fdf4; color: #22c55e; }
.id-status-red { background: #fef2f2; color: #ef4444; }
.id-status-muted { background: var(--bg); color: var(--muted); }

.id-pages-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;
}
.id-page-card {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; border-radius: 10px; border: 1px solid var(--border);
  text-decoration: none; color: var(--text); transition: border-color 0.15s;
}
.id-page-card:hover { border-color: var(--teal); }
.id-page-icon { font-size: 24px; }
.id-page-title { font-weight: 600; font-size: 13px; }
.id-page-date { font-size: 11px; color: var(--muted); }

.id-form { display: flex; flex-direction: column; gap: 10px; }
.id-form-label {
  font-size: 12px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.04em; margin-top: 4px;
}
.id-form-input {
  width: 100%; padding: 10px 14px; border-radius: 8px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text); font-size: 14px; font-family: inherit;
}
.id-form-input:focus { outline: none; border-color: var(--teal); }

@media (max-width: 768px) {
  .id-title-row { flex-direction: column; align-items: flex-start; }
  .id-pages-grid { grid-template-columns: 1fr; }
}
</style>
