<template>
  <div class="fade-in" style="display: flex; flex-direction: column; height: 100%; overflow: hidden">
    <!-- Header bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 28px 14px; flex-shrink: 0; border-bottom: 1px solid var(--border)">
      <div style="display: flex; align-items: center; gap: 14px">
        <h1 style="font-size: 20px; font-weight: 900; letter-spacing: -0.4px">{{ t('planning') }}</h1>
        <div style="display: flex; align-items: center; gap: 4px">
          <button @click="prevPeriod" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: var(--text); font-size: 14px; display: flex; align-items: center; justify-content: center">&lsaquo;</button>
          <span style="font-size: 13px; font-weight: 700; min-width: 180px; text-align: center">{{ headerTitle }}</span>
          <button @click="nextPeriod" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: var(--text); font-size: 14px; display: flex; align-items: center; justify-content: center">&rsaquo;</button>
        </div>
        <button @click="goToday" style="font-size: 11px; padding: 5px 12px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); cursor: pointer; font-weight: 600">{{ t('today') }}</button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <!-- View toggle -->
        <div class="tab-bar" style="padding: 3px">
          <button class="tab-item" :class="{ active: view === 'week' }" @click="view = 'week'" style="padding: 4px 12px; font-size: 11px">{{ t('week') }}</button>
          <button class="tab-item" :class="{ active: view === 'month' }" @click="view = 'month'" style="padding: 4px 12px; font-size: 11px">{{ t('month') }}</button>
        </div>
        <button @click="doExportICS(events)" style="display: flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; font-size: 11px; font-weight: 600">{{ t('exportIcs') }}</button>
        <button @click="openAddEvent(todayStr)" style="padding: 6px 14px; border-radius: 9px; background: var(--teal); color: #FFFFFF; border: none; cursor: pointer; font-size: 11px; font-weight: 800">+ {{ t('event') }}</button>
      </div>
    </div>

    <!-- Calendar body -->
    <div style="flex: 1; overflow: auto; padding: 0 28px 20px">
      <!-- WEEK VIEW -->
      <div v-if="view === 'week'" style="margin-top: 16px">
        <!-- Day headers -->
        <div style="display: grid; grid-template-columns: 60px repeat(7, 1fr); gap: 0; margin-bottom: 0">
          <div></div>
          <div v-for="(d, i) in weekDays" :key="'wh' + i"
            :style="{
              textAlign: 'center', padding: '8px 4px',
              borderBottom: '1px solid var(--border)',
              background: isTodayDate(d) ? 'rgba(77,182,160,0.08)' : 'transparent',
              borderRadius: isTodayDate(d) ? '8px 8px 0 0' : '0'
            }">
            <div style="font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase">{{ dayNames[i] }}</div>
            <div :style="{
              fontSize: '20px', fontWeight: 900,
              color: isTodayDate(d) ? 'var(--teal)' : 'var(--text)',
              width: '36px', height: '36px', borderRadius: '50%', margin: '2px auto',
              background: isTodayDate(d) ? 'rgba(77,182,160,0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }">{{ d.getDate() }}</div>
          </div>
        </div>
        <!-- Time slots -->
        <div v-for="h in hours" :key="'h' + h" style="display: grid; grid-template-columns: 60px repeat(7, 1fr); border-bottom: 1px solid var(--border)">
          <div style="font-size: 10px; color: var(--muted); padding: 6px 8px 0 0; text-align: right; padding-top: 4px">{{ h }}:00</div>
          <div v-for="(d, i) in weekDays" :key="'ws' + h + '-' + i"
            @click="openAddEvent(toDateStr(d))"
            @mouseenter="$event.currentTarget.style.background = 'rgba(77,182,160,0.08)'"
            @mouseleave="$event.currentTarget.style.background = isTodayDate(d) ? 'rgba(77,182,160,0.02)' : 'transparent'"
            :style="{
              minHeight: '50px', padding: '2px 3px',
              borderLeft: '1px solid var(--border)',
              background: isTodayDate(d) ? 'rgba(77,182,160,0.02)' : 'transparent',
              cursor: 'pointer', transition: 'background .12s', position: 'relative'
            }">
            <div v-for="ev in getHourEvents(d, h)" :key="ev.id"
              @click.stop="openEditEvent(ev)"
              :style="{
                background: getEventColor(ev.color).hex + '22',
                border: '1px solid ' + getEventColor(ev.color).hex + '55',
                borderLeft: '3px solid ' + getEventColor(ev.color).hex,
                borderRadius: '5px',
                padding: '3px 6px', fontSize: '10px', fontWeight: 600,
                color: getEventColor(ev.color).hex,
                marginBottom: '2px', cursor: 'pointer',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }">
              {{ ev.time ? ' ' + ev.time + ' ' : ' ' }}{{ ev.title }}
            </div>
          </div>
        </div>
      </div>

      <!-- MONTH VIEW -->
      <div v-if="view === 'month'" style="margin-top: 16px">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin-bottom: 4px">
          <div v-for="d in dayNames" :key="'dn' + d" style="text-align: center; font-size: 10px; font-weight: 700; color: var(--muted); padding: 6px 0; text-transform: uppercase">{{ d }}</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px">
          <template v-for="(d, i) in monthDays" :key="'md' + i">
            <div v-if="!d"></div>
            <div v-else
              @click="openAddEvent(toDateStr(d))"
              @mouseenter="$event.currentTarget.style.borderColor = 'var(--teal-border, rgba(77,182,160,0.4))'"
              @mouseleave="$event.currentTarget.style.borderColor = isTodayDate(d) ? 'var(--teal-border, rgba(77,182,160,0.4))' : 'var(--border)'"
              :style="{
                minHeight: '80px', padding: '6px',
                border: '1px solid ' + (isTodayDate(d) ? 'var(--teal-border, rgba(77,182,160,0.4))' : 'var(--border)'),
                borderRadius: '8px',
                background: isTodayDate(d) ? 'rgba(77,182,160,0.08)' : 'var(--surface)',
                opacity: isCurrentMonth(d) ? 1 : 0.4,
                cursor: 'pointer', transition: 'all .12s'
              }">
              <div :style="{
                fontSize: '13px',
                fontWeight: isTodayDate(d) ? 900 : 500,
                color: isTodayDate(d) ? 'var(--teal)' : 'var(--text)',
                marginBottom: '3px'
              }">{{ d.getDate() }}</div>
              <div v-for="ev in getEventsForDay(d).slice(0, 3)" :key="ev.id"
                @click.stop="openEditEvent(ev)"
                :style="{
                  fontSize: '9.5px', fontWeight: 600,
                  color: getEventColor(ev.color).hex,
                  background: getEventColor(ev.color).hex + '18',
                  borderRadius: '3px', padding: '1px 5px', marginBottom: '2px',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                }">{{ ev.title }}</div>
              <div v-if="getEventsForDay(d).length > 3" style="font-size: 9px; color: var(--muted)">+{{ getEventsForDay(d).length - 3 }} {{ t('more') }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <AppModal v-if="showAddEvent" :title="editEventData ? t('editEvent') : t('newEvent')" @close="closeModal">
      <!-- Saved confirmation with calendar export options -->
      <template v-if="savedEvent">
        <div style="text-align: center; margin-bottom: 20px">
          <div style="font-size: 36px; margin-bottom: 8px">&#x2705;</div>
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 4px">{{ t('savedBang') }}</h3>
          <p style="font-size: 12px; color: var(--muted)">{{ t('addToCalendar') }}</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
          <a :href="buildGoogleLink(savedEvent)" target="_blank" rel="noopener"
            style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; background: rgba(234,67,53,0.1); border: 1px solid rgba(234,67,53,0.2); color: #EA4335; cursor: pointer">
            {{ t('addToGoogle') }}
          </a>
          <a :href="buildOutlookLink(savedEvent)" target="_blank" rel="noopener"
            style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; background: rgba(0,120,212,0.1); border: 1px solid rgba(0,120,212,0.2); color: #0078D4; cursor: pointer">
            {{ t('addToOutlook') }}
          </a>
          <button @click="doExportICS([savedEvent], savedEvent.title.replace(/[^a-z0-9]/gi, '_') + '.ics')"
            style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #4DAB6D">
            {{ t('exportIcs') }}
          </button>
        </div>
        <button @click="closeModal"
          style="width: 100%; padding: 10px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); cursor: pointer; font-size: 13px; font-weight: 600">
          {{ t('cancel') }}
        </button>
      </template>

      <!-- Event form -->
      <template v-else>
        <input v-model="formTitle" :placeholder="t('eventTitle')"
          :style="inputStyle" style="font-weight: 600" />

        <div style="display: flex; gap: 8px; margin-bottom: 12px">
          <div style="flex: 1.5">
            <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 4px">Date</div>
            <input type="date" v-model="formDate" :style="{ ...inputStyleNoMb }" />
          </div>
          <div style="flex: 1">
            <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 4px">{{ t('startTime') }}</div>
            <input type="time" v-model="formTime" :style="{ ...inputStyleNoMb }" />
          </div>
          <div style="flex: 1">
            <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 4px">{{ t('endTime') }}</div>
            <input type="time" v-model="formEndTime" :style="{ ...inputStyleNoMb }" />
          </div>
        </div>

        <div style="margin-bottom: 12px">
          <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px">{{ t('eventColor') }}</div>
          <div style="display: flex; gap: 6px">
            <button v-for="clr in EVENT_COLORS" :key="clr.id" @click="formColor = clr.id"
              :style="{
                width: '24px', height: '24px', borderRadius: '50%',
                background: clr.hex,
                border: '2px solid ' + (formColor === clr.id ? '#fff' : clr.hex),
                cursor: 'pointer',
                outline: formColor === clr.id ? '2px solid ' + clr.hex : 'none',
                outlineOffset: '2px'
              }"></button>
          </div>
        </div>

        <select v-if="accounts.length > 0" v-model="formAccount" :style="inputStyle">
          <option value="">{{ t('noAccount') }}</option>
          <option v-for="a in accounts" :key="a.id" :value="a.name">{{ a.name }}</option>
        </select>

        <textarea v-model="formNote" placeholder="Notes..." rows="2" :style="{ ...inputStyle, resize: 'vertical' }"></textarea>

        <div style="display: flex; gap: 8px">
          <button v-if="editEventData" @click="deleteEvent(editEventData.id)"
            style="padding: 10px 14px; border-radius: 6px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #EF4444; cursor: pointer; font-size: 12px; font-weight: 700">
            {{ t('delete') }}
          </button>
          <button @click="closeModal"
            style="flex: 1; padding: 11px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); cursor: pointer; font-size: 13px; font-weight: 600">
            {{ t('cancel') }}
          </button>
          <button @click="handleSave" :disabled="!formTitle.trim() || !formDate"
            :style="{
              flex: 2, padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 800,
              cursor: 'pointer', border: 'none',
              background: (!formTitle.trim() || !formDate) ? 'var(--surface)' : 'var(--teal)',
              color: (!formTitle.trim() || !formDate) ? 'var(--muted)' : '#FFFFFF'
            }">
            {{ editEventData ? t('save') : t('create') }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { planningApi } from '../api'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import { usePortfolioStore } from '../stores/portfolio'
import AppModal from '../components/AppModal.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const portfolioStore = usePortfolioStore()
const lang = computed(() => prefsStore.lang || 'fr')
const locale = computed(() => prefsStore.lang === 'en' ? 'en-US' : prefsStore.lang === 'kr' ? 'ko-KR' : 'fr-FR')

const accounts = computed(() => portfolioStore.accounts || [])

const EVENT_COLORS = [
  { id: 'teal', hex: '#4DB6A0' },
  { id: 'blue', hex: '#3B82F6' },
  { id: 'purple', hex: '#9B6BDF' },
  { id: 'green', hex: '#4DAB6D' },
  { id: 'amber', hex: '#E8A838' },
  { id: 'red', hex: '#EB5757' }
]

const inputStyle = {
  width: '100%',
  background: 'var(--bg2, var(--surface))',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '10px 13px',
  color: 'var(--text)',
  fontSize: '13px',
  marginBottom: '12px'
}

const inputStyleNoMb = {
  width: '100%',
  background: 'var(--bg2, var(--surface))',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '10px 13px',
  color: 'var(--text)',
  fontSize: '13px',
  marginBottom: '0'
}

const events = ref([])
const view = ref('week')
const today = ref(new Date())
const todayStr = computed(() => localDateStr(today.value))
const currentDate = ref(new Date())
const showAddEvent = ref(false)
const selectedDate = ref(null)
const editEventData = ref(null)
const savedEvent = ref(null)

// Form fields
const formTitle = ref('')
const formDate = ref('')
const formTime = ref('09:00')
const formEndTime = ref('10:00')
const formColor = ref('teal')
const formNote = ref('')
const formAccount = ref('')

onMounted(async () => {
  try {
    const { data } = await planningApi.getEvents()
    events.value = data.events || []
  } catch {}
  try {
    await portfolioStore.fetchAccounts()
  } catch {}
})

// Day names (i18n)
const dayNames = computed(() => {
  if (lang.value === 'en') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  if (lang.value === 'kr') return ['월', '화', '수', '목', '금', '토', '일']
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
})

const monthNames = computed(() => {
  if (lang.value === 'en') return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  if (lang.value === 'kr') return ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  return ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
})

// Date helpers — local timezone safe
function localDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

// Week helpers
function startOfWeek(d) {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = day === 0 ? -6 : 1 - day
  dt.setDate(dt.getDate() + diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek(currentDate.value))
    d.setDate(d.getDate() + i)
    return d
  })
})

