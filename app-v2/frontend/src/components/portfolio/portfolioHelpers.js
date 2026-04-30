/**
 * Portfolio View — Shared helpers
 */

export function fmtNum(n) {
  return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M'
    : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K'
    : String(n)
}

export function fmtDate(d, locale) {
  if (!d) return '—'
  const loc = locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'fr-FR'
  return new Date(d).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function sClass(s) {
  return s === 'healthy' ? 'green' : s === 'watch' ? 'amber' : 'red'
}

export function renewSoon(c) {
  const d = new Date(c.renewalDate)
  return d.getTime() - Date.now() < 45 * 864e5 && d >= new Date()
}
