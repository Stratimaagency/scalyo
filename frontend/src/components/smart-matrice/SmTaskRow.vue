<template>
  <div class="sm-task" :class="{ 'sm-task--paused': task.is_paused }">
    <div class="sm-task__header" @click="expanded = !expanded">
      <svg class="sm-task__circle" width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="none" stroke="var(--sm-bd)" stroke-width="2.5" />
        <circle cx="14" cy="14" r="12" fill="none" stroke="url(#sm-cg)" stroke-width="2.5"
          :stroke-dasharray="circ" :stroke-dashoffset="circ - (circ * progress / 100)"
          stroke-linecap="round" transform="rotate(-90 14 14)" />
      </svg>
      <span class="sm-task__name">{{ task.name }}</span>
      <span class="sm-task__pct">{{ progress }}%</span>
      <span class="sm-task__count">{{ doneCount }}/{{ totalCount }}</span>
      <span v-if="task.is_paused" class="sm-task__badge sm-task__badge--pause">⏸ pause</span>
      <span v-if="task.assigned_to && assignedMember" class="sm-task__avatar" :title="assignedMember.display_name">
        {{ assignedMember.initials }}
      </span>
      <button class="sm-task__transfer" @click.stop="showTransfer = !showTransfer" title="Transférer">↗</button>
      <svg class="sm-task__chevron" :class="{ 'sm-task__chevron--open': expanded }" width="16" height="16" viewBox="0 0 16 16">
        <path d="M4 6l4 4 4-4" fill="none" stroke="var(--sm-t3)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Transfer overlay -->
    <div v-if="showTransfer" class="sm-task__transfer-list">
      <div v-for="m in team" :key="m.id" class="sm-task__transfer-item" @click="transfer(m.id)">
        <span class="sm-task__transfer-avatar">{{ m.initials }}</span>
        {{ m.display_name || m.email }}
      </div>
    </div>

    <!-- Subtasks -->
    <div v-if="expanded" class="sm-task__subs">
      <SmSubtaskRow
        v-for="sub in task.subtasks"
        :key="sub.id"
        :subtask="sub"
        @toggle="$emit('toggle-subtask', task.id, sub.id)"
        @delete="$emit('delete-subtask', task.id, sub.id)"
      />
      <div v-if="adding" class="sm-task__add-row">
        <input ref="addInput" v-model="newName" class="sm-task__add-input"
          placeholder="Nom de la sous-tâche…"
          @keydown.enter="submitAdd" @keydown.escape="adding = false" />
      </div>
      <button class="sm-task__add-btn" @click="startAdd">+ Ajouter</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import SmSubtaskRow from './SmSubtaskRow.vue'

const props = defineProps({
  task: { type: Object, required: true },
  team: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-subtask', 'delete-subtask', 'add-subtask', 'transfer'])

const expanded = ref(false)
const adding = ref(false)
const newName = ref('')
const addInput = ref(null)
const showTransfer = ref(false)

const circ = computed(() => 2 * Math.PI * 12)
const subs = computed(() => props.task.subtasks || [])
const totalCount = computed(() => subs.value.length)
const doneCount = computed(() => subs.value.filter(s => s.done).length)
const progress = computed(() => totalCount.value > 0 ? Math.round(doneCount.value / totalCount.value * 100) : 0)

const assignedMember = computed(() => props.team.find(m => m.id === props.task.assigned_to))

function startAdd() {
  adding.value = true
  newName.value = ''
  nextTick(() => addInput.value?.focus())
}

function submitAdd() {
  const name = newName.value.trim()
  if (!name) { adding.value = false; return }
  emit('add-subtask', props.task.id, name)
  newName.value = ''
}

function transfer(memberId) {
  emit('transfer', props.task.id, memberId)
  showTransfer.value = false
}
</script>

<style scoped>
.sm-task { font-family: 'DM Sans', sans-serif; border-bottom: 1px solid var(--sm-bd); }
.sm-task--paused { opacity: .5; border-style: dashed; }
.sm-task__header {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; cursor: pointer; transition: background .15s;
}
.sm-task__header:hover { background: rgba(244,63,94,.03); }
.sm-task__circle { flex-shrink: 0; }
.sm-task__name { flex: 1; font-size: 14px; font-weight: 500; color: var(--sm-t1); min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-task__pct { font-size: 12px; font-weight: 600; color: var(--sm-terra); min-width: 36px; text-align: right; }
.sm-task__count { font-size: 11px; color: var(--sm-t3); }
.sm-task__badge { font-size: 10px; padding: 2px 6px; border-radius: 8px; }
.sm-task__badge--pause { background: var(--sm-warn-p); color: var(--sm-warn); }
.sm-task__avatar {
  width: 24px; height: 24px; border-radius: 50%; font-size: 10px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  background: var(--sm-ai-p); color: var(--sm-ai);
}
.sm-task__transfer {
  border: none; background: none; font-size: 14px; color: var(--sm-t3); cursor: pointer;
  opacity: 0; transition: opacity .15s;
}
.sm-task__header:hover .sm-task__transfer { opacity: 1; }
.sm-task__chevron { flex-shrink: 0; transition: transform .2s; }
.sm-task__chevron--open { transform: rotate(180deg); }
.sm-task__transfer-list {
  background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 8px;
  box-shadow: var(--sm-sh2); margin: 0 12px 8px; padding: 4px;
}
.sm-task__transfer-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 6px; font-size: 13px; color: var(--sm-t1); cursor: pointer;
}
.sm-task__transfer-item:hover { background: var(--sm-bg); }
.sm-task__transfer-avatar {
  width: 24px; height: 24px; border-radius: 50%; font-size: 10px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  background: var(--sm-ai-p); color: var(--sm-ai);
}
.sm-task__subs { padding-bottom: 8px; }
.sm-task__add-row { padding: 4px 8px 4px 28px; }
.sm-task__add-input {
  width: 100%; border: 1px solid var(--sm-bd); border-radius: 6px;
  padding: 4px 8px; font-size: 13px; font-family: 'DM Sans', sans-serif;
  outline: none; background: var(--sm-white); color: var(--sm-t1);
}
.sm-task__add-input:focus { border-color: var(--sm-terra); }
.sm-task__add-btn {
  border: none; background: none; color: var(--sm-terra); font-size: 12px; font-weight: 500;
  cursor: pointer; padding: 4px 12px 4px 28px; font-family: 'DM Sans', sans-serif;
}
.sm-task__add-btn:hover { text-decoration: underline; }
</style>
