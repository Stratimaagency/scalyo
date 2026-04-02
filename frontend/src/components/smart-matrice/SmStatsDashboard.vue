<template>
  <div class="sm-stats" v-if="stats">
    <!-- Hero dates -->
    <div class="sm-stats__dates">
      <div class="sm-stats__date-card sm-stats__date-card--best">
        <span class="sm-stats__date-label">🟢 Au mieux</span>
        <span class="sm-stats__date-value">{{ formatDate(stats.dates?.best) }}</span>
        <span class="sm-stats__date-sub" v-if="stats.dates?.best">{{ daysUntil(stats.dates.best) }}</span>
      </div>
      <div class="sm-stats__date-card sm-stats__date-card--probable">
        <span class="sm-stats__date-label">⭐ Probable</span>
        <span class="sm-stats__date-value">{{ formatDate(stats.dates?.probable) }}</span>
        <span class="sm-stats__date-sub" v-if="stats.dates?.probable">{{ daysUntil(stats.dates.probable) }}</span>
      </div>
      <div class="sm-stats__date-card sm-stats__date-card--worst">
        <span class="sm-stats__date-label">🔴 Au pire</span>
        <span class="sm-stats__date-value">{{ formatDate(stats.dates?.worst) }}</span>
        <span class="sm-stats__date-sub" v-if="stats.dates?.worst">{{ daysUntil(stats.dates.worst) }}</span>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="sm-stats__kpi-row">
      <div class="sm-stats__kpi"><span class="sm-stats__kpi-val">{{ stats.task_count || 0 }}</span><span class="sm-stats__kpi-label">Tâches</span></div>
      <div class="sm-stats__kpi"><span class="sm-stats__kpi-val" style="color: var(--sm-ok)">{{ stats.sub_done || 0 }}</span><span class="sm-stats__kpi-label">Terminées</span></div>
      <div class="sm-stats__kpi"><span class="sm-stats__kpi-val" style="color: var(--sm-warn)">{{ stats.by_status?.in_progress || 0 }}</span><span class="sm-stats__kpi-label">En cours</span></div>
      <div class="sm-stats__kpi"><span class="sm-stats__kpi-val" style="color: var(--sm-err)">{{ stats.by_status?.blocked || 0 }}</span><span class="sm-stats__kpi-label">Bloquées</span></div>
      <div class="sm-stats__kpi"><span class="sm-stats__kpi-val" style="color: var(--sm-terra)">{{ stats.progress || 0 }}%</span><span class="sm-stats__kpi-label">Avancement</span></div>
    </div>

    <!-- Progress by group -->
    <div class="sm-stats__section" v-if="stats.by_group?.length">
      <h4 class="sm-stats__section-title">Avancement par phase</h4>
      <div v-for="g in stats.by_group" :key="g.name" class="sm-stats__phase">
        <div class="sm-stats__phase-header">
          <span>{{ g.name }}</span>
          <span class="sm-stats__phase-pct">{{ g.progress }}%</span>
        </div>
        <div class="sm-stats__phase-bar-wrap">
          <div class="sm-stats__phase-bar" :style="{ width: g.progress + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="sm-stats__row">
      <!-- Donut SVG -->
      <div class="sm-stats__donut-wrap">
        <h4 class="sm-stats__section-title">Répartition des tâches</h4>
        <svg class="sm-stats__donut" width="160" height="160" viewBox="0 0 160 160">
          <circle v-for="(seg, i) in donutSegments" :key="i"
            cx="80" cy="80" r="60" fill="none"
            :stroke="seg.color" stroke-width="24"
            :stroke-dasharray="seg.dash" :stroke-dashoffset="seg.offset"
            transform="rotate(-90 80 80)" />
          <text x="80" y="76" text-anchor="middle" class="sm-stats__donut-total">{{ stats.task_count }}</text>
          <text x="80" y="94" text-anchor="middle" class="sm-stats__donut-label">tâches</text>
        </svg>
        <div class="sm-stats__donut-legend">
          <span v-for="(seg, i) in donutSegments" :key="i" class="sm-stats__legend-item">
            <span class="sm-stats__legend-dot" :style="{ background: seg.color }"></span>
            {{ seg.label }}: {{ seg.count }}
          </span>
        </div>
      </div>

      <!-- Velocity curve -->
      <div class="sm-stats__velocity-wrap">
        <h4 class="sm-stats__section-title">Vélocité</h4>
        <svg class="sm-stats__velocity" viewBox="0 0 300 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sm-vel-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon :points="areaPoints" fill="url(#sm-vel-fill)"/>
          <polyline :points="linePoints" fill="none" stroke="url(#sm-cg)" stroke-width="2.5" stroke-linecap="round"/>
          <circle v-for="(pt, i) in velocityPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="var(--sm-terra)"/>
        </svg>
      </div>
    </div>

    <!-- By assignee -->
    <div class="sm-stats__section" v-if="stats.by_assignee?.length">
      <h4 class="sm-stats__section-title">Charge par personne</h4>
      <div v-for="a in stats.by_assignee" :key="a.name" class="sm-stats__assignee">
        <div class="sm-stats__assignee-info">
          <span class="sm-stats__assignee-avatar">{{ (a.name || '?')[0] }}</span>
          <span class="sm-stats__assignee-name">{{ a.name }}</span>
        </div>
        <div class="sm-stats__assignee-bar-wrap">
          <div class="sm-stats__assignee-bar" :style="{ width: (a.total ? Math.round(a.done / a.total * 100) : 0) + '%' }"></div>
        </div>
        <span class="sm-stats__assignee-nums">{{ a.done }}/{{ a.total }}</span>
      </div>
    </div>

    <!-- Global progress -->
    <div class="sm-stats__global">
      <h4 class="sm-stats__section-title">Progression globale</h4>
      <div class="sm-stats__global-bar-wrap">
        <div class="sm-stats__global-bar" :style="{ width: stats.progress + '%' }"></div>
      </div>
      <div class="sm-stats__global-nums">
        <span>{{ stats.sub_done }}/{{ stats.sub_total }} sous-tâches</span>
        <span class="sm-stats__global-pct">{{ stats.progress }}%</span>
      </div>
    </div>

    <!-- Time info -->
    <div class="sm-stats__time" v-if="stats.time">
      <div class="sm-stats__time-item">
        <span class="sm-stats__time-label">Temps estimé restant</span>
        <span class="sm-stats__time-val">{{ stats.time.total_estimated || 0 }}h</span>
      </div>
      <div class="sm-stats__time-item">
        <span class="sm-stats__time-label">Heures effectives/jour</span>
        <span class="sm-stats__time-val">{{ stats.time.effective_hours_day || 8 }}h</span>
      </div>
      <div class="sm-stats__time-item">
        <span class="sm-stats__time-label">Jours restants</span>
        <span class="sm-stats__time-val">{{ stats.dates?.remaining_days || '—' }}j</span>
      </div>
      <div class="sm-stats__time-item" v-if="stats.time.paused_count">
        <span class="sm-stats__time-label">En pause</span>
        <span class="sm-stats__time-val" style="color: var(--sm-info)">{{ stats.time.paused_count }}</span>
      </div>
    </div>
  </div>

  <div v-else class="sm-stats__empty">
    <p style="font-size: 40px; margin-bottom: 12px;">📊</p>
    <p style="font-weight: 700;">Sélectionnez un projet pour voir les statistiques</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null },
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(d) {
  if (!d) return ''
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000)
  if (diff < 0) return `il y a ${-diff}j`
  if (diff === 0) return "aujourd'hui"
  return `dans ${diff}j`
}

