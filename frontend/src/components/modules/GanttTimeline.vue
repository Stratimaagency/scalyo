<template>
  <div class="mod-page fade-in">
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">📅 Timeline Projets</h1>
        <p class="mod-subtitle">{{ t('gtSubtitle') }}</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" style="color: #4285F4">{{ tasksStore.projects.length }}</div>
        <div class="mod-big-label">Projets</div>
      </div>
    </div>

    <div class="mod-card" v-if="!tasksStore.projects.length">
      <div class="mod-empty">
        <p style="font-size: 40px; margin-bottom: 12px;">📅</p>
        <p style="font-weight: 700; margin-bottom: 8px;">{{ t('gtNoProjects') }}</p>
        <p style="color: #5F6368">{{ t('gtNoProjectsHint') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Week headers -->
      <div class="mod-card" style="overflow-x: auto">
        <div class="gantt-wrap">
          <div class="gantt-header">
            <div class="gantt-label-col">{{ t('gtProjectTask') }}</div>
            <div class="gantt-weeks">
              <div v-for="w in weeks" :key="w" class="gantt-week-cell" :class="{ 'gantt-current': w === currentWeek }">
                S{{ w }}
              </div>
            </div>
          </div>

          <div v-for="proj in tasksStore.projects" :key="proj.id" class="gantt-project">
            <div class="gantt-row gantt-project-row">
              <div class="gantt-label-col" style="font-weight: 800">
                <span :style="{ color: proj.color || '#4285F4' }">●</span> {{ proj.name }}
                <span v-if="proj.clientName" style="font-size: 11px; color: #5F6368; margin-left: 6px">{{ proj.clientName }}</span>
              </div>
              <div class="gantt-weeks"><div v-for="w in weeks" :key="w" class="gantt-week-cell"></div></div>
            </div>

            <div v-for="task in proj.tasks" :key="task.id" class="gantt-row">
              <div class="gantt-label-col gantt-task-label">
                <span :class="{ 'gantt-done': task.done }">{{ task.done ? '✅' : '⬜' }} {{ task.title }}</span>
              </div>
              <div class="gantt-weeks">
                <div v-for="w in weeks" :key="w" class="gantt-week-cell">
                  <div v-if="w >= (task.startWeek || 0) && w < (task.startWeek || 0) + (task.durationWeeks || 1)"
                    class="gantt-bar"
                    :class="{ 'gantt-bar--late': isLate(task), 'gantt-bar--done': task.done }"
                    :style="{ background: task.done ? '#34A853' : isLate(task) ? '#EA4335' : (proj.color || '#4285F4') }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const tasksStore = useTasksStore()
const currentWeek = computed(() => tasksStore.currentWeek)
const weeks = computed(() => {
  const cw = currentWeek.value
  return Array.from({ length: 12 }, (_, i) => cw - 2 + i)
})

function isLate(task) {
  return !task.done && (task.startWeek || 0) + (task.durationWeeks || 1) < currentWeek.value
}

onMounted(() => {
  if (!tasksStore.projects.length) tasksStore.fetchAll()
})
</script>

<style scoped>
.gantt-wrap { min-width: 800px; }
.gantt-header { display: flex; font-size: 11px; font-weight: 700; color: #5F6368; border-bottom: 2px solid #E8EAED; padding-bottom: 8px; margin-bottom: 4px; }
.gantt-label-col { width: 240px; flex-shrink: 0; padding: 6px 8px; }
.gantt-weeks { display: flex; flex: 1; }
.gantt-week-cell { flex: 1; min-width: 48px; text-align: center; padding: 4px 2px; position: relative; }
.gantt-current { background: rgba(66, 133, 244, 0.08); border-radius: 6px; font-weight: 800; color: #4285F4; }
.gantt-row { display: flex; align-items: center; border-bottom: 1px solid #F1F3F4; }
.gantt-project-row { background: #F8F9FA; border-radius: 8px; margin-top: 8px; }
.gantt-task-label { font-size: 13px; padding-left: 24px; }
.gantt-done { text-decoration: line-through; color: #5F6368; }
.gantt-bar { height: 8px; border-radius: 4px; margin: 0 2px; }
.gantt-bar--late { animation: pulse-red 1.5s infinite; }
.gantt-bar--done { opacity: 0.6; }
@keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>
