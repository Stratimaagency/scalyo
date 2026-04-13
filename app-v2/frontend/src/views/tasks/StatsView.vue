<template>
  <div class="stats-view">
    <h1>📊 {{ t('sm_stats_title') }}</h1>

    <!-- KPI cards -->
    <div class="st-kpis">
      <div class="stk"><span class="stk-icon">🎯</span><span class="stk-val">{{ velocity }}</span><span class="stk-lbl">{{ t('sm_velocity') }}</span><span class="stk-sub">{{ t('sm_velocity_unit') }}</span></div>
      <div class="stk"><span class="stk-icon">⏱</span><span class="stk-val">{{ estimationAccuracy }}%</span><span class="stk-lbl">{{ t('sm_estimation_acc') }}</span></div>
      <div class="stk warn"><span class="stk-icon">🔴</span><span class="stk-val red">{{ tasks.overdueTasks.length }}</span><span class="stk-lbl">{{ t('sm_overdue') }}</span></div>
      <div class="stk"><span class="stk-icon">✅</span><span class="stk-val green">{{ deliveryRate }}%</span><span class="stk-lbl">{{ t('sm_delivery_rate') }}</span></div>
    </div>

    <!-- Charts row -->
    <div class="st-charts">
      <!-- Donut: by status -->
      <div class="st-card">
        <h3>{{ t('sm_by_status') }}</h3>
        <apexchart type="donut" height="260" :options="donutOpts" :series="donutSeries" />
      </div>

      <!-- Bar: project progress -->
      <div class="st-card">
        <h3>{{ t('sm_project_progress') }}</h3>
        <apexchart type="bar" height="260" :options="barOpts" :series="barSeries" />
      </div>

      <!-- Area: burndown -->
      <div class="st-card">
        <h3>{{ t('sm_burndown') }}</h3>
        <apexchart type="area" height="260" :options="areaOpts" :series="areaSeries" />
      </div>
    </div>

    <!-- Tables row -->
    <div class="st-tables">
      <div class="st-card">
        <h3>{{ t('sm_top_late') }}</h3>
        <div v-if="tasks.overdueTasks.length" class="st-table">
          <div v-for="task in tasks.overdueTasks.slice(0, 5)" :key="task.id" class="stt-row">
            <span class="stt-title">{{ task.title }}</span>
            <span class="stt-delay red">+{{ daysLate(task) }}j</span>
            <span class="stt-assignee">{{ assigneeName(task.assignee) }}</span>
          </div>
        </div>
        <div v-else class="stt-empty">{{ t('sm_no_late') }} 🎉</div>
      </div>

      <div class="st-card">
        <h3>{{ t('sm_estimation_analysis') }}</h3>
        <div class="st-table">
          <div v-for="task in tasksWithHours" :key="task.id" class="stt-row">
            <span class="stt-title">{{ task.title }}</span>
            <span class="stt-hours">{{ task.actualHours || 0 }}h / {{ task.expectedHours || 0 }}h</span>
            <span class="stt-delta" :class="hoursDelta(task) > 0 ? 'red' : 'green'">{{ hoursDelta(task) > 0 ? '+' : '' }}{{ hoursDelta(task) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/tasks'
import { useTeamStore } from '@/stores/team'

const { t } = useI18n({ useScope: 'global' })
const tasks = useTaskStore()
const team = useTeamStore()

// KPIs
const velocity = computed(() => {
  const done = tasks.doneTasks.length
  return done ? (done / 4).toFixed(1) : '0'
})

const estimationAccuracy = computed(() => {
  const withHours = tasks.tasks.filter(t => t.expectedHours && t.actualHours)
  if (!withHours.length) return 0
  const accurate = withHours.filter(t => {
    const ratio = t.actualHours / t.expectedHours
    return ratio >= 0.8 && ratio <= 1.2
  })
  return Math.round((accurate.length / withHours.length) * 100)
})

const deliveryRate = computed(() => {
  const total = tasks.tasks.length
  if (!total) return 0
  const onTime = tasks.tasks.filter(t => t.status === 'done' || t.dueDate >= new Date().toISOString().slice(0, 10))
  return Math.round((onTime.length / total) * 100)
})

// Donut chart
const donutSeries = computed(() => [
  tasks.todoTasks.length,
  tasks.inProgressTasks.length,
  tasks.blockedTasks.length,
  tasks.doneTasks.length,
])

const donutOpts = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
  labels: [t('status_todo'), t('status_in_progress'), t('status_blocked'), t('status_done')],
  colors: ['#9ca3af', '#3b82f6', '#ef4444', '#10b981'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, style: { fontSize: '11px' } },
  plotOptions: { pie: { donut: { size: '55%', labels: { show: true, total: { show: true, label: t('sm_total_tasks'), fontSize: '12px', fontWeight: 600 } } } } },
}))

