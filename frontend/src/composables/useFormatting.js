import { usePreferencesStore } from '../stores/preferences'

/**
 * Shared formatting utilities — eliminates duplicated ARR/currency/health logic.
 */
export function useFormatting() {
  const prefs = usePreferencesStore()

  function formatARR(value) {
    const num = Number(value) || 0
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF', CAD: 'CA$' }
    const symbol = symbols[prefs.currency] || '€'
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k ${symbol}`
    return `${num.toFixed(0)} ${symbol}`
  }

  function healthColor(val) {
    if (val >= 70) return 'var(--green)'
    if (val >= 40) return 'var(--orange)'
    return 'var(--red)'
  }

  function riskColor(risk) {
    const colors = { low: 'var(--green)', medium: 'var(--orange)', critical: 'var(--red)' }
    return colors[risk] || 'var(--muted)'
  }

  function formatDate(dateStr, locale) {
    if (!dateStr) return ''
    const lang = locale || prefs.lang || 'fr'
    const localeMap = { fr: 'fr-FR', en: 'en-US', kr: 'ko-KR' }
    return new Date(dateStr).toLocaleDateString(localeMap[lang] || 'fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return { formatARR, healthColor, riskColor, formatDate }
}
