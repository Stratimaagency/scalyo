<template>
  <div class="planning-view">
    <div class="pl-header">
      <h1>📅 {{ t('sm_planning_title') }}</h1>
      <div class="pl-nav">
        <button class="btn-outline btn-sm" @click="shiftWeek(-1)">←</button>
        <span class="pl-range">{{ weekLabel }}</span>
        <button class="btn-outline btn-sm" @click="shiftWeek(1)">→</button>
        <button class="btn-outline btn-sm" @click="weekOffset = 0">{{ t('today') }}</button>
      </div>
      <div class="pl-views">
        <button :class="{ active: view === 'week' }" @click="view = 'week'">{{ t('sm_view_week') }}</button>
        <button :class="{ active: view === 'month' }" @click="view = 'month'">{{ t('sm_view_month') }}</button>
      </div>
    </div>

    <!-- Week view -->
    <div v-if="view === 'week'" class="week-grid">
      <!-- Time column -->
      <div class="time-col">
        <div class="time-header"></div>
        <div v-for="h in hours" :key="h" class="time-slot">{{ h }}:00</div>
      </div>
      <!-- Day columns -->
      <div v-for="day in weekDays" :key="day.date" class="day-col" :class="{ today: day.isToday }">
        <div class="day-header">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-num" :class="{ today: day.isToday }">{{ day.num }}</span>
        </div>
        <div class="day-body">
          <div v-for="task in tasksForDay(day.date)" :key="task.id" class="pl-task" :style="{ borderLeftColor: projectColor(task.projectId) }">
            <strong>{{ task.title }}</strong>
            <span class="pl-task-time">{{ task.dueDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Month view -->
    <div v-else class="month-grid">
      <div class="month-header" v-for="d in ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']" :key="d">{{ d }}</div>
      <div v-for="day in monthDays" :key="day.date" class="month-day" :class="{ today: day.isToday, other: day.otherMonth }">
        <span class="md-num">{{ day.num }}</span>
        <div v-for="task in tasksForDay(day.date)" :key="task.id" class="md-task" :style="{ background: projectColor(task.projectId) + '20', borderLeft: '2px solid ' + projectColor(task.projectId) }">
          {{ task.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/tasks'

const { t, locale } = useI18n({ useScope: 'global' })
const tasks = useTaskStore()

const view = ref('week')
const weekOffset = ref(0)
const hours = Array.from({ length: 13 }, (_, i) => i + 7) // 07-19

function shiftWeek(dir) { weekOffset.value += dir }

const weekStart = computed(() => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1 + weekOffset.value * 7)
  d.setHours(0, 0, 0, 0)
  return d
})

const weekLabel = computed(() => {
  const s = new Date(weekStart.value)
  const e = new Date(s); e.setDate(e.getDate() + 6)
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return s.toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' — ' + e.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' })
})

const dayNames = computed(() => {
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value); d.setDate(d.getDate() + i)
    return d.toLocaleDateString(loc, { weekday: 'short' })
  })
})

const weekDays = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value); d.setDate(d.getDate() + i)
    const date = d.toISOString().slice(0, 10)
    return { date, name: dayNames.value[i], num: d.getDate(), isToday: date === today }
  })
})

const monthDays = computed(() => {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  const first = new Date(y, m, 1)
  const startDay = (first.getDay() || 7) - 1
  const today = now.toISOString().slice(0, 10)
  const days = []
  for (let i = -startDay; i < 42 - startDay; i++) {
    const d = new Date(y, m, 1 + i)
    days.push({ date: d.toISOString().slice(0, 10), num: d.getDate(), isToday: d.toISOString().slice(0, 10) === today, otherMonth: d.getMonth() !== m })
  }
  return days
})

function tasksForDay(date) { return tasks.tasks.filter(t => t.dueDate === date) }
function projectColor(pid) { return tasks.projects.find(p => p.id === pid)?.color || '#7c3aed' }
</script>

<style scoped>
.planning-view { max-width: 1100px; }
.pl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.pl-header h1 { font-size: 1.5rem; font-weight: 800; }
.pl-nav { display: flex; align-items: center; gap: 8px; }
.pl-range { font-size: 0.9rem; font-weight: 600; min-width: 200px; text-align: center; }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }
.btn-sm { padding: 6px 12px; }
.pl-views { display: flex; gap: 2px; background: var(--bg); border-radius: 8px; padding: 2px; }
.pl-views button { background: none; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; color: var(--text-muted); font-weight: 500; }
.pl-views button.active { background: var(--purple); color: #fff; font-weight: 600; }

/* Week grid */
.week-grid { display: grid; grid-template-columns: 60px repeat(7, 1fr); background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.time-col { border-right: 1px solid var(--border-light); }
.time-header { height: 48px; border-bottom: 1px solid var(--border-light); }
.time-slot { height: 48px; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; color: var(--text-muted); border-bottom: 1px solid var(--border-light); }
.day-col { border-right: 1px solid var(--border-light); min-width: 0; }
.day-col:last-child { border-right: none; }
.day-col.today { background: rgba(124,58,237,0.02); }
.day-header { height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-light); }
.day-name { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; }
.day-num { font-size: 0.9rem; font-weight: 700; }
.day-num.today { background: var(--purple); color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.day-body { padding: 4px; min-height: 200px; }
.pl-task { padding: 6px 8px; border-left: 3px solid var(--purple); background: var(--purple-bg); border-radius: 4px; margin-bottom: 4px; font-size: 0.72rem; }
.pl-task strong { display: block; font-size: 0.75rem; }
.pl-task-time { font-size: 0.65rem; color: var(--text-muted); }

/* Month grid */
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.month-header { padding: 10px; text-align: center; font-size: 0.72rem; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-light); background: var(--bg); }
.month-day { min-height: 80px; padding: 6px; border-bottom: 1px solid var(--border-light); border-right: 1px solid var(--border-light); }
.month-day.other { opacity: 0.3; }
.month-day.today { background: rgba(124,58,237,0.03); }
.md-num { font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px; }
.month-day.today .md-num { color: var(--purple); }
.md-task { padding: 2px 6px; border-radius: 3px; font-size: 0.65rem; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 768px) {
  .week-grid { grid-template-columns: 40px repeat(7, 1fr); }
  .time-slot { font-size: 0.6rem; }
  .day-name { font-size: 0.6rem; }
}
</style>
