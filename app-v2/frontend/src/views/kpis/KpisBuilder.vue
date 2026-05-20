<template>
  <div class="kb">
    <!-- TOOLBAR -->
    <div class="kb-toolbar">
      <router-link to="/app/kpis" class="kb-back">← {{ t('back') }}</router-link>
      <span class="kb-title-display">{{ copil?.title || t('copil_cover_title') }}</span>
      <div class="kb-toolbar-right">
        <router-link v-if="copilId" :to="'/app/kpis/' + copilId + '/preview'" class="tb-btn">{{ t('copil_preview') }}</router-link>
        <router-link v-if="copilId" :to="'/app/kpis/' + copilId + '/present'" class="tb-btn">{{ t('copil_present') }}</router-link>
        <span v-if="saved" class="tb-saved">✓ {{ t('copil_saved') }}</span>
      </div>
    </div>

    <div class="kb-layout">
      <!-- SIDEBAR: Block types -->
      <aside class="kb-sidebar">
        <h3>{{ t('copil_add_block') }}</h3>
        <div v-for="group in blockGroups" :key="group.title" class="kb-group">
          <span class="kb-group-title">{{ group.title }}</span>
          <button v-for="bt in group.items" :key="bt.type" class="kb-block-btn" @click="addBlock(bt.type)">
            <span class="kbb-icon">{{ bt.icon }}</span>
            <span>{{ t('copil_bt_' + bt.type) }}</span>
          </button>
        </div>
      </aside>

      <!-- CANVAS -->
      <main class="kb-canvas">
        <!-- Cover meta -->
        <div class="kb-cover">
          <div class="kb-cover-row">
            <div class="fg full"><label>{{ t('copil_cover_title') }}</label><input v-model="meta.title" class="fi" @input="saveMeta" /></div>
          </div>
          <div class="kb-cover-row">
            <div class="fg"><label>{{ t('copil_cover_subtitle') }}</label><input v-model="meta.subtitle" class="fi" @input="saveMeta" /></div>
            <div class="fg"><label>{{ t('copil_cover_client') }}</label><input v-model="meta.clientName" class="fi" @input="saveMeta" /></div>
          </div>
          <div class="kb-cover-row">
            <div class="fg"><label>{{ t('copil_cover_period') }}</label><input v-model="meta.period" class="fi" @input="saveMeta" /></div>
            <div class="fg"><label>{{ t('copil_cover_presenter') }}</label><input v-model="meta.presenter" class="fi" @input="saveMeta" /></div>
            <div class="fg sm"><label>{{ t('copil_cover_color') }}</label>
              <div class="color-row"><button v-for="c in colors" :key="c" type="button" class="cpick" :class="{ active: meta.color === c }" :style="{ background: c }" @click="meta.color = c; saveMeta()" /></div>
            </div>
          </div>
        </div>

        <!-- Blocks -->
        <div v-if="copil?.blocks?.length" class="kb-blocks">
          <div v-for="(block, i) in copil.blocks" :key="block.id" class="kb-block" :class="{ selected: selectedBlock === block.id, hidden: !block.visible }" @click="selectedBlock = block.id" draggable="true" @dragstart="onDragStart($event, i)" @dragover.prevent="onDragOver($event, i)" @dragend="onDragEnd" @drop.prevent="onDrop(i)">
            <div class="kbb-header">
              <span class="kbb-drag" title="Drag">⠿</span>
              <span class="kbb-type">{{ t('copil_bt_' + block.type) }}</span>
              <input v-model="block.title" class="kbb-title-input" :placeholder="t('copil_block_title')" @input="saveBlocks" />
              <button v-if="i > 0" class="kbb-ctrl" @click.stop="moveBlock(i, -1)" title="↑">▲</button>
              <button v-if="i < copil.blocks.length - 1" class="kbb-ctrl" @click.stop="moveBlock(i, 1)" title="↓">▼</button>
              <button class="kbb-ctrl" @click.stop="toggleVisible(block)" :title="block.visible ? t('copil_hide') : t('copil_show')">{{ block.visible ? '👁' : '👁‍🗨' }}</button>
              <button class="kbb-del" @click.stop="store.deleteBlock(copilId, block.id)">🗑</button>
            </div>
            <div class="kbb-preview">
              <!-- KPI Grid preview -->
              <div v-if="block.type === 'kpi_grid'" class="prev-kpi-grid">
                <div v-for="(kpi, ki) in block.data.kpis" :key="ki" class="prev-kpi" :style="{ borderLeftColor: kpi.color }">
                  <strong>{{ kpi.value || '—' }}</strong><span>{{ kpi.label || '...' }}</span>
                </div>
              </div>
              <!-- KPI Single -->
              <div v-else-if="block.type === 'kpi_single'" class="prev-kpi-single" :style="{ color: block.data.color }">
                <strong>{{ block.data.value || '—' }}</strong><span>{{ block.data.label || '...' }} {{ block.data.unit }}</span>
              </div>
              <!-- Chart Bar -->
              <div v-else-if="block.type === 'chart_bar'" class="prev-chart">
                <apexchart :key="'bar-' + block.id" type="bar" height="160"
                  :options="{ chart:{toolbar:{show:false},animations:{enabled:false}}, colors:[block.data.datasets[0]?.color||'#7c3aed'], xaxis:{categories:block.data.labels}, dataLabels:{enabled:false}, grid:{borderColor:'#f3f4f6'}, plotOptions:{bar:{borderRadius:3}} }"
                  :series="block.data.datasets.map(d=>({name:d.label,data:d.data}))" />
              </div>
              <!-- Chart Line -->
              <div v-else-if="block.type === 'chart_line'" class="prev-chart">
                <apexchart :key="'line-' + block.id" type="line" height="160"
                  :options="{ chart:{toolbar:{show:false},animations:{enabled:false}}, colors:block.data.datasets.map(d=>d.color||'#3b82f6'), xaxis:{categories:block.data.labels}, stroke:{curve:'smooth',width:2}, dataLabels:{enabled:false}, grid:{borderColor:'#f3f4f6'} }"
                  :series="block.data.datasets.map(d=>({name:d.label,data:d.data}))" />
              </div>
              <!-- Chart Donut -->
              <div v-else-if="block.type === 'chart_donut'" class="prev-chart">
                <apexchart :key="'donut-' + block.id" type="donut" height="160"
                  :options="{ labels:block.data.labels, colors:block.data.colors, legend:{position:'bottom',fontSize:'10px'}, dataLabels:{enabled:false}, plotOptions:{pie:{donut:{size:'55%'}}} }"
                  :series="block.data.data" />
              </div>
              <!-- Text -->
              <div v-else-if="block.type === 'text'" class="prev-text" :class="'sz-' + block.data.size">{{ block.data.content || '...' }}</div>
              <!-- Table -->
              <div v-else-if="block.type === 'table'" class="prev-table">
                <table><thead><tr><th v-for="h in block.data.headers" :key="h">{{ h }}</th></tr></thead>
                <tbody><tr v-for="(row, ri) in block.data.rows" :key="ri"><td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td></tr></tbody></table>
              </div>
              <!-- Timeline -->
              <div v-else-if="block.type === 'timeline'" class="prev-timeline">
                <div v-for="(ev, ei) in block.data.events" :key="ei" class="prev-tl-item" :class="'st-' + ev.status">
                  <span class="prev-tl-dot"></span>
                  <div class="prev-tl-content">
                    <strong>{{ ev.title || '...' }}</strong>
                    <span class="prev-tl-date">{{ ev.date }}</span>
                    <p v-if="ev.desc">{{ ev.desc }}</p>
                  </div>
                </div>
              </div>
              <!-- Image -->
              <div v-else-if="block.type === 'image'" class="prev-image">
                <img v-if="block.data.url" :src="block.data.url" :alt="block.data.caption" />
                <div v-else class="prev-image-placeholder">🖼 {{ t('copil_image_placeholder') }}</div>
                <span v-if="block.data.caption" class="prev-image-caption">{{ block.data.caption }}</span>
              </div>
              <!-- Checklist -->
              <div v-else-if="block.type === 'checklist'" class="prev-checklist">
                <div v-for="(item, ii) in block.data.items" :key="ii" class="prev-check-item">{{ item.done ? '✅' : '⬜' }} {{ item.text || '...' }}</div>
              </div>
              <!-- Quote -->
              <div v-else-if="block.type === 'quote'" class="prev-quote">
                <p>"{{ block.data.text || '...' }}"</p>
                <span>— {{ block.data.author }}</span>
              </div>
              <!-- Action plan -->
              <div v-else-if="block.type === 'action_plan'" class="prev-actions">
                <div v-for="(a, ai) in block.data.actions" :key="ai" class="prev-action">{{ a.what || '...' }} → {{ a.who }} ({{ a.when }})</div>
              </div>
              <!-- Divider -->
              <hr v-else-if="block.type === 'divider'" class="prev-divider" />
              <!-- Fallback -->
              <div v-else class="prev-fallback">{{ t('copil_bt_' + block.type) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="kb-no-blocks">{{ t('copil_no_blocks') }}</div>
      </main>

      <!-- INSPECTOR -->
      <aside v-if="activeBlock" class="kb-inspector">
        <h3>{{ t('copil_bt_' + activeBlock.type) }}</h3>

        <!-- KPI Grid inspector -->
        <div v-if="activeBlock.type === 'kpi_grid'" class="insp-body">
          <div v-for="(kpi, ki) in activeBlock.data.kpis" :key="ki" class="insp-kpi">
            <div class="fg"><label>{{ t('copil_kpi_label') }}</label><input v-model="kpi.label" class="fi" @input="saveBlocks" /></div>
            <div class="insp-row">
              <div class="fg"><label>{{ t('copil_kpi_value') }}</label><input v-model="kpi.value" class="fi" @input="saveBlocks" /></div>
              <div class="fg"><label>{{ t('copil_kpi_unit') }}</label><input v-model="kpi.unit" class="fi sm" @input="saveBlocks" /></div>
            </div>
            <div class="fg"><label>{{ t('copil_kpi_trend') }}</label>
              <select v-model="kpi.trend" class="fi" @change="saveBlocks"><option value="up">{{ t('copil_trend_up') }}</option><option value="stable">{{ t('copil_trend_stable') }}</option><option value="down">{{ t('copil_trend_down') }}</option></select>
            </div>
            <button class="insp-remove" @click="activeBlock.data.kpis.splice(ki, 1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.kpis.push({ label:'', value:'', unit:'', trend:'up', color:'#10b981' }); saveBlocks()">{{ t('copil_add_kpi') }}</button>
        </div>

        <!-- KPI Single inspector -->
        <div v-else-if="activeBlock.type === 'kpi_single'" class="insp-body">
          <div class="fg"><label>{{ t('copil_kpi_label') }}</label><input v-model="activeBlock.data.label" class="fi" @input="saveBlocks" /></div>
          <div class="insp-row">
            <div class="fg"><label>{{ t('copil_kpi_value') }}</label><input v-model="activeBlock.data.value" class="fi" @input="saveBlocks" /></div>
            <div class="fg"><label>{{ t('copil_kpi_unit') }}</label><input v-model="activeBlock.data.unit" class="fi sm" @input="saveBlocks" /></div>
          </div>
          <div class="fg"><label>{{ t('copil_prev_value') }}</label><input v-model="activeBlock.data.previous" class="fi" @input="saveBlocks" /></div>
        </div>

        <!-- Text inspector -->
        <div v-else-if="activeBlock.type === 'text'" class="insp-body">
          <div class="fg"><label>{{ t('copil_text_content') }}</label><textarea v-model="activeBlock.data.content" class="fi ta" rows="6" @input="saveBlocks" /></div>
          <div class="fg"><label>{{ t('copil_text_size') }}</label>
            <select v-model="activeBlock.data.size" class="fi" @change="saveBlocks">
              <option value="small">{{ t('copil_size_small') }}</option><option value="normal">{{ t('copil_size_normal') }}</option>
              <option value="large">{{ t('copil_size_large') }}</option><option value="title">{{ t('copil_size_title') }}</option>
            </select>
          </div>
        </div>

        <!-- Table inspector -->
        <div v-else-if="activeBlock.type === 'table'" class="insp-body">
          <div class="fg"><label>{{ t('copil_table_headers') }}</label><input :value="activeBlock.data.headers.join(' | ')" @input="activeBlock.data.headers = $event.target.value.split('|').map(s=>s.trim()); saveBlocks()" class="fi" /></div>
          <div v-for="(row, ri) in activeBlock.data.rows" :key="ri" class="fg">
            <label>{{ t('copil_table_row', { n: ri + 1 }) }}</label>
            <input :value="row.join(' | ')" @input="activeBlock.data.rows[ri] = $event.target.value.split('|').map(s=>s.trim()); saveBlocks()" class="fi" />
          </div>
          <button class="insp-add" @click="activeBlock.data.rows.push(activeBlock.data.headers.map(()=>'')); saveBlocks()">{{ t('copil_add_row') }}</button>
        </div>

        <!-- Checklist inspector -->
        <div v-else-if="activeBlock.type === 'checklist'" class="insp-body">
          <div v-for="(item, ii) in activeBlock.data.items" :key="ii" class="insp-check-row">
            <input type="checkbox" v-model="item.done" @change="saveBlocks" />
            <input v-model="item.text" class="fi" @input="saveBlocks" />
            <button class="insp-remove" @click="activeBlock.data.items.splice(ii, 1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.items.push({ text:'', done:false }); saveBlocks()">{{ t('copil_add_item') }}</button>
        </div>

        <!-- Quote inspector -->
        <div v-else-if="activeBlock.type === 'quote'" class="insp-body">
          <div class="fg"><label>{{ t('copil_quote_text') }}</label><textarea v-model="activeBlock.data.text" class="fi ta" rows="3" @input="saveBlocks" /></div>
          <div class="fg"><label>{{ t('copil_quote_author') }}</label><input v-model="activeBlock.data.author" class="fi" @input="saveBlocks" /></div>
          <div class="fg"><label>{{ t('copil_quote_role') }}</label><input v-model="activeBlock.data.role" class="fi" @input="saveBlocks" /></div>
        </div>

        <!-- Action Plan inspector -->
        <div v-else-if="activeBlock.type === 'action_plan'" class="insp-body">
          <div v-for="(a, ai) in activeBlock.data.actions" :key="ai" class="insp-action">
            <div class="fg"><label>{{ t('copil_action_what') }}</label><input v-model="a.what" class="fi" @input="saveBlocks" /></div>
            <div class="insp-row">
              <div class="fg"><label>{{ t('copil_action_who') }}</label><input v-model="a.who" class="fi" @input="saveBlocks" /></div>
              <div class="fg"><label>{{ t('copil_action_when') }}</label><input v-model="a.when" class="fi" @input="saveBlocks" /></div>
            </div>
            <div class="fg"><label>{{ t('copil_action_status') }}</label>
              <select v-model="a.status" class="fi" @change="saveBlocks">
                <option value="todo">{{ t('copil_status_todo') }}</option><option value="progress">{{ t('copil_status_progress') }}</option><option value="done">{{ t('copil_status_done') }}</option>
              </select>
            </div>
            <button class="insp-remove" @click="activeBlock.data.actions.splice(ai, 1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.actions.push({ what:'', who:'', when:'', status:'todo' }); saveBlocks()">{{ t('copil_add_action') }}</button>
        </div>

        <!-- Timeline inspector -->
        <div v-else-if="activeBlock.type === 'timeline'" class="insp-body">
          <div v-for="(ev, ei) in activeBlock.data.events" :key="ei" class="insp-action">
            <div class="insp-row">
              <div class="fg"><label>{{ t('copil_tl_title') }}</label><input v-model="ev.title" class="fi" @input="saveBlocks" /></div>
              <div class="fg sm"><label>{{ t('copil_tl_date') }}</label><input v-model="ev.date" class="fi" @input="saveBlocks" /></div>
            </div>
            <div class="fg"><label>{{ t('copil_tl_desc') }}</label><input v-model="ev.desc" class="fi" @input="saveBlocks" /></div>
            <div class="fg"><label>{{ t('copil_action_status') }}</label>
              <select v-model="ev.status" class="fi" @change="saveBlocks">
                <option value="done">{{ t('copil_status_done') }}</option>
                <option value="progress">{{ t('copil_status_progress') }}</option>
                <option value="todo">{{ t('copil_status_todo') }}</option>
              </select>
            </div>
            <button class="insp-remove" @click="activeBlock.data.events.splice(ei, 1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.events.push({ date:'', title:'', desc:'', status:'todo' }); saveBlocks()">{{ t('copil_add_event') }}</button>
        </div>

        <!-- Image inspector -->
        <div v-else-if="activeBlock.type === 'image'" class="insp-body">
          <div class="fg"><label>{{ t('copil_image_url') }}</label><input v-model="activeBlock.data.url" class="fi" placeholder="https://..." @input="saveBlocks" /></div>
          <div class="fg"><label>{{ t('copil_image_caption') }}</label><input v-model="activeBlock.data.caption" class="fi" @input="saveBlocks" /></div>
        </div>

        <!-- Chart Bar inspector -->
        <div v-else-if="activeBlock.type === 'chart_bar'" class="insp-body">
          <div class="fg"><label>{{ t('copil_chart_labels') }}</label><input :value="activeBlock.data.labels.join(', ')" @input="activeBlock.data.labels = $event.target.value.split(',').map(s=>s.trim()); saveBlocks()" class="fi" /></div>
          <div v-for="(ds, dsi) in activeBlock.data.datasets" :key="dsi" class="insp-action">
            <div class="fg"><label>{{ t('copil_chart_series') }} {{ dsi + 1 }}</label><input v-model="ds.label" class="fi" @input="saveBlocks" /></div>
            <div class="fg"><label>{{ t('copil_chart_values') }}</label><input :value="ds.data.join(', ')" @input="ds.data = $event.target.value.split(',').map(s=>Number(s.trim())||0); saveBlocks()" class="fi" /></div>
            <div class="fg sm"><label>{{ t('copil_cover_color') }}</label><input type="color" v-model="ds.color" @input="saveBlocks" class="fi-color" /></div>
            <button v-if="activeBlock.data.datasets.length > 1" class="insp-remove" @click="activeBlock.data.datasets.splice(dsi, 1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.datasets.push({ label:'Série', data: activeBlock.data.labels.map(()=>0), color:'#3b82f6' }); saveBlocks()">{{ t('copil_add_series') }}</button>
        </div>

        <!-- Chart Line inspector -->
        <div v-else-if="activeBlock.type === 'chart_line'" class="insp-body">
          <div class="fg"><label>{{ t('copil_chart_labels') }}</label><input :value="activeBlock.data.labels.join(', ')" @input="activeBlock.data.labels = $event.target.value.split(',').map(s=>s.trim()); saveBlocks()" class="fi" /></div>
          <div v-for="(ds, dsi) in activeBlock.data.datasets" :key="dsi" class="insp-action">
            <div class="fg"><label>{{ t('copil_chart_series') }} {{ dsi + 1 }}</label><input v-model="ds.label" class="fi" @input="saveBlocks" /></div>
            <div class="fg"><label>{{ t('copil_chart_values') }}</label><input :value="ds.data.join(', ')" @input="ds.data = $event.target.value.split(',').map(s=>Number(s.trim())||0); saveBlocks()" class="fi" /></div>
            <div class="fg sm"><label>{{ t('copil_cover_color') }}</label><input type="color" v-model="ds.color" @input="saveBlocks" class="fi-color" /></div>
            <button v-if="activeBlock.data.datasets.length > 1" class="insp-remove" @click="activeBlock.data.datasets.splice(dsi, 1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.datasets.push({ label:'Série', data: activeBlock.data.labels.map(()=>0), color:'#10b981' }); saveBlocks()">{{ t('copil_add_series') }}</button>
        </div>

        <!-- Chart Donut inspector -->
        <div v-else-if="activeBlock.type === 'chart_donut'" class="insp-body">
          <div v-for="(label, li) in activeBlock.data.labels" :key="li" class="insp-donut-row">
            <input v-model="activeBlock.data.labels[li]" class="fi" @input="saveBlocks" />
            <input v-model.number="activeBlock.data.data[li]" type="number" class="fi sm" @input="saveBlocks" />
            <input type="color" v-model="activeBlock.data.colors[li]" @input="saveBlocks" class="fi-color" />
            <button v-if="activeBlock.data.labels.length > 1" class="insp-remove-inline" @click="activeBlock.data.labels.splice(li,1); activeBlock.data.data.splice(li,1); activeBlock.data.colors.splice(li,1); saveBlocks()">✕</button>
          </div>
          <button class="insp-add" @click="activeBlock.data.labels.push('Segment'); activeBlock.data.data.push(10); activeBlock.data.colors.push('#6366f1'); saveBlocks()">{{ t('copil_add_segment') }}</button>
        </div>

        <!-- Fallback -->
        <div v-else class="insp-body"><p class="insp-hint">{{ t('copil_bt_' + activeBlock.type) }}</p></div>

        <!-- Block controls (all types) -->
        <div class="insp-controls">
          <div class="fg"><label>{{ t('copil_block_width') }}</label>
            <select v-model="activeBlock.width" class="fi" @change="saveBlocks">
              <option value="full">{{ t('copil_width_full') }}</option>
              <option value="half">{{ t('copil_width_half') }}</option>
              <option value="third">{{ t('copil_width_third') }}</option>
            </select>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useKpiStore } from '@/stores/kpis'

const props = defineProps({ id: String })
const route = useRoute()
const router = useRouter()
const { t } = useI18n({ useScope: 'global' })
const store = useKpiStore()

const colors = ['#7c3aed', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#1e293b']
const selectedBlock = ref(null)
const saved = ref(false)

const copilId = ref(props.id || route.params.id || null)

const meta = reactive({ title: '', subtitle: '', clientName: '', period: '', presenter: '', color: '#7c3aed' })

onMounted(() => {
  if (!copilId.value) {
    const id = store.createCopil()
    copilId.value = id
    router.replace('/app/kpis/' + id)
  }
  const c = store.getCopil(copilId.value)
  if (c) { Object.assign(meta, { title: c.title, subtitle: c.subtitle, clientName: c.clientName, period: c.period, presenter: c.presenter, color: c.color }) }
})

const copil = computed(() => store.getCopil(copilId.value))
const activeBlock = computed(() => copil.value?.blocks?.find(b => b.id === selectedBlock.value) || null)

const blockGroups = [
  { title: '📊 KPIs', items: [{ type: 'kpi_grid', icon: '🔢' }, { type: 'kpi_single', icon: '📈' }] },
  { title: '📉 Graphiques', items: [{ type: 'chart_bar', icon: '📊' }, { type: 'chart_line', icon: '📈' }, { type: 'chart_donut', icon: '🍩' }] },
  { title: '📝 Contenu', items: [{ type: 'text', icon: '📝' }, { type: 'table', icon: '📋' }, { type: 'checklist', icon: '✅' }, { type: 'timeline', icon: '🗓' }, { type: 'quote', icon: '💬' }] },
  { title: '🎯 Actions', items: [{ type: 'action_plan', icon: '🎯' }] },
  { title: '🖼 Médias', items: [{ type: 'image', icon: '🖼' }, { type: 'divider', icon: '──' }] },
]

function addBlock(type) {
  if (!copilId.value) return
  store.addBlock(copilId.value, type)
  const blocks = copil.value?.blocks
  if (blocks?.length) selectedBlock.value = blocks[blocks.length - 1].id
}

function saveMeta() {
  if (!copilId.value) return
  store.updateCopil(copilId.value, { ...meta })
  flash()
}

function saveBlocks() { if (copilId.value) { store.updateCopil(copilId.value, { blocks: copil.value.blocks }); flash() } }

function flash() { saved.value = true; setTimeout(() => { saved.value = false }, 1500) }

// Drag & drop
const dragIdx = ref(null)
const dropIdx = ref(null)

function onDragStart(e, i) {
  dragIdx.value = i
  e.dataTransfer.effectAllowed = 'move'
}
function onDragOver(e, i) { dropIdx.value = i }
function onDragEnd() { dragIdx.value = null; dropIdx.value = null }
function onDrop(targetIdx) {
  if (dragIdx.value === null || dragIdx.value === targetIdx) return
  const blocks = [...copil.value.blocks]
  const [moved] = blocks.splice(dragIdx.value, 1)
  blocks.splice(targetIdx, 0, moved)
  store.reorderBlocks(copilId.value, blocks.map(b => b.id))
  dragIdx.value = null
  dropIdx.value = null
}

function moveBlock(i, dir) {
  const blocks = [...copil.value.blocks]
  const j = i + dir
  if (j < 0 || j >= blocks.length) return
  ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
  store.reorderBlocks(copilId.value, blocks.map(b => b.id))
}

function toggleVisible(block) {
  block.visible = !block.visible
  saveBlocks()
}


</script>

<style scoped>
.kb { max-width: 100%; }

/* Toolbar */
.kb-toolbar { display: flex; align-items: center; gap: 12px; padding: 10px 0; margin-bottom: 16px; flex-wrap: wrap; }
.kb-back { font-size: 0.82rem; color: var(--text-muted); text-decoration: none; }
.kb-back:hover { color: var(--purple); }
.kb-title-display { font-size: 1rem; font-weight: 700; flex: 1; }
.kb-toolbar-right { display: flex; gap: 6px; align-items: center; }
.tb-btn { padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); text-decoration: none; }
.tb-btn:hover { border-color: var(--purple); color: var(--purple); }
.tb-saved { font-size: 0.75rem; color: var(--green); font-weight: 600; }

/* Layout */
.kb-layout { display: grid; grid-template-columns: 200px 1fr 280px; gap: 16px; min-height: calc(100vh - 180px); }

/* Sidebar */
.kb-sidebar { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; overflow-y: auto; }
.kb-sidebar h3 { font-size: 0.82rem; font-weight: 700; margin-bottom: 12px; }
.kb-group { margin-bottom: 12px; }
.kb-group-title { font-size: 0.68rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px; }
.kb-block-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; background: var(--bg); border: 1px solid transparent; border-radius: 6px; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.kb-block-btn:hover { border-color: var(--purple); background: var(--purple-bg); }
.kbb-icon { font-size: 0.9rem; }

/* Canvas */
.kb-canvas { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; overflow-y: auto; }

/* Cover */
.kb-cover { background: var(--bg); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 20px; }
.kb-cover-row { display: flex; gap: 12px; margin-bottom: 10px; }
.kb-cover-row:last-child { margin-bottom: 0; }
.fg { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.fg.full { flex: 2; }
.fg.sm { flex: 0 0 auto; }
.fg label { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); }
.fi { padding: 7px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.82rem; outline: none; background: var(--bg-card); width: 100%; }
.fi:focus { border-color: var(--purple); }
.fi.sm { width: 60px; }
.ta { resize: vertical; }
.color-row { display: flex; gap: 5px; }
.cpick { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.cpick.active { border-color: var(--text); transform: scale(1.15); }

/* Blocks */
.kb-blocks { display: flex; flex-direction: column; gap: 12px; }
.kb-block { border: 2px solid var(--border-light); border-radius: var(--radius-sm); overflow: hidden; cursor: pointer; transition: all 0.15s; }
.kb-block:hover { border-color: var(--border); }
.kb-block.selected { border-color: var(--purple); box-shadow: 0 0 0 2px rgba(124,58,237,0.1); }
.kbb-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg); border-bottom: 1px solid var(--border-light); }
.kbb-drag { cursor: grab; color: var(--text-muted); font-size: 0.85rem; }
.kbb-type { font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
.kbb-title-input { flex: 1; border: none; background: transparent; font-size: 0.82rem; font-weight: 600; outline: none; }
.kbb-del { background: none; border: none; cursor: pointer; font-size: 0.8rem; opacity: 0.3; }
.kbb-del:hover { opacity: 1; }
.kbb-preview { padding: 14px; min-height: 40px; }

/* Previews */
.prev-kpi-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.prev-kpi { border-left: 3px solid var(--green); padding: 8px 12px; background: var(--bg); border-radius: 6px; min-width: 80px; }
.prev-kpi strong { display: block; font-size: 1.1rem; font-weight: 800; }
.prev-kpi span { font-size: 0.7rem; color: var(--text-muted); }
.prev-kpi-single { text-align: center; padding: 12px; }
.prev-kpi-single strong { font-size: 2rem; font-weight: 800; display: block; }
.prev-kpi-single span { font-size: 0.82rem; }
.prev-chart { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem; background: var(--bg); border-radius: 6px; }
.prev-text { font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap; }
.prev-text.sz-small { font-size: 0.75rem; }
.prev-text.sz-large { font-size: 1.1rem; }
.prev-text.sz-title { font-size: 1.4rem; font-weight: 800; color: var(--text); }
.prev-table table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.prev-table th { padding: 6px 10px; background: var(--bg); text-align: left; font-weight: 600; border-bottom: 1px solid var(--border); }
.prev-table td { padding: 6px 10px; border-bottom: 1px solid var(--border-light); }
.prev-checklist { display: flex; flex-direction: column; gap: 4px; }
.prev-check-item { font-size: 0.82rem; }
.prev-quote { text-align: center; font-style: italic; padding: 12px; }
.prev-quote p { font-size: 0.95rem; margin-bottom: 6px; }
.prev-quote span { font-size: 0.75rem; color: var(--text-muted); }
.prev-actions { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; }
.prev-action { padding: 4px 8px; background: var(--bg); border-radius: 4px; }
.prev-divider { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
.prev-fallback { text-align: center; color: var(--text-muted); font-size: 0.82rem; }
.kb-no-blocks { text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.88rem; }

/* Timeline preview */
.prev-timeline { display: flex; flex-direction: column; gap: 0; padding-left: 12px; border-left: 2px solid var(--border); }
.prev-tl-item { display: flex; gap: 10px; padding: 6px 0; position: relative; }
.prev-tl-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border); flex-shrink: 0; margin-top: 4px; margin-left: -17px; }
.prev-tl-item.st-done .prev-tl-dot { background: var(--green); }
.prev-tl-item.st-progress .prev-tl-dot { background: var(--purple); }
.prev-tl-item.st-todo .prev-tl-dot { background: var(--border); }
.prev-tl-content strong { font-size: 0.82rem; display: block; }
.prev-tl-date { font-size: 0.7rem; color: var(--text-muted); }
.prev-tl-content p { font-size: 0.75rem; color: var(--text-secondary); margin: 2px 0 0; }

