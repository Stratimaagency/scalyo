<template>
  <div class="import-view">

    <!-- Header -->
    <div class="imp-header">
      <h1>🤖 {{ t('imp_title') }}</h1>
      <p class="imp-sub">{{ t('imp_subtitle') }}</p>
    </div>

    <!-- Steps -->
    <div class="imp-steps">
      <template v-for="(stepKey, i) in ['imp_step1','imp_step2','imp_step3','imp_step4']" :key="i">
        <div class="imp-step" :class="{ active: currentStep === i, done: currentStep > i }">
          <div class="step-dot">
            <span v-if="currentStep > i">✓</span>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="step-label">{{ t(stepKey) }}</span>
        </div>
        <div v-if="i < 3" class="step-line" :class="{ done: currentStep > i }" />
      </template>
    </div>

    <!-- STEP 0 : Zone de dépôt -->
    <div v-if="currentStep === 0"
         class="imp-dropzone"
         :class="{ dragover }"
         @dragover.prevent="dragover = true"
         @dragleave="dragover = false"
         @drop.prevent="onDrop"
         @click="$refs.fileInput.click()">
      <input ref="fileInput" type="file" hidden @change="onFileSelect"
             accept=".xlsx,.xls,.csv,.txt,.json" />
      <div class="dz-icon">
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="12" width="48" height="40" rx="6" stroke="var(--purple)" stroke-width="2" fill="#ede9fe"/>
          <path d="M32 24v16m-8-8h16" stroke="var(--purple)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="dz-main">{{ t('imp_drop') }}</p>
      <p class="dz-formats">{{ t('imp_formats') }}</p>
      <button class="btn-primary" @click.stop="$refs.fileInput.click()">{{ t('imp_choose') }}</button>
      <p v-if="errorMsg" class="imp-error-msg">⚠️ {{ errorMsg }}</p>
    </div>

    <!-- STEP 1 : Analyse en cours -->
    <div v-if="currentStep === 1" class="imp-analyzing">
      <div class="ai-orb">
        <div class="orb-ring r1" />
        <div class="orb-ring r2" />
        <div class="orb-core">🤖</div>
      </div>
      <p class="analyzing-title">{{ t('imp_analyzing') }}</p>
      <p class="analyzing-file">{{ selectedFile?.name }}</p>
      <div class="analyzing-dots"><span /><span /><span /></div>
    </div>

    <!-- STEP 2 : Prévisualisation -->
    <template v-if="currentStep === 2">

      <!-- Module reconnu -->
      <div v-if="analysisResult && analysisResult.module !== 'unknown'" class="imp-preview-wrap">

        <!-- Module détecté -->
        <div class="imp-module-card">
          <div class="imc-icon">{{ moduleIcons[analysisResult.module] || '📦' }}</div>
          <div class="imc-info">
            <span class="imc-label">{{ t('imp_detected_module') }}</span>
            <strong>{{ t('imp_module_' + analysisResult.module) }}</strong>
          </div>
          <div class="imc-confidence">
            <div class="conf-bar">
              <div class="conf-fill" :style="{ width: analysisResult.confidence + '%', background: confidenceColor }" />
            </div>
            <span class="conf-val">{{ analysisResult.confidence }}%</span>
          </div>
          <button class="btn-map" @click="showMapping = true">{{ t('imp_col_mapping') }} ↗</button>
        </div>

        <!-- Explication IA -->
        <div class="imp-ai-reason">
          <span class="ai-badge">🤖 IA</span>
          <p>{{ analysisResult.reason }}</p>
        </div>

        <!-- Prévisualisation des données valides -->
        <div class="imp-preview-section">
          <div class="preview-header">
            <h3>{{ t('imp_preview_title') }}</h3>
            <span class="badge-count">{{ allMappedRows.length }} {{ t('imp_rows') }}</span>
          </div>
          <div class="table-scroll">
            <table class="imp-table">
              <thead>
                <tr><th v-for="col in previewColumns" :key="col">{{ col }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in previewRows" :key="i">
                  <td v-for="col in previewColumns" :key="col">{{ row[col] ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="allMappedRows.length > 5" class="preview-more">
            {{ t('imp_more_rows', { n: allMappedRows.length - 5 }) }}
          </p>
        </div>

        <!-- Lignes rejetées à saisir manuellement -->
        <div v-if="rejectedRows.length > 0" class="imp-rejected">
          <div class="rej-header">
            <span>⚠️</span>
            <strong>{{ t('imp_rejected_count', { n: rejectedRows.length }) }}</strong>
          </div>
          <div class="rej-list">
            <div v-for="(row, i) in rejectedRows" :key="i" class="rej-row">
              <div class="rej-data">
                <span class="rej-num">{{ i + 1 }}</span>
                <span class="rej-content">
                  {{ Object.entries(row.raw || {}).filter(([k]) => k !== '_sheet').slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' · ') }}
                </span>
              </div>
              <span class="rej-reason">{{ row.reason }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="imp-actions">
          <button class="btn-outline" @click="reset">{{ t('cancel') }}</button>
          <button class="btn-primary btn-import" @click="importData" :disabled="importing">
            <span v-if="importing">⏳</span>
            <span v-else>✦ {{ t('imp_import_btn') }}</span>
          </button>
        </div>
      </div>

      <!-- Module non reconnu -->
      <div v-else-if="analysisResult" class="imp-unknown">
        <div class="unk-icon">🚫</div>
        <h3>{{ t('imp_error') }}</h3>
        <p class="unk-desc">{{ t('imp_error_desc') }}</p>
        <div class="unk-reason"><span>🤖</span> {{ analysisResult.reason }}</div>
        <div class="unk-modules">
          <p>{{ t('imp_compatible_modules') }}</p>
          <div class="unk-chips">
            <span>👥 {{ t('imp_module_clients') }}</span>
            <span>✅ {{ t('imp_module_tasks') }}</span>
            <span>🙋 {{ t('imp_module_team') }}</span>
            <span>📊 {{ t('imp_module_copil') }}</span>
          </div>
        </div>
        <button class="btn-primary" @click="reset">{{ t('imp_new_import') }}</button>
      </div>

    </template>

    <!-- STEP 3 : Succès -->
    <div v-if="currentStep === 3" class="imp-success">
      <div class="success-icon">✅</div>
      <h3>{{ t('imp_success') }}</h3>
      <p>{{ t('imp_success_desc', { n: importedCount, module: t('imp_module_' + (analysisResult?.module || 'clients')) }) }}</p>

      <!-- Lignes rejetées rappelées après import -->
      <div v-if="rejectedRows.length > 0" class="imp-rejected">
        <div class="rej-header">
          <span>⚠️</span>
          <strong>{{ t('imp_rejected_count', { n: rejectedRows.length }) }}</strong>
        </div>
        <div class="rej-list">
          <div v-for="(row, i) in rejectedRows" :key="i" class="rej-row">
            <div class="rej-data">
              <span class="rej-num">{{ i + 1 }}</span>
              <span class="rej-content">
                {{ Object.entries(row.raw || {}).filter(([k]) => k !== '_sheet').slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' · ') }}
              </span>
            </div>
            <span class="rej-reason">{{ row.reason }}</span>
          </div>
        </div>
      </div>

      <div class="success-actions">
        <button class="btn-outline" @click="reset">{{ t('imp_new_import') }}</button>
        <button class="btn-primary" @click="goToModule">{{ t('imp_go_to_module') }} →</button>
      </div>
    </div>

    <!-- Slide-over : mapping des colonnes -->
    <Transition name="so-slide">
      <div v-if="showMapping" class="so-overlay" @click.self="showMapping = false">
        <div class="so-panel">
          <div class="so-head">
            <h3>{{ t('imp_col_mapping') }}</h3>
            <button class="so-close" @click="showMapping = false">✕</button>
          </div>
          <div class="so-body">
            <p class="so-hint">{{ t('imp_mapping_hint') }}</p>
            <table class="mapping-table">
              <thead>
                <tr>
                  <th>{{ t('imp_col_source') }}</th>
                  <th>{{ t('imp_col_target') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(target, source) in analysisResult?.columnMapping" :key="source">
                  <td class="col-source">{{ source }}</td>
                  <td>
                    <span v-if="target" class="tag-mapped">{{ target }}</span>
                    <span v-else class="tag-ignored">{{ t('imp_col_ignored') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { useTeamStore } from '@/stores/team'
import { useKpiStore } from '@/stores/kpis'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const clientStore = useClientStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const kpiStore = useKpiStore()

// ─── State ─────────────────────────────────────────────────────────────────────
const dragover = ref(false)
const selectedFile = ref(null)
const currentStep = ref(0)
const analysisResult = ref(null)
const allMappedRows = ref([])
const rejectedRows = ref([])
const showMapping = ref(false)
const importing = ref(false)
const importedCount = ref(0)
const errorMsg = ref('')

const moduleIcons = { clients: '👥', tasks: '✅', team: '🙋', copil: '📊' }

// ─── Computed ──────────────────────────────────────────────────────────────────
const confidenceColor = computed(() => {
  const c = analysisResult.value?.confidence || 0
  if (c >= 80) return 'var(--green)'
  if (c >= 50) return '#f59e0b'
  return '#ef4444'
})

const previewColumns = computed(() => {
  if (!allMappedRows.value.length) return []
  return Object.keys(allMappedRows.value[0]).filter(k => k !== '_sheet').slice(0, 10)
})

const previewRows = computed(() => allMappedRows.value.slice(0, 5))

// ─── Handlers fichier ──────────────────────────────────────────────────────────
function onDrop(e) {
  dragover.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function onFileSelect(e) {
  const file = e.target?.files?.[0]
  if (file) processFile(file)
  e.target.value = ''
}

// ─── Parse : extraction universelle tous formats, tous onglets ─────────────────
async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: r => resolve({
          type: 'tabular',
          sheets: { Sheet1: { headers: r.meta.fields || [], rowCount: r.data.length, sample: r.data.slice(0, 10) } },
          data: r.data.slice(0, 500),
        }),
        error: reject,
      })
    })
  }

  if (['xlsx', 'xls'].includes(ext)) {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { cellDates: true, cellNF: false, cellText: false })
    const sheets = {}
    const allData = []

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName]
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false, blankrows: false })

      const cleanRows = rawRows
        .map(row => {
          const clean = {}
          for (const [k, v] of Object.entries(row)) {
            if (!k || k.startsWith('__EMPTY')) continue
            const str = String(v ?? '')
            if (str.startsWith('=') || str.includes('DUMMYFUNCTION') || str.includes('IFERROR(')) continue
            if (v === null || v === '') continue
            clean[String(k).trim()] = v
          }
          return clean
        })
        .filter(row => Object.keys(row).length >= 1)

      if (cleanRows.length > 0) {
        const allKeys = [...new Set(cleanRows.flatMap(r => Object.keys(r)))].slice(0, 30)
        sheets[sheetName] = { headers: allKeys, rowCount: cleanRows.length, sample: cleanRows.slice(0, 8) }
        cleanRows.slice(0, 60).forEach(row => allData.push({ _sheet: sheetName, ...row }))
      }
    }

    return { type: 'tabular', sheets, data: allData, sheetNames: wb.SheetNames }
  }

  if (ext === 'json') {
    const text = await file.text()
    try {
      const json = JSON.parse(text)
      const data = Array.isArray(json) ? json : [json]
      return {
        type: 'tabular',
        sheets: { JSON: { headers: Object.keys(data[0] || {}), rowCount: data.length, sample: data.slice(0, 10) } },
        data: data.slice(0, 500),
      }
    } catch {
      return { type: 'text', raw: text.slice(0, 8000), sheets: {} }
    }
  }

  const text = await file.text().catch(() => '')
  return { type: 'text', raw: text.slice(0, 8000), sheets: {} }
}

