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
        <input type="file" accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.json,.pages,.numbers,.tsv,.xml,.html" @change="onFileSelect" style="display: none;" />
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
              <tr v-for="(row, i) in (sheet.previewRows || []).slice(0, 5)" :key="i" style="border-bottom: 1px solid var(--border);">
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
        {{ importResult.events || 0 }} {{ t('planning').toLowerCase() }}
      </p>
      <div v-if="importResult.errors && importResult.errors.length" style="margin-bottom: 16px; text-align: left; background: var(--redBg); border-radius: 8px; padding: 12px; font-size: 12px; color: var(--red);">
        <div v-for="(err, i) in (importResult.errors || []).slice(0, 5)" :key="i">{{ err }}</div>
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
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import JSZip from 'jszip'

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
import { useI18n } from '../i18n'
import { smartImportApi, kpiApi, taskApi, planningApi, smartMatriceApi } from '../api'
import { usePortfolioStore } from '../stores/portfolio'
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
  const taskCount = generatedTasks.value.length + counts.tasks
  return [
    { key: 'portfolio', label: t('portfolio'), count: counts.portfolio },
    { key: 'smart_matrice', label: 'Smart Matrice', count: counts.smart_matrice || 0 },
    { key: 'kpis', label: 'KPIs', count: Object.keys(computedKpis.value).length },
    { key: 'tasks', label: 'Task Board', count: taskCount },
    { key: 'planning', label: t('planning'), count: '✓' },
    { key: 'sheets', label: t('smartImportSheets'), count: aiMapping.value.length },
  ]
})

function moduleIcon(mod) {
  const icons = { portfolio: '💼', smart_matrice: '🧩', kpis: '📊', tasks: '✅', roadmap: '🗺️', team: '👥', skip: '⏭️' }
  return icons[mod] || '📄'
}

function moduleLabel(mod) {
  const labels = { portfolio: t('portfolio'), smart_matrice: 'Smart Matrice', kpis: 'KPIs', tasks: t('tasks'), roadmap: t('roadmap'), team: 'Team', skip: t('smartImportSkip') }
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

// ========== MULTI-FORMAT PARSERS ==========

function getFileExtension(filename) {
  return (filename || '').split('.').pop().toLowerCase()
}

async function parsePDF(buffer) {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const sheets = {}
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lines = []
    let currentLine = []
    let lastY = null
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        if (currentLine.length) lines.push(currentLine.join('\t'))
        currentLine = []
      }
      currentLine.push(item.str)
      lastY = item.transform[5]
    }
    if (currentLine.length) lines.push(currentLine.join('\t'))

    // Convert lines to table rows
    const rows = lines.filter(l => l.trim()).map(line => {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean)
      const row = {}
      parts.forEach((p, idx) => { row[`col_${idx}`] = p })
      return row
    })
    if (rows.length > 1) sheets[`Page ${i}`] = rows
  }
  // Merge all pages into one sheet if only simple content
  if (Object.keys(sheets).length > 3) {
    const all = Object.values(sheets).flat()
    return { 'Document PDF': all }
  }
  return Object.keys(sheets).length ? sheets : { 'Document PDF': [{ col_0: 'Document vide ou non-tabulaire' }] }
}

async function parseDOCX(buffer) {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  const lines = result.value.split('\n').filter(l => l.trim())
  // Try to detect tables: lines with consistent tab/pipe separators
  const rows = []
  for (const line of lines) {
    const parts = line.includes('\t') ? line.split('\t') : line.includes('|') ? line.split('|') : [line]
    const row = {}
    parts.forEach((p, idx) => { row[`col_${idx}`] = p.trim() })
    if (Object.values(row).some(v => v)) rows.push(row)
  }
  return { 'Document Word': rows }
}

async function parsePPTX(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const slides = []
  for (const [path, file] of Object.entries(zip.files)) {
    if (path.match(/ppt\/slides\/slide\d+\.xml$/)) {
      const xml = await file.async('text')
      // Extract text from XML tags <a:t>...</a:t>
      const texts = [...xml.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g)].map(m => m[1])
      if (texts.length) slides.push(texts)
    }
  }
  // Convert slides to rows
  const rows = slides.flatMap((texts, i) => {
    return texts.map(t => ({ slide: `Slide ${i + 1}`, content: t }))
  })
  return { 'Présentation': rows.length ? rows : [{ col_0: 'Présentation vide' }] }
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  if (!lines.length) return { 'CSV': [] }
  const separator = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ','
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''))
  const rows = lines.slice(1).map(line => {
    const vals = line.split(separator).map(v => v.trim().replace(/^["']|["']$/g, ''))
    const row = {}
    headers.forEach((h, i) => { row[h || `col_${i}`] = vals[i] || '' })
    return row
  }).filter(r => Object.values(r).some(v => v))
  return { 'CSV': rows }
}

function parseTXT(text) {
  const lines = text.split('\n').filter(l => l.trim())
  // Detect if it's structured (tabs, pipes, markdown table)
  const hasTable = lines.some(l => l.includes('\t') || (l.includes('|') && l.split('|').length > 2))
  if (hasTable) {
    const separator = lines[0].includes('\t') ? '\t' : '|'
    const headers = lines[0].split(separator).map(h => h.trim()).filter(Boolean)
    const dataLines = lines.filter(l => !l.match(/^[-|: ]+$/)) // skip markdown separators
    const rows = dataLines.slice(1).map(line => {
      const vals = line.split(separator).map(v => v.trim())
      const row = {}
      headers.forEach((h, i) => { row[h || `col_${i}`] = vals[i] || '' })
      return row
    }).filter(r => Object.values(r).some(v => v))
    return { 'Texte': rows }
  }
  // Unstructured text — each line is a task/item
  const rows = lines.map(l => ({ content: l.trim() })).filter(r => r.content.length > 2)
  return { 'Texte': rows }
}

function parseJSON(text) {
  const data = JSON.parse(text)
  // Handle Notion exports (array of objects)
  if (Array.isArray(data)) {
    return { 'JSON': data.map(item => {
      if (typeof item === 'object') return item
      return { value: String(item) }
    })}
  }
  // Handle nested object with arrays
  const sheets = {}
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val) && val.length && typeof val[0] === 'object') {
      sheets[key] = val
    }
  }
  return Object.keys(sheets).length ? sheets : { 'JSON': [data] }
}

async function parseToSheets(file) {
  const ext = getFileExtension(file.name)
  const buffer = await file.arrayBuffer()

  switch (ext) {
    case 'xlsx': case 'xls': case 'numbers': {
      const wb = XLSX.read(buffer, { type: 'array', cellFormula: false, cellDates: true })
      const sheets = {}
      for (const name of wb.SheetNames) {
        const allTables = extractAllTables(wb.Sheets[name])
        for (let i = 0; i < allTables.length; i++) {
          const key = allTables.length > 1 ? `${name}_${i}` : name
          if (allTables[i].length) sheets[key] = allTables[i]
        }
      }
      return sheets
    }
    case 'csv': case 'tsv': {
      const text = new TextDecoder().decode(buffer)
      return parseCSV(text)
    }
    case 'pdf': return await parsePDF(buffer)
    case 'docx': case 'doc': return await parseDOCX(buffer)
    case 'pptx': case 'ppt': return await parsePPTX(buffer)
    case 'json': {
      const text = new TextDecoder().decode(buffer)
      return parseJSON(text)
    }
    case 'txt': case 'md': case 'markdown': case 'xml': case 'html': {
      const text = new TextDecoder().decode(buffer)
      return parseTXT(text)
    }
    default: {
      // Try as text first, then as Excel
      try {
        const text = new TextDecoder().decode(buffer)
        if (text.includes(',') || text.includes('\t') || text.includes('|')) return parseCSV(text)
        return parseTXT(text)
      } catch {
        const wb = XLSX.read(buffer, { type: 'array', cellFormula: false, cellDates: true })
        const sheets = {}
        for (const name of wb.SheetNames) {
          sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' })
        }
        return sheets
      }
    }
  }
}

