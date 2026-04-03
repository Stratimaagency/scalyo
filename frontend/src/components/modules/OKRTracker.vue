<template>
  <div class="mod-page fade-in">
    <!-- HEADER -->
    <div class="mod-hero">
      <div style="flex:1">
        <h1 class="mod-title">{{ t('okrTitle') }}</h1>
        <p class="mod-subtitle">{{ t('okrSubtitle') }}</p>
      </div>
      <div class="okr-hero-right">
        <div class="okr-global-ring-wrap">
          <svg class="okr-ring" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E8EAED" stroke-width="7"/>
            <circle cx="40" cy="40" r="34" fill="none" :stroke="okrColor(globalScore)" stroke-width="7"
              stroke-linecap="round" :stroke-dasharray="circumference"
              :stroke-dashoffset="globalRingOffset" class="okr-ring-progress" transform="rotate(-90 40 40)"/>
          </svg>
          <span class="okr-ring-label" :style="{color: okrColor(globalScore)}">{{ globalScore }}%</span>
        </div>
        <button class="okr-btn-primary" @click="openCreateModal">+ {{ t('okrNewOKR') }}</button>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="okr-filters">
      <select v-model="filterPeriod" class="okr-select">
        <option value="">{{ t('okrFilterAll') }}</option>
        <option v-for="p in periodOptions" :key="p" :value="p">{{ p }}</option>
      </select>
      <select v-model="filterOwner" class="okr-select">
        <option value="">{{ t('okrAllOwners') }}</option>
        <option v-for="o in ownerOptions" :key="o" :value="o">{{ o }}</option>
      </select>
      <select v-model="filterStatus" class="okr-select">
        <option value="">{{ t('okrAllStatuses') }}</option>
        <option value="ontrack">{{ t('okrFilterOnTrack') }}</option>
        <option value="atrisk">{{ t('okrFilterAtRisk') }}</option>
        <option value="behind">{{ t('okrFilterBehind') }}</option>
      </select>
    </div>

    <!-- STATS ROW -->
    <div class="mod-kpi-row" v-if="okrs.length">
      <div class="mod-kpi">
        <div class="mod-kpi-value" :style="{color: okrColor(globalScore)}">{{ globalScore }}%</div>
        <div class="mod-kpi-label">{{ t('okrGlobalScore') }}</div>
      </div>
      <div class="mod-kpi">
        <div class="mod-kpi-value">{{ filteredOkrs.length }}</div>
        <div class="mod-kpi-label">{{ t('okrTotalObjectives') }}</div>
      </div>
      <div class="mod-kpi">
        <div class="mod-kpi-value" style="color:#34A853">{{ statsOnTrack }}</div>
        <div class="mod-kpi-label">{{ t('okrOnTrack') }}</div>
      </div>
      <div class="mod-kpi">
        <div class="mod-kpi-value" style="color:#FBBC05">{{ statsAtRisk }}</div>
        <div class="mod-kpi-label">{{ t('okrAtRisk') }}</div>
      </div>
      <div class="mod-kpi">
        <div class="mod-kpi-value" style="color:#EA4335">{{ statsBehind }}</div>
        <div class="mod-kpi-label">{{ t('okrBehind') }}</div>
      </div>
      <div class="mod-kpi" v-if="bestOkr">
        <div class="mod-kpi-value">{{ bestOkr.emoji || '🎯' }}</div>
        <div class="mod-kpi-label">{{ t('okrBestPerforming') }}</div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div class="mod-card" v-if="!okrs.length">
      <div class="mod-empty">
        <p style="font-size:48px;margin-bottom:12px">🎯</p>
        <p style="font-weight:700;margin-bottom:8px">{{ t('okrEmptyTitle') }}</p>
        <p style="color:#5F6368">{{ t('okrEmptyHint') }}</p>
        <button class="okr-btn-primary" style="margin-top:16px" @click="openCreateModal">+ {{ t('okrNewOKR') }}</button>
      </div>
    </div>

    <!-- OKR CARDS GRID -->
    <div v-else class="okr-grid">
      <div v-for="okr in filteredOkrs" :key="okr.id" class="mod-card okr-card"
           :class="{'okr-card-complete': okrScore(okr) >= 100}">
        <!-- Card Header -->
        <div class="okr-obj-header">
          <span class="okr-emoji">{{ okr.emoji || '🎯' }}</span>
          <div style="flex:1;min-width:0">
            <h4 class="okr-obj-title">{{ okr.objective }}</h4>
            <div class="okr-badges">
              <span class="okr-badge okr-badge-period">{{ okr.period }}</span>
              <span class="okr-badge okr-badge-owner" v-if="okr.owner">{{ okr.owner }}</span>
            </div>
          </div>
          <div class="okr-card-ring-wrap">
            <svg class="okr-ring-sm" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="#E8EAED" stroke-width="5"/>
              <circle cx="26" cy="26" r="22" fill="none" :stroke="okrColor(okrScore(okr))" stroke-width="5"
                stroke-linecap="round" :stroke-dasharray="circumferenceSm"
                :stroke-dashoffset="ringOffset(okrScore(okr), circumferenceSm)" class="okr-ring-progress"
                transform="rotate(-90 26 26)"/>
            </svg>
            <span class="okr-ring-sm-label" :style="{color: okrColor(okrScore(okr))}">{{ okrScore(okr) }}%</span>
            <span v-if="okrScore(okr) >= 100" class="okr-celebration">🎉</span>
          </div>
        </div>

        <!-- Key Results -->
        <div v-for="kr in okr.keyResults" :key="kr.id" class="okr-kr">
          <div class="okr-kr-header">
            <span class="okr-kr-status" :style="{background: okrColor(krPct(kr))}"></span>
            <span class="okr-kr-title">{{ kr.title }}</span>
            <span class="okr-kr-trend" :title="trendLabel(kr)">{{ trendArrow(kr) }}</span>
            <span class="okr-kr-nums">
              <input type="number" class="okr-kr-input" :value="kr.current"
                @change="onKRCurrentChange(okr.id, kr.id, $event)" min="0" :max="kr.target * 2"/>
              <span class="okr-kr-separator">/</span>{{ kr.target }} {{ kr.unit || '' }}
            </span>
          </div>
          <div class="mod-progress-bar">
            <div class="mod-progress-fill" :style="{width: krPct(kr)+'%', background: okrGrad(krPct(kr))}"></div>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="okr-card-actions">
          <button class="okr-btn-sm" @click="openEditModal(okr)">{{ t('okrEditObjective') }}</button>
          <button class="okr-btn-sm okr-btn-danger" @click="confirmDelete(okr)">{{ t('okrDeleteObjective') }}</button>
          <button class="okr-btn-sm" @click="copyOkrSummary(okr)">{{ copiedId === okr.id ? t('okrCopied') : t('okrCopyClipboard') }}</button>
          <button class="okr-btn-sm" @click="printOkr(okr)">{{ t('okrPrint') }}</button>
          <button class="okr-btn-sm" @click="exportPPT(okr)">📊 PPT</button>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div v-if="showModal" class="okr-modal-overlay" @click.self="closeModal">
      <div class="okr-modal">
        <h3 class="okr-modal-title">{{ editingOkr ? t('okrEditObjective') : t('okrNewOKR') }}</h3>

        <label class="okr-label">{{ t('okrObjectiveName') }}</label>
        <input v-model="form.objective" class="okr-input" :placeholder="t('okrObjectiveHint')"/>

        <label class="okr-label">Emoji</label>
        <div class="okr-emoji-picker">
          <span v-for="e in emojiList" :key="e" class="okr-emoji-option"
            :class="{'okr-emoji-selected': form.emoji === e}" @click="form.emoji = e">{{ e }}</span>
        </div>

        <div class="okr-modal-row">
          <div style="flex:1">
            <label class="okr-label">{{ t('okrPeriod') }}</label>
            <select v-model="form.period" class="okr-select okr-select-full">
              <option v-for="p in periodOptions" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div style="flex:1">
            <label class="okr-label">{{ t('okrOwner') }}</label>
            <input v-model="form.owner" class="okr-input" :placeholder="t('okrOwnerHint')"/>
          </div>
        </div>

        <label class="okr-label">{{ t('okrKeyResults') }}</label>
        <div v-for="(kr, idx) in form.keyResults" :key="idx" class="okr-kr-form-row">
          <input v-model="kr.title" class="okr-input okr-input-flex" :placeholder="t('okrKRTitle')"/>
          <input v-model.number="kr.target" type="number" class="okr-input okr-input-num" :placeholder="t('okrKRTarget')" min="0"/>
          <input v-model="kr.unit" class="okr-input okr-input-unit" :placeholder="t('okrKRUnit')"/>
          <input v-model.number="kr.current" type="number" class="okr-input okr-input-num" :placeholder="t('okrKRCurrent')" min="0"/>
          <button class="okr-btn-remove" @click="removeKR(idx)" v-if="form.keyResults.length > 1">&times;</button>
        </div>
        <button class="okr-btn-add-kr" @click="addKR">+ {{ t('okrAddKR') }}</button>

        <div class="okr-modal-footer">
          <button class="okr-btn-secondary" @click="closeModal">{{ t('okrCancel') }}</button>
          <button class="okr-btn-primary" @click="saveOkr" :disabled="saving">{{ t('okrSave') }}</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div v-if="deletingOkr" class="okr-modal-overlay" @click.self="deletingOkr = null">
      <div class="okr-modal okr-modal-sm">
        <p style="font-size:15px;font-weight:600;margin-bottom:16px">{{ t('okrDeleteConfirm') }}</p>
        <div class="okr-modal-footer">
          <button class="okr-btn-secondary" @click="deletingOkr = null">{{ t('okrCancel') }}</button>
          <button class="okr-btn-danger-full" @click="doDelete">{{ t('okrDeleteObjective') }}</button>
        </div>
      </div>
    </div>

    <!-- HIDDEN PRINT AREA -->
    <div id="okr-print-area" class="okr-print-area" v-if="printingOkr">
      <h2>{{ printingOkr.emoji }} {{ printingOkr.objective }}</h2>
      <p>{{ printingOkr.period }} — {{ printingOkr.owner }}</p>
      <p>Score: {{ okrScore(printingOkr) }}%</p>
      <ul>
        <li v-for="kr in printingOkr.keyResults" :key="kr.id">
          {{ kr.title }}: {{ kr.current }}/{{ kr.target }} {{ kr.unit || '' }} ({{ krPct(kr) }}%)
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from '../../i18n'
import api from '../../api/client'

