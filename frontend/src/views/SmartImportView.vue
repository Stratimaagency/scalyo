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

    <!-- Step 2: AI Analyzing -->
    <div v-if="step === 'analyzing'" class="card" style="padding: 40px; text-align: center;">
      <div class="spinner" style="margin: 0 auto 16px;"></div>
      <h4 style="font-weight: 700;">{{ t('smartImportAnalyzing') }}</h4>
      <p style="font-size: 13px; color: var(--muted);">{{ analysisStatus }}</p>
    </div>

    <!-- Step 3: Preview -->
    <div v-if="step === 'preview'">
      <!-- Summary cards -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        <div v-for="mod in summaryCards" :key="mod.key" class="card" style="padding: 14px 20px; flex: 1; min-width: 120px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ mod.count }}</div>
          <div style="font-size: 11px; color: var(--muted);">{{ mod.label }}</div>
        </div>
      </div>

      <!-- AI mapping details -->
      <div v-for="sheet in aiMapping" :key="sheet.name" class="card" style="padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>{{ moduleIcon(sheet.module) }}</span>
            {{ sheet.name }}
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; font-weight: 600;"
              :style="{ background: 'var(--tealBg)', color: 'var(--teal)' }">
              {{ moduleLabel(sheet.module) }} ({{ Math.round((sheet.confidence || 0) * 100) }}%)
            </span>
          </h4>
          <select v-model="sheet.module" style="font-size: 12px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
            <option value="portfolio">{{ t('portfolio') }}</option>
            <option value="kpis">KPIs</option>
            <option value="tasks">{{ t('tasks') }}</option>
            <option value="roadmap">{{ t('roadmap') }}</option>
            <option value="team">Team</option>
            <option value="skip">{{ t('smartImportSkip') }}</option>
          </select>
        </div>
        <div v-if="sheet.notes" style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">{{ sheet.notes }}</div>
        <!-- Data preview table -->
        <div v-if="sheet.previewRows && sheet.previewRows.length && sheet.module !== 'skip'" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border);">
                <th v-for="col in sheet.previewHeaders" :key="col" style="text-align: left; padding: 4px 6px; color: var(--muted); white-space: nowrap;">
                  {{ col }}
                  <span v-if="sheet.columns[col]" style="color: var(--teal); font-size: 9px; display: block;">→ {{ sheet.columns[col] }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in sheet.previewRows.slice(0, 5)" :key="i" style="border-bottom: 1px solid var(--border);">
                <td v-for="col in sheet.previewHeaders" :key="col" style="padding: 4px 6px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ row[col] ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="sheet.totalRows > 5" style="font-size: 11px; color: var(--muted); margin-top: 6px;">+{{ sheet.totalRows - 5 }} {{ t('more') }}...</p>
        </div>
      </div>

      <!-- AI Summary -->
      <div v-if="aiSummary" class="card" style="padding: 16px; margin-bottom: 12px; border-left: 3px solid var(--teal);">
        <h4 style="font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          🧠 Analyse IA
        </h4>
        <p style="font-size: 13px; color: var(--muted); line-height: 1.6;">{{ aiSummary }}</p>
      </div>

      <!-- AI-generated tasks -->
      <div v-if="generatedTasks.length" class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          ⚡ {{ t('smartImportGeneratedTasks') }} ({{ generatedTasks.length }})
        </h4>
        <div v-for="(task, i) in generatedTasks" :key="i"
          style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border);">
          <span style="width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;"
            :style="{ background: task.color === 'red' ? 'var(--red)' : task.color === 'orange' ? '#f59e0b' : 'var(--teal)' }"></span>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 600;">{{ task.title }}</div>
            <div v-if="task.note" style="font-size: 11px; color: var(--muted);">{{ task.note }}</div>
          </div>
          <button @click="generatedTasks.splice(i, 1)" style="background: none; border: none; cursor: pointer; color: var(--muted); font-size: 14px;" title="Retirer">✕</button>
        </div>
      </div>

      <!-- Computed KPIs -->
      <div v-if="computedKpis && Object.keys(computedKpis).length" class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          📊 KPIs
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">
          <div v-for="(val, key) in computedKpis" :key="key" style="background: var(--bg); border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 16px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ formatKpiVal(key, val) }}</div>
            <div style="font-size: 10px; color: var(--muted); text-transform: uppercase;">{{ kpiLabel(key) }}</div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="totalParsed === 0 && !generatedTasks.length" class="card" style="padding: 24px; text-align: center; margin-bottom: 12px;">
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
      <div v-if="importResult.errors && importResult.errors.length" style="margin-bottom: 16px; text-align: left; background: var(--redBg); border-radius: 8px; padding: 12px; font-size: 12px; color: var(--red);">
        <div v-for="(err, i) in importResult.errors.slice(0, 5)" :key="i">{{ err }}</div>
      </div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <router-link :to="{ name: 'portfolio' }" class="btn btn-primary" style="padding: 10px 24px;">{{ t('viewPortfolio') }}</router-link>
        <button class="btn btn-secondary" @click="reset">{{ t('smartImportAnother') }}</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" style="padding: 12px 16px; background: var(--redBg); border: 1px solid var(--redBorder); border-radius: 10px; color: var(--red); font-size: 13px; margin-top: 12px;">
      {{ error }}
      <button @click="error = ''" style="float: right; background: none; border: none; color: var(--red); cursor: pointer; font-weight: 700;">✕</button>
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

