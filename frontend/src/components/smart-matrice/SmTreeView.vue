<template>
  <div class="sm-tree-wrap">
    <div class="sm-tree">
      <!-- Header row (sticky) -->
      <div class="sm-tree-header">
        <div class="sm-tree-col sm-tree-col--name">Nom</div>
        <div class="sm-tree-col sm-tree-col--date">Échéance</div>
        <div class="sm-tree-col sm-tree-col--urgency">Urgence</div>
        <div class="sm-tree-col sm-tree-col--importance">Importance</div>
        <div class="sm-tree-col sm-tree-col--difficulty">Difficulté</div>
        <div class="sm-tree-col sm-tree-col--assigned">Assigné à</div>
        <div class="sm-tree-col sm-tree-col--status">Statut</div>
        <div class="sm-tree-col sm-tree-col--roadmap">Roadmap</div>
        <div class="sm-tree-col sm-tree-col--duration">Durée</div>
        <div class="sm-tree-col sm-tree-col--end">Date fin</div>
        <div class="sm-tree-col sm-tree-col--progress">Avancement</div>
        <div class="sm-tree-col sm-tree-col--actions"></div>
      </div>

      <!-- Empty -->
      <div v-if="!projects.length" class="sm-tree-empty">
        Aucun projet. Créez votre premier projet.
      </div>

      <!-- Projects -->
      <div v-for="project in projects" :key="project.id" class="sm-tree-project">
        <!-- Project row -->
        <div class="sm-tree-row sm-tree-row--project" @click="toggleProject(project.id)">
          <div class="sm-tree-col sm-tree-col--name">
            <label v-if="bulkMode" class="sm-tree-check" @click.stop>
              <input type="checkbox" :checked="bulkSelect.includes(project.id)" @change="$emit('toggle-bulk', project.id)" />
              <span class="sm-tree-checkmark"></span>
            </label>
            <button class="sm-tree-toggle" :class="{ 'sm-tree-toggle--open': expandedProjects.has(project.id) }">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
            <span class="sm-tree-emoji">{{ project.emoji || '📁' }}</span>
            <span class="sm-tree-label sm-tree-label--project">{{ project.name }}</span>
            <span class="sm-tree-count">{{ (tasks[project.id] || []).length }}</span>
          </div>
          <div class="sm-tree-col sm-tree-col--date">{{ formatDate(project.end_date || project.target_end_date) }}</div>
          <div class="sm-tree-col sm-tree-col--urgency">
            <span v-if="project.state === 'urgent'" class="sm-tree-tag sm-tree-tag--red">⚡ Urgent</span>
            <span v-else-if="project.state === 'priority'" class="sm-tree-tag sm-tree-tag--orange">🔴 Prioritaire</span>
            <span v-else class="sm-tree-tag sm-tree-tag--gray">—</span>
          </div>
          <div class="sm-tree-col sm-tree-col--importance">
            <span v-if="project.state === 'important'" class="sm-tree-tag sm-tree-tag--yellow">🟡 Important</span>
            <span v-else class="sm-tree-tag sm-tree-tag--gray">—</span>
          </div>
          <div class="sm-tree-col sm-tree-col--difficulty"></div>
          <div class="sm-tree-col sm-tree-col--assigned"></div>
          <div class="sm-tree-col sm-tree-col--status">
            <span class="sm-tree-badge" :style="{ background: project.color || '#4f46e5' }">
              {{ project.status || 'actif' }}
            </span>
          </div>
          <div class="sm-tree-col sm-tree-col--roadmap">
            <div class="sm-tree-bar"><div class="sm-tree-bar-fill" :style="{ width: (project.progress || 0) + '%' }"></div></div>
          </div>
          <div class="sm-tree-col sm-tree-col--duration">—</div>
          <div class="sm-tree-col sm-tree-col--end">{{ formatDate(project.end_date) }}</div>
          <div class="sm-tree-col sm-tree-col--progress">
            <span class="sm-tree-pct">{{ project.progress || 0 }}%</span>
          </div>
          <div class="sm-tree-col sm-tree-col--actions">
            <button class="sm-tree-act" @click.stop="$emit('delete-project', project)" title="Supprimer">🗑️</button>
          </div>
        </div>

        <!-- Tasks (expanded) -->
        <div v-if="expandedProjects.has(project.id)" class="sm-tree-children">
          <div v-for="task in (tasks[project.id] || [])" :key="task.id" class="sm-tree-task-wrap">
            <div class="sm-tree-row sm-tree-row--task" @click="toggleTask(task.id)">
              <div class="sm-tree-col sm-tree-col--name" style="padding-left: 32px">
                <button v-if="task.subtasks?.length" class="sm-tree-toggle" :class="{ 'sm-tree-toggle--open': expandedTasks.has(task.id) }">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <span v-else class="sm-tree-toggle sm-tree-toggle--empty"></span>
                <span class="sm-tree-dot" :style="{ background: priorityColor(task.priority) }"></span>
                <span class="sm-tree-label" :class="{ 'sm-tree-label--done': task.status === 'done' }">{{ task.name }}</span>
                <span v-if="task.subtasks?.length" class="sm-tree-count">{{ task.subtasks.length }}</span>
              </div>
              <div class="sm-tree-col sm-tree-col--date">{{ formatDate(task.end_date) }}</div>
              <div class="sm-tree-col sm-tree-col--urgency">
                <span :class="'sm-tree-tag sm-tree-tag--' + urgencyLevel(task)">{{ urgencyLabel(task) }}</span>
              </div>
              <div class="sm-tree-col sm-tree-col--importance">
                <span :class="'sm-tree-tag sm-tree-tag--' + importanceLevel(task)">{{ importanceLabel(task) }}</span>
              </div>
              <div class="sm-tree-col sm-tree-col--difficulty">
                <span :class="'sm-tree-tag sm-tree-tag--' + difficultyLevel(task)">{{ difficultyLabel(task) }}</span>
              </div>
              <div class="sm-tree-col sm-tree-col--assigned">
                <span v-if="task.assigned_to && getTeamMember(task.assigned_to)" class="sm-tree-avatar" :title="getTeamMember(task.assigned_to)?.display_name">
                  {{ getInitials(getTeamMember(task.assigned_to)?.display_name) }}
                </span>
                <span v-else-if="task.referent_name" class="sm-tree-assignee">{{ task.referent_name }}</span>
                <span v-else class="sm-tree-tag sm-tree-tag--gray">—</span>
              </div>
              <div class="sm-tree-col sm-tree-col--status">
                <span class="sm-tree-status" :class="'sm-tree-status--' + task.status">{{ statusLabel(task.status) }}</span>
              </div>
              <div class="sm-tree-col sm-tree-col--roadmap">
                <div class="sm-tree-bar"><div class="sm-tree-bar-fill" :style="{ width: taskProgress(task) + '%' }"></div></div>
              </div>
              <div class="sm-tree-col sm-tree-col--duration">
                <span v-if="task.dur_estimated">{{ task.dur_estimated }}h</span>
                <span v-else class="sm-tree-tag sm-tree-tag--gray">—</span>
              </div>
              <div class="sm-tree-col sm-tree-col--end">{{ formatDate(task.end_date) }}</div>
              <div class="sm-tree-col sm-tree-col--progress">
                <span class="sm-tree-pct">{{ taskProgress(task) }}%</span>
              </div>
              <div class="sm-tree-col sm-tree-col--actions">
                <button class="sm-tree-act" @click.stop="$emit('edit-task', task)" title="Modifier">✏️</button>
                <button class="sm-tree-act" @click.stop="$emit('delete-task', task)" title="Supprimer">🗑️</button>
              </div>
            </div>

            <!-- Subtasks -->
            <div v-if="expandedTasks.has(task.id) && task.subtasks?.length" class="sm-tree-children">
              <div v-for="sub in task.subtasks" :key="sub.id" class="sm-tree-row sm-tree-row--subtask">
                <div class="sm-tree-col sm-tree-col--name" style="padding-left: 64px">
                  <label class="sm-tree-check" @click.stop>
                    <input type="checkbox" :checked="sub.done" @change="$emit('toggle-subtask', task.id, sub.id)" />
                    <span class="sm-tree-checkmark"></span>
                  </label>
                  <span class="sm-tree-label sm-tree-label--sub" :class="{ 'sm-tree-label--done': sub.done }">{{ sub.name }}</span>
                </div>
                <div class="sm-tree-col sm-tree-col--date"></div>
                <div class="sm-tree-col sm-tree-col--urgency"></div>
                <div class="sm-tree-col sm-tree-col--importance"></div>
                <div class="sm-tree-col sm-tree-col--difficulty"></div>
                <div class="sm-tree-col sm-tree-col--assigned"></div>
                <div class="sm-tree-col sm-tree-col--status">
                  <span class="sm-tree-status" :class="sub.done ? 'sm-tree-status--done' : 'sm-tree-status--todo'">
                    {{ sub.done ? '✓' : '○' }}
                  </span>
                </div>
                <div class="sm-tree-col sm-tree-col--roadmap"></div>
                <div class="sm-tree-col sm-tree-col--duration"></div>
                <div class="sm-tree-col sm-tree-col--end"></div>
                <div class="sm-tree-col sm-tree-col--progress"></div>
                <div class="sm-tree-col sm-tree-col--actions">
                  <button class="sm-tree-act" @click.stop="$emit('delete-subtask', task.id, sub.id)" title="Supprimer">✕</button>
                </div>
              </div>
              <div class="sm-tree-row sm-tree-row--add" style="padding-left: 64px">
                <input class="sm-tree-add-input" :placeholder="'+ Ajouter une sous-tâche...'"
                  @keydown.enter="addSubtask(task.id, $event)" @keydown.escape="$event.target.blur()" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  tasks: { type: Object, default: () => ({}) },
  team: { type: Array, default: () => [] },
  bulkMode: { type: Boolean, default: false },
  bulkSelect: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-subtask', 'delete-subtask', 'add-subtask', 'edit-task', 'delete-task', 'delete-project', 'toggle-bulk'])

