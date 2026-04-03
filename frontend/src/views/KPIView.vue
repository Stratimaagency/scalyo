<template>
  <div class="fade-in">
    <!-- Loading -->
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; padding: 60px 0; color: var(--muted); font-size: 14px">
      {{ t('loading') }}
    </div>

    <template v-else>
      <!-- ===== 1. SESSION SWITCHER BAR ===== -->
      <div style="display: flex; align-items: center; gap: 0; margin-bottom: 20px; overflow-x: auto; border-bottom: 2px solid var(--border);">
        <button
          v-for="s in sessions"
          :key="s.id"
          class="copil-tab"
          :class="{ active: activeSessionId === s.id }"
          @click="switchSession(s.id)"
        >
          <span style="font-weight: 600; white-space: nowrap;">{{ s.client_name || s.title }}</span>
          <span class="copil-status-badge" :class="'status-' + (s.status || 'draft')">
            {{ t('copil' + capitalize(s.status || 'draft')) }}
          </span>
        </button>
        <button class="copil-tab copil-tab-add" @click="createNewSession">
          <span style="font-size: 18px; line-height: 1;">+</span>
          <span>{{ t('copilNewSession') }}</span>
        </button>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-if="!sessions.length" style="text-align: center; padding: 80px 20px;">
        <ScalyoIcon name="dashboard" :size="48" style="color: var(--muted); margin-bottom: 16px;" />
        <h3 style="font-weight: 800; margin-bottom: 8px;">{{ t('copilNoSessions') }}</h3>
        <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">{{ t('copilNoSessionsHint') }}</p>
        <button class="btn btn-primary" @click="createNewSession">{{ t('copilCreateFirst') }}</button>
      </div>

      <!-- ===== ACTIVE SESSION ===== -->
      <template v-if="session">
        <!-- ===== 2. SESSION HEADER ===== -->
        <div class="card" style="padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="flex: 1; min-width: 240px;">
              <!-- Client name inline edit -->
              <input
                v-model="session.client_name"
                @input="scheduleSave"
                style="font-size: 22px; font-weight: 800; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text); width: 100%; padding: 2px 0; outline: none;"
                @focus="$event.target.style.borderBottomColor = 'var(--teal)'"
                @blur="$event.target.style.borderBottomColor = 'transparent'"
                :placeholder="t('copilClient')"
              />
              <!-- Client selector -->
              <div style="margin-top: 8px; position: relative;">
                <input
                  v-model="clientSearch"
                  :placeholder="t('copilSelectClient')"
                  @focus="showClientDropdown = true"
                  @input="showClientDropdown = true"
                  style="width: 100%; max-width: 320px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px 6px 30px; color: var(--text); font-size: 12px;"
                />
                <ScalyoIcon name="search" :size="12" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--muted);" />
                <div v-if="showClientDropdown && clientResults.length" style="position: absolute; z-index: 100; top: 100%; left: 0; width: 320px; background: var(--bg1); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); max-height: 200px; overflow-y: auto; margin-top: 4px;">
                  <div v-for="acc in clientResults" :key="acc.id" @click="selectClient(acc)"
                    style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--border); font-size: 12px;"
                    @mouseenter="$event.target.style.background='var(--surface)'"
                    @mouseleave="$event.target.style.background='transparent'"
                  >
                    <div style="font-weight: 600;">{{ acc.name }}</div>
                    <div style="color: var(--muted); font-size: 11px;">{{ acc.csm || '—' }} · ARR {{ fmtCurrency(acc.arr || 0) }}</div>
                  </div>
                </div>
              </div>
              <div v-if="session.client_id" style="margin-top: 6px; font-size: 11px; color: var(--teal); font-weight: 600;">
                {{ t('copilAutoFilled') }}
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
              <!-- Period -->
              <div class="field-group" style="margin-bottom: 0;">
                <label class="field-label" style="font-size: 10px; margin-bottom: 2px;">{{ t('copilPeriod') }}</label>
                <select v-model="session.period" @change="scheduleSave" class="field-input" style="padding: 6px 8px; font-size: 12px; min-width: 120px;">
                  <option v-for="p in periodOptions" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>

              <!-- Date -->
              <div class="field-group" style="margin-bottom: 0;">
                <label class="field-label" style="font-size: 10px; margin-bottom: 2px;">{{ t('copilDate') }}</label>
                <input type="date" v-model="session.presentation_date" @change="scheduleSave" class="field-input" style="padding: 6px 8px; font-size: 12px;" />
              </div>

              <!-- Status -->
              <div class="field-group" style="margin-bottom: 0;">
                <label class="field-label" style="font-size: 10px; margin-bottom: 2px;">Status</label>
                <select v-model="session.status" @change="scheduleSave" class="field-input" style="padding: 6px 8px; font-size: 12px; min-width: 130px;">
                  <option value="draft">{{ t('copilDraft') }}</option>
                  <option value="in_progress">{{ t('copilInProgress') }}</option>
                  <option value="ready">{{ t('copilReady') }}</option>
                  <option value="presented">{{ t('copilPresented') }}</option>
                </select>
              </div>

              <!-- Brand color -->
              <div class="field-group" style="margin-bottom: 0;">
                <label class="field-label" style="font-size: 10px; margin-bottom: 2px;">{{ t('copilBrandColor') }}</label>
                <div style="display: flex; gap: 4px;">
                  <input type="color" v-model="session.brand_color" @input="scheduleSave" style="width: 32px; height: 28px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; padding: 0;" />
                </div>
              </div>

              <!-- Save indicator -->
              <div style="font-size: 11px; font-weight: 600; min-width: 90px; text-align: center; padding-top: 14px;" :style="{ color: saveStatus === 'saving' ? 'var(--amber)' : 'var(--green)' }">
                {{ saveStatus === 'saving' ? t('copilSaving') : saveStatus === 'saved' ? t('copilSaved') : '' }}
              </div>

              <!-- Delete -->
              <button @click="deleteSession" style="padding: 6px 10px; background: transparent; border: 1px solid var(--red); color: var(--red); border-radius: 6px; font-size: 11px; cursor: pointer; margin-top: 12px; white-space: nowrap;">
                {{ t('copilDelete') }}
              </button>
            </div>
          </div>
        </div>

        <!-- ===== 3. SECTIONS ===== -->
        <div v-for="(section, idx) in session.sections" :key="idx" style="margin-bottom: 4px;">
          <!-- Section block -->
          <div class="card" style="padding: 20px; position: relative;">
            <!-- Section header with reorder + remove -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <h4 style="font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                <ScalyoIcon :name="sectionIcon(section.type)" :size="16" style="color: var(--teal);" />
                {{ sectionLabel(section.type) }}
              </h4>
              <div style="display: flex; gap: 4px;">
                <button v-if="idx > 0" @click="moveSection(idx, -1)" class="copil-section-btn" title="Move up">&#9650;</button>
                <button v-if="idx < session.sections.length - 1" @click="moveSection(idx, 1)" class="copil-section-btn" title="Move down">&#9660;</button>
                <button @click="removeSection(idx)" class="copil-section-btn" style="color: var(--red);" title="Remove">&#10005;</button>
              </div>
            </div>

            <!-- KPIs Block -->
            <template v-if="section.type === 'kpis'">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div v-for="(kpi, ki) in section.data.kpis" :key="ki" style="background: var(--surface); border-radius: 10px; padding: 14px; border: 1px solid var(--border);">
                  <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">{{ kpi.label }}</div>
                  <input v-model="kpi.value" @input="scheduleSave" class="field-input" style="font-size: 18px; font-weight: 800; padding: 4px 6px; font-family: 'JetBrains Mono', monospace;" />
                  <div v-if="kpi.trend" style="font-size: 11px; margin-top: 4px;" :style="{ color: kpi.trend > 0 ? 'var(--green)' : 'var(--red)' }">
                    {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}% vs prev
                  </div>
                </div>
              </div>
            </template>

            <!-- Health Block -->
            <template v-if="section.type === 'health'">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
                <div style="background: var(--surface); border-radius: 10px; padding: 14px; border: 1px solid var(--border); text-align: center;">
                  <div style="font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 8px;">Health Score</div>
                  <div style="position: relative; width: 80px; height: 80px; margin: 0 auto;">
                    <svg viewBox="0 0 36 36" style="width: 80px; height: 80px; transform: rotate(-90deg);">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border)" stroke-width="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" :stroke="healthColor(section.data.health_score)" stroke-width="3" :stroke-dasharray="section.data.health_score + ', 100'" />
                    </svg>
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">
                      {{ section.data.health_score }}
                    </div>
                  </div>
                </div>
                <div style="background: var(--surface); border-radius: 10px; padding: 14px; border: 1px solid var(--border);">
                  <div style="font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Risk Level</div>
                  <select v-model="section.data.risk_level" @change="scheduleSave" class="field-input" style="font-size: 13px; padding: 6px;">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div style="background: var(--surface); border-radius: 10px; padding: 14px; border: 1px solid var(--border);">
                  <div style="font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Usage</div>
                  <input v-model="section.data.usage" @input="scheduleSave" class="field-input" style="font-size: 13px; padding: 6px;" placeholder="e.g. 85%" />
                </div>
                <div style="background: var(--surface); border-radius: 10px; padding: 14px; border: 1px solid var(--border);">
                  <div style="font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Support Tickets</div>
                  <input v-model.number="section.data.support_tickets" @input="scheduleSave" type="number" class="field-input" style="font-size: 13px; padding: 6px;" />
                </div>
                <div style="background: var(--surface); border-radius: 10px; padding: 14px; border: 1px solid var(--border);">
                  <div style="font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Engagement</div>
                  <input v-model.number="section.data.engagement" @input="scheduleSave" type="number" class="field-input" style="font-size: 13px; padding: 6px;" min="0" max="100" />
                </div>
              </div>
            </template>

            <!-- Actions Block -->
            <template v-if="section.type === 'actions'">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div v-for="(action, ai) in section.data.actions" :key="ai"
                  style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface);">
                  <input type="checkbox" :checked="action.status === 'done'" @change="toggleAction(idx, ai)" style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--teal);" />
                  <input v-model="action.title" @input="scheduleSave" class="field-input" style="flex: 1; font-size: 13px; padding: 4px 6px; border: none; background: transparent;"
                    :style="{ textDecoration: action.status === 'done' ? 'line-through' : 'none', opacity: action.status === 'done' ? 0.5 : 1 }"
                    :placeholder="t('copilActionTitle')" />
                  <input v-model="action.owner" @input="scheduleSave" class="field-input" style="width: 120px; font-size: 12px; padding: 4px 6px;"
                    :placeholder="t('copilActionOwner')" />
                  <input type="date" v-model="action.due_date" @change="scheduleSave" class="field-input" style="width: 130px; font-size: 12px; padding: 4px 6px;" />
                  <button @click="removeAction(idx, ai)" style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 14px; padding: 2px 6px;">&#10005;</button>
                </div>
              </div>
              <button @click="addAction(idx)" style="margin-top: 10px; background: var(--surface); border: 1px dashed var(--border); border-radius: 8px; padding: 8px 14px; color: var(--teal); font-size: 12px; font-weight: 600; cursor: pointer; width: 100%;">
                + {{ t('copilAddAction') }}
              </button>
            </template>

            <!-- Notes Block -->
            <template v-if="section.type === 'notes'">
              <textarea
                v-model="section.data.content"
                @input="scheduleSave"
                :placeholder="t('copilNotesPlaceholder')"
                style="width: 100%; min-height: 160px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: var(--text); font-size: 13px; line-height: 1.6; resize: vertical; font-family: inherit;"
              ></textarea>
            </template>

            <!-- Custom Block -->
            <template v-if="section.type === 'custom'">
              <input
                v-model="section.data.title"
                @input="scheduleSave"
                :placeholder="t('copilCustomTitle')"
                class="field-input"
                style="font-size: 15px; font-weight: 700; padding: 8px 10px; margin-bottom: 10px;"
              />
              <textarea
                v-model="section.data.content"
                @input="scheduleSave"
                :placeholder="t('copilCustomContent')"
                style="width: 100%; min-height: 120px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: var(--text); font-size: 13px; line-height: 1.6; resize: vertical; font-family: inherit;"
              ></textarea>
            </template>
          </div>

          <!-- Add section between blocks -->
          <div style="display: flex; justify-content: center; padding: 4px 0; position: relative;">
            <button @click="toggleAddMenu(idx)" class="copil-add-between">+</button>
            <div v-if="addMenuAt === idx" class="copil-add-dropdown">
              <div @click="insertSection(idx + 1, 'kpis')">{{ t('copilSectionKpis') }}</div>
              <div @click="insertSection(idx + 1, 'health')">{{ t('copilSectionHealth') }}</div>
              <div @click="insertSection(idx + 1, 'actions')">{{ t('copilSectionActions') }}</div>
              <div @click="insertSection(idx + 1, 'notes')">{{ t('copilSectionNotes') }}</div>
              <div @click="insertSection(idx + 1, 'custom')">{{ t('copilSectionCustom') }}</div>
            </div>
          </div>
        </div>

        <!-- Add section at end (if no sections or after last) -->
        <div v-if="!session.sections.length" style="display: flex; justify-content: center; padding: 20px 0; position: relative;">
          <button @click="toggleAddMenu(-1)" class="copil-add-between" style="width: 100%; padding: 14px; border-style: dashed;">
            + {{ t('copilAddSection') }}
          </button>
          <div v-if="addMenuAt === -1" class="copil-add-dropdown">
            <div @click="insertSection(0, 'kpis')">{{ t('copilSectionKpis') }}</div>
            <div @click="insertSection(0, 'health')">{{ t('copilSectionHealth') }}</div>
            <div @click="insertSection(0, 'actions')">{{ t('copilSectionActions') }}</div>
            <div @click="insertSection(0, 'notes')">{{ t('copilSectionNotes') }}</div>
            <div @click="insertSection(0, 'custom')">{{ t('copilSectionCustom') }}</div>
          </div>
        </div>

        <!-- ===== 5. FOOTER ACTIONS ===== -->
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-bottom: 40px;">
          <button class="btn btn-primary" @click="exportPdf">
            <ScalyoIcon name="dashboard" :size="14" style="margin-right: 6px;" />
            {{ t('copilExportPdf') }}
          </button>
          <button class="btn btn-secondary" @click="shareCopil">
            {{ t('copilShare') }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '../api/client'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import { usePortfolioStore } from '../stores/portfolio'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const portfolioStore = usePortfolioStore()

const currencySymbol = computed(() => {
  const c = prefsStore.currency
  if (c === 'USD') return '$'
  if (c === 'GBP') return '\u00a3'
  if (c === 'CHF') return 'CHF'
  if (c === 'CAD') return 'CA$'
  return '\u20ac'
})

// State
const loading = ref(true)
const sessions = ref([])
const activeSessionId = ref(null)
const saveStatus = ref('')
const addMenuAt = ref(null)
const clientSearch = ref('')
const showClientDropdown = ref(false)
let saveTimer = null

// Active session computed
const session = computed(() => sessions.value.find(s => s.id === activeSessionId.value) || null)

// Period options
const periodOptions = computed(() => {
  const opts = []
  const year = new Date().getFullYear()
  for (let y = year - 1; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q++) {
      opts.push(`Q${q} ${y}`)
    }
  }
  return opts
})

