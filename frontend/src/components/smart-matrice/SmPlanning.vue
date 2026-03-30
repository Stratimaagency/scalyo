<template>
  <div class="sm-planning">
    <!-- Week nav -->
    <div class="sm-planning__nav">
      <button class="sm-planning__nav-btn" @click="shiftWeek(-1)">&larr;</button>
      <span class="sm-planning__nav-title">{{ weekLabel }}</span>
      <button class="sm-planning__nav-btn" @click="shiftWeek(1)">&rarr;</button>
      <button class="sm-planning__nav-today" @click="goToday">Aujourd'hui</button>
    </div>

    <!-- Grid -->
    <div class="sm-planning__grid">
      <!-- Hour labels -->
      <div class="sm-planning__hours">
        <div class="sm-planning__hour-head"></div>
        <div v-for="h in hours" :key="h" class="sm-planning__hour-label">{{ h }}:00</div>
      </div>

      <!-- Day columns -->
      <div v-for="(day, i) in weekDays" :key="i" class="sm-planning__day"
        :class="{ 'sm-planning__day--today': isToday(day.date) }">
        <div class="sm-planning__day-head">
          <span class="sm-planning__day-name">{{ day.name }}</span>
          <span class="sm-planning__day-num" :class="{ 'sm-planning__day-num--today': isToday(day.date) }">{{ day.num }}</span>
        </div>
        <div class="sm-planning__day-slots">
          <div v-for="h in hours" :key="h" class="sm-planning__slot"></div>
          <!-- Events -->
          <div v-for="evt in eventsForDay(day.date)" :key="evt.id" class="sm-planning__event"
            :style="eventStyle(evt)" :title="evt.name">
            <span class="sm-planning__event-time">{{ fmtTime(evt.start_date) }}</span>
            <span class="sm-planning__event-name">{{ evt.name }}</span>
          </div>
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

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
const SLOT_H = 56
const weekOffset = ref(0)

const today = new Date()
const mondayOfWeek = computed(() => {
  const d = new Date(today)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset.value * 7)
  d.setHours(0, 0, 0, 0)
  return d
})

const weekDays = computed(() => {
  const days = []
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfWeek.value)
    d.setDate(d.getDate() + i)
    days.push({ name: names[i], num: d.getDate(), date: new Date(d) })
  }
  return days
})

const weekLabel = computed(() => {
  const start = weekDays.value[0].date
  const end = weekDays.value[6].date
  const opts = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('fr-FR', opts)} — ${end.toLocaleDateString('fr-FR', opts)}`
})

function shiftWeek(n) { weekOffset.value += n }
function goToday() { weekOffset.value = 0 }

function isToday(date) {
  return date.toDateString() === today.toDateString()
}

function eventsForDay(date) {
  const ds = date.toISOString().slice(0, 10)
  return props.tasks.filter(t => {
    if (!t.start_date) return false
    return t.start_date.slice(0, 10) === ds
  })
}

function eventStyle(evt) {
  const h = evt.start_date ? parseInt(evt.start_date.slice(11, 13)) || 9 : 9
  const dur = evt.dur_estimated || 1
  const top = (h - 9) * SLOT_H
  const height = Math.max(dur * SLOT_H, 28)
  const colors = ['#e8603a', '#e8507a', '#9b5acd', '#e8a020', '#16a34a', '#2563eb']
  const color = colors[(evt.id || 0) % colors.length]
  return {
    top: top + 'px',
    height: height + 'px',
    background: color,
    '--evt-color': color,
  }
}

function fmtTime(d) {
  if (!d) return ''
  return d.slice(11, 16)
}
</script>

<style scoped>
.sm-planning { font-family: 'DM Sans', sans-serif; }
.sm-planning__nav {
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
}
.sm-planning__nav-btn {
  border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px;
  width: 32px; height: 32px; cursor: pointer; font-size: 14px; color: var(--sm-t2);
}
.sm-planning__nav-btn:hover { background: var(--sm-bg); }
.sm-planning__nav-title {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 16px; color: var(--sm-t1);
}
.sm-planning__nav-today {
  margin-left: auto; border: 1px solid var(--sm-bd); background: var(--sm-white);
  border-radius: 8px; padding: 4px 12px; font-size: 12px; font-weight: 500;
  color: var(--sm-terra); cursor: pointer;
}
.sm-planning__nav-today:hover { background: var(--sm-bg); }
.sm-planning__grid { display: flex; gap: 0; overflow-x: auto; }
.sm-planning__hours { flex-shrink: 0; width: 64px; }
.sm-planning__hour-head { height: 48px; }
.sm-planning__hour-label {
  height: 56px; display: flex; align-items: flex-start; justify-content: flex-end;
  padding-right: 8px; font-size: 11px; color: var(--sm-t3); padding-top: 2px;
}
.sm-planning__day {
  flex: 1; min-width: 100px; border-left: 1px solid var(--sm-bd);
}
.sm-planning__day--today { background: rgba(232,96,58,.03); }
.sm-planning__day-head {
  height: 48px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; border-bottom: 1px solid var(--sm-bd);
}
.sm-planning__day-name { font-size: 11px; color: var(--sm-t3); text-transform: uppercase; font-weight: 500; }
.sm-planning__day-num { font-size: 16px; font-weight: 600; color: var(--sm-t1); }
.sm-planning__day-num--today {
  background: var(--sm-terra); color: white; width: 26px; height: 26px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.sm-planning__day-slots { position: relative; }
.sm-planning__slot { height: 56px; border-bottom: 1px solid var(--sm-bd); }
.sm-planning__event {
  position: absolute; left: 2px; right: 2px; border-radius: 6px;
  color: white; padding: 4px 6px; font-size: 11px; overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,.15); cursor: pointer;
}
.sm-planning__event-time { font-weight: 600; display: block; font-size: 10px; opacity: .85; }
.sm-planning__event-name { font-weight: 500; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