const { t } = useI18n()

// ---------- DATA ----------
const okrs = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingOkr = ref(null)
const deletingOkr = ref(null)
const saving = ref(false)
const copiedId = ref(null)
const printingOkr = ref(null)

const filterPeriod = ref('')
const filterOwner = ref('')
const filterStatus = ref('')

const emojiList = ['🎯','🚀','💡','📈','🏆','💪','🔥','⭐','🌟','💎','🎓','❤️']

const currentYear = new Date().getFullYear()
const periodOptions = [
  `Q1 ${currentYear}`, `Q2 ${currentYear}`, `Q3 ${currentYear}`, `Q4 ${currentYear}`,
  `Q1 ${currentYear + 1}`, `Q2 ${currentYear + 1}`
]

const emptyKR = () => ({ id: crypto.randomUUID(), title: '', target: 100, unit: '%', current: 0 })
const defaultForm = () => ({
  objective: '',
  emoji: '🎯',
  period: periodOptions[0],
  owner: '',
  keyResults: [emptyKR()]
})
const form = ref(defaultForm())

// ---------- SVG RING ----------
const circumference = 2 * Math.PI * 34 // ~213.6
const circumferenceSm = 2 * Math.PI * 22 // ~138.2

function ringOffset(pct, circ) {
  return circ - (circ * Math.min(pct, 100)) / 100
}

