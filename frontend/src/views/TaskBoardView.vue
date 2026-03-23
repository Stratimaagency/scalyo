<template>
  <div class="fade-in">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px">
      <div>
        <h3 style="font-weight: 900; font-size: 22px; letter-spacing: -0.5px; margin-bottom: 3px">{{ t('tasks') }}</h3>
        <p style="font-size: 12px; color: var(--muted)">
          {{ stats.total }} {{ t('taskActiveCount') }} · {{ stats.done }} {{ t('taskDoneCount') }}
          <template v-if="stats.overdue > 0"> · <span style="color: var(--red)">{{ stats.overdue }} {{ t('overdue') }}</span></template>
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <!-- Tab switcher -->
        <div style="display: flex; gap: 2px; background: var(--surface); border-radius: 10px; padding: 3px; border: 1px solid var(--border)">
          <button
            v-for="tab in tabs" :key="tab.key"
            @click="switchTab(tab.key)"
            :style="{
              padding: '6px 16px', borderRadius: '8px', fontSize: '13px',
              fontWeight: activeTab === tab.key ? 700 : 500,
              border: 'none', cursor: 'pointer', transition: 'all .15s',
              background: activeTab === tab.key ? 'var(--bg)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text)' : 'var(--muted)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(45,42,38,0.06)' : 'none'
            }"
          >{{ tab.icon }} {{ tab.label }}</button>
        </div>
        <button class="btn btn-primary" @click="openAdd()">+ {{ t('newTask') }}</button>
      </div>
    </div>

    <!-- Filter chips -->
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px">
      <button
        class="chip" :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >{{ t('taskAll') }}</button>
      <button
        class="chip" :class="{ active: filter === 'done' }"
        @click="filter = 'done'"
      >{{ t('taskDone') }}</button>
      <button
        v-for="col in TASK_COLORS" :key="col.id"
        class="chip" :class="{ active: filter === col.id }"
        @click="filter = col.id"
        :style="filter === col.id ? { borderColor: col.hex, background: col.hex + '15', color: col.hex } : {}"
      >{{ colorLabel(col) }}</button>
    </div>

    <!-- ═══ EISENHOWER MATRIX VIEW ═══ -->
    <div v-if="activeTab === 'eisenhower'" style="flex: 1; overflow: auto">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: 400px">
        <div
          v-for="q in QUADS" :key="q.id"
          :style="{
            background: q.bg, border: '1.5px solid ' + q.border, borderRadius: '8px',
            padding: '14px', display: 'flex', flexDirection: 'column', minHeight: '180px'
          }"
        >
          <!-- Quadrant header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <div>
              <div :style="{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: q.accent }">
                {{ q.icon }} {{ quadLabel(q) }}
                <span :style="{
                  fontSize: '10px', background: q.accent + '22', color: q.accent,
                  borderRadius: '6px', padding: '1px 7px', fontWeight: 700
                }">{{ quadrantActiveTasks(q.id).length }}</span>
              </div>
              <div style="font-size: 10px; color: var(--muted); margin-top: 1px">{{ quadSub(q) }}</div>
            </div>
            <button
              @click="openAdd(q.id)"
              :style="{
                width: '24px', height: '24px', borderRadius: '7px', border: '1px solid ' + q.border,
                background: q.bg, color: q.accent, cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0
              }"
            >+</button>
          </div>

          <!-- Tasks in quadrant -->
          <div style="flex: 1">
            <div
              v-if="quadrantActiveTasks(q.id).length === 0"
              :style="{
                textAlign: 'center', padding: '20px 10px', color: 'var(--muted)', fontSize: '11px',
                border: '1px dashed ' + q.border, borderRadius: '10px'
              }"
            >{{ t('taskDrop') }}</div>

            <TaskCard
              v-for="task in quadrantActiveTasks(q.id)" :key="task.id"
              :task="task"
              @toggle="toggleTask"
              @delete="deleteTask"
              @edit="openEdit"
              @move="moveTask"
            />

            <!-- Done tasks in this quadrant -->
            <div v-if="quadrantDoneTasks(q.id).length > 0" style="margin-top: 8px; opacity: 0.6">
              <div style="font-size: 10px; color: var(--muted); margin-bottom: 5px">
                {{ quadrantDoneTasks(q.id).length }} {{ t('taskDoneCount') }}
              </div>
              <TaskCard
                v-for="task in quadrantDoneTasks(q.id)" :key="task.id"
                :task="task"
                @toggle="toggleTask"
                @delete="deleteTask"
                @edit="openEdit"
                @move="moveTask"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ KANBAN BOARD VIEW ═══ -->
    <div v-else style="flex: 1; overflow: auto">
      <div style="display: flex; gap: 14px; min-height: 400px">
        <div
          v-for="col in kanbanColumns" :key="col.key"
          @dragover.prevent
          @drop="handleDrop($event, col.key)"
          :style="{
            flex: 1, background: 'var(--surface)', borderRadius: '8px', padding: '14px',
            border: '1px solid var(--border)', minHeight: '300px', overflow: 'auto'
          }"
        >
          <!-- Column header -->
          <div :style="{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: col.color }">
            {{ col.icon }} {{ col.label }}
            <span :style="{
              fontSize: '11px', background: col.color + '22', border: '1px solid ' + col.color + '44',
              padding: '2px 8px', borderRadius: '16px', color: col.color, fontWeight: 700
            }">{{ kanbanTasks(col.key).length }}</span>
          </div>

          <!-- Empty state -->
          <div
            v-if="kanbanTasks(col.key).length === 0"
            style="font-size: 12px; color: var(--muted); text-align: center; padding: 20px; border: 1px dashed var(--border); border-radius: 8px"
          >{{ t('noTasks') }}</div>

          <!-- Kanban task cards -->
          <div
            v-for="task in kanbanTasks(col.key)" :key="task.id"
            draggable="true"
            @dragstart="dragItem = { task, fromCol: col.key }"
            @click="openEdit(task)"
            :style="{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderLeft: '3px solid ' + taskColorHex(task),
              borderRadius: '6px', padding: '12px 14px', marginBottom: '8px',
              cursor: 'grab', transition: 'border-color .15s'
            }"
          >
            <div :style="{
              fontSize: '13px', fontWeight: 600, marginBottom: '4px',
              textDecoration: task.done ? 'line-through' : 'none',
              opacity: task.done ? 0.6 : 1
            }">{{ task.title }}</div>
            <div style="font-size: 11px; color: var(--muted); display: flex; justify-content: space-between; align-items: center">
              <span>{{ task.account || '' }}</span>
              <span v-if="task.dueDate" :style="{ color: isOverdue(task) ? 'var(--red)' : 'var(--muted)' }">
                {{ task.dueDate }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CS TIPS SECTION ═══ -->
    <div v-if="currentTip" style="margin-top: 18px; background: rgba(167,139,250,0.08); border: 1px solid rgba(167,139,250,0.22); border-radius: 6px; padding: 12px 16px; font-size: 12.5px; color: var(--text); line-height: 1.7; position: relative">
      <span style="font-weight: 800; color: #9B6BDF">CS Tip &nbsp;</span>
      {{ currentTip }}
      <button
        @click="rotateTip"
        style="position: absolute; top: 8px; right: 36px; background: none; border: none; cursor: pointer; color: var(--muted); font-size: 14px"
        title="Next tip"
      >&#8635;</button>
      <button
        @click="currentTip = ''"
        style="position: absolute; top: 8px; right: 10px; background: none; border: none; cursor: pointer; color: var(--muted); font-size: 16px"
      >&times;</button>
    </div>

    <!-- ═══ ADD/EDIT TASK MODAL ═══ -->
    <AppModal v-if="showModal" :title="editingTask ? t('editTask') : t('newTask')" max-width="480px" @close="closeModal">
      <!-- Title -->
      <input
        v-model="form.title"
        :placeholder="t('taskTitle')"
        class="field-input"
        style="width: 100%; font-weight: 600; font-size: 14px; margin-bottom: 12px"
      />

      <!-- Note -->
      <textarea
        v-model="form.note"
        :placeholder="t('taskNote')"
        rows="2"
        class="field-input"
        style="width: 100%; resize: vertical; margin-bottom: 12px"
      />

      <!-- Color picker -->
      <div style="margin-bottom: 14px">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px">
          {{ t('taskColor') }}
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <button
            v-for="col in TASK_COLORS" :key="col.id"
            @click="form.color = col.id"
            :style="{
              padding: '5px 11px', borderRadius: '16px', fontSize: '11px', fontWeight: 700,
              cursor: 'pointer',
              background: form.color === col.id ? col.hex + '33' : 'transparent',
              color: form.color === col.id ? col.hex : 'var(--muted)',
              border: '1.5px solid ' + (form.color === col.id ? col.hex : 'var(--border)'),
              transition: 'all .12s'
            }"
          >{{ colorLabel(col) }}</button>
        </div>
      </div>

      <!-- Quadrant selector (2x2 grid) -->
      <div style="margin-bottom: 14px">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px">
          {{ t('taskQuadrant') }}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px">
          <button
            v-for="q in QUADS" :key="q.id"
            @click="form.quadrant = q.id"
            :style="{
              padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', transition: 'all .12s', lineHeight: 1.3,
              border: '1.5px solid ' + (form.quadrant === q.id ? q.accent : 'var(--border)'),
              background: form.quadrant === q.id ? q.bg : 'transparent',
              color: form.quadrant === q.id ? q.accent : 'var(--muted)'
            }"
          >
            {{ q.icon }} {{ quadLabel(q) }}
            <div style="font-size: 9px; opacity: 0.7">{{ quadSub(q) }}</div>
          </button>
        </div>
      </div>

      <!-- Due date + Account -->
      <div style="display: flex; gap: 10px; margin-bottom: 16px">
        <div style="flex: 1">
          <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 5px">{{ t('taskDue') }}</div>
          <input type="date" v-model="form.dueDate" class="field-input" style="width: 100%" />
        </div>
        <div v-if="accounts.length > 0" style="flex: 1">
          <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 5px">{{ t('taskAccount') }}</div>
          <select v-model="form.account" class="field-input" style="width: 100%">
            <option value="">{{ t('taskNone') }}</option>
            <option v-for="a in accounts" :key="a.id" :value="a.name">{{ a.name }}</option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 8px">
        <button
          v-if="editingTask"
          class="btn btn-danger"
          style="flex: 0 0 auto; padding: 12px 16px"
          @click="deleteTask(editingTask.id); closeModal()"
        >{{ t('delete') }}</button>
        <button
          class="btn btn-secondary"
          style="flex: 1; padding: 12px"
          @click="closeModal"
        >{{ t('cancel') }}</button>
        <button
          class="btn btn-primary"
          style="flex: 2; padding: 12px; font-weight: 800"
          :disabled="!form.title.trim()"
          @click="saveTask"
        >{{ editingTask ? t('taskUpdate') : t('taskAdd') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import * as Vue from 'vue'
const { ref, reactive, computed, onMounted } = Vue
import { taskApi } from '../api'
import { useI18n } from '../i18n'
import { usePortfolioStore } from '../stores/portfolio'
import { usePreferencesStore } from '../stores/preferences'
import AppModal from '../components/AppModal.vue'

const { t, lang } = useI18n()
const portfolioStore = usePortfolioStore()
const prefsStore = usePreferencesStore()

// ── Constants ──

const TASK_COLORS = [
  { id: 'red',    hex: '#EF4444', label: 'Critique',    labelEn: 'Critical',  labelKr: '긴급' },
  { id: 'orange', hex: '#F97316', label: 'Prioritaire', labelEn: 'Priority',  labelKr: '우선' },
  { id: 'yellow', hex: '#EAB308', label: 'A planifier', labelEn: 'Plan it',   labelKr: '계획' },
  { id: 'teal',   hex: '#4DB6A0', label: 'En cours',    labelEn: 'Ongoing',   labelKr: '진행 중' },
  { id: 'blue',   hex: '#3B82F6', label: 'Reflexion',   labelEn: 'Thinking',  labelKr: '검토 중' },
  { id: 'purple', hex: '#9B6BDF', label: 'Deleguer',    labelEn: 'Delegate',  labelKr: '위임' },
]

const QUADS = [
  {
    id: 'q1', icon: '🔥',
    label: 'Faire maintenant', labelEn: 'Do it now', labelKr: '지금 당장',
    sub: 'Urgent + Important', subEn: 'Urgent + Important', subKr: '긴급 + 중요',
    bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', accent: '#EF4444'
  },
  {
    id: 'q2', icon: '🎯',
    label: 'Planifier', labelEn: 'Schedule it', labelKr: '계획하기',
    sub: 'Important + Pas urgent', subEn: 'Important + Not urgent', subKr: '중요 + 긴급하지 않음',
    bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)', accent: '#3B82F6'
  },
  {
    id: 'q3', icon: '📤',
    label: 'Deleguer', labelEn: 'Delegate', labelKr: '위임하기',
    sub: 'Urgent + Pas important', subEn: 'Urgent + Not important', subKr: '긴급 + 중요하지 않음',
    bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', accent: '#E8A838'
  },
  {
    id: 'q4', icon: '🗑️',
    label: 'Eliminer', labelEn: 'Drop it', labelKr: '제거하기',
    sub: 'Ni urgent ni important', subEn: 'Neither urgent nor important', subKr: '긴급하지도 중요하지도 않음',
    bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.18)', accent: '#64748B'
  },
]

