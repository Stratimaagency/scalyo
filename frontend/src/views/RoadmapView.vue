<template>
  <div class="fade-in" style="padding: 24px 28px; height: 100%; overflow-y: auto">
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; padding: 60px 0; color: var(--muted); font-size: 14px">
      Chargement...
    </div>
    <template v-else>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px">
      <h1 style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px">
        {{ t('roadmap90Title') }}
      </h1>
      <button
        class="chip-btn"
        :style="{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)', fontWeight: 700 }"
        @click="showAddForm = !showAddForm"
      >
        {{ t('rmAddItem') }}
      </button>
    </div>
    <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px">
      {{ roadmap.phase || t('roadmapPhaseDefault') }}
    </p>

    <!-- Add form -->
    <div v-if="showAddForm" class="card-surface" style="padding: 16px; margin-bottom: 16px; border-radius: 12px">
      <input
        v-model="newLabel"
        :placeholder="t('rmNewItemLabel')"
        class="rm-input"
        style="width: 100%; margin-bottom: 10px"
        @keydown.enter="addItem"
      />
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <input
          v-model="newDue"
          :placeholder="t('rmNewItemDue')"
          class="rm-input"
          style="width: 140px"
        />
        <select v-model="newPhase" class="rm-input">
          <option v-for="p in [1, 2, 3]" :key="p" :value="p">{{ t('rmPhase') }} {{ p }}</option>
        </select>
        <select v-model="newPrio" class="rm-input">
          <option value="high">{{ t('priorityHigh') }}</option>
          <option value="medium">{{ t('priorityMed') }}</option>
          <option value="low">{{ t('priorityLow') }}</option>
        </select>
        <button
          class="chip-btn"
          style="background: var(--teal); color: #fff; font-weight: 700"
          @click="addItem"
        >
          {{ t('add') }}
        </button>
      </div>
    </div>

    <!-- Filters bar -->
    <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; align-items: center">
      <!-- Phase filter -->
      <span class="filter-label">{{ t('rmFilterPhase') }}:</span>
      <button
        class="chip-btn"
        :class="{ 'chip-active': phaseFilter === 'all' }"
        @click="phaseFilter = 'all'"
      >{{ t('rmAllPhases') }}</button>
      <button
        v-for="p in availablePhases"
        :key="'p' + p"
        class="chip-btn"
        :class="{ 'chip-active': phaseFilter === String(p) }"
        @click="phaseFilter = String(p)"
      >P{{ p }}</button>

      <span class="filter-divider"></span>

      <!-- Priority filter -->
      <span class="filter-label">{{ t('rmFilterPrio') }}:</span>
      <button
        class="chip-btn"
        :class="{ 'chip-active': prioFilter === 'all' }"
        @click="prioFilter = 'all'"
      >{{ t('rmAllPrio') }}</button>
      <button
        v-for="p in ['high', 'medium', 'low']"
        :key="'prio' + p"
        class="chip-btn"
        :class="{ 'chip-active': prioFilter === p }"
        @click="prioFilter = p"
      >{{ prioLabel(p) }}</button>

      <span class="filter-divider"></span>

      <!-- Status filter -->
      <span class="filter-label">{{ t('rmFilterStatus') }}:</span>
      <button
        class="chip-btn"
        :class="{ 'chip-active': statusFilter === 'all' }"
        @click="statusFilter = 'all'"
      >{{ t('rmAllStatus') }}</button>
      <button
        class="chip-btn"
        :class="{ 'chip-active': statusFilter === 'todo' }"
        @click="statusFilter = 'todo'"
      >{{ t('rmTodo') }}</button>
      <button
        class="chip-btn"
        :class="{ 'chip-active': statusFilter === 'done' }"
        @click="statusFilter = 'done'"
      >{{ t('rmDone') }}</button>
    </div>

    <!-- Progress bar -->
    <div style="margin-bottom: 20px">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
        <span style="font-size: 13px; color: var(--muted)">{{ t('rmProgress') }}</span>
        <span style="font-size: 13px; font-weight: 700">{{ progress }}%</span>
      </div>
      <HealthBar :val="progress" />
    </div>

    <!-- Phase cards -->
    <div v-for="phase in displayPhases" :key="phase.num" style="margin-bottom: 20px">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px">
        <span style="font-size: 14px; font-weight: 800">{{ phaseTitle(phase.num) }}</span>
        <span style="font-size: 11px; color: var(--muted); font-weight: 600">
          {{ phaseDoneCount(phase.num) }}/{{ phaseItemCount(phase.num) }}
        </span>
      </div>

      <!-- Items list -->
      <div style="display: flex; flex-direction: column; gap: 8px">
        <div
          v-for="item in phase.items"
          :key="item.id"
          class="rm-item"
          :style="{ opacity: item.done ? 0.6 : 1 }"
        >
          <!-- Checkbox -->
          <span
            style="font-size: 16px; flex-shrink: 0; cursor: pointer; user-select: none"
            @click="toggleItem(item.id)"
          >{{ item.done ? '\u2705' : '\u2B1C' }}</span>

          <!-- Label / Edit input -->
          <input
            v-if="editingId === item.id"
            v-model="editLabel"
            class="rm-edit-input"
            autofocus
            @keydown.enter="saveEdit(item.id)"
            @keydown.escape="editingId = null"
          />
          <span
            v-else
            style="font-size: 13px; flex: 1"
            :style="{
              color: item.done ? 'var(--muted)' : 'var(--text)',
              textDecoration: item.done ? 'line-through' : 'none'
            }"
          >{{ item.label }}</span>

          <!-- Priority pill -->
          <span
            v-if="item.prio"
            class="prio-pill"
            :style="{ background: prioColor(item.prio) + '22', color: prioColor(item.prio) }"
          >{{ prioLabel(item.prio) }}</span>

          <!-- Phase badge -->
          <span
            v-if="item.phase"
            style="font-size: 10px; color: var(--muted); flex-shrink: 0; font-weight: 600"
          >P{{ item.phase }}</span>

          <!-- Due badge -->
          <span
            v-if="item.due"
            style="font-size: 11px; color: var(--muted); flex-shrink: 0"
          >{{ item.due }}</span>

          <!-- Actions -->
          <div style="display: flex; gap: 4px; flex-shrink: 0">
            <button
              v-if="editingId === item.id"
              class="rm-action-btn"
              :style="{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }"
              @click="saveEdit(item.id)"
            >&check;</button>
            <button
              v-else
              class="rm-action-btn"
              :title="t('rmEditItem')"
              @click="startEdit(item)"
            >&#9999;&#65039;</button>
            <button
              class="rm-action-btn"
              :title="t('rmDeleteItem')"
              @click="deleteItem(item.id)"
            >&#128465;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state when no items match -->
    <p v-if="filtered.length === 0" style="color: var(--muted); font-size: 13px">
      {{ t('rmNoMatch') }}
    </p>

    <!-- Empty state when no items at all -->
    <EmptyState
      v-if="!items.length"
      icon="map"
      :title="t('noRoadmapSteps')"
      :action="t('rmAddItem')"
      @action="showAddForm = true"
    />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { roadmapApi } from '../api'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'