// ---------- COMPUTEDS ----------
const globalScore = computed(() => {
  if (!okrs.value.length) return 0
  return Math.round(okrs.value.reduce((a, o) => a + okrScore(o), 0) / okrs.value.length)
})

const globalRingOffset = computed(() => ringOffset(globalScore.value, circumference))

const ownerOptions = computed(() => {
  const owners = new Set()
  okrs.value.forEach(o => { if (o.owner) owners.add(o.owner) })
  return [...owners].sort()
})

const filteredOkrs = computed(() => {
  return okrs.value.filter(o => {
    if (filterPeriod.value && o.period !== filterPeriod.value) return false
    if (filterOwner.value && o.owner !== filterOwner.value) return false
    if (filterStatus.value) {
      const s = okrStatus(o)
      if (s !== filterStatus.value) return false
    }
    return true
  })
})

const allKRs = computed(() => filteredOkrs.value.flatMap(o => o.keyResults || []))
const statsOnTrack = computed(() => allKRs.value.filter(kr => krPct(kr) >= 70).length)
const statsAtRisk = computed(() => allKRs.value.filter(kr => krPct(kr) >= 40 && krPct(kr) < 70).length)
const statsBehind = computed(() => allKRs.value.filter(kr => krPct(kr) < 40).length)

const bestOkr = computed(() => {
  if (!filteredOkrs.value.length) return null
  return filteredOkrs.value.reduce((best, o) => okrScore(o) > okrScore(best) ? o : best, filteredOkrs.value[0])
})

