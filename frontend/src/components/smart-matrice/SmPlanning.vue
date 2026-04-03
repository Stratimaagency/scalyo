<template>
  <div class="smp">
    <!-- Navigation -->
    <div class="smp-nav">
      <div class="smp-nav__left">
        <button class="smp-nav__btn" @click="shiftWeek(-1)">&larr;</button>
        <button class="smp-nav__today" @click="goToday">Aujourd'hui</button>
        <button class="smp-nav__btn" @click="shiftWeek(1)">&rarr;</button>
        <span class="smp-nav__title">{{ weekLabel }}</span>
      </div>
      <div class="smp-nav__right" v-if="plannedTasks.length">
        <button class="smp-export smp-export--google" @click="exportToGoogle" title="Ajouter à Google Calendar">
          <span class="smp-export__icon">G</span> Google
        </button>
        <button class="smp-export smp-export--outlook" @click="exportToOutlook" title="Ajouter à Outlook">
          <span class="smp-export__icon">O</span> Outlook
        </button>
        <button class="smp-export smp-export--apple" @click="exportICS" title="Télécharger .ics (Apple Calendar, etc.)">
          <span class="smp-export__icon">📅</span> .ics
        </button>
        <button class="smp-export smp-export--all" @click="exportAllICS" title="Exporter toute la semaine">
          ⬇ Tout exporter
        </button>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="smp-grid">
      <!-- Time column -->
      <div class="smp-times">
        <div class="smp-times__head"></div>
        <div v-for="h in hours" :key="h" class="smp-times__label">{{ String(h).padStart(2,'0') }}:00</div>
      </div>

      <!-- Day columns -->
      <div v-for="(day, di) in weekDays" :key="di" class="smp-day" :class="{ 'smp-day--today': isToday(day.date) }">
        <div class="smp-day__head">
          <span class="smp-day__name">{{ day.name }}</span>
          <span class="smp-day__num" :class="{ 'smp-day__num--today': isToday(day.date) }">{{ day.num }}</span>
        </div>
        <div class="smp-day__body" ref="dayBodies">
          <!-- Hour slots (clickable) -->
          <div v-for="h in hours" :key="h" class="smp-slot"
            @click="createAtSlot(day.date, h)"
            @dragover.prevent
            @drop="dropOnSlot($event, day.date, h)">
          </div>

          <!-- Events positioned absolutely -->
          <div v-for="evt in eventsForDay(day.dateStr)" :key="evt.id"
            class="smp-event"
            :class="{ 'smp-event--dragging': draggingId === evt.id }"
            :style="eventStyle(evt)"
            draggable="true"
            @dragstart="dragStart($event, evt)"
            @click.stop="emit('edit-event', evt)">
            <div class="smp-event__content">
              <span class="smp-event__time">{{ fmtHour(evt.start_date) }} — {{ fmtEndHour(evt) }}</span>
              <span class="smp-event__name">{{ evt.name }}</span>
            </div>
            <!-- Resize handle -->
            <div class="smp-event__resize" @mousedown.stop.prevent="startResize($event, evt, day.dateStr)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unplanned tasks -->
    <div v-if="unplannedTasks.length" class="smp-unplanned">
      <h4 class="smp-unplanned__title">📋 Tâches non planifiées ({{ unplannedTasks.length }})</h4>
      <p class="smp-unplanned__hint">Glissez une tâche sur le calendrier pour la planifier</p>
      <div class="smp-unplanned__list">
        <div v-for="t in unplannedTasks" :key="t.id" class="smp-unplanned__item"
          draggable="true" @dragstart="dragStart($event, t)"
          @click="emit('edit-event', t)">
          <span class="smp-unplanned__dot" :class="'smp-unplanned__dot--' + (t.status || 'todo')"></span>
          <span class="smp-unplanned__name">{{ t.name }}</span>
          <span class="smp-unplanned__dur" v-if="t.dur_estimated">{{ t.dur_estimated }}h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
})