const step = ref('upload')
const error = ref('')
const importing = ref(false)
const dragging = ref(false)
const analysisStatus = ref('')
const aiMapping = ref([])
const allSheetData = ref({})
const importResult = ref({})
const aiSummary = ref('')
const generatedTasks = ref([])
const computedKpis = ref({})

const totalParsed = computed(() => {
  return aiMapping.value.filter(s => s.module !== 'skip').reduce((sum, s) => sum + (s.totalRows || 0), 0)
})

const summaryCards = computed(() => {
  const counts = { portfolio: 0, kpis: 0, tasks: 0, roadmap: 0, team: 0 }
  for (const s of aiMapping.value) {
    if (s.module !== 'skip' && counts[s.module] !== undefined) {
      counts[s.module] += s.totalRows || 0
    }
  }
  return [
    { key: 'portfolio', label: t('portfolio'), count: counts.portfolio },
    { key: 'kpis', label: 'KPIs', count: counts.kpis || (counts.team ? 1 : 0) },
    { key: 'tasks', label: t('tasks'), count: counts.tasks },
    { key: 'roadmap', label: t('roadmap'), count: counts.roadmap },
    { key: 'sheets', label: t('smartImportSheets'), count: aiMapping.value.length },
  ]
})

function moduleIcon(mod) {
  const icons = { portfolio: '💼', kpis: '📊', tasks: '✅', roadmap: '🗺️', team: '👥', skip: '⏭️' }
  return icons[mod] || '📄'
}

function moduleLabel(mod) {
  const labels = { portfolio: t('portfolio'), kpis: 'KPIs', tasks: t('tasks'), roadmap: t('roadmap'), team: 'Team', skip: t('smartImportSkip') }
  return labels[mod] || mod
}

function reset() {
  step.value = 'upload'
  error.value = ''
  aiMapping.value = []
  allSheetData.value = {}
  importResult.value = {}
  aiSummary.value = ''
  generatedTasks.value = []
  computedKpis.value = {}
}

function formatKpiVal(key, val) {
  if (key.includes('arr') || key.includes('mrr')) return Number(val).toLocaleString() + '€'
  if (key.includes('rate') || key.includes('churn')) return val + '%'
  return val
}

