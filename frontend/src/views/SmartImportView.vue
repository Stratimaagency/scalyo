<template>
  <div class="fade-in">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
      <div>
        <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('smartImportTitle') }}</h3>
        <p style="font-size: 13px; color: var(--muted)">{{ t('smartImportDesc') }}</p>
      </div>
    </div>

    <!-- Step 1: Upload -->
    <div v-if="step === 'upload'" class="card drop-zone" :class="{ 'drop-active': dragging }"
      style="padding: 40px; text-align: center;"
      @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
      <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
      <h4 style="font-weight: 700; margin-bottom: 8px;">{{ t('smartImportDrop') }}</h4>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">{{ t('smartImportFormats') }}</p>
      <label class="btn btn-primary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 12px 32px;">
        <ScalyoIcon name="upload" :size="18" />
        {{ t('smartImportChoose') }}
        <input type="file" accept=".xlsx,.xls,.csv" @change="onFileSelect" style="display: none;" />
      </label>
    </div>

    <!-- Step 2: Analyzing -->
    <div v-if="step === 'analyzing'" class="card" style="padding: 40px; text-align: center;">
      <div class="spinner" style="margin: 0 auto 16px;"></div>
      <h4 style="font-weight: 700;">{{ t('smartImportAnalyzing') }}</h4>
      <p style="font-size: 13px; color: var(--muted);">{{ t('smartImportReading') }}</p>
    </div>

    <!-- Step 3: Preview -->
    <div v-if="step === 'preview'">
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        <div class="card" style="padding: 14px 20px; flex: 1; min-width: 140px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ parsed.portfolio.length }}</div>
          <div style="font-size: 11px; color: var(--muted);">{{ t('portfolio') }}</div>
        </div>
        <div class="card" style="padding: 14px 20px; flex: 1; min-width: 140px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ parsed.kpis ? '1' : '0' }}</div>
          <div style="font-size: 11px; color: var(--muted);">KPIs</div>
        </div>
        <div class="card" style="padding: 14px 20px; flex: 1; min-width: 140px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ parsed.tasks.length }}</div>
          <div style="font-size: 11px; color: var(--muted);">{{ t('tasks') }}</div>
        </div>
        <div class="card" style="padding: 14px 20px; flex: 1; min-width: 140px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ parsed.roadmap.length }}</div>
          <div style="font-size: 11px; color: var(--muted);">{{ t('roadmap') }}</div>
        </div>
        <div class="card" style="padding: 14px 20px; flex: 1; min-width: 140px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ sheetsFound }}</div>
          <div style="font-size: 11px; color: var(--muted);">{{ t('smartImportSheets') }}</div>
        </div>
      </div>

      <!-- Portfolio preview -->
      <div v-if="parsed.portfolio.length" class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <ScalyoIcon name="briefcase" :size="16" /> {{ t('portfolio') }} ({{ parsed.portfolio.length }})
        </h4>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border);">
                <th style="text-align: left; padding: 6px 8px; color: var(--muted);">{{ t('name') }}</th>
                <th style="text-align: left; padding: 6px 8px; color: var(--muted);">CSM</th>
                <th style="text-align: right; padding: 6px 8px; color: var(--muted);">ARR</th>
                <th style="text-align: center; padding: 6px 8px; color: var(--muted);">{{ t('health') }}</th>
                <th style="text-align: center; padding: 6px 8px; color: var(--muted);">{{ t('smartImportRisk') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(acc, i) in parsed.portfolio.slice(0, 20)" :key="i" style="border-bottom: 1px solid var(--border);">
                <td style="padding: 6px 8px; font-weight: 600;">{{ acc.name }}</td>
                <td style="padding: 6px 8px;">{{ acc.csm || '—' }}</td>
                <td style="padding: 6px 8px; text-align: right; font-family: 'JetBrains Mono', monospace;">{{ acc.arr ? Number(acc.arr).toLocaleString() : '—' }}</td>
                <td style="padding: 6px 8px; text-align: center;">{{ acc.health ?? '—' }}</td>
                <td style="padding: 6px 8px; text-align: center;">
                  <span :style="{ color: acc.risk === 'critical' ? 'var(--red)' : acc.risk === 'watch' ? '#f59e0b' : 'var(--green)' }">{{ acc.risk }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="parsed.portfolio.length > 20" style="font-size: 11px; color: var(--muted); margin-top: 8px;">+{{ parsed.portfolio.length - 20 }} {{ t('more') }}...</p>
        </div>
      </div>

      <!-- KPIs preview -->
      <div v-if="parsed.kpis" class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <ScalyoIcon name="chart-up" :size="16" /> KPIs
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
          <div v-for="(val, key) in parsed.kpis" :key="key" style="background: var(--bg); border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 16px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ val }}</div>
            <div style="font-size: 10px; color: var(--muted); text-transform: uppercase;">{{ key }}</div>
          </div>
        </div>
      </div>

      <!-- Tasks preview -->
      <div v-if="parsed.tasks.length" class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <ScalyoIcon name="check-circle" :size="16" /> {{ t('tasks') }} ({{ parsed.tasks.length }})
        </h4>
        <div v-for="(task, i) in parsed.tasks.slice(0, 10)" :key="i" style="padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          {{ task.title }}
          <span v-if="task.account" style="color: var(--muted); font-size: 11px;"> — {{ task.account }}</span>
        </div>
      </div>

      <!-- Roadmap preview -->
      <div v-if="parsed.roadmap.length" class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <ScalyoIcon name="map" :size="16" /> {{ t('roadmap') }} ({{ parsed.roadmap.length }})
        </h4>
        <div v-for="(item, i) in parsed.roadmap.slice(0, 10)" :key="i" style="padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          <strong>{{ item.phase }}:</strong> {{ item.title }}
        </div>
      </div>

      <!-- Empty state if nothing detected -->
      <div v-if="totalParsed === 0" class="card" style="padding: 24px; text-align: center; margin-bottom: 12px;">
        <div style="font-size: 32px; margin-bottom: 8px;">🤷</div>
        <p style="color: var(--muted); font-size: 13px;">{{ t('smartImportNoData') }}</p>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="btn btn-primary" style="flex: 1; justify-content: center; padding: 14px;" :disabled="importing || totalParsed === 0" @click="doImport">
          {{ importing ? t('smartImportImporting') : t('smartImportConfirm') }}
        </button>
        <button class="btn btn-secondary" @click="reset">{{ t('cancel') }}</button>
      </div>
    </div>

    <!-- Step 4: Done -->
    <div v-if="step === 'done'" class="card" style="padding: 40px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h4 style="font-weight: 700; margin-bottom: 8px;">{{ t('smartImportDone') }}</h4>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">
        {{ importResult.portfolio }} {{ t('portfolio').toLowerCase() }},
        {{ importResult.kpis }} KPIs,
        {{ importResult.tasks }} {{ t('tasks').toLowerCase() }},
        {{ importResult.roadmap }} {{ t('roadmap').toLowerCase() }}
      </p>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <router-link :to="{ name: 'portfolio' }" class="btn btn-primary" style="padding: 10px 24px;">{{ t('viewPortfolio') }}</router-link>
        <button class="btn btn-secondary" @click="reset">{{ t('smartImportAnother') }}</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" style="padding: 12px 16px; background: var(--redBg); border: 1px solid var(--redBorder); border-radius: 10px; color: var(--red); font-size: 13px; margin-top: 12px;">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useI18n } from '../i18n'
import { smartImportApi } from '../api'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()

const step = ref('upload') // upload | analyzing | preview | done
const error = ref('')
const importing = ref(false)
const dragging = ref(false)
const sheetsFound = ref(0)
const parsed = ref({ portfolio: [], kpis: null, tasks: [], roadmap: [] })
const importResult = ref({})

const totalParsed = computed(() =>
  parsed.value.portfolio.length + (parsed.value.kpis ? 1 : 0) + parsed.value.tasks.length + parsed.value.roadmap.length
)

function reset() {
  step.value = 'upload'
  error.value = ''
  parsed.value = { portfolio: [], kpis: null, tasks: [], roadmap: [] }
  importResult.value = {}
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function onFileSelect(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

async function processFile(file) {
  error.value = ''
  step.value = 'analyzing'

  try {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellFormula: false, cellDates: true })
    sheetsFound.value = wb.SheetNames.length

    const result = { portfolio: [], kpis: null, tasks: [], roadmap: [] }
    const seenNames = new Set()

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]

      // Try multiple parse strategies for complex sheets (stacked tables)
      const allRows = extractAllTables(sheet)

      for (const rows of allRows) {
        if (!rows.length) continue
        const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim())
        const sheetLower = sheetName.toLowerCase()

        // Priority: portfolio > csm > kpi > tasks > roadmap > auto
        if (isPortfolioSheet(sheetLower, headers)) {
          const items = parsePortfolioRows(rows).filter(a => !seenNames.has(a.name))
          items.forEach(a => seenNames.add(a.name))
          result.portfolio.push(...items)
        } else if (isCsmSheet(sheetLower, headers)) {
          const csmData = parseCsmRows(rows)
          if (csmData.kpis) result.kpis = { ...result.kpis, ...csmData.kpis }
          if (csmData.tasks.length) result.tasks.push(...csmData.tasks)
        } else if (isKpiSheet(sheetLower, headers)) {
          result.kpis = { ...result.kpis, ...parseKpiRows(rows) }
        } else if (isTaskSheet(sheetLower, headers)) {
          result.tasks.push(...parseTaskRows(rows))
        } else if (isRoadmapSheet(sheetLower, headers)) {
          result.roadmap.push(...parseRoadmapRows(rows))
        } else {
          const auto = autoDetect(rows, headers)
          const items = auto.portfolio.filter(a => !seenNames.has(a.name))
          items.forEach(a => seenNames.add(a.name))
          result.portfolio.push(...items)
          if (auto.tasks.length) result.tasks.push(...auto.tasks)
          if (auto.kpis) result.kpis = { ...result.kpis, ...auto.kpis }
        }
      }
    }

    parsed.value = result
    step.value = 'preview'
  } catch (err) {
    error.value = err.message || t('errorGeneric')
    step.value = 'upload'
  }
}