const emit = defineEmits(['create-event', 'edit-event', 'move-event'])

const SLOT_H = 56
const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const weekOffset = ref(0)
const draggingId = ref(null)

const today = new Date()

const mondayOfWeek = computed(() => {
  const d = new Date(today)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset.value * 7)
  d.setHours(0, 0, 0, 0)
  return d
})

const weekDays = computed(() => {
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfWeek.value)
    d.setDate(d.getDate() + i)
    days.push({ name: names[i], num: d.getDate(), date: new Date(d), dateStr: d.toISOString().slice(0, 10) })
  }
  return days
})

const weekLabel = computed(() => {
  const s = weekDays.value[0].date
  const e = weekDays.value[6].date
  const o = { day: 'numeric', month: 'long' }
  return `${s.toLocaleDateString('fr-FR', o)} — ${e.toLocaleDateString('fr-FR', o)} ${e.getFullYear()}`
})

function shiftWeek(n) { weekOffset.value += n }
function goToday() { weekOffset.value = 0 }
function isToday(date) { return date.toDateString() === today.toDateString() }

function eventsForDay(dateStr) {
  return props.tasks.filter(t => {
    const d = (t.start_date || t.end_date || '').slice(0, 10)
    return d === dateStr
  })
}

const unplannedTasks = computed(() => props.tasks.filter(t => !t.start_date && !t.end_date))

function eventStyle(evt) {
  const startH = evt.start_date ? parseFloat(evt.start_date.slice(11, 13)) + parseFloat(evt.start_date.slice(14, 16)) / 60 : 9
  const dur = evt.dur_estimated || 1
  const top = (startH - hours[0]) * SLOT_H
  const height = Math.max(dur * SLOT_H, 24)
  const colors = ['#f43f5e', '#f97316', '#3b82f6', '#8b5cf6', '#16a34a', '#06b6d4', '#eab308']
  const color = colors[(typeof evt.id === 'number' ? evt.id : 0) % colors.length]
  return {
    top: Math.max(0, top) + 'px',
    height: height + 'px',
    '--evt-color': color,
  }
}

function fmtHour(d) {
  if (!d) return ''
  return d.slice(11, 16) || '09:00'
}

function fmtEndHour(evt) {
  if (evt.end_date) return evt.end_date.slice(11, 16)
  const startH = evt.start_date ? parseInt(evt.start_date.slice(11, 13)) || 9 : 9
  const dur = evt.dur_estimated || 1
  const endH = startH + dur
  return String(Math.floor(endH)).padStart(2, '0') + ':' + String(Math.round((endH % 1) * 60)).padStart(2, '0')
}

// Create event at slot
function createAtSlot(date, hour) {
  emit('create-event', { date, hour })
}

// Drag & drop
let draggedEvt = null
function dragStart(e, evt) {
  draggedEvt = evt
  draggingId.value = evt.id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', evt.id)
}

function dropOnSlot(e, date, hour) {
  draggingId.value = null
  if (!draggedEvt) return
  const dateStr = date.toISOString().slice(0, 10)
  const hourStr = String(hour).padStart(2, '0')
  const newStart = dateStr + 'T' + hourStr + ':00'
  emit('move-event', { task: draggedEvt, start_date: newStart })
  draggedEvt = null
}