// ---------- HELPERS ----------
function krPct(kr) { return kr.target ? Math.min(Math.round((kr.current / kr.target) * 100), 100) : 0 }
function okrScore(okr) {
  if (!okr.keyResults?.length) return 0
  return Math.round(okr.keyResults.reduce((a, kr) => a + krPct(kr), 0) / okr.keyResults.length)
}
function okrStatus(okr) {
  const s = okrScore(okr)
  return s >= 70 ? 'ontrack' : s >= 40 ? 'atrisk' : 'behind'
}
function okrColor(pct) { return pct >= 70 ? '#34A853' : pct >= 40 ? '#FBBC05' : '#EA4335' }
function okrGrad(pct) { return pct >= 70 ? 'linear-gradient(90deg,#34A853,#4CAF50)' : pct >= 40 ? 'linear-gradient(90deg,#FBBC05,#FF9800)' : 'linear-gradient(90deg,#EA4335,#F44336)' }

function trendArrow(kr) {
  const pct = krPct(kr)
  return pct >= 70 ? '↑' : pct >= 40 ? '→' : '↓'
}
function trendLabel(kr) {
  const pct = krPct(kr)
  return pct >= 70 ? 'On track' : pct >= 40 ? 'At risk' : 'Behind'
}

// ---------- API ----------
async function fetchOkrs() {
  loading.value = true
  try {
    const { data } = await api.get('/modules/okrs')
    okrs.value = Array.isArray(data) ? data : (data.results || data.data || [])
  } catch (e) {
    console.error('OKR fetch error:', e)
  } finally {
    loading.value = false
  }
}

async function saveOkr() {
  saving.value = true
  try {
    const payload = {
      objective: form.value.objective,
      emoji: form.value.emoji,
      period: form.value.period,
      owner: form.value.owner,
      keyResults: form.value.keyResults.filter(kr => kr.title.trim())
    }
    if (editingOkr.value) {
      const { data } = await api.put(`/modules/okrs/${editingOkr.value.id}`, payload)
      const idx = okrs.value.findIndex(o => o.id === editingOkr.value.id)
      if (idx !== -1) okrs.value[idx] = data
    } else {
      const { data } = await api.post('/modules/okrs', payload)
      okrs.value.push(data)
    }
    closeModal()
  } catch (e) {
    console.error('OKR save error:', e)
  } finally {
    saving.value = false
  }
}