const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8h → 20h

// Month helpers
const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1)
  const lastDay = new Date(year.value, month.value + 1, 0)
  const startPad = (firstDay.getDay() || 7) - 1
  return Array.from({ length: startPad + lastDay.getDate() }, (_, i) => {
    if (i < startPad) return null
    return new Date(year.value, month.value, i - startPad + 1)
  })
})

// Header title
const headerTitle = computed(() => {
  if (view.value === 'week') {
    const wd = weekDays.value
    const d0 = wd[0], d6 = wd[6]
    if (d0.getMonth() === d6.getMonth()) {
      return `${d0.getDate()} – ${d6.getDate()} ${monthNames.value[d0.getMonth()]} ${d0.getFullYear()}`
    }
    return `${d0.getDate()} ${monthNames.value[d0.getMonth()]} – ${d6.getDate()} ${monthNames.value[d6.getMonth()]} ${d6.getFullYear()}`
  }
  return `${monthNames.value[month.value]} ${year.value}`
})

// Helpers
function isTodayDate(d) {
  return d && d.toDateString() === today.value.toDateString()
}

function isCurrentMonth(d) {
  return d && d.getMonth() === month.value
}

function toDateStr(d) {
  return localDateStr(d)
}

function getEventsForDay(d) {
  if (!d) return []
  const ds = localDateStr(d)
  return events.value.filter(e => e.date === ds)
}