/**
 * Extract multiple tables from a single sheet.
 * Complex Excel files often have stacked tables with headers mid-way.
 * Strategy: parse the full sheet, then look for rows that look like headers
 * and split into sub-tables.
 */
function extractAllTables(sheet) {
  // First try: standard parse
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
  if (!rows.length) return []

  // Check if first row looks like real data headers or decorative content
  const firstHeaders = Object.keys(rows[0])
  const looksLikeData = firstHeaders.some(h => {
    const hl = h.toLowerCase()
    return ['csm', 'client', 'nom', 'name', 'company', 'entreprise', 'arr', 'mrr',
      'health', 'santé', 'nps', 'churn', 'task', 'tâche', 'phase'].some(k => hl.includes(k))
  })

  if (looksLikeData) return [rows]

  // If first headers are decorative, try parsing with different header rows
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
  const tables = []

  for (let startRow = 1; startRow <= Math.min(range.e.r, 20); startRow++) {
    const subRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, range: startRow })
    if (!subRows.length) continue
    const subHeaders = Object.keys(subRows[0])
    const hasRealHeaders = subHeaders.some(h => {
      const hl = h.toLowerCase()
      return ['csm', 'client', 'nom', 'name', 'company', 'entreprise', 'arr', 'mrr', 'ca',
        'health', 'santé', 'h.score', 'nps', 'churn', 'séniorité', 'seniorite',
        'task', 'tâche', 'phase', 'total'].some(k => hl.includes(k))
    })
    if (hasRealHeaders && subRows.length > 1) {
      tables.push(subRows)
    }
  }

  return tables.length ? tables : [rows]
}

