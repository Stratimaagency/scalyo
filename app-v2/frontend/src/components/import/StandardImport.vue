<template>
  <div class="std-import">
    <!-- STEP 1: Upload -->
    <div v-if="step === 'upload'" class="import-drop"
      :class="{ dragover }"
      @dragover.prevent="dragover = true"
      @dragleave="dragover = false"
      @drop.prevent="onDrop"
    >
      <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls,.xlsm,.json,.tsv,.txt" hidden @change="onFileSelect" />
      <div class="drop-inner" @click="fileInput?.click()">
        <span class="drop-icon">📁</span>
        <p class="drop-label">{{ t('import_drop_label') }}</p>
        <p class="drop-hint">CSV, XLSX, JSON</p>
      </div>
    </div>

    <!-- STEP 2: Mapping -->
    <div v-if="step === 'mapping'" class="import-mapping">
      <div class="mapping-header">
        <h3>{{ t('import_mapping_title') }}</h3>
        <span class="mapping-file">{{ parsed?.fileName }} — {{ parsed?.rowCount }} {{ t('import_rows') }}</span>
      </div>
      <div class="mapping-grid">
        <div v-for="field in fields" :key="field.key" class="mapping-row">
          <label class="mapping-label">
            {{ t(field.label) }}
            <span v-if="field.required" class="mapping-req">*</span>
          </label>
          <select v-model="mapping[field.key]" class="mapping-select">
            <option value="">— {{ t('import_skip') }} —</option>
            <option v-for="h in parsed?.headers" :key="h" :value="h">{{ h }}</option>
          </select>
        </div>
      </div>
      <p v-if="mappingError" class="mapping-error">{{ mappingError }}</p>
      <div class="mapping-actions">
        <button class="btn-secondary" @click="reset()">{{ t('import_cancel') }}</button>
        <button class="btn-primary" @click="goPreview()">{{ t('import_preview') }}</button>
      </div>
    </div>

    <!-- STEP 3: Preview -->
    <div v-if="step === 'preview'" class="import-preview">
      <div class="preview-header">
        <h3>{{ t('import_preview_title') }}</h3>
        <span>{{ previewRows.length }} / {{ mapped.length }} {{ t('import_rows') }}</span>
      </div>
      <div class="preview-table-wrap">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="field in mappedFields" :key="field.key">{{ t(field.label) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in previewRows" :key="i">
              <td v-for="field in mappedFields" :key="field.key">{{ row[field.key] ?? '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mapping-actions">
        <button class="btn-secondary" @click="step = 'mapping'">{{ t('import_back') }}</button>
        <button class="btn-primary" :disabled="importing" @click="doImport()">
          {{ importing ? t('import_importing') : t('import_confirm', { count: mapped.length }) }}
        </button>
      </div>
    </div>

    <!-- STEP 4: Done -->
    <div v-if="step === 'done'" class="import-done">
      <span class="done-icon">✅</span>
      <p>{{ t('import_done', { count: importedCount }) }}</p>
      <button class="btn-secondary" @click="reset()">{{ t('import_new') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseImportFile } from '@/utils/parseImportFile'

var props = defineProps({
  fields: { type: Array, required: true },
  onImport: { type: Function, required: true },
})

var { t } = useI18n({ useScope: 'global' })

var step = ref('upload')
var dragover = ref(false)
var fileInput = ref(null)
var parsed = ref(null)
var mapping = ref({})
var mapped = ref([])
var mappingError = ref('')
var importing = ref(false)
var importedCount = ref(0)

var onDrop = async function (e) {
  dragover.value = false
  var file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

var onFileSelect = async function (e) {
  var file = e.target?.files?.[0]
  if (file) processFile(file)
}

var processFile = async function (file) {
  try {
    parsed.value = await parseImportFile(file)
    autoMap()
    step.value = 'mapping'
  } catch (err) {
    mappingError.value = t('import_parse_error')
  }
}

var normalize = function (str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

var autoMap = function () {
  var m = {}
  var headers = parsed.value?.headers || []
  var nh = headers.map(function (h) { return { raw: h, norm: normalize(h) } })
  props.fields.forEach(function (field) {
    var targets = [normalize(field.key), ...(field.aliases || []).map(normalize)]
    var match = nh.find(function (h) {
      return targets.some(function (t) {
        if (h.norm === t) return true
        // Only use includes matching if target is 4+ chars and covers 60%+ of the longer string
        var minLen = Math.min(t.length, h.norm.length)
        var maxLen = Math.max(t.length, h.norm.length)
        if (minLen < 4 || minLen / maxLen < 0.6) return false
        return h.norm.includes(t) || t.includes(h.norm)
      })
    })
    m[field.key] = match ? match.raw : ''
  })
  mapping.value = m
}

var mappedFields = computed(function () {
  return props.fields.filter(function (f) { return mapping.value[f.key] })
})

var goPreview = function () {
  var required = props.fields.filter(function (f) { return f.required })
  var missing = required.filter(function (f) { return !mapping.value[f.key] })
  if (missing.length) {
    mappingError.value = t('import_required_fields') + ' ' + missing.map(function (f) { return t(f.label) }).join(', ')
    return
  }
  mappingError.value = ''
  mapped.value = buildMapped()
  step.value = 'preview'
}

var buildMapped = function () {
  var rows = parsed.value?.rows || []
  return rows.map(function (row) {
    var obj = {}
    props.fields.forEach(function (field) {
      var col = mapping.value[field.key]
      if (col && row[col] !== undefined && row[col] !== '') {
        obj[field.key] = castValue(row[col], field.type)
      }
    })
    return obj
  }).filter(function (obj) {
    return props.fields.filter(function (f) { return f.required }).every(function (f) { return obj[f.key] })
  })
}

var normalizeStatus = {
  'non commence': 'todo', 'not started': 'todo', 'a faire': 'todo', 'todo': 'todo',
  'backlog': 'todo', 'nouveau': 'todo', 'new': 'todo', 'open': 'todo',
  'en cours': 'in_progress', 'in progress': 'in_progress', 'doing': 'in_progress',
  'started': 'in_progress', 'wip': 'in_progress',
  'termine': 'done', 'done': 'done', 'finished': 'done', 'complete': 'done',
  'fini': 'done', 'clos': 'done', 'closed': 'done',
  'bloque': 'blocked', 'blocked': 'blocked', 'en attente': 'blocked',
  'on hold': 'blocked', 'pending': 'blocked',
  'healthy': 'healthy', 'sain': 'healthy', 'en forme': 'healthy', 'ok': 'healthy', 'green': 'healthy', 'vert': 'healthy',
  'watch': 'watch', 'at_risk': 'watch', 'at risk': 'watch', 'at-risk': 'watch', 'a risque': 'watch', 'vigilance': 'watch', 'a surveiller': 'watch', 'surveiller': 'watch',
  'critical': 'critical', 'critique': 'critical', 'alerte': 'critical', 'danger': 'critical', 'red': 'critical', 'rouge': 'critical',
}


var normalizePriority = {
  'urgent important': 'urgent_important', 'urgent + important': 'urgent_important',
  'do now': 'urgent_important', 'do first': 'urgent_important', 'critical': 'urgent_important',
  'important non urgent': 'important', 'important non-urgent': 'important', 'important not urgent': 'important',
  'schedule': 'important', 'planifier': 'important',
  'urgent non important': 'urgent', 'urgent non-important': 'urgent', 'urgent not important': 'urgent',
  'delegate': 'urgent', 'deleguer': 'urgent',
  'ni urgent ni important': 'not_urgent', 'not urgent': 'not_urgent', 'eliminate': 'not_urgent',
  'eliminer': 'not_urgent', 'low': 'not_urgent',
  'urgent_important': 'urgent_important', 'important': 'important', 'urgent': 'urgent', 'not_urgent': 'not_urgent',
}

var cleanText = function (s) {
  return String(s).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '').trim()
}

var parseDate = function (val) {
  var s = cleanText(val)
  var rel = s.match(/^[jJdD]\+(\d+)$/)
  if (rel) { var d = new Date(); d.setDate(d.getDate() + Number(rel[1])); return d.toISOString().slice(0, 10) }
  var parts = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (parts) { return parts[3] + '-' + parts[2].padStart(2, '0') + '-' + parts[1].padStart(2, '0') }
  var d = new Date(s)
  return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : ''
}

var castValue = function (val, type) {
  if (type === 'integer') { var n = Math.round(Number(val)); return isNaN(n) ? 0 : n }
  if (type === 'number') { var n = Number(val); return isNaN(n) ? 0 : n }
  if (type === 'status') {
    var key = cleanText(val).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    return normalizeStatus[key] || 'todo'
  }
  if (type === 'priority') {
    var key = cleanText(val).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    return normalizePriority[key] || 'important'
  }
  if (type === 'date') return parseDate(val)
  if (type === 'tags') {
    if (Array.isArray(val)) return val
    return String(val).split(/[,;|]/).map(function (s) { return s.trim() }).filter(Boolean)
  }
  return String(val).trim()
}

var previewRows = computed(function () { return mapped.value.slice(0, 5) })

var doImport = async function () {
  importing.value = true
  mappingError.value = ''
  try {
    var count = await props.onImport(mapped.value)
    if (count === null || count === undefined) count = mapped.value.length
    importedCount.value = count
    if (count > 0) {
      step.value = 'done'
    } else {
      mappingError.value = t('import_error')
      step.value = 'preview'
    }
  } catch (err) {
    console.error('[StandardImport] doImport error:', err)
    mappingError.value = t('import_error')
    step.value = 'preview'
  }
  importing.value = false
}

var reset = function () {
  step.value = 'upload'
  parsed.value = null
  mapping.value = {}
  mapped.value = []
  mappingError.value = ''
  importing.value = false
  importedCount.value = 0
}
</script>

<style scoped>
.std-import { max-width: 640px; margin: 0 auto; }
.import-drop { border: 2px dashed var(--border); border-radius: var(--radius-md); padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
.import-drop:hover, .import-drop.dragover { border-color: var(--purple); background: var(--purple-bg); }
.drop-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.drop-label { font-weight: 600; color: var(--text); margin: 0 0 4px; }
.drop-hint { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
.mapping-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.mapping-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.mapping-file { font-size: 0.8rem; color: var(--text-muted); }
.mapping-grid { display: flex; flex-direction: column; gap: 8px; }
.mapping-row { display: flex; align-items: center; gap: 12px; }
.mapping-label { width: 160px; font-size: 0.85rem; font-weight: 500; flex-shrink: 0; }
.mapping-req { color: var(--red); }
.mapping-select { flex: 1; padding: 7px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; background-color: var(--bg-card); }
.mapping-error { color: var(--red); font-size: 0.82rem; margin-top: 12px; }
.mapping-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-primary { padding: 8px 20px; border: none; border-radius: var(--radius-sm); background: var(--purple); color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: opacity 0.15s; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { padding: 8px 20px; border: 1px solid var(--border); border-radius: var(--radius-sm); background-color: var(--bg-card); color: var(--text); font-weight: 500; font-size: 0.85rem; cursor: pointer; transition: background 0.15s; }
.btn-secondary:hover { background: var(--bg-hover); }
.preview-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
.preview-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.preview-header span { font-size: 0.8rem; color: var(--text-muted); }
.preview-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); }
.preview-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.preview-table th { text-align: left; padding: 8px 10px; background: var(--bg-hover); font-weight: 600; white-space: nowrap; border-bottom: 1px solid var(--border); }
.preview-table td { padding: 6px 10px; border-bottom: 1px solid var(--border-light); }
.import-done { text-align: center; padding: 48px 24px; }
.done-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
.import-done p { font-size: 1rem; font-weight: 600; margin: 0 0 20px; }
</style>