/* Image preview */
.prev-image { text-align: center; }
.prev-image img { max-width: 100%; max-height: 200px; border-radius: 6px; object-fit: contain; }
.prev-image-placeholder { padding: 30px; color: var(--text-muted); background: var(--bg); border-radius: 6px; font-size: 0.85rem; }
.prev-image-caption { display: block; font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; }

/* Block hidden state */
.kb-block.hidden { opacity: 0.45; }
.kb-block.hidden .kbb-preview { display: none; }

/* Block controls */
.kbb-ctrl { background: none; border: none; cursor: pointer; font-size: 0.55rem; color: var(--text-muted); padding: 2px 3px; opacity: 0.4; }
.kbb-ctrl:hover { opacity: 1; color: var(--purple); }

/* Inspector */
.kb-inspector { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; overflow-y: auto; }
.kb-inspector h3 { font-size: 0.85rem; font-weight: 700; margin-bottom: 14px; }
.insp-body { display: flex; flex-direction: column; gap: 12px; }
.insp-row { display: flex; gap: 8px; }
.insp-row .fg { flex: 1; }
.insp-kpi { border: 1px solid var(--border-light); border-radius: 6px; padding: 10px; position: relative; }
.insp-action { border: 1px solid var(--border-light); border-radius: 6px; padding: 10px; position: relative; margin-bottom: 8px; }
.insp-remove { position: absolute; top: 6px; right: 6px; background: none; border: none; font-size: 0.75rem; color: var(--text-muted); cursor: pointer; }
.insp-remove:hover { color: var(--red); }
.insp-add { background: var(--purple-bg); color: var(--purple); border: 1px dashed var(--purple-border); padding: 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; text-align: center; }
.insp-add:hover { background: rgba(124,58,237,0.1); }
.insp-check-row { display: flex; align-items: center; gap: 8px; }
.insp-check-row input[type="checkbox"] { accent-color: var(--purple); }
.insp-check-row .fi { flex: 1; }
.insp-hint { font-size: 0.82rem; color: var(--text-muted); }
.insp-controls { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-light); }
.insp-donut-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.insp-donut-row .fi { flex: 1; }
.insp-donut-row .fi.sm { width: 60px; flex: 0 0 60px; }
.fi-color { width: 32px; height: 32px; border: 1px solid var(--border); border-radius: 6px; padding: 2px; cursor: pointer; flex-shrink: 0; }
.insp-remove-inline { background: none; border: none; font-size: 0.75rem; color: var(--text-muted); cursor: pointer; flex-shrink: 0; }
.insp-remove-inline:hover { color: var(--red); }

@media (max-width: 1024px) { .kb-layout { grid-template-columns: 1fr; } .kb-sidebar, .kb-inspector { display: none; } }
@media (max-width: 768px) { .kb-cover-row { flex-direction: column; } }
</style>
