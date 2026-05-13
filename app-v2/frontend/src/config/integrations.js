/**
 * Integration Registry — Source of truth for all available integrations
 * Adding a new integration = adding an entry here. Zero hardcode in components.
 */

export const CATEGORIES = {
  crm: { id: 'crm', label: { fr: 'CRM', en: 'CRM', ko: 'CRM' }, icon: 'ti-address-book' },
  communication: { id: 'communication', label: { fr: 'Communication', en: 'Communication', ko: '\uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158' }, icon: 'ti-message-circle' },
  support: { id: 'support', label: { fr: 'Support client', en: 'Customer support', ko: '\uACE0\uAC1D \uC9C0\uC6D0' }, icon: 'ti-headset' },
  analytics: { id: 'analytics', label: { fr: 'Analytique', en: 'Analytics', ko: '\uBD84\uC11D' }, icon: 'ti-chart-bar' },
  automation: { id: 'automation', label: { fr: 'Automatisation', en: 'Automation', ko: '\uC790\uB3D9\uD654' }, icon: 'ti-robot' },
  calendar: { id: 'calendar', label: { fr: 'Calendrier', en: 'Calendar', ko: '\uCE98\uB9B0\uB354' }, icon: 'ti-calendar' }
}

export const CAPABILITY_TYPES = {
  sync_contacts: { label: { fr: 'Synchroniser les contacts', en: 'Sync contacts', ko: '\uC5F0\uB77D\uCC98 \uB3D9\uAE30\uD654' }, icon: 'ti-users' },
  send_notification: { label: { fr: 'Envoyer des notifications', en: 'Send notifications', ko: '\uC54C\uB9BC \uBCF4\uB0B4\uAE30' }, icon: 'ti-bell' },
  import_tickets: { label: { fr: 'Importer les tickets', en: 'Import tickets', ko: '\uD2F0\uCF13 \uAC00\uC838\uC624\uAE30' }, icon: 'ti-ticket' },
  import_deals: { label: { fr: 'Importer les deals', en: 'Import deals', ko: '\uAC70\uB798 \uAC00\uC838\uC624\uAE30' }, icon: 'ti-currency-euro' },
  import_usage: { label: { fr: 'Donnees usage', en: 'Usage data', ko: '\uC0AC\uC6A9 \uB370\uC774\uD130' }, icon: 'ti-chart-dots' },
  send_email: { label: { fr: 'Envoyer des emails', en: 'Send emails', ko: '\uC774\uBA54\uC77C \uBCF4\uB0B4\uAE30' }, icon: 'ti-mail' },
  webhook_receive: { label: { fr: 'Webhooks temps reel', en: 'Real-time webhooks', ko: '\uC2E4\uC2DC\uAC04 \uC6F9\uD6C5' }, icon: 'ti-webhook' },
  calendar_sync: { label: { fr: 'Calendrier', en: 'Calendar sync', ko: '\uCE98\uB9B0\uB354 \uB3D9\uAE30\uD654' }, icon: 'ti-calendar-event' }
}

