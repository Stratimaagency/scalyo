import { getConfig } from '../_config/index.js'

export function getUserIdFromJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || null
  } catch { return null }
}

async function query(env, table, filters) {
  const config = getConfig(env)
  if (!config.supabaseUrl || !config.supabaseServiceKey) return null
  const params = Object.entries(filters).map(([k, v]) => k + '=eq.' + v).join('&')
  const url = config.supabaseUrl + '/rest/v1/' + table + '?select=*&' + params
  const res = await fetch(url, {
    headers: { apikey: config.supabaseServiceKey, Authorization: 'Bearer ' + config.supabaseServiceKey }
  })
  return res.ok ? res.json() : null
}

export async function buildRichContext(env, userId) {
  if (!userId) return { summary: '', clients: [], tasks: [] }

  const [clients, tasks] = await Promise.all([
    query(env, 'clients', { user_id: userId }),
    query(env, 'tasks', { user_id: userId }),
  ])

  const cl = clients || []
  const tk = tasks || []
  const now = new Date()
  const urgent = cl.filter(c => (c.health_score || 10) < 4)
  const renewSoon = cl.filter(c => {
    if (!c.renewal_date) return false
    return (new Date(c.renewal_date) - now) / 86400000 < 30
  })
  const overdue = tk.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "done")
  const totalArr = cl.reduce((s, c) => s + (c.arr || c.mrr * 12 || 0), 0)
  const avgHealth = cl.length ? (cl.reduce((s, c) => s + (c.health_score || 0), 0) / cl.length).toFixed(1) : 0

  let summary = "PORTFOLIO: " + cl.length + " clients, ARR " + totalArr + "\u20ac, Health moyen " + avgHealth + "/10\n"
  if (urgent.length) {
    summary += "\n\ud83d\udd34 URGENCES (" + urgent.length + "):\n"
    urgent.forEach(c => { summary += "- " + (c.company_name || c.name) + ": Health " + c.health_score + "/10" + (c.renewal_date ? ", renouvellement " + c.renewal_date : "") + "\n" })
  }
  if (renewSoon.length) {
    summary += "\n\u26a0\ufe0f RENOUVELLEMENTS < 30j (" + renewSoon.length + "):\n"
    renewSoon.forEach(c => { summary += "- " + (c.company_name || c.name) + ": " + c.renewal_date + ", Health " + (c.health_score || "?") + "/10\n" })
  }
  if (overdue.length) {
    summary += "\n\ud83d\udcc5 TACHES EN RETARD (" + overdue.length + "):\n"
    overdue.slice(0, 5).forEach(t => { summary += "- " + t.title + " (due: " + t.due_date + ")\n" })
  }
  return { summary, clients: cl, tasks: tk, urgent, renewSoon, overdue }
}
