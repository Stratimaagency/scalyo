<template>
  <PlanGate requiredPlan="Growth" moduleName="Integrations">
  <div class="fade-in">
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon">🔌</div>
        <div class="page-header__text">
          <h1 class="page-header__title">{{ t('integrationsTitle') }}</h1>
          <p class="page-header__subtitle">{{ t('integrationsDesc') }}</p>
        </div>
      </div>
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
              <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" class="integ-card-logo" />
              <span v-else class="integ-card-icon">{{ integ.icon }}</span>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
              <span class="tag risk-low" style="font-size: 10px; padding: 2px 8px;">{{ t('integConnected') }}</span>
            </div>
          </div>
          <div v-if="syncStatus[integ.key]" class="integ-sync-status" :class="'integ-sync-' + syncStatus[integ.key].syncStatus">
            <div>
              <span v-if="syncStatus[integ.key].syncStatus === 'success'">{{ t('integSyncOk') }}</span>
              <span v-else>{{ t('integSyncError') }}</span>
              <span v-if="syncStatus[integ.key].syncDetails && syncStatus[integ.key].syncStatus === 'success'" class="integ-sync-details">
                {{ formatSyncDetails(syncStatus[integ.key].syncDetails) }}
              </span>
              <span v-if="syncStatus[integ.key].syncDetails?.error" class="integ-sync-details">
                {{ syncStatus[integ.key].syncDetails.error }}
              </span>
            </div>
            <span v-if="syncStatus[integ.key].lastSyncAt" style="font-size: 10px; opacity: 0.7;">{{ formatDate(syncStatus[integ.key].lastSyncAt) }}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button v-if="hasDetailView(integ.key)" class="btn btn-primary integ-btn" style="flex: 1;" @click="goToDetail(integ)">
              {{ t('open') }}
            </button>
            <button class="btn btn-secondary integ-btn" style="flex: 1;" @click="syncIntegration(integ)" :disabled="syncing === integ.key">
              {{ syncing === integ.key ? t('syncing') : t('integSync') }}
            </button>
            <button class="btn btn-secondary integ-btn" style="flex: 1;" @click="openModal(integ)">
              <ScalyoIcon name="settings" :size="12" /> {{ t('edit') }}
            </button>
          </div>
          <button class="btn integ-btn integ-disconnect-btn" @click="confirmDisconnect(integ)">
            {{ t('disconnect') }} {{ integ.name }}
          </button>
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
              <img v-if="integ.logo" :src="integ.logo" :alt="integ.name" class="integ-card-logo" />
              <span v-else class="integ-card-icon">{{ integ.icon }}</span>
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

    <!-- Connect inline panel -->
    <div v-if="modal" class="card" style="padding: 16px; margin-bottom: 16px; border: 2px solid var(--tealBorder); border-radius: 12px;">
      <h4 style="font-weight: 800; margin-bottom: 12px;">{{ (connectedKeys.has(modal.key) ? t('edit') + ' ' : t('connect') + ' ') + modal.name }}</h4>
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
            <div v-if="field.type === 'password' && isEditing && configForm[field.key]" class="integ-saved-token">
              <span style="flex: 1;">{{ t('keySaved') }} ({{ configForm[field.key].slice(0, 6) }}...)</span>
              <button type="button" class="integ-change-btn" @click="configForm[field.key] = ''">{{ t('edit') }}</button>
            </div>
            <input
              v-else
              v-model="configForm[field.key]"
              :type="field.type || 'text'"
              class="integ-input"
              :placeholder="field.placeholder"
            />
            <span v-if="field.hint" class="integ-hint" v-html="field.hint.replace(/\\n/g, '<br>')"></span>
          </template>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" @click="saveConnection" :disabled="saving">
            {{ saving ? '...' : (connectedKeys.has(modal.key) ? t('update') : t('connect')) }}
          </button>
          <button class="btn btn-secondary" @click="modal = null">{{ t('cancel') }}</button>
        </div>

        <div v-if="connectSuccess" class="integ-success">{{ t('connectSuccess') }}</div>
      </div>
    </div>
  </div>
  </PlanGate>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import { integrationsApi } from '../api'
import AppCard from '../components/AppCard.vue'

import ScalyoIcon from '../components/ScalyoIcon.vue'
import PlanGate from '../components/PlanGate.vue'

