<template>
  <div class="roadmap-view">
    <div class="rm-header">
      <div>
        <h1>🗺️ {{ t('rm_title') }}</h1>
        <div class="rm-progress-row">
          <span class="rp-label">{{ t('rm_progress') }}</span>
          <div class="rp-bar"><div class="rp-fill" :style="{ width: globalPct + '%' }" /></div>
          <span class="rp-pct">{{ globalPct }}%</span>
        </div>
      </div>
    </div>

    <!-- Counters -->
    <div class="rm-counters">
      <div class="rmc"><span class="rmc-val blue">{{ activeCount }}</span><span class="rmc-label">{{ t('rm_active') }}</span></div>
      <div class="rmc"><span class="rmc-val green">{{ doneCount }}</span><span class="rmc-label">{{ t('rm_done') }}</span></div>
      <div class="rmc"><span class="rmc-val red">{{ lateCount }}</span><span class="rmc-label">{{ t('rm_late') }}</span></div>
      <div class="rmc"><span class="rmc-val purple">P{{ currentPhase }}</span><span class="rmc-label">{{ t('rm_current_phase') }}</span></div>
    </div>

    <!-- Timeline -->
    <div class="rm-timeline">
      <div class="tl-track">
        <div class="tl-dot" :class="{ active: currentPhase >= 1, done: phase1Pct === 100 }" />
        <div class="tl-line"><div class="tl-line-fill" :style="{ width: phase1Pct + '%' }" /></div>
        <div class="tl-dot" :class="{ active: currentPhase >= 2, done: phase2Pct === 100 }" />
        <div class="tl-line"><div class="tl-line-fill" :style="{ width: phase2Pct + '%' }" /></div>
        <div class="tl-dot" :class="{ active: currentPhase >= 3, done: phase3Pct === 100 }" />
      </div>
      <div class="tl-labels">
        <span>{{ t('rm_phase1').split('—')[0] }}</span>
        <span>{{ t('rm_phase2').split('—')[0] }}</span>
        <span>{{ t('rm_phase3').split('—')[0] }}</span>
      </div>
    </div>

    <!-- Phases -->
    <div v-for="(phase, pi) in phases" :key="pi" class="rm-phase">
      <div class="phase-header" @click="phase.open = !phase.open">
        <div class="ph-left">
          <span class="ph-chevron">{{ phase.open ? '▾' : '▸' }}</span>
          <span class="ph-icon">{{ phase.icon }}</span>
          <strong>{{ t(phase.titleKey) }}</strong>
        </div>
        <div class="ph-right">
          <span class="ph-count">{{ phaseDoneCount(phase) }}/{{ phase.tasks.length }}</span>
          <div class="ph-bar"><div class="ph-fill" :style="{ width: phasePct(phase) + '%' }" /></div>
        </div>
      </div>
      <transition name="slide-up">
        <div v-if="phase.open" class="phase-tasks">
          <div v-for="task in phase.tasks" :key="task.key" class="rm-task" :class="{ done: task.done }">
            <button class="rm-check" @click="task.done = !task.done">{{ task.done ? '✅' : '⬜' }}</button>
            <span class="rm-task-title">{{ t(task.key) }}</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const phases = reactive([
  {
    titleKey: 'rm_phase1', icon: '🏗️', open: true,
    tasks: [
      { key: 'rm_p1t1', done: true },
      { key: 'rm_p1t2', done: true },
      { key: 'rm_p1t3', done: false },
      { key: 'rm_p1t4', done: false },
    ],
  },
  {
    titleKey: 'rm_phase2', icon: '🚀', open: true,
    tasks: [
      { key: 'rm_p2t1', done: false },
      { key: 'rm_p2t2', done: false },
      { key: 'rm_p2t3', done: false },
    ],
  },
  {
    titleKey: 'rm_phase3', icon: '🏆', open: false,
    tasks: [
      { key: 'rm_p3t1', done: false },
      { key: 'rm_p3t2', done: false },
    ],
  },
])