const CS_TIPS = {
  en: [
    'A proactive check-in before renewal reduces churn by 40%.',
    'EBR preparation: gather 3 wins + 1 challenge per account.',
    'Segment your at-risk accounts: intent-to-churn vs. passive-risk.',
    'Set up automated health alerts to catch drops early.',
    'One personalized email beats five generic follow-ups.',
  ],
  fr: [
    'Un check-in proactif avant renouvellement reduit le churn de 40%.',
    'Preparation EBR : 3 victoires + 1 defi par compte.',
    'Segmentez vos comptes a risque : intention de churn vs. risque passif.',
    'Configurez des alertes health score automatiques.',
    'Un email personnalise vaut mieux que 5 relances generiques.',
  ],
  kr: [
    '갱신 전 사전 체크인은 이탈률을 40% 줄여줍니다.',
    'EBR 준비: 계정당 3개의 성과 + 1개의 과제를 수집하세요.',
    '위험 계정을 세분화하세요: 이탈 의도 vs. 수동적 위험.',
    '자동 헬스 스코어 알림을 설정하세요.',
    '개인화된 이메일 한 통이 일반 후속 메일 5통보다 낫습니다.',
  ],
}

// ── State ──

const tasks = ref([])
const showModal = ref(false)
const editingTask = ref(null)
const filter = ref('all')
const activeTab = ref('eisenhower')
const dragItem = ref(null)
const currentTip = ref('')
const tipIndex = ref(0)

