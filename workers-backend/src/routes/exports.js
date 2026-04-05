import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const exports_ = new Hono()
exports_.use('/*', authMiddleware(), companyRequired(), trialGuard())

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function escapeCsvValue(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

// GET /api/exports/clients-csv
exports_.get('/clients-csv', async (c) => {
  try {
    const user = c.get('user')
    const { company_id } = user
    const db = c.env.DB

    const fieldsParam = c.req.query('fields')
    const risk = c.req.query('risk')
    const csm = c.req.query('csm')

    // Build query with filters
    let query = 'SELECT * FROM accounts WHERE company_id = ?'
    const params = [company_id]

    if (risk) {
      query += ' AND risk = ?'
      params.push(risk)
    }
    if (csm) {
      query += ' AND csm = ?'
      params.push(csm)
    }

    query += ' ORDER BY arr DESC'

    const { results } = await db.prepare(query).bind(...params).all()

    // Field mapping: key -> French header
    const allFields = {
      name: 'Nom',
      csm: 'CSM',
      arr: 'ARR',
      mrr: 'MRR',
      health: 'Health Score',
      risk: 'Risque',
      industry: 'Industrie',
      contact: 'Contact',
      contact_email: 'Email',
      notes: 'Notes',
      renewal: 'Renouvellement',
    }

    // Determine which fields to export
    let selectedKeys = Object.keys(allFields)
    if (fieldsParam) {
      const requested = fieldsParam.split(',').map(f => f.trim()).filter(Boolean)
      selectedKeys = requested.filter(k => k in allFields)
      if (selectedKeys.length === 0) selectedKeys = Object.keys(allFields)
    }

    const headers = selectedKeys.map(k => allFields[k])

    // Build CSV with BOM for Excel
    let csv = '\uFEFF' + headers.map(escapeCsvValue).join(',') + '\n'

    for (const row of results) {
      const line = selectedKeys.map(k => escapeCsvValue(row[k]))
      csv += line.join(',') + '\n'
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clients_scalyo_${todayStr()}.csv"`,
      },
    })
  } catch (err) {
    console.error('Export clients CSV error:', err.message)
    return c.json({ error: 'Export failed' }, 500)
  }
})

// GET /api/exports/clients-json
exports_.get('/clients-json', async (c) => {
  try {
    const user = c.get('user')
    const { company_id } = user
    const db = c.env.DB

    const risk = c.req.query('risk')
    const csm = c.req.query('csm')

    let query = 'SELECT * FROM accounts WHERE company_id = ?'
    const params = [company_id]

    if (risk) {
      query += ' AND risk = ?'
      params.push(risk)
    }
    if (csm) {
      query += ' AND csm = ?'
      params.push(csm)
    }

    query += ' ORDER BY arr DESC'

    const { results } = await db.prepare(query).bind(...params).all()

    // Parse JSON fields
    const accounts = results.map(a => ({
      ...a,
      issues: JSON.parse(a.issues || '[]'),
      tags: JSON.parse(a.tags || '[]'),
      contacts: JSON.parse(a.contacts || '[]'),
      interactions: JSON.parse(a.interactions || '[]'),
    }))

    const json = JSON.stringify(accounts, null, 2)

    return new Response(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="clients_scalyo_${todayStr()}.json"`,
      },
    })
  } catch (err) {
    console.error('Export clients JSON error:', err.message)
    return c.json({ error: 'Export failed' }, 500)
  }
})

// GET /api/exports/kpis-csv
exports_.get('/kpis-csv', async (c) => {
  try {
    const user = c.get('user')
    const { company_id } = user
    const db = c.env.DB

    const { results } = await db.prepare(
      "SELECT * FROM kpi_data WHERE company_id = ? AND period NOT LIKE '__%%' ORDER BY period ASC"
    ).bind(company_id).all()

    if (results.length === 0) {
      const csv = '\uFEFF' + 'Période\n'
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="kpis_scalyo_${todayStr()}.csv"`,
        },
      })
    }

    // Collect all KPI keys across all periods
    const allKpiKeys = new Set()
    const parsed = results.map(row => {
      const kpis = JSON.parse(row.kpis || '{}')
      Object.keys(kpis).forEach(k => allKpiKeys.add(k))
      return { period: row.period, kpis }
    })

    const kpiKeys = [...allKpiKeys].sort()
    const headers = ['Période', ...kpiKeys]

    let csv = '\uFEFF' + headers.map(escapeCsvValue).join(',') + '\n'

    for (const { period, kpis } of parsed) {
      const values = [period, ...kpiKeys.map(k => kpis[k] ?? '')]
      csv += values.map(escapeCsvValue).join(',') + '\n'
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="kpis_scalyo_${todayStr()}.csv"`,
      },
    })
  } catch (err) {
    console.error('Export KPIs CSV error:', err.message)
    return c.json({ error: 'Export failed' }, 500)
  }
})

export default exports_