const { t, lang } = useI18n()
const prefsStore = usePreferencesStore()

// ---------- State ----------
const roadmap = ref({ phase: '', progress: 0, items: [] })
const showAddForm = ref(false)
const newLabel = ref('')
const newDue = ref('')
const newPhase = ref(1)
const newPrio = ref('medium')
const editingId = ref(null)
const editLabel = ref('')
const phaseFilter = ref('all')
const prioFilter = ref('all')
const statusFilter = ref('all')

// ---------- Default template ----------
function buildTemplate() {
  const l = lang.value
  return [
    { id: 'r01', phase: 1, label: l === 'en' ? t('goalP1') : l === 'kr' ? t('goalP1') : t('goalP1'), done: false, due: 'J1-J10', prio: 'high' },
    { id: 'r02', phase: 1, label: l === 'en' ? 'Identify the 3 critical-risk accounts and open a remediation plan' : l === 'kr' ? '3\uAC1C\uC758 \uC704\uD5D8 \uACC4\uC815\uC744 \uD30C\uC545\uD558\uACE0 \uAC1C\uC120 \uACC4\uD68D \uC218\uB9BD' : 'Identifier les 3 comptes \u00e0 risque critique et ouvrir un plan de rem\u00e9diation', done: false, due: 'J1-J10', prio: 'high' },
    { id: 'r03', phase: 1, label: t('goalP3'), done: false, due: 'J1-J15', prio: 'high' },
    { id: 'r04', phase: 1, label: t('goalP9'), done: false, due: 'J10-J20', prio: 'medium' },
    { id: 'r05', phase: 1, label: t('goalP10'), done: false, due: 'J7-J14', prio: 'medium' },
    { id: 'r06', phase: 2, label: t('goalP4'), done: false, due: 'J30-J45', prio: 'high' },
    { id: 'r07', phase: 2, label: t('goalP5'), done: false, due: 'J30-J40', prio: 'medium' },
    { id: 'r08', phase: 2, label: t('goalP2'), done: false, due: 'J40-J60', prio: 'medium' },
    { id: 'r09', phase: 2, label: t('goalP6'), done: false, due: 'J45-J60', prio: 'low' },
    { id: 'r10', phase: 3, label: t('goalP7'), done: false, due: 'J60-J75', prio: 'high' },
    { id: 'r11', phase: 3, label: t('goalP8'), done: false, due: 'J80-J90', prio: 'high' },
    { id: 'r12', phase: 3, label: l === 'en' ? 'Prepare next quarter renewals (D-90)' : l === 'kr' ? '\uB2E4\uC74C \uBD84\uAE30 \uAC31\uC2E0 \uC900\uBE44 (D-90)' : 'Pr\u00e9parer les renouvellements du prochain trimestre (J\u221290)', done: false, due: 'J75-J90', prio: 'medium' },
  ]
}

// ---------- Computed ----------
const items = computed(() => {
  const raw = roadmap.value.items
  return Array.isArray(raw) ? raw : []
})

const progress = computed(() => {
  if (!items.value.length) return roadmap.value.progress || 0
  const done = items.value.filter(i => i.done).length
  return Math.round((done / items.value.length) * 100)
})

