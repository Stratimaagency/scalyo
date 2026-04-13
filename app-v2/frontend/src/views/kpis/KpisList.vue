<template>
  <div class="kpis-list">
    <div class="kl-header">
      <div>
        <h1>📊 {{ t('copil_title') }}</h1>
        <p class="kl-sub">{{ t('copil_subtitle') }}</p>
      </div>
      <router-link to="/app/kpis/new" class="btn-primary">{{ t('copil_new') }}</router-link>
    </div>

    <!-- COPIL cards -->
    <div v-if="store.copils.length" class="kl-grid">
      <div v-for="copil in store.copils" :key="copil.id" class="kl-card" :style="{ borderTopColor: copil.color || '#7c3aed' }">
        <!-- Score bar top -->
        <div class="kl-score-bar" :class="store.scoreStatus(score(copil))">
          <span>{{ t('copil_score') }}: {{ score(copil) }}/100</span>
          <span class="kl-status-label">{{ t('copil_' + store.scoreStatus(score(copil))) }}</span>
        </div>

        <div class="kl-card-body">
          <h3>{{ copil.name }}</h3>
          <p class="kl-period">{{ copil.period }}</p>

          <!-- Mini KPIs preview -->
          <div class="kl-mini-kpis">
            <div v-for="kpi in (copil.kpis || []).slice(0, 4)" :key="kpi.kpiId" class="kl-mini">
              <span class="km-label">{{ kpi.name }}</span>
              <span class="km-value" :class="kpiColor(kpi)">{{ fmtVal(kpi) }}</span>
            </div>
          </div>

          <div class="kl-meta">
            <span>{{ t('copil_created', { date: copil.createdAt }) }}</span>
            <span>{{ t('copil_kpis_count', { n: copil.kpis?.length || 0 }) }}</span>
          </div>
        </div>

        <div class="kl-card-actions">
          <router-link :to="'/app/kpis/' + copil.id" class="btn-sm-primary">{{ t('copil_open') }}</router-link>
          <router-link :to="'/app/kpis/' + copil.id + '/present'" class="btn-sm-outline">{{ t('copil_present') }}</router-link>
          <button class="btn-sm-outline" @click="store.duplicateCopil(copil.id)">{{ t('copil_duplicate') }}</button>
          <button class="btn-sm-outline danger" @click="store.deleteCopil(copil.id)">{{ t('copil_delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="kl-empty">
      <div class="kle-illustration">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="10" y="30" width="100" height="70" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
          <rect x="20" y="45" width="30" height="8" rx="4" fill="#a78bfa"/>
          <rect x="20" y="60" width="50" height="6" rx="3" fill="#c4b5fd"/>
          <rect x="20" y="72" width="40" height="6" rx="3" fill="#c4b5fd"/>
          <circle cx="85" cy="58" r="18" fill="#7c3aed" opacity="0.15"/>
          <path d="M80 58 L85 52 L90 58 L85 64Z" fill="#7c3aed"/>
          <rect x="30" y="10" width="60" height="24" rx="6" fill="#f5f3ff" stroke="#a78bfa" stroke-width="1.5"/>
          <rect x="38" y="17" width="44" height="4" rx="2" fill="#7c3aed"/>
          <rect x="42" y="24" width="36" height="3" rx="1.5" fill="#c4b5fd"/>
        </svg>
      </div>
      <h2>{{ t('copil_empty_title') }}</h2>
      <p>{{ t('copil_empty_desc') }}</p>
      <router-link to="/app/kpis/new" class="btn-gradient">{{ t('copil_empty_cta') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'

const { t } = useI18n({ useScope: 'global' })
const store = useKpiStore()

function score(copil) { return store.computeScore(copil) }

function kpiColor(kpi) {
  if (!kpi.target || !kpi.value) return ''
  const ratio = kpi.inverse ? kpi.target / kpi.value : kpi.value / kpi.target
  return ratio >= 0.95 ? 'green' : ratio >= 0.7 ? 'amber' : 'red'
}

function fmtVal(kpi) {
  if (!kpi.value && kpi.value !== 0) return '—'
  if (kpi.format === 'currency') return '€' + (kpi.value >= 1e6 ? (kpi.value / 1e6).toFixed(1) + 'M' : kpi.value >= 1e3 ? (kpi.value / 1e3).toFixed(0) + 'K' : kpi.value)
  if (kpi.format === 'pct') return kpi.value + '%'
  return kpi.value + (kpi.unit || '')
}
</script>

<style scoped>
.kpis-list { max-width: 1000px; }
.kl-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.kl-header h1 { font-size: 1.5rem; font-weight: 800; }
.kl-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-block; transition: all 0.2s; text-decoration: none; }
.btn-primary:hover { background: var(--purple-dark); transform: translateY(-1px); }

/* Grid */
.kl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
.kl-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); border-top: 3px solid var(--purple); overflow: hidden; transition: all 0.2s; }
.kl-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }

.kl-score-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; font-size: 0.72rem; font-weight: 600; }
.kl-score-bar.excellent { background: var(--green-bg); color: var(--green); }
.kl-score-bar.good { background: rgba(59,130,246,0.06); color: var(--blue); }
.kl-score-bar.attention { background: var(--amber-bg); color: var(--amber); }
.kl-score-bar.critical { background: var(--red-bg); color: var(--red); }

.kl-card-body { padding: 18px; }
.kl-card-body h3 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
.kl-period { font-size: 0.78rem; color: var(--purple); background: var(--purple-bg); padding: 2px 10px; border-radius: 4px; display: inline-block; margin-bottom: 14px; }

.kl-mini-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.kl-mini { background: var(--bg); border-radius: 6px; padding: 8px 10px; }
.km-label { font-size: 0.65rem; color: var(--text-muted); display: block; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.03em; }
.km-value { font-size: 1rem; font-weight: 700; }
.km-value.green { color: var(--green); }
.km-value.amber { color: var(--amber); }
.km-value.red { color: var(--red); }

.kl-meta { display: flex; gap: 12px; font-size: 0.7rem; color: var(--text-muted); }

.kl-card-actions { display: flex; gap: 6px; padding: 12px 18px; border-top: 1px solid var(--border-light); flex-wrap: wrap; }
.btn-sm-primary { background: var(--purple); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.15s; }
.btn-sm-primary:hover { background: var(--purple-dark); }
.btn-sm-outline { background: #fff; border: 1px solid var(--border); padding: 5px 12px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; color: var(--text-secondary); transition: all 0.15s; text-decoration: none; }
.btn-sm-outline:hover { border-color: var(--purple); color: var(--purple); }
.btn-sm-outline.danger:hover { border-color: var(--red); color: var(--red); }

/* Empty state */
.kl-empty { text-align: center; padding: 80px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); }
.kle-illustration { margin-bottom: 24px; }
.kl-empty h2 { font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
.kl-empty p { font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 28px; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.6; }
.btn-gradient { display: inline-block; padding: 14px 32px; border-radius: 12px; font-size: 0.95rem; font-weight: 700; color: #fff; background: linear-gradient(135deg, #7c3aed, #3b82f6); background-size: 200% 200%; animation: gradientShift 3s ease infinite; text-decoration: none; box-shadow: 0 4px 20px rgba(124,58,237,0.3); transition: all 0.2s; }
.btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.4); }
@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

@media (max-width: 768px) { .kl-grid { grid-template-columns: 1fr; } }
</style>
