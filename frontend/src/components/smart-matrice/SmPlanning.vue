<template>
  <div class="smp">
    <!-- Top bar: view switcher + filters + nav + export -->
    <div class="smp-top">
      <div class="smp-top__left">
        <!-- View switcher -->
        <div class="smp-views">
          <button class="smp-views__btn" :class="{ 'smp-views__btn--on': view === 'calendar' }" @click="view = 'calendar'">📅 {{ t('plCalendarView') }}</button>
          <button class="smp-views__btn" :class="{ 'smp-views__btn--on': view === 'gantt' }" @click="view = 'gantt'">📊 {{ t('plGanttView') }}</button>
        </div>
        <!-- Filters -->
        <div class="smp-filters">
          <select v-model="filterStatus" class="smp-filter">
            <option value="">{{ t('stAllFilter') }}</option>
            <option value="todo">{{ t('statusTodo') }}</option>
            <option value="in_progress">{{ t('statusInProgress') }}</option>
            <option value="blocked">{{ t('statusBlocked') }}</option>
            <option value="done">{{ t('statusDone') }}</option>
          </select>
          <select v-if="groups.length > 1" v-model="filterGroup" class="smp-filter">
            <option value="">{{ t('stAllFilter') }}</option>
            <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
      </div>
      <div class="smp-top__right">
        <!-- Calendar nav (only in calendar view) -->
        <template v-if="view === 'calendar'">
          <button class="smp-nav__btn" @click="shiftWeek(-1)">&larr;</button>
          <button class="smp-nav__today" @click="goToday">{{ t('today') }}</button>
          <button class="smp-nav__btn" @click="shiftWeek(1)">&rarr;</button>
          <span class="smp-nav__title">{{ weekLabel }}</span>
        </template>
        <button v-if="plannedTasks.length" class="smp-export" @click="exportAllICS">📅 {{ t('plExportWeek') }}</button>
      </div>
    </div>

    <!-- =================== CALENDAR VIEW =================== -->
    <template v-if="view === 'calendar'">
      <div class="smp-grid">
        <div class="smp-times">
          <div class="smp-times__head"></div>
          <div v-for="h in hours" :key="h" class="smp-times__label">{{ String(h).padStart(2,'0') }}:00</div>
        </div>
        <div v-for="(day, di) in weekDays" :key="di" class="smp-day" :class="{ 'smp-day--today': isToday(day.date) }">
          <div class="smp-day__head">
            <span class="smp-day__name">{{ day.name }}</span>
            <span class="smp-day__num" :class="{ 'smp-day__num--today': isToday(day.date) }">{{ day.num }}</span>
          </div>
          <div class="smp-day__body">
            <div v-for="h in hours" :key="h" class="smp-slot"
              @click="createAtSlot(day.date, h)"
              @dragover.prevent @drop="dropOnSlot($event, day.date, h)"></div>
            <div v-for="evt in eventsForDay(day.dateStr)" :key="evt.id"
              class="smp-event" :class="{ 'smp-event--dragging': draggingId === evt.id }"
              :style="eventStyle(evt)" draggable="true"
              @dragstart="dragStart($event, evt)" @click.stop="emit('edit-event', evt)">
              <div class="smp-event__content">
                <span class="smp-event__time">{{ fmtHour(evt.start_date) }} — {{ fmtEndHour(evt) }}</span>
                <span class="smp-event__name">{{ evt.name }}</span>
              </div>
              <button class="smp-event__export" @click.stop="exportSingleEvent(evt)">📅</button>
              <div class="smp-event__resize" @mousedown.stop.prevent="startResize($event, evt)"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- =================== GANTT VIEW =================== -->
    <template v-if="view === 'gantt'">
      <div class="smp-gantt">
        <div class="smp-gantt__header">
          <div class="smp-gantt__name-col">{{ t('thClient') }} / {{ t('stTasks') }}</div>
          <div class="smp-gantt__weeks">
            <div v-for="w in ganttWeeks" :key="w.num" class="smp-gantt__week" :class="{ 'smp-gantt__week--current': w.current }">
              S{{ w.num }}
              <span class="smp-gantt__week-date">{{ w.label }}</span>
            </div>
          </div>
        </div>

        <!-- Tasks grouped -->
        <template v-for="(groupTasks, gName) in ganttGrouped" :key="gName">
          <div class="smp-gantt__group" @click="toggleGanttGroup(gName)">
            <span class="smp-gantt__group-chevron">{{ ganttOpenGroups[gName] === false ? '▸' : '▾' }}</span>
            <span class="smp-gantt__group-name">{{ gName }}</span>
            <span class="smp-gantt__group-count">{{ groupTasks.length }}</span>
          </div>
          <template v-if="ganttOpenGroups[gName] !== false">
            <div v-for="tk in groupTasks" :key="tk.id" class="smp-gantt__row" @click="emit('edit-event', tk)">
              <div class="smp-gantt__name-col">
                <span class="smp-gantt__task-dot" :class="'smp-gantt__task-dot--' + (tk.status || 'todo')"></span>
                <span class="smp-gantt__task-name" :class="{ 'smp-gantt__task-name--done': tk.status === 'done' }">{{ tk.name }}</span>
              </div>
              <div class="smp-gantt__weeks">
                <div v-for="w in ganttWeeks" :key="w.num" class="smp-gantt__cell">
                  <div v-if="taskInWeek(tk, w)" class="smp-gantt__bar"
                    :class="{ 'smp-gantt__bar--done': tk.status === 'done', 'smp-gantt__bar--blocked': tk.status === 'blocked' }"
                    :style="ganttBarStyle(tk, w)">
                    <span v-if="taskStartsInWeek(tk, w)" class="smp-gantt__bar-label">{{ tk.dur_estimated || 1 }}h</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>

        <div v-if="!filtered.length" class="smp-gantt__empty">{{ t('kbNoTasks') }}</div>
      </div>
    </template>

    <!-- Unplanned tasks -->
    <div v-if="unplannedTasks.length" class="smp-unplanned">
      <h4 class="smp-unplanned__title">📋 {{ t('plUnplanned') }} ({{ unplannedTasks.length }})</h4>
      <p class="smp-unplanned__hint">{{ t('plDragHint') }}</p>
      <div class="smp-unplanned__list">
        <div v-for="tk in unplannedTasks" :key="tk.id" class="smp-unplanned__item"
          draggable="true" @dragstart="dragStart($event, tk)" @click="emit('edit-event', tk)">
          <span class="smp-unplanned__dot" :class="'smp-unplanned__dot--' + (tk.status || 'todo')"></span>
          <span class="smp-unplanned__name">{{ tk.name }}</span>
          <span class="smp-unplanned__dur" v-if="tk.dur_estimated">{{ tk.dur_estimated }}h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const props = defineProps({ tasks: { type: Array, default: () => [] } })