let krDebounceTimers = {}
function onKRCurrentChange(okrId, krId, event) {
  const val = Number(event.target.value)
  // Update local immediately
  const okr = okrs.value.find(o => o.id === okrId)
  if (okr) {
    const kr = okr.keyResults.find(k => k.id === krId)
    if (kr) kr.current = val
  }
  // Debounced API call
  const key = `${okrId}_${krId}`
  clearTimeout(krDebounceTimers[key])
  krDebounceTimers[key] = setTimeout(async () => {
    try {
      await api.put(`/modules/okrs/${okrId}/kr/${krId}`, { current: val })
    } catch (e) {
      console.error('KR update error:', e)
    }
  }, 600)
}

async function doDelete() {
  if (!deletingOkr.value) return
  try {
    await api.delete(`/modules/okrs/${deletingOkr.value.id}`)
    okrs.value = okrs.value.filter(o => o.id !== deletingOkr.value.id)
  } catch (e) {
    console.error('OKR delete error:', e)
  }
  deletingOkr.value = null
}

// ---------- MODAL ----------
function openCreateModal() {
  editingOkr.value = null
  form.value = defaultForm()
  showModal.value = true
}
function openEditModal(okr) {
  editingOkr.value = okr
  form.value = {
    objective: okr.objective,
    emoji: okr.emoji || '🎯',
    period: okr.period || periodOptions[0],
    owner: okr.owner || '',
    keyResults: (okr.keyResults || []).map(kr => ({ ...kr }))
  }
  if (!form.value.keyResults.length) form.value.keyResults.push(emptyKR())
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  editingOkr.value = null
}
function confirmDelete(okr) {
  deletingOkr.value = okr
}
function addKR() {
  form.value.keyResults.push(emptyKR())
}
function removeKR(idx) {
  form.value.keyResults.splice(idx, 1)
}

// ---------- EXPORT ----------
function copyOkrSummary(okr) {
  const lines = [
    `${okr.emoji || '🎯'} ${okr.objective}`,
    `${okr.period} — ${okr.owner || ''}`,
    `Score: ${okrScore(okr)}%`,
    '',
    ...(okr.keyResults || []).map(kr => `• ${kr.title}: ${kr.current}/${kr.target} ${kr.unit || ''} (${krPct(kr)}%)`)
  ]
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    copiedId.value = okr.id
    setTimeout(() => { copiedId.value = null }, 2000)
  })
}

async function printOkr(okr) {
  printingOkr.value = okr
  await nextTick()
  window.print()
  printingOkr.value = null
}

async function exportPPT(okr) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'

  // Slide 1: Title
  const slide1 = pptx.addSlide()
  slide1.addText(`${okr.emoji || '🎯'} ${okr.objective}`, { x: 0.5, y: 1.5, w: 9, fontSize: 28, bold: true, color: '1e3a5f' })
  slide1.addText(`${okr.period || ''} — ${okr.owner || ''}`, { x: 0.5, y: 2.3, w: 9, fontSize: 16, color: '666666' })
  const score = okrScore(okr)
  const scoreColor = score >= 70 ? '16a34a' : score >= 40 ? 'd97706' : 'dc2626'
  slide1.addText(`${score}%`, { x: 7, y: 0.5, w: 2.5, h: 1, fontSize: 48, bold: true, color: scoreColor, align: 'center' })
  slide1.addText('Score global', { x: 7, y: 1.3, w: 2.5, fontSize: 12, color: '999999', align: 'center' })

  // Slide 2: Key Results
  const slide2 = pptx.addSlide()
  slide2.addText('Résultats clés', { x: 0.5, y: 0.3, w: 9, fontSize: 22, bold: true, color: '1e3a5f' })

  const krs = okr.keyResults || []
  krs.forEach((kr, i) => {
    const y = 1 + i * 0.9
    const pct = kr.target ? Math.min(Math.round((kr.current / kr.target) * 100), 100) : 0
    const krColor = pct >= 70 ? '16a34a' : pct >= 40 ? 'd97706' : 'dc2626'

    slide2.addText(kr.title || '', { x: 0.5, y, w: 5, fontSize: 14, color: '333333' })
    slide2.addText(`${kr.current || 0} / ${kr.target || 0} ${kr.unit || ''}`, { x: 5.5, y, w: 2, fontSize: 14, color: '666666', align: 'right' })
    slide2.addText(`${pct}%`, { x: 8, y, w: 1.5, fontSize: 16, bold: true, color: krColor, align: 'center' })

    // Progress bar background
    slide2.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: y + 0.4, w: 9, h: 0.15, fill: { color: 'E8EAED' }, rectRadius: 0.05 })
    // Progress bar fill
    if (pct > 0) {
      slide2.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: y + 0.4, w: 9 * pct / 100, h: 0.15, fill: { color: krColor }, rectRadius: 0.05 })
    }
  })

  // Footer on both slides
  ;[slide1, slide2].forEach(s => {
    s.addText('Généré par Scalyo', { x: 0.5, y: 5.1, w: 9, fontSize: 10, color: 'BBBBBB', align: 'center' })
  })

  const filename = (okr.objective || 'OKR').replace(/[^a-zA-Z0-9à-üÀ-Ü ]/g, '').slice(0, 40)
  await pptx.writeFile({ fileName: `${filename}.pptx` })
}

