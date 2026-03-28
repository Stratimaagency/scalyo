// Central registry — maps integration_key to its service module

import * as slack from './slack.js'
import * as teams from './teams.js'
import * as hubspot from './hubspot.js'
import * as pipedrive from './pipedrive.js'
import * as salesforce from './salesforce.js'
import * as intercom from './intercom.js'
import * as jira from './jira.js'
import * as asana from './asana.js'
import * as gmail from './gmail.js'
import * as outlook from './outlook.js'
import * as googleMeet from './google-meet.js'
import * as zoom from './zoom.js'
import * as calendly from './calendly.js'
import * as whatsapp from './whatsapp.js'
import * as zendesk from './zendesk.js'
import * as notion from './notion.js'

const services = {
  slack,
  teams,
  hubspot,
  salesforce,
  pipedrive,
  intercom,
  jira,
  asana,
  gmail,
  outlook,
  imap: null,
  'google-meet': googleMeet,
  zoom,
  calendly,
  whatsapp,
  zendesk,
  notion,
}

// OAuth integrations — Gmail/Outlook/Google Meet removed (use app password instead)
export const OAUTH_INTEGRATIONS = {}

export function getService(key) {
  return services[key] || null
}

export function isOAuth(key) {
  return key in OAUTH_INTEGRATIONS
}

export function getOAuthProvider(key) {
  return OAUTH_INTEGRATIONS[key] || null
}
