<template>
  <div class="kp" :class="{ dark: darkMode }" @keydown="onKey" tabindex="0" ref="rootEl">
    <!-- Slides -->
    <transition :name="slideDirection" mode="out-in">
      <!-- Slide 0: Title -->
      <div v-if="slide === 0" key="s0" class="kp-slide slide-title" :style="{ background: `linear-gradient(135deg, ${copil?.color || '#7c3aed'}, #1e1b4b)` }">
        <div class="st-content">
          <h1 class="st-name">{{ copil?.name }}</h1>
          <p class="st-period">{{ copil?.period }}</p>
          <p v-if="copil?.subtitle" class="st-sub">{{ copil.subtitle }}</p>
        </div>
        <div class="st-footer">Scalyo</div>
      </div>

      <!-- Slide 1: Global Score -->
      <div v-else-if="slide === 1" key="s1" class="kp-slide slide-score">
        <h2>{{ t('copil_score') }}</h2>
        <div class="ss-gauge">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="14" />
            <circle cx="100" cy="100" r="85" fill="none" :stroke="scoreColor" stroke-width="14" :stroke-dasharray="scoreArc + ' 534'" stroke-linecap="round" transform="rotate(-90 100 100)" class="ss-progress" />
            <text x="100" y="95" text-anchor="middle" font-size="52" font-weight="800" :fill="scoreColor">{{ globalScore }}</text>
            <text x="100" y="120" text-anchor="middle" font-size="16" fill="rgba(255,255,255,0.5)">/100</text>
          </svg>
        </div>
        <p class="ss-status" :style="{ color: scoreColor }">{{ globalScore >= 80 ? t('copil_excellent') : globalScore >= 60 ? t('copil_good') : globalScore >= 40 ? t('copil_attention') : t('copil_critical') }}</p>
      </div>

      <!-- Slide 2: Hero KPIs -->
      <div v-else-if="slide === 2" key="s2" class="kp-slide slide-kpis">
        <h2>KPIs</h2>
        <div class="sk-grid">
          <div v-for="(kpi, i) in heroKpis" :key="kpi.kpiId" class="sk-card" :style="{ animationDelay: i * 0.2 + 's' }">
            <span class="sk-name">{{ kpi.name }}</span>
            <span class="sk-value">{{ fmtVal(kpi) }}</span>
            <div class="sk-bar"><div class="sk-fill" :style="{ width: Math.min(barPct(kpi), 100) + '%', background: barColor(kpi) }" /></div>
            <span class="sk-target">{{ t('copil_wiz_target') }}: {{ fmtVal({ ...kpi, value: kpi.target }) }}</span>
          </div>
        </div>
      </div>

      <!-- Slide 3: Waterfall -->
      <div v-else-if="slide === 3" key="s3" class="kp-slide slide-waterfall">
        <h2>{{ t('copil_waterfall') }}</h2>
        <div class="sw-chart">
          <div v-for="(bar, i) in waterfallBars" :key="bar.label" class="sw-bar-wrap" :style="{ animationDelay: i * 0.12 + 's' }">
            <div class="sw-val" :class="bar.type">{{ bar.value >= 0 ? '+' : '' }}{{ fmtCurrency(bar.value) }}</div>
            <div class="sw-bar" :class="bar.type" :style="{ height: Math.abs(bar.value) / waterfallMax * 180 + 'px' }" />
            <div class="sw-label">{{ bar.label }}</div>
          </div>
        </div>
      </div>

      <!-- Slide 4: Nova Analysis -->
      <div v-else-if="slide === 4" key="s4" class="kp-slide slide-nova">
        <h2>{{ t('copil_nova_title') }}</h2>
        <div class="sn-sections">
          <div class="sn-section green"><h3>{{ t('copil_nova_strengths') }}</h3><ul><li v-for="s in novaStrengths" :key="s">{{ s }}</li></ul></div>
          <div class="sn-section amber"><h3>{{ t('copil_nova_warnings') }}</h3><ul><li v-for="w in novaWarnings" :key="w">{{ w }}</li></ul></div>
          <div class="sn-section blue"><h3>{{ t('copil_nova_actions') }}</h3><ol><li v-for="a in novaActions" :key="a">{{ a }}</li></ol></div>
        </div>
      </div>

      <!-- Slide 5: Questions -->
      <div v-else key="s5" class="kp-slide slide-end" :style="{ background: `linear-gradient(135deg, ${copil?.color || '#7c3aed'}, #1e1b4b)` }">
        <h1>{{ t('copil_pres_questions') }}</h1>
        <p>{{ copil?.name }} · {{ copil?.period }}</p>
      </div>
    </transition>

    <!-- Controls bar -->
    <div class="kp-controls" :class="{ hidden: controlsHidden }">
      <button @click="prev" :disabled="slide === 0">‹</button>
      <span class="kp-slide-num">{{ t('copil_pres_slide', { n: slide + 1, total: totalSlides }) }}</span>
      <button @click="next" :disabled="slide >= totalSlides - 1">›</button>
      <div class="kp-ctrl-sep" />
      <button @click="toggleAuto">{{ autoPlay ? t('copil_pres_pause') : t('copil_pres_auto') }}</button>
      <button class="kp-theme-btn" @click="darkMode = !darkMode">{{ darkMode ? '☀' : '🌙' }}</button>
      <button @click="exitPresent">{{ t('copil_pres_exit') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'
import { useClientStore } from '@/stores/clients'

const props = defineProps({ id: String })
const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const store = useKpiStore()
const clients = useClientStore()

const rootEl = ref(null)
const slide = ref(0)
const totalSlides = 6
const darkMode = ref(true)
const autoPlay = ref(false)
const controlsHidden = ref(false)
const slideDirection = ref('slide-left')
let autoTimer = null
let hideTimer = null

const copil = computed(() => store.getCopil(props.id))
const globalScore = computed(() => {
  const c = copil.value
  if (!c) return 0
  const healthy = clients.healthyCount
  const total = clients.clients.length
  const healthPct = total ? Math.round((healthy / total) * 100) : 0
  return Math.min(Math.round((healthPct + (100 - clients.criticalCount * 10)) / 2), 100)
})
const heroKpis = computed(() => {
  const blocks = copil.value?.blocks || []
  const kpiBlocks = blocks.filter(b => b.type === 'kpi_grid' || b.type === 'kpi_single')
  const kpis = []
  kpiBlocks.forEach(b => {
    if (b.type === 'kpi_grid') kpis.push(...(b.data?.kpis || []).map(k => ({ ...k, name: k.label || k.name })))
    if (b.type === 'kpi_single') kpis.push({ ...b.data, name: b.data?.label || b.data?.name })
  })
  return kpis.slice(0, 4)
})
const scoreColor = computed(() => {
  const s = globalScore.value
  return s >= 80 ? '#10b981' : s >= 60 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'
})
const scoreArc = computed(() => ((globalScore.value / 100) * 534).toFixed(1))

function fmtVal(kpi) {
  const v = kpi.value
  if (v == null) return '—'
  if (kpi.format === 'currency') return '€' + (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v)
  if (kpi.format === 'pct') return v + '%'
  return v + (kpi.unit || '')
}
function fmtCurrency(v) { return (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v) + '€' }
function barPct(kpi) { return kpi.target ? Math.round((kpi.inverse ? kpi.target / kpi.value : kpi.value / kpi.target) * 100) : 0 }
function barColor(kpi) { const p = barPct(kpi); return p >= 95 ? '#10b981' : p >= 70 ? '#f59e0b' : '#ef4444' }

const waterfallBars = computed(() => {
  const a = clients.totalArr
  return [
    { label: 'ARR Start', value: a, type: 'neutral' },
    { label: '+New', value: 85000, type: 'positive' },
    { label: '+Expansion', value: 42000, type: 'positive' },
    { label: '-Contraction', value: -15000, type: 'negative' },
    { label: '-Churn', value: -clients.arrAtRisk, type: 'negative' },
    { label: 'ARR End', value: a + 85000 + 42000 - 15000 - clients.arrAtRisk, type: 'total' },
  ]
})
const waterfallMax = computed(() => Math.max(...waterfallBars.value.map(b => Math.abs(b.value))))

const novaStrengths = computed(() => {
  const s = []
  const nrr = copil.value?.kpis?.find(k => k.kpiId === 'nrr')
  if (nrr?.value > 110) s.push(`NRR ${nrr.value}% — top 15% SaaS B2B`)
  s.push(`${clients.healthyCount} comptes sains sur ${clients.clients.length}`)
  return s
})
const novaWarnings = computed(() => {
  const w = []
  if (clients.criticalCount > 0) w.push(`${clients.criticalCount} comptes critiques`)
  return w.length ? w : ['Aucun point d\'attention']
})
const novaActions = computed(() => [
  clients.criticalCount > 0 ? `Contacter les ${clients.criticalCount} comptes critiques` : 'Maintenir les check-ins proactifs',
  'Planifier les QBR du trimestre',
])

function prev() { if (slide.value > 0) { slideDirection.value = 'slide-right'; slide.value-- } }
function next() { if (slide.value < totalSlides - 1) { slideDirection.value = 'slide-left'; slide.value++ } }

function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  else if (e.key === 'Escape') exitPresent()
  resetHideTimer()
}

function toggleAuto() {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) { autoTimer = setInterval(() => { if (slide.value < totalSlides - 1) next(); else { autoPlay.value = false; clearInterval(autoTimer) } }, 8000) }
  else clearInterval(autoTimer)
}