function getHourEvents(d, h) {
  return getEventsForDay(d).filter(e => {
    const eh = parseInt(e.time?.split(':')[0] || '9')
    return eh === h
  })
}

function getEventColor(colorId) {
  return EVENT_COLORS.find(c => c.id === colorId) || EVENT_COLORS[0]
}

// Navigation
function prevPeriod() {
  const d = new Date(currentDate.value)
  if (view.value === 'week') d.setDate(d.getDate() - 7)
  else d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function nextPeriod() {
  const d = new Date(currentDate.value)
  if (view.value === 'week') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

function goToday() {
  currentDate.value = new Date()
}

// Modal
function openAddEvent(dateStr) {
  selectedDate.value = dateStr
  editEventData.value = null
  savedEvent.value = null
  formTitle.value = ''
  formDate.value = dateStr || todayStr
  formTime.value = '09:00'
  formEndTime.value = '10:00'
  formColor.value = 'teal'
  formNote.value = ''
  formAccount.value = ''
  showAddEvent.value = true
}

function openEditEvent(ev) {
  editEventData.value = ev
  savedEvent.value = null
  formTitle.value = ev.title || ''
  formDate.value = ev.date || ''
  formTime.value = ev.time || '09:00'
  formEndTime.value = ev.endTime || '10:00'
  formColor.value = ev.color || 'teal'
  formNote.value = ev.note || ''
  formAccount.value = ev.account || ''
  showAddEvent.value = true
}

function closeModal() {
  showAddEvent.value = false
  editEventData.value = null
  savedEvent.value = null
}

function handleSave() {
  if (!formTitle.value.trim() || !formDate.value) return
  const ev = {
    id: editEventData.value?.id || Date.now().toString(),
    title: formTitle.value.trim(),
    date: formDate.value,
    time: formTime.value,
    endTime: formEndTime.value,
    color: formColor.value,
    note: formNote.value,
    account: formAccount.value,
    createdAt: editEventData.value?.createdAt || new Date().toISOString()
  }
  const idx = events.value.findIndex(e => e.id === ev.id)
  if (idx >= 0) {
    const updated = [...events.value]
    updated[idx] = ev
    events.value = updated
  } else {
    events.value = [...events.value, ev]
  }
  saveAll()
  savedEvent.value = ev
}

function deleteEvent(id) {
  events.value = events.value.filter(e => e.id !== id)
  saveAll()
  showAddEvent.value = false
  editEventData.value = null
}

async function saveAll() {
  try {
    await planningApi.saveEvents(events.value)
  } catch (e) {
    console.error('saveAll error:', e)
  }
}

// Calendar export helpers
function toICSDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T${timeStr || '00:00'}:00`)
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildGoogleLink(ev) {
  const start = toICSDate(ev.date, ev.time)
  const end = toICSDate(ev.date, ev.endTime || ev.time)
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${start}/${end}`,
    details: [ev.note, ev.account ? `Client: ${ev.account}` : ''].filter(Boolean).join('\n')
  })
  return `https://www.google.com/calendar/render?${p.toString()}`
}

