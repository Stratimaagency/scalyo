<template>
  <div class="kl">
    <div class="kl-header">
      <div>
        <h1>📊 {{ t('copil_title') }}</h1>
        <p class="kl-sub">{{ t('copil_subtitle') }}</p>
      </div>
      <router-link to="/app/kpis/new" class="btn-primary">{{ t('copil_new') }}</router-link>
    </div>

    <div v-if="store.copils.length" class="kl-grid">
      <div v-for="c in store.copils" :key="c.id" class="kl-card" :style="{ borderTopColor: c.color }">
        <div class="klc-body">
          <h3>{{ c.title || t('copil_cover_title') }}</h3>
          <p v-if="c.subtitle" class="klc-sub">{{ c.subtitle }}</p>
          <div class="klc-meta">
            <span v-if="c.period">📅 {{ c.period }}</span>
            <span v-if="c.clientName">👤 {{ c.clientName }}</span>
            <span>🧱 {{ t('copil_blocks', { n: c.blocks?.length || 0 }) }}</span>
            <span>{{ t('copil_modified', { date: fmtDate(c.updatedAt) }) }}</span>
          </div>
        </div>
        <div class="klc-actions">
          <router-link :to="'/app/kpis/' + c.id" class="btn-sm">{{ t('copil_open') }}</router-link>
          <router-link :to="'/app/kpis/' + c.id + '/present'" class="btn-sm outline">{{ t('copil_present') }}</router-link>
          <div class="klc-menu">
            <button class="btn-sm outline" @click="menuOpen = menuOpen === c.id ? null : c.id">···</button>
            <div v-if="menuOpen === c.id" class="klc-dropdown">
              <button @click="doDuplicate(c.id)">{{ t('copil_duplicate') }}</button>
              <!-- Double validation inline — zéro modal -->
              <template v-if="deleteConfirmId === c.id">
                <button class="danger confirm" @click="doDelete(c.id)">✓ {{ t('copil_delete') }}</button>
                <button @click="deleteConfirmId = null">✕</button>
              </template>
              <button v-else class="danger" @click="deleteConfirmId = c.id">{{ t('copil_delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="kl-empty">
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none" class="kl-illu">
        <rect x="10" y="20" width="100" height="65" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
        <rect x="20" y="32" width="40" height="6" rx="3" fill="#a78bfa"/>
        <rect x="20" y="44" width="60" height="4" rx="2" fill="#c4b5fd"/>
        <rect x="20" y="54" width="50" height="4" rx="2" fill="#c4b5fd"/>
        <circle cx="90" cy="48" r="14" fill="#7c3aed" opacity="0.12"/>
        <path d="M86 48l4-4 4 4-4 4z" fill="#7c3aed"/>
      </svg>
      <h2>{{ t('copil_empty_title') }}</h2>
      <p>{{ t('copil_empty_sub') }}</p>
      <router-link to="/app/kpis/new" class="btn-gradient">{{ t('copil_empty_cta') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'

const { t, locale } = useI18n({ useScope: 'global' })
const store = useKpiStore()
const menuOpen = ref(null)
const deleteConfirmId = ref(null)

function fmtDate(d) {
  if (!d) return ''
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(d).toLocaleDateString(loc, { day: 'numeric', month: 'short' })
}

function doDuplicate(id) {
  store.duplicateCopil(id)
  menuOpen.value = null
}

function doDelete(id) {
  store.deleteCopil(id)
  deleteConfirmId.value = null
  menuOpen.value = null
}
</script>

<style scoped>
.kl { max-width: 1000px; }
.kl-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.kl-header h1 { font-size: 1.5rem; font-weight: 800; }
.kl-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
.btn-primary:hover { background: var(--purple-dark); }
.kl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.kl-card { background: #fff; border: 1px solid var(--border); border-top: 3px solid var(--purple); border-radius: var(--radius-md); overflow: hidden; transition: all 0.2s; }
.kl-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.klc-body { padding: 18px 18px 12px; }
.klc-body h3 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
.klc-sub { font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 10px; }
.klc-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.72rem; color: var(--text-muted); }
.klc-actions { display: flex; gap: 6px; padding: 10px 18px 14px; align-items: center; }
.btn-sm { padding: 5px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-decoration: none; border: none; background: var(--purple); color: #fff; }
.btn-sm:hover { background: var(--purple-dark); }
.btn-sm.outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-sm.outline:hover { border-color: var(--purple); color: var(--purple); }
.klc-menu { position: relative; margin-left: auto; }
.klc-dropdown { position: absolute; top: 100%; right: 0; margin-top: 4px; background: #fff; border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 10; min-width: 130px; overflow: hidden; }
.klc-dropdown button { display: block; width: 100%; padding: 8px 14px; background: none; border: none; font-size: 0.8rem; text-align: left; cursor: pointer; }
.klc-dropdown button:hover { background: var(--bg-hover); }
.klc-dropdown button.danger { color: var(--red); }
.klc-dropdown button.danger:hover { background: var(--red-bg); }
.klc-dropdown button.danger.confirm { background: var(--red-bg); font-weight: 700; }
.kl-empty { text-align: center; padding: 80px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); }
.kl-illu { margin-bottom: 20px; }
.kl-empty h2 { font-size: 1.3rem; font-weight: 800; margin-bottom: 8px; }
.kl-empty p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; max-width: 380px; margin-left: auto; margin-right: auto; line-height: 1.6; }
.btn-gradient { display: inline-block; padding: 13px 30px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; color: #fff; background: linear-gradient(135deg, #7c3aed, #3b82f6); text-decoration: none; box-shadow: 0 4px 20px rgba(124,58,237,0.3); }
.btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.4); }
@media (max-width: 768px) { .kl-grid { grid-template-columns: 1fr; } }
</style>