function exitPresent() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  router.push('/app/kpis/' + props.id)
}

function resetHideTimer() {
  controlsHidden.value = false
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { controlsHidden.value = true }, 4000)
}

onMounted(() => {
  nextTick(() => {
    rootEl.value?.focus()
    rootEl.value?.requestFullscreen?.().catch(() => {})
  })
  resetHideTimer()
  document.addEventListener('mousemove', resetHideTimer)
})
onUnmounted(() => {
  clearInterval(autoTimer)
  clearTimeout(hideTimer)
  document.removeEventListener('mousemove', resetHideTimer)
})
</script>

<style scoped>
.kp { position: fixed; inset: 0; z-index: 9999; background: #0a0a0f; color: #fff; overflow: hidden; outline: none; display: flex; flex-direction: column; }
.kp:not(.dark) { background: var(--bg-card); color: var(--text); }

/* Slides */
.kp-slide { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; }

/* Transitions */
.slide-left-enter-active, .slide-left-leave-active, .slide-right-enter-active, .slide-right-leave-active { transition: all 0.4s ease; }
.slide-left-enter-from { opacity: 0; transform: translateX(80px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-80px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-80px); }
.slide-right-leave-to { opacity: 0; transform: translateX(80px); }

/* Slide 0: Title */
.slide-title { text-align: center; }
.st-content { animation: fadeUp 1s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.st-name { font-size: 3.5rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 12px; color: #fff; }
.st-period { font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
.st-sub { font-size: 1rem; color: rgba(255,255,255,0.4); }
.st-footer { position: absolute; bottom: 30px; font-size: 0.8rem; color: rgba(255,255,255,0.2); letter-spacing: 0.1em; }

/* Slide 1: Score */
.slide-score h2 { font-size: 1.2rem; color: rgba(255,255,255,0.5); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.1em; }
.kp:not(.dark) .slide-score h2 { color: #6b7280; }
.ss-gauge { width: 240px; height: 240px; margin-bottom: 20px; }
.ss-gauge svg { width: 100%; height: 100%; }
.ss-progress { transition: stroke-dasharray 1.5s ease; }
.ss-status { font-size: 1.3rem; font-weight: 700; }

/* Slide 2: KPIs */
.slide-kpis h2 { font-size: 1.2rem; color: rgba(255,255,255,0.5); margin-bottom: 32px; text-transform: uppercase; letter-spacing: 0.1em; }
.kp:not(.dark) .slide-kpis h2 { color: #6b7280; }
.sk-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 900px; width: 100%; }
.sk-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; text-align: center; animation: cardPop 0.5s ease both; }
.kp:not(.dark) .sk-card { background: var(--bg-card); border-color: #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
@keyframes cardPop { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
.sk-name { font-size: 0.72rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px; }
.kp:not(.dark) .sk-name { color: #9ca3af; }
.sk-value { font-size: 2.5rem; font-weight: 800; display: block; margin-bottom: 12px; }
.sk-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 8px; overflow: hidden; }
.kp:not(.dark) .sk-bar { background: #f3f4f6; }
.sk-fill { height: 100%; border-radius: 2px; transition: width 1.2s ease; }
.sk-target { font-size: 0.72rem; color: rgba(255,255,255,0.3); }
.kp:not(.dark) .sk-target { color: #9ca3af; }

/* Slide 3: Waterfall */
.slide-waterfall h2 { font-size: 1.2rem; color: rgba(255,255,255,0.5); margin-bottom: 32px; text-transform: uppercase; letter-spacing: 0.1em; }
.kp:not(.dark) .slide-waterfall h2 { color: #6b7280; }
.sw-chart { display: flex; align-items: flex-end; gap: 16px; height: 280px; padding-top: 40px; }
.sw-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; animation: barGrow 0.6s ease both; }
@keyframes barGrow { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: scaleY(1); } }
.sw-val { font-size: 0.78rem; font-weight: 700; }
.sw-val.positive { color: #10b981; }
.sw-val.negative { color: #ef4444; }
.sw-val.neutral, .sw-val.total { color: rgba(255,255,255,0.7); }
.kp:not(.dark) .sw-val.neutral, .kp:not(.dark) .sw-val.total { color: #374151; }
.sw-bar { width: 60px; border-radius: 6px 6px 0 0; transition: height 0.8s ease; transform-origin: bottom; }
.sw-bar.positive { background: #10b981; }
.sw-bar.negative { background: #ef4444; }
.sw-bar.neutral { background: #6b7280; }
.sw-bar.total { background: #7c3aed; }
.sw-label { font-size: 0.68rem; color: rgba(255,255,255,0.4); text-align: center; }
.kp:not(.dark) .sw-label { color: #9ca3af; }

/* Slide 4: Nova */
.slide-nova h2 { font-size: 1.2rem; color: rgba(255,255,255,0.5); margin-bottom: 28px; text-transform: uppercase; letter-spacing: 0.1em; }
.kp:not(.dark) .slide-nova h2 { color: #6b7280; }
.sn-sections { display: flex; flex-direction: column; gap: 20px; max-width: 700px; width: 100%; }
.sn-section { padding: 20px 24px; border-radius: 12px; }
.sn-section.green { background: rgba(16,185,129,0.1); }
.sn-section.amber { background: rgba(245,158,11,0.1); }
.sn-section.blue { background: rgba(59,130,246,0.1); }
.sn-section h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 10px; }
.sn-section ul, .sn-section ol { padding-left: 20px; }
.sn-section li { font-size: 0.9rem; line-height: 1.6; margin-bottom: 4px; }

/* Slide 5: End */
.slide-end { text-align: center; }
.slide-end h1 { font-size: 4rem; font-weight: 900; color: #fff; margin-bottom: 16px; animation: fadeUp 0.8s ease; }
.slide-end p { font-size: 1.1rem; color: rgba(255,255,255,0.4); }

/* Controls */
.kp-controls { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: opacity 0.3s, transform 0.3s; z-index: 10; }
.kp:not(.dark) .kp-controls { background: rgba(255,255,255,0.9); border-top: 1px solid #e5e7eb; }
.kp-controls.hidden { opacity: 0; transform: translateY(100%); }
.kp-controls button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 6px 16px; border-radius: 6px; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
.kp:not(.dark) .kp-controls button { background: var(--bg-card); border-color: #e5e7eb; color: #374151; }
.kp-controls button:hover { background: rgba(255,255,255,0.2); }
.kp-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
.kp-slide-num { font-size: 0.78rem; color: rgba(255,255,255,0.5); min-width: 80px; text-align: center; }
.kp:not(.dark) .kp-slide-num { color: #9ca3af; }
.kp-ctrl-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.15); margin: 0 8px; }
.kp-theme-btn { font-size: 1rem; }

@media (max-width: 900px) { .sk-grid { grid-template-columns: repeat(2, 1fr); } .st-name { font-size: 2rem; } .slide-end h1 { font-size: 2.5rem; } }
@media (max-width: 600px) { .sk-grid { grid-template-columns: 1fr; } .sw-chart { gap: 8px; } .sw-bar { width: 40px; } }
</style>