const emit = defineEmits(['create-event', 'edit-event', 'move-event'])

// === STATE ===
const view = ref('calendar')
const filterStatus = ref('')
const filterGroup = ref('')
const weekOffset = ref(0)
const draggingId = ref(null)
const ganttOpenGroups = reactive({})
const SLOT_H = 56
const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const today = new Date()

// === FILTERS ===
const groups = computed(() => [...new Set(props.tasks.map(t => t.group_name).filter(Boolean))])
const filtered = computed(() => {
  let list = props.tasks
  if (filterStatus.value) list = list.filter(tk => tk.status === filterStatus.value)
  if (filterGroup.value) list = list.filter(tk => tk.group_name === filterGroup.value)
  return list
})

// === CALENDAR ===
const mondayOfWeek = computed(() => {
  const d = new Date(today)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset.value * 7)
  d.setHours(0, 0, 0, 0)
  return d
})
const weekDays = computed(() => {
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayOfWeek.value)
    d.setDate(d.getDate() + i)
    return { name: names[i], num: d.getDate(), date: new Date(d), dateStr: d.toISOString().slice(0, 10) }
  })
})
const weekLabel = computed(() => {
  const s = weekDays.value[0].date, e = weekDays.value[6].date
  const o = { day: 'numeric', month: 'short' }
  return `${s.toLocaleDateString('fr-FR', o)} — ${e.toLocaleDateString('fr-FR', o)}`
})
function shiftWeek(n) { weekOffset.value += n }
function goToday() { weekOffset.value = 0 }
function isToday(date) { return date.toDateString() === today.toDateString() }
function eventsForDay(dateStr) { return filtered.value.filter(tk => (tk.start_date || tk.end_date || '').slice(0, 10) === dateStr) }
const unplannedTasks = computed(() => filtered.value.filter(tk => !tk.start_date && !tk.end_date))
const plannedTasks = computed(() => filtered.value.filter(tk => tk.start_date))

