<template>
  <div class="sm-group">
    <div class="sm-group__header" @click="collapsed = !collapsed">
      <svg class="sm-group__circle" width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="19" fill="none" stroke="var(--sm-bd)" stroke-width="3" />
        <circle cx="21" cy="21" r="19" fill="none" stroke="url(#sm-cg)" stroke-width="3"
          :stroke-dasharray="circ" :stroke-dashoffset="circ - (circ * progress / 100)"
          stroke-linecap="round" transform="rotate(-90 21 21)" />
        <text x="21" y="22" text-anchor="middle" dominant-baseline="central"
          class="sm-group__pct-text">{{ progress }}%</text>
      </svg>
      <div class="sm-group__info">
        <h4 class="sm-group__name">{{ groupName }}</h4>
        <span class="sm-group__meta">{{ tasks.length }} tâches · {{ doneCount }}/{{ subTotal }} sous-tâches</span>
      </div>
      <svg class="sm-group__chevron" :class="{ 'sm-group__chevron--open': !collapsed }" width="18" height="18" viewBox="0 0 18 18">
        <path d="M5 7l4 4 4-4" fill="none" stroke="var(--sm-t3)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
    <div v-if="!collapsed" class="sm-group__tasks">
      <SmTaskRow
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :team="team"
        @toggle-subtask="(tid, sid) => $emit('toggle-subtask', tid, sid)"
        @delete-subtask="(tid, sid) => $emit('delete-subtask', tid, sid)"
        @add-subtask="(tid, name) => $emit('add-subtask', tid, name)"
        @transfer="(tid, mid) => $emit('transfer', tid, mid)"
        @edit-task="(task) => $emit('edit-task', task)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SmTaskRow from './SmTaskRow.vue'

const props = defineProps({
  groupName: { type: String, required: true },
  tasks: { type: Array, required: true },
  team: { type: Array, default: () => [] },
})

defineEmits(['toggle-subtask', 'delete-subtask', 'add-subtask', 'transfer', 'edit-task'])

const collapsed = ref(false)
const circ = computed(() => 2 * Math.PI * 19)

const allSubs = computed(() => props.tasks.flatMap(t => t.subtasks || []))
const subTotal = computed(() => allSubs.value.length)
const doneCount = computed(() => allSubs.value.filter(s => s.done).length)
const progress = computed(() => subTotal.value > 0 ? Math.round(doneCount.value / subTotal.value * 100) : 0)
</script>

<style scoped>
.sm-group { margin-bottom: 8px; }
.sm-group__header {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: var(--sm-white); border: 1px solid var(--sm-bd);
  border-radius: var(--sm-r); cursor: pointer; transition: box-shadow .2s;
}
.sm-group__header:hover { box-shadow: var(--sm-sh); }
.sm-group__circle { flex-shrink: 0; }
.sm-group__pct-text { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 700; fill: var(--sm-t1); }
.sm-group__info { flex: 1; min-width: 0; }
.sm-group__name {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600; font-size: 16px; color: var(--sm-t1); margin: 0;
}
.sm-group__meta { font-family: 'DM Sans', sans-serif; font-size: 12px; color: var(--sm-t3); }
.sm-group__chevron { flex-shrink: 0; transition: transform .2s; }
.sm-group__chevron--open { transform: rotate(180deg); }
.sm-group__tasks {
  margin-top: 2px; background: var(--sm-white); border: 1px solid var(--sm-bd);
  border-top: none; border-radius: 0 0 var(--sm-r) var(--sm-r);
}
</style>