// --- Sheet type detection ---
function isPortfolioSheet(name, headers) {
  const nameHits = ['client', 'portfolio', 'portefeuille', 'account', 'compte'].some(k => name.includes(k))
  const headerHits = headers.some(h => ['client', 'compte', 'account', 'entreprise', 'company'].includes(h)) &&
    headers.some(h => h.includes('arr') || h.includes('mrr') || h.includes('ca ') || h.includes('chiffre') || h.includes('revenue'))
  return nameHits || headerHits
}

function isKpiSheet(name, headers) {
  const nameHits = ['kpi', 'dashboard', 'synthese', 'résumé', 'summary', 'globaux'].some(k => name.includes(k))
  const headerHits = headers.some(h => h.includes('nps') || h.includes('churn') || h.includes('health score'))
  return nameHits || headerHits
}

function isTaskSheet(name, headers) {
  const nameHits = ['task', 'tâche', 'tache', 'todo', 'action'].some(k => name.includes(k))
  const headerHits = headers.some(h => ['tâche', 'task', 'action', 'todo'].includes(h))
  return nameHits || headerHits
}

function isRoadmapSheet(name, headers) {
  const nameHits = ['roadmap', 'plan', 'jalons', 'milestone'].some(k => name.includes(k))
  const headerHits = headers.some(h => ['phase', 'milestone', 'jalon', 'étape'].includes(h))
  return nameHits || headerHits
}

