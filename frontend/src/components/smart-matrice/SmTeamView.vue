<template>
  <div class="sm-team">
    <!-- Member pills filter -->
    <div class="sm-team__pills">
      <button class="sm-team__pill" :class="{ 'sm-team__pill--active': !selectedMember }"
        @click="selectedMember = null">Tous</button>
      <button v-for="m in team" :key="m.id" class="sm-team__pill"
        :class="{ 'sm-team__pill--active': selectedMember === m.id }"
        @click="selectedMember = m.id">
        <span class="sm-team__pill-avatar">{{ m.initials }}</span>
        {{ m.display_name || m.email }}
      </button>
    </div>

    <!-- Member cards -->
    <div class="sm-team__grid">
      <div v-for="m in filteredMembers" :key="m.id" class="sm-team__card">
        <div class="sm-team__card-header">
          <div class="sm-team__card-avatar">{{ m.initials }}</div>
          <div class="sm-team__card-info">
            <h4 class="sm-team__card-name">{{ m.display_name || m.email }}</h4>
            <span class="sm-team__card-role">{{ m.role }}</span>
          </div>
        </div>

        <!-- Dates -->
        <div class="sm-team__card-dates">
          <div class="sm-team__card-date">
            <span class="sm-team__card-date-label">Fin estimée</span>
            <span class="sm-team__card-date-value">{{ formatDate(m.latest_end) }}</span>
          </div>
          <div class="sm-team__card-date">
            <span class="sm-team__card-date-label">Tâches</span>
            <span class="sm-team__card-date-value">{{ m.done_count || 0 }}/{{ m.task_count || 0 }}</span>
          </div>
        </div>

        <!-- Workload bar -->
        <div class="sm-team__card-load">
          <span class="sm-team__card-load-label">Charge</span>
          <div class="sm-team__card-load-bar-wrap">
            <div class="sm-team__card-load-bar" :style="{ width: workloadPct(m) + '%' }"></div>
          </div>
          <span class="sm-team__card-load-pct">{{ workloadPct(m) }}%</span>
        </div>

        <!-- Task list for this member -->
        <div v-if="memberTasks(m.id).length" class="sm-team__card-tasks">
          <div v-for="t in memberTasks(m.id)" :key="t.id" class="sm-team__card-task">
            <span class="sm-team__card-task-status" :class="'sm-team__card-task-status--' + t.status"></span>
            <span class="sm-team__card-task-name">{{ t.name }}</span>
            <span class="sm-team__card-task-pct">{{ t.progress || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  team: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
})

const selectedMember = ref(null)

const filteredMembers = computed(() => {
  if (!selectedMember.value) return props.team
  return props.team.filter(m => m.id === selectedMember.value)
})

function memberTasks(memberId) {
  return props.tasks.filter(t => t.assigned_to === memberId)
}

function workloadPct(m) {
  const total = m.task_count || 0
  if (!total) return 0
  const done = m.done_count || 0
  return Math.min(100, Math.round((total - done) / Math.max(total, 1) * 100))
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.sm-team { font-family: 'DM Sans', sans-serif; }
.sm-team__pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.sm-team__pill {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 20px;
  padding: 5px 14px; font-size: 13px; font-weight: 500; color: var(--sm-t2);
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .15s;
}
.sm-team__pill:hover { border-color: var(--sm-terra); }
.sm-team__pill--active { background: var(--sm-grad); color: white; border-color: transparent; }
.sm-team__pill-avatar {
  width: 20px; height: 20px; border-radius: 50%; font-size: 9px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  background: var(--sm-ai-p); color: var(--sm-ai);
}
.sm-team__pill--active .sm-team__pill-avatar { background: rgba(255,255,255,.2); color: white; }
.sm-team__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.sm-team__card {
  background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: var(--sm-r);
  padding: 16px; box-shadow: var(--sm-sh);
}
.sm-team__card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.sm-team__card-avatar {
  width: 40px; height: 40px; border-radius: 50%; font-size: 15px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  background: var(--sm-ai-p); color: var(--sm-ai);
}
.sm-team__card-info { flex: 1; }
.sm-team__card-name { font-weight: 600; font-size: 14px; color: var(--sm-t1); margin: 0; }
.sm-team__card-role { font-size: 12px; color: var(--sm-t3); text-transform: capitalize; }
.sm-team__card-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.sm-team__card-date-label { display: block; font-size: 11px; color: var(--sm-t3); }
.sm-team__card-date-value { font-size: 14px; font-weight: 600; color: var(--sm-t1); }
.sm-team__card-load { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.sm-team__card-load-label { font-size: 12px; color: var(--sm-t3); min-width: 44px; }
.sm-team__card-load-bar-wrap { flex: 1; height: 6px; background: var(--sm-bd); border-radius: 3px; overflow: hidden; }
.sm-team__card-load-bar { height: 100%; background: var(--sm-grad-h); border-radius: 3px; transition: width .3s; }
.sm-team__card-load-pct { font-size: 12px; font-weight: 600; color: var(--sm-terra); min-width: 32px; text-align: right; }
.sm-team__card-tasks { border-top: 1px solid var(--sm-bd); padding-top: 10px; }
.sm-team__card-task {
  display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; color: var(--sm-t2);
}
.sm-team__card-task-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sm-team__card-task-status--todo { background: #3b82f6; }
.sm-team__card-task-status--in_progress { background: #f43f5e; }
.sm-team__card-task-status--blocked { background: #2563eb; }
.sm-team__card-task-status--done { background: #16a34a; }
.sm-team__card-task-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-team__card-task-pct { font-weight: 600; font-size: 12px; color: var(--sm-terra); }
</style>
