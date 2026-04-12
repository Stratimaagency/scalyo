<template>
  <div class="integ-view">
    <div class="iv-header">
      <h1>🔌 {{ t('integ_title') }}</h1>
      <p class="iv-sub">{{ t('integ_subtitle') }}</p>
    </div>

    <h2 class="iv-section-title">● {{ t('integ_available') }}</h2>

    <div class="iv-grid">
      <div v-for="ig in integrations" :key="ig.name" class="iv-card">
        <span class="iv-icon">{{ ig.icon }}</span>
        <div class="iv-info">
          <strong>{{ ig.name }}</strong>
          <p>{{ ig.desc }}</p>
        </div>
        <button class="btn-connect">{{ t('integ_connect') }}</button>
      </div>
    </div>

    <div class="iv-missing">
      <div class="ivm-icon">⚡</div>
      <div class="ivm-text">
        <strong>{{ t('integ_missing') }}</strong>
        <p>{{ t('integ_missing_desc') }}</p>
      </div>
      <button class="btn-outline">{{ t('integ_suggest') }}</button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })

const integrations = [
  { name: 'HubSpot', icon: '🟠', desc: 'Importe automatiquement vos contacts et deals dans le portefeuille' },
  { name: 'Pipedrive', icon: '🟢', desc: 'Importe vos contacts et deals dans le portefeuille' },
  { name: 'Intercom', icon: '🔵', desc: 'Importe vos contacts et conversations dans le portefeuille' },
  { name: 'Zendesk', icon: '🟣', desc: 'Importe vos tickets de support et contacts clients' },
  { name: 'Jira', icon: '🔷', desc: 'Importe vos tickets et tâches dans le Task Board' },
  { name: 'Notion', icon: '⬛', desc: 'Importe vos bases de données et pages dans Scalyo' },
  { name: 'Asana', icon: '🌈', desc: 'Importe vos tâches et projets dans le Task Board' },
  { name: 'Calendly', icon: '📅', desc: 'Importe vos rendez-vous dans le planning' },
  { name: 'Gmail / Google Workspace', icon: '📧', desc: 'Connectez votre compte Gmail pour envoyer des emails et devis depuis Scalyo' },
  { name: 'Outlook / Microsoft 365', icon: '📬', desc: 'Connectez votre compte Outlook pour envoyer des emails et devis depuis Scalyo' },
  { name: 'SMTP personnalisé', icon: '⚙️', desc: 'Connectez n\'importe quel serveur SMTP (OVH, Ionos, Infomaniak, etc.)' },
  { name: 'Slack', icon: '💬', desc: 'Recevez des alertes quand un compte client est en danger' },
  { name: 'Microsoft Teams', icon: '💜', desc: 'Recevez des alertes quand un compte client est en danger' },
]
</script>

<style scoped>
.integ-view { max-width: 1100px; }
.iv-header { margin-bottom: 28px; }
.iv-header h1 { font-size: 1.5rem; font-weight: 800; }
.iv-sub { font-size: 0.88rem; color: var(--text-secondary); margin-top: 4px; }

.iv-section-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--green); }

.iv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 32px; }
.iv-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s; }
.iv-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); border-color: var(--green-border); }
.iv-icon { font-size: 2rem; }
.iv-info strong { font-size: 0.92rem; display: block; margin-bottom: 4px; }
.iv-info p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; }
.btn-connect { background: var(--green); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; align-self: flex-start; }
.btn-connect:hover { background: var(--green-dark); }

.iv-missing { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; flex-wrap: wrap; }
.ivm-icon { font-size: 2rem; }
.ivm-text { flex: 1; min-width: 200px; }
.ivm-text strong { font-size: 0.95rem; display: block; margin-bottom: 4px; }
.ivm-text p { font-size: 0.82rem; color: var(--text-secondary); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

@media (max-width: 600px) { .iv-grid { grid-template-columns: 1fr; } }
</style>
