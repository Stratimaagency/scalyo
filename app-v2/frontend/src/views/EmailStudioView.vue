<template>
  <div class="email-studio">
    <div class="es-header">
      <h1>📧 {{ t('es_title') }}</h1>
      <p class="es-sub">{{ t('es_subtitle') }}</p>
    </div>

    <div class="es-layout">
      <div class="es-left">
        <div class="es-tabs">
          <button v-for="tab in tabs" :key="tab.key" class="es-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ t(tab.label) }}</button>
        </div>
        <div class="es-search"><span>🔍</span><input v-model="search" :placeholder="t('es_search')" /></div>

        <div class="es-cats">
          <button v-for="cat in categoryKeys" :key="cat" class="es-cat" :class="{ active: activeCat === cat, [catClass(cat)]: true }" @click="activeCat = activeCat === cat ? 'all' : cat">{{ cat === 'all' ? t('es_cat_all') : t('es_cat_' + cat) }}</button>
        </div>

        <div class="es-list">
          <div v-for="tpl in filteredTemplates" :key="tpl.id" class="es-item" :class="{ active: selectedId === tpl.id }" @click="selectedId = tpl.id">
            <span class="esi-cat" :class="catClass(tpl.categoryKey)">{{ t('es_cat_' + tpl.categoryKey) }}</span>
            <strong>{{ t(tpl.nameKey) }}</strong>
          </div>
        </div>
      </div>

      <div class="es-right">
        <div v-if="selected" class="es-preview">
          <div class="esp-header">
            <h2>{{ t(selected.nameKey) }}</h2>
            <div class="esp-actions">
              <span class="esp-cat" :class="catClass(selected.categoryKey)">{{ t('es_cat_' + selected.categoryKey) }}</span>
              <button class="btn-primary" @click="copyEmail">{{ copied ? t('es_copied') : t('es_copy') }}</button>
            </div>
          </div>
          <div class="esp-field"><strong>{{ t('es_subject') }}</strong><p>{{ t(selected.subjectKey) }}</p></div>
          <div class="esp-body">
            <strong>{{ t('es_body') }}</strong>
            <div class="esp-content" v-html="t(selected.bodyKey)" />
          </div>
        </div>
        <div v-else class="esp-empty">
          <span class="esp-empty-icon">📧</span>
          <p>{{ t('es_preview') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const activeTab = ref('all')
const activeCat = ref('all')
const search = ref('')
const selectedId = ref(null)
const copied = ref(false)

const tabs = [
  { key: 'all', label: 'es_tab_all' },
  { key: 'csm', label: 'es_tab_csm' },
  { key: 'commercial', label: 'es_tab_commercial' },
  { key: 'kam', label: 'es_tab_kam' },
]

const templates = [
  { id: 1,  nameKey: 'es_tpl1_name',  categoryKey: 'onboarding',     type: 'csm',        subjectKey: 'es_tpl1_subject',  bodyKey: 'es_tpl1_body' },
  { id: 2,  nameKey: 'es_tpl2_name',  categoryKey: 'qbr',            type: 'csm',        subjectKey: 'es_tpl2_subject',  bodyKey: 'es_tpl2_body' },
  { id: 3,  nameKey: 'es_tpl3_name',  categoryKey: 'suivi',          type: 'csm',        subjectKey: 'es_tpl3_subject',  bodyKey: 'es_tpl3_body' },
  { id: 4,  nameKey: 'es_tpl4_name',  categoryKey: 'risque',         type: 'csm',        subjectKey: 'es_tpl4_subject',  bodyKey: 'es_tpl4_body' },
  { id: 5,  nameKey: 'es_tpl5_name',  categoryKey: 'renouvellement', type: 'csm',        subjectKey: 'es_tpl5_subject',  bodyKey: 'es_tpl5_body' },
  { id: 6,  nameKey: 'es_tpl6_name',  categoryKey: 'expansion',      type: 'csm',        subjectKey: 'es_tpl6_subject',  bodyKey: 'es_tpl6_body' },
  { id: 7,  nameKey: 'es_tpl7_name',  categoryKey: 'nps',            type: 'csm',        subjectKey: 'es_tpl7_subject',  bodyKey: 'es_tpl7_body' },
  { id: 8,  nameKey: 'es_tpl8_name',  categoryKey: 'prospection',    type: 'commercial', subjectKey: 'es_tpl8_subject',  bodyKey: 'es_tpl8_body' },
  { id: 9,  nameKey: 'es_tpl9_name',  categoryKey: 'negociation',    type: 'commercial', subjectKey: 'es_tpl9_subject',  bodyKey: 'es_tpl9_body' },
  { id: 10, nameKey: 'es_tpl10_name', categoryKey: 'relance',        type: 'commercial', subjectKey: 'es_tpl10_subject', bodyKey: 'es_tpl10_body' },
  { id: 11, nameKey: 'es_tpl11_name', categoryKey: 'retention',      type: 'kam',        subjectKey: 'es_tpl11_subject', bodyKey: 'es_tpl11_body' },
  { id: 12, nameKey: 'es_tpl12_name', categoryKey: 'closing',        type: 'commercial', subjectKey: 'es_tpl12_subject', bodyKey: 'es_tpl12_body' },
]

const categoryKeys = computed(() => {
  const keys = [...new Set(templates.map(tpl => tpl.categoryKey))]
  return ['all', ...keys]
})

const filteredTemplates = computed(() => {
  let list = templates
  if (activeTab.value !== 'all') list = list.filter(tpl => tpl.type === activeTab.value)
  if (activeCat.value !== 'all') list = list.filter(tpl => tpl.categoryKey === activeCat.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(tpl => t(tpl.nameKey).toLowerCase().includes(q) || t('es_cat_' + tpl.categoryKey).toLowerCase().includes(q))
  }
  return list
})

const selected = computed(() => templates.find(tpl => tpl.id === selectedId.value) || filteredTemplates.value[0] || null)

function catClass(key) {
  const map = { onboarding: 'cat-blue', qbr: 'cat-purple', suivi: 'cat-teal', risque: 'cat-red', renouvellement: 'cat-amber', expansion: 'cat-green', nps: 'cat-pink', prospection: 'cat-indigo', negociation: 'cat-orange', relance: 'cat-slate', closing: 'cat-dark', retention: 'cat-red', all: 'cat-gray' }
  return map[key] || 'cat-gray'
}

function copyEmail() {
  if (!selected.value) return
  const text = t(selected.value.subjectKey) + '\n\n' + t(selected.value.bodyKey).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
.email-studio { max-width: 1200px; }
.es-header { margin-bottom: 20px; }
.es-header h1 { font-size: 1.5rem; font-weight: 800; }
.es-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.es-layout { display: grid; grid-template-columns: 340px 1fr; gap: 20px; min-height: 600px; }
.es-left { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; }
.es-tabs { display: flex; border-bottom: 1px solid var(--border-light); }
.es-tab { flex: 1; padding: 10px; background: none; border: none; font-size: 0.78rem; font-weight: 500; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.es-tab.active { color: var(--purple); border-bottom-color: var(--purple); font-weight: 600; }
.es-search { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--border-light); }
.es-search input { border: none; outline: none; font-size: 0.82rem; width: 100%; background: transparent; }
.es-cats { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 10px; border-bottom: 1px solid var(--border-light); }
.es-cat { font-size: 0.65rem; font-weight: 600; padding: 3px 8px; border-radius: 4px; border: none; cursor: pointer; opacity: 0.6; transition: all 0.15s; }
.es-cat.active { opacity: 1; }
.es-cat:hover { opacity: 0.9; }
.cat-blue { background: #dbeafe; color: #1d4ed8; }
.cat-purple { background: #ede9fe; color: #7c3aed; }
.cat-teal { background: #ccfbf1; color: #0d9488; }
.cat-red { background: #fee2e2; color: #dc2626; }
.cat-amber { background: #fef3c7; color: #d97706; }
.cat-green { background: #d1fae5; color: #059669; }
.cat-pink { background: #fce7f3; color: #db2777; }
.cat-indigo { background: #e0e7ff; color: #4338ca; }
.cat-orange { background: #ffedd5; color: #ea580c; }
.cat-slate { background: #f1f5f9; color: #475569; }
.cat-dark { background: #1e293b; color: #f1f5f9; }
.cat-gray { background: #f3f4f6; color: #6b7280; }
.es-list { flex: 1; overflow-y: auto; }
.es-item { padding: 12px 14px; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s; }
.es-item:hover { background: var(--bg-hover); }
.es-item.active { background: var(--purple-bg); border-left: 3px solid var(--purple); }
.esi-cat { font-size: 0.6rem; font-weight: 600; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-bottom: 4px; }
.es-item strong { font-size: 0.82rem; display: block; }
.es-right { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.es-preview { padding: 24px; }
.esp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; }
.esp-header h2 { font-size: 1.1rem; font-weight: 700; }
.esp-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.esp-cat { font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-primary:hover { background: var(--purple-dark); }
.esp-field { margin-bottom: 16px; }
.esp-field strong { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px; }
.esp-field p { font-size: 0.9rem; padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm); }
.esp-body strong { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 8px; }
.esp-content { font-size: 0.88rem; line-height: 1.7; padding: 16px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border-light); }
.esp-content :deep(p) { margin-bottom: 10px; }
.esp-content :deep(ul) { margin: 8px 0 8px 20px; list-style: disc; }
.esp-content :deep(li) { margin-bottom: 4px; }
.esp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: var(--text-muted); }
.esp-empty-icon { font-size: 3rem; margin-bottom: 12px; }
.esp-empty p { font-size: 0.9rem; }
@media (max-width: 900px) { .es-layout { grid-template-columns: 1fr; } .es-right { min-height: 300px; } }
</style>
