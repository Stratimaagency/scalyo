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

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const clientStore = useClientStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const kpiStore = useKpiStore()
const ai = useAI('import')

// --- State ---
const currentStep = ref(0)
const selectedFile = ref(null)
const analysisResult = ref(null)
const allMappedRows = ref([])
const rejectedRows = ref([])
const showMapping = ref(false)
const importing = ref(false)
const selectedProjectId = ref('new')
const importedCount = ref(0)
const errorMsg = ref('')
const pendingFile = ref(null)
const showModulePicker = ref(false)
const manualModule = ref(null)

// --- File selection ---
function onFileSelected(file) {
  errorMsg.value = ''
  if (file.size > 10 * 1024 * 1024) {
    errorMsg.value = t('imp_file_too_large')
    return
  }
  pendingFile.value = file
  showModulePicker.value = true
}

function confirmModule(module) {
  manualModule.value = module
  showModulePicker.value = false
  processFile(pendingFile.value, module)
}

function cancelModulePicker() {
  showModulePicker.value = false
  pendingFile.value = null
  errorMsg.value = ''
}
  // --- IA : analyse structure + mapping client-side ---
  async function analyzeWithAI(parsed, fileName, forcedModule = null) {
    // Envoyer le contenu brut a l'IA — elle fait TOUT le travail
    let content = parsed.raw || ''
    if (content.length > 8000) content = content.substring(0, 8000)
    
    const prompt = 'FILE: ' + fileName + '\nCONTENT:\n' + content
    const aiReply = await ai.ask(prompt)
    
    // Parser la reponse JSON de l'IA
    let result
    try {
      const jsonStr = aiReply.replace(/```json?/g, '').replace(/```/g, '').trim()
      result = JSON.parse(jsonStr)
    } catch (e) {
      console.error('[Import] AI response not valid JSON:', aiReply)
      result = { module: 'clients', confidence: 0, explanation: aiReply, rows: [], mapping: {}, sourceColumns: [] }
    }
    
    if (forcedModule) result.module = forcedModule
    
    const validRows = (result.rows || []).map((row, i) => ({ _index: i, ...row }))
    
    return {
      module: result.module || 'clients',
      confidence: result.confidence || 0,
      explanation: result.explanation || '',
      mapping: result.mapping || {},
      sourceColumns: result.sourceColumns || [],
      validRows,
      rejectedRows: [],
      rawAiResponse: result
    }
  }

  function applyColumnMapping(rows, mapping, mod) {
    // Legacy — l'IA fait le mapping directement maintenant
    return rows || []
  }

  // --- Import : insertion dans les stores ---
async function importData() {
  importing.value = true
  let count = 0
  try {
    const module = analysisResult.value?.module
    const rows = allMappedRows.value

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
        const newId = 'p' + Date.now()
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
      const d = analysisResult.value.copilData
      if (d) {
        const copilId = kpiStore.createCopil({ title: d.title || 'COPIL importé', subtitle: d.subtitle || '', period: d.period || '', clientName: d.clientName || '', color: d.color || '#7c3aed' })
        const copil = kpiStore.getCopil(copilId)
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
function goToModule() {
  const routes = { clients: '/app/portfolio', tasks: '/app/tasks/kanban', team: '/app/workload', copil: '/app/kpis' }
  const route = routes[analysisResult.value?.module]
  if (route) router.push(route)
}

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
  selectedProjectId.value = 'new'
  pendingFile.value = null
  showModulePicker.value = false
  manualModule.value = null
}
</script>

<style src="@/assets/import.css"></style>
