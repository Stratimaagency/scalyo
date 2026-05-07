<template>
  <div class="import-view">
    <div class="imp-header">
      <h1>🤖 {{ t('imp_title') }}</h1>
      <p class="imp-sub">{{ t('imp_subtitle') }}</p>
    </div>

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

    <ImportDropZone
      :current-step="currentStep"
      :error-msg="errorMsg"
      :file-name="selectedFile ? selectedFile.name : ''"
      @file-selected="onFileSelected"
    />

    <ImportPreview
      :current-step="currentStep"
      :analysis-result="analysisResult"
      :all-mapped-rows="allMappedRows"
      :rejected-rows="rejectedRows"
      :importing="importing"
      :projects="taskStore.projects"
      :selected-project-id="selectedProjectId"
      @update:selected-project-id="selectedProjectId = $event"
      @import="importData"
      @reset="reset"
      @show-mapping="showMapping = true"
    />

    <ImportSuccess
      :current-step="currentStep"
      :imported-count="importedCount"
      :module-name="analysisResult ? analysisResult.module : null"
      :rejected-rows="rejectedRows"
      @reset="reset"
      @go-to-module="goToModule"
    />

    <ImportModulePicker
      :show="showModulePicker"
      :file-name="pendingFile ? pendingFile.name : ''"
      @confirm="confirmModule"
      @cancel="cancelModulePicker"
    />

    <ImportMappingPanel
      :show="showMapping"
      :column-mapping="analysisResult ? analysisResult.columnMapping || {} : {}"
      @close="showMapping = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { parseImportFile } from '@/utils/parseImportFile'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { useTeamStore } from '@/stores/team'
import { useKpiStore } from '@/stores/kpis'
import { useAI } from '@/composables/useAI'
import ImportDropZone from '@/components/import/ImportDropZone.vue'
import ImportPreview from '@/components/import/ImportPreview.vue'
import ImportSuccess from '@/components/import/ImportSuccess.vue'
import ImportModulePicker from '@/components/import/ImportModulePicker.vue'
import ImportMappingPanel from '@/components/import/ImportMappingPanel.vue'

var _t = useI18n({ useScope: 'global' })
var t = _t.t
var router = useRouter()
var clientStore = useClientStore()
var taskStore = useTaskStore()
var teamStore = useTeamStore()
var kpiStore = useKpiStore()
var ai = useAI('import')

var currentStep = ref(0)
var selectedFile = ref(null)
var analysisResult = ref(null)
var allMappedRows = ref([])
var rejectedRows = ref([])
var showMapping = ref(false)
var importing = ref(false)
var selectedProjectId = ref('new')
var importedCount = ref(0)
var errorMsg = ref('')
var pendingFile = ref(null)
var showModulePicker = ref(false)
var manualModule = ref(null)

var ALLOWED_EXT = ['csv', 'tsv', 'txt', 'xlsx', 'xls', 'xlsm', 'json']
var MAX_SIZE = 10 * 1024 * 1024

var processFile = async function (file, mod) {
  selectedFile.value = file
  currentStep.value = 1
  errorMsg.value = ''
  try {
    var parsed = await parseImportFile(file)
    if (parsed.rowCount === 0) {
      errorMsg.value = t('imp_empty_file')
      currentStep.value = 0
      selectedFile.value = null
      return
    }
    var result = await analyzeWithAI(parsed, file.name, mod)
    analysisResult.value = result
    allMappedRows.value = result.validRows || []
    rejectedRows.value = result.rejectedRows || []
    currentStep.value = 2
  } catch (err) {
    console.error('[ImportView] processFile:', err)
    errorMsg.value = t('imp_api_error')
    currentStep.value = 0
    selectedFile.value = null
  }
}

var onFileSelected = function (file) {
  errorMsg.value = ''
  var ext = file.name.split('.').pop().toLowerCase()
  if (ALLOWED_EXT.indexOf(ext) === -1) {
    errorMsg.value = t('imp_unsupported_format')
    return
  }
  if (file.size > MAX_SIZE) {
    errorMsg.value = t('imp_file_too_large')
    return
  }
  pendingFile.value = file
  showModulePicker.value = true
}

var confirmModule = function (mod) {
  manualModule.value = mod
  showModulePicker.value = false
  processFile(pendingFile.value, mod)
}

var cancelModulePicker = function () {
  showModulePicker.value = false
  pendingFile.value = null
  errorMsg.value = ''
}

