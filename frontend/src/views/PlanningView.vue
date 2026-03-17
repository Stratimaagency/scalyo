<template>
  <div class="fade-in">
    <div class="flex-between mb-md">
      <div>
        <h3 style="font-weight: 800">{{ t('planning') }}</h3>
        <p style="font-size: 13px; color: var(--muted)">{{ todayFormatted }}</p>
      </div>
      <div style="display: flex; gap: 8px">
        <button class="btn btn-primary" @click="showAdd = true">{{ t('newEvent') }}</button>
      </div>
    </div>

    <!-- View toggle -->
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: view === 'week' }" @click="view = 'week'">{{ t('week') }}</button>
      <button class="tab-item" :class="{ active: view === 'month' }" @click="view = 'month'">{{ t('month') }}</button>
    </div>

    <!-- Week view -->
    <template v-if="view === 'week'">
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px">
        <div v-for="day in weekDays" :key="day.date" class="card" style="min-height: 120px; padding: 10px">
          <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 6px">
            {{ day.label }}
          </div>
          <div style="font-size: 16px; font-weight: 800; margin-bottom: 8px" :style="{ color: day.isToday ? 'var(--teal)' : 'var(--text)' }">
            {{ day.num }}
          </div>
          <div v-for="ev in dayEvents(day.date)" :key="ev.id" style="padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 4px; cursor: pointer"
            :style="{ background: (ev.color || 'var(--teal)') + '22', color: ev.color || 'var(--teal)' }"
            @click="editingEvent = ev"
          >
            {{ ev.title }}
          </div>
        </div>
      </div>
    </template>

    <!-- Month view -->
    <template v-if="view === 'month'">
      <div class="flex-between mb-md">
        <button class="btn btn-secondary btn-sm" @click="changeMonth(-1)">← </button>
        <span style="font-weight: 700">{{ monthLabel }}</span>
        <button class="btn btn-secondary btn-sm" @click="changeMonth(1)"> →</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px">
        <div v-for="d in dayAbbrevs" :key="d" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--muted); padding: 6px">{{ d }}</div>
        <div v-for="(day, i) in monthDays" :key="i" style="min-height: 60px; background: var(--surface); border-radius: 8px; padding: 4px; font-size: 12px"
          :style="{ opacity: day.inMonth ? 1 : 0.3 }"
        >
          <div style="font-weight: 700; font-size: 11px; margin-bottom: 2px" :style="{ color: day.isToday ? 'var(--teal)' : 'var(--text)' }">
            {{ day.num }}
          </div>
          <div v-for="ev in dayEvents(day.date)" :key="ev.id" style="font-size: 9px; padding: 1px 4px; border-radius: 4px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer"
            :style="{ background: (ev.color || 'var(--teal)') + '22', color: ev.color || 'var(--teal)' }"
            @click="editingEvent = ev"
          >{{ ev.title }}</div>
        </div>
      </div>
    </template>

    <!-- Add Event Modal -->
    <AppModal v-if="showAdd" :title="t('newEvent')" @close="showAdd = false">
      <AppField :label="t('eventTitle')" v-model="newEvent.title" required />
      <div class="grid-2">
        <AppField :label="t('startTime')" v-model="newEvent.start" type="datetime-local" />
        <AppField :label="t('endTime')" v-model="newEvent.end" type="datetime-local" />
      </div>
      <div class="field-group">
        <label class="field-label">{{ t('eventColor') }}</label>
        <div style="display: flex; gap: 8px">
          <div v-for="c in colors" :key="c" @click="newEvent.color = c"
            style="width: 26px; height: 26px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all .15s"
            :style="{ background: c, borderColor: newEvent.color === c ? '#fff' : 'transparent', transform: newEvent.color === c ? 'scale(1.2)' : '' }"
          ></div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-secondary" @click="showAdd = false">{{ t('cancel') }}</button>
        <button class="btn btn-primary" @click="addEvent">{{ t('create') }}</button>
      </div>
    </AppModal>

    <!-- Edit Event Modal -->
    <AppModal v-if="editingEvent" :title="t('editEvent')" @close="editingEvent = null">
      <AppField :label="t('eventTitle')" v-model="editingEvent.title" />
      <div class="grid-2">
        <AppField :label="t('startTime')" v-model="editingEvent.start" type="datetime-local" />
        <AppField :label="t('endTime')" v-model="editingEvent.end" type="datetime-local" />
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-danger" @click="removeEvent(editingEvent)">{{ t('delete') }}</button>
        <button class="btn btn-primary" @click="saveAll(); editingEvent = null">{{ t('save') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { planningApi } from '../api'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const locale = computed(() => prefsStore.lang === 'en' ? 'en-US' : prefsStore.lang === 'kr' ? 'ko-KR' : 'fr-FR')
const events = ref([])
const view = ref('week')
const showAdd = ref(false)
const editingEvent = ref(null)
const currentDate = ref(new Date())
const colors = ['#7EC8B8', '#8AAED4', '#D4B896', '#D4878F', '#B0A0D4', '#8BBFA0']

const newEvent = ref({ title: '', start: '', end: '', color: '#7EC8B8' })

onMounted(async () => {
  try {
    const { data } = await planningApi.getEvents()
    events.value = data.events || []
  } catch {}
})

const dayAbbrevs = computed(() => [t('dayMon'), t('dayTue'), t('dayWed'), t('dayThu'), t('dayFri'), t('daySat'), t('daySun')])

const todayFormatted = computed(() => new Date().toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }))

const monthLabel = computed(() => {
  const d = currentDate.value
  return d.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })
})

const weekDays = computed(() => {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - start.getDay() + 1)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(locale.value, { weekday: 'short' }),
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    })
  }
  return days
})

const monthDays = computed(() => {
  const d = currentDate.value
  const year = d.getFullYear()
  const month = d.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startDay = (first.getDay() + 6) % 7
  const today = new Date()
  const days = []
  for (let i = -startDay; i <= last.getDate() + (6 - (last.getDay() + 6) % 7) - 1; i++) {
    const dd = new Date(year, month, i + 1)
    days.push({
      date: dd.toISOString().slice(0, 10),
      num: dd.getDate(),
      inMonth: dd.getMonth() === month,
      isToday: dd.toDateString() === today.toDateString(),
    })
  }
  return days
})

function dayEvents(dateStr) {
  return events.value.filter(e => (e.start || '').slice(0, 10) === dateStr)
}

function changeMonth(offset) {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + offset)
  currentDate.value = d
}

function addEvent() {
  events.value.push({ ...newEvent.value, id: Date.now().toString() })
  newEvent.value = { title: '', start: '', end: '', color: '#7EC8B8' }
  showAdd.value = false
  saveAll()
}

function removeEvent(ev) {
  events.value = events.value.filter(e => e.id !== ev.id)
  editingEvent.value = null
  saveAll()
}

async function saveAll() {
  await planningApi.saveEvents(events.value)
}
</script>