function isCsmSheet(name, headers) {
  const nameHits = ['csm', 'équipe', 'equipe', 'team', 'vue csm', 'vue par csm', 'profil'].some(k => name.includes(k))
  const headerHits = headers.some(h => h === 'csm' || h.includes('séniorité') || h.includes('seniorite') || h.includes('seniority')) &&
    headers.some(h => h.includes('client') || h.includes('ca') || h.includes('churn') || h.includes('health') || h.includes('score'))
  return nameHits || headerHits
}

// --- Row parsers ---
function findCol(row, ...keywords) {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase().trim()
    if (keywords.some(kw => k.includes(kw))) return row[key]
  }
  return ''
}

function parseNum(v) {
  if (typeof v === 'number') return v
  if (!v) return 0
  return parseFloat(String(v).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
}

function parsePortfolioRows(rows) {
  return rows.filter(r => findCol(r, 'client', 'compte', 'account', 'entreprise', 'company', 'nom', 'name')).map(r => {
    const name = findCol(r, 'client', 'compte', 'account', 'entreprise', 'company', 'nom', 'name')
    if (!name || typeof name !== 'string' || name.length < 2) return null
    const arr = parseNum(findCol(r, 'arr', 'ca annuel', 'annual revenue', 'ca géré', 'ca gere', 'revenue'))
    const mrr = parseNum(findCol(r, 'mrr', 'ca mensuel', 'monthly'))
    const health = parseNum(findCol(r, 'health', 'santé', 'sante', 'h.score', 'score'))
    const healthNorm = health > 10 ? health : Math.round(health * 10) // Handle 0-10 scale
    const risk = detectRisk(r, healthNorm)
    return {
      name: String(name).trim(),
      csm: String(findCol(r, 'csm', 'responsable', 'owner', 'manager') || '').trim(),
      arr: arr || mrr * 12,
      mrr: mrr || Math.round(arr / 12),
      health: Math.min(100, Math.max(0, healthNorm)),
      risk,
      industry: String(findCol(r, 'industrie', 'industry', 'secteur', 'sector') || '').trim(),
      contact: String(findCol(r, 'contact', 'interlocuteur', 'référent') || '').trim(),
      contact_email: String(findCol(r, 'email', 'mail', 'courriel') || '').trim(),
      notes: String(findCol(r, 'notes', 'commentaire', 'comment', 'remarque') || '').trim(),
      renewal: String(findCol(r, 'renewal', 'renouvellement', 'échéance', 'echeance') || '').trim(),
    }
  }).filter(Boolean)
}

function detectRisk(row, health) {
  const riskCol = findCol(row, 'risque', 'risk', 'statut', 'status')
  if (riskCol) {
    const r = String(riskCol).toLowerCase()
    if (r.includes('critic') || r.includes('critique') || r.includes('high') || r.includes('élevé')) return 'critical'
    if (r.includes('watch') || r.includes('moyen') || r.includes('medium') || r.includes('attention')) return 'watch'
    return 'low'
  }
  if (health <= 40) return 'critical'
  if (health <= 60) return 'watch'
  return 'low'
}

function parseKpiRows(rows) {
  const kpis = {}
  for (const row of rows) {
    for (const [key, val] of Object.entries(row)) {
      const k = key.toLowerCase().trim()
      const v = parseNum(val)
      if (k.includes('nps')) kpis.nps = v
      if (k.includes('churn') && k.includes('%')) kpis.churn_rate = v
      if (k.includes('churn') && !k.includes('%')) kpis.churned = v
      if ((k.includes('ca total') || k.includes('arr total') || k.includes('total arr')) && v > 1000) kpis.total_arr = v
      if (k.includes('mrr') && v > 100) kpis.mrr = v
      if (k.includes('health') && k.includes('moy')) kpis.avg_health = v
      if (k.includes('csat')) kpis.csat = v
      if (k.includes('adoption') || k.includes('taux')) kpis.renewal_rate = v
      if (k.includes('ticket') || k.includes('résolu')) kpis.resolved_tickets = v
    }
  }
  return Object.keys(kpis).length ? kpis : null
}

function parseCsmRows(rows) {
  const kpis = {}
  const tasks = []
  let totalArr = 0
  let totalHealth = 0
  let count = 0

  for (const row of rows) {
    const csm = findCol(row, 'csm', 'nom', 'name')
    const arr = parseNum(findCol(row, 'ca géré', 'ca gere', 'arr', 'ca', 'revenue'))
    const health = parseNum(findCol(row, 'health', 'h.score', 'santé', 'score'))
    const churn = parseNum(findCol(row, 'churn', 'attrition'))
    const critical = parseNum(findCol(row, 'critique', 'critical'))

    if (arr > 0) totalArr += arr
    if (health > 0) { totalHealth += (health > 10 ? health : health * 10); count++ }

    // Generate tasks for high-risk CSMs
    if (critical > 3 || churn > 50) {
      tasks.push({
        title: `Review ${csm}'s critical accounts (${critical} critical)`,
        note: `Churn: ${churn}%, Health: ${health}`,
        quadrant: 'q1',
        color: 'red',
      })
    }
  }

  if (totalArr > 0) kpis.total_arr = totalArr
  if (count > 0) kpis.avg_health = Math.round(totalHealth / count)

  return { kpis: Object.keys(kpis).length ? kpis : null, tasks }
}

function parseTaskRows(rows) {
  return rows.map(r => {
    const title = findCol(r, 'tâche', 'tache', 'task', 'action', 'titre', 'title', 'todo')
    if (!title) return null
    return {
      title: String(title).trim(),
      note: String(findCol(r, 'note', 'description', 'detail', 'détail') || '').trim(),
      account: String(findCol(r, 'client', 'compte', 'account') || '').trim(),
      due: String(findCol(r, 'date', 'échéance', 'echeance', 'due', 'deadline') || '').trim(),
      quadrant: 'q1',
      color: 'teal',
    }
  }).filter(Boolean)
}

function parseRoadmapRows(rows) {
  return rows.map(r => {
    const title = findCol(r, 'titre', 'title', 'objectif', 'objective', 'action', 'milestone', 'jalon')
    if (!title) return null
    return {
      title: String(title).trim(),
      phase: String(findCol(r, 'phase', 'étape', 'etape', 'step') || '1').trim(),
      status: String(findCol(r, 'statut', 'status', 'état', 'etat') || 'pending').trim(),
      due: String(findCol(r, 'date', 'échéance', 'echeance', 'due') || '').trim(),
      progress: parseNum(findCol(r, 'progress', 'avancement', '%')),
      owner: String(findCol(r, 'responsable', 'owner', 'assigné', 'assigned') || '').trim(),
    }
  }).filter(Boolean)
}

function autoDetect(rows, headers) {
  const result = { portfolio: [], tasks: [], kpis: null }
  // If rows have name + some numeric → treat as portfolio
  const hasName = headers.some(h => ['nom', 'name', 'client', 'entreprise', 'company'].includes(h))
  const hasNum = headers.some(h => h.includes('arr') || h.includes('mrr') || h.includes('ca') || h.includes('revenue') || h.includes('health'))
  if (hasName && hasNum) {
    result.portfolio = parsePortfolioRows(rows)
  } else if (hasName) {
    result.tasks = parseTaskRows(rows)
  }
  return result
}

async function doImport() {
  importing.value = true
  error.value = ''
  try {
    const { data } = await smartImportApi.execute(parsed.value)
    importResult.value = data.imported
    step.value = 'done'
  } catch (err) {
    error.value = err.response?.data?.error || err.message || t('errorGeneric')
  }
  importing.value = false
}
</script>

<style scoped>
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.drop-zone {
  border: 2px dashed var(--border);
  transition: all 0.2s ease;
}
.drop-zone.drop-active {
  border-color: var(--teal);
  background: rgba(77, 182, 160, 0.05);
}
</style>
