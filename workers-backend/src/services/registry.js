// Central registry — maps integration_key to its service module

import * as slack from './slack.js'
import * as teams from './teams.js'
import * as hubspot from './hubspot.js'
import * as pipedrive from './pipedrive.js'
import * as intercom from './intercom.js'
import * as jira from './jira.js'
import * as asana from './asana.js'
import * as zendesk from './zendesk.js'
import * as notion from './notion.js'
import * as calendly from './calendly.js'

const services = {
  slack,
  teams,
  hubspot,
  pipedrive,
  intercom,
  jira,
  asana,
  zendesk,
  notion,
  calendly,
}

export function getService(key) {
  return services[key] || null
}