const statusColors = {
  todo: { color: '#3b82f6', label: 'À faire' },
  in_progress: { color: '#f43f5e', label: 'En cours' },
  blocked: { color: '#2563eb', label: 'Bloqué' },
  done: { color: '#16a34a', label: 'Terminé' },
}

const donutSegments = computed(() => {
  const bs = props.stats?.by_status || {}
  const total = Object.values(bs).reduce((a, b) => a + b, 0) || 1
  const circ = 2 * Math.PI * 60
  let offset = 0
  const segs = []
  for (const [status, count] of Object.entries(bs)) {
    const pct = count / total
    const dash = pct * circ
    segs.push({ color: statusColors[status]?.color || '#ccc', label: statusColors[status]?.label || status, count, dash: `${dash} ${circ - dash}`, offset: -offset })
    offset += dash
  }
  return segs
})

const velocityPoints = computed(() => {
  const progress = props.stats?.progress || 0
  return [10, 15, 22, 30, 45, 55, 60, progress].map((v, i, arr) => ({
    x: (i / (arr.length - 1)) * 280 + 10,
    y: 110 - (v / 100) * 100,
  }))
})
const linePoints = computed(() => velocityPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const areaPoints = computed(() => {
  const pts = velocityPoints.value
  if (!pts.length) return ''
  return `${pts[0].x},110 ` + pts.map(p => `${p.x},${p.y}`).join(' ') + ` ${pts[pts.length - 1].x},110`
})
</script>

<style scoped>
.sm-stats { font-family: 'DM Sans', sans-serif; }
.sm-stats__empty { text-align: center; padding: 40px; color: var(--sm-t3); }
.sm-stats__dates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.sm-stats__date-card { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: var(--sm-r); padding: 16px; text-align: center; }
.sm-stats__date-card--probable { border-color: var(--sm-terra); background: rgba(244,63,94,.04); }
.sm-stats__date-label { display: block; font-size: 11px; color: var(--sm-t3); margin-bottom: 4px; font-weight: 600; }
.sm-stats__date-value { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 18px; color: var(--sm-t1); display: block; }
.sm-stats__date-sub { font-size: 11px; color: var(--sm-t3); display: block; margin-top: 2px; }

.sm-stats__kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
.sm-stats__kpi { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 10px; padding: 12px; text-align: center; }
.sm-stats__kpi-val { display: block; font-size: 24px; font-weight: 800; color: var(--sm-t1); letter-spacing: -.5px; }
.sm-stats__kpi-label { display: block; font-size: 10px; color: var(--sm-t3); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

.sm-stats__section { margin-bottom: 20px; }
.sm-stats__section-title { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 16px; color: var(--sm-t1); margin: 0 0 12px; }
.sm-stats__phase { margin-bottom: 10px; }
.sm-stats__phase-header { display: flex; justify-content: space-between; font-size: 13px; color: var(--sm-t2); margin-bottom: 4px; }
.sm-stats__phase-pct { font-weight: 600; color: var(--sm-terra); }
.sm-stats__phase-bar-wrap { height: 6px; background: var(--sm-bd); border-radius: 3px; overflow: hidden; }
.sm-stats__phase-bar { height: 100%; background: var(--sm-grad-h); border-radius: 3px; transition: width .4s; }
.sm-stats__row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
@media (max-width: 700px) { .sm-stats__row { grid-template-columns: 1fr; } }
.sm-stats__donut-wrap { text-align: center; }
.sm-stats__donut { display: block; margin: 0 auto 12px; }
.sm-stats__donut-total { font-size: 28px; font-weight: 900; fill: var(--sm-t1); }
.sm-stats__donut-label { font-size: 12px; fill: var(--sm-t3); }
.sm-stats__donut-legend { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.sm-stats__legend-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--sm-t2); }
.sm-stats__legend-dot { width: 10px; height: 10px; border-radius: 3px; }
.sm-stats__velocity-wrap { min-height: 120px; }
.sm-stats__velocity { width: 100%; height: 120px; }

/* Assignee section */
.sm-stats__assignee { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.sm-stats__assignee-info { display: flex; align-items: center; gap: 8px; min-width: 120px; }
.sm-stats__assignee-avatar { width: 26px; height: 26px; border-radius: 8px; background: var(--sm-grad); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
.sm-stats__assignee-name { font-size: 12px; font-weight: 600; color: var(--sm-t1); }
.sm-stats__assignee-bar-wrap { flex: 1; height: 6px; background: var(--sm-bd); border-radius: 3px; overflow: hidden; }
.sm-stats__assignee-bar { height: 100%; background: var(--sm-grad-h); border-radius: 3px; transition: width .4s; }
.sm-stats__assignee-nums { font-size: 11px; font-weight: 700; color: var(--sm-t2); min-width: 40px; text-align: right; }

.sm-stats__global { margin-bottom: 20px; }
.sm-stats__global-bar-wrap { height: 10px; background: var(--sm-bd); border-radius: 5px; overflow: hidden; }
.sm-stats__global-bar { height: 100%; background: var(--sm-grad-h); border-radius: 5px; transition: width .4s; }
.sm-stats__global-nums { display: flex; justify-content: space-between; font-size: 12px; color: var(--sm-t3); margin-top: 4px; }
.sm-stats__global-pct { font-weight: 800; color: var(--sm-terra); }

.sm-stats__time { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.sm-stats__time-item { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 10px; padding: 12px; }
.sm-stats__time-label { display: block; font-size: 10px; color: var(--sm-t3); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.sm-stats__time-val { font-size: 20px; font-weight: 800; color: var(--sm-t1); }
</style>
