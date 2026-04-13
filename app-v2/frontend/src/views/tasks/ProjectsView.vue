<template>
  <div class="pv">
    <div class="pv-header">
      <h1>📁 {{ t('sm_projects_title') }}</h1>
      <div class="pv-actions">
        <span class="scroll-hint">{{ t('sm_scroll_hint') }}</span>
        <button class="btn-primary" @click="slideOpen = true">{{ t('sm_new_project') }}</button>
      </div>
    </div>

    <!-- TABLE -->
    <div v-if="rows.length" class="table-outer">
      <div class="table-scroll" ref="scrollRef">
        <table class="pv-table">
          <thead>
            <tr>
              <th class="col-fix col-exp"></th>
              <th class="col-fix col-num">#</th>
              <th class="col-fix col-title">{{ t('sm_col_title') }}</th>
              <th class="col-scroll col-date">{{ t('sm_col_start') }}</th>
              <th class="col-scroll col-date">{{ t('sm_col_end') }}</th>
              <th class="col-scroll col-badge">{{ t('sm_col_urgency') }}</th>
              <th class="col-scroll col-badge">{{ t('sm_col_importance') }}</th>
              <th class="col-scroll col-badge">{{ t('sm_col_difficulty') }}</th>
              <th class="col-scroll col-status">{{ t('status_todo').split(' ')[0] }}</th>
              <th class="col-scroll col-check">{{ t('sm_col_finished') }}</th>
              <th class="col-scroll col-check">{{ t('sm_col_pended') }}</th>
              <th class="col-scroll col-num-input">{{ t('sm_col_actual') }}</th>
              <th class="col-scroll col-num-input">{{ t('sm_col_expected') }}</th>
              <th class="col-scroll col-num-input">{{ t('sm_col_min') }}</th>
              <th class="col-scroll col-num-input">{{ t('sm_col_max') }}</th>
              <th class="col-scroll col-num-input col-avg">{{ t('sm_col_avg') }}</th>
              <th class="col-scroll col-desc">{{ t('sm_col_desc') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(row, ri) in visibleRows" :key="row.id">
              <tr :class="['row-level-' + row.level, { 'row-project': row.type === 'project', 'row-done': row.finished }]">
                <!-- Fixed columns -->
                <td class="col-fix col-exp">
                  <button v-if="row.hasChildren" class="exp-btn" @click="toggleExpand(row.id)">{{ expanded[row.id] ? '▾' : '▸' }}</button>
                </td>
                <td class="col-fix col-num">{{ ri + 1 }}</td>
                <td class="col-fix col-title" :style="{ paddingLeft: (12 + row.level * 24) + 'px' }">
                  <span v-if="row.type === 'project'" class="proj-dot" :style="{ background: row.color }" />
                  <span v-if="editCell === row.id + '_title'" class="edit-wrap">
                    <input v-model="row.title" class="cell-input title-input" @keydown.enter="editCell = null" @keydown.tab.prevent="editCell = null" @keydown.escape="editCell = null" ref="editRef" />
                  </span>
                  <span v-else class="cell-text title-text" :class="{ bold: row.type === 'project' }" @click="editCell = row.id + '_title'">{{ row.title }}</span>
                  <button v-if="row.type === 'project'" class="add-task-btn" @click.stop="addTask(row.id)">+ {{ t('sm_new_task') }}</button>
                  <button v-else class="add-sub-btn" @click.stop="addSubtask(row)">+</button>
                </td>
                <!-- Scrollable columns -->
                <td class="col-scroll col-date" @click="editCell = row.id + '_startDate'">
                  <input v-if="editCell === row.id + '_startDate'" v-model="row.startDate" type="date" class="cell-input" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text">{{ row.startDate || '—' }}</span>
                </td>
                <td class="col-scroll col-date" @click="editCell = row.id + '_endDate'">
                  <input v-if="editCell === row.id + '_endDate'" v-model="row.endDate" type="date" class="cell-input" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text">{{ row.endDate || '—' }}</span>
                </td>
                <td class="col-scroll col-badge" @click="cycleBadge(row, 'urgency')">
                  <span class="badge-num" :class="'b-' + row.urgency">{{ row.urgency }}</span>
                </td>
                <td class="col-scroll col-badge" @click="cycleBadge(row, 'importance')">
                  <span class="badge-num" :class="'b-' + row.importance">{{ row.importance }}</span>
                </td>
                <td class="col-scroll col-badge" @click="cycleBadge(row, 'difficulty')">
                  <span class="badge-num" :class="'b-' + row.difficulty">{{ row.difficulty }}</span>
                </td>
                <td class="col-scroll col-status">
                  <select v-model="row.status" class="cell-select" :class="'st-' + row.status">
                    <option value="todo">{{ t('status_todo') }}</option>
                    <option value="in_progress">{{ t('status_in_progress') }}</option>
                    <option value="blocked">{{ t('status_blocked') }}</option>
                    <option value="done">{{ t('status_done') }}</option>
                  </select>
                </td>
                <td class="col-scroll col-check"><input type="checkbox" v-model="row.finished" /></td>
                <td class="col-scroll col-check"><input type="checkbox" v-model="row.pended" /></td>
                <td class="col-scroll col-num-input" @click="editCell = row.id + '_actual'">
                  <input v-if="editCell === row.id + '_actual'" v-model.number="row.actualHours" type="number" min="0" step="0.5" class="cell-input num" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text num">{{ row.actualHours || '—' }}</span>
                </td>
                <td class="col-scroll col-num-input" @click="editCell = row.id + '_expected'">
                  <input v-if="editCell === row.id + '_expected'" v-model.number="row.expectedHours" type="number" min="0" step="0.5" class="cell-input num" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text num">{{ row.expectedHours || '—' }}</span>
                </td>
                <td class="col-scroll col-num-input" @click="editCell = row.id + '_min'">
                  <input v-if="editCell === row.id + '_min'" v-model.number="row.minHours" type="number" min="0" step="0.5" class="cell-input num" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text num">{{ row.minHours || '—' }}</span>
                </td>
                <td class="col-scroll col-num-input" @click="editCell = row.id + '_max'">
                  <input v-if="editCell === row.id + '_max'" v-model.number="row.maxHours" type="number" min="0" step="0.5" class="cell-input num" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text num">{{ row.maxHours || '—' }}</span>
                </td>
                <td class="col-scroll col-num-input col-avg">
                  <span class="cell-text num avg">{{ avgHours(row) }}</span>
                </td>
                <td class="col-scroll col-desc" @click="editCell = row.id + '_desc'">
                  <input v-if="editCell === row.id + '_desc'" v-model="row.description" class="cell-input" @keydown.enter="editCell = null" @blur="editCell = null" />
                  <span v-else class="cell-text desc">{{ row.description || '—' }}</span>
                </td>
              </tr>
            </template>
            <!-- Totals row -->
            <tr class="row-totals">
              <td class="col-fix col-exp"></td>
              <td class="col-fix col-num"></td>
              <td class="col-fix col-title"><strong>{{ t('sm_totals') }}</strong></td>
              <td class="col-scroll col-date"></td>
              <td class="col-scroll col-date"></td>
              <td class="col-scroll col-badge"></td>
              <td class="col-scroll col-badge"></td>
              <td class="col-scroll col-badge"></td>
              <td class="col-scroll col-status"></td>
              <td class="col-scroll col-check">{{ totals.finished }}/{{ totals.total }}</td>
              <td class="col-scroll col-check"></td>
              <td class="col-scroll col-num-input"><strong>{{ totals.actual }}</strong></td>
              <td class="col-scroll col-num-input"><strong>{{ totals.expected }}</strong></td>
              <td class="col-scroll col-num-input"><strong>{{ totals.min }}</strong></td>
              <td class="col-scroll col-num-input"><strong>{{ totals.max }}</strong></td>
              <td class="col-scroll col-num-input col-avg"><strong>{{ totals.avg }}</strong></td>
              <td class="col-scroll col-desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="pv-empty">
      <div class="empty-icon">📁</div>
      <h3>{{ t('sm_no_projects') }}</h3>
      <button class="btn-primary" @click="slideOpen = true">{{ t('sm_new_project') }}</button>
    </div>

    <!-- Slide-over new project -->
    <SlideOver :open="slideOpen" :title="t('sm_new_project')" @close="slideOpen = false">
      <form @submit.prevent="createProject" class="sf">
        <div class="fg"><label>{{ t('sm_project_name') }} *</label><input v-model="newName" required class="fi" /></div>
        <div class="fg"><label>{{ t('sm_project_color') }}</label>
          <div class="color-picks"><button v-for="c in colors" :key="c" type="button" class="cpick" :class="{ active: newColor === c }" :style="{ background: c }" @click="newColor = c" /></div>
        </div>
        <div class="fa">
          <button type="button" class="btn-outline" @click="slideOpen = false">{{ t('cancel') }}</button>
          <button type="submit" class="btn-primary">{{ t('create') }}</button>
        </div>
      </form>
    </SlideOver>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SlideOver from '@/components/SlideOver.vue'

const { t } = useI18n({ useScope: 'global' })

const slideOpen = ref(false)
const newName = ref('')
const newColor = ref('#7c3aed')
const editCell = ref(null)
const expanded = reactive({})
const colors = ['#7c3aed', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

// Mock data — 2 projects, tasks with subtasks
const rows = reactive([
  { id: 'p1', type: 'project', title: 'Onboarding Q2', color: '#7c3aed', level: 0, hasChildren: true, startDate: '2026-04-01', endDate: '2026-06-30', urgency: 4, importance: 5, difficulty: 3, status: 'in_progress', finished: false, pended: false, actualHours: 24, expectedHours: 40, minHours: 30, maxHours: 50, description: 'Programme onboarding clients Q2' },
  { id: 't1', type: 'task', parentId: 'p1', title: 'Kick-off clients', level: 1, hasChildren: true, startDate: '2026-04-01', endDate: '2026-04-07', urgency: 5, importance: 5, difficulty: 2, status: 'done', finished: true, pended: false, actualHours: 8, expectedHours: 6, minHours: 4, maxHours: 8, description: 'Appels kick-off avec chaque client' },
  { id: 'st1', type: 'subtask', parentId: 't1', title: 'Préparer agenda kick-off', level: 2, hasChildren: false, startDate: '2026-04-01', endDate: '2026-04-02', urgency: 4, importance: 5, difficulty: 1, status: 'done', finished: true, pended: false, actualHours: 2, expectedHours: 2, minHours: 1, maxHours: 3, description: '' },
  { id: 'st2', type: 'subtask', parentId: 't1', title: 'Envoyer invitations', level: 2, hasChildren: false, startDate: '2026-04-02', endDate: '2026-04-03', urgency: 3, importance: 4, difficulty: 1, status: 'done', finished: true, pended: false, actualHours: 1, expectedHours: 1, minHours: 0.5, maxHours: 2, description: '' },
  { id: 't2', type: 'task', parentId: 'p1', title: 'Configuration comptes', level: 1, hasChildren: true, startDate: '2026-04-08', endDate: '2026-04-14', urgency: 4, importance: 4, difficulty: 3, status: 'in_progress', finished: false, pended: false, actualHours: 10, expectedHours: 16, minHours: 12, maxHours: 20, description: 'Setup technique par client' },
  { id: 'st3', type: 'subtask', parentId: 't2', title: 'Configurer espaces clients', level: 2, hasChildren: false, startDate: '2026-04-08', endDate: '2026-04-10', urgency: 4, importance: 4, difficulty: 3, status: 'in_progress', finished: false, pended: false, actualHours: 6, expectedHours: 8, minHours: 6, maxHours: 10, description: '' },
  { id: 'st4', type: 'subtask', parentId: 't2', title: 'Tests intégration', level: 2, hasChildren: false, startDate: '2026-04-10', endDate: '2026-04-12', urgency: 3, importance: 3, difficulty: 4, status: 'todo', finished: false, pended: false, actualHours: 0, expectedHours: 4, minHours: 3, maxHours: 6, description: '' },
  { id: 't3', type: 'task', parentId: 'p1', title: 'Formation utilisateurs', level: 1, hasChildren: false, startDate: '2026-04-15', endDate: '2026-04-25', urgency: 3, importance: 5, difficulty: 2, status: 'todo', finished: false, pended: false, actualHours: 0, expectedHours: 12, minHours: 8, maxHours: 16, description: 'Sessions de formation' },
  { id: 'p2', type: 'project', title: 'Expansion Comptes', color: '#10b981', level: 0, hasChildren: true, startDate: '2026-04-01', endDate: '2026-05-30', urgency: 3, importance: 4, difficulty: 3, status: 'in_progress', finished: false, pended: false, actualHours: 5, expectedHours: 20, minHours: 15, maxHours: 30, description: 'Identifier et closer les opportunités' },
  { id: 't4', type: 'task', parentId: 'p2', title: 'Analyse opportunités', level: 1, hasChildren: true, startDate: '2026-04-01', endDate: '2026-04-10', urgency: 3, importance: 4, difficulty: 2, status: 'done', finished: true, pended: false, actualHours: 5, expectedHours: 6, minHours: 4, maxHours: 8, description: '' },
  { id: 'st5', type: 'subtask', parentId: 't4', title: 'Audit usage par client', level: 2, hasChildren: false, startDate: '2026-04-01', endDate: '2026-04-05', urgency: 3, importance: 4, difficulty: 2, status: 'done', finished: true, pended: false, actualHours: 3, expectedHours: 4, minHours: 2, maxHours: 5, description: '' },
  { id: 'st6', type: 'subtask', parentId: 't4', title: 'Qualifier 3 prospects', level: 2, hasChildren: false, startDate: '2026-04-05', endDate: '2026-04-08', urgency: 2, importance: 3, difficulty: 2, status: 'done', finished: true, pended: false, actualHours: 2, expectedHours: 2, minHours: 1, maxHours: 3, description: '' },
  { id: 't5', type: 'task', parentId: 'p2', title: 'Propositions upsell', level: 1, hasChildren: false, startDate: '2026-04-11', endDate: '2026-04-20', urgency: 3, importance: 5, difficulty: 4, status: 'in_progress', finished: false, pended: false, actualHours: 0, expectedHours: 8, minHours: 6, maxHours: 12, description: 'Rédiger et envoyer les propositions' },
  { id: 't6', type: 'task', parentId: 'p2', title: 'Closing & signatures', level: 1, hasChildren: false, startDate: '2026-04-21', endDate: '2026-05-15', urgency: 2, importance: 5, difficulty: 5, status: 'todo', finished: false, pended: false, actualHours: 0, expectedHours: 6, minHours: 4, maxHours: 10, description: '' },
])

// Expand all projects by default
rows.forEach(r => { if (r.type === 'project') expanded[r.id] = true })
rows.forEach(r => { if (r.hasChildren && r.type === 'task') expanded[r.id] = true })

function toggleExpand(id) { expanded[id] = !expanded[id] }

// Visible rows — hide children of collapsed parents
const visibleRows = computed(() => {
  const result = []
  const hiddenParents = new Set()
  for (const row of rows) {
    if (row.parentId && hiddenParents.has(row.parentId)) {
      hiddenParents.add(row.id)
      continue
    }
    if (row.parentId && !expanded[row.parentId]) {
      hiddenParents.add(row.id)
      continue
    }
    result.push(row)
  }
  return result
})

function cycleBadge(row, field) {
  row[field] = (row[field] % 5) + 1
}

function avgHours(row) {
  if (row.minHours && row.maxHours) return ((row.minHours + row.maxHours) / 2).toFixed(1)
  return '—'
}

const totals = computed(() => {
  const tasks = rows.filter(r => r.type !== 'project')
  return {
    total: tasks.length,
    finished: tasks.filter(r => r.finished).length,
    actual: tasks.reduce((s, r) => s + (r.actualHours || 0), 0),
    expected: tasks.reduce((s, r) => s + (r.expectedHours || 0), 0),
    min: tasks.reduce((s, r) => s + (r.minHours || 0), 0),
    max: tasks.reduce((s, r) => s + (r.maxHours || 0), 0),
    avg: ((tasks.reduce((s, r) => s + (r.minHours || 0), 0) + tasks.reduce((s, r) => s + (r.maxHours || 0), 0)) / 2).toFixed(1),
  }
})

function addTask(projectId) {
  const newId = 't_' + Date.now()
  const projIdx = rows.findIndex(r => r.id === projectId)
  // Find last child of this project to insert after
  let insertIdx = projIdx + 1
  while (insertIdx < rows.length && rows[insertIdx].parentId === projectId) insertIdx++
  // Also skip nested children
  while (insertIdx < rows.length && rows[insertIdx].level > 0 && rows[insertIdx].parentId) insertIdx++
  const newTask = {
    id: newId, type: 'task', parentId: projectId, title: '', level: 1, hasChildren: false,
    startDate: '', endDate: '', urgency: 3, importance: 3, difficulty: 3, status: 'todo',
    finished: false, pended: false, actualHours: 0, expectedHours: 0, minHours: 0, maxHours: 0, description: '',
  }
  rows.splice(insertIdx, 0, newTask)
  // Mark parent as having children
  const parent = rows.find(r => r.id === projectId)
  if (parent) parent.hasChildren = true
  expanded[projectId] = true
  editCell.value = newId + '_title'
}

function addSubtask(parentRow) {
  const newId = 'st_' + Date.now()
  const parentIdx = rows.findIndex(r => r.id === parentRow.id)
  let insertIdx = parentIdx + 1
  while (insertIdx < rows.length && rows[insertIdx].level > parentRow.level) insertIdx++
  const newSub = {
    id: newId, type: 'subtask', parentId: parentRow.id, title: '', level: parentRow.level + 1, hasChildren: false,
    startDate: '', endDate: '', urgency: 3, importance: 3, difficulty: 3, status: 'todo',
    finished: false, pended: false, actualHours: 0, expectedHours: 0, minHours: 0, maxHours: 0, description: '',
  }
  rows.splice(insertIdx, 0, newSub)
  parentRow.hasChildren = true
  expanded[parentRow.id] = true
  editCell.value = newId + '_title'
}

function createProject() {
  rows.push({
    id: 'p' + Date.now(), type: 'project', title: newName.value, color: newColor.value, level: 0, hasChildren: false,
    startDate: '', endDate: '', urgency: 3, importance: 3, difficulty: 3, status: 'todo', finished: false, pended: false,
    actualHours: 0, expectedHours: 0, minHours: 0, maxHours: 0, description: '',
  })
  expanded['p' + Date.now()] = true
  newName.value = ''
  slideOpen.value = false
}
</script>

<style scoped>
.pv { max-width: 100%; }
.pv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.pv-header h1 { font-size: 1.5rem; font-weight: 800; }
.pv-actions { display: flex; align-items: center; gap: 12px; }
.scroll-hint { font-size: 0.72rem; color: var(--text-muted); }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; }

/* TABLE — dual-axis scroll with sticky header + sticky left cols */
.table-outer { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.table-scroll { overflow: auto; max-height: calc(100vh - 200px); }
.pv-table { width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.82rem; }

/* Header — sticky top, opaque, always above everything */
.pv-table thead th { padding: 10px 8px; font-size: 0.68rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 2px solid #e5e7eb; white-space: nowrap; text-align: left; background: #f9fafb; position: sticky; top: 0; z-index: 20; }

/* Fixed columns — sticky left, opaque white */
.col-fix { position: sticky; z-index: 5; background: #ffffff; }
.col-exp { left: 0; width: 32px; min-width: 32px; }
.col-num { left: 32px; width: 36px; min-width: 36px; text-align: center; color: var(--text-muted); }
.col-title { left: 68px; min-width: 220px; max-width: 300px; border-right: 2px solid #e5e7eb; }

/* Corner cells: sticky BOTH top AND left — highest z-index */
.pv-table thead th.col-fix { z-index: 30; background: #f9fafb; }
.pv-table thead th.col-title { border-right: 2px solid #e5e7eb; }

/* Scrollable columns */
.col-scroll { white-space: nowrap; }
.col-date { width: 110px; min-width: 110px; }
.col-badge { width: 70px; min-width: 70px; text-align: center; }
.col-status { width: 100px; min-width: 100px; }
.col-check { width: 60px; min-width: 60px; text-align: center; }
.col-num-input { width: 80px; min-width: 80px; text-align: right; }
.col-avg { background: rgba(124,58,237,0.03); }
.col-desc { width: 200px; min-width: 200px; }

/* Rows — border on td since border-collapse: separate */
.pv-table tbody tr { transition: background 0.1s; }
.pv-table tbody td { border-bottom: 1px solid var(--border-light); }
.pv-table tbody tr:hover { background: rgba(0,0,0,0.015); }
.pv-table tbody td { padding: 6px 8px; vertical-align: middle; }

.row-project { background: #f5f3ff; }
.row-project .col-fix { background: #f5f3ff; }
.row-project:hover .col-fix { background: #ede9fe; }
.row-level-2 { background: #fafafa; }
.row-level-2 .col-fix { background: #fafafa; }
.row-done { opacity: 0.55; }
tr:hover .col-fix { background: #f3f4f6; }
.row-project:hover .col-fix { background: #ede9fe; }

/* Totals */
.row-totals { background: var(--bg); font-weight: 600; border-top: 2px solid var(--border); }
.row-totals .col-fix { background: #f3f4f6; }
.row-totals td { padding: 10px 8px; font-size: 0.78rem; }

/* Expand button */
.exp-btn { background: none; border: none; cursor: pointer; font-size: 0.75rem; color: var(--text-muted); padding: 2px 4px; border-radius: 4px; width: 100%; }
.exp-btn:hover { background: var(--bg-hover); color: var(--text); }

/* Project dot */
.proj-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }

/* Cell text & editing */
.cell-text { cursor: pointer; display: block; padding: 4px 4px; border-radius: 4px; min-height: 24px; transition: background 0.1s; }
.cell-text:hover { background: var(--bg-hover); }
.cell-text.num { text-align: right; font-variant-numeric: tabular-nums; }
.cell-text.avg { color: var(--purple); font-weight: 600; }
.cell-text.desc { max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.cell-text.bold, .title-text.bold { font-weight: 700; color: #111827; }
.title-text { font-weight: 500; color: #111827; }

/* Add task/subtask buttons — visible on hover */
.add-task-btn, .add-sub-btn { opacity: 0; background: none; border: 1px dashed var(--border); padding: 1px 8px; border-radius: 4px; font-size: 0.65rem; color: var(--text-muted); cursor: pointer; margin-left: 6px; transition: all 0.15s; white-space: nowrap; }
tr:hover .add-task-btn, tr:hover .add-sub-btn { opacity: 1; }
.add-task-btn:hover, .add-sub-btn:hover { border-color: var(--purple); color: var(--purple); background: var(--purple-bg); }
.cell-input { width: 100%; padding: 4px 6px; border: 1.5px solid var(--purple); border-radius: 4px; font-size: 0.82rem; outline: none; background: #fff; }
.cell-input.num { text-align: right; width: 60px; }
.cell-input.title-input { width: 100%; }

/* Badge numbers (urgency/importance/difficulty) */
.badge-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.15s; user-select: none; }
.badge-num:hover { transform: scale(1.1); }
.b-1 { background: #f3f4f6; color: #9ca3af; }
.b-2 { background: #dbeafe; color: #2563eb; }
.b-3 { background: #fef3c7; color: #d97706; }
.b-4 { background: #ffedd5; color: #ea580c; }
.b-5 { background: #fee2e2; color: #dc2626; }

/* Status select */
.cell-select { padding: 3px 6px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.72rem; font-weight: 600; cursor: pointer; outline: none; background: #fff; }
.st-todo { color: #9ca3af; }
.st-in_progress { color: #2563eb; background: #eff6ff; }
.st-blocked { color: #dc2626; background: #fef2f2; }
.st-done { color: #059669; background: #f0fdf4; }

/* Checkboxes */
.col-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--purple); cursor: pointer; }

/* Slide-over form */
.sf { display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.fa { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); }
.color-picks { display: flex; gap: 8px; }
.cpick { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; }
.cpick.active { border-color: var(--text); transform: scale(1.15); }

/* Empty */
.pv-empty { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.pv-empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; }

@media (max-width: 768px) {
  .col-title { min-width: 140px; max-width: 180px; }
  .pv-table { font-size: 0.75rem; }
}
</style>
