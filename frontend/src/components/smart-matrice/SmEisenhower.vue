<template>
  <div class="sm-eisen-wrap">
    <!-- Unsorted tasks panel (left sidebar) -->
    <div class="sm-eisen__inbox">
      <h4 class="sm-eisen__inbox-title">📋 {{ t('eisUnsorted') }} ({{ unsortedTasks.length }})</h4>
      <p class="sm-eisen__inbox-hint">{{ t('eisDragHint') }}</p>

      <!-- Group by project or group_name -->
      <div v-for="(group, gName) in unsortedGrouped" :key="gName" class="sm-eisen__inbox-group">
        <div class="sm-eisen__inbox-group-head" @click="toggleGroup(gName)">
          <span class="sm-eisen__inbox-chevron">{{ openGroups[gName] ? '▾' : '▸' }}</span>
          <span class="sm-eisen__inbox-group-name">{{ gName }}</span>
          <span class="sm-eisen__inbox-group-count">{{ group.length }}</span>
        </div>
        <div v-if="openGroups[gName]" class="sm-eisen__inbox-tasks">
          <div v-for="task in group" :key="task.id" class="sm-eisen__inbox-item"
            draggable="true" @dragstart="onDragStart($event, task)" @click="$emit('edit-task', task)">
            <span class="sm-eisen__inbox-item-status" :class="'sm-eisen__inbox-item-status--' + task.status"></span>
            <span class="sm-eisen__inbox-item-name">{{ task.name }}</span>
            <!-- Quick assign buttons -->
            <div class="sm-eisen__inbox-quick">
              <button @click.stop="quickAssign(task, 1)" :title="t('eisDoNow')">🔴</button>
              <button @click.stop="quickAssign(task, 2)" :title="t('eisSchedule')">🟢</button>
              <button @click.stop="quickAssign(task, 3)" :title="t('eisDelegate')">🔵</button>
              <button @click.stop="quickAssign(task, 4)" :title="t('eisEliminate')">⚪</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!unsortedTasks.length" class="sm-eisen__inbox-empty">{{ t('eisAllSorted') }}</div>
    </div>

    <!-- Eisenhower matrix -->
    <div class="sm-eisen">
      <div class="sm-eisen__corner">🎯</div>
      <div class="sm-eisen__header sm-eisen__header--top">⚡ Urgent</div>
      <div class="sm-eisen__header sm-eisen__header--top">📅 Pas urgent</div>
      <div class="sm-eisen__header sm-eisen__header--left">🎯 Important</div>

      <!-- Q1: Urgent + Important = FAIRE -->
      <div class="sm-eisen__quad sm-eisen__quad--q1" @dragover.prevent @dragenter.prevent="dragOver = 1" @dragleave="dragOver = null" @drop="onDrop($event, 1)" :class="{ 'sm-eisen__quad--hover': dragOver === 1 }">
        <div class="sm-eisen__quad-label">🔴 {{ t('eisDoNow') }}</div>
        <div v-for="task in q(1)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)" @click="$emit('edit-task', task)">
          <span class="sm-eisen__item-name">{{ task.name }}</span>
          <span class="sm-eisen__item-status" :class="'sm-eisen__item-status--' + task.status">{{ statusLabel(task.status) }}</span>
          <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" :title="t('eisTransferTitle')">↗</button>
        </div>
        <div v-if="!q(1).length" class="sm-eisen__drop-hint">{{ t('eisDragHere') }}</div>
      </div>

      <!-- Q2: Important + Pas urgent = PLANIFIER -->
      <div class="sm-eisen__quad sm-eisen__quad--q2" @dragover.prevent @dragenter.prevent="dragOver = 2" @dragleave="dragOver = null" @drop="onDrop($event, 2)" :class="{ 'sm-eisen__quad--hover': dragOver === 2 }">
        <div class="sm-eisen__quad-label">🟢 {{ t('eisSchedule') }}</div>
        <div v-for="task in q(2)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)" @click="$emit('edit-task', task)">
          <span class="sm-eisen__item-name">{{ task.name }}</span>
          <span class="sm-eisen__item-status" :class="'sm-eisen__item-status--' + task.status">{{ statusLabel(task.status) }}</span>
          <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" :title="t('eisTransferTitle')">↗</button>
        </div>
        <div v-if="!q(2).length" class="sm-eisen__drop-hint">{{ t('eisDragHere') }}</div>
      </div>

      <div class="sm-eisen__header sm-eisen__header--left">⬇ Pas important</div>

      <!-- Q3: Urgent + Pas important = DELEGUER -->
      <div class="sm-eisen__quad sm-eisen__quad--q3" @dragover.prevent @dragenter.prevent="dragOver = 3" @dragleave="dragOver = null" @drop="onDrop($event, 3)" :class="{ 'sm-eisen__quad--hover': dragOver === 3 }">
        <div class="sm-eisen__quad-label">🔵 {{ t('eisDelegate') }}</div>
        <div v-for="task in q(3)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)" @click="$emit('edit-task', task)">
          <span class="sm-eisen__item-name">{{ task.name }}</span>
          <span class="sm-eisen__item-status" :class="'sm-eisen__item-status--' + task.status">{{ statusLabel(task.status) }}</span>
          <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" :title="t('eisTransferTitle')">↗</button>
        </div>
        <div v-if="!q(3).length" class="sm-eisen__drop-hint">{{ t('eisDragHere') }}</div>
      </div>

      <!-- Q4: Pas urgent + Pas important = ELIMINER -->
      <div class="sm-eisen__quad sm-eisen__quad--q4" @dragover.prevent @dragenter.prevent="dragOver = 4" @dragleave="dragOver = null" @drop="onDrop($event, 4)" :class="{ 'sm-eisen__quad--hover': dragOver === 4 }">
        <div class="sm-eisen__quad-label">⚪ {{ t('eisEliminate') }}</div>
        <div v-for="task in q(4)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)" @click="$emit('edit-task', task)">
          <span class="sm-eisen__item-name">{{ task.name }}</span>
          <span class="sm-eisen__item-status" :class="'sm-eisen__item-status--' + task.status">{{ statusLabel(task.status) }}</span>
          <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" :title="t('eisTransferTitle')">↗</button>
        </div>
        <div v-if="!q(4).length" class="sm-eisen__drop-hint">{{ t('eisDragHere') }}</div>
      </div>
    </div>

    <!-- Transfer overlay -->
    <div v-if="transferringTask" class="sm-eisen__transfer-overlay" @click.self="transferringTask = null">
      <div class="sm-eisen__transfer-box">
        <h4>{{ t('eisTransferTitle') }} « {{ transferringTask.name }} »</h4>
        <div v-for="m in team" :key="m.id" class="sm-eisen__transfer-item" @click="doTransfer(m.id)">
          <span class="sm-eisen__transfer-avatar">{{ m.initials }}</span>
          {{ m.display_name || m.email }}
        </div>
        <button class="sm-eisen__transfer-cancel" @click="transferringTask = null">{{ t('cancelBtn') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const props = defineProps({
  tasks: { type: Array, required: true },
  team: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-quadrant', 'transfer', 'edit-task'])

const transferringTask = ref(null)
const dragOver = ref(null)
const openGroups = reactive({})

// Tasks already in a quadrant (1-4)
function q(num) {
  return props.tasks.filter(t => t.quadrant === num)
}

// Tasks NOT in any quadrant (quadrant === 0 or undefined)
const unsortedTasks = computed(() => {
  return props.tasks.filter(t => !t.quadrant || t.quadrant === 0)
})

// Group unsorted by group_name
const unsortedGrouped = computed(() => {
  const groups = {}
  for (const tk of unsortedTasks.value) {
    const g = tk.group_name || t('defaultGroup')
    if (!groups[g]) { groups[g] = []; if (openGroups[g] === undefined) openGroups[g] = true }
    groups[g].push(tk)
  }
  return groups
})

function toggleGroup(name) {
  openGroups[name] = !openGroups[name]
}

function statusLabel(s) {
  if (s === 'done') return '✅'
  if (s === 'in_progress') return '⚡'
  if (s === 'blocked') return '⏸'
  return ''
}

function quickAssign(task, quadrant) {
  emit('update-quadrant', task.id, quadrant)
}

let draggedTask = null
function onDragStart(e, task) {
  draggedTask = task
  e.dataTransfer.effectAllowed = 'move'
}
function onDrop(e, quadrant) {
  dragOver.value = null
  if (draggedTask && draggedTask.quadrant !== quadrant) {
    emit('update-quadrant', draggedTask.id, quadrant)
  }
  draggedTask = null
}

function startTransfer(task) { transferringTask.value = task }
function doTransfer(memberId) {
  emit('transfer', transferringTask.value.id, memberId)
  transferringTask.value = null
}
</script>

<style scoped>
.sm-eisen-wrap { display: flex; gap: 16px; font-family: 'DM Sans', sans-serif; position: relative; }

/* Inbox sidebar */
.sm-eisen__inbox { width: 260px; flex-shrink: 0; background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: var(--sm-r); padding: 14px; max-height: 600px; overflow-y: auto; }
.sm-eisen__inbox-title { font-size: 14px; font-weight: 700; color: var(--sm-t1); margin: 0 0 4px; }
.sm-eisen__inbox-hint { font-size: 11px; color: var(--sm-t3); margin: 0 0 12px; }
.sm-eisen__inbox-group { margin-bottom: 6px; }
.sm-eisen__inbox-group-head { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--sm-t1); }
.sm-eisen__inbox-group-head:hover { background: var(--sm-bg); }
.sm-eisen__inbox-chevron { font-size: 10px; color: var(--sm-t3); width: 14px; }
.sm-eisen__inbox-group-name { flex: 1; }
.sm-eisen__inbox-group-count { font-size: 10px; color: var(--sm-t3); background: var(--sm-bg); border-radius: 10px; padding: 1px 7px; }
.sm-eisen__inbox-tasks { padding-left: 8px; }
.sm-eisen__inbox-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 6px; cursor: grab; font-size: 12px; color: var(--sm-t1); border: 1px solid transparent; margin-bottom: 2px; }
.sm-eisen__inbox-item:hover { background: var(--sm-bg); border-color: var(--sm-bd); }
.sm-eisen__inbox-item:active { cursor: grabbing; }
.sm-eisen__inbox-item-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: var(--sm-t3); }
.sm-eisen__inbox-item-status--todo { background: #94a3b8; }
.sm-eisen__inbox-item-status--in_progress { background: var(--sm-warn); }
.sm-eisen__inbox-item-status--blocked { background: var(--sm-info); }
.sm-eisen__inbox-item-status--done { background: var(--sm-ok); }
.sm-eisen__inbox-item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-eisen__inbox-quick { display: none; gap: 2px; }
.sm-eisen__inbox-item:hover .sm-eisen__inbox-quick { display: flex; }
.sm-eisen__inbox-quick button { border: none; background: none; cursor: pointer; font-size: 12px; padding: 0 2px; opacity: .6; }
.sm-eisen__inbox-quick button:hover { opacity: 1; transform: scale(1.2); }
.sm-eisen__inbox-empty { font-size: 12px; color: var(--sm-ok); text-align: center; padding: 20px 10px; }

/* Matrix grid */
.sm-eisen {
  flex: 1;
  display: grid; grid-template-columns: 48px 1fr 1fr; grid-template-rows: 36px 1fr 36px 1fr;
  gap: 2px; min-height: 500px;
}
.sm-eisen__corner { background: var(--sm-bg); display: flex; align-items: center; justify-content: center; font-size: 14px; }
.sm-eisen__header { display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--sm-t2); background: var(--sm-bg); }
.sm-eisen__header--left { writing-mode: vertical-lr; transform: rotate(180deg); font-size: 11px; padding: 8px 0; }
.sm-eisen__quad { border-radius: 12px; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; transition: box-shadow .15s; }
.sm-eisen__quad--hover { box-shadow: inset 0 0 0 2px var(--sm-terra); }
.sm-eisen__quad--q1 { background: var(--sm-err-p); }
.sm-eisen__quad--q2 { background: var(--sm-ok-p); }
.sm-eisen__quad--q3 { background: var(--sm-info-p); }
.sm-eisen__quad--q4 { background: rgba(148,163,184,.08); }
.sm-eisen__quad-label { font-size: 12px; font-weight: 600; color: var(--sm-t2); margin-bottom: 4px; }
.sm-eisen__item { display: flex; align-items: center; gap: 6px; background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 8px; padding: 8px 10px; font-size: 13px; color: var(--sm-t1); cursor: grab; transition: box-shadow .15s; }
.sm-eisen__item:hover { box-shadow: var(--sm-sh); }
.sm-eisen__item:active { cursor: grabbing; }
.sm-eisen__item-name { flex: 1; }
.sm-eisen__item-status { font-size: 10px; }
.sm-eisen__item-status--done { color: var(--sm-ok); }
.sm-eisen__item-status--in_progress { color: var(--sm-warn); }
.sm-eisen__item-status--blocked { color: var(--sm-info); }
.sm-eisen__item-transfer { border: none; background: none; font-size: 13px; color: var(--sm-t3); cursor: pointer; opacity: 0; transition: opacity .15s; }
.sm-eisen__item:hover .sm-eisen__item-transfer { opacity: 1; }
.sm-eisen__drop-hint { font-size: 11px; color: var(--sm-t3); text-align: center; padding: 20px 8px; border: 2px dashed var(--sm-bd); border-radius: 8px; opacity: .5; }

/* Transfer overlay */
.sm-eisen__transfer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.2); display: flex; align-items: center; justify-content: center; z-index: 100; }
.sm-eisen__transfer-box { background: var(--sm-white); border-radius: var(--sm-r); padding: 16px; box-shadow: var(--sm-sh2); min-width: 220px; }
.sm-eisen__transfer-box h4 { font-family: 'Cormorant Garamond', serif; font-size: 15px; color: var(--sm-t1); margin: 0 0 12px; }
.sm-eisen__transfer-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; font-size: 13px; color: var(--sm-t1); cursor: pointer; }
.sm-eisen__transfer-item:hover { background: var(--sm-bg); }
.sm-eisen__transfer-avatar { width: 24px; height: 24px; border-radius: 50%; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--sm-ai-p); color: var(--sm-ai); }
.sm-eisen__transfer-cancel { border: none; background: none; color: var(--sm-t3); font-size: 12px; cursor: pointer; margin-top: 8px; width: 100%; text-align: center; }
</style>
