<template>
  <div class="sm-tree-wrap">
    <div class="sm-tree">
      <!-- Header (sticky) -->
      <div class="sm-tree-header">
        <div class="sm-tree-col sm-tree-col--name">Nom</div>
        <div class="sm-tree-col sm-tree-col--date">Échéance</div>
        <div class="sm-tree-col sm-tree-col--urgency">Urgence</div>
        <div class="sm-tree-col sm-tree-col--importance">Importance</div>
        <div class="sm-tree-col sm-tree-col--diff">Difficulté</div>
        <div class="sm-tree-col sm-tree-col--assigned">Assigné</div>
        <div class="sm-tree-col sm-tree-col--status">Statut</div>
        <div class="sm-tree-col sm-tree-col--dur">Estimé</div>
        <div class="sm-tree-col sm-tree-col--dur">Réel</div>
        <div class="sm-tree-col sm-tree-col--dur">IA</div>
        <div class="sm-tree-col sm-tree-col--progress">%</div>
        <div class="sm-tree-col sm-tree-col--accuracy">Préc.</div>
        <div class="sm-tree-col sm-tree-col--ai">Recommandation IA</div>
        <div class="sm-tree-col sm-tree-col--actions"></div>
      </div>

      <div v-if="!projects.length" class="sm-tree-empty">Aucun projet.</div>

      <!-- Projects -->
      <template v-for="project in projects" :key="project.id">
        <div class="sm-tree-row sm-tree-row--project" @click="toggle('p-' + project.id)">
          <div class="sm-tree-col sm-tree-col--name">
            <label v-if="bulkMode" class="sm-tree-check" @click.stop><input type="checkbox" :checked="bulkSelect.includes(project.id)" @change="$emit('toggle-bulk', project.id)" /><span class="sm-tree-checkmark"></span></label>
            <button class="sm-tree-toggle" :class="{ open: expanded.has('p-' + project.id) }">▸</button>
            <span class="sm-tree-emoji">{{ project.emoji || '📁' }}</span>
            <span class="sm-tree-label sm-tree-label--project">{{ project.name }}</span>
            <span class="sm-tree-badge-count">{{ flatCount(tasks[project.id]) }}</span>
          </div>
          <div class="sm-tree-col sm-tree-col--date" @click.stop><input type="date" class="sm-inline-date" :value="(project.end_date || project.target_end_date || '').slice(0,10)" @change="onUpdateProject(project, 'end_date', $event.target.value)" /></div>
          <div class="sm-tree-col sm-tree-col--urgency" @click.stop>
            <select class="sm-pill-sel" :class="'pill-' + (project.state === 'urgent' ? 'urgent' : project.state === 'priority' ? 'high' : 'normal')" :value="project.state === 'urgent' ? 'urgent' : project.state === 'priority' ? 'high' : 'normal'" @change="onUpdateProject(project, 'state', $event.target.value === 'urgent' ? 'urgent' : $event.target.value === 'high' ? 'priority' : 'active')">
              <option value="normal">Aucune</option><option value="high">Haute</option><option value="urgent">Urgente</option>
            </select>
          </div>
          <div class="sm-tree-col sm-tree-col--importance" @click.stop>
            <select class="sm-pill-sel" :class="'pill-' + (project.state === 'important' ? 'important' : 'normal')" :value="project.state === 'important' ? 'important' : 'normal'" @change="onUpdateProject(project, 'state', $event.target.value === 'important' ? 'important' : 'active')">
              <option value="normal">Aucune</option><option value="important">Importante</option>
            </select>
          </div>
          <div class="sm-tree-col sm-tree-col--diff" @click.stop>
            <select class="sm-pill-sel" :class="'pill-' + (project.difficulty || 'medium')" :value="project.difficulty || 'medium'" @change="onUpdateProject(project, 'difficulty', $event.target.value)">
              <option value="easy">Facile</option><option value="medium">Moyen</option><option value="hard">Difficile</option>
            </select>
          </div>
          <div class="sm-tree-col sm-tree-col--assigned" @click.stop>
            <select class="sm-pill-sel pill-normal" :value="project.assigned_to || ''" @change="onUpdateProject(project, 'assigned_to', $event.target.value || null)">
              <option value="">Non assigné</option>
              <option v-for="m in team" :key="m.id" :value="m.id">{{ m.display_name || m.email }}</option>
            </select>
          </div>
          <div class="sm-tree-col sm-tree-col--status" @click.stop>
            <select class="sm-pill-sel" :class="'pill-status-' + (project.state || 'active')" :value="project.state || 'active'" @change="onUpdateProject(project, 'state', $event.target.value)">
              <option value="active">Actif</option><option value="priority">Prioritaire</option><option value="urgent">Urgent</option><option value="important">Important</option><option value="paused">En pause</option>
            </select>
          </div>
          <div class="sm-tree-col sm-tree-col--dur" @click.stop><input type="number" class="sm-inline-num" :value="project.hours_per_day || 8" @change="onUpdateProject(project, 'hours_per_day', +$event.target.value)" min="1" step="0.5" /></div>
          <div class="sm-tree-col sm-tree-col--dur"></div>
          <div class="sm-tree-col sm-tree-col--dur"></div>
          <div class="sm-tree-col sm-tree-col--progress"><strong>{{ project.progress || 0 }}%</strong></div>
          <div class="sm-tree-col sm-tree-col--accuracy"></div>
          <div class="sm-tree-col sm-tree-col--ai"></div>
          <div class="sm-tree-col sm-tree-col--actions"><button class="sm-tree-act" @click.stop="$emit('delete-project', project)">🗑️</button></div>
        </div>

        <!-- Tasks (recursive) -->
        <template v-if="expanded.has('p-' + project.id)">
          <SmTreeRow v-for="task in (tasks[project.id] || [])" :key="task.id"
            :task="task" :team="team" :depth="0" :expanded="expanded"
            @toggle="toggle" @update="onUpdate" @delete="onDelete" @add-child="onAddChild" />
          <!-- Quick add -->
          <div class="sm-tree-row sm-tree-row--add" style="padding-left:40px">
            <input class="sm-tree-add-input" placeholder="+ Ajouter une tâche..." @keydown.enter="onQuickAdd(project.id, $event)" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import SmTreeRow from './SmTreeRow.vue'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  tasks: { type: Object, default: () => ({}) },
  team: { type: Array, default: () => [] },
  bulkMode: { type: Boolean, default: false },
  bulkSelect: { type: Array, default: () => [] },
})