// Resize
function startResize(e, evt, dateStr) {
  const startY = e.clientY
  const startDur = evt.dur_estimated || 1

  function onMouseMove(me) {
    const dy = me.clientY - startY
    const newDur = Math.max(0.5, startDur + dy / SLOT_H)
    evt.dur_estimated = Math.round(newDur * 2) / 2 // round to 0.5h
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    emit('move-event', { task: evt, dur_estimated: evt.dur_estimated })
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// === EXPORT FUNCTIONS ===

const plannedTasks = computed(() => props.tasks.filter(t => t.start_date))

function getTaskDate(t) { return (t.start_date || '').slice(0, 10) }
function getTaskStartTime(t) { return (t.start_date || '').slice(11, 16) || '09:00' }
function getTaskEndTime(t) {
  if (t.end_date) return t.end_date.slice(11, 16)
  const h = parseInt(getTaskStartTime(t).split(':')[0]) + (t.dur_estimated || 1)
  return String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0')
}

function toICSDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const [h, mi] = (timeStr || '09:00').split(':')
  return y + m + d + 'T' + h + mi + '00'
}

function exportToGoogle() {
  for (const t of plannedTasks.value) {
    const start = toICSDate(getTaskDate(t), getTaskStartTime(t))
    const end = toICSDate(getTaskDate(t), getTaskEndTime(t))
    const p = new URLSearchParams({
      action: 'TEMPLATE', text: t.name, dates: `${start}/${end}`,
      details: t.description || ''
    })
    window.open(`https://www.google.com/calendar/render?${p.toString()}`, '_blank')
  }
}

function exportToOutlook() {
  for (const t of plannedTasks.value) {
    const start = `${getTaskDate(t)}T${getTaskStartTime(t)}:00`
    const end = `${getTaskDate(t)}T${getTaskEndTime(t)}:00`
    const p = new URLSearchParams({
      path: '/calendar/action/compose', rru: 'addevent',
      subject: t.name, startdt: start, enddt: end,
      body: t.description || ''
    })
    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`, '_blank')
  }
}

function buildICSContent(tasks) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Scalyo//Planning//FR']
  for (const t of tasks) {
    lines.push('BEGIN:VEVENT')
    lines.push('UID:scalyo-' + t.id + '@scalyo.app')
    lines.push('DTSTAMP:' + toICSDate(new Date().toISOString().slice(0, 10), '00:00'))
    lines.push('DTSTART:' + toICSDate(getTaskDate(t), getTaskStartTime(t)))
    lines.push('DTEND:' + toICSDate(getTaskDate(t), getTaskEndTime(t)))
    lines.push('SUMMARY:' + (t.name || ''))
    if (t.description) lines.push('DESCRIPTION:' + t.description.replace(/\n/g, '\\n'))
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportICS() {
  if (!plannedTasks.value.length) return
  const t = plannedTasks.value[0]
  downloadFile(buildICSContent([t]), (t.name || 'event').replace(/[^a-z0-9]/gi, '_') + '.ics')
}

function exportAllICS() {
  if (!plannedTasks.value.length) return
  downloadFile(buildICSContent(plannedTasks.value), 'scalyo-planning.ics')
}
</script>

<style scoped>
.smp { font-family: 'DM Sans', sans-serif; }

/* Navigation */
.smp-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.smp-nav__left { display: flex; align-items: center; gap: 8px; }
.smp-nav__right { display: flex; align-items: center; gap: 6px; }
.smp-export { display: flex; align-items: center; gap: 4px; border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.smp-export:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.smp-export__icon { font-weight: 800; font-size: 12px; }
.smp-export--google { color: #EA4335; border-color: rgba(234,67,53,.2); }
.smp-export--google:hover { background: rgba(234,67,53,.06); }
.smp-export--outlook { color: #0078D4; border-color: rgba(0,120,212,.2); }
.smp-export--outlook:hover { background: rgba(0,120,212,.06); }
.smp-export--apple { color: var(--sm-t2); }
.smp-export--apple:hover { background: var(--sm-bg); }
.smp-export--all { color: var(--sm-terra); border-color: rgba(244,63,94,.2); }
.smp-export--all:hover { background: rgba(244,63,94,.06); }
.smp-nav__btn { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 14px; color: var(--sm-t2); display: flex; align-items: center; justify-content: center; }
.smp-nav__btn:hover { background: var(--sm-bg); }
.smp-nav__today { border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: var(--sm-terra); cursor: pointer; }
.smp-nav__today:hover { background: var(--sm-bg); }
.smp-nav__title { font-size: 15px; font-weight: 700; color: var(--sm-t1); margin-left: 8px; }

/* Grid */
.smp-grid { display: flex; border: 1px solid var(--sm-bd); border-radius: 12px; overflow: hidden; background: var(--sm-white); }

/* Times column */
.smp-times { flex-shrink: 0; width: 56px; }
.smp-times__head { height: 52px; border-bottom: 1px solid var(--sm-bd); background: var(--sm-bg); }
.smp-times__label { height: 56px; display: flex; align-items: flex-start; justify-content: flex-end; padding: 2px 8px 0 0; font-size: 10px; font-weight: 500; color: var(--sm-t3); border-top: 1px solid rgba(0,0,0,.04); }

/* Day columns */
.smp-day { flex: 1; min-width: 0; border-left: 1px solid var(--sm-bd); }
.smp-day--today { background: rgba(244,63,94,.02); }
.smp-day__head { height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid var(--sm-bd); background: var(--sm-bg); }
.smp-day__name { font-size: 10px; font-weight: 600; color: var(--sm-t3); text-transform: uppercase; letter-spacing: .05em; }
.smp-day__num { font-size: 18px; font-weight: 800; color: var(--sm-t1); margin-top: 1px; }
.smp-day__num--today { background: var(--sm-terra); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; }
.smp-day__body { position: relative; }

/* Slots */
.smp-slot { height: 56px; border-top: 1px solid rgba(0,0,0,.04); cursor: pointer; transition: background .1s; }
.smp-slot:hover { background: rgba(244,63,94,.06); }

/* Events */
.smp-event {
  position: absolute; left: 2px; right: 2px; border-radius: 6px;
  background: var(--evt-color); color: white; overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,.15); cursor: grab; transition: opacity .15s;
  display: flex; flex-direction: column; z-index: 2;
}
.smp-event:hover { box-shadow: 0 4px 12px rgba(0,0,0,.25); z-index: 3; }
.smp-event:active { cursor: grabbing; }
.smp-event--dragging { opacity: .4; }
.smp-event__content { padding: 4px 6px; flex: 1; min-height: 0; overflow: hidden; }
.smp-event__time { display: block; font-size: 10px; font-weight: 700; opacity: .85; }
.smp-event__name { display: block; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.smp-event__resize {
  height: 6px; cursor: ns-resize; background: rgba(255,255,255,.3); border-radius: 0 0 6px 6px;
  display: flex; align-items: center; justify-content: center;
}
.smp-event__resize::after { content: ''; width: 20px; height: 2px; background: rgba(255,255,255,.6); border-radius: 1px; }

/* Unplanned */
.smp-unplanned { margin-top: 16px; background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 12px; padding: 14px; }
.smp-unplanned__title { font-size: 13px; font-weight: 700; color: var(--sm-t1); margin: 0 0 2px; }
.smp-unplanned__hint { font-size: 11px; color: var(--sm-t3); margin: 0 0 10px; }
.smp-unplanned__list { display: flex; flex-wrap: wrap; gap: 6px; }
.smp-unplanned__item { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--sm-bd); background: var(--sm-bg); cursor: grab; font-size: 12px; color: var(--sm-t1); transition: all .12s; }
.smp-unplanned__item:hover { border-color: var(--sm-terra); background: rgba(244,63,94,.04); }
.smp-unplanned__item:active { cursor: grabbing; }
.smp-unplanned__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.smp-unplanned__dot--todo { background: #94a3b8; }
.smp-unplanned__dot--in_progress { background: var(--sm-warn); }
.smp-unplanned__dot--blocked { background: var(--sm-info); }
.smp-unplanned__dot--done { background: var(--sm-ok); }
.smp-unplanned__name { flex: 1; font-weight: 500; }
.smp-unplanned__dur { font-size: 10px; color: var(--sm-t3); font-weight: 600; }
</style>