// ---------- LIFECYCLE ----------
onMounted(() => {
  fetchOkrs()
})
</script>

<style scoped>
/* ---------- FILTERS ---------- */
.okr-filters {
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
}
.okr-select {
  padding: 8px 12px; border: 1px solid #DADCE0; border-radius: 8px; font-size: 13px;
  background: #fff; color: #202124; cursor: pointer; outline: none;
}
.okr-select:focus { border-color: #1A73E8; }
.okr-select-full { width: 100%; }

/* ---------- HERO RIGHT ---------- */
.okr-hero-right { display: flex; align-items: center; gap: 16px; }

/* ---------- PROGRESS RINGS ---------- */
.okr-global-ring-wrap { position: relative; width: 80px; height: 80px; }
.okr-ring { width: 80px; height: 80px; }
.okr-ring-progress { transition: stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke 0.6s ease; }
.okr-ring-label {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  font-size: 16px; font-weight: 900;
}
.okr-card-ring-wrap { position: relative; width: 52px; height: 52px; flex-shrink: 0; }
.okr-ring-sm { width: 52px; height: 52px; }
.okr-ring-sm-label {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  font-size: 11px; font-weight: 800;
}
.okr-celebration {
  position: absolute; top: -6px; right: -6px; font-size: 16px;
  animation: okr-bounce 0.8s ease infinite alternate;
}
@keyframes okr-bounce {
  0% { transform: scale(1); }
  100% { transform: scale(1.3); }
}

/* ---------- GRID ---------- */
.okr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.okr-card { padding: 24px; transition: transform 0.2s, box-shadow 0.2s; }
.okr-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.okr-card-complete { border: 2px solid #34A853; animation: okr-pulse 2s ease-in-out 1; }
@keyframes okr-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(52,168,83,0.3); }
  50% { box-shadow: 0 0 0 12px rgba(52,168,83,0); }
}