const { t } = useI18n()
const router = useRouter()
const prefsStore = usePreferencesStore()
const L = (fr, en, kr) => {
  const l = prefsStore.lang
  return l === 'en' ? en : l === 'kr' ? kr : fr
}

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
const integrations = computed(() => [
  // CRM
  { key: 'hubspot', name: 'HubSpot', icon: '🟠', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='hs' cx='35%25' cy='30%25' r='65%25'%3E%3Cstop offset='0%25' stop-color='%23FF9E7A'/%3E%3Cstop offset='100%25' stop-color='%23FF5C35'/%3E%3C/radialGradient%3E%3Cfilter id='hsf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%23FF5C35' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='36' fill='url(%23hs)' filter='url(%23hsf)'/%3E%3Ccircle cx='40' cy='40' r='36' fill='none' stroke='rgba(255,255,255,.2)' stroke-width='1'/%3E%3Cpath d='M43 28v-5a4 4 0 10-6 0v5a12 12 0 00-5 20l-4 4a3 3 0 104 4l4-4a12 12 0 0012-1 12 12 0 000-20V28zm-3 24a6 6 0 110-12 6 6 0 010 12z' fill='%23fff' fill-opacity='.95'/%3E%3C/svg%3E", color: '#FF5C35', available: true,
    desc: L('Importe automatiquement vos contacts et deals dans le portefeuille.',
            'Automatically imports your contacts and deals into the portfolio.',
            '연락처와 거래를 포트폴리오에 자동으로 가져옵니다.'),
    fields: [
      { key: 'apiKey', label: L('Clé d\'accès HubSpot', 'HubSpot access key', 'HubSpot 액세스 키'), type: 'password', placeholder: 'pat-na1-xxxxxxxx-xxxx-xxxx...',
        hint: L(
          '1. Ouvrez <a href="https://app.hubspot.com/settings" target="_blank">app.hubspot.com/settings</a>\n2. Menu gauche : Intégrations → Applications privées\n3. Cliquez "Créer une application privée" → Nom : Scalyo\n4. Onglet "Portées" : cochez contacts, entreprises, transactions\n5. Cliquez Créer → Copiez le token (commence par pat-...)',
          '1. Open <a href="https://app.hubspot.com/settings" target="_blank">app.hubspot.com/settings</a>\n2. Left menu: Integrations → Private Apps\n3. Click "Create a private app" → Name: Scalyo\n4. "Scopes" tab: check contacts, companies, deals\n5. Click Create → Copy the token (starts with pat-...)',
          '1. <a href="https://app.hubspot.com/settings" target="_blank">app.hubspot.com/settings</a>를 여세요\n2. 왼쪽 메뉴: 통합 → 비공개 앱\n3. "비공개 앱 만들기" 클릭 → 이름: Scalyo\n4. "범위" 탭: 연락처, 회사, 거래를 선택하세요\n5. 만들기 클릭 → 토큰을 복사하세요 (pat-로 시작)') },
    ]},
  { key: 'pipedrive', name: 'Pipedrive', icon: '🟢', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='pd' cx='35%25' cy='30%25' r='65%25'%3E%3Cstop offset='0%25' stop-color='%2345E898'/%3E%3Cstop offset='100%25' stop-color='%23017737'/%3E%3C/radialGradient%3E%3Cfilter id='pdf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%23017737' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='36' fill='url(%23pd)' filter='url(%23pdf)'/%3E%3Cpath d='M34 22c-6 0-10 5-10 11v4c0 6 4 11 10 11h2v8h8v-8h2c6 0 10-5 10-11v-4c0-6-4-11-10-11H34zm2 8h8c2 0 4 2 4 4v2c0 2-2 4-4 4h-8c-2 0-4-2-4-4v-2c0-2 2-4 4-4z' fill='%23fff' fill-opacity='.95'/%3E%3C/svg%3E", color: '#017737', available: true,
    desc: L('Importe vos contacts et deals dans le portefeuille.',
            'Imports your contacts and deals into the portfolio.',
            '연락처와 거래를 포트폴리오에 가져옵니다.'),
    fields: [
      { key: 'apiKey', label: L('Token API Pipedrive', 'Pipedrive API token', 'Pipedrive API 토큰'), type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: L(
          '1. Ouvrez <a href="https://app.pipedrive.com/settings/api" target="_blank">app.pipedrive.com/settings/api</a>\n2. Vous verrez "Votre token API personnel"\n3. Copiez-le et collez-le ici',
          '1. Open <a href="https://app.pipedrive.com/settings/api" target="_blank">app.pipedrive.com/settings/api</a>\n2. You will see "Your personal API token"\n3. Copy and paste it here',
          '1. <a href="https://app.pipedrive.com/settings/api" target="_blank">app.pipedrive.com/settings/api</a>를 여세요\n2. "개인 API 토큰"이 표시됩니다\n3. 복사하여 여기에 붙여넣으세요') },
    ]},
  { key: 'intercom', name: 'Intercom', icon: '💬', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='ic' cx='35%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%235BA0FA'/%3E%3Cstop offset='100%25' stop-color='%23185BDB'/%3E%3C/radialGradient%3E%3Cfilter id='icf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%23185BDB' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Crect x='4' y='4' width='72' height='72' rx='18' fill='url(%23ic)' filter='url(%23icf)'/%3E%3Cline x1='24' y1='26' x2='24' y2='42' stroke='%23fff' stroke-width='4' stroke-linecap='round' opacity='.95'/%3E%3Cline x1='33' y1='22' x2='33' y2='42' stroke='%23fff' stroke-width='4' stroke-linecap='round' opacity='.95'/%3E%3Cline x1='42' y1='22' x2='42' y2='42' stroke='%23fff' stroke-width='4' stroke-linecap='round' opacity='.95'/%3E%3Cline x1='51' y1='26' x2='51' y2='42' stroke='%23fff' stroke-width='4' stroke-linecap='round' opacity='.95'/%3E%3Cpath d='M20 46c0 0 8 10 18 10s18-10 18-10' fill='none' stroke='%23fff' stroke-width='3.5' stroke-linecap='round' opacity='.9'/%3E%3C/svg%3E", color: '#286EFA', available: true,
    desc: L('Importe vos contacts et conversations dans le portefeuille.',
            'Imports your contacts and conversations into the portfolio.',
            '연락처와 대화를 포트폴리오에 가져옵니다.'),
    fields: [
      { key: 'apiKey', label: L('Token d\'accès Intercom', 'Intercom access token', 'Intercom 액세스 토큰'), type: 'password', placeholder: 'dG9rOmxxxxxxxxxxxxxxxx',
        hint: L(
          '1. Ouvrez <a href="https://app.intercom.com/a/apps/_/developer-hub" target="_blank">app.intercom.com → Developer Hub</a>\n2. Cliquez "New app" → Nom : Scalyo → Internal integration\n3. Onglet "Authentication" → Copiez l\'Access Token\n4. Collez-le ici',
          '1. Open <a href="https://app.intercom.com/a/apps/_/developer-hub" target="_blank">app.intercom.com → Developer Hub</a>\n2. Click "New app" → Name: Scalyo → Internal integration\n3. "Authentication" tab → Copy the Access Token\n4. Paste it here',
          '1. <a href="https://app.intercom.com/a/apps/_/developer-hub" target="_blank">app.intercom.com → Developer Hub</a>를 여세요\n2. "New app" 클릭 → 이름: Scalyo → Internal integration\n3. "Authentication" 탭 → Access Token을 복사하세요\n4. 여기에 붙여넣으세요') },
    ]},

  // Support
  { key: 'zendesk', name: 'Zendesk', icon: '🎫', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='zd' cx='35%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%2378D9B2'/%3E%3Cstop offset='100%25' stop-color='%2303363D'/%3E%3C/radialGradient%3E%3Cfilter id='zdf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%2303363D' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='36' fill='url(%23zd)' filter='url(%23zdf)'/%3E%3Cpath d='M38 20v18L22 50' fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' opacity='.95'/%3E%3Ccircle cx='30' cy='24' r='6' fill='%23fff' fill-opacity='.9'/%3E%3Cpath d='M42 50V32l16-12' fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' opacity='.95'/%3E%3Ccircle cx='50' cy='48' r='6' fill='%23fff' fill-opacity='.9'/%3E%3C/svg%3E", color: '#03363D', available: true,
    desc: L('Importe vos tickets de support et contacts clients.',
            'Imports your support tickets and customer contacts.',
            '지원 티켓과 고객 연락처를 가져옵니다.'),
    fields: [
      { key: 'email', label: L('Email de votre compte Zendesk', 'Zendesk account email', 'Zendesk 계정 이메일'), type: 'email', placeholder: L('vous@entreprise.com', 'you@company.com', 'you@company.com') },
      { key: 'apiKey', label: L('Token API Zendesk', 'Zendesk API token', 'Zendesk API 토큰'), type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: L(
          '1. Ouvrez votre Zendesk → Admin Center (roue dentée)\n2. Allez dans <a href="https://support.zendesk.com/hc/en-us/articles/4408889192858" target="_blank">Apps et intégrations → API Zendesk</a>\n3. Activez "Accès par token"\n4. Cliquez "Ajouter un token API" → Copiez-le ici',
          '1. Open your Zendesk → Admin Center (gear icon)\n2. Go to <a href="https://support.zendesk.com/hc/en-us/articles/4408889192858" target="_blank">Apps & integrations → Zendesk API</a>\n3. Enable "Token access"\n4. Click "Add API token" → Copy it here',
          '1. Zendesk → Admin Center(톱니바퀴 아이콘)를 여세요\n2. <a href="https://support.zendesk.com/hc/en-us/articles/4408889192858" target="_blank">앱 및 통합 → Zendesk API</a>로 이동하세요\n3. "토큰 액세스"를 활성화하세요\n4. "API 토큰 추가" 클릭 → 여기에 복사하세요') },
      { key: 'domain', label: L('Sous-domaine Zendesk', 'Zendesk subdomain', 'Zendesk 하위 도메인'), type: 'text', placeholder: L('votre-entreprise', 'your-company', 'your-company'),
        hint: L(
          'Regardez votre URL Zendesk : si c\'est <strong>acme</strong>.zendesk.com, entrez <strong>acme</strong>.\nN\'entrez que le mot avant ".zendesk.com".',
          'Check your Zendesk URL: if it\'s <strong>acme</strong>.zendesk.com, enter <strong>acme</strong>.\nOnly enter the word before ".zendesk.com".',
          'Zendesk URL을 확인하세요: <strong>acme</strong>.zendesk.com이면 <strong>acme</strong>를 입력하세요.\n".zendesk.com" 앞의 단어만 입력하세요.') },
    ]},
  { key: 'jira', name: 'Jira', icon: '🔷', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='jr' cx='30%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%234C9AFF'/%3E%3Cstop offset='100%25' stop-color='%230052CC'/%3E%3C/radialGradient%3E%3Cfilter id='jrf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%230052CC' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='36' fill='url(%23jr)' filter='url(%23jrf)'/%3E%3Cpath d='M56 38L42 24l-4-4L22 36l-6 6a2 2 0 000 3l13 13 9 9 16-16-1-1 4-4a2 2 0 000-3L56 38zM38 48l-7-7 7-7 7 7-7 7z' fill='%23fff' fill-opacity='.95'/%3E%3C/svg%3E", color: '#0052CC', available: true,
    desc: L('Importe vos tickets et tâches dans le Task Board.',
            'Imports your tickets and tasks into the Task Board.',
            '티켓과 작업을 Task Board에 가져옵니다.'),
    fields: [
      { key: 'email', label: L('Email de votre compte Atlassian', 'Atlassian account email', 'Atlassian 계정 이메일'), type: 'email', placeholder: L('vous@entreprise.com', 'you@company.com', 'you@company.com') },
      { key: 'apiKey', label: L('Token API Atlassian', 'Atlassian API token', 'Atlassian API 토큰'), type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        hint: L(
          '1. Ouvrez <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">id.atlassian.com → Tokens API</a>\n2. Cliquez "Créer un token API"\n3. Nom : Scalyo → Créer\n4. Copiez le token et collez-le ici',
          '1. Open <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">id.atlassian.com → API Tokens</a>\n2. Click "Create API token"\n3. Name: Scalyo → Create\n4. Copy the token and paste it here',
          '1. <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">id.atlassian.com → API 토큰</a>을 여세요\n2. "API 토큰 만들기" 클릭\n3. 이름: Scalyo → 만들기\n4. 토큰을 복사하여 여기에 붙여넣으세요') },
      { key: 'domain', label: L('Sous-domaine Jira', 'Jira subdomain', 'Jira 하위 도메인'), type: 'text', placeholder: L('votre-entreprise', 'your-company', 'your-company'),
        hint: L(
          'Regardez votre URL Jira : si c\'est <strong>acme</strong>.atlassian.net, entrez <strong>acme</strong>.\nN\'entrez que le mot avant ".atlassian.net".',
          'Check your Jira URL: if it\'s <strong>acme</strong>.atlassian.net, enter <strong>acme</strong>.\nOnly enter the word before ".atlassian.net".',
          'Jira URL을 확인하세요: <strong>acme</strong>.atlassian.net이면 <strong>acme</strong>를 입력하세요.\n".atlassian.net" 앞의 단어만 입력하세요.') },
    ]},

  // Productivity
  { key: 'notion', name: 'Notion', icon: '📝', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='nt' cx='35%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%23555'/%3E%3Cstop offset='100%25' stop-color='%23111'/%3E%3C/radialGradient%3E%3Cfilter id='ntf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%23000' flood-opacity='.35'/%3E%3C/filter%3E%3C/defs%3E%3Crect x='4' y='4' width='72' height='72' rx='18' fill='url(%23nt)' filter='url(%23ntf)'/%3E%3Cpath d='M24 20h18l6 5v26H28l-10-6V20z' fill='none' stroke='%23fff' stroke-width='3' stroke-linejoin='round' opacity='.95'/%3E%3Cpath d='M29 30h16M29 37h16M29 44h10' stroke='%23fff' stroke-width='2.5' stroke-linecap='round' opacity='.8'/%3E%3C/svg%3E", color: '#000000', available: true,
    desc: L('Importe vos bases de données et pages dans Scalyo.',
            'Imports your databases and pages into Scalyo.',
            '데이터베이스와 페이지를 Scalyo에 가져옵니다.'),
    fields: [
      { key: 'apiKey', label: L('Secret d\'intégration Notion', 'Notion integration secret', 'Notion 통합 시크릿'), type: 'password', placeholder: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: L(
          '1. Ouvrez <a href="https://www.notion.so/profile/integrations" target="_blank">notion.so/profile/integrations</a>\n2. Cliquez "Nouvelle intégration" → Nom : Scalyo → Envoyer\n3. Copiez le "Secret d\'intégration interne" (commence par secret_...)\n4. <strong>IMPORTANT</strong> : Retournez dans Notion → ouvrez la page ou base à synchroniser → cliquez <strong>...</strong> (3 points en haut à droite) → <strong>Connexions</strong> → <strong>Connecter à → Scalyo</strong>\nSans l\'étape 4, Scalyo ne verra aucune donnée.',
          '1. Open <a href="https://www.notion.so/profile/integrations" target="_blank">notion.so/profile/integrations</a>\n2. Click "New integration" → Name: Scalyo → Submit\n3. Copy the "Internal integration secret" (starts with secret_...)\n4. <strong>IMPORTANT</strong>: Go back to Notion → open the page or database to sync → click <strong>...</strong> (top right) → <strong>Connections</strong> → <strong>Connect to → Scalyo</strong>\nWithout step 4, Scalyo won\'t see any data.',
          '1. <a href="https://www.notion.so/profile/integrations" target="_blank">notion.so/profile/integrations</a>를 여세요\n2. "새 통합" 클릭 → 이름: Scalyo → 제출\n3. "내부 통합 시크릿"을 복사하세요 (secret_로 시작)\n4. <strong>중요</strong>: Notion으로 돌아가서 → 동기화할 페이지 또는 데이터베이스를 열고 → <strong>...</strong>(오른쪽 상단) 클릭 → <strong>연결</strong> → <strong>연결 대상 → Scalyo</strong>\n4단계 없이는 Scalyo가 데이터를 볼 수 없습니다.') },
    ]},
  { key: 'asana', name: 'Asana', icon: '🔶', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='as1' cx='40%25' cy='30%25' r='60%25'%3E%3Cstop offset='0%25' stop-color='%23FF9A8A'/%3E%3Cstop offset='100%25' stop-color='%23F06A6A'/%3E%3C/radialGradient%3E%3Cfilter id='asf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='2.5' flood-color='%23F06A6A' flood-opacity='.35'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='40' cy='22' r='11' fill='url(%23as1)' filter='url(%23asf)'/%3E%3Ccircle cx='22' cy='50' r='11' fill='url(%23as1)' filter='url(%23asf)'/%3E%3Ccircle cx='58' cy='50' r='11' fill='url(%23as1)' filter='url(%23asf)'/%3E%3C/svg%3E", color: '#F06A6A', available: true,
    desc: L('Importe vos tâches et projets dans le Task Board.',
            'Imports your tasks and projects into the Task Board.',
            '작업과 프로젝트를 Task Board에 가져옵니다.'),
    fields: [
      { key: 'apiKey', label: L('Token d\'accès personnel Asana', 'Asana personal access token', 'Asana 개인 액세스 토큰'), type: 'password', placeholder: '1/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: L(
          '1. Ouvrez <a href="https://app.asana.com/0/my-apps" target="_blank">app.asana.com/0/my-apps</a>\n2. Cliquez "Créer un token"\n3. Nom : Scalyo → Créer\n4. Copiez le token et collez-le ici',
          '1. Open <a href="https://app.asana.com/0/my-apps" target="_blank">app.asana.com/0/my-apps</a>\n2. Click "Create token"\n3. Name: Scalyo → Create\n4. Copy the token and paste it here',
          '1. <a href="https://app.asana.com/0/my-apps" target="_blank">app.asana.com/0/my-apps</a>를 여세요\n2. "토큰 만들기" 클릭\n3. 이름: Scalyo → 만들기\n4. 토큰을 복사하여 여기에 붙여넣으세요') },
    ]},

  // Calendar
  { key: 'calendly', name: 'Calendly', icon: '📅', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='cal' cx='35%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%234DA3FF'/%3E%3Cstop offset='100%25' stop-color='%23006BFF'/%3E%3C/radialGradient%3E%3Cfilter id='calf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%23006BFF' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Crect x='10' y='14' width='60' height='56' rx='14' fill='url(%23cal)' filter='url(%23calf)'/%3E%3Crect x='10' y='14' width='60' height='18' rx='14' fill='rgba(0,0,0,.15)'/%3E%3Crect x='24' y='8' width='5' height='14' rx='2.5' fill='%23fff' opacity='.9'/%3E%3Crect x='51' y='8' width='5' height='14' rx='2.5' fill='%23fff' opacity='.9'/%3E%3Ccircle cx='40' cy='50' r='10' fill='%23fff' fill-opacity='.95'/%3E%3Cpath d='M36 50l3 3 6-6' fill='none' stroke='%23006BFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E", color: '#006BFF', available: true,
    desc: L('Importe vos rendez-vous dans le planning.',
            'Imports your appointments into the calendar.',
            '예약 일정을 캘린더에 가져옵니다.'),
    fields: [
      { key: 'apiKey', label: L('Token d\'accès personnel Calendly', 'Calendly personal access token', 'Calendly 개인 액세스 토큰'), type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiJ9...',
        hint: L(
          '1. Ouvrez <a href="https://calendly.com/integrations/api_webhooks" target="_blank">calendly.com/integrations/api_webhooks</a>\n2. Cliquez "Générer un nouveau token"\n3. Nom : Scalyo → Créer le token\n4. Copiez-le et collez-le ici',
          '1. Open <a href="https://calendly.com/integrations/api_webhooks" target="_blank">calendly.com/integrations/api_webhooks</a>\n2. Click "Generate new token"\n3. Name: Scalyo → Create token\n4. Copy and paste it here',
          '1. <a href="https://calendly.com/integrations/api_webhooks" target="_blank">calendly.com/integrations/api_webhooks</a>를 여세요\n2. "새 토큰 생성" 클릭\n3. 이름: Scalyo → 토큰 만들기\n4. 복사하여 여기에 붙여넣으세요') },
    ]},

  // Notifications
  { key: 'slack', name: 'Slack', icon: '💜', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3Cfilter id='slf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%234A154B' flood-opacity='.3'/%3E%3C/filter%3E%3C/defs%3E%3Crect x='4' y='4' width='72' height='72' rx='18' fill='%234A154B' filter='url(%23slf)'/%3E%3Cpath d='M26 44a5 5 0 01-5-5 5 5 0 015-5h5v5a5 5 0 01-5 5zm2.5 0a5 5 0 0110 0v12.5a5 5 0 01-10 0V44z' fill='%23E01E5A'/%3E%3Cpath d='M33.5 26a5 5 0 015-5 5 5 0 015 5v5h-5a5 5 0 01-5-5zm0 2.5a5 5 0 010 10H21a5 5 0 010-10h12.5z' fill='%2336C5F0'/%3E%3Cpath d='M51 33.5a5 5 0 015 5 5 5 0 01-5 5h-5v-5a5 5 0 015-5zm-2.5 0a5 5 0 01-10 0V21a5 5 0 0110 0v12.5z' fill='%232EB67D'/%3E%3Cpath d='M43.5 51a5 5 0 01-5 5 5 5 0 01-5-5v-5h5a5 5 0 015 5zm0-2.5a5 5 0 010-10H56a5 5 0 010 10H43.5z' fill='%23ECB22E'/%3E%3C/svg%3E", color: '#4A154B', available: true,
    desc: L('Recevez des alertes quand un compte client est en danger.',
            'Receive alerts when a customer account is at risk.',
            '고객 계정이 위험할 때 알림을 받으세요.'),
    fields: [
      { key: 'webhookUrl', label: L('Lien de notification Slack', 'Slack webhook URL', 'Slack 웹훅 URL'), type: 'url', placeholder: 'https://hooks.slack.com/services/...',
        hint: L(
          '1. Ouvrez <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a>\n2. Cliquez "Create New App" → "From scratch" → Nom : Scalyo\n3. Menu gauche : "Incoming Webhooks" → Activez-le\n4. Cliquez "Add New Webhook to Workspace" → Choisissez un canal (ex: #alertes)\n5. Copiez le "Webhook URL" et collez-le ici',
          '1. Open <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a>\n2. Click "Create New App" → "From scratch" → Name: Scalyo\n3. Left menu: "Incoming Webhooks" → Enable it\n4. Click "Add New Webhook to Workspace" → Choose a channel (e.g. #alerts)\n5. Copy the "Webhook URL" and paste it here',
          '1. <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a>를 여세요\n2. "Create New App" → "From scratch" → 이름: Scalyo 클릭\n3. 왼쪽 메뉴: "Incoming Webhooks" → 활성화\n4. "Add New Webhook to Workspace" 클릭 → 채널 선택 (예: #alerts)\n5. "Webhook URL"을 복사하여 여기에 붙여넣으세요') },
      { key: 'channel', label: L('Nom du canal (optionnel)', 'Channel name (optional)', '채널 이름 (선택사항)'), type: 'text', placeholder: L('#alertes-clients', '#customer-alerts', '#고객-알림'), optional: true,
        hint: L('Laissez vide pour utiliser le canal par défaut du webhook.',
                'Leave empty to use the webhook\'s default channel.',
                '비워두시면 웹훅의 기본 채널이 사용됩니다.') },
    ]},
  { key: 'teams', name: 'Microsoft Teams', icon: '🟦', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3CradialGradient id='tm' cx='35%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%23A0A4F5'/%3E%3Cstop offset='100%25' stop-color='%235B5FC7'/%3E%3C/radialGradient%3E%3Cfilter id='tmf'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='3' flood-color='%235B5FC7' flood-opacity='.4'/%3E%3C/filter%3E%3C/defs%3E%3Crect x='4' y='4' width='72' height='72' rx='18' fill='url(%23tm)' filter='url(%23tmf)'/%3E%3Ccircle cx='50' cy='24' r='8' fill='rgba(255,255,255,.25)'/%3E%3Crect x='42' y='30' width='22' height='18' rx='4' fill='rgba(255,255,255,.25)'/%3E%3Ccircle cx='32' cy='26' r='10' fill='%23fff' fill-opacity='.95'/%3E%3Crect x='14' y='32' width='36' height='26' rx='5' fill='%23fff' fill-opacity='.95'/%3E%3Cpath d='M24 42h16M32 38v8' stroke='%235B5FC7' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E", color: '#5B5FC7', available: true,
    desc: L('Recevez des alertes quand un compte client est en danger.',
            'Receive alerts when a customer account is at risk.',
            '고객 계정이 위험할 때 알림을 받으세요.'),
    fields: [
      { key: 'webhookUrl', label: L('Lien de notification Teams', 'Teams webhook URL', 'Teams 웹훅 URL'), type: 'url', placeholder: 'https://...webhook.office.com/...',
        hint: L(
          '1. Dans Teams, faites un clic droit sur un canal\n2. Cliquez "Connecteurs" (ou "Workflows")\n3. Cherchez "Incoming Webhook" → Configurer\n4. Nom : Scalyo → Créer\n5. Copiez le lien webhook et collez-le ici',
          '1. In Teams, right-click on a channel\n2. Click "Connectors" (or "Workflows")\n3. Search for "Incoming Webhook" → Configure\n4. Name: Scalyo → Create\n5. Copy the webhook URL and paste it here',
          '1. Teams에서 채널을 마우스 오른쪽 버튼으로 클릭하세요\n2. "커넥터" (또는 "워크플로") 클릭\n3. "Incoming Webhook" 검색 → 구성\n4. 이름: Scalyo → 만들기\n5. 웹훅 URL을 복사하여 여기에 붙여넣으세요') },
      { key: 'channel', label: L('Nom du canal (optionnel)', 'Channel name (optional)', '채널 이름 (선택사항)'), type: 'text', placeholder: L('#alertes-clients', '#customer-alerts', '#고객-알림'), optional: true,
        hint: L('Laissez vide pour utiliser le canal par défaut du webhook.',
                'Leave empty to use the webhook\'s default channel.',
                '비워두시면 웹훅의 기본 채널이 사용됩니다.') },
    ]},
])

