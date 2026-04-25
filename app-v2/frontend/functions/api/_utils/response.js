import { t } from '../_i18n/messages.js'

export function jsonOk(data) {
  return Response.json(data, { status: 200 })
}

export function jsonError(messageKey, status = 400, lang = 'fr') {
  return Response.json({ error: t(messageKey, lang) }, { status })
}