function kpiLabel(key) {
  const labels = { total_arr: 'ARR Total', avg_health: 'Health Moy.', critical_count: 'Critiques', nps: 'NPS', churn_rate: 'Churn', adoption_rate: 'Adoption', mrr: 'MRR', csat: 'CSAT' }
  return labels[key] || key
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
  analysisStatus.value = t('smartImportReading')

  try {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellFormula: false, cellDates: true })

    const rawData = {}
    const mappedSheets = []
    const kpis = {}
    const tasks = []
    const teamData = []

    // Parse each sheet — try multiple start rows for complex layouts
    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]
      const allTables = extractAllTables(sheet)

      for (const rows of allTables) {
        if (!rows.length) continue
        const headers = Object.keys(rows[0])
        const headersLower = headers.map(h => h.toLowerCase().trim())
        const key = sheetName + (allTables.length > 1 ? `_${allTables.indexOf(rows)}` : '')
        rawData[key] = rows

        const sheetLower = sheetName.toLowerCase()

        // --- DETECT & EXTRACT ---

        // 1. Portfolio (client list)
        if (isPortfolioSheet(sheetLower, headersLower)) {
          mappedSheets.push({ name: key, module: 'portfolio', confidence: 0.99, columns: guessColumns(headers), previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length, notes: 'Portefeuille client détecté' })

        // 2. CSM Team data → extract KPIs + generate tasks
        } else if (isCsmSheet(sheetLower, headersLower)) {
          mappedSheets.push({ name: key, module: 'team', confidence: 0.95, columns: guessColumns(headers), previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length, notes: 'Données équipe CSM' })
          extractCsmInsights(rows, kpis, tasks, teamData)

        // 3. KPI / Dashboard → extract all numbers
        } else if (isKpiSheet(sheetLower, headersLower)) {
          mappedSheets.push({ name: key, module: 'kpis', confidence: 0.95, columns: {}, previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length, notes: 'KPIs extraits' })
          extractKpisFromRows(rows, kpis)

        // 4. Tasks
        } else if (isTaskSheet(sheetLower, headersLower)) {
          mappedSheets.push({ name: key, module: 'tasks', confidence: 0.9, columns: guessColumns(headers), previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length, notes: 'Tâches détectées' })

        // 5. Roadmap
        } else if (isRoadmapSheet(sheetLower, headersLower)) {
          mappedSheets.push({ name: key, module: 'roadmap', confidence: 0.9, columns: guessColumns(headers), previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length, notes: 'Roadmap détectée' })

        // 6. Auto-detect: scan ALL cells for KPI-like values
        } else {
          extractKpisFromRows(rows, kpis)
          // If it has name-like columns + numbers, treat as portfolio
          const auto = autoDetectModule(rows, headersLower)
          if (auto !== 'skip') {
            mappedSheets.push({ name: key, module: auto, confidence: 0.6, columns: guessColumns(headers), previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length, notes: 'Auto-détecté' })
          }
        }
      }
    }

    // --- Generate summary ---
    let summary = ''
    if (kpis.total_arr) summary += `CA Total: ${Number(kpis.total_arr).toLocaleString()}€. `
    if (kpis.avg_health) summary += `Health moyen: ${kpis.avg_health}/100. `
    if (kpis.nps) summary += `NPS: ${kpis.nps}. `
    if (tasks.length) summary += `${tasks.length} actions prioritaires générées. `
    const portfolioCount = mappedSheets.filter(s => s.module === 'portfolio').reduce((s, sh) => s + sh.totalRows, 0)
    if (portfolioCount) summary += `${portfolioCount} comptes clients détectés.`

    // Deduplicate portfolio sheets by name
    const seenPortfolioNames = new Set()
    const dedupedSheets = []
    for (const sheet of mappedSheets) {
      if (sheet.module === 'portfolio') {
        const rows = rawData[sheet.name] || []
        const uniqueRows = rows.filter(r => {
          const name = findCol(r, 'client', 'nom', 'name', 'entreprise', 'company', 'id') || Object.values(r)[0]
          const key = String(name).trim().toLowerCase()
          if (seenPortfolioNames.has(key)) return false
          seenPortfolioNames.add(key)
          return true
        })
        rawData[sheet.name] = uniqueRows
        sheet.totalRows = uniqueRows.length
        sheet.previewRows = uniqueRows.slice(0, 5)
      }
      dedupedSheets.push(sheet)
    }

    allSheetData.value = rawData
    aiMapping.value = dedupedSheets
    computedKpis.value = Object.keys(kpis).length ? kpis : {}
    generatedTasks.value = tasks
    aiSummary.value = summary || 'Fichier analysé. Vérifiez le mapping ci-dessous avant d\'importer.'

    // Try AI enrichment in background (non-blocking)
    tryAiEnrichment(wb.SheetNames, rawData)

    step.value = 'preview'
  } catch (err) {
    error.value = err.message || t('errorGeneric')
    step.value = 'upload'
  }
}

