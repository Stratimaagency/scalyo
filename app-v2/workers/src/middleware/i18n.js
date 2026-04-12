import { messages } from '../i18n/messages.js'

export function detectLanguage(request) {
  const url = new URL(request.url)
  const langParam = url.searchParams.get('lang')
  if (langParam && ['fr', 'en', 'ko'].includes(langParam)) return langParam

  const accept = request.headers.get('Accept-Language') || ''
  const primary = accept.split(',')[0].split('-')[0].toLowerCase()
  if (['fr', 'en', 'ko'].includes(primary)) return primary

  return 'fr'
}

export function t(lang, key, params = {}) {
  const keys = key.split('.')
  let value = messages[lang] || messages.fr
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to French
      let fb = messages.fr
      for (const fk of keys) fb = fb?.[fk]
      value = fb
      break
    }
  }
  if (typeof value !== 'string') return key
  return value.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? params[k] : `{${k}}`)
}