// Bar chart: project progress
const barSeries = computed(() => [{
  name: t('sm_completion_rate'),
  data: tasks.projects.map(p => {
    const pTasks = tasks.tasks.filter(t => t.projectId === p.id)
    const done = pTasks.filter(t => t.status === 'done').length
    return pTasks.length ? Math.round((done / pTasks.length) * 100) : 0
  }),
}])

const barOpts = computed(() => ({
  chart: { type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '50%' } },
  xaxis: { categories: tasks.projects.map(p => p.name), max: 100 },
  colors: ['#7c3aed'],
  dataLabels: { enabled: true, formatter: (v) => v + '%', style: { fontSize: '11px' } },
  grid: { borderColor: '#f3f4f6' },
}))

// Area chart: burndown mock
const areaSeries = computed(() => [
  { name: t('sm_ideal'), data: [24, 20, 16, 12, 8, 4, 0] },
  { name: t('sm_real'), data: [24, 22, 19, 17, 14, 10, tasks.tasks.filter(t => t.status !== 'done').length] },
])

const areaOpts = computed(() => ({
  chart: { type: 'area', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, sparkline: { enabled: false } },
  stroke: { curve: 'smooth', width: [2, 3] },
  colors: ['#d1d5db', '#7c3aed'],
  fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.05 } },
  xaxis: { categories: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'] },
  yaxis: { min: 0 },
  legend: { position: 'top', fontSize: '11px' },
  grid: { borderColor: '#f3f4f6' },
}))

// Helpers
const tasksWithHours = computed(() => tasks.tasks.filter(t => t.expectedHours > 0).slice(0, 5))

function daysLate(task) {
  const due = new Date(task.dueDate)
  const now = new Date()
  return Math.max(0, Math.round((now - due) / 86400000))
}

function hoursDelta(task) {
  if (!task.expectedHours) return 0
  return Math.round(((task.actualHours || 0) - task.expectedHours) / task.expectedHours * 100)
}

function assigneeName(id) { return team.members.find(m => m.id === id)?.name || '—' }
</script>

<style scoped>
.stats-view { max-width: 1100px; }
.stats-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }

.st-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.stk { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; text-align: center; transition: all 0.2s; }
.stk:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.stk.warn { border-left: 3px solid var(--red); }
.stk-icon { font-size: 1.3rem; display: block; margin-bottom: 6px; }
.stk-val { font-size: 1.8rem; font-weight: 800; display: block; }
.stk-val.green { color: var(--green); }
.stk-val.red { color: var(--red); }
.stk-lbl { font-size: 0.72rem; color: var(--text-secondary); display: block; }
.stk-sub { font-size: 0.65rem; color: var(--text-muted); }

.st-charts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-bottom: 24px; }
.st-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
.st-card h3 { font-size: 0.88rem; font-weight: 700; margin-bottom: 12px; }

.st-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.st-table { display: flex; flex-direction: column; gap: 6px; }
.stt-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--bg); border-radius: 6px; font-size: 0.82rem; }
.stt-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stt-delay { font-weight: 700; font-size: 0.78rem; }
.stt-assignee { font-size: 0.75rem; color: var(--text-muted); min-width: 70px; text-align: right; }
.stt-hours { font-size: 0.78rem; color: var(--text-muted); }
.stt-delta { font-size: 0.78rem; font-weight: 600; min-width: 40px; text-align: right; }
.red { color: var(--red); }
.green { color: var(--green); }
.stt-empty { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem; }

@media (max-width: 1024px) { .st-charts { grid-template-columns: 1fr 1fr; } }
@media (max-width: 768px) { .st-kpis { grid-template-columns: repeat(2, 1fr); } .st-charts, .st-tables { grid-template-columns: 1fr; } }
</style>