// --- AI enrichment (bonus, non-blocking) ---
async function tryAiEnrichment(sheetNames, rawData) {
  try {
    const sheets = sheetNames.map(name => ({
      name,
      headers: Object.keys((rawData[name] || rawData[name + '_0'])?.[0] || {}),
      sampleRows: (rawData[name] || rawData[name + '_0'] || []).slice(0, 10),
      totalRows: (rawData[name] || rawData[name + '_0'] || []).length,
    })).filter(s => s.headers.length > 0)

    const { data } = await smartImportApi.analyze(sheets)
    // Merge AI insights with existing data
    if (data.generated_tasks?.length) {
      const existing = generatedTasks.value.map(t => t.title)
      const newTasks = data.generated_tasks.filter(t => !existing.includes(t.title))
      generatedTasks.value.push(...newTasks)
    }
    if (data.computed_kpis) {
      for (const [k, v] of Object.entries(data.computed_kpis)) {
        if (v && !computedKpis.value[k]) computedKpis.value[k] = v
      }
    }
    if (data.summary && data.summary.length > aiSummary.value.length) {
      aiSummary.value = data.summary
    }
  } catch { /* AI failed — heuristic results are already displayed */ }
}

// --- KPI extraction: scan ALL cells including __EMPTY columns ---
function extractKpisFromRows(rows, kpis) {
  for (const row of rows) {
    const entries = Object.entries(row)
    for (let i = 0; i < entries.length; i++) {
      const [key, val] = entries[i]
      const k = key.toLowerCase().trim()
      const v = parseNum(val)
      const valStr = String(val).toLowerCase().trim()

      // Direct column name matching
      if ((k.includes('total') && k.includes('client')) || k.includes('nombre de client')) kpis.total_clients = v
      if ((k.includes('ca total') || k.includes('arr total') || k.includes('ca total portefeuille')) && v > 1000) kpis.total_arr = v
      if (k.includes('health') && (k.includes('moy') || k.includes('score'))) { kpis.avg_health = v > 10 ? v : Math.round(v * 10) }
      if (k.includes('nps')) { if (v > 0 && v < 100) kpis.nps = v }
      if (k.includes('churn') && !k.includes('ca') && v > 0) kpis.churn_rate = v
      if ((k.includes('ca') && k.includes('risque')) || k.includes('at risk')) kpis.at_risk_revenue = v
      if (k.includes('adoption')) kpis.adoption_rate = v
      if (k.includes('csat') && v > 0) kpis.csat = v

      // For __EMPTY keys: the VALUE itself might be a label — check next cell for the number
      if (k.includes('__empty') || k === '' || k.includes('empty')) {
        const nextVal = i + 1 < entries.length ? entries[i + 1][1] : null
        const nextNum = nextVal ? parseNum(nextVal) : 0
        if (valStr.includes('total client') || valStr.includes('nombre de client')) { if (nextNum) kpis.total_clients = nextNum }
        else if (valStr.includes('ca total') || valStr.includes('ca total portefeuille')) { if (nextNum > 1000) kpis.total_arr = nextNum }
        else if (valStr.includes('health') && valStr.includes('moy')) { if (nextNum) kpis.avg_health = nextNum > 10 ? nextNum : Math.round(nextNum * 10) }
        else if (valStr.includes('nps')) { if (nextNum > 0 && nextNum < 100) kpis.nps = nextNum }
        else if (valStr.includes('churn') && !valStr.includes('ca')) { if (nextNum > 0) kpis.churn_rate = nextNum }
        else if (valStr.includes('risque') && valStr.includes('ca')) { if (nextNum > 0) kpis.at_risk_revenue = nextNum }
        else if (valStr.includes('adoption')) { if (nextNum > 0) kpis.adoption_rate = nextNum }
      }
    }
  }
}