// Client search results
const clientResults = computed(() => {
  const q = clientSearch.value.toLowerCase().trim()
  if (!q) return portfolioStore.accounts.slice(0, 8)
  return portfolioStore.accounts.filter(a =>
    a.name?.toLowerCase().includes(q) || a.csm?.toLowerCase().includes(q)
  ).slice(0, 8)
})

// Helpers
function capitalize(s) {
  if (!s) return 'Draft'
  const map = { draft: 'Draft', in_progress: 'InProgress', ready: 'Ready', presented: 'Presented' }
  return map[s] || 'Draft'
}

function fmtK(v) {
  const n = Number(v) || 0
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function fmtCurrency(v) {
  const s = currencySymbol.value
  const before = ['$', '\u00a3', 'CA$'].includes(s)
  const n = fmtK(v)
  return before ? `${s}${n}` : `${n}${s}`
}

function sectionIcon(type) {
  const map = { kpis: 'chart-up', health: 'heart', actions: 'target', notes: 'briefcase', custom: 'star' }
  return map[type] || 'dashboard'
}

function sectionLabel(type) {
  const map = { kpis: 'copilSectionKpis', health: 'copilSectionHealth', actions: 'copilSectionActions', notes: 'copilSectionNotes', custom: 'copilSectionCustom' }
  return t(map[type] || 'copilSectionCustom')
}

function healthColor(score) {
  const s = Number(score) || 0
  if (s >= 70) return 'var(--green)'
  if (s >= 40) return '#f59e0b'
  return 'var(--red)'
}

function defaultSectionData(type) {
  if (type === 'kpis') {
    return {
      kpis: [
        { label: 'ARR', value: '', trend: null },
        { label: 'MRR', value: '', trend: null },
        { label: 'Health Score', value: '', trend: null },
        { label: 'NPS', value: '', trend: null },
        { label: 'Churn Rate', value: '', trend: null },
        { label: 'Renewal Date', value: '', trend: null },
      ]
    }
  }
  if (type === 'health') {
    return { health_score: 0, risk_level: 'low', usage: '', support_tickets: 0, engagement: 0 }
  }
  if (type === 'actions') {
    return { actions: [] }
  }
  if (type === 'notes') {
    return { content: '' }
  }
  if (type === 'custom') {
    return { title: '', content: '' }
  }
  return {}
}

// API
async function loadSessions() {
  try {
    const { data } = await api.get('/modules/copil')
    sessions.value = (data.results || data || []).map(s => ({
      ...s,
      sections: s.sections || []
    }))
    if (sessions.value.length && !activeSessionId.value) {
      activeSessionId.value = sessions.value[0].id
    }
  } catch (e) {
    console.error('Failed to load COPIL sessions:', e)
    sessions.value = []
  }
}

function switchSession(id) {
  activeSessionId.value = id
  addMenuAt.value = null
}

async function createNewSession() {
  try {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    const body = {
      title: t('copilNewSession'),
      client_name: '',
      client_id: null,
      presentation_date: now.toISOString().slice(0, 10),
      period: `Q${quarter} ${now.getFullYear()}`,
      brand_color: '#7EC8B8',
      status: 'draft',
      sections: [
        { type: 'kpis', data: defaultSectionData('kpis') },
        { type: 'health', data: defaultSectionData('health') },
        { type: 'actions', data: defaultSectionData('actions') },
        { type: 'notes', data: defaultSectionData('notes') },
      ]
    }
    const { data } = await api.post('/modules/copil', body)
    const newSession = { ...body, ...data, sections: data.sections || body.sections }
    sessions.value.push(newSession)
    activeSessionId.value = newSession.id
  } catch (e) {
    console.error('Failed to create COPIL session:', e)
  }
}

async function deleteSession() {
  if (!session.value) return
  if (!confirm(t('copilDeleteConfirm'))) return
  try {
    await api.delete(`/modules/copil/${session.value.id}`)
    sessions.value = sessions.value.filter(s => s.id !== session.value.id)
    activeSessionId.value = sessions.value.length ? sessions.value[0].id : null
  } catch (e) {
    console.error('Failed to delete COPIL session:', e)
  }
}

function scheduleSave() {
  saveStatus.value = 'saving'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => doSave(), 500)
}

