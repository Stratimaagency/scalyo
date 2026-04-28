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