// --- CSM insights extraction (scans VALUES, not just column names) ---
function extractCsmInsights(rows, kpis, tasks, teamData) {
  let totalArr = 0, totalHealth = 0, count = 0

  for (const row of rows) {
    const vals = Object.values(row).map(v => String(v).trim())
    const keys = Object.keys(row)

    // Find CSM name: first value that looks like "Prénom Nom" pattern
    const csmVal = vals.find(v => v.length > 3 && /^[A-ZÀ-Ü][a-zà-ü]+ [A-ZÀ-Ü]/.test(v)) ||
      findCol(row, 'csm', 'nom', 'name') || ''
    if (!csmVal || csmVal.length < 3) continue

    // Scan ALL columns for data — match by column name OR by value pattern
    let arr = 0, health = 0, churn = 0, critical = 0, clients = 0, seniority = ''

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i].toLowerCase()
      const v = vals[i]
      const n = parseNum(v)

      // By column name
      if (k.includes('ca') || k.includes('arr') || k.includes('revenue') || k.includes('chiffre')) { if (n > 1000) arr = n }
      else if (k.includes('health') || k.includes('h.score') || k.includes('santé') || k.includes('score moy')) { health = n }
      else if (k.includes('churn') || k.includes('attrition')) { churn = n }
      else if (k.includes('critique') || k.includes('critical')) { critical = n }
      else if (k.includes('client') || k.includes('compte')) { if (n > 0 && n < 10000) clients = n }
      else if (k.includes('séniorité') || k.includes('seniorite') || k.includes('seniority') || k.includes('ancienneté')) seniority = v
      // For __EMPTY columns: detect by value pattern
      else if (k.includes('empty') || k === '') {
        if (/senior|junior|confirmé|confirmée|stagiaire/i.test(v)) seniority = v
        else if (n > 100000 && !arr) arr = n
        else if (n > 0 && n <= 10 && !health) health = n
        else if (v.includes('%') && n > 0 && n < 100 && !churn) churn = n
        else if (n > 50 && n <= 1000 && !clients) clients = n
        else if (n > 0 && n <= 200 && !critical) critical = n
      }
    }

    const healthNorm = health > 0 && health <= 10 ? Math.round(health * 10) : health
    if (arr > 0) totalArr += arr
    if (healthNorm > 0) { totalHealth += healthNorm; count++ }

    teamData.push({ name: csmVal, arr, health: healthNorm, churn, critical, clients, seniority })

    // Generate tasks
    if (churn > 35) {
      tasks.push({ title: `⚠️ Review portefeuille ${csmVal} — churn ${churn}%`, note: `${clients} clients, ${critical} critiques, health ${healthNorm}/100.`, quadrant: 'q1', color: 'red', account: '' })
    }
    if (critical > 50) {
      tasks.push({ title: `🔥 Plan d'action urgent — ${csmVal} a ${critical} comptes critiques`, note: `CA géré: ${arr ? Number(arr).toLocaleString() : '?'}€.`, quadrant: 'q1', color: 'red', account: '' })
    }
    if (seniority && /junior|stagiaire/i.test(seniority) && healthNorm > 0 && healthNorm < 60) {
      tasks.push({ title: `🎯 Coaching ${csmVal} — ${seniority}, health ${healthNorm}/100`, note: `Accompagnement renforcé recommandé.`, quadrant: 'q2', color: 'orange', account: '' })
    }
  }

  if (totalArr > 0 && !kpis.total_arr) kpis.total_arr = totalArr
  if (count > 0) kpis.avg_health = Math.round(totalHealth / count)
  if (teamData.length) kpis.total_clients = teamData.reduce((s, t) => s + (t.clients || 0), 0)

  const avgChurn = teamData.reduce((s, t) => s + (t.churn || 0), 0) / (teamData.length || 1)
  if (avgChurn > 40) {
    tasks.push({ title: `📊 Churn moyen équipe ${Math.round(avgChurn)}% — plan de rétention`, note: `Actions transversales nécessaires.`, quadrant: 'q1', color: 'red', account: '' })
  }
  if (kpis.nps && kpis.nps < 30) {
    tasks.push({ title: `📉 NPS critique: ${kpis.nps} — plan d'amélioration`, note: `NPS en dessous de 30. Objectif > 40.`, quadrant: 'q1', color: 'orange', account: '' })
  }
}