async function doSave() {
  if (!session.value) return
  try {
    await api.patch(`/modules/copil/${session.value.id}`, {
      title: session.value.title,
      client_name: session.value.client_name,
      client_id: session.value.client_id,
      presentation_date: session.value.presentation_date,
      period: session.value.period,
      brand_color: session.value.brand_color,
      status: session.value.status,
      sections: session.value.sections,
    })
    saveStatus.value = 'saved'
  } catch (e) {
    console.error('Auto-save failed:', e)
    saveStatus.value = ''
  }
}

function selectClient(acc) {
  if (!session.value) return
  session.value.client_name = acc.name
  session.value.client_id = acc.id
  clientSearch.value = ''
  showClientDropdown.value = false

  // Auto-fill KPIs section if exists
  const kpiSection = session.value.sections.find(s => s.type === 'kpis')
  if (kpiSection && kpiSection.data && kpiSection.data.kpis) {
    const arr = parseFloat(acc.arr) || (parseFloat(acc.mrr) || 0) * 12
    const mrr = parseFloat(acc.mrr) || Math.round(arr / 12)
    kpiSection.data.kpis.forEach(k => {
      if (k.label === 'ARR') k.value = fmtCurrency(arr)
      if (k.label === 'MRR') k.value = fmtCurrency(mrr)
      if (k.label === 'Health Score') k.value = String(acc.health || 0)
      if (k.label === 'NPS') k.value = String(acc.nps || '')
      if (k.label === 'Renewal Date') k.value = acc.renewal || ''
    })
  }

  // Auto-fill health section if exists
  const healthSection = session.value.sections.find(s => s.type === 'health')
  if (healthSection && healthSection.data) {
    healthSection.data.health_score = acc.health || 0
    healthSection.data.risk_level = acc.risk || 'low'
  }

  scheduleSave()
}

