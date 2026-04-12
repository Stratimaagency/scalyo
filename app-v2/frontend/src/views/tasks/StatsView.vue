<template>
  <div class="stats-view">
    <h1>📊 {{ t('sm_stats_title') }}</h1>
    <div class="st-kpis">
      <div class="stk"><span class="stk-val">{{ tasks.tasks.length }}</span><span class="stk-lbl">{{ t('sm_total_tasks') }}</span></div>
      <div class="stk"><span class="stk-val green">{{ tasks.doneTasks.length }}</span><span class="stk-lbl">{{ t('sm_completed') }}</span></div>
      <div class="stk"><span class="stk-val blue">{{ tasks.inProgressTasks.length }}</span><span class="stk-lbl">{{ t('sm_in_progress') }}</span></div>
      <div class="stk"><span class="stk-val red">{{ tasks.overdueTasks.length }}</span><span class="stk-lbl">{{ t('sm_overdue') }}</span></div>
    </div>
    <div class="st-grid">
      <div class="st-card">
        <h3>{{ t('sm_completion_rate') }}</h3>
        <div class="rate-gauge">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" stroke-width="10" /><circle cx="60" cy="60" r="50" fill="none" stroke="#7c3aed" stroke-width="10" :stroke-dasharray="completionArc + ' 314.16'" stroke-linecap="round" transform="rotate(-90 60 60)" /><text x="60" y="65" text-anchor="middle" font-size="24" font-weight="800" fill="#1a1a2e">{{ completionRate }}%</text></svg>
        </div>
      </div>
      <div class="st-card">
        <h3>{{ t('sm_by_status') }}</h3>
        <div class="stat-bars">
          <div class="sbar"><span class="sbar-label">{{ t('sm_col_todo') }}</span><div class="sbar-track"><div class="sbar-fill" style="background:var(--text-muted)" :style="{ width: pct(tasks.todoTasks.length) + '%' }" /></div><span class="sbar-val">{{ tasks.todoTasks.length }}</span></div>
          <div class="sbar"><span class="sbar-label">{{ t('sm_col_progress') }}</span><div class="sbar-track"><div class="sbar-fill" style="background:var(--blue)" :style="{ width: pct(tasks.inProgressTasks.length) + '%' }" /></div><span class="sbar-val">{{ tasks.inProgressTasks.length }}</span></div>
          <div class="sbar"><span class="sbar-label">{{ t('sm_col_blocked') }}</span><div class="sbar-track"><div class="sbar-fill" style="background:var(--red)" :style="{ width: pct(tasks.blockedTasks.length) + '%' }" /></div><span class="sbar-val">{{ tasks.blockedTasks.length }}</span></div>
          <div class="sbar"><span class="sbar-label">{{ t('sm_col_done') }}</span><div class="sbar-track"><div class="sbar-fill" style="background:var(--green)" :style="{ width: pct(tasks.doneTasks.length) + '%' }" /></div><span class="sbar-val">{{ tasks.doneTasks.length }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/tasks'
const { t } = useI18n({ useScope: 'global' })
const tasks = useTaskStore()
const completionRate = computed(() => tasks.tasks.length ? Math.round((tasks.doneTasks.length / tasks.tasks.length) * 100) : 0)
const completionArc = computed(() => ((completionRate.value / 100) * 314.16).toFixed(1))
function pct(n) { return tasks.tasks.length ? (n / tasks.tasks.length) * 100 : 0 }
</script>
<style scoped>
.stats-view { max-width: 900px; }
.stats-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }
.st-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
.stk { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; text-align: center; }
.stk-val { font-size: 1.8rem; font-weight: 800; display: block; }
.stk-val.green { color: var(--green); } .stk-val.blue { color: var(--blue); } .stk-val.red { color: var(--red); }
.stk-lbl { font-size: 0.72rem; color: var(--text-secondary); }
.st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.st-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
.st-card h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 16px; }
.rate-gauge { width: 120px; height: 120px; margin: 0 auto; }
.rate-gauge svg { width: 100%; height: 100%; }
.stat-bars { display: flex; flex-direction: column; gap: 12px; }
.sbar { display: flex; align-items: center; gap: 10px; }
.sbar-label { font-size: 0.78rem; width: 80px; color: var(--text-secondary); }
.sbar-track { flex: 1; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden; }
.sbar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.sbar-val { font-size: 0.82rem; font-weight: 700; width: 24px; text-align: right; }
@media (max-width: 768px) { .st-kpis { grid-template-columns: repeat(2,1fr); } .st-grid { grid-template-columns: 1fr; } }
</style>
