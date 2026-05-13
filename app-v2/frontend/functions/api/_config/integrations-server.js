export const INTEGRATIONS = {
  slack: { oauth: { provider: 'slack', authUrl: 'https://slack.com/oauth/v2/authorize', tokenUrl: 'https://slack.com/api/oauth.v2.access', scopes: ['channels:read', 'chat:write', 'incoming-webhook'], envKey: 'SLACK_CLIENT_ID', envSecret: 'SLACK_CLIENT_SECRET' } },
  hubspot: { oauth: { provider: 'hubspot', authUrl: 'https://app.hubspot.com/oauth/authorize', tokenUrl: 'https://api.hubapi.com/oauth/v1/token', scopes: ['crm.objects.contacts.read', 'crm.objects.deals.read'], envKey: 'HUBSPOT_CLIENT_ID', envSecret: 'HUBSPOT_CLIENT_SECRET' } },
  intercom: { oauth: { provider: 'intercom', authUrl: 'https://app.intercom.com/oauth', tokenUrl: 'https://api.intercom.io/auth/eagle/token', scopes: ['read_conversations', 'read_contacts'], envKey: 'INTERCOM_CLIENT_ID', envSecret: 'INTERCOM_CLIENT_SECRET' } },
  google_calendar: { oauth: { provider: 'google', authUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: ['https://www.googleapis.com/auth/calendar.readonly'], envKey: 'GOOGLE_CLIENT_ID', envSecret: 'GOOGLE_CLIENT_SECRET' } }
}