function guessColumns(headers) {
  const map = {}
  for (const h of headers) {
    const hl = h.toLowerCase()
    if (['client', 'nom', 'name', 'entreprise', 'company', 'société'].some(k => hl.includes(k))) map[h] = 'name'
    else if (hl === 'csm' || hl.includes('responsable') || hl.includes('owner')) map[h] = 'csm'
    else if (hl.includes('arr') || hl.includes('ca géré') || hl.includes('ca gere') || hl.includes('revenue') || hl.includes('chiffre')) map[h] = 'arr'
    else if (hl.includes('mrr') || hl.includes('mensuel')) map[h] = 'mrr'
    else if (hl.includes('health') || hl.includes('santé') || hl.includes('h.score') || hl.includes('score')) map[h] = 'health'
    else if (hl.includes('risque') || hl.includes('risk')) map[h] = 'risk'
    else if (hl.includes('industri') || hl.includes('secteur')) map[h] = 'industry'
    else if (hl.includes('contact') || hl.includes('référent')) map[h] = 'contact'
    else if (hl.includes('email') || hl.includes('mail')) map[h] = 'contact_email'
    else if (hl.includes('note') || hl.includes('comment')) map[h] = 'notes'
    else if (hl.includes('renewal') || hl.includes('renouvellement') || hl.includes('échéance')) map[h] = 'renewal'
    else if (hl.includes('churn') || hl.includes('attrition')) map[h] = 'churn_rate'
    else if (hl.includes('nps')) map[h] = 'nps'
  }
  return map
}

// --- Sheet type detection ---
function isPortfolioSheet(name, headers) {
  const nameHits = ['client', 'portfolio', 'portefeuille', 'account', 'compte'].some(k => name.includes(k))
  const headerHits = headers.some(h => ['client', 'compte', 'account', 'entreprise', 'company', 'nom client', 'id client'].includes(h)) &&
    headers.some(h => h.includes('arr') || h.includes('mrr') || h.includes('ca') || h.includes('chiffre') || h.includes('revenue') || h.includes('plan'))
  return nameHits || headerHits
}

function isKpiSheet(name, headers) {
  return ['kpi', 'dashboard', 'synthese', 'résumé', 'summary', 'globaux', 'indicateur'].some(k => name.includes(k)) ||
    headers.some(h => h.includes('total client') || h.includes('ca total') || (h.includes('nps') && h.includes('moy')))
}

function isTaskSheet(name, headers) {
  return ['task', 'tâche', 'tache', 'todo', 'action'].some(k => name.includes(k)) ||
    headers.some(h => ['tâche', 'task', 'action', 'todo'].includes(h))
}

function isRoadmapSheet(name, headers) {
  return ['roadmap', 'plan', 'jalons', 'milestone', 'planning projet'].some(k => name.includes(k)) ||
    headers.some(h => ['phase', 'milestone', 'jalon', 'étape'].includes(h))
}

function isCsmSheet(name, headers) {
  return (['csm', 'équipe', 'equipe', 'team', 'vue csm', 'vue par csm', 'profil csm'].some(k => name.includes(k)) ||
    (headers.some(h => h === 'csm' || h.includes('séniorité') || h.includes('seniorite')) &&
      headers.some(h => h.includes('client') || h.includes('ca') || h.includes('churn'))))
}

function autoDetectModule(rows, headers) {
  const hasName = headers.some(h => ['nom', 'name', 'client', 'entreprise', 'company', 'société'].includes(h))
  const hasNum = headers.some(h => h.includes('arr') || h.includes('mrr') || h.includes('ca') || h.includes('revenue') || h.includes('health'))
  if (hasName && hasNum && rows.length > 3) return 'portfolio'
  if (hasName && rows.length > 1) return 'tasks'
  return 'skip'
}

function extractAllTables(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
  if (!rows.length) return []

  const dataKeywords = ['csm', 'client', 'nom', 'name', 'arr', 'mrr', 'ca', 'health', 'santé',
    'nps', 'churn', 'séniorité', 'seniorite', 'task', 'tâche', 'phase', 'total',
    'company', 'entreprise', 'revenue', 'score', 'contact', 'email', 'id client',
    'plan', 'risque', 'critique', 'neutre', 'sain']

  const firstHeaders = Object.keys(rows[0])
  const hasData = firstHeaders.some(h => dataKeywords.some(k => h.toLowerCase().includes(k)))
  if (hasData) return [rows]

  // Try different start rows for sheets with decorative headers
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
  const tables = []

  for (let startRow = 1; startRow <= Math.min(range.e.r, 20); startRow++) {
    const subRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, range: startRow })
    if (!subRows.length) continue
    const subHeaders = Object.keys(subRows[0])
    if (subHeaders.some(h => dataKeywords.some(k => h.toLowerCase().includes(k))) && subRows.length > 1) {
      tables.push(subRows)
    }
  }

  return tables.length ? tables : [rows]
}

// --- Column value finder ---
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

