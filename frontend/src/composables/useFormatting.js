import { usePreferencesStore } from '../stores/preferences'

/**
 * Full CURRENCIES map matching app.html (10 currencies with position support).
 */
export const CURRENCIES = {
  EUR: { symbol: '€', position: 'after', name: 'Euro' },
  USD: { symbol: '$', position: 'before', name: 'US Dollar' },
  GBP: { symbol: '£', position: 'before', name: 'British Pound' },
  CHF: { symbol: 'CHF', position: 'after', name: 'Swiss Franc' },
  CAD: { symbol: 'CA$', position: 'before', name: 'Canadian Dollar' },
  MAD: { symbol: 'DH', position: 'after', name: 'Dirham marocain' },
  XOF: { symbol: 'CFA', position: 'after', name: 'Franc CFA' },
  AED: { symbol: 'AED', position: 'before', name: 'Dirham UAE' },
  SAR: { symbol: 'SAR', position: 'before', name: 'Riyal saoudien' },
  KRW: { symbol: '₩', position: 'before', name: 'Won coréen' },
}

/**
 * Shared formatting utilities — matches app.html helper functions exactly.
 */
export function useFormatting() {
  const prefs = usePreferencesStore()

  /** Format a number with currency symbol respecting position (before/after). */
  function fmtCur(num, cur) {
    const c = CURRENCIES[cur || prefs.currency] || CURRENCIES.EUR
    return c.position === 'before' ? `${c.symbol}${num}` : `${num}${c.symbol}`
  }

  /** Format MRR value (e.g. 12500 → "12.5K€" or "$12.5K"). */
  function fmtMRR(v, cur) {
    const val = Number(v) || 0
    const num = val >= 10000 ? `${(val / 1000).toFixed(0)}K` : `${(val / 1000).toFixed(1)}K`
    return fmtCur(num, cur)
  }

  /** Format ARR from MRR (MRR × 12). */
  function fmtARR(v, cur) {
    const mrr = Number(v) || 0
    const a = mrr * 12
    let num
    if (a >= 1000000) num = `${(a / 1000000).toFixed(1)}M`
    else if (a >= 1000) num = `${(a / 1000).toFixed(0)}K`
    else num = `${a}`
    return fmtCur(num, cur)
  }

  /** Legacy formatARR (takes raw value, not MRR). */
  function formatARR(value, cur) {
    const num = Number(value) || 0
    if (num >= 1000000) return fmtCur(`${(num / 1000000).toFixed(1)}M`, cur)
    if (num >= 1000) return fmtCur(`${(num / 1000).toFixed(0)}K`, cur)
    return fmtCur(`${num}`, cur)
  }

  function healthColor(val) {
    if (val >= 70) return 'var(--green)'
    if (val >= 40) return 'var(--amber)'
    return 'var(--red)'
  }

  function riskColor(risk) {
    const colors = { low: 'var(--green)', medium: 'var(--amber)', critical: 'var(--red)' }
    return colors[risk] || 'var(--muted)'
  }

  function riskLabel(risk, lang) {
    const l = lang || prefs.lang || 'fr'
    if (risk === 'critical') return l === 'en' ? 'Critical' : l === 'kr' ? '위험' : 'Critique'
    if (risk === 'medium') return l === 'en' ? 'Watch' : l === 'kr' ? '주의' : 'Vigilance'
    return l === 'en' ? 'Healthy' : l === 'kr' ? '건강' : 'Sain'
  }

  function formatDate(dateStr, locale) {
    if (!dateStr) return ''
    const lang = locale || prefs.lang || 'fr'
    const localeMap = { fr: 'fr-FR', en: 'en-US', kr: 'ko-KR' }
    return new Date(dateStr).toLocaleDateString(localeMap[lang] || 'fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  function todayFormatted(lang) {
    const l = lang || prefs.lang || 'fr'
    const locale = l === 'en' ? 'en-US' : l === 'kr' ? 'ko-KR' : 'fr-FR'
    return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function planColor(plan) {
    if (plan === 'Elite') return 'var(--purple)'
    if (plan === 'Growth') return 'var(--teal)'
    return 'var(--blue)'
  }

  /** Safe JSON array parser — matches app.html safeParseArray. */
  function parseItems(items) {
    if (!items) return []
    if (Array.isArray(items)) return items
    try { return JSON.parse(items) } catch { return [] }
  }

  return {
    fmtCur, fmtMRR, fmtARR, formatARR,
    healthColor, riskColor, riskLabel,
    formatDate, todayFormatted, planColor, parseItems,
    CURRENCIES,
  }
}
