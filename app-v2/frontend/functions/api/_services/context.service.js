import { getConfig } from '../_config/index.js'

export function getUserIdFromJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub || null
  } catch { return null }
}

async function query(env, table, userId, userJwt) {
  const config = getConfig(env)
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null
  const url = config.supabaseUrl + '/rest/v1/' + table + '?select=*&user_id=eq.' + userId
  const res = await fetch(url, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: 'Bearer ' + userJwt,
    }
  })
  return res.ok ? res.json() : null
}

export async function buildRichContext(env, userId, userJwt) {
  if (!userId || !userJwt) return { summary: '' }

  const [clients, tasks] = await Promise.all([
    query(env, 'clients', userId, userJwt),
    query(env, 'tasks', userId, userJwt),
  ])

  const cl = clients || []
  const tk = tasks || []
  const now = new Date()
  const urgent = cl.filter(c => (c.health_score || 10) < 4)
  const renewSoon = cl.filter(c => c.renewal_date && (new Date(c.renewal_date) - now) / 86400000 < 30)
  const overdue = tk.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done')
  const totalArr = cl.reduce((s, c) => s + (c.arr || (c.mrr || 0) * 12 || 0), 0)
  const avgHealth = cl.length ? (cl.reduce((s, c) => s + (c.health_score || 0), 0) / cl.length).toFixed(1) : 0

  let summary = 'PORTFOLIO: ' + cl.length + ' clients, ARR ' + totalArr + ' EUR, Health moyen ' + avgHealth + '/10'
  if (urgent.length) {
    summary += '\nURGENCES (' + urgent.length + '):'
    urgent.forEach(c => { summary += '\n- ' + (c.company_name || c.name) + ': Health ' + c.health_score + '/10' + (c.renewal_date ? ', renouvellement ' + c.renewal_date : '') })
  }
  if (renewSoon.length) {
    summary += '\nRENOUVELLEMENTS < 30j (' + renewSoon.length + '):'
    renewSoon.forEach(c => { summary += '\n- ' + (c.company_name || c.name) + ': ' + c.renewal_date + ', Health ' + (c.health_score || '?') + '/10' })
  }
  if (overdue.length) {
    summary += '\nTACHES EN RETARD (' + overdue.length + '):'
    overdue.slice(0, 5).forEach(t => { summary += '\n- ' + t.title + ' (due: ' + t.due_date + ')' })
  }
  return { summary }
}
