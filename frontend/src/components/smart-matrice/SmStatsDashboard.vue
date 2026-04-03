<template>
  <div class="sms" v-if="stats">

    <!-- Toolbar: filters + widget toggles -->
    <div class="sms-toolbar">
      <div class="sms-toolbar__filters">
        <button class="sms-toolbar__btn" :class="{ 'sms-toolbar__btn--active': !activeFilter }" @click="activeFilter = null">Tout</button>
        <button class="sms-toolbar__btn" :class="{ 'sms-toolbar__btn--active': activeFilter === 'done' }" @click="toggleFilter('done')" style="--f-color:#16a34a">✅ Terminées</button>
        <button class="sms-toolbar__btn" :class="{ 'sms-toolbar__btn--active': activeFilter === 'in_progress' }" @click="toggleFilter('in_progress')" style="--f-color:#f43f5e">⚡ En cours</button>
        <button class="sms-toolbar__btn" :class="{ 'sms-toolbar__btn--active': activeFilter === 'blocked' }" @click="toggleFilter('blocked')" style="--f-color:#2563eb">⏸ Bloquées</button>
        <button class="sms-toolbar__btn" :class="{ 'sms-toolbar__btn--active': activeFilter === 'todo' }" @click="toggleFilter('todo')" style="--f-color:#94a3b8">📋 À faire</button>
      </div>
      <div class="sms-toolbar__toggles">
        <button v-for="w in widgets" :key="w.key" class="sms-toolbar__toggle" :class="{ 'sms-toolbar__toggle--off': !visibleWidgets[w.key] }" @click="visibleWidgets[w.key] = !visibleWidgets[w.key]" :title="w.label">{{ w.icon }}</button>
      </div>
    </div>

    <!-- Filtered task list (shown when a KPI filter is active) -->
    <div v-if="activeFilter" class="sms-filtered">
      <div class="sms-filtered__head">
        <h4>{{ filterLabel }} ({{ filteredTasks.length }})</h4>
        <button class="sms-filtered__close" @click="activeFilter = null">✕ Fermer</button>
      </div>
      <div v-if="filteredTasks.length" class="sms-filtered__list">
        <div v-for="t in filteredTasks" :key="t.id" class="sms-filtered__item">
          <span class="sms-filtered__dot" :style="{ background: statusColors[t.status]?.color || '#ccc' }"></span>
          <span class="sms-filtered__name">{{ t.name }}</span>
          <span class="sms-filtered__group" v-if="t.group_name">{{ t.group_name }}</span>
          <span class="sms-filtered__assignee" v-if="t.referent_name">{{ t.referent_name }}</span>
        </div>
      </div>
      <div v-else class="sms-filtered__empty">Aucune tâche</div>
    </div>

    <!-- Row 1: Prediction hero + Progress -->
    <div class="sms-hero" v-if="visibleWidgets.hero">
      <div class="sms-hero__left">
        <div class="sms-hero__label">Date de fin estimée</div>
        <div class="sms-hero__date">{{ formatDate(stats.dates?.probable) }}</div>
        <div class="sms-hero__sub">{{ daysUntil(stats.dates?.probable) }}</div>
      </div>
      <div class="sms-hero__progress">
        <svg viewBox="0 0 120 120" class="sms-hero__ring">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="10"/>
          <circle cx="60" cy="60" r="50" fill="none" :stroke="progressColor" stroke-width="10"
            stroke-linecap="round" :stroke-dasharray="314" :stroke-dashoffset="314 - (stats.progress || 0) / 100 * 314"
            transform="rotate(-90 60 60)"/>
          <text x="60" y="56" text-anchor="middle" class="sms-hero__ring-val">{{ stats.progress || 0 }}%</text>
          <text x="60" y="72" text-anchor="middle" class="sms-hero__ring-label">avancement</text>
        </svg>
      </div>
      <div class="sms-hero__dates">
        <div class="sms-hero__date-item sms-hero__date-item--best">
          <span class="sms-hero__date-dot" style="background:#16a34a"></span>
          <div><div class="sms-hero__date-lbl">Au mieux</div><div class="sms-hero__date-val">{{ formatDateShort(stats.dates?.best) }}</div></div>
        </div>
        <div class="sms-hero__date-item sms-hero__date-item--worst">
          <span class="sms-hero__date-dot" style="background:#dc2626"></span>
          <div><div class="sms-hero__date-lbl">Au pire</div><div class="sms-hero__date-val">{{ formatDateShort(stats.dates?.worst) }}</div></div>
        </div>
        <div class="sms-hero__date-item" v-if="stats.dates?.target">
          <span class="sms-hero__date-dot" style="background:#3b82f6"></span>
          <div><div class="sms-hero__date-lbl">Cible</div><div class="sms-hero__date-val">{{ formatDateShort(stats.dates.target) }}</div></div>
        </div>
      </div>
    </div>

    <!-- Row 2: KPI Cards (clickable to filter) -->
    <div class="sms-kpis" v-if="visibleWidgets.kpis">
      <div class="sms-kpi" @click="activeFilter = null" :class="{ 'sms-kpi--active': !activeFilter }" style="cursor:pointer">
        <div class="sms-kpi__icon" style="background:rgba(59,130,246,.1);color:#3b82f6">📋</div>
        <div class="sms-kpi__data">
          <div class="sms-kpi__val">{{ stats.task_count || 0 }}</div>
          <div class="sms-kpi__label">Tâches totales</div>
        </div>
      </div>
      <div class="sms-kpi" @click="toggleFilter('done')" :class="{ 'sms-kpi--active': activeFilter === 'done' }" style="cursor:pointer">
        <div class="sms-kpi__icon" style="background:rgba(22,163,74,.1);color:#16a34a">✅</div>
        <div class="sms-kpi__data">
          <div class="sms-kpi__val" style="color:#16a34a">{{ stats.by_status?.done || 0 }}</div>
          <div class="sms-kpi__label">Terminées</div>
        </div>
        <div class="sms-kpi__pct" v-if="stats.task_count">{{ Math.round((stats.by_status?.done || 0) / stats.task_count * 100) }}%</div>
      </div>
      <div class="sms-kpi" @click="toggleFilter('in_progress')" :class="{ 'sms-kpi--active': activeFilter === 'in_progress' }" style="cursor:pointer">
        <div class="sms-kpi__icon" style="background:rgba(244,63,94,.1);color:#f43f5e">⚡</div>
        <div class="sms-kpi__data">
          <div class="sms-kpi__val" style="color:#f43f5e">{{ stats.by_status?.in_progress || 0 }}</div>
          <div class="sms-kpi__label">En cours</div>
        </div>
      </div>
      <div class="sms-kpi" @click="toggleFilter('blocked')" :class="{ 'sms-kpi--active': activeFilter === 'blocked' }" style="cursor:pointer">
        <div class="sms-kpi__icon" style="background:rgba(37,99,235,.1);color:#2563eb">⏸</div>
        <div class="sms-kpi__data">
          <div class="sms-kpi__val" style="color:#2563eb">{{ stats.by_status?.blocked || 0 }}</div>
          <div class="sms-kpi__label">Bloquées</div>
        </div>
      </div>
      <div class="sms-kpi" v-if="stats.dates?.remaining_days !== undefined">
        <div class="sms-kpi__icon" style="background:rgba(217,119,6,.1);color:#d97706">⏱</div>
        <div class="sms-kpi__data">
          <div class="sms-kpi__val" style="color:#d97706">{{ stats.dates.remaining_days }}j</div>
          <div class="sms-kpi__label">Jours restants</div>
        </div>
      </div>
    </div>

    <!-- Row 3: Funnel (progression par phase) + Donut -->
    <div class="sms-row" v-if="visibleWidgets.funnel || visibleWidgets.donut">
      <!-- Funnel: progression par phase -->
      <div class="sms-card" v-if="stats.by_group?.length && visibleWidgets.funnel">
        <h4 class="sms-card__title">Progression par phase</h4>
        <div class="sms-funnel">
          <div v-for="(g, i) in stats.by_group" :key="g.name" class="sms-funnel__step">
            <div class="sms-funnel__step-head">
              <span class="sms-funnel__step-num">{{ i + 1 }}</span>
              <span class="sms-funnel__step-name">{{ g.name }}</span>
              <span class="sms-funnel__step-pct" :style="{ color: g.progress >= 100 ? '#16a34a' : g.progress > 0 ? '#f43f5e' : '#94a3b8' }">{{ g.progress }}%</span>
            </div>
            <div class="sms-funnel__bar">
              <div class="sms-funnel__fill" :style="{ width: g.progress + '%', background: g.progress >= 100 ? '#16a34a' : 'var(--sm-grad-h)' }"></div>
            </div>
            <div class="sms-funnel__meta">{{ g.done }}/{{ g.total }} tâches</div>
          </div>
        </div>
      </div>

      <!-- Donut chart -->
      <div class="sms-card">
        <h4 class="sms-card__title">Répartition</h4>
        <div class="sms-donut-wrap">
          <svg class="sms-donut" width="140" height="140" viewBox="0 0 140 140">
            <circle v-for="(seg, i) in donutSegments" :key="i"
              cx="70" cy="70" r="52" fill="none"
              :stroke="seg.color" stroke-width="20"
              :stroke-dasharray="seg.dash" :stroke-dashoffset="seg.offset"
              transform="rotate(-90 70 70)" />
            <text x="70" y="66" text-anchor="middle" class="sms-donut__total">{{ stats.task_count }}</text>
            <text x="70" y="82" text-anchor="middle" class="sms-donut__label">tâches</text>
          </svg>
          <div class="sms-donut__legend">
            <div v-for="(seg, i) in donutSegments" :key="i" class="sms-donut__legend-item">
              <span class="sms-donut__legend-dot" :style="{ background: seg.color }"></span>
              <span class="sms-donut__legend-name">{{ seg.label }}</span>
              <span class="sms-donut__legend-val">{{ seg.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Velocity + By assignee -->
    <div class="sms-row" v-if="visibleWidgets.velocity || visibleWidgets.assignees">
      <!-- Velocity -->
      <div class="sms-card">
        <h4 class="sms-card__title">Vélocité</h4>
        <svg class="sms-velocity" viewBox="0 0 300 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sms-vel-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon :points="areaPoints" fill="url(#sms-vel-g)"/>
          <polyline :points="linePoints" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
          <circle v-for="(pt, i) in velocityPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="#f43f5e"/>
        </svg>
        <div class="sms-velocity__labels">
          <span v-for="(pt, i) in velocityPoints" :key="i">S{{ i + 1 }}</span>
        </div>
      </div>

      <!-- By assignee -->
      <div class="sms-card" v-if="stats.by_assignee?.length">
        <h4 class="sms-card__title">Charge par personne</h4>
        <div class="sms-assignees">
          <div v-for="a in stats.by_assignee" :key="a.name" class="sms-assignee">
            <div class="sms-assignee__avatar">{{ (a.name || '?')[0] }}</div>
            <div class="sms-assignee__info">
              <div class="sms-assignee__name">{{ a.name }}</div>
              <div class="sms-assignee__bar-wrap">
                <div class="sms-assignee__bar" :style="{ width: (a.total ? Math.round(a.done / a.total * 100) : 0) + '%' }"></div>
              </div>
            </div>
            <div class="sms-assignee__nums">{{ a.done }}/{{ a.total }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 5: Time metrics -->
    <div class="sms-time" v-if="stats.time && visibleWidgets.time">
      <div class="sms-time__item">
        <div class="sms-time__val">{{ stats.time.total_estimated || 0 }}h</div>
        <div class="sms-time__label">Temps restant</div>
      </div>
      <div class="sms-time__item">
        <div class="sms-time__val">{{ stats.time.effective_hours_day || 8 }}h</div>
        <div class="sms-time__label">Heures/jour</div>
      </div>
      <div class="sms-time__item" v-if="stats.time.paused_count">
        <div class="sms-time__val" style="color:#2563eb">{{ stats.time.paused_count }}</div>
        <div class="sms-time__label">En pause</div>
      </div>
      <div class="sms-time__item" v-if="stats.time.waiting_count">
        <div class="sms-time__val" style="color:#d97706">{{ stats.time.waiting_count }}</div>
        <div class="sms-time__label">En attente</div>
      </div>
    </div>
  </div>

  <div v-else class="sms-empty">
    <p style="font-size: 40px; margin-bottom: 12px;">📊</p>
    <p style="font-weight: 700;">Sélectionnez un projet pour voir les statistiques</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null },
  tasks: { type: Array, default: () => [] },
})

// Filters
const activeFilter = ref(null)
function toggleFilter(status) {
  activeFilter.value = activeFilter.value === status ? null : status
}
const filterLabel = computed(() => {
  const labels = { done: 'Terminées', in_progress: 'En cours', blocked: 'Bloquées', todo: 'À faire' }
  return labels[activeFilter.value] || ''
})
const filteredTasks = computed(() => {
  if (!activeFilter.value) return props.tasks
  return props.tasks.filter(t => t.status === activeFilter.value)
})

// Widget visibility
const widgets = [
  { key: 'hero', icon: '📅', label: 'Dates' },
  { key: 'kpis', icon: '📊', label: 'KPIs' },
  { key: 'funnel', icon: '🔄', label: 'Phases' },
  { key: 'donut', icon: '🍩', label: 'Répartition' },
  { key: 'velocity', icon: '📈', label: 'Vélocité' },
  { key: 'assignees', icon: '👥', label: 'Équipe' },
  { key: 'time', icon: '⏱', label: 'Temps' },
]
const visibleWidgets = reactive({ hero: true, kpis: true, funnel: true, donut: true, velocity: true, assignees: true, time: true })

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDateShort(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function daysUntil(d) {
  if (!d) return ''
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000)
  if (diff < 0) return `${-diff}j de retard`
  if (diff === 0) return "aujourd'hui"
  return `dans ${diff} jours`
}

const progressColor = computed(() => {
  const p = props.stats?.progress || 0
  if (p >= 80) return '#16a34a'
  if (p >= 50) return '#f43f5e'
  return '#d97706'
})

const statusColors = {
  todo: { color: '#94a3b8', label: 'À faire' },
  in_progress: { color: '#f43f5e', label: 'En cours' },
  blocked: { color: '#2563eb', label: 'Bloqué' },
  done: { color: '#16a34a', label: 'Terminé' },
}

const donutSegments = computed(() => {
  const bs = props.stats?.by_status || {}
  const total = Object.values(bs).reduce((a, b) => a + b, 0) || 1
  const circ = 2 * Math.PI * 52
  let offset = 0
  const segs = []
  for (const [status, count] of Object.entries(bs)) {
    if (!count) continue
    const pct = count / total
    const dash = pct * circ
    segs.push({ color: statusColors[status]?.color || '#ccc', label: statusColors[status]?.label || status, count, dash: `${dash} ${circ - dash}`, offset: -offset })
    offset += dash
  }
  return segs
})

const velocityPoints = computed(() => {
  const progress = props.stats?.progress || 0
  return [5, 12, 20, 30, 42, 55, 65, progress].map((v, i, arr) => ({
    x: (i / (arr.length - 1)) * 280 + 10,
    y: 90 - (v / 100) * 80,
  }))
})
const linePoints = computed(() => velocityPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const areaPoints = computed(() => {
  const pts = velocityPoints.value
  if (!pts.length) return ''
  return `${pts[0].x},95 ` + pts.map(p => `${p.x},${p.y}`).join(' ') + ` ${pts[pts.length - 1].x},95`
})
</script>

<style scoped>
.sms { font-family: 'DM Sans', sans-serif; }
.sms-empty { text-align: center; padding: 40px; color: var(--sm-t3); }

/* Toolbar */
.sms-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.sms-toolbar__filters { display: flex; gap: 4px; flex-wrap: wrap; }
.sms-toolbar__btn { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: var(--sm-t2); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.sms-toolbar__btn:hover { border-color: var(--sm-terra); }
.sms-toolbar__btn--active { background: var(--sm-grad); color: white; border-color: transparent; }
.sms-toolbar__toggles { display: flex; gap: 3px; }
.sms-toolbar__toggle { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 6px; width: 28px; height: 28px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; transition: all .12s; }
.sms-toolbar__toggle:hover { border-color: var(--sm-terra); }
.sms-toolbar__toggle--off { opacity: .3; }

/* Filtered task list */
.sms-filtered { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 12px; padding: 14px; margin-bottom: 16px; }
.sms-filtered__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sms-filtered__head h4 { font-size: 14px; font-weight: 700; color: var(--sm-t1); margin: 0; }
.sms-filtered__close { border: none; background: none; color: var(--sm-t3); font-size: 12px; cursor: pointer; font-weight: 600; }
.sms-filtered__close:hover { color: var(--sm-terra); }
.sms-filtered__list { display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto; }
.sms-filtered__item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--sm-bd); font-size: 12px; }
.sms-filtered__item:hover { background: var(--sm-bg); }
.sms-filtered__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sms-filtered__name { flex: 1; font-weight: 600; color: var(--sm-t1); }
.sms-filtered__group { font-size: 10px; color: var(--sm-t3); background: var(--sm-bg); padding: 1px 6px; border-radius: 6px; }
.sms-filtered__assignee { font-size: 10px; color: var(--sm-ai); }
.sms-filtered__empty { font-size: 12px; color: var(--sm-t3); text-align: center; padding: 12px; }

/* KPI active state */
.sms-kpi--active { border-color: var(--sm-terra); box-shadow: 0 0 0 2px rgba(244,63,94,.15); }

/* Hero */
.sms-hero { display: flex; align-items: center; gap: 24px; background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.sms-hero__left { flex: 1; }
.sms-hero__label { font-size: 11px; font-weight: 600; color: var(--sm-t3); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.sms-hero__date { font-size: 26px; font-weight: 800; color: var(--sm-t1); letter-spacing: -.5px; }
.sms-hero__sub { font-size: 13px; color: var(--sm-t3); margin-top: 2px; }
.sms-hero__progress { flex-shrink: 0; }
.sms-hero__ring { width: 100px; height: 100px; }
.sms-hero__ring-val { font-size: 22px; font-weight: 900; fill: var(--sm-t1); }
.sms-hero__ring-label { font-size: 10px; fill: var(--sm-t3); }
.sms-hero__dates { display: flex; flex-direction: column; gap: 8px; }
.sms-hero__date-item { display: flex; align-items: center; gap: 8px; }
.sms-hero__date-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sms-hero__date-lbl { font-size: 10px; color: var(--sm-t3); font-weight: 500; }
.sms-hero__date-val { font-size: 13px; font-weight: 700; color: var(--sm-t1); }

/* KPIs */
.sms-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 16px; }
.sms-kpi { display: flex; align-items: center; gap: 10px; background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 12px; padding: 14px; }
.sms-kpi__icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.sms-kpi__data { flex: 1; min-width: 0; }
.sms-kpi__val { font-size: 22px; font-weight: 800; color: var(--sm-t1); line-height: 1; }
.sms-kpi__label { font-size: 10px; color: var(--sm-t3); font-weight: 500; margin-top: 2px; }
.sms-kpi__pct { font-size: 12px; font-weight: 800; color: #16a34a; background: rgba(22,163,74,.08); padding: 2px 6px; border-radius: 6px; }

/* Row grid */
.sms-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
@media (max-width: 700px) { .sms-row { grid-template-columns: 1fr; } }

/* Card */
.sms-card { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 12px; padding: 18px; }
.sms-card__title { font-size: 14px; font-weight: 700; color: var(--sm-t1); margin: 0 0 14px; }

/* Funnel */
.sms-funnel { display: flex; flex-direction: column; gap: 12px; }
.sms-funnel__step-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.sms-funnel__step-num { width: 20px; height: 20px; border-radius: 50%; background: var(--sm-bg); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: var(--sm-t2); flex-shrink: 0; }
.sms-funnel__step-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--sm-t1); }
.sms-funnel__step-pct { font-size: 13px; font-weight: 800; }
.sms-funnel__bar { height: 6px; background: rgba(0,0,0,.04); border-radius: 3px; overflow: hidden; }
.sms-funnel__fill { height: 100%; border-radius: 3px; transition: width .4s; }
.sms-funnel__meta { font-size: 10px; color: var(--sm-t3); margin-top: 2px; }

/* Donut */
.sms-donut-wrap { display: flex; align-items: center; gap: 20px; }
.sms-donut__total { font-size: 26px; font-weight: 900; fill: var(--sm-t1); }
.sms-donut__label { font-size: 11px; fill: var(--sm-t3); }
.sms-donut__legend { display: flex; flex-direction: column; gap: 6px; }
.sms-donut__legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.sms-donut__legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.sms-donut__legend-name { color: var(--sm-t2); flex: 1; }
.sms-donut__legend-val { font-weight: 800; color: var(--sm-t1); }

/* Velocity */
.sms-velocity { width: 100%; height: 100px; }
.sms-velocity__labels { display: flex; justify-content: space-between; font-size: 9px; color: var(--sm-t3); font-weight: 500; padding: 4px 10px 0; }

/* Assignees */
.sms-assignees { display: flex; flex-direction: column; gap: 10px; }
.sms-assignee { display: flex; align-items: center; gap: 10px; }
.sms-assignee__avatar { width: 28px; height: 28px; border-radius: 8px; background: var(--sm-grad); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
.sms-assignee__info { flex: 1; min-width: 0; }
.sms-assignee__name { font-size: 12px; font-weight: 600; color: var(--sm-t1); margin-bottom: 3px; }
.sms-assignee__bar-wrap { height: 5px; background: rgba(0,0,0,.04); border-radius: 3px; overflow: hidden; }
.sms-assignee__bar { height: 100%; background: var(--sm-grad-h); border-radius: 3px; transition: width .4s; }
.sms-assignee__nums { font-size: 11px; font-weight: 700; color: var(--sm-t2); min-width: 35px; text-align: right; }

/* Time */
.sms-time { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.sms-time__item { background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 10px; padding: 14px; text-align: center; }
.sms-time__val { font-size: 22px; font-weight: 800; color: var(--sm-t1); }
.sms-time__label { font-size: 10px; color: var(--sm-t3); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }
</style>