// Section management
function toggleAddMenu(idx) {
  addMenuAt.value = addMenuAt.value === idx ? null : idx
}

function insertSection(atIndex, type) {
  if (!session.value) return
  session.value.sections.splice(atIndex, 0, { type, data: defaultSectionData(type) })
  addMenuAt.value = null
  scheduleSave()
}

function removeSection(idx) {
  if (!session.value) return
  session.value.sections.splice(idx, 1)
  scheduleSave()
}

function moveSection(idx, dir) {
  if (!session.value) return
  const arr = session.value.sections
  const target = idx + dir
  if (target < 0 || target >= arr.length) return
  const tmp = arr[idx]
  arr[idx] = arr[target]
  arr[target] = tmp
  // Force reactivity
  session.value.sections = [...arr]
  scheduleSave()
}

// Actions
function addAction(sectionIdx) {
  if (!session.value) return
  const section = session.value.sections[sectionIdx]
  if (!section || section.type !== 'actions') return
  if (!section.data.actions) section.data.actions = []
  section.data.actions.push({ title: '', owner: '', due_date: '', status: 'todo' })
  scheduleSave()
}

function removeAction(sectionIdx, actionIdx) {
  if (!session.value) return
  session.value.sections[sectionIdx].data.actions.splice(actionIdx, 1)
  scheduleSave()
}

