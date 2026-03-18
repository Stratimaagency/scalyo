<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('integrationsTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('integrationsDesc') }}</p>
    </div>

    <!-- Available integrations -->
    <div class="mb-lg">
      <h4 style="font-weight: 700; font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--green);"></span>
        {{ t('integrationsAvailable') }}
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
        <AppCard v-for="integ in availableIntegrations" :key="integ.key" class="card-lift">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            <div style="font-size: 28px;">{{ integ.icon }}</div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
              <span class="tag risk-low" style="font-size: 10px; padding: 2px 8px;">{{ t('integrationsActive') }}</span>
            </div>
          </div>
          <p style="font-size: 12px; color: var(--muted); line-height: 1.6;">{{ integ.desc }}</p>
        </AppCard>
      </div>
    </div>

    <!-- Coming soon -->
    <div class="mb-lg">
      <h4 style="font-weight: 700; font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--amber);"></span>
        {{ t('integrationsComingSoon') }}
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
        <AppCard v-for="integ in comingSoonIntegrations" :key="integ.key">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            <div style="font-size: 28px; opacity: 0.6;">{{ integ.icon }}</div>
            <div>
              <div style="font-weight: 700; font-size: 14px;">{{ integ.name }}</div>
              <span class="tag" style="font-size: 10px; padding: 2px 8px; background: var(--surface); border: 1px solid var(--border);">{{ t('integrationsPlanned') }}</span>
            </div>
          </div>
          <p style="font-size: 12px; color: var(--muted); line-height: 1.6;">{{ integ.desc }}</p>
          <button v-if="!integ.voted" class="btn btn-secondary" style="margin-top: 10px; font-size: 11px; padding: 6px 14px;" @click="voteIntegration(integ)">
            {{ t('integrationsVote') }}
          </button>
          <span v-else style="font-size: 11px; color: var(--teal); font-weight: 600; margin-top: 10px; display: block;">
            {{ t('integrationsVoted') }}
          </span>
        </AppCard>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import AppCard from '../components/AppCard.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()

const integrationsList = ref([
  { key: 'csv', name: 'Import CSV', icon: '📄', available: true, desc: 'Importez votre portefeuille client depuis un fichier CSV en un clic.', voted: false },
  { key: 'excel', name: 'Import Excel', icon: '📊', available: true, desc: 'Importez vos données depuis des fichiers Excel (.xlsx).', voted: false },
  { key: 'stripe', name: 'Stripe', icon: '💳', available: true, desc: 'Facturation et gestion des abonnements intégrée.', voted: false },
  { key: 'hubspot', name: 'HubSpot CRM', icon: '🟠', available: false, desc: 'Synchronisez vos contacts, deals et comptes HubSpot automatiquement.', voted: false },
  { key: 'salesforce', name: 'Salesforce', icon: '☁️', available: false, desc: 'Connectez votre CRM Salesforce pour importer comptes et opportunités.', voted: false },
  { key: 'pipedrive', name: 'Pipedrive', icon: '🟢', available: false, desc: 'Synchronisez vos deals et contacts Pipedrive avec Scalyo.', voted: false },
  { key: 'intercom', name: 'Intercom', icon: '💬', available: false, desc: 'Enrichissez vos comptes avec les données de conversations Intercom.', voted: false },
  { key: 'slack', name: 'Slack', icon: '💜', available: false, desc: 'Recevez les alertes churn et bien-être directement dans Slack.', voted: false },
  { key: 'zendesk', name: 'Zendesk', icon: '🟡', available: false, desc: 'Connectez vos tickets support pour enrichir le health score.', voted: false },
  { key: 'segment', name: 'Segment', icon: '🟣', available: false, desc: 'Collectez les données produit pour un health score data-driven.', voted: false },
])

const availableIntegrations = computed(() => integrationsList.value.filter(i => i.available))
const comingSoonIntegrations = computed(() => integrationsList.value.filter(i => !i.available))

function voteIntegration(integ) {
  integ.voted = true
}
</script>