function buildOutlookLink(ev) {
  const start = `${ev.date}T${ev.time || '09:00'}:00`
  const end = `${ev.date}T${ev.endTime || ev.time || '10:00'}:00`
  const p = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: ev.title,
    startdt: start,
    enddt: end,
    body: [ev.note, ev.account ? `Client: ${ev.account}` : ''].filter(Boolean).join('\n')
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`
}

function doExportICS(evs, filename) {
  filename = filename || 'scalyo-planning.ics'
  const dtFmt = (ds, ts) => {
    if (!ds) return ''
    const [y, m, d] = ds.split('-')
    const [h, mi] = (ts || '09:00').split(':')
    return y + m + d + 'T' + h + mi + '00'
  }
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Scalyo//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  evs.forEach(function (ev) {
    lines.push('BEGIN:VEVENT')
    lines.push('UID:' + ev.id + '@scalyo')
    lines.push('DTSTAMP:' + dtFmt(new Date().toISOString().slice(0, 10), '00:00'))
    lines.push('DTSTART:' + dtFmt(ev.date, ev.time))
    lines.push('DTEND:' + dtFmt(ev.date, ev.endTime || ev.time))
    lines.push('SUMMARY:' + ev.title)
    if (ev.note) lines.push('DESCRIPTION:' + ev.note.replace(/\n/g, '\\n'))
    lines.push('END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