const form = reactive({
  title: '', note: '', color: 'teal', quadrant: 'q1', dueDate: '', account: ''
})

const tabs = computed(() => [
  { key: 'eisenhower', label: t('eisenhowerView'), icon: '🎯' },
  { key: 'kanban', label: t('kanbanView'), icon: '📋' },
])

const accounts = computed(() => portfolioStore.accounts || [])

const kanbanColumns = computed(() => [
  { key: 'todo', label: t('todoCol'), color: '#E8A838', icon: '⏳' },
  { key: 'in_progress', label: t('inProgressCol'), color: '#3B82F6', icon: '🔄' },
  { key: 'done', label: t('doneCol'), color: '#4DAB6D', icon: '✅' },
])

// ── Computed ──

const stats = computed(() => ({
  total: tasks.value.filter(t => !t.done).length,
  done: tasks.value.filter(t => t.done).length,
  overdue: tasks.value.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.done).length,
}))

const filtered = computed(() => {
  if (filter.value === 'all') return tasks.value
  if (filter.value === 'done') return tasks.value.filter(t => t.done)
  return tasks.value.filter(t => t.color === filter.value && !t.done)
})

// ── Init ──

onMounted(async () => {
  // Load from API with localStorage fallback
  try {
    const { data } = await taskApi.getTasks()
    tasks.value = data.tasks || data || []
  } catch {
    try {
      const raw = localStorage.getItem('scalyo_tasks')
      if (raw) tasks.value = JSON.parse(raw)
    } catch {}
  }

  // Restore tab preference
  try {
    const saved = localStorage.getItem('scalyo_taskboard_tab')
    if (saved) activeTab.value = saved
  } catch {}

  // Load portfolio accounts if not already loaded
  if (!portfolioStore.accounts.length) {
    portfolioStore.fetchAccounts()
  }

  // Show initial CS tip
  rotateTip()
})

