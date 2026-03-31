<template>
  <div class="sm-import">
    <!-- Steps indicator -->
    <div class="sm-import__steps">
      <div v-for="(s, i) in steps" :key="i" class="sm-import__step"
        :class="{ 'sm-import__step--active': step === i, 'sm-import__step--done': step > i }">
        <span class="sm-import__step-num">{{ step > i ? '✓' : i + 1 }}</span>
        <span class="sm-import__step-label">{{ s }}</span>
      </div>
    </div>

    <!-- Step 0: Source + Upload -->
    <div v-if="step === 0" class="sm-import__upload">
      <div class="sm-import__sources">
        <button v-for="src in sources" :key="src.key" class="sm-import__source-btn"
          :class="{ 'sm-import__source-btn--active': source === src.key }"
          @click="source = src.key">
          {{ src.emoji }} {{ src.label }}
        </button>
      </div>

      <div class="sm-import__dropzone" @dragover.prevent="dragOver = true" @dragleave="dragOver = false"
        @drop.prevent="onDrop" :class="{ 'sm-import__dropzone--hover': dragOver }">
        <div class="sm-import__dropzone-inner">
          <span class="sm-import__dropzone-icon">📄</span>
          <p>Glissez-déposez votre fichier CSV / Excel ici</p>
          <p class="sm-import__dropzone-or">ou</p>
          <label class="sm-import__browse-btn">
            Parcourir
            <input type="file" accept=".csv,.xlsx,.xls,.json" @change="onFileSelect" hidden />
          </label>
        </div>
      </div>
      <p v-if="fileName" class="sm-import__file-name">📎 {{ fileName }}</p>
    </div>

    <!-- Step 1: Mapping -->
    <div v-if="step === 1" class="sm-import__mapping">
      <h4 class="sm-import__mapping-title">Correspondance des colonnes</h4>
      <p class="sm-import__mapping-hint">{{ parsedRows.length }} lignes détectées</p>
      <div class="sm-import__mapping-grid">
        <div v-for="col in detectedColumns" :key="col" class="sm-import__mapping-row">
          <span class="sm-import__mapping-col">{{ col }}</span>
          <select v-model="mapping[col]" class="sm-import__mapping-select">
            <option value="">— Ignorer —</option>
            <option value="name">Nom de la tâche</option>
            <option value="group_name">Groupe</option>
            <option value="status">Statut</option>
            <option value="priority">Priorité</option>
            <option value="dur_estimated">Durée estimée (h)</option>
            <option value="assigned_to">Assigné à</option>
            <option value="subtasks">Sous-tâches</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Step 2: Preview + Confirm -->
    <div v-if="step === 2" class="sm-import__preview">
      <h4 class="sm-import__preview-title">Aperçu ({{ mappedTasks.length }} tâches)</h4>
      <div class="sm-import__preview-table">
        <div class="sm-import__preview-header">
          <span>Nom</span><span>Groupe</span><span>Statut</span><span>Durée</span>
        </div>
        <div v-for="(t, i) in mappedTasks.slice(0, 20)" :key="i" class="sm-import__preview-row">
          <span>{{ t.name }}</span>
          <span>{{ t.group_name || '—' }}</span>
          <span>{{ t.status }}</span>
          <span>{{ t.dur_estimated || '—' }}h</span>
        </div>
        <div v-if="mappedTasks.length > 20" class="sm-import__preview-more">
          … et {{ mappedTasks.length - 20 }} autres
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="sm-import__nav">
      <button v-if="step > 0" class="sm-import__nav-btn sm-import__nav-btn--back" @click="step--">Retour</button>
      <button v-if="step < 2 && canNext" class="sm-import__nav-btn sm-import__nav-btn--next" @click="step++">Suivant</button>
      <button v-if="step === 2" class="sm-import__nav-btn sm-import__nav-btn--confirm" @click="confirmImport" :disabled="importing">
        {{ importing ? 'Import en cours…' : 'Confirmer l\'import' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const emit = defineEmits(['import'])

const steps = ['Source & fichier', 'Mapping colonnes', 'Aperçu & confirmation']
const step = ref(0)
const source = ref('csv')
const dragOver = ref(false)
const fileName = ref('')
const parsedRows = ref([])
const detectedColumns = ref([])
const mapping = reactive({})
const importing = ref(false)

const sources = [
  { key: 'csv', emoji: '📊', label: 'Excel / CSV' },
  { key: 'notion', emoji: '📝', label: 'Notion' },
  { key: 'asana', emoji: '🔶', label: 'Asana' },
  { key: 'trello', emoji: '📋', label: 'Trello' },
  { key: 'other', emoji: '📁', label: 'Autre' },
]

const canNext = computed(() => {
  if (step.value === 0) return parsedRows.value.length > 0
  if (step.value === 1) return Object.values(mapping).some(v => v === 'name')
  return true
})

const mappedTasks = computed(() => {
  const nameCol = Object.entries(mapping).find(([, v]) => v === 'name')?.[0]
  if (!nameCol) return []
  return parsedRows.value.map(row => {
    const task = { name: row[nameCol] || 'Sans nom', status: 'todo' }
    for (const [col, field] of Object.entries(mapping)) {
      if (field && field !== 'name' && row[col] !== undefined) {
        task[field] = row[col]
      }
    }
    return task
  }).filter(t => t.name && t.name !== 'Sans nom')
})

function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) parseFile(file)
}

function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) parseFile(file)
}

