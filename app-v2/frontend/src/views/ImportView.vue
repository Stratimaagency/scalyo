<template>
  <div class="import-view">
    <div class="imp-header">
      <h1>📊 {{ t('imp_title') }}</h1>
      <p class="imp-sub">{{ t('imp_subtitle') }}</p>
    </div>

    <div class="imp-dropzone" :class="{ dragover }" @dragover.prevent="dragover = true" @dragleave="dragover = false" @drop.prevent="onDrop" @click="$refs.fileInput.click()">
      <input ref="fileInput" type="file" hidden @change="onFileSelect" accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.pptx,.json,.txt,.vcf" />
      <div class="dz-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="40" rx="6" stroke="#7c3aed" stroke-width="2" fill="#ede9fe"/><path d="M32 24v16m-8-8h16" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
      <p class="dz-text">{{ t('imp_drop') }}</p>
      <p class="dz-formats">{{ t('imp_formats') }}</p>
      <button class="btn-green" @click.stop="$refs.fileInput.click()">{{ t('imp_choose') }}</button>
    </div>

    <!-- File selected -->
    <div v-if="selectedFile" class="imp-file">
      <div class="impf-info">
        <span class="impf-icon">📄</span>
        <div>
          <strong>{{ selectedFile.name }}</strong>
          <span class="impf-size">{{ (selectedFile.size / 1024).toFixed(1) }} KB</span>
        </div>
      </div>
      <button class="btn-outline" @click="selectedFile = null">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const dragover = ref(false)
const selectedFile = ref(null)

function onDrop(e) {
  dragover.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) selectedFile.value = file
}

function onFileSelect(e) {
  const file = e.target?.files?.[0]
  if (file) selectedFile.value = file
}
</script>

<style scoped>
.import-view { max-width: 700px; margin: 0 auto; }
.imp-header { text-align: center; margin-bottom: 32px; }
.imp-header h1 { font-size: 1.5rem; font-weight: 800; }
.imp-sub { font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; }

.imp-dropzone { background: #fff; border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 60px 40px; text-align: center; cursor: pointer; transition: all 0.3s; }
.imp-dropzone:hover, .imp-dropzone.dragover { border-color: var(--purple); background: var(--purple-bg); }
.dz-icon { margin-bottom: 20px; }
.dz-text { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
.dz-formats { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }
.btn-green { background: var(--green); color: #fff; border: none; padding: 12px 28px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-green:hover { background: var(--green-dark); transform: translateY(-1px); }

.imp-file { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--green-border); border-radius: var(--radius-md); padding: 16px 20px; margin-top: 20px; }
.impf-info { display: flex; align-items: center; gap: 12px; }
.impf-icon { font-size: 1.5rem; }
.impf-info strong { display: block; font-size: 0.9rem; }
.impf-size { font-size: 0.75rem; color: var(--text-muted); }
.btn-outline { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 0.85rem; color: var(--text-muted); }
</style>