// ── Helpers ──

function colorLabel(col) {
  if (lang.value === 'en') return col.labelEn
  if (lang.value === 'kr') return col.labelKr || col.label
  return col.label
}

function quadLabel(q) {
  if (lang.value === 'en') return q.labelEn
  if (lang.value === 'kr') return q.labelKr || q.label
  return q.label
}

function quadSub(q) {
  if (lang.value === 'en') return q.subEn
  if (lang.value === 'kr') return q.subKr || q.subEn
  return q.sub
}

function taskColorHex(task) {
  const col = TASK_COLORS.find(c => c.id === task.color)
  return col ? col.hex : TASK_COLORS[0].hex
}

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && !task.done
}

function switchTab(tab) {
  activeTab.value = tab
  try { localStorage.setItem('scalyo_taskboard_tab', tab) } catch {}
}

// ── Eisenhower helpers ──

function quadrantActiveTasks(qId) {
  return filtered.value.filter(t => t.quadrant === qId && !t.done)
}

function quadrantDoneTasks(qId) {
  return filtered.value.filter(t => t.quadrant === qId && t.done)
}

// ── Kanban helpers ──

function kanbanTasks(colKey) {
  if (colKey === 'done') return filtered.value.filter(t => t.done)
  if (colKey === 'in_progress') return filtered.value.filter(t => !t.done && (t.quadrant === 'q1' || t.quadrant === 'q2'))
  // todo
  return filtered.value.filter(t => !t.done && (t.quadrant === 'q3' || t.quadrant === 'q4'))
}