var matchColumnsLocally = function (headers, mod) {
  var maps = {
    clients: { nom:'name', name:'name', entreprise:'company', company:'company', email:'email', mail:'email', arr:'arr', mrr:'mrr', sante:'health', health:'health', nps:'nps', statut:'status', status:'status', industrie:'industry', industry:'industry', region:'region', csm:'csm', risque:'churnRisk', churn:'churnRisk', renouvellement:'renewalDate', renewal:'renewalDate' },
    tasks: { titre:'title', title:'title', tache:'title', task:'title', description:'description', desc:'description', statut:'status', status:'status', priorite:'priority', priority:'priority', urgence:'urgency', urgency:'urgency', importance:'importance', difficulte:'difficulty', difficulty:'difficulty', debut:'startDate', start:'startDate', fin:'endDate', end:'endDate', echeance:'dueDate', due:'dueDate', deadline:'dueDate', assignee:'assignee', assigne:'assignee', heures:'expectedHours', hours:'expectedHours', tags:'tags', type:'taskType' },
    team: { nom:'name', name:'name', email:'email', role:'role', poste:'role', departement:'department', department:'department', telephone:'phone', phone:'phone', bienetre:'wellbeingScore', wellbeing:'wellbeingScore', charge:'workload', workload:'workload', clients:'clientCount', arr:'arrManaged' },
    copil: { client:'clientName', date:'date', score:'score', notes:'notes', actions:'actions', prochaines:'nextSteps', next:'nextSteps', titre:'title', title:'title', periode:'period', period:'period' }
  }
  var lookup = maps[mod] || maps.tasks
  var mapping = {}
  headers.forEach(function (h) {
    var key = h.toLowerCase().trim().replace(/[_\-\s]+/g, '')
    Object.keys(lookup).forEach(function (pattern) {
      if (key.indexOf(pattern) >= 0 || pattern.indexOf(key) >= 0) mapping[h] = lookup[pattern]
    })
  })
  return mapping
}

var analyzeWithAI = async function (parsed, fileName, forcedModule) {
  // Try AI with 15s timeout, fallback to local matching
  try {
    var timeoutPromise = new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error('AI_TIMEOUT')) }, 15000)
    })
    var aiPromise = callAIForMapping(parsed, fileName, forcedModule)
    return await Promise.race([aiPromise, timeoutPromise])
  } catch (err) {
    console.warn('[Import] AI failed/timeout, using local matching:', err.message)
    var localMapping = matchColumnsLocally(parsed.headers, forcedModule)
    var mapped = applyColumnMapping(parsed.rows, localMapping)
    return { module: forcedModule, confidence: 60, reason: t('imp_fallback_reason'), columnMapping: localMapping, validRows: mapped.valid, rejectedRows: mapped.rejected, defaults: { urgency: 3, importance: 3, difficulty: 3 } }
  }
}

var callAIForMapping = async function (parsed, fileName, forcedModule) {
  var ctx = 'FILE: ' + fileName + ' (' + parsed.rowCount + ' rows)\n'
  if (parsed.headers && parsed.headers.length > 0) {
    ctx += 'HEADERS: ' + parsed.headers.join(' | ') + '\n\nSAMPLE ROWS:\n'
    var sample = parsed.sample || []
    for (var i = 0; i < sample.length; i++) {
      var row = sample[i]
      var cells = []
      for (var j = 0; j < parsed.headers.length; j++) {
        var h = parsed.headers[j]
        var v = row[h]
        cells.push(h + ': ' + (v != null && v !== '' ? v : '-'))
      }
      ctx += (i + 1) + '. ' + cells.join(' | ') + '\n'
    }
  }
  if (forcedModule) {
    ctx += '\nUser selected module: ' + forcedModule + '. Use this module.'
  }
  var response = await ai.send(ctx, { type: 'import_analysis', fileName: fileName })
  var text = typeof response === 'string' ? response : (response && response.response ? response.response : JSON.stringify(response))
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  var jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI_NO_JSON')
  var aiResult = JSON.parse(jsonMatch[0])
  if (parsed.rows && parsed.rows.length > 0 && aiResult.columnMapping) {
    var mapped = applyColumnMapping(parsed.rows, aiResult.columnMapping)
    aiResult.validRows = mapped.valid
    aiResult.rejectedRows = mapped.rejected
  } else {
    aiResult.validRows = []
    aiResult.rejectedRows = []
  }
  return aiResult
}

