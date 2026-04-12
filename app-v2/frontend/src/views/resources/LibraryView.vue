<template>
  <div class="library-view">
    <div class="lib-header">
      <h1>📚 {{ t('sidebar_res_library') }}</h1>
      <p class="lib-sub">{{ t('es_subtitle') }}</p>
    </div>
    <div class="lib-toolbar">
      <div class="lib-cats">
        <button v-for="c in cats" :key="c.key" class="ftab" :class="{ active: activeCat === c.key }" @click="activeCat = c.key">{{ c.label }}</button>
      </div>
      <div class="lib-filters">
        <select v-model="activeLevel" class="fsel">
          <option value="all">{{ t('res_all_levels') }}</option>
          <option value="beginner">{{ t('res_beginner') }}</option>
          <option value="intermediate">{{ t('res_intermediate') }}</option>
          <option value="expert">{{ t('res_expert') }}</option>
        </select>
        <div class="search-box"><span>🔍</span><input v-model="search" :placeholder="t('res_search_ph')" /></div>
      </div>
    </div>
    <div class="lib-grid">
      <div v-for="r in filtered" :key="r.id" class="lib-card">
        <span class="lc-icon">{{ r.icon }}</span>
        <div class="lc-body">
          <strong>{{ r.title }}</strong>
          <p>{{ r.desc }}</p>
          <div class="lc-meta">
            <span class="lc-cat">{{ r.category }}</span>
            <span class="lc-level" :class="r.level">{{ levelLabel(r.level) }}</span>
            <span class="lc-dur">{{ r.duration }}</span>
          </div>
        </div>
        <button class="btn-sm-green">{{ t('dash_view_all') }} →</button>
      </div>
    </div>
    <div v-if="!filtered.length" class="lib-empty">
      <span>📚</span><p>{{ t('res_no_results') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResourceStore } from '@/stores/resources'

const { t } = useI18n({ useScope: 'global' })
const store = useResourceStore()
const activeCat = ref('all')
const activeLevel = ref('all')
const search = ref('')
const cats = computed(() => [
  { key: 'all', label: t('all') }, { key: 'guide', label: '📘 Guides' }, { key: 'checklist', label: '📋 Checklists' },
  { key: 'framework', label: '🎯 Frameworks' }, { key: 'script', label: '⚙️ Scripts' }, { key: 'template', label: '📊 Templates' },
])
const filtered = computed(() => store.filteredResources(activeCat.value, activeLevel.value, search.value))
function levelLabel(l) { return l === 'beginner' ? t('res_beginner') : l === 'intermediate' ? t('res_intermediate') : t('res_expert') }
</script>

<style scoped>
.library-view { max-width: 1000px; }
.lib-header { margin-bottom: 24px; }
.lib-header h1 { font-size: 1.5rem; font-weight: 800; }
.lib-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.lib-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.lib-cats { display: flex; gap: 4px; flex-wrap: wrap; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.ftab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.lib-filters { display: flex; gap: 8px; }
.fsel { padding: 7px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.82rem; background: #fff; outline: none; }
.search-box { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0 10px; }
.search-box input { border: none; outline: none; padding: 7px 0; font-size: 0.82rem; width: 140px; background: transparent; }
.lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.lib-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; gap: 14px; align-items: flex-start; transition: all 0.2s; }
.lib-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.lc-icon { font-size: 2rem; flex-shrink: 0; }
.lc-body { flex: 1; min-width: 0; }
.lc-body strong { font-size: 0.9rem; display: block; margin-bottom: 4px; }
.lc-body p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; }
.lc-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.lc-cat { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: var(--bg); color: var(--text-muted); text-transform: capitalize; }
.lc-level { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.lc-level.beginner { background: var(--green-bg); color: var(--green); }
.lc-level.intermediate { background: var(--amber-bg); color: var(--amber); }
.lc-level.expert { background: var(--purple-bg); color: var(--purple); }
.lc-dur { font-size: 0.65rem; color: var(--text-muted); }
.btn-sm-green { background: var(--green); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; align-self: center; }
.btn-sm-green:hover { background: var(--green-dark); }
.lib-empty { text-align: center; padding: 40px; color: var(--text-muted); }
.lib-empty span { font-size: 2.5rem; display: block; margin-bottom: 12px; }
@media (max-width: 768px) { .lib-grid { grid-template-columns: 1fr; } .lib-toolbar { flex-direction: column; align-items: stretch; } }
</style>
