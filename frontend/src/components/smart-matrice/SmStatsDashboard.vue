<template>
  <div class="sm-stats" v-if="stats">
    <!-- Profile switcher -->
    <div class="sm-stats__switcher">
      <button v-for="v in views" :key="v.key" class="sm-stats__switch-btn"
        :class="{ 'sm-stats__switch-btn--active': currentView === v.key }"
        @click="currentView = v.key">{{ v.label }}</button>
    </div>

    <!-- Hero dates -->
    <div class="sm-stats__dates">
      <div class="sm-stats__date-card sm-stats__date-card--best">
        <span class="sm-stats__date-label">🟢 Au mieux</span>
        <span class="sm-stats__date-value">{{ formatDate(stats.dates?.best) }}</span>
      </div>
      <div class="sm-stats__date-card sm-stats__date-card--probable">
        <span class="sm-stats__date-label">🟡 Probable</span>
        <span class="sm-stats__date-value">{{ formatDate(stats.dates?.probable) }}</span>
      </div>
      <div class="sm-stats__date-card sm-stats__date-card--worst">
        <span class="sm-stats__date-label">🔴 Au pire</span>
        <span class="sm-stats__date-value">{{ formatDate(stats.dates?.worst) }}</span>
      </div>
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

    <!-- Donut SVG -->
    <div class="sm-stats__row">
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
              <stop offset="0%" stop-color="#e8603a" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#e8603a" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon :points="areaPoints" fill="url(#sm-vel-fill)"/>
          <polyline :points="linePoints" fill="none" stroke="url(#sm-cg)" stroke-width="2.5" stroke-linecap="round"/>
          <circle v-for="(pt, i) in velocityPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="var(--sm-terra)"/>
        </svg>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null },
})

const views = [
  { key: 'ceo', label: '👔 Vue CEO' },
  { key: 'manager', label: '📊 Vue Manager' },
]
const currentView = ref('manager')

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const statusColors = {
  todo: { color: '#9b5acd', label: 'À faire' },
  in_progress: { color: '#e8603a', label: 'En cours' },
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
    segs.push({
      color: statusColors[status]?.color || '#ccc',
      label: statusColors[status]?.label || status,
      count,
      dash: `${dash} ${circ - dash}`,
      offset: -offset,
    })
    offset += dash
  }
  return segs
})

// Simulated velocity data (would come from historical data)
const velocityPoints = computed(() => {
  const progress = props.stats?.progress || 0
  const points = [10, 15, 22, 30, 45, 55, 60, progress].map((v, i, arr) => ({
    x: (i / (arr.length - 1)) * 280 + 10,
    y: 110 - (v / 100) * 100,
  }))
  return points
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
.sm-stats__switcher { display: flex; gap: 4px; margin-bottom: 20px; }
.sm-stats__switch-btn {
  border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px;
  padding: 6px 14px; font-size: 13px; font-weight: 500; color: var(--sm-t2);
  cursor: pointer; font-family: 'DM Sans', sans-serif;
}
.sm-stats__switch-btn--active { background: var(--sm-grad); color: white; border-color: transparent; }
.sm-stats__dates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.sm-stats__date-card {
  background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: var(--sm-r);
  padding: 14px; text-align: center;
}
.sm-stats__date-label { display: block; font-size: 12px; color: var(--sm-t3); margin-bottom: 4px; }
.sm-stats__date-value {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 18px; color: var(--sm-t1);
}
.sm-stats__section { margin-bottom: 24px; }
.sm-stats__section-title {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 16px;
  color: var(--sm-t1); margin: 0 0 12px;
}
.sm-stats__phase { margin-bottom: 10px; }
.sm-stats__phase-header { display: flex; justify-content: space-between; font-size: 13px; color: var(--sm-t2); margin-bottom: 4px; }
.sm-stats__phase-pct { font-weight: 600; color: var(--sm-terra); }
.sm-stats__phase-bar-wrap { height: 6px; background: var(--sm-bd); border-radius: 3px; overflow: hidden; }
.sm-stats__phase-bar { height: 100%; background: var(--sm-grad-h); border-radius: 3px; transition: width .4s; }
.sm-stats__row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
@media (max-width: 700px) { .sm-stats__row { grid-template-columns: 1fr; } }
.sm-stats__donut-wrap { text-align: center; }
.sm-stats__donut { display: block; margin: 0 auto 12px; }
.sm-stats__donut-total { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; fill: var(--sm-t1); }
.sm-stats__donut-label { font-size: 11px; fill: var(--sm-t3); }
.sm-stats__donut-legend { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.sm-stats__legend-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--sm-t2); }
.sm-stats__legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.sm-stats__velocity-wrap {}
.sm-stats__velocity { width: 100%; height: 120px; }
.sm-stats__global { margin-top: 8px; }
.sm-stats__global-bar-wrap { height: 8px; background: var(--sm-bd); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
.sm-stats__global-bar { height: 100%; background: var(--sm-grad-h); border-radius: 4px; transition: width .4s; }
.sm-stats__global-nums { display: flex; justify-content: space-between; font-size: 12px; color: var(--sm-t3); }
.sm-stats__global-pct { font-weight: 700; color: var(--sm-terra); }
</style>
