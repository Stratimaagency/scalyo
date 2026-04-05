<template>
  <div class="export-wrap" ref="wrapRef">
    <button @click="open = !open" class="btn btn-secondary" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 12px;">
      📥 Exporter
    </button>
    <div v-if="open" class="export-menu">
      <button @click="doExport('csv')" class="export-option" :disabled="exporting">
        📊 CSV (Excel)
        <span style="font-size: 10px; color: var(--muted);">Compatible Excel, Numbers</span>
      </button>
      <button @click="doExport('json')" class="export-option" :disabled="exporting">
        📋 JSON
        <span style="font-size: 10px; color: var(--muted);">Format brut</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { exportsApi } from '../api'
import { useToast } from '../composables/useToast'

const props = defineProps({
  type: { type: String, default: 'clients' },
  filters: { type: Object, default: () => ({}) }
})

const toast = useToast()
const open = ref(false)
const exporting = ref(false)
const wrapRef = ref(null)

async function doExport(format) {
  exporting.value = true
  try {
    let response
    if (props.type === 'clients' && format === 'csv') {
      response = await exportsApi.clientsCsv(props.filters)
    } else if (props.type === 'clients' && format === 'json') {
      response = await exportsApi.clientsJson(props.filters)
    } else if (props.type === 'kpis' && format === 'csv') {
      response = await exportsApi.kpisCsv()
    }

    if (response) {
      const blob = new Blob([response.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${props.type}-export.${format}`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Export téléchargé')
    }

    open.value = false
  } catch {
    toast.error("Erreur lors de l'export")
  } finally {
    exporting.value = false
  }
}

function onClickOutside(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.export-wrap { position: relative; display: inline-block; }
.export-menu {
  position: absolute; top: 100%; right: 0; margin-top: 4px;
  background: var(--card, white); border: 1px solid var(--border);
  border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,.1);
  z-index: 50; min-width: 200px; overflow: hidden;
}
.export-option {
  display: flex; flex-direction: column; gap: 2px; width: 100%;
  padding: 10px 14px; background: none; border: none; border-bottom: 1px solid var(--border);
  cursor: pointer; text-align: left; font-size: 13px; font-weight: 600;
  color: var(--text); transition: background .15s;
}
.export-option:last-child { border-bottom: none; }
.export-option:hover { background: rgba(0,0,0,.03); }
.export-option:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