const emit = defineEmits(['delete-project', 'update-project', 'toggle-bulk', 'update-task', 'delete-task', 'quick-add-task', 'add-child-task'])

const expanded = reactive(new Set())

function toggle(key) { expanded.has(key) ? expanded.delete(key) : expanded.add(key) }
function fmtDate(d) { if (!d) return '—'; const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit' }) }
function flatCount(tree) { if (!tree) return 0; let c = 0; for (const t of tree) { c++; if (t.children?.length) c += flatCount(t.children) }; return c }
function onUpdateProject(project, field, value) { emit('update-project', project.id, { [field]: value }) }
function onUpdate(taskId, fields) { emit('update-task', taskId, fields) }
function onDelete(task) { emit('delete-task', task) }
function onAddChild(parentId, projectId, name) { emit('add-child-task', parentId, projectId, name) }
function onQuickAdd(projectId, e) { const n = e.target.value.trim(); if (!n) return; emit('quick-add-task', projectId, n); e.target.value = '' }
</script>

<style scoped>
.sm-tree-wrap { overflow-x: auto; border: 1px solid var(--sm-bd, #e5e7eb); border-radius: 12px; background: var(--sm-white, #fff); font-family: 'DM Sans', sans-serif; font-size: 12px; }
.sm-tree { min-width: 1400px; }
.sm-tree-header { display: flex; align-items: center; padding: 8px 12px; background: var(--sm-bg, #f9fafb); border-bottom: 1px solid var(--sm-bd); font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: var(--sm-t3, #6b7280); position: sticky; top: 0; z-index: 10; }
.sm-tree-col { display: flex; align-items: center; gap: 4px; padding: 0 2px; }
.sm-tree-col--name { flex: 2; min-width: 200px; position: sticky; left: 0; background: inherit; z-index: 5; }
.sm-tree-col--date { width: 75px; flex-shrink: 0; }
.sm-tree-col--urgency { width: 90px; flex-shrink: 0; }
.sm-tree-col--importance { width: 90px; flex-shrink: 0; }
.sm-tree-col--diff { width: 75px; flex-shrink: 0; }
.sm-tree-col--assigned { width: 75px; flex-shrink: 0; }
.sm-tree-col--status { width: 80px; flex-shrink: 0; }
.sm-tree-col--dur { width: 50px; flex-shrink: 0; text-align: center; justify-content: center; }
.sm-tree-col--progress { width: 40px; flex-shrink: 0; justify-content: center; }
.sm-tree-col--accuracy { width: 45px; flex-shrink: 0; justify-content: center; }
.sm-tree-col--ai { flex: 1; min-width: 150px; font-size: 10px; color: var(--sm-t3); }
.sm-tree-col--actions { width: 35px; flex-shrink: 0; justify-content: flex-end; }
.sm-tree-row { display: flex; align-items: center; padding: 5px 12px; border-bottom: 1px solid rgba(0,0,0,.04); transition: background .1s; }
.sm-tree-row:hover { background: var(--sm-bg, #f9fafb); }
.sm-tree-row--project { font-weight: 700; background: var(--sm-bg, #fafbfc); cursor: pointer; }
.sm-tree-row--project:hover { background: #eef2ff; }
.sm-tree-row--project .sm-tree-col--name { background: var(--sm-bg, #fafbfc); }
.sm-tree-row--project:hover .sm-tree-col--name { background: #eef2ff; }
.sm-tree-row--add { padding: 3px 12px; }
.sm-tree-toggle { border: none; background: none; cursor: pointer; font-size: 10px; color: var(--sm-t3); transition: transform .15s; width: 16px; flex-shrink: 0; padding: 0; }
.sm-tree-toggle.open { transform: rotate(90deg); }
.sm-tree-emoji { font-size: 14px; flex-shrink: 0; }
.sm-tree-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--sm-t1, #1f2937); }
.sm-tree-label--project { font-size: 12px; font-weight: 800; }
.sm-tree-badge-count { font-size: 9px; color: #fff; background: var(--sm-t3); border-radius: 10px; padding: 1px 5px; font-weight: 700; margin-left: 4px; }
.tag-badge { color: #fff; font-size: 9px; padding: 2px 7px; border-radius: 8px; font-weight: 700; }
.sm-tree-check { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }
.sm-tree-check input { display: none; }
.sm-tree-checkmark { width: 14px; height: 14px; border: 2px solid var(--sm-bd); border-radius: 3px; display: flex; align-items: center; justify-content: center; }
.sm-tree-check input:checked + .sm-tree-checkmark { background: #22c55e; border-color: #22c55e; }
.sm-tree-check input:checked + .sm-tree-checkmark::after { content: '✓'; color: #fff; font-size: 9px; font-weight: 900; }
.sm-tree-act { background: none; border: none; cursor: pointer; font-size: 10px; padding: 2px; opacity: 0; transition: opacity .15s; }
.sm-tree-row:hover .sm-tree-act { opacity: 1; }
.sm-tree-add-input { border: none; background: transparent; font-size: 11px; color: var(--sm-t3); padding: 3px 0; width: 100%; outline: none; }
.sm-tree-add-input:focus { color: var(--sm-t1); }
.sm-tree-empty { padding: 40px; text-align: center; color: var(--sm-t3); font-size: 13px; }
/* Pill selects */
.sm-pill-sel {
  font-size: 10px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  border: none; border-radius: 6px; padding: 3px 6px; cursor: pointer;
  outline: none; appearance: none; -webkit-appearance: none;
  text-align: center; min-width: 70px;
}
.pill-normal { background: #f1f5f9; color: #64748b; }
.pill-medium { background: #fef3c7; color: #92400e; }
.pill-high { background: #ffedd5; color: #c2410c; }
.pill-critical { background: #fee2e2; color: #dc2626; }
.pill-urgent { background: #dc2626; color: #fff; }
.pill-important { background: #fef3c7; color: #92400e; }
.pill-easy { background: #dcfce7; color: #166534; }
.pill-hard { background: #fee2e2; color: #dc2626; }
.pill-status-todo, .pill-status-active { background: #f1f5f9; color: #475569; }
.pill-status-in_progress, .pill-status-priority { background: #dbeafe; color: #1d4ed8; }
.pill-status-blocked, .pill-status-important { background: #fef3c7; color: #92400e; }
.pill-status-done { background: #dcfce7; color: #166534; }
.pill-status-urgent { background: #dc2626; color: #fff; }
.pill-status-paused { background: #e2e8f0; color: #64748b; }
/* Inline edit controls for project rows */
.sm-inline-date { border: none; background: none; font-size: 10px; color: var(--sm-t2, #475569); cursor: pointer; padding: 1px; width: 80px; font-family: inherit; outline: none; }
.sm-inline-date:hover { background: rgba(79,70,229,.05); border-radius: 3px; }
.sm-inline-sel { border: none; background: none; font-size: 10px; color: var(--sm-t1); cursor: pointer; padding: 1px 0; font-family: inherit; outline: none; appearance: none; -webkit-appearance: none; max-width: 80px; }
.sm-inline-sel:hover { background: rgba(79,70,229,.05); border-radius: 3px; }
.sm-inline-sel--sm { max-width: 70px; }
.sm-inline-num { border: none; background: none; font-size: 10px; color: var(--sm-t2); width: 40px; text-align: center; padding: 1px; font-family: inherit; outline: none; }
.sm-inline-num:hover { background: rgba(79,70,229,.05); border-radius: 3px; }
</style>