function eventStyle(evt) {
  const startH = evt.start_date ? parseFloat(evt.start_date.slice(11, 13)) + parseFloat(evt.start_date.slice(14, 16)) / 60 : 9
  const dur = evt.dur_estimated || 1
  const colors = ['#f43f5e', '#f97316', '#3b82f6', '#8b5cf6', '#16a34a', '#06b6d4', '#eab308']
  return { top: Math.max(0, (startH - hours[0]) * SLOT_H) + 'px', height: Math.max(dur * SLOT_H, 24) + 'px', '--evt-color': colors[(typeof evt.id === 'number' ? evt.id : 0) % colors.length] }
}
function fmtHour(d) { return d ? (d.slice(11, 16) || '09:00') : '' }
function fmtEndHour(evt) {
  if (evt.end_date) return evt.end_date.slice(11, 16)
  const h = (evt.start_date ? parseInt(evt.start_date.slice(11, 13)) || 9 : 9) + (evt.dur_estimated || 1)
  return String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0')
}
function createAtSlot(date, hour) { emit('create-event', { date, hour }) }

// Drag & drop
let draggedEvt = null
function dragStart(e, evt) { draggedEvt = evt; draggingId.value = evt.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', evt.id) }
function dropOnSlot(e, date, hour) {
  draggingId.value = null
  if (!draggedEvt) return
  emit('move-event', { task: draggedEvt, start_date: date.toISOString().slice(0, 10) + 'T' + String(hour).padStart(2, '0') + ':00' })
  draggedEvt = null
}
function startResize(e, evt) {
  const startY = e.clientY, startDur = evt.dur_estimated || 1
  function onMove(me) { evt.dur_estimated = Math.max(0.5, Math.round((startDur + (me.clientY - startY) / SLOT_H) * 2) / 2) }
  function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); emit('move-event', { task: evt, dur_estimated: evt.dur_estimated }) }
  document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
}

// === GANTT ===
const currentWeekNum = computed(() => {
  const start = new Date(today.getFullYear(), 0, 1)
  return Math.ceil(((today - start) / 86400000 + start.getDay() + 1) / 7)
})
const ganttWeeks = computed(() => {
  const cw = currentWeekNum.value
  return Array.from({ length: 12 }, (_, i) => {
    const wn = cw - 1 + i
    const d = new Date(today.getFullYear(), 0, 1 + (wn - 1) * 7)
    return { num: wn, current: wn === cw, label: `${d.getDate()}/${d.getMonth() + 1}` }
  })
})
const ganttGrouped = computed(() => {
  const groups = {}
  for (const tk of filtered.value) {
    const g = tk.group_name || t('defaultGroup')
    if (!groups[g]) groups[g] = []
    groups[g].push(tk)
  }
  return groups
})
function toggleGanttGroup(name) { ganttOpenGroups[name] = ganttOpenGroups[name] === false ? true : false }
function getTaskWeek(tk) {
  if (!tk.start_date) return currentWeekNum.value
  const d = new Date(tk.start_date)
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
}
function taskInWeek(tk, w) {
  const sw = getTaskWeek(tk)
  const dur = tk.dur_estimated || 1
  const spanWeeks = Math.max(1, Math.ceil(dur / 40))
  return w.num >= sw && w.num < sw + spanWeeks
}
function taskStartsInWeek(tk, w) { return getTaskWeek(tk) === w.num }
function ganttBarStyle(tk, w) {
  const colors = { done: '#16a34a', blocked: '#2563eb', in_progress: '#f43f5e', todo: '#94a3b8' }
  return { background: colors[tk.status] || colors.todo }
}

// === EXPORT ===
function getTaskDate(tk) { return (tk.start_date || '').slice(0, 10) }
function getTaskStartTime(tk) { return (tk.start_date || '').slice(11, 16) || '09:00' }
function getTaskEndTime(tk) {
  if (tk.end_date) return tk.end_date.slice(11, 16)
  const h = parseInt(getTaskStartTime(tk).split(':')[0]) + (tk.dur_estimated || 1)
  return String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0')
}
function toICSDate(dateStr, timeStr) { if (!dateStr) return ''; const [y, m, d] = dateStr.split('-'); const [h, mi] = (timeStr || '09:00').split(':'); return y + m + d + 'T' + h + mi + '00' }
function buildICSContent(tasks) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Scalyo//Planning//FR']
  for (const tk of tasks) { lines.push('BEGIN:VEVENT', 'UID:scalyo-' + tk.id + '@scalyo.app', 'DTSTAMP:' + toICSDate(new Date().toISOString().slice(0, 10), '00:00'), 'DTSTART:' + toICSDate(getTaskDate(tk), getTaskStartTime(tk)), 'DTEND:' + toICSDate(getTaskDate(tk), getTaskEndTime(tk)), 'SUMMARY:' + (tk.name || ''), 'END:VEVENT') }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