const connectedList = computed(() => integrations.value.filter(i => connectedKeys.value.has(i.key)))
const availableList = computed(() => integrations.value.filter(i => i.available && !connectedKeys.value.has(i.key)))
const isEditing = computed(() => modal.value && connectedKeys.value.has(modal.value.key))

// Transforme les erreurs techniques en messages compréhensibles
function friendlyError(err) {
  const raw = err.response?.data?.error || err.message || ''
  const lower = raw.toLowerCase()
  if (err.code === 'ERR_NETWORK' || lower.includes('failed to fetch') || lower.includes('network'))
    return L('Problème de connexion internet. Vérifiez votre réseau et réessayez.',
             'Network connection issue. Check your internet and try again.',
             '인터넷 연결 문제가 발생했습니다. 네트워크를 확인하고 다시 시도해 주세요.')
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid') || lower.includes('expired') || lower.includes('invalide'))
    return L('Clé d\'accès invalide ou expirée. Vérifiez-la et réessayez.',
             'Invalid or expired access key. Please verify and try again.',
             '액세스 키가 유효하지 않거나 만료되었습니다. 확인 후 다시 시도해 주세요.')
  if (lower.includes('403') || lower.includes('forbidden'))
    return L('Accès refusé. Vérifiez les permissions de votre clé d\'accès.',
             'Access denied. Check your access key permissions.',
             '액세스가 거부되었습니다. 액세스 키 권한을 확인해 주세요.')
  if (lower.includes('500') || lower.includes('502') || lower.includes('503') || lower.includes('server'))
    return L('Le service est temporairement indisponible. Réessayez dans quelques minutes.',
             'The service is temporarily unavailable. Please try again in a few minutes.',
             '서비스를 일시적으로 사용할 수 없습니다. 몇 분 후에 다시 시도해 주세요.')
  if (lower.includes('429') || lower.includes('rate') || lower.includes('too many'))
    return L('Trop de requêtes. Attendez une minute puis réessayez.',
             'Too many requests. Please wait a minute and try again.',
             '요청이 너무 많습니다. 1분 후에 다시 시도해 주세요.')
  if (raw && /^[A-ZÀ-Ü]/.test(raw)) return raw
  return raw || L('Une erreur est survenue. Réessayez ou vérifiez votre configuration.',
                  'An error occurred. Please try again or check your configuration.',
                  '오류가 발생했습니다. 다시 시도하시거나 설정을 확인해 주세요.')
}

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
    loadError.value = friendlyError(err)
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
    connectError.value = t('fillRequired')
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
        const msg = friendlyError(syncErr)
        syncStatus.value[integKey] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
      }
    } catch (testErr) {
      const msg = friendlyError(testErr)
      syncStatus.value[integKey] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
    }

    connectSuccess.value = true
    setTimeout(() => { modal.value = null }, 800)
  } catch (err) {
    connectError.value = friendlyError(err)
  } finally {
    saving.value = false
  }
}

