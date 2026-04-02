<template>
  <div class="gantt-timeline">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">📅 Timeline — Vos projets en un coup d'oeil</h1>
      <p class="hero-sub">Suivez l'avancement de vos projets semaine par semaine</p>
    </div>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot" style="background: #34A853;" />
        <span>En cours</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #FBBC05;" />
        <span>A risque</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #EA4335;" />
        <span>En retard</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="projects.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <p class="empty-title">Aucun projet</p>
      <p class="empty-sub">Les projets apparaitront ici une fois crees.</p>
    </div>

    <!-- Timeline grid -->
    <div v-else class="timeline-wrapper">
      <div class="timeline-grid" :style="{ gridTemplateColumns: `180px repeat(${totalWeeks}, 1fr)` }">
        <!-- Header row: week numbers -->
        <div class="grid-header grid-label">Projet</div>
        <div
          v-for="w in totalWeeks"
          :key="'wh-' + w"
          class="grid-header week-header"
          :class="{ 'current-week': w + weekStart - 1 === currentWeek }"
        >
          S{{ w + weekStart - 1 }}
        </div>

        <!-- Project rows -->
        <template v-for="project in projects" :key="project.id || project.name">
          <!-- Project bar row -->
          <div class="grid-label project-label">
            <span class="project-name">{{ project.name }}</span>
            <span class="project-client">{{ project.clientName || '' }}</span>
          </div>
          <div
            v-for="w in totalWeeks"
            :key="'p-' + project.name + '-' + w"
            class="grid-cell"
            :class="{ 'current-week-col': w + weekStart - 1 === currentWeek }"
          >
            <div
              v-if="isProjectWeek(project, w + weekStart - 1)"
              class="project-bar"
            />
          </div>

          <!-- Task rows within project -->
          <template v-for="task in (project.tasks || [])" :key="task.id || task.name">
            <div class="grid-label task-label">
              <span class="task-name">{{ task.name || task.label }}</span>
            </div>
            <div
              v-for="w in totalWeeks"
              :key="'t-' + task.name + '-' + w"
              class="grid-cell"
              :class="{ 'current-week-col': w + weekStart - 1 === currentWeek }"
            >
              <div
                v-if="isTaskWeek(task, w + weekStart - 1)"
                class="task-bar"
                :class="taskStatus(task)"
              />
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTasksStore } from '../../stores/tasks'

const tasksStore = useTasksStore()

const projects = computed(() => tasksStore.projects)

const currentWeek = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now - start) / (24 * 60 * 60 * 1000) + start.getDay() + 1) / 7)
})

const weekStart = computed(() => {
  if (!projects.value.length) return currentWeek.value - 2
  let min = Infinity
  for (const p of projects.value) {
    if (p.startWeek && p.startWeek < min) min = p.startWeek
    for (const t of (p.tasks || [])) {
      if (t.startWeek && t.startWeek < min) min = t.startWeek
    }
  }
  return min === Infinity ? currentWeek.value - 2 : Math.max(1, min - 1)
})

const weekEnd = computed(() => {
  if (!projects.value.length) return currentWeek.value + 6
  let max = 0
  for (const p of projects.value) {
    const pEnd = (p.startWeek || 0) + (p.durationWeeks || 4)
    if (pEnd > max) max = pEnd
    for (const t of (p.tasks || [])) {
      const tEnd = (t.startWeek || 0) + (t.durationWeeks || 1)
      if (tEnd > max) max = tEnd
    }
  }
  return Math.max(max + 1, currentWeek.value + 4)
})

const totalWeeks = computed(() => weekEnd.value - weekStart.value + 1)

function isProjectWeek(project, week) {
  const start = project.startWeek || 0
  const end = start + (project.durationWeeks || 4)
  return week >= start && week < end
}

function isTaskWeek(task, week) {
  const start = task.startWeek || 0
  const end = start + (task.durationWeeks || 1)
  return week >= start && week < end
}

function taskStatus(task) {
  if (task.done) return 'on-track'
  const end = (task.startWeek || 0) + (task.durationWeeks || 1)
  if (end < currentWeek.value) return 'late'
  if (end <= currentWeek.value + 1) return 'at-risk'
  return 'on-track'
}
</script>

<style scoped>
.gantt-timeline {
  max-width: 1200px;
  padding: 24px 28px;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  background: #F8F9FA;
}

.hero {
  background: linear-gradient(135deg, #EA4335, #FBBC05, #34A853, #4285F4);
  color: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
}
.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px;
}
.hero-sub {
  font-size: 14px;
  opacity: 0.85;
  margin: 0;
}

.legend {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 12px 18px;
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #5F6368;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 6px;
}
.empty-sub { font-size: 13px; color: #5F6368; margin: 0; }

.timeline-wrapper {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  overflow-x: auto;
  padding: 4px;
}

.timeline-grid {
  display: grid;
  min-width: 600px;
  gap: 0;
}

.grid-header {
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5F6368;
  text-align: center;
  border-bottom: 1px solid #E8EAED;
  background: #F8F9FA;
}
.grid-header.grid-label {
  text-align: left;
  padding-left: 14px;
}

.week-header.current-week {
  background: rgba(66,133,244,0.1);
  color: #4285F4;
  font-weight: 800;
  border-radius: 6px 6px 0 0;
}

.grid-label {
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.project-label {
  background: rgba(0,0,0,0.015);
}
.project-name {
  font-size: 13px;
  font-weight: 700;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.project-client {
  font-size: 11px;
  color: #5F6368;
}
.task-label {
  padding-left: 28px;
}
.task-name {
  font-size: 12px;
  color: #5F6368;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-cell {
  padding: 4px 2px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  min-height: 32px;
}
.current-week-col {
  background: rgba(66, 133, 244, 0.04);
}

.project-bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #EA4335, #FBBC05, #34A853, #4285F4);
  opacity: 0.4;
}

.task-bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
}
.task-bar.on-track {
  background: #34A853;
}
.task-bar.at-risk {
  background: #FBBC05;
}
.task-bar.late {
  background: #EA4335;
}
</style>