const allTasks = computed(() => phases.flatMap(p => p.tasks))
const doneCount = computed(() => allTasks.value.filter(t => t.done).length)
const activeCount = computed(() => allTasks.value.filter(t => !t.done).length)
const lateCount = computed(() => 0)
const globalPct = computed(() => allTasks.value.length ? Math.round((doneCount.value / allTasks.value.length) * 100) : 0)

const phaseDoneCount = (phase) => phase.tasks.filter(t => t.done).length
const phasePct = (phase) => phase.tasks.length ? Math.round((phaseDoneCount(phase) / phase.tasks.length) * 100) : 0

const phase1Pct = computed(() => phasePct(phases[0]))
const phase2Pct = computed(() => phasePct(phases[1]))
const phase3Pct = computed(() => phasePct(phases[2]))

const currentPhase = computed(() => {
  if (phase1Pct.value < 100) return 1
  if (phase2Pct.value < 100) return 2
  return 3
})
</script>

<style scoped>
.roadmap-view { max-width: 900px; }
.rm-header { margin-bottom: 24px; }
.rm-header h1 { font-size: 1.5rem; font-weight: 800; }
.rm-progress-row { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.rp-label { font-size: 0.78rem; color: var(--text-secondary); }
.rp-bar { width: 200px; height: 7px; background: var(--border-light); border-radius: 4px; overflow: hidden; }
.rp-fill { height: 100%; background: var(--purple); border-radius: 4px; transition: width 0.5s; }
.rp-pct { font-size: 0.9rem; font-weight: 700; color: var(--purple); }

.rm-counters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
.rmc { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; text-align: center; }
.rmc-val { font-size: 1.5rem; font-weight: 800; display: block; }
.rmc-val.blue { color: var(--blue); }
.rmc-val.green { color: var(--green); }
.rmc-val.red { color: var(--red); }
.rmc-val.purple { color: var(--purple); }
.rmc-label { font-size: 0.72rem; color: var(--text-secondary); }

/* Timeline */
.rm-timeline { margin-bottom: 32px; padding: 0 20px; }
.tl-track { display: flex; align-items: center; gap: 0; margin-bottom: 8px; }
.tl-dot { width: 16px; height: 16px; border-radius: 50%; border: 3px solid var(--border); background: #fff; flex-shrink: 0; transition: all 0.3s; }
.tl-dot.active { border-color: var(--purple); }
.tl-dot.done { border-color: var(--green); background: var(--green); }
.tl-line { flex: 1; height: 4px; background: var(--border-light); border-radius: 2px; overflow: hidden; }
.tl-line-fill { height: 100%; background: var(--purple); border-radius: 2px; transition: width 0.5s; }
.tl-labels { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); padding: 0 4px; }

/* Phases */
.rm-phase { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 12px; overflow: hidden; }
.phase-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: background 0.15s; }
.phase-header:hover { background: var(--bg-hover); }
.ph-left { display: flex; align-items: center; gap: 10px; }
.ph-chevron { font-size: 0.8rem; color: var(--text-muted); width: 16px; }
.ph-icon { font-size: 1.2rem; }
.ph-left strong { font-size: 0.95rem; }
.ph-right { display: flex; align-items: center; gap: 10px; }
.ph-count { font-size: 0.78rem; color: var(--text-muted); }
.ph-bar { width: 100px; height: 5px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.ph-fill { height: 100%; background: var(--green); border-radius: 3px; transition: width 0.5s; }

.phase-tasks { border-top: 1px solid var(--border-light); }
.rm-task { display: flex; align-items: center; gap: 12px; padding: 12px 20px 12px 52px; border-bottom: 1px solid var(--border-light); transition: background 0.15s; }
.rm-task:last-child { border-bottom: none; }
.rm-task:hover { background: var(--bg-hover); }
.rm-task.done .rm-task-title { text-decoration: line-through; color: var(--text-muted); }
.rm-check { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0; }
.rm-task-title { font-size: 0.85rem; }

@media (max-width: 768px) {
  .rm-counters { grid-template-columns: repeat(2, 1fr); }
  .tl-labels { font-size: 0.65rem; }
}
</style>