// ========== MAIN PROCESS ==========

async function processFile(file) {
  error.value = ''
  step.value = 'analyzing'
  analysisStatus.value = `Lecture de ${file.name} (${getFileExtension(file.name).toUpperCase()})...`

  try {
    // Parse any file format into sheets of rows
    const parsedSheets = await parseToSheets(file)

    const rawData = {}
    const mappedSheets = []
    const kpis = {}
    const tasks = []
    const teamData = []

    // Analyze each parsed sheet
    for (const [sheetName, rows] of Object.entries(parsedSheets)) {
      {
        if (!rows || !rows.length) continue
        const headers = Object.keys(rows[0])
        const headersLower = headers.map(h => h.toLowerCase().trim())
        const key = sheetName
        rawData[key] = rows

        const sheetLower = sheetName.toLowerCase()
        // Try keyword-based mapping first, then pattern-based as fallback
        let columns = guessColumns(headers)
        if (Object.keys(columns).length < 2) {
          // Not enough columns matched by name → analyze by data patterns
          const colAnalysis = analyzeColumns(rows)
          columns = { ...autoMapFields(colAnalysis), ...columns }
        }
        const base = { name: key, columns, previewHeaders: headers, previewRows: rows.slice(0, 5), totalRows: rows.length }

        // --- UNIVERSAL DETECTION: try ALL types, pick the best match ---
        const scores = {
          portfolio: scorePortfolio(sheetLower, headersLower, rows),
          smart_matrice: scoreSmartMatrice(sheetLower, headersLower, rows),
          team: scoreTeam(sheetLower, headersLower, rows),
          kpis: scoreKpis(sheetLower, headersLower, rows),
          tasks: scoreTasks(sheetLower, headersLower, rows),
          roadmap: scoreRoadmap(sheetLower, headersLower, rows),
          planning: scorePlanning(sheetLower, headersLower, rows),
        }
        console.log(`Sheet "${sheetName}" scores:`, scores, 'headers:', headersLower.slice(0, 5))

        // Pick the module with highest score
        const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
        const [module, score] = best

        if (score > 0) {
          mappedSheets.push({ ...base, module, confidence: Math.min(0.99, score), notes: getModuleNotes(module) })
        }

        // ALWAYS scan ALL rows for KPIs (every sheet can contain KPI data)
        extractKpisFromRows(rows, kpis)

        // ALWAYS scan for CSM/team patterns — even if score is low
        // The score may be 0 because headers are __EMPTY, but values have person names + numbers
        const hasPersonNames = rows.slice(0, 10).some(r => Object.values(r).some(v => /^[A-ZÀ-Ü][a-zà-ü]+ [A-ZÀ-Ü]/.test(String(v))))
        const hasPercentages = rows.slice(0, 10).some(r => Object.values(r).some(v => String(v).includes('%')))
        if (scores.team > 0.2 || (hasPersonNames && hasPercentages && rows.length <= 30)) {
          extractCsmInsights(rows, kpis, tasks, teamData)
        }

        // Extract tasks if detected
        if (scores.tasks > 0.3) {
          extractTaskRows(rows, headers, tasks)
        }

        // Extract roadmap items
        if (scores.roadmap > 0.3) {
          extractRoadmapRows(rows, headers, tasks)
        }

        // Extract planning events
        if (scores.planning > 0.3) {
          extractPlanningRows(rows, headers, tasks)
        }
      }
    }

    console.log('After extraction — KPIs:', kpis, 'Tasks:', tasks.length, 'Team:', teamData.length)
    if (tasks.length) console.log('Task titles:', tasks.map(t => t.title))

    // --- Generate summary ---
    let summary = ''
    if (kpis.total_arr) summary += `CA Total: ${Number(kpis.total_arr).toLocaleString()}€. `
    if (kpis.avg_health) summary += `Health moyen: ${kpis.avg_health}/100. `
    if (kpis.nps) summary += `NPS: ${kpis.nps}. `
    const wellbeingTasks = tasks.filter(t => t.title.includes('💚') || t.title.includes('💛') || t.title.includes('épuisement') || t.title.includes('bien-être'))
    const urgentTasks = tasks.filter(t => t.quadrant === 'q1')
    if (urgentTasks.length) summary += `${urgentTasks.length} actions urgentes. `
    if (wellbeingTasks.length) summary += `${wellbeingTasks.length} alertes bien-être. `
    if (tasks.length) summary += `${tasks.length} tâches au total (Kanban + Eisenhower). `
    const portfolioCount = mappedSheets.filter(s => s.module === 'portfolio').reduce((s, sh) => s + sh.totalRows, 0)
    if (portfolioCount) summary += `${portfolioCount} comptes clients. `
    const smCount = mappedSheets.filter(s => s.module === 'smart_matrice').reduce((s, sh) => s + sh.totalRows, 0)
    if (smCount) summary += `${smCount} tâches projet (Smart Matrice). `

    // === DATA CLEANING & DEDUPLICATION ===
    const cleaningReport = { duplicates: 0, emptyRows: 0, cleaned: 0 }

    // 1. Dedup portfolio by name across all sheets
    const seenNames = new Set()
    for (const sheet of mappedSheets) {
      if (sheet.module !== 'portfolio') continue
      const rows = rawData[sheet.name] || []
      const cleanRows = []
      for (const r of rows) {
        const name = findCol(r, 'client', 'nom', 'name', 'entreprise', 'company', 'id', 'société') || Object.values(r)[0]
        const nameStr = String(name || '').trim()

        // Skip empty rows
        if (!nameStr || nameStr.length < 2 || /^__empty/i.test(nameStr)) { cleaningReport.emptyRows++; continue }
        // Skip header-like rows
        if (/^(client|nom|name|entreprise|company|total|sous-total|#)/i.test(nameStr)) { cleaningReport.cleaned++; continue }

        // Normalize name for dedup
        const key = nameStr.toLowerCase().replace(/[^a-zà-ü0-9]/g, '')
        if (seenNames.has(key)) { cleaningReport.duplicates++; continue }
        seenNames.add(key)

        // Clean values in the row
        for (const [k, v] of Object.entries(r)) {
          const vs = String(v).trim()
          // Remove currency symbols and spaces from numbers
          if (/^[\d\s.,€$£₩%]+$/.test(vs) && vs.length > 0) {
            r[k] = vs.replace(/[€$£₩\s]/g, '').replace(/,/g, '.')
          }
          // Normalize empty values
          if (vs === '-' || vs === 'N/A' || vs === 'n/a' || vs === '—' || vs === '--') r[k] = ''
        }
        cleanRows.push(r)
      }
      rawData[sheet.name] = cleanRows
      sheet.totalRows = cleanRows.length
      sheet.previewRows = cleanRows.slice(0, 5)
    }

    // 2. Dedup tasks by title
    const seenTaskTitles = new Set()
    const uniqueTasks = []
    for (const t of tasks) {
      const key = t.title.toLowerCase().replace(/[^a-zà-ü0-9]/g, '')
      if (seenTaskTitles.has(key)) { cleaningReport.duplicates++; continue }
      seenTaskTitles.add(key)
      uniqueTasks.push(t)
    }

    // 3. Remove sheets with 0 rows after cleaning
    const finalSheets = mappedSheets.filter(s => s.totalRows > 0 || s.module === 'kpis')

    // Update summary with cleaning info
    if (cleaningReport.duplicates > 0) summary += `🧹 ${cleaningReport.duplicates} doublons supprimés. `
    if (cleaningReport.emptyRows > 0) summary += `${cleaningReport.emptyRows} lignes vides ignorées. `
    if (cleaningReport.cleaned > 0) summary += `${cleaningReport.cleaned} en-têtes/totaux exclus. `

    allSheetData.value = rawData
    aiMapping.value = finalSheets
    computedKpis.value = Object.keys(kpis).length ? kpis : {}
    generatedTasks.value = uniqueTasks
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

// --- CSM insights + wellbeing + task generation (scans VALUES) ---
function extractCsmInsights(rows, kpis, tasks, teamData) {
  let totalArr = 0, totalHealth = 0, count = 0
  const wellbeingAlerts = []
  console.log(`extractCsmInsights called with ${rows.length} rows. First row keys:`, Object.keys(rows[0] || {}))

  for (const row of rows) {
    const vals = Object.values(row).map(v => String(v).trim())
    const keys = Object.keys(row)

    // Find CSM name: "Prénom Nom" pattern
    const csmVal = vals.find(v => v.length > 3 && /^[A-ZÀ-Ü][a-zà-ü]+ [A-ZÀ-Ü]/.test(v)) ||
      findCol(row, 'csm', 'nom', 'name') || ''
    if (!csmVal || csmVal.length < 3) continue
    console.log(`CSM found: "${csmVal}", vals:`, vals.slice(0, 8))

    let arr = 0, health = 0, churn = 0, critical = 0, clients = 0, seniority = ''
    let wellbeingNote = '' // Comment about wellbeing/mood/stress

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i].toLowerCase()
      const v = vals[i]
      const n = parseNum(v)

      // Named columns
      if (k.includes('ca') || k.includes('arr') || k.includes('revenue') || k.includes('chiffre')) { if (n > 1000) arr = n }
      else if (k.includes('health') || k.includes('h.score') || k.includes('santé') || k.includes('score moy')) { health = n }
      else if (k.includes('churn') || k.includes('attrition')) { churn = n }
      else if (k.includes('critique') || k.includes('critical')) { critical = n }
      else if (k.includes('client') || k.includes('compte')) { if (n > 0 && n < 10000) clients = n }
      else if (k.includes('séniorité') || k.includes('seniorite') || k.includes('seniority') || k.includes('ancienneté')) seniority = v
      else if (k.includes('bien-être') || k.includes('bienetre') || k.includes('wellbeing') || k.includes('moral') || k.includes('commentaire') || k.includes('notes') || k.includes('observation')) wellbeingNote = v
      // __EMPTY columns: detect by value pattern
      else if (k.includes('empty') || k === '') {
        if (/senior|junior|confirmé|confirmée|stagiaire/i.test(v)) seniority = v
        else if (n > 100000 && !arr) arr = n
        else if (n > 0 && n <= 10 && !health) health = n
        else if (v.includes('%') && n > 0 && n < 100 && !churn) churn = n
        else if (n > 50 && n <= 1000 && !clients) clients = n
        else if (n > 0 && n <= 200 && !critical) critical = n
        // Detect wellbeing comments: long text with mood/stress keywords
        else if (v.length > 10 && /stress|épuis|fatigue|motivé|positiv|variable|surcharge|burn|fragile|inqui|tendu|sous pression|moral|ambitie|dynamique|serein|confian/i.test(v)) {
          wellbeingNote = v
        }
      }
    }

    const healthNorm = health > 0 && health <= 10 ? Math.round(health * 10) : health
    if (arr > 0) totalArr += arr
    if (healthNorm > 0) { totalHealth += healthNorm; count++ }

    teamData.push({ name: csmVal, arr, health: healthNorm, churn, critical, clients, seniority, wellbeingNote })

    // === MATRICE EISENHOWER — Tâches pertinentes ===

    // Q1: URGENT + IMPORTANT — Churn critique, comptes en danger
    if (churn > 50) {
      tasks.push({ title: `🚨 URGENT — ${csmVal}: churn ${churn}% (> 50%)`, note: `${clients} clients, ${critical} critiques, CA ${arr ? Number(arr).toLocaleString() + '€' : 'N/A'}. Action immédiate requise.`, quadrant: 'q1', color: 'red', account: '' })
    } else if (churn > 35) {
      tasks.push({ title: `⚠️ Review portefeuille ${csmVal} — churn ${churn}%`, note: `${clients} clients, ${critical} critiques, health ${healthNorm}/100.`, quadrant: 'q1', color: 'red', account: '' })
    }

    if (critical > 80) {
      tasks.push({ title: `🔥 ${csmVal}: ${critical} comptes critiques — intervention prioritaire`, note: `CA géré: ${arr ? Number(arr).toLocaleString() + '€' : 'N/A'}. Réunion d'urgence nécessaire.`, quadrant: 'q1', color: 'red', account: '' })
    } else if (critical > 40) {
      tasks.push({ title: `⚠️ ${csmVal}: ${critical} comptes critiques à surveiller`, note: `Plan d'action à définir cette semaine.`, quadrant: 'q1', color: 'orange', account: '' })
    }

    // Q1: URGENT — Wellbeing : signes d'épuisement ou stress
    if (wellbeingNote && /épuis|burn|surcharge|fatigue|sous pression|fragile/i.test(wellbeingNote)) {
      wellbeingAlerts.push({ name: csmVal, note: wellbeingNote, severity: 'high' })
      tasks.push({ title: `💚 1:1 urgent avec ${csmVal} — signes d'épuisement`, note: `"${wellbeingNote}". Priorité absolue : écouter, adapter la charge, proposer du soutien.`, quadrant: 'q1', color: 'red', account: '' })
    }
    // Q2: IMPORTANT — Wellbeing : stress modéré ou variable
    else if (wellbeingNote && /stress|variable|tendu|inqui/i.test(wellbeingNote)) {
      wellbeingAlerts.push({ name: csmVal, note: wellbeingNote, severity: 'medium' })
      tasks.push({ title: `💛 Check-in avec ${csmVal} — moral à surveiller`, note: `"${wellbeingNote}". Planifier un point cette semaine.`, quadrant: 'q2', color: 'orange', account: '' })
    }
    // Q2: IMPORTANT — Wellbeing positif → renforcer
    else if (wellbeingNote && /positiv|motivé|dynamique|ambitie|serein|confian/i.test(wellbeingNote)) {
      wellbeingAlerts.push({ name: csmVal, note: wellbeingNote, severity: 'low' })
      tasks.push({ title: `💚 Valoriser ${csmVal} — énergie positive`, note: `"${wellbeingNote}". Encourager, confier des responsabilités, reconnaître publiquement.`, quadrant: 'q2', color: 'teal', account: '' })
    }

    // Q2: IMPORTANT — Coaching juniors
    if (seniority && /junior|stagiaire/i.test(seniority) && healthNorm > 0 && healthNorm < 60) {
      tasks.push({ title: `🎯 Coaching ${csmVal} — ${seniority}, health ${healthNorm}/100`, note: `Accompagnement renforcé : binôme avec un senior, objectifs adaptés.`, quadrant: 'q2', color: 'orange', account: '' })
    }

    // Q3: URGENT PAS IMPORTANT — Check-in rapide pour CSMs stables mais avec risques modérés
    if (churn > 25 && churn <= 35 && !wellbeingNote) {
      tasks.push({ title: `📞 Point rapide avec ${csmVal} — churn ${churn}% (modéré)`, note: `Pas de signal d'alerte bien-être. Vérifier les comptes à risque.`, quadrant: 'q3', color: 'blue', account: '' })
    }
  }

  if (totalArr > 0 && !kpis.total_arr) kpis.total_arr = totalArr
  if (count > 0) kpis.avg_health = Math.round(totalHealth / count)
  if (teamData.length) kpis.total_clients = teamData.reduce((s, t) => s + (t.clients || 0), 0)

  // Global wellbeing score
  const highAlerts = wellbeingAlerts.filter(a => a.severity === 'high').length
  const medAlerts = wellbeingAlerts.filter(a => a.severity === 'medium').length
  if (highAlerts > 0 || medAlerts > 1) {
    kpis.wellbeing_score = highAlerts > 2 ? 'critical' : highAlerts > 0 ? 'warning' : 'ok'
  }

  // Q1: Team-level tasks
  const avgChurn = teamData.reduce((s, t) => s + (t.churn || 0), 0) / (teamData.length || 1)
  if (avgChurn > 40) {
    tasks.push({ title: `📊 Churn moyen équipe ${Math.round(avgChurn)}% — plan de rétention global`, note: `Tous les CSMs au-dessus de 35%. Revoir la stratégie de rétention.`, quadrant: 'q1', color: 'red', account: '' })
  }
  if (highAlerts >= 2) {
    tasks.push({ title: `🚨 ${highAlerts} CSMs en épuisement — réunion équipe bien-être`, note: `Signaux d'épuisement chez ${wellbeingAlerts.filter(a => a.severity === 'high').map(a => a.name).join(', ')}. Réunion managériale urgente.`, quadrant: 'q1', color: 'red', account: '' })
  }

  // Q2: NPS global
  if (kpis.nps && kpis.nps < 30) {
    tasks.push({ title: `📉 NPS global: ${kpis.nps} — plan d'amélioration`, note: `NPS en dessous de 30. Objectif > 40. Identifier les détracteurs.`, quadrant: 'q2', color: 'orange', account: '' })
  }
}

// === COLUMN TYPE ANALYZER — detects type by DATA PATTERNS, not labels ===
function analyzeColumns(rows) {
  if (!rows.length) return {}
  const headers = Object.keys(rows[0])
  const analysis = {}
  const sample = rows.slice(0, Math.min(rows.length, 20))

  for (const col of headers) {
    const vals = sample.map(r => String(r[col] || '').trim()).filter(v => v && v !== '-' && v !== 'N/A')
    if (!vals.length) { analysis[col] = { type: 'empty' }; continue }

    const stats = {
      numbers: 0, bigNumbers: 0, smallNumbers: 0, percentages: 0,
      dates: 0, emails: 0, personNames: 0, longText: 0, shortText: 0,
      urls: 0, booleans: 0, total: vals.length
    }

    for (const v of vals) {
      const n = parseNum(v)
      if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(v) || /^\d{4}-\d{2}-\d{2}/.test(v)) stats.dates++
      else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) stats.emails++
      else if (/^https?:\/\//.test(v)) stats.urls++
      else if (/^(oui|non|yes|no|true|false|vrai|faux|✓|✗|x)$/i.test(v)) stats.booleans++
      else if (/^[A-ZÀ-Ü][a-zà-ü]+(\s+[A-ZÀ-Ü][a-zà-ü]+)+$/.test(v) && v.length < 40) stats.personNames++
      else if (v.includes('%') || (n > 0 && n <= 100 && /\d/.test(v))) stats.percentages++
      else if (n !== 0 && !isNaN(n)) {
        stats.numbers++
        if (Math.abs(n) > 10000) stats.bigNumbers++
        else if (Math.abs(n) <= 10) stats.smallNumbers++
      }
      else if (v.length > 50) stats.longText++
      else if (v.length > 2) stats.shortText++
    }

    const t = stats.total
    let type = 'text'
    if (stats.emails / t > 0.5) type = 'email'
    else if (stats.dates / t > 0.5) type = 'date'
    else if (stats.personNames / t > 0.5) type = 'person_name'
    else if (stats.bigNumbers / t > 0.4) type = 'revenue'
    else if (stats.smallNumbers / t > 0.4 && stats.percentages / t < 0.3) type = 'score'
    else if (stats.percentages / t > 0.4) type = 'percentage'
    else if (stats.numbers / t > 0.5) type = 'number'
    else if (stats.longText / t > 0.3) type = 'comment'
    else if (stats.booleans / t > 0.5) type = 'boolean'
    else if (stats.urls / t > 0.5) type = 'url'

    analysis[col] = { type, stats, sample: vals.slice(0, 3) }
  }
  return analysis
}

// Map analyzed column types to Scalyo fields
function autoMapFields(colAnalysis) {
  const mapping = {}
  const used = new Set()

  // Priority order: map most specific types first
  for (const [col, info] of Object.entries(colAnalysis)) {
    if (info.type === 'empty') continue
    let field = null

    if (info.type === 'person_name' && !used.has('name') && !used.has('csm')) {
      // First person_name column = account name or CSM
      field = used.has('name') ? 'csm' : 'name'
    } else if (info.type === 'email') {
      field = 'contact_email'
    } else if (info.type === 'revenue') {
      field = !used.has('arr') ? 'arr' : 'mrr'
    } else if (info.type === 'score') {
      field = !used.has('health') ? 'health' : null
    } else if (info.type === 'percentage') {
      field = !used.has('churn_rate') ? 'churn_rate' : !used.has('adoption_rate') ? 'adoption_rate' : null
    } else if (info.type === 'date') {
      field = !used.has('renewal') ? 'renewal' : !used.has('due') ? 'due' : null
    } else if (info.type === 'comment') {
      field = !used.has('notes') ? 'notes' : !used.has('wellbeing') ? 'wellbeing' : null
    } else if (info.type === 'text') {
      if (!used.has('name')) field = 'name'
      else if (!used.has('csm')) field = 'csm'
      else if (!used.has('industry')) field = 'industry'
      else if (!used.has('contact')) field = 'contact'
    }

    if (field) {
      mapping[col] = field
      used.add(field)
    }
  }
  return mapping
}

// === UNIVERSAL SCORING — each function returns 0-1 confidence ===

function scorePortfolio(name, headers, rows) {
  let score = 0
  // By sheet name (any language)
  if (['client', 'portfolio', 'portefeuille', 'account', 'compte', 'customer', '고객', '顧客'].some(k => name.includes(k))) score += 0.5
  // By column names — must have client-specific columns
  if (headers.some(h => ['client', 'compte', 'account', 'entreprise', 'company', 'société', 'customer', 'nom client', 'id client'].includes(h))) score += 0.3
  if (headers.some(h => h.includes('arr') || h.includes('mrr') || h.includes('revenue'))) score += 0.2
  if (headers.some(h => h.includes('contact') || h.includes('email') || h.includes('industry') || h.includes('secteur'))) score += 0.2
  // By data patterns: many rows with text + large numbers = likely portfolio
  const colTypes = analyzeColumns(rows)
  const types = Object.values(colTypes).map(c => c.type)
  if (types.includes('revenue') && (types.includes('text') || types.includes('person_name'))) score += 0.2
  if (types.includes('email')) score += 0.2
  if (rows.length > 10) score += 0.1

  // NEGATIVE signals — reduce score if data looks like tasks/projects
  if (headers.some(h => /statut|status|priorité|priority|estimation|heures|hours|sprint|phase|scénario|scenario|backlog|à faire|todo|en cours|in progress|terminé|done|bloqué|blocked/i.test(h))) score -= 0.4
  // If first column values look like task statuses, not company names
  const firstColValues = rows.slice(0, 10).map(r => String(Object.values(r)[0] || '').toLowerCase())
  if (firstColValues.some(v => /^(à faire|en cours|terminé|en attente|bloqué|todo|doing|done|blocked|waiting)/i.test(v))) score -= 0.5
  // If headers include duration/time estimation columns
  if (headers.some(h => /dur[ée]|duration|estimation|min|max|moyenne|average|optimiste|pessimiste/i.test(h))) score -= 0.4

  return Math.max(0, Math.min(1, score))
}

function scoreSmartMatrice(name, headers, rows) {
  let score = 0
  // By sheet name
  if (['projet', 'project', 'sprint', 'matrice', 'tâche', 'task', 'backlog', 'kanban', 'plan de travail', 'workplan', '프로젝트', 'estimation', 'plan', 'planning projet'].some(k => name.includes(k))) score += 0.5
  // By column names — project/task structure
  if (headers.some(h => /statut|status|état|state/i.test(h))) score += 0.2
  if (headers.some(h => /priorité|priority|urgence/i.test(h))) score += 0.15
  if (headers.some(h => /estimation|estimé|estimated|dur[ée]|duration|heures|hours|temps|time|charge/i.test(h))) score += 0.2
  if (headers.some(h => /assigné|assigned|responsable|owner|référent/i.test(h))) score += 0.15
  if (headers.some(h => /sprint|phase|groupe|group|catégorie|category|module/i.test(h))) score += 0.15
  if (headers.some(h => /début|start|fin|end|deadline|échéance/i.test(h))) score += 0.1
  if (headers.some(h => /min|max|optimiste|pessimiste|scénario|scenario|moyenne|average/i.test(h))) score += 0.3
  // By data: status values in cells
  const allVals = rows.slice(0, 20).flatMap(r => Object.values(r).map(v => String(v).toLowerCase()))
  if (allVals.some(v => /^(à faire|en cours|terminé|en attente|bloqué|todo|doing|done|in.?progress|blocked|waiting|pending)/i.test(v))) score += 0.3
  // Data with many numbers (durations) + text (task names) + small row count
  const colTypes = analyzeColumns(rows)
  const types = Object.values(colTypes).map(c => c.type)
  if (types.includes('number') && types.includes('text') && !types.includes('email') && !types.includes('revenue')) score += 0.2

  return Math.max(0, Math.min(1, score))
}

function scoreTeam(name, headers, rows) {
  let score = 0
  if (['csm', 'équipe', 'equipe', 'team', 'vue csm', 'profil', 'collaborat', 'employee', '팀'].some(k => name.includes(k))) score += 0.5
  if (headers.some(h => h === 'csm' || h.includes('séniorité') || h.includes('seniorite') || h.includes('seniority'))) score += 0.3
  if (headers.some(h => h.includes('churn') || h.includes('client'))) score += 0.2
  // By data: person names + percentages + small row count = team
  const colTypes = analyzeColumns(rows)
  const types = Object.values(colTypes).map(c => c.type)
  if (types.includes('person_name') && types.includes('percentage') && rows.length <= 30) score += 0.3
  if (types.includes('person_name') && types.includes('comment') && rows.length <= 30) score += 0.2
  return Math.min(1, score)
}

function scoreKpis(name, headers, rows) {
  let score = 0
  if (['kpi', 'dashboard', 'synthese', 'résumé', 'summary', 'indicat', 'metric', 'stats', 'overview', '指標'].some(k => name.includes(k))) score += 0.5
  if (headers.some(h => h.includes('nps') || h.includes('churn') || h.includes('health') || h.includes('total'))) score += 0.3
  // KPI = small table with label-value pairs
  if (rows.length <= 10 && rows.length > 0) score += 0.2
  // Check cells for any label-number pattern
  const allVals = rows.flatMap(r => Object.entries(r).map(([, v]) => String(v).toLowerCase()))
  if (allVals.some(v => /total|average|mean|median|sum|count|rate|score|index|ratio/i.test(v))) score += 0.2
  return Math.min(1, score)
}

function scoreTasks(name, headers, rows) {
  let score = 0
  if (['task', 'tâche', 'tache', 'todo', 'action', 'à faire', 'a faire', 'suivi', 'backlog', 'kanban', '업무', '작업'].some(k => name.includes(k))) score += 0.5
  if (headers.some(h => ['tâche', 'task', 'action', 'todo', 'à faire', 'titre', 'description', 'assigné', 'assigned'].includes(h))) score += 0.3
  if (headers.some(h => /priorité|priority|statut|status|deadline|échéance|due/i.test(h))) score += 0.2
  // By data: text values that look like actions
  const allVals = rows.slice(0, 15).flatMap(r => Object.values(r).map(v => String(v)))
  if (allVals.some(v => /^(appeler|planifier|envoyer|vérifier|préparer|organiser|suivre|relancer|contacter|call|send|schedule|review|prepare|check|update|fix|deploy|create)/i.test(v))) score += 0.3
  // By data patterns: text + dates + booleans/status = tasks
  const colTypes = analyzeColumns(rows)
  const types = Object.values(colTypes).map(c => c.type)
  if (types.includes('date') && types.includes('text') && (types.includes('boolean') || headers.some(h => /statut|status/i.test(h)))) score += 0.3
  return Math.min(1, score)
}

function scoreRoadmap(name, headers, rows) {
  let score = 0
  if (['roadmap', 'jalons', 'milestone', 'étape', 'objectif', 'okr', '로드맵'].some(k => name.includes(k))) score += 0.5
  if (headers.some(h => ['milestone', 'jalon', 'étape', 'objectif', 'livrable', 'deliverable'].includes(h))) score += 0.3
  if (headers.some(h => /progress|avancement|%|completion/i.test(h))) score += 0.2
  // Don't match generic "plan" or "projet" — those are more likely smart_matrice
  if (['plan', 'projet', 'sprint'].some(k => name.includes(k)) && !['roadmap', 'jalons', 'milestone'].some(k => name.includes(k))) score -= 0.2
  return Math.max(0, Math.min(1, score))
}

function scorePlanning(name, headers, rows) {
  let score = 0
  if (['planning', 'calendar', 'agenda', 'rendez-vous', 'rdv', 'réunion', 'meeting', 'événement', 'event', '일정'].some(k => name.includes(k))) score += 0.5
  if (headers.some(h => /date|heure|time|début|start|fin|end/i.test(h))) score += 0.3
  if (headers.some(h => /lieu|location|salle|room|lien|link|zoom|teams/i.test(h))) score += 0.2
  // By data: mostly date columns = likely planning
  const colTypes = analyzeColumns(rows)
  const dateCount = Object.values(colTypes).filter(c => c.type === 'date').length
  if (dateCount >= 2) score += 0.3
  return Math.min(1, score)
}

function getModuleNotes(module) {
  const notes = {
    portfolio: 'Portefeuille client détecté',
    smart_matrice: 'Projets / tâches détectés → Smart Matrice',
    team: 'Données équipe CSM — bien-être et performance',
    kpis: 'Indicateurs de performance extraits',
    tasks: 'Tâches / actions à importer dans le Kanban',
    roadmap: 'Roadmap / jalons de projet',
    planning: 'Événements à ajouter au planning',
  }
  return notes[module] || 'Détecté automatiquement'
}

// === EXTRACTORS for tasks, roadmap, planning ===

function extractTaskRows(rows, headers, tasks) {
  const cols = guessColumns(headers)
  const titleField = Object.entries(cols).find(([, v]) => v === 'name')?.[0] ||
    headers.find(h => /tâche|task|action|titre|title|todo|description|à faire/i.test(h)) || headers[0]

  for (const row of rows) {
    const title = String(row[titleField] || '').trim()
    if (!title || title.length < 3) continue
    // Skip headers/labels that repeat
    if (/^(tâche|task|action|titre|title|statut|status)$/i.test(title)) continue

    const note = findCol(row, 'note', 'description', 'detail', 'détail', 'commentaire') || ''
    const due = findCol(row, 'date', 'échéance', 'echeance', 'due', 'deadline', 'limite') || ''
    const account = findCol(row, 'client', 'compte', 'account') || ''
    const priority = String(findCol(row, 'priorité', 'priority', 'urgence') || '').toLowerCase()
    const status = String(findCol(row, 'statut', 'status', 'état') || '').toLowerCase()

    // Skip if already done
    if (status.includes('terminé') || status.includes('done') || status.includes('fait') || status.includes('fermé')) continue

    let quadrant = 'q2', color = 'teal'
    if (priority.includes('urgent') || priority.includes('critic') || priority.includes('haute') || priority.includes('high')) { quadrant = 'q1'; color = 'red' }
    else if (priority.includes('moyen') || priority.includes('medium') || priority.includes('normal')) { quadrant = 'q2'; color = 'orange' }
    else if (priority.includes('basse') || priority.includes('low') || priority.includes('faible')) { quadrant = 'q4'; color = 'blue' }

    tasks.push({ title, note: String(note), quadrant, color, account: String(account), due: String(due) })
  }
}

function extractRoadmapRows(rows, headers, tasks) {
  // Roadmap items go to the roadmap array in the import payload (not tasks)
  // But we store them in tasks for preview, they'll be separated during doImport
  for (const row of rows) {
    const title = findCol(row, 'titre', 'title', 'objectif', 'objective', 'milestone', 'jalon', 'livrable', 'étape') ||
      findCol(row, 'nom', 'name', 'description') || ''
    if (!title || String(title).length < 3) continue
    if (/^(titre|title|objectif|phase|milestone)$/i.test(String(title))) continue

    const phase = findCol(row, 'phase', 'étape', 'step') || '1'
    const status = String(findCol(row, 'statut', 'status', 'état') || 'pending').toLowerCase()
    const due = findCol(row, 'date', 'échéance', 'due', 'deadline') || ''
    const progress = parseNum(findCol(row, 'progress', 'avancement', '%'))
    const owner = findCol(row, 'responsable', 'owner', 'assigné', 'assigned') || ''

    tasks.push({
      title: `🗺️ ${String(title).trim()}`,
      note: `Phase: ${phase}, Statut: ${status}, Avancement: ${progress}%${owner ? ', Responsable: ' + owner : ''}`,
      quadrant: 'q2', color: 'teal', account: '', due: String(due),
      _type: 'roadmap', _phase: String(phase), _status: status, _progress: progress, _owner: String(owner),
    })
  }
}

function extractPlanningRows(rows, headers, tasks) {
  for (const row of rows) {
    const title = findCol(row, 'titre', 'title', 'événement', 'event', 'réunion', 'meeting', 'objet', 'sujet') ||
      findCol(row, 'nom', 'name', 'description') || ''
    if (!title || String(title).length < 3) continue
    if (/^(titre|title|événement|date|heure)$/i.test(String(title))) continue

    const date = findCol(row, 'date', 'jour', 'day') || ''
    const time = findCol(row, 'heure', 'time', 'début', 'start') || ''
    const location = findCol(row, 'lieu', 'location', 'salle', 'room', 'lien', 'link', 'zoom') || ''

    tasks.push({
      title: `📅 ${String(title).trim()}`,
      note: `${date ? 'Date: ' + date : ''}${time ? ' à ' + time : ''}${location ? ' — ' + location : ''}`,
      quadrant: 'q2', color: 'blue', account: '', due: String(date),
      _type: 'planning',
    })
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
    const payload = { portfolio: [], smart_matrice: [], kpis: {}, tasks: [], roadmap: [] }

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
      } else if (sheet.module === 'smart_matrice') {
        // Smart detection of columns — handle __EMPTY headers from merged Excel cells
        const sampleRow = rows[0] || {}
        const colKeys = Object.keys(sampleRow)

        // Find the best column for each role by analyzing content
        let taskCol = null, groupCol = null, statusCol = null, priorityCol = null
        for (const key of colKeys) {
          const keyL = key.toLowerCase()
          const sampleVals = rows.slice(0, 15).map(r => String(r[key] || '').trim()).filter(Boolean)
          if (!sampleVals.length) continue

          // Task name: longest text column with unique values
          if (!taskCol && sampleVals.some(v => v.length > 5) && new Set(sampleVals).size > sampleVals.length * 0.5) {
            if (keyL.includes('tâche') || keyL.includes('task') || keyL.includes('sous-tâche') || keyL.includes('subtask') || keyL.includes('description') || keyL.includes('nom') || keyL.includes('name')) {
              taskCol = key
            }
          }
          // Group: column with repeated values (module names, categories)
          if (!groupCol && new Set(sampleVals).size < sampleVals.length * 0.5 && sampleVals[0].length > 2) {
            if (keyL.includes('module') || keyL.includes('group') || keyL.includes('phase') || keyL.includes('catégorie') || keyL.includes('category') || keyL.includes('sprint') || keyL.includes('section')) {
              groupCol = key
            }
          }
          // Status
          if (keyL.includes('statut') || keyL.includes('status') || keyL.includes('état')) statusCol = key
          // Priority
          if (keyL.includes('priorité') || keyL.includes('priority') || keyL.includes('urgence')) priorityCol = key
        }

        // Fallback: if no named columns found, guess by position and content
        if (!taskCol || !groupCol) {
          for (const key of colKeys) {
            const sampleVals = rows.slice(0, 20).map(r => String(r[key] || '').trim()).filter(Boolean)
            if (!sampleVals.length) continue
            const avgLen = sampleVals.reduce((a, v) => a + v.length, 0) / sampleVals.length
            const uniqueRatio = new Set(sampleVals).size / sampleVals.length

            // Group column: short text, repeated (e.g., "TABLEAU DE BORD" appears many times)
            if (!groupCol && uniqueRatio < 0.4 && avgLen > 3 && avgLen < 50) { groupCol = key; continue }
            // Task column: longer text, mostly unique
            if (!taskCol && uniqueRatio > 0.5 && avgLen > 5) { taskCol = key; continue }
          }
        }

        // Last resort: first text column = task, skip number-only columns
        if (!taskCol) {
          taskCol = colKeys.find(k => {
            const vals = rows.slice(0, 5).map(r => String(r[k] || ''))
            return vals.some(v => v.length > 3 && isNaN(Number(v)))
          }) || colKeys[0]
        }

        console.log('[SM Import] columns:', { taskCol, groupCol, statusCol, priorityCol })

        for (const row of rows) {
          const taskName = String(row[taskCol] || '').trim()
          if (!taskName || taskName.length < 2) continue
          // Skip header-like rows
          if (/^(#|numéro|number|total|sous-total|id)$/i.test(taskName)) continue
          // Skip pure numbers
          if (!isNaN(Number(taskName)) && taskName.length < 4) continue

          const group = groupCol ? String(row[groupCol] || '').trim() : ''
          const status = statusCol ? String(row[statusCol] || '').toLowerCase() : 'todo'
          const priority = priorityCol ? String(row[priorityCol] || '').toLowerCase() : 'medium'

          // Normalize status
          let normalizedStatus = 'todo'
          if (/terminé|done|complet|fini|closed/i.test(status)) normalizedStatus = 'done'
          else if (/en cours|doing|in.?progress|started|actif/i.test(status)) normalizedStatus = 'doing'
          else if (/bloqué|blocked|waiting|attente|pause/i.test(status)) normalizedStatus = 'blocked'

          payload.smart_matrice.push({
            project_name: group || sheet.name.replace(/_\d+$/, '') || 'Projet importé',
            name: taskName,
            group_name: group,
            status: normalizedStatus,
            priority: /urgent|critique|high|haute/i.test(priority) ? 'urgent' : /moyen|medium|normal/i.test(priority) ? 'normal' : 'normal',
          })
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

    // --- FINAL DATA CLEANING before import ---

    // Clean portfolio: compute ARR/MRR, normalize health, validate risk
    for (const acc of payload.portfolio) {
      if (!acc.arr && acc.mrr) acc.arr = acc.mrr * 12
      if (!acc.mrr && acc.arr) acc.mrr = Math.round(acc.arr / 12)
      // Clean strings: trim, remove leading/trailing quotes
      for (const k of ['name', 'csm', 'industry', 'contact', 'contact_email', 'notes']) {
        if (acc[k]) acc[k] = String(acc[k]).trim().replace(/^["']|["']$/g, '')
      }
      // Validate email format
      if (acc.contact_email && !acc.contact_email.includes('@')) acc.contact_email = ''
      // Ensure numbers
      acc.arr = Math.abs(parseNum(acc.arr))
      acc.mrr = Math.abs(parseNum(acc.mrr))
      acc.health = Math.min(100, Math.max(0, parseInt(acc.health) || 70))
    }

    // Remove empty portfolio entries
    payload.portfolio = payload.portfolio.filter(a => a.name && a.name.length >= 2)

    // Add generated tasks (separate roadmap/planning from regular tasks)
    if (generatedTasks.value.length) {
      for (const t of generatedTasks.value) {
        if (t._type === 'roadmap') {
          payload.roadmap.push({ title: t.title.replace(/^🗺️\s*/, ''), phase: t._phase, status: t._status, due: t.due || '', progress: t._progress || 0, owner: t._owner || '' })
        } else {
          payload.tasks.push(t)
        }
      }
    }

    // Dedup tasks + remove invalid ones
    const seenTitles = new Set()
    payload.tasks = payload.tasks.filter(t => {
      if (!t || !t.title) return false
      const key = String(t.title).toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!key || seenTitles.has(key)) return false
      seenTitles.add(key)
      return true
    })

    // === ALWAYS compute KPIs from imported portfolio — UNCONDITIONAL ===
    if (payload.portfolio.length) {
      const totalArr = payload.portfolio.reduce((s, a) => s + (a.arr || 0), 0)
      const totalMrr = payload.portfolio.reduce((s, a) => s + (a.mrr || 0), 0)
      const avgHealth = Math.round(payload.portfolio.reduce((s, a) => s + (a.health || 70), 0) / payload.portfolio.length)
      const criticalCount = payload.portfolio.filter(a => a.risk === 'critical').length
      const watchCount = payload.portfolio.filter(a => a.risk === 'medium').length
      const lowHealthAccounts = payload.portfolio.filter(a => a.health > 0 && a.health < 50)
      const csms = [...new Set(payload.portfolio.map(a => a.csm).filter(Boolean))]
      const noCSM = payload.portfolio.filter(a => !a.csm)

      payload.kpis = {
        mrr: totalMrr || Math.round(totalArr / 12),
        nps: computedKpis.value?.nps || 0,
        csat: computedKpis.value?.csat || 0,
        renewalRate: computedKpis.value?.adoption_rate || 0,
        churned: criticalCount,
        resolvedTickets: 0,
        total_arr: totalArr,
        churn_rate: computedKpis.value?.churn_rate || 0,
        avg_health: avgHealth,
      }

      // === GENERATE TASKS (Eisenhower + Kanban) ===

      const criticals = payload.portfolio.filter(a => a.risk === 'critical')

      // Q1 — FAIRE MAINTENANT (urgent + important) : comptes critiques
      for (const acc of criticals.slice(0, 5)) {
        payload.tasks.push({ title: `🚨 Appel urgent : ${acc.name}`, note: `Compte critique. Health ${acc.health}/100. ARR: ${acc.arr ? Number(acc.arr).toLocaleString() + '€' : 'N/A'}. Objectif : comprendre la situation et proposer un plan d'action sous 48h.`, quadrant: 'q1', color: 'red', account: acc.name })
      }
      for (const acc of lowHealthAccounts.slice(0, 3)) {
        if (criticals.find(c => c.name === acc.name)) continue
        payload.tasks.push({ title: `⚠️ Point de suivi : ${acc.name}`, note: `Health ${acc.health}/100 — en dessous du seuil. Contacter le client cette semaine.`, quadrant: 'q1', color: 'orange', account: acc.name })
      }

      // Q2 — PLANIFIER (important, pas urgent) : reviews, coaching, stratégie
      if (noCSM.length > 0) {
        payload.tasks.push({ title: `📋 Assigner CSM à ${noCSM.length} comptes orphelins`, note: 'Ces comptes n\'ont pas de CSM. Répartir dans l\'équipe selon la charge.', quadrant: 'q2', color: 'orange', account: '' })
      }
      for (const csm of csms.slice(0, 5)) {
        const csmAccounts = payload.portfolio.filter(a => a.csm === csm)
        const csmRisk = csmAccounts.filter(a => a.risk === 'critical' || (a.health > 0 && a.health < 50)).length
        payload.tasks.push({ title: `📊 Review ${csm} — ${csmAccounts.length} comptes`, note: `${csmRisk} comptes à risque. Préparer les points clés pour le 1:1.`, quadrant: 'q2', color: 'teal', account: '' })
      }
      const watches = payload.portfolio.filter(a => a.risk === 'medium').slice(0, 3)
      for (const acc of watches) {
        payload.tasks.push({ title: `👁️ Surveiller : ${acc.name}`, note: `Compte en vigilance. Health ${acc.health}/100. Planifier un check-in mensuel.`, quadrant: 'q2', color: 'orange', account: acc.name })
      }

      // Q3 — DÉLÉGUER (urgent, pas important) : admin, suivi routine
      payload.tasks.push({ title: `📧 Envoyer rapport COPIL à l'équipe`, note: `${payload.portfolio.length} comptes importés. Partager le résumé avec les CSMs.`, quadrant: 'q3', color: 'blue', account: '' })

      // Global COPIL
      payload.tasks.push({ title: `🗂️ Organiser le prochain COPIL`, note: `ARR: ${Number(totalArr).toLocaleString()}€. Health moyen: ${avgHealth}/100. ${criticalCount} critiques, ${watchCount} en vigilance. ${csms.length} CSMs.`, quadrant: 'q2', color: 'teal', account: '' })

      // === GENERATE PLANNING EVENTS ===
      const today = new Date()
      const nextMonday = new Date(today)
      nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7)
      const fmtDate = (d) => d.toISOString().slice(0, 10)

      payload.events = []

      // COPIL meeting
      payload.events.push({
        title: `COPIL — Revue portefeuille (${payload.portfolio.length} comptes)`,
        date: fmtDate(nextMonday),
        startTime: '10:00',
        endTime: '11:30',
        color: 'teal',
        account: '',
      })

      // 1:1 with each CSM
      for (let i = 0; i < csms.length && i < 5; i++) {
        const d = new Date(nextMonday)
        d.setDate(d.getDate() + i)
        payload.events.push({
          title: `1:1 avec ${csms[i]} — review portefeuille`,
          date: fmtDate(d),
          startTime: '14:00',
          endTime: '14:45',
          color: 'blue',
          account: '',
        })
      }

      // Follow-up calls for critical accounts
      for (let i = 0; i < criticals.length && i < 3; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i + 1)
        payload.events.push({
          title: `Appel ${criticals[i].name} — compte critique`,
          date: fmtDate(d),
          startTime: '09:00',
          endTime: '09:30',
          color: 'red',
          account: criticals[i].name,
        })
      }
    }

    // Add wellbeing/CSM tasks from earlier extraction
    if (generatedTasks.value.length) {
      for (const t of generatedTasks.value) {
        if (!payload.tasks.find(x => x.title === t.title)) {
          payload.tasks.push(t)
        }
      }
    }

    // Log payload for debugging
    console.log('Smart Import payload:', {
      portfolio: payload.portfolio.length,
      kpis: payload.kpis,
      tasks: payload.tasks.length,
      roadmap: payload.roadmap.length,
      taskTitles: payload.tasks.map(t => t.title).slice(0, 5),
    })

    // === SINGLE API CALL — send EVERYTHING through /execute ===
    // Format tasks and events for the backend
    const now = new Date().toISOString()
    const formattedTasks = payload.tasks.map((t, i) => ({
      id: (Date.now() + i).toString(),
      title: String(t.title || 'Sans titre'),
      note: String(t.note || ''),
      quadrant: t.quadrant || 'q1',
      color: t.color || 'teal',
      done: false,
      dueDate: String(t.due || t.dueDate || ''),
      account: String(t.account || ''),
      createdAt: now,
    }))

    const formattedEvents = (payload.events || []).map((ev, i) => ({
      id: (Date.now() + 5000 + i).toString(),
      title: String(ev.title || ''),
      date: String(ev.date || ''),
      startTime: String(ev.startTime || '09:00'),
      endTime: String(ev.endTime || '10:00'),
      color: ev.color || 'teal',
      account: String(ev.account || ''),
      notes: String(ev.notes || ''),
    }))

    try {
      const { data } = await smartImportApi.execute({
        portfolio: payload.portfolio,
        kpis: payload.kpis,
        tasks: formattedTasks,
        roadmap: payload.roadmap || [],
        events: formattedEvents,
      })
      console.log('Import result:', data)
      importResult.value = data.imported || data

      // Force refresh portfolio store so dashboard shows new data
      try { usePortfolioStore().fetchAccounts() } catch {}

      // Sync to modules: Clients Store, Smart Matrice, Tasks Store
      try {
        const { useClientsStore } = await import('../stores/clients')
        const { useTasksStore } = await import('../stores/tasks')
        const clientsStore = useClientsStore()
        const tasksStore = useTasksStore()

        // Refresh clients from API (will pick up new accounts)
        await clientsStore.fetchClients()

        // Refresh SM store if smart_matrice data was imported
        if (payload.smart_matrice?.length) {
          try {
            const { useSmartMatriceStore } = await import('../stores/smartMatrice')
            const smStore = useSmartMatriceStore()
            await smStore.fetchProjects()
            console.log('[SM] Store refreshed, projets:', smStore.projects.length)
          } catch {}
        }

        // Refresh tasks store (Gantt, Playbooks, OKR)
        await tasksStore.fetchAll()
      } catch (syncErr) {
        console.warn('Module sync after import:', syncErr)
      }

      // Also try to save KPIs and tasks via their own APIs as backup
      try {
        if (payload.kpis && payload.kpis.mrr) {
          await kpiApi.saveMonthly({ period: new Date().toISOString().slice(0, 7), kpis: payload.kpis })
        }
      } catch (e) { console.warn('KPI backup save failed:', e) }

      try {
        if (formattedTasks.length) {
          await taskApi.saveTasks(formattedTasks)
        }
      } catch (e) { console.warn('Task backup save failed:', e) }

      try {
        if (formattedEvents.length) {
          await planningApi.saveEvents(formattedEvents)
        }
      } catch (e) { console.warn('Planning backup save failed:', e) }

      step.value = 'done'
    } catch (err) {
      console.error('Import error:', err.response?.data || err)
      error.value = err.response?.data?.error || err.message || t('errorGeneric')
    }
  } catch (outerErr) {
    console.error('Import outer error:', outerErr)
    error.value = outerErr.message || t('errorGeneric')
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