var applyColumnMapping = function (rows, mapping) {
  var valid = []
  var rejected = []
  var lookup = {}
  var keys = Object.keys(mapping)
  for (var k = 0; k < keys.length; k++) {
    lookup[keys[k].toLowerCase().trim()] = mapping[keys[k]]
  }
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    var mapped = {}
    var count = 0
    var rk = Object.keys(row)
    for (var j = 0; j < rk.length; j++) {
      var target = lookup[rk[j].toLowerCase().trim()]
      var val = row[rk[j]]
      if (target && val != null && String(val).trim() !== '') {
        mapped[target] = val
        count++
      }
    }
    if (count > 0) valid.push(mapped)
  }
  return { valid: valid, rejected: rejected }
}

var importData = async function () {
  importing.value = true
  var count = 0
  try {
    var mod = analysisResult.value ? analysisResult.value.module : null
    var rows = allMappedRows.value
    var defaults = (analysisResult.value && analysisResult.value.defaults) || {}
    if (mod === 'clients') {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i]
        clientStore.addClient({ name: r.name || t('imp_default_client'), industry: r.industry || '', arr: Number(r.arr) || 0, mrr: Number(r.mrr) || Math.round((Number(r.arr) || 0) / 12), health: Math.min(10, Math.max(0, Number(r.health) || 7)), nps: Math.min(100, Math.max(-100, Number(r.nps) || 0)), status: r.status || 'watch', csm: r.csm || '', csmId: null, logo: '🟡', churnRisk: Math.min(1, Math.max(0, Number(r.churnRisk) || 0.1)), renewalDate: r.renewalDate || '', contacts: r.contactName ? [{ name: r.contactName, email: r.contactEmail || '', role: r.contactRole || '' }] : [] })
        count++
      }
    } else if (mod === 'tasks') {
      var projectId = selectedProjectId.value === '' ? null : selectedProjectId.value
      if (selectedProjectId.value === 'new') {
        var newId = 'p' + Date.now()
        taskStore.addProject({ id: newId, name: t('imp_import_project_name', { date: new Date().toLocaleDateString() }), color: '#7c3aed', status: 'active' })
        projectId = newId
      }
      for (var i2 = 0; i2 < rows.length; i2++) {
        var r2 = rows[i2]
        taskStore.addTask({ title: r2.title || t('imp_default_task'), description: r2.description || '', status: r2.status || defaults.status || 'todo', priority: r2.priority || defaults.priority || 'medium', urgency: Number(r2.urgency) || defaults.urgency || 3, importance: Number(r2.importance) || defaults.importance || 3, difficulty: Number(r2.difficulty) || defaults.difficulty || 3, dueDate: r2.dueDate || '', startDate: r2.startDate || '', endDate: r2.endDate || '', assignee: r2.assignee || null, expectedHours: Number(r2.expectedHours) || 0, tags: r2.tags || '', taskType: r2.taskType || '', projectId: projectId, clientId: null })
        count++
      }
    } else if (mod === 'team') {
      for (var i3 = 0; i3 < rows.length; i3++) {
        var r3 = rows[i3]
        teamStore.addMember({ name: r3.name || '', email: r3.email || '', role: r3.role || 'Member', wellbeingScore: Math.min(100, Math.max(0, Number(r3.wellbeingScore) || 70)), workload: Math.min(100, Math.max(0, Number(r3.workload) || 50)), clientCount: Number(r3.clientCount) || 0, arrManaged: Number(r3.arrManaged) || 0 })
        count++
      }
    } else if (mod === 'copil') {
      var d = analysisResult.value ? analysisResult.value.copilData : null
      if (d) { kpiStore.createCopil({ title: d.title || t('imp_default_copil'), subtitle: d.subtitle || '', period: d.period || '', clientName: d.clientName || '', color: d.color || '#7c3aed' }); count = 1 }
    }
    importedCount.value = count
    currentStep.value = 3
  } catch (err) {
    console.error('[ImportView] importData:', err)
    errorMsg.value = t('imp_api_error')
  } finally {
    importing.value = false
  }
}

var goToModule = function () {
  var routes = { clients: '/app/portfolio', tasks: '/app/tasks/kanban', team: '/app/workload', copil: '/app/kpis' }
  var route = routes[analysisResult.value ? analysisResult.value.module : '']
  if (route) router.push(route)
}

var reset = function () {
  currentStep.value = 0
  selectedFile.value = null
  analysisResult.value = null
  allMappedRows.value = []
  rejectedRows.value = []
  showMapping.value = false
  importing.value = false
  importedCount.value = 0
  errorMsg.value = ''
  selectedProjectId.value = 'new'
  pendingFile.value = null
  showModulePicker.value = false
  manualModule.value = null
}
</script>

<style src="@/assets/import.css"></style>