function handleDrop(e, toCol) {
  e.preventDefault()
  if (!dragItem.value) return
  const { task, fromCol } = dragItem.value
  if (fromCol === toCol) { dragItem.value = null; return }

  let updated
  if (toCol === 'done') {
    updated = { ...task, done: true }
  } else if (toCol === 'in_progress') {
    updated = { ...task, done: false, quadrant: (task.quadrant === 'q3' || task.quadrant === 'q4') ? 'q1' : task.quadrant }
  } else {
    updated = { ...task, done: false, quadrant: (task.quadrant === 'q1' || task.quadrant === 'q2') ? 'q3' : task.quadrant }
  }

  tasks.value = tasks.value.map(t => t.id === task.id ? updated : t)
  dragItem.value = null
  saveAll()
}

// ── Task CRUD ──

function toggleTask(id) {
  tasks.value = tasks.value.map(t => t.id === id ? { ...t, done: !t.done } : t)
  saveAll()
}

function deleteTask(id) {
  tasks.value = tasks.value.filter(t => t.id !== id)
  saveAll()
}

function moveTask(id, quad) {
  tasks.value = tasks.value.map(t => t.id === id ? { ...t, quadrant: quad } : t)
  saveAll()
}

function openAdd(defaultQuad = 'q1') {
  editingTask.value = null
  Object.assign(form, { title: '', note: '', color: 'teal', quadrant: defaultQuad, dueDate: '', account: '' })
  showModal.value = true
}

function openEdit(task) {
  editingTask.value = task
  Object.assign(form, {
    title: task.title || '',
    note: task.note || '',
    color: task.color || 'teal',
    quadrant: task.quadrant || 'q1',
    dueDate: task.dueDate || '',
    account: task.account || '',
  })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTask.value = null
}

function saveTask() {
  if (!form.title.trim()) return
  const taskData = {
    id: editingTask.value?.id || Date.now().toString(),
    title: form.title.trim(),
    note: form.note.trim(),
    color: form.color,
    quadrant: form.quadrant,
    dueDate: form.dueDate,
    account: form.account,
    done: editingTask.value?.done || false,
    createdAt: editingTask.value?.createdAt || new Date().toISOString(),
  }

  const idx = tasks.value.findIndex(t => t.id === taskData.id)
  if (idx >= 0) {
    tasks.value.splice(idx, 1, taskData)
  } else {
    tasks.value.push(taskData)
  }

  closeModal()
  saveAll()
}

async function saveAll() {
  // Save to localStorage as fallback
  try { localStorage.setItem('scalyo_tasks', JSON.stringify(tasks.value)) } catch {}
  // Save to API
  try { await taskApi.saveTasks(tasks.value) } catch {}
}

// ── CS Tips ──