function toggleAction(sectionIdx, actionIdx) {
  if (!session.value) return
  const action = session.value.sections[sectionIdx].data.actions[actionIdx]
  action.status = action.status === 'done' ? 'todo' : 'done'
  scheduleSave()
}

// Export PDF
function exportPdf() {
  window.print()
}

// Share
function shareCopil() {
  alert(t('copilShare') + ' — coming soon!')
}

// Click outside to close dropdown
function handleClickOutside(e) {
  if (!e.target.closest?.('.copil-add-dropdown') && !e.target.closest?.('.copil-add-between')) {
    addMenuAt.value = null
  }
  if (!e.target.closest?.('[style*="position: relative"]')) {
    showClientDropdown.value = false
  }
}

onMounted(async () => {
  if (!portfolioStore.accounts.length) portfolioStore.fetchAccounts()
  await loadSessions()
  loading.value = false
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.copil-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.copil-tab:hover {
  color: var(--text);
  background: var(--surface);
}
.copil-tab.active {
  color: var(--text);
  border-bottom-color: var(--teal);
  font-weight: 700;
}
.copil-tab-add {
  color: var(--teal);
  gap: 4px;
  font-weight: 600;
}
.copil-tab-add:hover {
  color: var(--teal);
}

.copil-status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-draft { background: var(--surface); color: var(--muted); }
.status-in_progress { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.status-ready { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.status-presented { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

.copil-section-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
}
.copil-section-btn:hover {
  color: var(--text);
  border-color: var(--teal);
}

.copil-add-between {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 16px;
  color: var(--teal);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  z-index: 2;
}
.copil-add-between:hover {
  background: var(--teal);
  color: white;
  border-color: var(--teal);
}

.copil-add-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 50;
  min-width: 200px;
  padding: 4px;
  margin-top: 4px;
}
.copil-add-dropdown > div {
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.1s;
}
.copil-add-dropdown > div:hover {
  background: var(--surface);
}

@media print {
  .copil-tab, .copil-tab-add, .copil-section-btn, .copil-add-between, .copil-add-dropdown,
  button, select, [style*="border-bottom: 2px"] {
    display: none !important;
  }
  .card {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }
}
</style>