function confirmDisconnect(integ) {
  if (!confirm(t('disconnect') + ' ' + integ.name + ' ?')) return
  disconnectIntegration(integ)
}

async function disconnectIntegration(integ) {
  try {
    await integrationsApi.disconnect(integ.key)
    const newKeys = new Set(connectedKeys.value)
    newKeys.delete(integ.key)
    connectedKeys.value = newKeys
    delete connectedConfigs.value[integ.key]
    delete syncStatus.value[integ.key]
  } catch (err) {
    loadError.value = friendlyError(err)
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
  } catch (err) {
    const msg = friendlyError(err)
    syncStatus.value[integ.key] = { syncStatus: 'error', lastSyncAt: new Date().toISOString(), syncDetails: { error: msg } }
  } finally {
    syncing.value = null
  }
}

function formatSyncDetails(details) {
  if (!details || details.error) return ''
  const p = (n, fr, en, kr) => `${n} ${L(fr, en, kr)}`
  const parts = []
  if (details.contacts) parts.push(p(details.contacts, details.contacts > 1 ? 'contacts' : 'contact', details.contacts > 1 ? 'contacts' : 'contact', '개 연락처'))
  if (details.deals) parts.push(p(details.deals, details.deals > 1 ? 'deals' : 'deal', details.deals > 1 ? 'deals' : 'deal', '건 거래'))
  if (details.issues) parts.push(p(details.issues, details.issues > 1 ? 'tickets' : 'ticket', details.issues > 1 ? 'issues' : 'issue', '건 이슈'))
  if (details.tasks) parts.push(p(details.tasks, details.tasks > 1 ? 'tâches' : 'tâche', details.tasks > 1 ? 'tasks' : 'task', '건 작업'))
  if (details.events) parts.push(p(details.events, details.events > 1 ? 'événements' : 'événement', details.events > 1 ? 'events' : 'event', '건 이벤트'))
  if (details.tickets) parts.push(p(details.tickets, details.tickets > 1 ? 'tickets' : 'ticket', details.tickets > 1 ? 'tickets' : 'ticket', '건 티켓'))
  if (details.users) parts.push(p(details.users, details.users > 1 ? 'utilisateurs' : 'utilisateur', details.users > 1 ? 'users' : 'user', '명 사용자'))
  if (details.conversations) parts.push(p(details.conversations, details.conversations > 1 ? 'conversations' : 'conversation', details.conversations > 1 ? 'conversations' : 'conversation', '건 대화'))
  if (details.entries) parts.push(p(details.entries, details.entries > 1 ? 'entrées' : 'entrée', details.entries > 1 ? 'entries' : 'entry', '건 항목'))
  if (details.projects) parts.push(p(details.projects, details.projects > 1 ? 'projets' : 'projet', details.projects > 1 ? 'projects' : 'project', '건 프로젝트'))
  if (details.message) return details.message
  return parts.length ? `(${parts.join(', ')})` : ''
}