// ─── DeepSeek : analyse sémantique universelle, toutes langues ─────────────────
async function analyzeWithDeepSeek(parsed, fileName) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY

  let fileContext = `FILE: "${fileName}"\n`

  if (parsed.type === 'text') {
    fileContext += `FORMAT: plain text\nCONTENT:\n${parsed.raw}`
  } else {
    const sheetCount = Object.keys(parsed.sheets || {}).length
    fileContext += `FORMAT: tabular${sheetCount > 1 ? ` (${sheetCount} sheets)` : ''}\n\n`

    for (const [name, info] of Object.entries(parsed.sheets || {})) {
      fileContext += `--- SHEET: "${name}" (${info.rowCount} rows) ---\n`
      fileContext += `Headers: ${info.headers.join(' | ')}\n`
      info.sample.slice(0, 5).forEach((row, i) => {
        const line = Object.entries(row)
          .filter(([k, v]) => !k.startsWith('_') && v !== null && v !== '')
          .slice(0, 15)
          .map(([k, v]) => `${k}:${v}`)
          .join(' | ')
        fileContext += `  ${i + 1}. ${line}\n`
      })
      fileContext += '\n'
    }
    fileContext += `TOTAL ROWS: ${parsed.data?.length || 0}\n`
  }

  const systemPrompt = `You are a universal intelligent data analyst for Scalyo, a B2B SaaS Customer Success platform.
You understand ANY file in ANY language (Korean, Japanese, French, English, Arabic, Spanish, German, Chinese, etc.) and ANY structure.
Respond ONLY with valid JSON. No markdown. No text outside JSON.`

  const userPrompt = `Analyze this file and transform ALL data into Scalyo format.

${fileContext}

SCALYO MODULES — pick best semantic match:

1. "clients" — B2B client portfolio
   Signals: company names, revenue (ARR/MRR/CA/매출/売上), health scores, renewal dates, account managers, contacts, churn risk
   Required per row: name

2. "tasks" — Tasks, projects, milestones, planning, sprints, objectives
   Signals: work items, completion (done/완료/完了/bool TRUE=done), due dates, assignees, phases, progress %
   Required per row: title

3. "team" — Team members, HR data
   Signals: person names, emails, roles, workload, performance metrics
   Required per row: name

4. "copil" — KPI dashboard / steering committee report
   Signals: KPI names+values (NRR/MRR/ARR/churn/CSAT/NPS), periods, charts data, objectives vs actual
   Returns ONE structured document, not rows

STATUS mapping (any language): done|in_progress|blocked|todo (tasks) / healthy|watch|critical (clients)
PRIORITY mapping (any language/numeric): urgent_important|urgent|important|not_urgent
DATES: convert to YYYY-MM-DD when possible
NUMBERS: extract numeric value, remove currency/spaces/commas
BOOLEANS: TRUE/1/done/완료 → "done", FALSE/0/pending → "todo"
REJECT a row ONLY if its required field is missing or unreadable

CLIENTS row format: { "name":str, "industry":str, "arr":num, "mrr":num, "health":num(0-10), "nps":num(-100/100), "status":"healthy|watch|critical", "csm":str, "churnRisk":num(0-1), "renewalDate":"YYYY-MM-DD", "contactName":str, "contactEmail":str, "contactRole":str }

TASKS row format: { "title":str, "status":"todo|in_progress|blocked|done", "priority":"urgent_important|urgent|important|not_urgent", "dueDate":"YYYY-MM-DD", "description":str, "assignee":str }

TEAM row format: { "name":str, "email":str, "role":str, "wellbeingScore":num(0-100), "workload":num(0-100), "clientCount":num, "arrManaged":num }

COPIL format: { "title":str, "subtitle":str, "period":str, "clientName":str, "color":"#hex",
  "blocks": [{ "type":"kpi_grid|kpi_single|chart_bar|chart_line|chart_donut|text|table", "title":str, "data":<see below> }] }
Block data:
- kpi_grid: { "kpis":[{"label":str,"value":str,"unit":str,"trend":"up|down|stable","color":"#hex"}] }
- kpi_single: { "label":str,"value":str,"unit":str,"trend":"up|down|stable","previous":str,"color":"#hex" }
- chart_bar/line: { "labels":[str],"datasets":[{"label":str,"data":[num],"color":"#hex"}] }
- chart_donut: { "labels":[str],"data":[num],"colors":["#hex"] }
- text: { "content":str,"size":"normal|large|title" }
- table: { "headers":[str],"rows":[[str]] }

Return EXACTLY this JSON:
{
  "module": "clients|tasks|team|copil",
  "confidence": <0-100>,
  "reason": "<2-3 sentences in French>",
  "columnMapping": { "<exact source column>": "<scalyo field or null>" },
  "validRows": [ <max 500 fully transformed objects> ],
  "rejectedRows": [ { "raw": <original row>, "reason": "<French explanation>" } ],
  "copilData": <full copil document if module=copil, otherwise null>
}`

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.1,
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek ${res.status}`)
  const data = await res.json()
  let text = data.choices?.[0]?.message?.content || '{}'
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No valid JSON from DeepSeek')
  return JSON.parse(match[0])
}

// ─── Orchestrateur principal ───────────────────────────────────────────────────
async function processFile(file) {
  errorMsg.value = ''
  if (file.size > 10 * 1024 * 1024) { errorMsg.value = t('imp_file_too_large'); return }
  selectedFile.value = file
  currentStep.value = 1
  try {
    const parsed = await parseFile(file)
    const result = await analyzeWithDeepSeek(parsed, file.name)
    analysisResult.value = result
    allMappedRows.value = result.validRows || []
    rejectedRows.value = result.rejectedRows || []
    currentStep.value = 2
  } catch (err) {
    console.error('[ImportView]', err)
    errorMsg.value = t('imp_api_error')
    currentStep.value = 0
    selectedFile.value = null
  }
}

// ─── Import : insertion directe sans transformation côté code ──────────────────
async function importData() {
  importing.value = true
  let count = 0
  try {
    const module = analysisResult.value?.module
    const rows = allMappedRows.value

    if (module === 'clients') {
      rows.forEach(row => {
        clientStore.addClient({
          name: row.name || 'Client importé',
          industry: row.industry || 'Autre',
          arr: Number(row.arr) || 0,
          mrr: Number(row.mrr) || Math.round((Number(row.arr) || 0) / 12),
          health: Math.min(10, Math.max(0, Number(row.health) || 7)),
          nps: Math.min(100, Math.max(-100, Number(row.nps) || 0)),
          status: row.status || 'watch',
          csm: row.csm || '',
          csmId: null,
          logo: row.status === 'healthy' ? '🟢' : row.status === 'critical' ? '🔴' : '🟡',
          churnRisk: Math.min(1, Math.max(0, Number(row.churnRisk) || 0.1)),
          renewalDate: row.renewalDate || '',
          contacts: row.contactName
            ? [{ name: row.contactName, email: row.contactEmail || '', role: row.contactRole || '' }]
            : [],
        })
        count++
      })
    }

    else if (module === 'tasks') {
      rows.forEach(row => {
        taskStore.addTask({
          title: row.title || 'Tâche importée',
          status: row.status || 'todo',
          priority: row.priority || 'important',
          dueDate: row.dueDate || '',
          description: row.description || '',
          assignee: row.assignee || null,
          projectId: null,
          clientId: null,
        })
        count++
      })
    }

    else if (module === 'team') {
      rows.forEach(row => {
        teamStore.addMember({
          name: row.name || '',
          email: row.email || '',
          role: row.role || 'Member',
          wellbeingScore: Math.min(100, Math.max(0, Number(row.wellbeingScore) || 70)),
          workload: Math.min(100, Math.max(0, Number(row.workload) || 50)),
          clientCount: Number(row.clientCount) || 0,
          arrManaged: Number(row.arrManaged) || 0,
        })
        count++
      })
    }

    else if (module === 'copil') {
      const d = analysisResult.value.copilData
      if (d) {
        const copilId = kpiStore.createCopil({
          title: d.title || 'COPIL importé',
          subtitle: d.subtitle || '',
          period: d.period || '',
          clientName: d.clientName || '',
          color: d.color || '#7c3aed',
        })
        const copil = kpiStore.getCopil(copilId)
        if (copil && d.blocks?.length) {
          d.blocks.forEach(block => {
            copil.blocks.push({
              id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
              type: block.type || 'text',
              title: block.title || '',
              data: block.data || {},
              visible: true,
              width: 'full',
            })
          })
          kpiStore.updateCopil(copilId, {})
        }
        count = 1
      }
    }

    importedCount.value = count
    currentStep.value = 3
  } catch (err) {
    console.error('[ImportView] importData', err)
    errorMsg.value = t('imp_api_error')
  } finally {
    importing.value = false
  }
}

// ─── Navigation vers le module importé ────────────────────────────────────────
function goToModule() {
  const routes = { clients: '/app/portfolio', tasks: '/app/tasks/kanban', team: '/app/workload', copil: '/app/kpis' }
  const route = routes[analysisResult.value?.module]
  if (route) router.push(route)
}

// ─── Reset complet ─────────────────────────────────────────────────────────────
function reset() {
  currentStep.value = 0
  selectedFile.value = null
  analysisResult.value = null
  allMappedRows.value = []
  rejectedRows.value = []
  showMapping.value = false
  importing.value = false
  importedCount.value = 0
  errorMsg.value = ''
}
</script>

<style scoped>
/* ─── Layout ──────────────────────────────────────────────────────────────────── */
.import-view { max-width: 760px; margin: 0 auto; padding: 0 0 60px; }

/* ─── Header ──────────────────────────────────────────────────────────────────── */
.imp-header { text-align: center; margin-bottom: 36px; }
.imp-header h1 { font-size: 1.6rem; font-weight: 800; }
.imp-sub { font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; }

/* ─── Steps ───────────────────────────────────────────────────────────────────── */
.imp-steps { display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }
.imp-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.step-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-secondary, #f3f4f6); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); transition: all 0.3s; }
.imp-step.active .step-dot { background: var(--purple); border-color: var(--purple); color: #fff; }
.imp-step.done .step-dot { background: var(--green); border-color: var(--green); color: #fff; }
.step-label { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; }
.imp-step.active .step-label { color: var(--purple); font-weight: 600; }
.imp-step.done .step-label { color: var(--green); }
.step-line { flex: 1; height: 2px; background: var(--border); width: 60px; margin: 0 6px 18px; transition: background 0.3s; }
.step-line.done { background: var(--green); }

/* ─── Drop zone ───────────────────────────────────────────────────────────────── */
.imp-dropzone { background: #fff; border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 64px 40px; text-align: center; cursor: pointer; transition: all 0.25s; }
.imp-dropzone:hover, .imp-dropzone.dragover { border-color: var(--purple); background: #f5f3ff; }
.dz-icon { margin-bottom: 20px; }
.dz-main { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
.dz-formats { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto; }
.imp-error-msg { margin-top: 16px; font-size: 0.82rem; color: #ef4444; }

/* ─── Boutons ─────────────────────────────────────────────────────────────────── */
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 12px 28px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-outline { background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }
.btn-map { background: none; border: 1px solid var(--purple); color: var(--purple); padding: 8px 14px; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.btn-map:hover { background: var(--purple); color: #fff; }
.btn-import { padding: 12px 28px; font-size: 0.95rem; }

/* ─── Animation analyse ───────────────────────────────────────────────────────── */
.imp-analyzing { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 16px; }
.ai-orb { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.orb-ring { position: absolute; border-radius: 50%; border: 2px solid var(--purple); opacity: 0.4; animation: pulse-ring 2s ease-out infinite; }
.r1 { width: 80px; height: 80px; }
.r2 { width: 60px; height: 60px; animation-delay: 0.5s; }
@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.3); opacity: 0; } }
.orb-core { font-size: 2rem; z-index: 1; }
.analyzing-title { font-size: 1.1rem; font-weight: 700; color: var(--purple); }
.analyzing-file { font-size: 0.82rem; color: var(--text-muted); }
.analyzing-dots { display: flex; gap: 6px; }
.analyzing-dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--purple); animation: dot-bounce 1.2s infinite; }
.analyzing-dots span:nth-child(2) { animation-delay: 0.2s; }
.analyzing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

/* ─── Prévisualisation ────────────────────────────────────────────────────────── */
.imp-preview-wrap { display: flex; flex-direction: column; gap: 16px; }
.imp-module-card { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; }
.imc-icon { font-size: 2rem; flex-shrink: 0; }
.imc-info { flex: 1; }
.imc-label { font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 2px; }
.imc-info strong { font-size: 1rem; font-weight: 700; }
.imc-confidence { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 80px; }
.conf-bar { width: 80px; height: 6px; background: var(--bg-secondary, #f3f4f6); border-radius: 3px; overflow: hidden; }
.conf-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.conf-val { font-size: 0.8rem; font-weight: 700; }
.imp-ai-reason { display: flex; align-items: flex-start; gap: 10px; background: #f5f3ff; border-left: 3px solid var(--purple); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 14px 16px; }
.ai-badge { background: var(--purple); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.imp-ai-reason p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
.imp-preview-section { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.preview-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.preview-header h3 { font-size: 0.9rem; font-weight: 700; margin: 0; }
.badge-count { background: #ede9fe; color: var(--purple); font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.table-scroll { overflow-x: auto; }
.imp-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.imp-table th { background: var(--bg-secondary, #f9fafb); padding: 10px 14px; text-align: left; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); white-space: nowrap; }
.imp-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.imp-table tr:last-child td { border-bottom: none; }
.imp-table tr:hover td { background: var(--bg-secondary, #f9fafb); }
.preview-more { padding: 10px 20px; font-size: 0.78rem; color: var(--text-muted); text-align: center; border-top: 1px solid var(--border); margin: 0; }
.imp-actions { display: flex; justify-content: flex-end; gap: 12px; }

/* ─── Lignes rejetées ─────────────────────────────────────────────────────────── */
.imp-rejected { background: #fffbeb; border: 1px solid #f59e0b; border-radius: var(--radius-md); padding: 16px 20px; }
.rej-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.88rem; }
.rej-list { display: flex; flex-direction: column; gap: 8px; }
.rej-row { background: #fff; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 10px 14px; }
.rej-data { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
.rej-num { background: #f59e0b; color: #fff; font-size: 0.7rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rej-content { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
.rej-reason { font-size: 0.75rem; color: #92400e; background: #fef3c7; padding: 2px 8px; border-radius: 4px; display: inline-block; }

/* ─── Module non reconnu ──────────────────────────────────────────────────────── */
.imp-unknown { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 60px 40px; text-align: center; }
.unk-icon { font-size: 3rem; margin-bottom: 16px; }
.imp-unknown h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
.unk-desc { color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px; }
.unk-reason { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 0.84rem; color: #92400e; text-align: left; margin-bottom: 24px; display: flex; gap: 8px; }
.unk-modules { margin-bottom: 24px; }
.unk-modules p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px; }
.unk-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.unk-chips span { background: var(--bg-secondary, #f3f4f6); padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }

/* ─── Succès ──────────────────────────────────────────────────────────────────── */
.imp-success { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 48px 40px; text-align: center; display: flex; flex-direction: column; gap: 16px; }
.success-icon { font-size: 3.5rem; animation: pop 0.4s ease; }
@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
.imp-success h3 { font-size: 1.3rem; font-weight: 800; color: var(--green); }
.imp-success > p { color: var(--text-muted); font-size: 0.9rem; }
.success-actions { display: flex; justify-content: center; gap: 12px; }

/* ─── Slide-over mapping ──────────────────────────────────────────────────────── */
.so-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; justify-content: flex-end; }
.so-panel { width: 420px; max-width: 95vw; background: #fff; height: 100%; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.12); }
.so-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.so-head h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.so-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-muted); padding: 4px 8px; border-radius: 4px; }
.so-close:hover { background: var(--bg-secondary); }
.so-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
.so-hint { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; }
.mapping-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.mapping-table th { text-align: left; padding: 8px 12px; background: var(--bg-secondary, #f9fafb); font-size: 0.75rem; color: var(--text-muted); font-weight: 600; border-bottom: 1px solid var(--border); }
.mapping-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
.col-source { font-family: monospace; color: var(--text-secondary); font-size: 0.8rem; }
.tag-mapped { background: #dcfce7; color: #15803d; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.tag-ignored { background: var(--bg-secondary, #f3f4f6); color: var(--text-muted); padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; }

/* ─── Transitions slide-over ──────────────────────────────────────────────────── */
.so-slide-enter-active, .so-slide-leave-active { transition: opacity 0.25s ease; }
.so-slide-enter-active .so-panel, .so-slide-leave-active .so-panel { transition: transform 0.3s ease; }
.so-slide-enter-from, .so-slide-leave-to { opacity: 0; }
.so-slide-enter-from .so-panel, .so-slide-leave-to .so-panel { transform: translateX(100%); }
</style>