const availablePhases = computed(() => {
  return [...new Set(items.value.map(i => i.phase).filter(Boolean))].sort()
})

const filtered = computed(() => {
  return items.value.filter(i => {
    if (phaseFilter.value !== 'all' && String(i.phase) !== String(phaseFilter.value)) return false
    if (prioFilter.value !== 'all' && i.prio !== prioFilter.value) return false
    if (statusFilter.value === 'done' && !i.done) return false
    if (statusFilter.value === 'todo' && i.done) return false
    return true
  })
})

const displayPhases = computed(() => {
  const phases = [...new Set(filtered.value.map(i => i.phase).filter(Boolean))].sort()
  return phases.map(num => ({
    num,
    items: filtered.value.filter(i => i.phase === num)
  }))
})

// ---------- Helpers ----------
function prioColor(p) {
  if (p === 'high') return '#EF4444'
  if (p === 'medium') return '#F59E0B'
  return '#10B981'
}

function prioLabel(p) {
  if (p === 'high') return t('priorityHigh')
  if (p === 'medium') return t('priorityMed')
  return t('priorityLow')
}

function phaseTitle(num) {
  if (num === 1) return t('rmPhase1Title')
  if (num === 2) return t('rmPhase2Title')
  if (num === 3) return t('rmPhase3Title')
  return t('rmPhase') + ' ' + num
}

function phaseDoneCount(num) {
  return items.value.filter(i => i.phase === num && i.done).length
}

function phaseItemCount(num) {
  return items.value.filter(i => i.phase === num).length
}

// ---------- Actions ----------
function toggleItem(itemId) {
  const newItems = items.value.map(it => it.id === itemId ? { ...it, done: !it.done } : it)
  const newProgress = newItems.length > 0 ? Math.round(newItems.filter(i => i.done).length / newItems.length * 100) : 0
  roadmap.value = { ...roadmap.value, items: newItems, progress: newProgress }
  save()
}

function addItem() {
  if (!newLabel.value.trim()) return
  const newItem = {
    id: 'r_' + Date.now(),
    phase: newPhase.value,
    label: newLabel.value.trim(),
    done: false,
    due: newDue.value.trim() || undefined,
    prio: newPrio.value
  }
  const newItems = [...items.value, newItem]
  const newProgress = newItems.length > 0 ? Math.round(newItems.filter(i => i.done).length / newItems.length * 100) : 0
  roadmap.value = { ...roadmap.value, items: newItems, progress: newProgress }
  newLabel.value = ''
  newDue.value = ''
  showAddForm.value = false
  save()
}

function deleteItem(itemId) {
  const newItems = items.value.filter(it => it.id !== itemId)
  const newProgress = newItems.length > 0 ? Math.round(newItems.filter(i => i.done).length / newItems.length * 100) : 0
  roadmap.value = { ...roadmap.value, items: newItems, progress: newProgress }
  save()
}

function startEdit(item) {
  editingId.value = item.id
  editLabel.value = item.label
}

function saveEdit(itemId) {
  if (!editLabel.value.trim()) return
  const newItems = items.value.map(it => it.id === itemId ? { ...it, label: editLabel.value.trim() } : it)
  roadmap.value = { ...roadmap.value, items: newItems }
  editingId.value = null
  editLabel.value = ''
  save()
}

async function save() {
  try {
    await roadmapApi.update({
      items: roadmap.value.items,
      progress: roadmap.value.progress,
      phase: roadmap.value.phase
    })
  } catch (e) {
    // silent
  }
}

// ---------- Lifecycle ----------
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await roadmapApi.get()
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      roadmap.value = data
    } else {
      // Initialize with template
      const tpl = buildTemplate()
      roadmap.value = {
        phase: t('roadmapPhaseDefault'),
        progress: 0,
        items: tpl
      }
      save()
    }
    if (!roadmap.value.phase) roadmap.value.phase = t('roadmapPhaseDefault')
  } catch (e) {
    console.error('Failed to load roadmap:', e)
    // Initialize with template on error
    const tpl = buildTemplate()
    roadmap.value = {
      phase: t('roadmapPhaseDefault'),
      progress: 0,
      items: tpl
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card-surface {
  background: var(--surface);
  border: 1px solid var(--border);
}

.rm-input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.12s;
}
.rm-input:focus {
  border-color: var(--teal-border);
}

.chip-btn {
  font-size: 11px;
  padding: 4px 11px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-weight: 500;
  transition: all 0.12s;
}
.chip-btn:hover {
  border-color: var(--teal-border);
  color: var(--teal);
}
.chip-active {
  background: var(--teal-bg);
  border-color: var(--teal-border);
  color: var(--teal);
  font-weight: 700;
}

.filter-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
}
.filter-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
  margin: 0 4px;
}

.rm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all 0.12s;
}

.prio-pill {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
}

.rm-action-btn {
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 6px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: opacity 0.12s;
}
.rm-action-btn:hover {
  opacity: 0.7;
}

.rm-edit-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--teal-border);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--text);
  font-size: 13px;
  outline: none;
}
</style>