const expandedProjects = ref(new Set())
const expandedTasks = ref(new Set())

function toggleProject(id) {
  if (expandedProjects.value.has(id)) expandedProjects.value.delete(id)
  else expandedProjects.value.add(id)
}
function toggleTask(id) {
  if (expandedTasks.value.has(id)) expandedTasks.value.delete(id)
  else expandedTasks.value.add(id)
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function statusLabel(s) {
  const labels = { todo: 'À faire', doing: 'En cours', in_progress: 'En cours', blocked: 'Bloqué', done: 'Terminé' }
  return labels[s] || s || 'À faire'
}

function priorityColor(p) {
  const colors = { urgent: '#ef4444', priority: '#f97316', important: '#eab308', normal: '#94a3b8' }
  return colors[p] || '#94a3b8'
}

function urgencyLevel(task) {
  if (task.priority === 'urgent') return 'red'
  if (task.end_date) {
    const days = Math.ceil((new Date(task.end_date) - new Date()) / 86400000)
    if (days < 0) return 'red'
    if (days < 3) return 'orange'
    if (days < 7) return 'yellow'
  }
  return 'gray'
}
function urgencyLabel(task) {
  if (task.priority === 'urgent') return '⚡ Urgent'
  if (task.end_date) {
    const days = Math.ceil((new Date(task.end_date) - new Date()) / 86400000)
    if (days < 0) return '🔴 En retard'
    if (days < 3) return '🟠 Proche'
    if (days < 7) return '🟡 Bientôt'
  }
  return '—'
}

function importanceLevel(task) {
  if (task.priority === 'important' || task.priority === 'priority') return 'yellow'
  if (task.quadrant === 1 || task.quadrant === 2) return 'yellow'
  return 'gray'
}
function importanceLabel(task) {
  if (task.priority === 'important') return '🟡 Important'
  if (task.priority === 'priority') return '🔴 Prioritaire'
  if (task.quadrant === 1) return '🔴 Critique'
  if (task.quadrant === 2) return '🟡 Important'
  return '—'
}

function difficultyLevel(task) {
  const h = task.dur_estimated || 0
  if (h >= 8) return 'red'
  if (h >= 4) return 'orange'
  if (h >= 1) return 'yellow'
  return 'gray'
}
function difficultyLabel(task) {
  const h = task.dur_estimated || 0
  if (h >= 8) return '🔴 Élevée'
  if (h >= 4) return '🟠 Moyenne'
  if (h >= 1) return '🟢 Faible'
  return '—'
}

function taskProgress(task) {
  const subs = task.subtasks || []
  if (!subs.length) return task.status === 'done' ? 100 : 0
  return Math.round(subs.filter(s => s.done).length / subs.length * 100)
}

function getTeamMember(id) {
  return props.team.find(m => m.id === id || m.id === Number(id))
}
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function addSubtask(taskId, e) {
  const name = e.target.value.trim()
  if (!name) return
  emit('add-subtask', taskId, name)
  e.target.value = ''
}
</script>

<style scoped>
/* Wrapper — scroll horizontal */
.sm-tree-wrap {
  overflow-x: auto;
  border: 1px solid var(--sm-bd, #e5e7eb);
  border-radius: 12px;
  background: var(--sm-white, #fff);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

/* Table body */
.sm-tree {
  min-width: 1200px;
}

/* Header (sticky) */
.sm-tree-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--sm-bg, #f9fafb);
  border-bottom: 1px solid var(--sm-bd, #e5e7eb);
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--sm-t3, #6b7280);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Columns */
.sm-tree-col { display: flex; align-items: center; gap: 6px; }
.sm-tree-col--name { flex: 2.5; min-width: 200px; position: sticky; left: 0; background: inherit; z-index: 5; }
.sm-tree-col--date { width: 80px; flex-shrink: 0; font-size: 11px; color: var(--sm-t3, #6b7280); }
.sm-tree-col--urgency { width: 90px; flex-shrink: 0; }
.sm-tree-col--importance { width: 90px; flex-shrink: 0; }
.sm-tree-col--difficulty { width: 80px; flex-shrink: 0; }
.sm-tree-col--assigned { width: 80px; flex-shrink: 0; }
.sm-tree-col--status { width: 80px; flex-shrink: 0; justify-content: center; }
.sm-tree-col--roadmap { width: 80px; flex-shrink: 0; }
.sm-tree-col--duration { width: 60px; flex-shrink: 0; font-size: 11px; color: var(--sm-t3); }
.sm-tree-col--end { width: 80px; flex-shrink: 0; font-size: 11px; color: var(--sm-t3); }
.sm-tree-col--progress { width: 60px; flex-shrink: 0; justify-content: center; }
.sm-tree-col--actions { width: 55px; flex-shrink: 0; justify-content: flex-end; gap: 2px; }

/* Rows */
.sm-tree-row {
  display: flex;
  align-items: center;
  padding: 7px 16px;
  border-bottom: 1px solid var(--sm-bd, #f0f0f0);
  cursor: pointer;
  transition: background .15s;
}
.sm-tree-row:hover { background: var(--sm-bg, #f9fafb); }
.sm-tree-row--project { font-weight: 700; background: var(--sm-bg, #fafbfc); }
.sm-tree-row--project:hover { background: #f0f4f8; }
.sm-tree-row--project .sm-tree-col--name { background: var(--sm-bg, #fafbfc); }
.sm-tree-row--project:hover .sm-tree-col--name { background: #f0f4f8; }
.sm-tree-row--task { font-weight: 500; }
.sm-tree-row--task .sm-tree-col--name { background: var(--sm-white, #fff); }
.sm-tree-row--task:hover .sm-tree-col--name { background: var(--sm-bg, #f9fafb); }
.sm-tree-row--subtask { cursor: default; font-weight: 400; }
.sm-tree-row--subtask .sm-tree-col--name { background: var(--sm-white, #fff); }
.sm-tree-row--add { cursor: default; padding: 4px 16px; border-bottom: none; }

/* Tags (urgency, importance, difficulty) */
.sm-tree-tag { font-size: 10px; padding: 2px 6px; border-radius: 6px; font-weight: 600; white-space: nowrap; }
.sm-tree-tag--red { background: #fef2f2; color: #dc2626; }
.sm-tree-tag--orange { background: #fff7ed; color: #ea580c; }
.sm-tree-tag--yellow { background: #fefce8; color: #ca8a04; }
.sm-tree-tag--green { background: #f0fdf4; color: #16a34a; }
.sm-tree-tag--gray { color: var(--sm-t3, #9ca3af); font-weight: 400; }

/* Toggle chevron */
.sm-tree-toggle {
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer; color: var(--sm-t3, #9ca3af);
  transition: transform .2s; flex-shrink: 0; border-radius: 4px; padding: 0;
}
.sm-tree-toggle:hover { background: rgba(0,0,0,.05); color: var(--sm-t1, #374151); }
.sm-tree-toggle--open { transform: rotate(90deg); }
.sm-tree-toggle--empty { visibility: hidden; }

/* Labels */
.sm-tree-emoji { font-size: 15px; flex-shrink: 0; }
.sm-tree-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--sm-t1, #1f2937); }
.sm-tree-label--project { font-size: 13px; font-weight: 800; }
.sm-tree-label--done { text-decoration: line-through; opacity: .5; }
.sm-tree-label--sub { font-size: 12px; }
.sm-tree-count { font-size: 10px; color: #fff; background: var(--sm-t3, #9ca3af); border-radius: 10px; padding: 1px 6px; font-weight: 700; flex-shrink: 0; margin-left: 4px; }
.sm-tree-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sm-tree-assignee { font-size: 11px; color: var(--sm-t2, #475569); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70px; }

/* Status badges */
.sm-tree-badge { color: #fff; font-size: 9px; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
.sm-tree-status {
  font-size: 10px; padding: 2px 7px; border-radius: 10px; font-weight: 600;
  display: inline-flex; align-items: center;
}
.sm-tree-status--todo { background: #f3f4f6; color: #6b7280; }
.sm-tree-status--doing, .sm-tree-status--in_progress { background: #fef3c7; color: #d97706; }
.sm-tree-status--blocked { background: #dbeafe; color: #2563eb; }
.sm-tree-status--done { background: #d1fae5; color: #059669; }

/* Progress bar */
.sm-tree-bar { flex: 1; height: 5px; background: var(--sm-bd, #e5e7eb); border-radius: 3px; overflow: hidden; }
.sm-tree-bar-fill { height: 100%; border-radius: 3px; background: var(--sm-grad-h); transition: width .3s; }
.sm-tree-pct { font-size: 11px; font-weight: 700; color: var(--sm-t3, #6b7280); }

/* Avatar */
.sm-tree-avatar {
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800; color: #fff; background: #4f46e5;
}

/* Checkbox */
.sm-tree-check { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }
.sm-tree-check input { display: none; }
.sm-tree-checkmark {
  width: 16px; height: 16px; border: 2px solid var(--sm-bd, #d1d5db); border-radius: 4px;
  display: flex; align-items: center; justify-content: center; transition: all .2s;
}
.sm-tree-check input:checked + .sm-tree-checkmark { background: #22c55e; border-color: #22c55e; }
.sm-tree-check input:checked + .sm-tree-checkmark::after { content: '✓'; color: #fff; font-size: 10px; font-weight: 900; }

/* Actions */
.sm-tree-act {
  background: none; border: none; cursor: pointer; font-size: 11px; padding: 2px 4px;
  border-radius: 4px; opacity: 0; transition: opacity .2s;
}
.sm-tree-act:hover { background: rgba(0,0,0,.06); }
.sm-tree-row:hover .sm-tree-act { opacity: 1; }

/* Add subtask */
.sm-tree-add-input {
  border: none; background: transparent; font-size: 12px; color: var(--sm-t3, #9ca3af);
  padding: 4px 0; width: 100%; outline: none;
}
.sm-tree-add-input:focus { color: var(--sm-t1, #1f2937); }

/* Empty */
.sm-tree-empty { padding: 40px; text-align: center; color: var(--sm-t3, #9ca3af); font-size: 14px; }

/* Animation */
.sm-tree-children { animation: sm-tree-slide .2s ease; }
@keyframes sm-tree-slide { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* Dark theme */
[data-theme="dark"] .sm-tree-wrap { background: var(--sm-white); border-color: var(--sm-bd); }
[data-theme="dark"] .sm-tree-header { background: var(--sm-bg); }
[data-theme="dark"] .sm-tree-row--project { background: var(--sm-bg); }
[data-theme="dark"] .sm-tree-row--project .sm-tree-col--name { background: var(--sm-bg); }
[data-theme="dark"] .sm-tree-row--task .sm-tree-col--name { background: var(--sm-white); }
</style>