function downloadFile(content, filename) { const b = new Blob([content], { type: 'text/calendar;charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = filename; a.click(); URL.revokeObjectURL(u) }
function exportSingleEvent(tk) { downloadFile(buildICSContent([tk]), (tk.name || 'event').replace(/[^a-z0-9]/gi, '_') + '.ics') }
function exportAllICS() { if (plannedTasks.value.length) downloadFile(buildICSContent(plannedTasks.value), 'scalyo-planning.ics') }
</script>

<style scoped>
.smp { font-family: 'DM Sans', sans-serif; }

/* Top bar */
.smp-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.smp-top__left { display: flex; align-items: center; gap: 8px; }
.smp-top__right { display: flex; align-items: center; gap: 6px; }

/* View switcher */
.smp-views { display: flex; border: 1px solid var(--sm-bd); border-radius: 10px; overflow: hidden; }
.smp-views__btn { border: none; background: var(--sm-white); padding: 6px 14px; font-size: 12px; font-weight: 600; color: var(--sm-t2); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.smp-views__btn--on { background: var(--sm-grad); color: white; }
.smp-views__btn:hover:not(.smp-views__btn--on) { background: var(--sm-bg); }

/* Filters */
.smp-filters { display: flex; gap: 4px; }
.smp-filter { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 500; color: var(--sm-t2); font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; }
.smp-filter:focus { border-color: var(--sm-terra); }

/* Nav */
.smp-nav__btn { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; font-size: 13px; color: var(--sm-t2); display: flex; align-items: center; justify-content: center; }
.smp-nav__btn:hover { background: var(--sm-bg); }
.smp-nav__today { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: var(--sm-terra); cursor: pointer; }
.smp-nav__title { font-size: 13px; font-weight: 700; color: var(--sm-t1); }
.smp-export { border: 1px solid rgba(244,63,94,.2); background: var(--sm-white); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 600; color: var(--sm-terra); cursor: pointer; font-family: 'DM Sans', sans-serif; }
.smp-export:hover { background: rgba(244,63,94,.06); }

/* Calendar grid */
.smp-grid { display: flex; border: 1px solid var(--sm-bd); border-radius: 12px; overflow: hidden; background: var(--sm-white); }
.smp-times { flex-shrink: 0; width: 52px; }
.smp-times__head { height: 48px; border-bottom: 1px solid var(--sm-bd); background: var(--sm-bg); }
.smp-times__label { height: 56px; display: flex; align-items: flex-start; justify-content: flex-end; padding: 2px 6px 0 0; font-size: 10px; font-weight: 500; color: var(--sm-t3); border-top: 1px solid rgba(0,0,0,.04); }
.smp-day { flex: 1; min-width: 0; border-left: 1px solid var(--sm-bd); }
.smp-day--today { background: rgba(244,63,94,.02); }
.smp-day__head { height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid var(--sm-bd); background: var(--sm-bg); }
.smp-day__name { font-size: 9px; font-weight: 600; color: var(--sm-t3); text-transform: uppercase; }
.smp-day__num { font-size: 16px; font-weight: 800; color: var(--sm-t1); }
.smp-day__num--today { background: var(--sm-terra); color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.smp-day__body { position: relative; }
.smp-slot { height: 56px; border-top: 1px solid rgba(0,0,0,.04); cursor: pointer; transition: background .1s; }
.smp-slot:hover { background: rgba(244,63,94,.06); }

/* Events */
.smp-event { position: absolute; left: 2px; right: 2px; border-radius: 6px; background: var(--evt-color); color: white; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,.15); cursor: grab; display: flex; flex-direction: column; z-index: 2; }
.smp-event:hover { box-shadow: 0 4px 12px rgba(0,0,0,.25); z-index: 3; }
.smp-event--dragging { opacity: .4; }
.smp-event__content { padding: 3px 6px; flex: 1; overflow: hidden; }
.smp-event__time { display: block; font-size: 9px; font-weight: 700; opacity: .85; }
.smp-event__name { display: block; font-size: 10px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.smp-event__export { position: absolute; top: 2px; right: 2px; border: none; background: rgba(255,255,255,.3); border-radius: 3px; cursor: pointer; font-size: 9px; padding: 1px 3px; opacity: 0; }
.smp-event:hover .smp-event__export { opacity: 1; }
.smp-event__resize { height: 5px; cursor: ns-resize; background: rgba(255,255,255,.25); }
.smp-event__resize::after { content: ''; display: block; width: 16px; height: 2px; background: rgba(255,255,255,.5); border-radius: 1px; margin: 1px auto; }

/* =================== GANTT =================== */
.smp-gantt { border: 1px solid var(--sm-bd); border-radius: 12px; overflow: hidden; background: var(--sm-white); }
.smp-gantt__header { display: flex; border-bottom: 2px solid var(--sm-bd); background: var(--sm-bg); }
.smp-gantt__name-col { width: 200px; flex-shrink: 0; padding: 10px 12px; font-size: 11px; font-weight: 700; color: var(--sm-t2); }
.smp-gantt__weeks { display: flex; flex: 1; }
.smp-gantt__week { flex: 1; text-align: center; padding: 6px 2px; font-size: 10px; font-weight: 600; color: var(--sm-t3); border-left: 1px solid var(--sm-bd); }
.smp-gantt__week--current { background: rgba(244,63,94,.06); color: var(--sm-terra); font-weight: 800; }
.smp-gantt__week-date { display: block; font-size: 8px; font-weight: 400; color: var(--sm-t3); }

/* Groups */
.smp-gantt__group { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--sm-bg); border-bottom: 1px solid var(--sm-bd); cursor: pointer; font-size: 12px; font-weight: 700; color: var(--sm-t1); }
.smp-gantt__group:hover { background: rgba(0,0,0,.03); }
.smp-gantt__group-chevron { font-size: 9px; color: var(--sm-t3); width: 12px; }
.smp-gantt__group-name { flex: 1; }
.smp-gantt__group-count { font-size: 9px; color: var(--sm-t3); background: rgba(0,0,0,.04); padding: 1px 6px; border-radius: 8px; }

/* Rows */
.smp-gantt__row { display: flex; border-bottom: 1px solid rgba(0,0,0,.04); cursor: pointer; transition: background .1s; }
.smp-gantt__row:hover { background: rgba(244,63,94,.03); }
.smp-gantt__task-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.smp-gantt__task-dot--todo { background: #94a3b8; }
.smp-gantt__task-dot--in_progress { background: #f43f5e; }
.smp-gantt__task-dot--blocked { background: #2563eb; }
.smp-gantt__task-dot--done { background: #16a34a; }
.smp-gantt__task-name { font-size: 12px; font-weight: 500; color: var(--sm-t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.smp-gantt__task-name--done { text-decoration: line-through; color: var(--sm-t3); }
.smp-gantt__row .smp-gantt__name-col { display: flex; align-items: flex-start; gap: 6px; padding: 8px 12px 8px 20px; }
.smp-gantt__cell { flex: 1; height: 32px; border-left: 1px solid rgba(0,0,0,.04); position: relative; }
.smp-gantt__bar { position: absolute; top: 6px; left: 2px; right: 2px; height: 18px; border-radius: 4px; display: flex; align-items: center; padding: 0 4px; }
.smp-gantt__bar--done { opacity: .5; }
.smp-gantt__bar--blocked { opacity: .7; background: #2563eb !important; }
.smp-gantt__bar-label { font-size: 9px; font-weight: 700; color: white; }
.smp-gantt__empty { padding: 40px; text-align: center; color: var(--sm-t3); font-size: 13px; }

/* Unplanned */
.smp-unplanned { margin-top: 16px; background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 12px; padding: 14px; }
.smp-unplanned__title { font-size: 13px; font-weight: 700; color: var(--sm-t1); margin: 0 0 2px; }
.smp-unplanned__hint { font-size: 11px; color: var(--sm-t3); margin: 0 0 10px; }
.smp-unplanned__list { display: flex; flex-wrap: wrap; gap: 6px; }
.smp-unplanned__item { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--sm-bd); background: var(--sm-bg); cursor: grab; font-size: 12px; color: var(--sm-t1); transition: all .12s; }
.smp-unplanned__item:hover { border-color: var(--sm-terra); }
.smp-unplanned__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.smp-unplanned__dot--todo { background: #94a3b8; }
.smp-unplanned__dot--in_progress { background: var(--sm-warn); }
.smp-unplanned__dot--blocked { background: var(--sm-info); }
.smp-unplanned__dot--done { background: var(--sm-ok); }
.smp-unplanned__name { flex: 1; font-weight: 500; }
.smp-unplanned__dur { font-size: 10px; color: var(--sm-t3); font-weight: 600; }
</style>