export const INTEGRATIONS = {
  slack: { id: 'slack', name: 'Slack', icon: 'ti-brand-slack', category: 'communication', color: '#4A154B', plan: 'growth', status: 'available',
    label: { fr: 'Alertes CS dans vos canaux Slack', en: 'CS alerts in your Slack channels', ko: 'Slack \uCC44\uB110\uC5D0\uC11C CS \uC54C\uB9BC' },
    description: { fr: 'Notifications churn, renouvellements et alertes directement dans Slack.', en: 'Churn notifications, renewals and alerts directly in Slack.', ko: 'Slack\uC5D0\uC11C \uC9C1\uC811 \uC774\uD0C8 \uC54C\uB9BC\uACFC \uAC31\uC2E0\uC744 \uBC1B\uC73C\uC138\uC694.' },
    capabilities: ['send_notification', 'webhook_receive'],
    oauth: { provider: 'slack', authUrl: 'https://slack.com/oauth/v2/authorize', tokenUrl: 'https://slack.com/api/oauth.v2.access', scopes: ['channels:read', 'chat:write', 'incoming-webhook'], envKey: 'SLACK_CLIENT_ID', envSecret: 'SLACK_CLIENT_SECRET' },
    configFields: [
      { key: 'channel', type: 'text', label: { fr: 'Canal', en: 'Channel', ko: '\uCC44\uB110' }, placeholder: '#cs-alerts' },
      { key: 'notify_churn', type: 'toggle', label: { fr: 'Alertes churn', en: 'Churn alerts', ko: '\uC774\uD0C8 \uC54C\uB9BC' }, default: true },
      { key: 'notify_renewal', type: 'toggle', label: { fr: 'Renouvellements', en: 'Renewals', ko: '\uAC31\uC2E0' }, default: true },
      { key: 'notify_health', type: 'toggle', label: { fr: 'Changement sante', en: 'Health changes', ko: '\uAC74\uAC15 \uBCC0\uACBD' }, default: true }
    ]
  },
  hubspot: { id: 'hubspot', name: 'HubSpot', icon: 'ti-hexagon-letter-h', category: 'crm', color: '#FF7A59', plan: 'growth', status: 'available',
    label: { fr: 'Synchronisez contacts et deals HubSpot', en: 'Sync HubSpot contacts and deals', ko: 'HubSpot \uC5F0\uB77D\uCC98\uC640 \uAC70\uB798 \uB3D9\uAE30\uD654' },
    description: { fr: 'Import auto contacts et opportunites. Enrichissement health score et COPIL.', en: 'Auto-import contacts and opportunities. Enriches health score and COPIL.', ko: '\uC5F0\uB77D\uCC98\uC640 \uAE30\uD68C\uB97C \uC790\uB3D9 \uAC00\uC838\uC635\uB2C8\uB2E4.' },
    capabilities: ['sync_contacts', 'import_deals', 'webhook_receive'],
    oauth: { provider: 'hubspot', authUrl: 'https://app.hubspot.com/oauth/authorize', tokenUrl: 'https://api.hubapi.com/oauth/v1/token', scopes: ['crm.objects.contacts.read', 'crm.objects.deals.read'], envKey: 'HUBSPOT_CLIENT_ID', envSecret: 'HUBSPOT_CLIENT_SECRET' },
    configFields: [
      { key: 'sync_interval', type: 'select', label: { fr: 'Frequence sync', en: 'Sync frequency', ko: '\uB3D9\uAE30\uD654 \uBE48\uB3C4' }, options: [{ value: '1h', label: { fr: '1h', en: '1h', ko: '1\uC2DC\uAC04' } }, { value: '6h', label: { fr: '6h', en: '6h', ko: '6\uC2DC\uAC04' } }, { value: '24h', label: { fr: '24h', en: '24h', ko: '24\uC2DC\uAC04' } }] },
      { key: 'auto_create', type: 'toggle', label: { fr: 'Creer clients auto', en: 'Auto-create clients', ko: '\uC790\uB3D9 \uD074\uB77C\uC774\uC5B8\uD2B8 \uC0DD\uC131' }, default: false }
    ]
  },
  intercom: { id: 'intercom', name: 'Intercom', icon: 'ti-message-dots', category: 'support', color: '#286EFA', plan: 'growth', status: 'available',
    label: { fr: 'Conversations et tickets Intercom', en: 'Intercom conversations and tickets', ko: 'Intercom \uB300\uD654\uC640 \uD2F0\uCF13' },
    description: { fr: 'Tickets ouverts dans notifications et health score.', en: 'Open tickets surface in notifications and health score.', ko: '\uC5F4\uB9B0 \uD2F0\uCF13\uC774 \uC54C\uB9BC\uACFC \uAC74\uAC15 \uC810\uC218\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.' },
    capabilities: ['import_tickets', 'sync_contacts', 'webhook_receive'],
    oauth: { provider: 'intercom', authUrl: 'https://app.intercom.com/oauth', tokenUrl: 'https://api.intercom.io/auth/eagle/token', scopes: ['read_conversations', 'read_contacts'], envKey: 'INTERCOM_CLIENT_ID', envSecret: 'INTERCOM_CLIENT_SECRET' },
    configFields: [
      { key: 'import_closed', type: 'toggle', label: { fr: 'Tickets fermes', en: 'Closed tickets', ko: '\uB2EB\uD78C \uD2F0\uCF13' }, default: false },
      { key: 'health_impact', type: 'toggle', label: { fr: 'Impact health score', en: 'Health score impact', ko: '\uAC74\uAC15 \uC810\uC218 \uC601\uD5A5' }, default: true }
    ]
  },
  zapier: { id: 'zapier', name: 'Zapier', icon: 'ti-bolt', category: 'automation', color: '#FF4A00', plan: 'growth', status: 'available',
    label: { fr: 'Connectez 5000+ outils via Zapier', en: 'Connect 5000+ tools via Zapier', ko: 'Zapier\uB85C 5000\uAC1C \uC774\uC0C1 \uB3C4\uAD6C \uC5F0\uACB0' },
    description: { fr: 'Declenchez des actions dans vos outils quand un evenement Scalyo se produit.', en: 'Trigger actions in your tools when a Scalyo event happens.', ko: 'Scalyo \uC774\uBCA4\uD2B8 \uBC1C\uC0DD \uC2DC \uB3C4\uAD6C\uC5D0\uC11C \uC791\uC5C5\uC744 \uD2B8\uB9AC\uAC70\uD569\uB2C8\uB2E4.' },
    capabilities: ['webhook_receive', 'send_notification'], webhookBased: true,
    configFields: [
      { key: 'webhook_url', type: 'text', label: { fr: 'URL webhook Zapier', en: 'Zapier webhook URL', ko: 'Zapier \uC6F9\uD6C5 URL' }, placeholder: 'https://hooks.zapier.com/...' },
      { key: 'trigger_churn', type: 'toggle', label: { fr: 'Sur alerte churn', en: 'On churn alert', ko: '\uC774\uD0C8 \uC54C\uB9BC \uC2DC' }, default: true },
      { key: 'trigger_new_client', type: 'toggle', label: { fr: 'Sur nouveau client', en: 'On new client', ko: '\uC0C8 \uACE0\uAC1D \uC2DC' }, default: true }
    ]
  },
  zendesk: { id: 'zendesk', name: 'Zendesk', icon: 'ti-headset', category: 'support', color: '#03363D', plan: 'elite', status: 'coming_soon',
    label: { fr: 'Support Zendesk', en: 'Zendesk support', ko: 'Zendesk \uC9C0\uC6D0' },
    description: { fr: 'Importez tickets et enrichissez le suivi client.', en: 'Import tickets and enrich client tracking.', ko: '\uD2F0\uCF13\uC744 \uAC00\uC838\uC624\uACE0 \uACE0\uAC1D \uCD94\uC801\uC744 \uD5A5\uC0C1\uC2DC\uD0B5\uB2C8\uB2E4.' },
    capabilities: ['import_tickets', 'webhook_receive'], oauth: {}, configFields: []
  },
  salesforce: { id: 'salesforce', name: 'Salesforce', icon: 'ti-cloud', category: 'crm', color: '#00A1E0', plan: 'elite', status: 'coming_soon',
    label: { fr: 'Synchronisez Salesforce', en: 'Sync Salesforce', ko: 'Salesforce \uB3D9\uAE30\uD654' },
    description: { fr: 'Comptes, contacts et opportunites CRM.', en: 'Accounts, contacts and CRM opportunities.', ko: '\uACC4\uC815, \uC5F0\uB77D\uCC98 \uBC0F CRM \uAE30\uD68C.' },
    capabilities: ['sync_contacts', 'import_deals', 'webhook_receive'], oauth: {}, configFields: []
  },
  mixpanel: { id: 'mixpanel', name: 'Mixpanel', icon: 'ti-chart-dots', category: 'analytics', color: '#7856FF', plan: 'elite', status: 'coming_soon',
    label: { fr: 'Donnees usage produit', en: 'Product usage data', ko: '\uC81C\uD488 \uC0AC\uC6A9 \uB370\uC774\uD130' },
    description: { fr: 'Health score enrichi avec activite utilisateurs.', en: 'Health score enriched with user activity.', ko: '\uC0AC\uC6A9\uC790 \uD65C\uB3D9\uC73C\uB85C \uAC74\uAC15 \uC810\uC218 \uD5A5\uC0C1.' },
    capabilities: ['import_usage', 'webhook_receive'], oauth: {}, configFields: []
  },
  google_calendar: { id: 'google_calendar', name: 'Google Calendar', icon: 'ti-calendar', category: 'calendar', color: '#4285F4', plan: 'growth', status: 'coming_soon',
    label: { fr: 'Rendez-vous clients', en: 'Client meetings', ko: '\uACE0\uAC1D \uBBF8\uD305' },
    description: { fr: 'QBR et onboarding calls dans le timeline client.', en: 'QBRs and onboarding calls in client timeline.', ko: 'QBR\uACFC \uC628\uBCF4\uB529 \uCF5C\uC774 \uACE0\uAC1D \uD0C0\uC784\uB77C\uC778\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.' },
    capabilities: ['calendar_sync'], oauth: {}, configFields: []
  }
}

export function getIntegration(id) { return INTEGRATIONS[id] || null }

export function getIntegrationsByCategory(locale = 'fr') {
  const grouped = {}
  for (const integ of Object.values(INTEGRATIONS)) {
    const cat = integ.category
    if (!grouped[cat]) grouped[cat] = { ...CATEGORIES[cat], displayLabel: CATEGORIES[cat]?.label?.[locale] || cat, integrations: [] }
    grouped[cat].integrations.push(integ)
  }
  return Object.values(grouped)
}

export function getAvailableForPlan(plan) {
  const order = { starter: 0, growth: 1, elite: 2, enterprise: 3 }
  const level = order[plan] ?? -1
  return Object.values(INTEGRATIONS).filter(i => (order[i.plan] ?? 0) <= level)
}

export function getCapabilityInfo(capId, locale = 'fr') {
  const cap = CAPABILITY_TYPES[capId]
  if (!cap) return { label: capId, icon: 'ti-plug' }
  return { label: cap.label[locale] || cap.label.fr, icon: cap.icon }
}
