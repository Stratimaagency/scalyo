<template>
  <div>
    <!-- Task row -->
    <div class="sm-tree-row" :class="rowClass" :style="{ '--indent': (depth * 20 + 24) + 'px' }">
      <div class="sm-tree-col sm-tree-col--name" :style="{ paddingLeft: (depth * 20 + 24) + 'px' }">
        <button v-if="task.children?.length" class="sm-tree-toggle" :class="{ open: expanded.has('t-' + task.id) }" @click.stop="$emit('toggle', 't-' + task.id)">▸</button>
        <span v-else class="sm-tree-toggle" style="visibility:hidden">▸</span>
        <span class="sm-tree-dot" :style="{ background: prioColor }"></span>
        <input v-if="editingName" class="sm-inline" v-model="task.name" @blur="saveName" @keydown.enter="saveName" @click.stop />
        <span v-else class="sm-tree-label" :class="{ done: task.status === 'done' }" @dblclick.stop="editingName = true">{{ task.name }}</span>
        <button class="sm-tree-add-child" @click.stop="showAddChild = !showAddChild" title="Ajouter sous-tâche">+</button>
      </div>
      <div class="sm-tree-col sm-tree-col--date" @click.stop><input type="date" class="sm-inline-date" :value="dateVal(task.end_date)" @change="upd('end_date', $event.target.value)" /></div>
      <div class="sm-tree-col sm-tree-col--urgency" @click.stop>
        <select class="sm-inline-sel" :value="task.urgency || task.priority || 'normal'" @change="upd('urgency', $event.target.value)">
          <option value="normal">⚪</option><option value="medium">🟡</option><option value="high">🟠</option><option value="critical">🔴</option><option value="urgent">⚡</option>
        </select>
      </div>
      <div class="sm-tree-col sm-tree-col--importance" @click.stop>
        <select class="sm-inline-sel" :value="task.importance || 'normal'" @change="upd('importance', $event.target.value)">
          <option value="normal">⚪</option><option value="important">🟡</option><option value="critical">🔴</option>
        </select>
      </div>
      <div class="sm-tree-col sm-tree-col--diff" @click.stop>
        <select class="sm-inline-sel" :value="task.difficulty || 'medium'" @change="upd('difficulty', $event.target.value)">
          <option value="easy">🟢</option><option value="medium">🟡</option><option value="hard">🔴</option>
        </select>
      </div>
      <div class="sm-tree-col sm-tree-col--assigned" @click.stop>
        <select class="sm-inline-sel sm-inline-sel--sm" :value="task.assigned_to || ''" @change="upd('assigned_to', $event.target.value || null)">
          <option value="">—</option>
          <option v-for="m in team" :key="m.id" :value="m.id">{{ m.display_name || m.email }}</option>
        </select>
      </div>
      <div class="sm-tree-col sm-tree-col--status" @click.stop>
        <select class="sm-inline-sel" :value="task.status" @change="upd('status', $event.target.value)" :style="{ color: statusColor }">
          <option value="todo">📋</option><option value="in_progress">⚡</option><option value="blocked">⏸</option><option value="done">✅</option>
        </select>
      </div>
      <div class="sm-tree-col sm-tree-col--dur" @click.stop><input type="number" class="sm-inline-num" :value="task.dur_estimated" @change="upd('dur_estimated', +$event.target.value || null)" placeholder="—" min="0" step="0.5" /></div>
      <div class="sm-tree-col sm-tree-col--dur" @click.stop><input type="number" class="sm-inline-num" :value="task.actual_duration" @change="upd('actual_duration', +$event.target.value || null)" placeholder="—" min="0" step="0.5" /></div>
      <div class="sm-tree-col sm-tree-col--dur"><span class="ai-val" v-if="task.dur_ai">{{ task.dur_ai }}h</span><span v-else class="muted">—</span></div>
      <div class="sm-tree-col sm-tree-col--progress"><span :style="{ color: progressColor }">{{ task.progress || 0 }}%</span></div>
      <div class="sm-tree-col sm-tree-col--accuracy">
        <span v-if="task.accuracy != null" :style="{ color: task.accuracy >= 80 ? '#16a34a' : task.accuracy >= 50 ? '#d97706' : '#dc2626' }">{{ task.accuracy }}%</span>
        <span v-else class="muted">—</span>
      </div>
      <div class="sm-tree-col sm-tree-col--ai"><span v-if="task.ai_recommendation" :title="task.ai_recommendation">{{ task.ai_recommendation.slice(0, 60) }}{{ task.ai_recommendation.length > 60 ? '…' : '' }}</span></div>
      <div class="sm-tree-col sm-tree-col--actions"><button class="sm-tree-act" @click.stop="$emit('delete', task)">🗑️</button></div>
    </div>

    <!-- Add child input -->
    <div v-if="showAddChild" class="sm-tree-row sm-tree-row--add" :style="{ paddingLeft: ((depth + 1) * 20 + 24) + 'px' }">
      <input class="sm-tree-add-input" :placeholder="'+ Sous-tâche de ' + task.name + '...'" @keydown.enter="addChild($event)" @keydown.escape="showAddChild = false" autofocus />
    </div>

    <!-- Children (recursive) -->
    <template v-if="expanded.has('t-' + task.id) && task.children?.length">
      <SmTreeRow v-for="child in task.children" :key="child.id"
        :task="child" :team="team" :depth="depth + 1" :expanded="expanded"
        @toggle="$emit('toggle', $event)" @update="$emit('update', $event[0] || $event, $event[1])" @delete="$emit('delete', $event)" @add-child="$emit('add-child', $event[0] || $event, $event[1], $event[2])" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  team: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  expanded: { type: Object, required: true },
})

