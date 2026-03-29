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

      <!-- Empty state -->
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
    // 1. Parse Excel client-side
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellFormula: false, cellDates: true })

    // 2. Extract schema for AI analysis
    const sheets = []
    const rawData = {}

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
      if (!rows.length) continue

      // Try multiple start rows for complex sheets with decorative headers
      let bestRows = rows
      let bestHeaders = Object.keys(rows[0])
      const dataKeywords = ['csm', 'client', 'nom', 'name', 'arr', 'mrr', 'ca', 'health', 'santé',
        'nps', 'churn', 'task', 'tâche', 'phase', 'séniorité', 'contact', 'email',
        'company', 'entreprise', 'revenue', 'score', 'status', 'statut', 'date']

      const hasDataHeaders = bestHeaders.some(h => dataKeywords.some(k => h.toLowerCase().includes(k)))

      if (!hasDataHeaders) {
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
        for (let startRow = 1; startRow <= Math.min(range.e.r, 15); startRow++) {
          const subRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, range: startRow })
          if (!subRows.length) continue
          const subHeaders = Object.keys(subRows[0])
          if (subHeaders.some(h => dataKeywords.some(k => h.toLowerCase().includes(k)))) {
            bestRows = subRows
            bestHeaders = subHeaders
            break
          }
        }
      }

      rawData[sheetName] = bestRows
      sheets.push({
        name: sheetName,
        headers: bestHeaders,
        sampleRows: bestRows.slice(0, 3),
        totalRows: bestRows.length,
      })
    }

    allSheetData.value = rawData

    if (!sheets.length) {
      error.value = t('smartImportNoData')
      step.value = 'upload'
      return
    }

    // 3. Send to AI for analysis
    analysisStatus.value = t('smartImportAnalyzing')

    try {
      const { data } = await smartImportApi.analyze(sheets)

      if (data.sheets && Array.isArray(data.sheets)) {
        aiMapping.value = data.sheets.map(s => ({
          ...s,
          previewHeaders: Object.keys(rawData[s.name]?.[0] || {}),
          previewRows: (rawData[s.name] || []).slice(0, 5),
          totalRows: (rawData[s.name] || []).length,
        }))
      }
    } catch (aiErr) {
      // AI failed — fall back to heuristic mapping
      console.warn('AI analysis failed, using heuristics:', aiErr)
      aiMapping.value = sheets.map(s => ({
        name: s.name,
        module: guessModule(s.name, s.headers),
        confidence: 0.5,
        columns: guessColumns(s.headers),
        notes: 'Mapped by heuristics (AI unavailable)',
        previewHeaders: s.headers,
        previewRows: (rawData[s.name] || []).slice(0, 5),
        totalRows: s.totalRows,
      }))
    }

    step.value = 'preview'
  } catch (err) {
    error.value = err.message || t('errorGeneric')
    step.value = 'upload'
  }
}

// --- Fallback heuristic mapping (when AI is unavailable) ---
function guessModule(name, headers) {
  const n = name.toLowerCase()
  const h = headers.map(x => x.toLowerCase())
  if (['portefeuille', 'portfolio', 'client', 'account', 'compte'].some(k => n.includes(k))) return 'portfolio'
  if (['csm', 'équipe', 'equipe', 'team', 'profil'].some(k => n.includes(k))) return 'team'
  if (['kpi', 'dashboard', 'synthese', 'summary'].some(k => n.includes(k))) return 'kpis'
  if (['task', 'tâche', 'todo', 'action'].some(k => n.includes(k))) return 'tasks'
  if (['roadmap', 'plan', 'jalon', 'milestone'].some(k => n.includes(k))) return 'roadmap'
  if (h.some(x => x.includes('client') || x.includes('arr') || x.includes('ca '))) return 'portfolio'
  if (h.some(x => x === 'csm' && h.some(y => y.includes('churn')))) return 'team'
  return 'skip'
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

function parseNum(v) {
  if (typeof v === 'number') return v
  if (!v) return 0
  return parseFloat(String(v).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
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