/* ---------- OBJ HEADER ---------- */
.okr-obj-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.okr-emoji { font-size: 28px; flex-shrink: 0; }
.okr-obj-title { font-size: 16px; font-weight: 800; color: #202124; margin: 0 0 4px; }
.okr-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.okr-badge {
  display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;
}
.okr-badge-period { background: #E8F0FE; color: #1A73E8; }
.okr-badge-owner { background: #FEF7E0; color: #E37400; }

/* ---------- KEY RESULTS ---------- */
.okr-kr { margin-bottom: 14px; }
.okr-kr-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.okr-kr-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.okr-kr-title { font-size: 13px; font-weight: 600; color: #202124; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.okr-kr-trend { font-size: 14px; flex-shrink: 0; }
.okr-kr-nums { font-size: 12px; font-weight: 700; color: #5F6368; display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.okr-kr-input {
  width: 48px; padding: 2px 4px; border: 1px solid transparent; border-radius: 4px;
  font-size: 12px; font-weight: 700; color: #202124; text-align: right;
  background: transparent; outline: none; -moz-appearance: textfield;
}
.okr-kr-input::-webkit-inner-spin-button,
.okr-kr-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.okr-kr-input:hover { border-color: #DADCE0; background: #F8F9FA; }
.okr-kr-input:focus { border-color: #1A73E8; background: #fff; }
.okr-kr-separator { margin: 0 1px; color: #5F6368; }

/* ---------- CARD ACTIONS ---------- */
.okr-card-actions { display: flex; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #F1F3F4; flex-wrap: wrap; }
.okr-btn-sm {
  padding: 5px 12px; border: 1px solid #DADCE0; border-radius: 6px; font-size: 12px;
  font-weight: 600; background: #fff; color: #5F6368; cursor: pointer; transition: all 0.15s;
}
.okr-btn-sm:hover { background: #F1F3F4; color: #202124; }
.okr-btn-danger { color: #EA4335; border-color: #EA4335; }
.okr-btn-danger:hover { background: #FDE7E7; }

/* ---------- BUTTONS ---------- */
.okr-btn-primary {
  padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 700;
  background: #1A73E8; color: #fff; cursor: pointer; transition: background 0.15s;
}
.okr-btn-primary:hover { background: #1557B0; }
.okr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.okr-btn-secondary {
  padding: 10px 20px; border: 1px solid #DADCE0; border-radius: 8px; font-size: 14px;
  font-weight: 600; background: #fff; color: #5F6368; cursor: pointer;
}
.okr-btn-secondary:hover { background: #F1F3F4; }
.okr-btn-danger-full {
  padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 700;
  background: #EA4335; color: #fff; cursor: pointer;
}
.okr-btn-danger-full:hover { background: #C5221F; }

/* ---------- MODAL ---------- */
.okr-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex;
  align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.okr-modal {
  background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 580px;
  max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.okr-modal-sm { max-width: 360px; }
.okr-modal-title { font-size: 20px; font-weight: 800; color: #202124; margin: 0 0 20px; }
.okr-label { display: block; font-size: 12px; font-weight: 700; color: #5F6368; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.okr-input {
  width: 100%; padding: 10px 12px; border: 1px solid #DADCE0; border-radius: 8px;
  font-size: 14px; color: #202124; outline: none; box-sizing: border-box;
}
.okr-input:focus { border-color: #1A73E8; }
.okr-input-flex { flex: 1; min-width: 0; }
.okr-input-num { width: 70px; flex: none; }
.okr-input-unit { width: 60px; flex: none; }
.okr-modal-row { display: flex; gap: 12px; }
.okr-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }

/* ---------- EMOJI PICKER ---------- */
.okr-emoji-picker { display: flex; gap: 6px; flex-wrap: wrap; }
.okr-emoji-option {
  font-size: 22px; cursor: pointer; padding: 4px 6px; border-radius: 8px;
  border: 2px solid transparent; transition: all 0.15s;
}
.okr-emoji-option:hover { background: #F1F3F4; }
.okr-emoji-selected { border-color: #1A73E8; background: #E8F0FE; }

/* ---------- KR FORM ROW ---------- */
.okr-kr-form-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.okr-btn-remove {
  width: 28px; height: 28px; border: none; border-radius: 50%; background: #FDE7E7;
  color: #EA4335; font-size: 18px; cursor: pointer; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; line-height: 1;
}
.okr-btn-remove:hover { background: #EA4335; color: #fff; }
.okr-btn-add-kr {
  padding: 6px 14px; border: 1px dashed #DADCE0; border-radius: 8px; background: transparent;
  color: #1A73E8; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 4px;
}
.okr-btn-add-kr:hover { background: #E8F0FE; }

/* ---------- PRINT ---------- */
.okr-print-area { display: none; }
@media print {
  .mod-page > *:not(.okr-print-area) { display: none !important; }
  .okr-print-area { display: block !important; padding: 40px; font-family: system-ui, sans-serif; }
  .okr-print-area h2 { margin: 0 0 8px; }
  .okr-print-area ul { padding-left: 20px; }
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 600px) {
  .okr-grid { grid-template-columns: 1fr; }
  .okr-kr-form-row { flex-wrap: wrap; }
  .okr-modal-row { flex-direction: column; }
}
</style>