const emit = defineEmits(['toggle', 'update', 'delete', 'add-child'])

const editingName = ref(false)
const showAddChild = ref(false)

const prioColor = computed(() => {
  const m = { urgent: '#ef4444', critical: '#ef4444', high: '#f97316', priority: '#f97316', important: '#eab308', medium: '#eab308' }
  return m[props.task.urgency] || m[props.task.priority] || '#94a3b8'
})
const statusColor = computed(() => ({ done: '#16a34a', in_progress: '#d97706', blocked: '#2563eb' }[props.task.status] || '#6b7280'))
const progressColor = computed(() => {
  const p = props.task.progress || 0
  if (p >= 80) return '#16a34a'
  if (p >= 40) return '#d97706'
  return '#6b7280'
})
const rowClass = computed(() => ({
  'sm-tree-row--done': props.task.status === 'done',
  'sm-tree-row--risk': props.task.urgency === 'critical' || props.task.urgency === 'urgent',
}))

function dateVal(d) { return d ? d.slice(0, 10) : '' }
function upd(field, value) { emit('update', props.task.id, { [field]: value }) }
function saveName() { editingName.value = false; emit('update', props.task.id, { name: props.task.name }) }
function addChild(e) {
  const name = e.target.value.trim()
  if (!name) return
  emit('add-child', props.task.id, props.task.project_id, name)
  e.target.value = ''
  showAddChild.value = false
}
</script>

<style scoped>
.sm-tree-row { display: flex; align-items: center; padding: 4px 12px; border-bottom: 1px solid rgba(0,0,0,.03); transition: background .1s; }
.sm-tree-row:hover { background: #fafbff; }
.sm-tree-row--done { opacity: .5; }
.sm-tree-row--risk { background: #fef2f2; }
.sm-tree-row--risk:hover { background: #fee2e2; }
.sm-tree-row--add { padding: 2px 12px; }
.sm-tree-col { display: flex; align-items: center; gap: 3px; padding: 0 2px; }
.sm-tree-col--name { flex: 2; min-width: 200px; position: sticky; left: 0; background: inherit; z-index: 5; }
.sm-tree-col--date { width: 75px; flex-shrink: 0; }
.sm-tree-col--urgency { width: 85px; flex-shrink: 0; }
.sm-tree-col--importance { width: 85px; flex-shrink: 0; }
.sm-tree-col--diff { width: 55px; flex-shrink: 0; }
.sm-tree-col--assigned { width: 75px; flex-shrink: 0; }
.sm-tree-col--status { width: 80px; flex-shrink: 0; }
.sm-tree-col--dur { width: 50px; flex-shrink: 0; justify-content: center; }
.sm-tree-col--progress { width: 40px; flex-shrink: 0; justify-content: center; font-weight: 700; font-size: 11px; }
.sm-tree-col--accuracy { width: 45px; flex-shrink: 0; justify-content: center; font-size: 10px; font-weight: 600; }
.sm-tree-col--ai { flex: 1; min-width: 150px; font-size: 10px; color: var(--sm-t3); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.sm-tree-col--actions { width: 35px; flex-shrink: 0; justify-content: flex-end; }
.sm-tree-toggle { border: none; background: none; cursor: pointer; font-size: 9px; color: var(--sm-t3); transition: transform .15s; width: 14px; flex-shrink: 0; padding: 0; }
.sm-tree-toggle.open { transform: rotate(90deg); }
.sm-tree-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.sm-tree-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--sm-t1); cursor: text; font-size: 12px; }
.sm-tree-label:hover { text-decoration: underline dotted; }
.sm-tree-label.done { text-decoration: line-through; opacity: .5; }
.sm-tree-add-child { border: none; background: rgba(79,70,229,.08); color: #4f46e5; cursor: pointer; font-size: 11px; font-weight: 700; width: 18px; height: 18px; border-radius: 4px; display: none; align-items: center; justify-content: center; margin-left: 4px; flex-shrink: 0; }
.sm-tree-row:hover .sm-tree-add-child { display: flex; }
.sm-inline { border: 1px solid #4f46e5; border-radius: 4px; padding: 1px 5px; font-size: 11px; font-family: inherit; color: var(--sm-t1); outline: none; width: 100%; min-width: 60px; }
.sm-inline-date { border: none; background: none; font-size: 10px; color: var(--sm-t2); cursor: pointer; padding: 1px; width: 80px; font-family: inherit; outline: none; }
.sm-inline-date:hover { background: rgba(79,70,229,.05); border-radius: 3px; }
.sm-inline-sel { border: none; background: none; font-size: 10px; color: var(--sm-t1); cursor: pointer; padding: 1px 0; font-family: inherit; outline: none; appearance: none; -webkit-appearance: none; max-width: 80px; }
.sm-inline-sel:hover { background: rgba(79,70,229,.05); border-radius: 3px; }
.sm-inline-sel--sm { max-width: 70px; }
.sm-inline-num { border: none; background: none; font-size: 10px; color: var(--sm-t2); width: 40px; text-align: center; padding: 1px; font-family: inherit; outline: none; }
.sm-inline-num:hover { background: rgba(79,70,229,.05); border-radius: 3px; }
.ai-val { font-size: 10px; color: #4f46e5; font-weight: 600; }
.muted { color: var(--sm-t3); font-size: 10px; }
.sm-tree-act { background: none; border: none; cursor: pointer; font-size: 10px; padding: 2px; opacity: 0; transition: opacity .1s; }
.sm-tree-row:hover .sm-tree-act { opacity: 1; }
.sm-tree-add-input { border: none; background: transparent; font-size: 11px; color: var(--sm-t3); padding: 2px 0; width: 100%; outline: none; }
.sm-tree-add-input:focus { color: var(--sm-t1); }
</style>
