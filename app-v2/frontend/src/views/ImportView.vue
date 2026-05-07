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

    <ImportDropZone
      :current-step="currentStep"
      :error-msg="errorMsg"
      :file-name="selectedFile?.name || ''"
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
      :module-name="analysisResult?.module"
      :rejected-rows="rejectedRows"
      @reset="reset"
      @go-to-module="goToModule"
    />

    <ImportModulePicker
      :show="showModulePicker"
      :file-name="pendingFile?.name || ''"
      @confirm="confirmModule"
      @cancel="cancelModulePicker"
    />

    <ImportMappingPanel

  // --- Traitement du fichier : parse + IA + mapping ---

      :show="showMapping"
      :column-mapping="analysisResult?.columnMapping || {}"
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

// --- State ---
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


  var processFile = async function(file, module) {
    selectedFile.value = file
    currentStep.value = 1
    errorMsg.value = ""
    try {
      var parsed = await parseImportFile(file)
      if (!parsed || (parsed.rowCount === 0 && !parsed.raw)) {
        errorMsg.value = t("imp_empty_file")
        currentStep.value = 0
        return
      }
      var result = await analyzeWithAI(parsed, file.name, module)
      analysisResult.value = result
      allMappedRows.value = result.validRows || []
      rejectedRows.value = result.rejectedRows || []
      currentStep.value = 2
    } catch (err) {
      console.error("[ImportView] processFile:", err)
      errorMsg.value = err.message?.includes("TIMEOUT") ? t("imp_timeout") : t("imp_api_error")
      currentStep.value = 0
      selectedFile.value = null
    }
  }


// --- File selection ---
var onFileSelected = function (file) {
  errorMsg.value = ''
  if (file.size > 10 * 1024 * 1024) {
    errorMsg.value = t('imp_file_too_large')
    return
  }
  pendingFile.value = file
  showModulePicker.value = true
}

var confirmModule = function (module) {
  manualModule.value = module
  showModulePicker.value = false
  processFile(pendingFile.value, module)
}

var cancelModulePicker = function () {
  showModulePicker.value = false
  pendingFile.value = null
  errorMsg.value = ''
}
  // --- IA : analyse structure + mapping client-side ---
  var analyzeWithAI = async function(parsed, fileName, forcedModule = null) {
    let fileContext = "FILE: " + fileName + " (" + parsed.rowCount + " rows)\n"
    if (parsed.type === "spreadsheet" && parsed.headers.length > 0) {
      fileContext += "HEADERS: " + parsed.headers.join(" | ") + "\nSAMPLE:\n"
      parsed.sample.forEach((row, i) => {
        var cells = parsed.headers.map(h => h + ": " + (row[h] != null && row[h] !== "" ? row[h] : "-")).join(" | ")
        fileContext += (i + 1) + ". " + cells + "\n"
      })
    } else if (parsed.raw) {
      fileContext += "TEXT:\n" + parsed.raw.substring(0, 2000)
    }
    if (forcedModule) fileContext += "\nUser selected module: " + forcedModule
    var response = await ai.send(fileContext, { type: "import_analysis", fileName })
    let text = typeof response === "string" ? response : (response?.response || JSON.stringify(response))
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    var jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("AI did not return valid JSON")
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
    var rMap = {}
    for (var [src, dst] of Object.entries(mapping)) rMap[src.toLowerCase().trim()] = dst
    for (var row of rows) {
      var mapped = {}
      let count = 0
      for (var [key, value] of Object.entries(row)) {
        var target = rMap[key.toLowerCase().trim()]
        if (target && value != null && String(value).trim() !== "") {
          mapped[target] = value
          count++
        }
      }
      if (count > 0) valid.push(mapped)
    }
    return { valid, rejected: [] }
  }

  // --- Import : insertion dans les stores ---
var importData = async function() {
  importing.value = true
  let count = 0
  try {
    var module = analysisResult.value?.module
    var rows = allMappedRows.value

    if (module === 'clients') {
      rows.forEach(row => {
        clientStore.addClient({
          name: row.name || 'Client importé', industry: row.industry || 'Autre',
          arr: Number(row.arr) || 0, mrr: Number(row.mrr) || Math.round((Number(row.arr) || 0) / 12),
          health: Math.min(10, Math.max(0, Number(row.health) || 7)),
          nps: Math.min(100, Math.max(-100, Number(row.nps) || 0)),
          status: row.status || 'watch', csm: row.csm || '', csmId: null,
          logo: row.status === 'healthy' ? '🟢' : row.status === 'critical' ? '🔴' : '🟡',
          churnRisk: Math.min(1, Math.max(0, Number(row.churnRisk) || 0.1)),
          renewalDate: row.renewalDate || '',
          contacts: row.contactName ? [{ name: row.contactName, email: row.contactEmail || '', role: row.contactRole || '' }] : [],
        })
        count++
      })
    } else if (module === 'tasks') {
      let projectId = selectedProjectId.value === '' ? null : selectedProjectId.value
      if (selectedProjectId.value === 'new') {
        var newId = 'p' + Date.now()
        taskStore.addProject({ id: newId, name: t('imp_import_project_name', { date: new Date().toLocaleDateString('fr-FR') }), color: '#7c3aed', status: 'active' })
        projectId = newId
      }
      rows.forEach(row => {
        taskStore.addTask({
          title: row.title || t('imp_default_task'), status: row.status || 'todo',
          priority: row.priority || 'important', dueDate: row.dueDate || '',
          description: row.description || '', assignee: row.assignee || null,
          projectId, clientId: null,
        })
        count++
      })
    } else if (module === 'team') {
      rows.forEach(row => {
        teamStore.addMember({
          name: row.name || '', email: row.email || '', role: row.role || 'Member',
          wellbeingScore: Math.min(100, Math.max(0, Number(row.wellbeingScore) || 70)),
          workload: Math.min(100, Math.max(0, Number(row.workload) || 50)),
          clientCount: Number(row.clientCount) || 0, arrManaged: Number(row.arrManaged) || 0,
        })
        count++
      })
    } else if (module === 'copil') {
      var d = analysisResult.value.copilData
      if (d) {
        var copilId = kpiStore.createCopil({ title: d.title || 'COPIL importé', subtitle: d.subtitle || '', period: d.period || '', clientName: d.clientName || '', color: d.color || '#7c3aed' })
        var copil = kpiStore.getCopil(copilId)
        if (copil && d.blocks?.length) {
          d.blocks.forEach(block => {
            copil.blocks.push({ id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), type: block.type || 'text', title: block.title || '', data: block.data || {}, visible: true, width: 'full' })
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

// --- Navigation + Reset ---
var goToModule = function () {
  var routes = { clients: '/app/portfolio', tasks: '/app/tasks/kanban', team: '/app/workload', copil: '/app/kpis' }
  var route = routes[analysisResult.value?.module]
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