function rotateTip() {
  const l = lang.value || 'en'
  const tips = CS_TIPS[l] || CS_TIPS.en
  currentTip.value = tips[tipIndex.value % tips.length]
  tipIndex.value++
}
</script>

<script>
// TaskCard sub-component defined inline
const TaskCard = {
  name: 'TaskCard',
  props: {
    task: { type: Object, required: true },
  },
  emits: ['toggle', 'delete', 'edit', 'move'],
  setup(props, { emit }) {
    const { ref, computed } = Vue
    const hover = ref(false)

    const TASK_COLORS = [
      { id: 'red',    hex: '#EF4444' },
      { id: 'orange', hex: '#F97316' },
      { id: 'yellow', hex: '#EAB308' },
      { id: 'teal',   hex: '#4DB6A0' },
      { id: 'blue',   hex: '#3B82F6' },
      { id: 'purple', hex: '#9B6BDF' },
    ]

    const QUADS = [
      { id: 'q1', icon: '🔥', label: 'Do it now' },
      { id: 'q2', icon: '🎯', label: 'Schedule it' },
      { id: 'q3', icon: '📤', label: 'Delegate' },
      { id: 'q4', icon: '🗑️', label: 'Drop it' },
    ]

    const col = computed(() => TASK_COLORS.find(c => c.id === props.task.color) || TASK_COLORS[0])
    const isOverdue = computed(() => props.task.dueDate && new Date(props.task.dueDate) < new Date() && !props.task.done)
    const otherQuads = computed(() => QUADS.filter(q => q.id !== props.task.quadrant))

    return { hover, col, isOverdue, otherQuads, QUADS }
  },
  template: `
    <div
      :style="{
        background: hover ? 'var(--surface-hi, var(--surface))' : 'var(--surface)',
        border: '1px solid ' + (hover ? col.hex + '55' : 'var(--border)'),
        borderLeft: '3px solid ' + col.hex,
        borderRadius: '6px', padding: '11px 13px', marginBottom: '8px',
        transition: 'all .15s ease', cursor: 'pointer', position: 'relative',
        opacity: task.done ? 0.55 : 1
      }"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <div style="display: flex; align-items: flex-start; gap: 8px">
        <div
          @click.stop="$emit('toggle', task.id)"
          :style="{
            width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '2px', cursor: 'pointer',
            border: '2px solid ' + (task.done ? col.hex : 'var(--border)'),
            background: task.done ? col.hex : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
          }"
        >
          <span v-if="task.done" style="font-size: 9px; color: #fff">✓</span>
        </div>
        <div style="flex: 1; min-width: 0">
          <div :style="{
            fontSize: '13px', fontWeight: task.done ? 400 : 600,
            color: task.done ? 'var(--muted)' : 'var(--text)',
            textDecoration: task.done ? 'line-through' : 'none',
            marginBottom: task.note ? '3px' : '0',
            wordBreak: 'break-word'
          }">{{ task.title }}</div>
          <div v-if="task.note" style="font-size: 11px; color: var(--muted); line-height: 1.4">{{ task.note }}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; gap: 6px">
        <div style="display: flex; align-items: center; gap: 5px">
          <span :style="{
            fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px',
            background: col.hex + '22', color: col.hex
          }">{{ task.color || 'teal' }}</span>
          <span v-if="isOverdue" style="font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(239,68,68,0.12); color: #EF4444">Overdue</span>
          <span v-if="task.dueDate && !isOverdue" style="font-size: 10px; color: var(--muted)">{{ task.dueDate }}</span>
        </div>
        <div style="display: flex; gap: 4px">
          <button @click.stop="$emit('edit', task)" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--muted); padding: 2px 4px; border-radius: 4px">✏️</button>
          <button @click.stop="$emit('delete', task.id)" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--muted); padding: 2px 4px; border-radius: 4px">🗑</button>
          <select
            @change="if($event.target.value) { $emit('move', task.id, $event.target.value); $event.target.value = ''; }"
            @click.stop
            value=""
            style="font-size: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--muted); padding: 2px 4px; cursor: pointer"
          >
            <option value="">→</option>
            <option v-for="q in otherQuads" :key="q.id" :value="q.id">{{ q.icon }} {{ q.label }}</option>
          </select>
        </div>
      </div>
    </div>
  `
}

export default {
  components: { TaskCard }
}
</script>