// --- Apply mapping and import ---
async function doImport() {
  importing.value = true
  error.value = ''

  try {
    const payload = { portfolio: [], kpis: {}, tasks: [], roadmap: [] }

    for (const sheet of aiMapping.value) {
      if (sheet.module === 'skip') continue
      const rows = allSheetData.value[sheet.name] || []
      const cols = sheet.columns || {}

      if (sheet.module === 'portfolio') {
        for (const row of rows) {
          const mapped = applyMapping(row, cols)
          if (mapped.name && String(mapped.name).trim().length >= 2) {
            // Normalize health
            let health = parseNum(mapped.health)
            if (health > 0 && health <= 10) health = Math.round(health * 10)
            // Normalize risk
            let risk = String(mapped.risk || '').toLowerCase()
            if (risk.includes('critic') || risk.includes('critique') || risk.includes('high')) risk = 'critical'
            else if (risk.includes('watch') || risk.includes('moyen') || risk.includes('medium')) risk = 'medium'
            else risk = health > 0 && health <= 40 ? 'critical' : health <= 60 ? 'medium' : 'low'

            payload.portfolio.push({
              name: String(mapped.name).trim(),
              csm: String(mapped.csm || '').trim(),
              arr: parseNum(mapped.arr),
              mrr: parseNum(mapped.mrr),
              health: Math.min(100, Math.max(0, health || 70)),
              risk,
              industry: String(mapped.industry || '').trim(),
              contact: String(mapped.contact || '').trim(),
              contact_email: String(mapped.contact_email || '').trim(),
              notes: String(mapped.notes || '').trim(),
              renewal: String(mapped.renewal || '').trim(),
            })
          }
        }
      } else if (sheet.module === 'kpis' || sheet.module === 'team') {
        for (const row of rows) {
          const mapped = applyMapping(row, cols)
          if (mapped.nps) payload.kpis.nps = parseNum(mapped.nps)
          if (mapped.churn_rate) payload.kpis.churn_rate = parseNum(mapped.churn_rate)
          if (mapped.total_arr) payload.kpis.total_arr = parseNum(mapped.total_arr)
          if (mapped.mrr) payload.kpis.mrr = parseNum(mapped.mrr)
          if (mapped.csat) payload.kpis.csat = parseNum(mapped.csat)
        }
      } else if (sheet.module === 'tasks') {
        for (const row of rows) {
          const mapped = applyMapping(row, cols)
          if (mapped.title) payload.tasks.push({ title: mapped.title, note: mapped.note || '', due: mapped.due || '', account: mapped.account || '' })
        }
      } else if (sheet.module === 'roadmap') {
        for (const row of rows) {
          const mapped = applyMapping(row, cols)
          if (mapped.title) payload.roadmap.push({ title: mapped.title, phase: mapped.phase || '1', status: mapped.status || 'pending', due: mapped.due || '', progress: parseNum(mapped.progress), owner: mapped.owner || '' })
        }
      }
    }

    // Auto-compute ARR from MRR if missing
    for (const acc of payload.portfolio) {
      if (!acc.arr && acc.mrr) acc.arr = acc.mrr * 12
      if (!acc.mrr && acc.arr) acc.mrr = Math.round(acc.arr / 12)
    }

    // Add AI-generated tasks
    if (generatedTasks.value.length) {
      payload.tasks.push(...generatedTasks.value)
    }

    // Add AI-computed KPIs
    if (computedKpis.value && Object.keys(computedKpis.value).length) {
      payload.kpis = { ...payload.kpis, ...computedKpis.value }
    }

    const { data } = await smartImportApi.execute(payload)
    importResult.value = data.imported
    step.value = 'done'
  } catch (err) {
    error.value = err.response?.data?.error || err.message || t('errorGeneric')
  }
  importing.value = false
}

function applyMapping(row, columns) {
  const result = {}
  for (const [excelCol, scaField] of Object.entries(columns)) {
    if (row[excelCol] !== undefined && row[excelCol] !== '') {
      result[scaField] = row[excelCol]
    }
  }
  return result
}
</script>

<style scoped>
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border); border-top-color: var(--teal);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.drop-zone { border: 2px dashed var(--border); transition: all 0.2s ease; }
.drop-zone.drop-active { border-color: var(--teal); background: rgba(77, 182, 160, 0.05); }
</style>