async function parseFile(file) {
  fileName.value = file.name

  if (file.name.endsWith('.json')) {
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (Array.isArray(data) && data.length) {
        parsedRows.value = data
        detectedColumns.value = Object.keys(data[0])
        for (const col of detectedColumns.value) mapping[col] = ''
      }
    } catch { /* ignore */ }
    return
  }

  // CSV parsing (simple)
  const text = await file.text()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return

  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, '').trim())
  detectedColumns.value = headers
  for (const col of headers) mapping[col] = ''

  // Auto-map obvious columns
  for (const col of headers) {
    const lc = col.toLowerCase()
    if (lc.includes('nom') || lc.includes('name') || lc.includes('titre') || lc.includes('title')) mapping[col] = 'name'
    else if (lc.includes('group') || lc.includes('phase') || lc.includes('categ')) mapping[col] = 'group_name'
    else if (lc.includes('statu') || lc.includes('état')) mapping[col] = 'status'
    else if (lc.includes('durée') || lc.includes('duration') || lc.includes('estimé')) mapping[col] = 'dur_estimated'
    else if (lc.includes('priorit')) mapping[col] = 'priority'
  }

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(sep).map(v => v.replace(/^"|"$/g, '').trim())
    const row = {}
    headers.forEach((h, j) => { row[h] = vals[j] || '' })
    rows.push(row)
  }
  parsedRows.value = rows
}

async function confirmImport() {
  importing.value = true
  try {
    emit('import', mappedTasks.value)
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.sm-import { font-family: 'DM Sans', sans-serif; max-width: 720px; }
.sm-import__steps { display: flex; gap: 4px; margin-bottom: 24px; }
.sm-import__step {
  flex: 1; display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: var(--sm-white); border: 1px solid var(--sm-bd);
  border-radius: 10px; font-size: 13px; color: var(--sm-t3);
}
.sm-import__step--active { border-color: var(--sm-terra); color: var(--sm-t1); background: rgba(244,63,94,.04); }
.sm-import__step--done { color: var(--sm-ok); }
.sm-import__step-num {
  width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  background: var(--sm-bd); color: var(--sm-t3);
}
.sm-import__step--active .sm-import__step-num { background: var(--sm-terra); color: white; }
.sm-import__step--done .sm-import__step-num { background: var(--sm-ok); color: white; }
.sm-import__step-label { font-weight: 500; }

/* Sources */
.sm-import__sources { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.sm-import__source-btn {
  border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 10px;
  padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: var(--sm-t2);
}
.sm-import__source-btn--active { border-color: var(--sm-terra); background: rgba(244,63,94,.04); color: var(--sm-terra); }

/* Dropzone */
.sm-import__dropzone {
  border: 2px dashed var(--sm-bd); border-radius: var(--sm-r);
  padding: 40px 20px; text-align: center; transition: all .2s;
}
.sm-import__dropzone--hover { border-color: var(--sm-terra); background: rgba(244,63,94,.04); }
.sm-import__dropzone-icon { font-size: 36px; display: block; margin-bottom: 8px; }
.sm-import__dropzone p { color: var(--sm-t2); font-size: 14px; margin: 4px 0; }
.sm-import__dropzone-or { font-size: 12px; color: var(--sm-t3); }
.sm-import__browse-btn {
  display: inline-block; margin-top: 8px; padding: 8px 20px; border-radius: 8px;
  background: var(--sm-grad); color: white; font-weight: 500; font-size: 13px;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
}
.sm-import__file-name { font-size: 13px; color: var(--sm-t2); margin-top: 10px; }

/* Mapping */
.sm-import__mapping-title { font-weight: 600; font-size: 15px; color: var(--sm-t1); margin: 0 0 4px; }
.sm-import__mapping-hint { font-size: 12px; color: var(--sm-t3); margin-bottom: 14px; }
.sm-import__mapping-grid { display: flex; flex-direction: column; gap: 8px; }
.sm-import__mapping-row { display: flex; align-items: center; gap: 12px; }
.sm-import__mapping-col { min-width: 140px; font-size: 13px; font-weight: 500; color: var(--sm-t1); }
.sm-import__mapping-select {
  flex: 1; border: 1px solid var(--sm-bd); border-radius: 8px; padding: 6px 10px;
  font-size: 13px; font-family: 'DM Sans', sans-serif; color: var(--sm-t1);
  background: var(--sm-white); outline: none;
}
.sm-import__mapping-select:focus { border-color: var(--sm-terra); }

/* Preview */
.sm-import__preview-title { font-weight: 600; font-size: 15px; color: var(--sm-t1); margin: 0 0 12px; }
.sm-import__preview-table {
  border: 1px solid var(--sm-bd); border-radius: var(--sm-r); overflow: hidden;
}
.sm-import__preview-header {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px;
  padding: 8px 12px; background: var(--sm-bg); font-size: 12px; font-weight: 600; color: var(--sm-t2);
}
.sm-import__preview-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px;
  padding: 6px 12px; font-size: 13px; color: var(--sm-t1); border-top: 1px solid var(--sm-bd);
}
.sm-import__preview-more { text-align: center; padding: 10px; font-size: 12px; color: var(--sm-t3); border-top: 1px solid var(--sm-bd); }

/* Nav */
.sm-import__nav { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
.sm-import__nav-btn {
  border: 1px solid var(--sm-bd); border-radius: 8px; padding: 8px 20px;
  font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif;
}
.sm-import__nav-btn--back { background: var(--sm-white); color: var(--sm-t2); }
.sm-import__nav-btn--next { background: var(--sm-white); color: var(--sm-terra); border-color: var(--sm-terra); }
.sm-import__nav-btn--confirm { background: var(--sm-grad); color: white; border: none; }
.sm-import__nav-btn:disabled { opacity: .5; cursor: default; }
</style>
