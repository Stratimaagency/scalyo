export function fmtNum(n) {
  return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : String(n)
}

export function scoreColor(score) {
  if (score >= 70) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export function pct(count, total) {
  return total ? (count / total) * 100 : 0
}


export function fmtCurrency(amount, locale = 'fr', currency) {
  const MARKET_CURRENCY = { fr: 'EUR', en: 'USD', ko: 'KRW' }
  const cur = currency || MARKET_CURRENCY[locale] || 'EUR'
  const loc = locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'fr-FR'
  return new Intl.NumberFormat(loc, { style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}).format(amount)
}).format(amount)
}