function hasDetailView(key) {
  return !['slack', 'teams'].includes(key)
}

function goToDetail(integ) {
  router.push({ name: 'integration-detail', params: { key: integ.key } })
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
  width: 56px; height: 56px; border-radius: 16px;
  display: grid; place-items: center; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.08), inset 0 1px 1px rgba(255,255,255,.25);
  position: relative;
  overflow: hidden;
}
.integ-icon-wrap::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 100%);
  border-radius: 16px 16px 0 0;
  pointer-events: none;
}
.integ-card-icon { font-size: 26px; position: relative; z-index: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,.15)); }
.integ-card-logo { width: 38px; height: 38px; object-fit: contain; position: relative; z-index: 1; filter: drop-shadow(0 2px 6px rgba(0,0,0,.25)); }
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
.integ-sync-details { display: block; font-size: 10px; font-weight: 400; opacity: 0.8; margin-top: 2px; }

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

.integ-disconnect-btn {
  margin-top: 8px; width: 100%; background: none; border: 1px solid var(--border);
  color: var(--red); font-size: 11px; padding: 6px 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.integ-disconnect-btn:hover { background: var(--redBg, #fef2f2); border-color: var(--red); }

.integ-saved-token {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 8px;
  background: var(--greenBg, #f0fdf4); border: 1px solid var(--greenBorder, #bbf7d0);
  color: var(--green); font-size: 13px; font-weight: 600;
}
.integ-change-btn {
  background: none; border: 1px solid var(--border); border-radius: 6px;
  padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;
  color: var(--muted); transition: all 0.15s;
}
.integ-change-btn:hover { border-color: var(--teal); color: var(--teal); }

@media (max-width: 768px) {
  .integ-grid { grid-template-columns: 1fr; }
}
</style>
