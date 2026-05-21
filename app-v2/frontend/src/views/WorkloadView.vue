<template>
  <div class="workload-view">
    <div class="wl-header">
      <div>
        <h1>💚 {{ t('wl_title') }}</h1>
      </div>
      <button class="btn-outline" @click="showImport = !showImport">{{ t('import_btn_team') }}</button>
      <div class="wl-score-badge" :class="scoreClass">
        <span class="wlsb-label">{{ t('wl_team_score') }}</span>
        <span class="wlsb-val">{{ team.teamHealthScore }}</span>
      </div>
    </div>

    <!-- IMPORT -->
    <StandardImport v-if="showImport" :fields="teamFields" :on-import="handleBulkImport" />

    <div class="wl-kpis">
      <div class="wlk"><span class="wlk-icon">👥</span><span class="wlk-val">{{ team.members.length }}</span><span class="wlk-label">{{ t('kpi_members') }}</span></div>
      <div class="wlk"><span class="wlk-icon">💚</span><span class="wlk-val green">{{ team.healthyMembers }}</span><span class="wlk-label">{{ t('kpi_healthy_members') }}</span></div>
      <div class="wlk"><span class="wlk-icon">🔴</span><span class="wlk-val red">{{ team.overloadedMembers }}</span><span class="wlk-label">{{ t('kpi_overloaded') }}</span></div>
      <div class="wlk"><span class="wlk-icon">⚠️</span><span class="wlk-val amber">{{ clients.criticalCount }}</span><span class="wlk-label">{{ t('kpi_at_risk_clients') }}</span></div>
    </div>

    <div class="wl-filters">
      <button v-for="f in filters" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">{{ t(f.label) }}</button>
      <div class="search-box"><span>🔍</span><input v-model="search" :placeholder="t('search')" /></div>
    </div>

    <div v-if="filtered.length" class="wl-list">
      <div v-for="m in filtered" :key="m.id" class="wl-card">
        <div class="wlc-header">
          <div class="wlc-avatar" :class="m.status">{{ m.name[0] }}</div>
          <div class="wlc-info"><strong>{{ m.name }}</strong><span>{{ m.role }}</span></div>
          <span class="wlc-badge" :class="m.status">{{ m.status === 'healthy' ? t('status_healthy') : t('kpi_overloaded') }}</span>
        </div>
        <div class="wlc-metrics">
          <div class="wlc-m">
            <div class="wlcm-row"><span>{{ t('wb_score') }}</span><span :class="wellbeingClass(m.wellbeingScore)">{{ m.wellbeingScore }}/100</span></div>
            <div class="wlcm-bar"><div class="wlcm-fill" :class="wellbeingClass(m.wellbeingScore)" :style="{ width: m.wellbeingScore + '%' }" /></div>
          </div>
          <div class="wlc-m">
            <div class="wlcm-row"><span>{{ t('wb_charge') }}</span><span :class="workloadClass(m.workload)">{{ m.workload }}%</span></div>
            <div class="wlcm-bar"><div class="wlcm-fill" :class="workloadClass(m.workload)" :style="{ width: m.workload + '%' }" /></div>
          </div>
        </div>
        <div class="wlc-details">
          <span>{{ t('mgr_clients_managed') }}: <strong>{{ m.clientCount }}</strong></span>
          <span>{{ t('mgr_arr_managed') }}: <strong>€{{ (m.arrManaged / 1000).toFixed(0) }}K</strong></span>
          <span>{{ t('mgr_burnout_risk') }}: <span class="burnout-tag" :class="m.burnoutRisk">{{ t('mgr_burnout_' + m.burnoutRisk) }}</span></span>
        </div>
      </div>
    </div>

    <div v-else class="wl-empty">
      <div class="empty-icon">💚</div>
      <h3>{{ t('wl_empty') }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeamStore } from '@/stores/team'
import { useClientStore } from '@/stores/clients'
import StandardImport from '@/components/import/StandardImport.vue'
import { teamFields } from '@/config/importFields.js'

const { t } = useI18n({ useScope: 'global' })
const team = useTeamStore()
const clients = useClientStore()

const activeFilter = ref('all')
const search = ref('')
const showImport = ref(false)

const filters = [
  { key: 'all', label: 'wl_filter_all' },
  { key: 'overloaded', label: 'wl_filter_overloaded' },
  { key: 'healthy', label: 'wl_filter_healthy' },
  { key: 'risk', label: 'wl_filter_risk' },
]

var handleBulkImport = async function (rows) {
  var count = 0
  var errors = 0
  for (var i = 0; i < rows.length; i++) {
    try {
      var result = await team.addMember(rows[i])
      if (result) count++
      else errors++
    } catch (e) {
      errors++
    }
  }
  if (count > 0) showImport.value = false
  return count
}

const scoreClass = computed(() => team.teamHealthScore >= 70 ? 'green' : team.teamHealthScore >= 50 ? 'amber' : 'red')

const filtered = computed(() => {
  let list = team.members
  if (activeFilter.value === 'overloaded') list = list.filter(m => m.status === 'overloaded')
  else if (activeFilter.value === 'healthy') list = list.filter(m => m.status === 'healthy')
  else if (activeFilter.value === 'risk') list = list.filter(m => {
    const csmClients = clients.clients.filter(c => c.csmId === m.id)
    return csmClients.some(c => c.status === 'critical')
  })
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(m => m.name.toLowerCase().includes(q)) }
  return list
})

function wellbeingClass(s) { return s >= 70 ? 'green' : s >= 50 ? 'amber' : 'red' }
function workloadClass(l) { return l <= 60 ? 'green' : l <= 80 ? 'amber' : 'red' }

// ─── Member CRUD ──────────────────────────────────────────────────────────
const showMemberModal = ref(false)
const editingMember = ref(null)
const memberForm = ref({ name: '', email: '', role: '', wellbeingScore: 75, workload: 60 })

function openAddMember() {
  editingMember.value = null
  memberForm.value = { name: '', email: '', role: '', wellbeingScore: 75, workload: 60 }
  showMemberModal.value = true
}

function openEditMember(member) {
  editingMember.value = member
  memberForm.value = { name: member.name, email: member.email || '', role: member.role || '', wellbeingScore: member.wellbeingScore || 75, workload: member.workload || 60 }
  showMemberModal.value = true
}

function saveMember() {
  if (!memberForm.value.name.trim()) return
  if (editingMember.value) {
    team.updateMember({ ...editingMember.value, ...memberForm.value })
  } else {
    team.addMember({ ...memberForm.value, id: 'member_' + Date.now(), clientCount: 0, arrManaged: 0 })
  }
  showMemberModal.value = false
}

function confirmDeleteMember(member) {
  if (confirm(t('wl_confirm_delete') + ' ' + member.name + ' ?')) {
    team.deleteMember(member.id)
  }
}

</script>

<style scoped>
.workload-view { max-width: 900px; }
.wl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.wl-header h1 { font-size: 1.5rem; font-weight: 800; }
.wl-score-badge { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px 20px; display: flex; align-items: center; gap: 10px; }
.wlsb-label { font-size: 0.78rem; color: var(--text-secondary); }
.wlsb-val { font-size: 1.8rem; font-weight: 800; }
.wl-score-badge.green .wlsb-val { color: var(--green); }
.wl-score-badge.amber .wlsb-val { color: var(--amber); }
.wl-score-badge.red .wlsb-val { color: var(--red); }

.wl-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.wlk { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.2s; }
.wlk:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.wlk-icon { font-size: 1.3rem; }
.wlk-val { font-size: 1.5rem; font-weight: 800; }
.wlk-val.green { color: var(--green); } .wlk-val.red { color: var(--red); } .wlk-val.amber { color: var(--amber); }
.wlk-label { font-size: 0.72rem; color: var(--text-secondary); }

.wl-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.ftab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.search-box { display: flex; align-items: center; gap: 6px; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0 10px; margin-left: auto; }
.search-box input { border: none; outline: none; padding: 7px 0; font-size: 0.82rem; width: 140px; background: transparent; }

.wl-list { display: flex; flex-direction: column; gap: 14px; }
.wl-card { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; transition: all 0.2s; }
.wl-card:hover { box-shadow: var(--shadow-sm); }
.wlc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.wlc-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.wlc-avatar.healthy { background: var(--green); } .wlc-avatar.overloaded { background: var(--red); }
.wlc-info { flex: 1; }
.wlc-info strong { font-size: 0.95rem; display: block; }
.wlc-info span { font-size: 0.75rem; color: var(--text-muted); }
.wlc-badge { font-size: 0.72rem; font-weight: 600; padding: 4px 12px; border-radius: 6px; }
.wlc-badge.healthy { background: var(--green-bg); color: var(--green); }
.wlc-badge.overloaded { background: var(--red-bg); color: var(--red); }

.wlc-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
.wlc-m { }
.wlcm-row { display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px; color: var(--text-secondary); }
.wlcm-row .green { color: var(--green); font-weight: 600; } .wlcm-row .amber { color: var(--amber); font-weight: 600; } .wlcm-row .red { color: var(--red); font-weight: 600; }
.wlcm-bar { height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.wlcm-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
.wlcm-fill.green { background: var(--green); } .wlcm-fill.amber { background: var(--amber); } .wlcm-fill.red { background: var(--red); }

.wlc-details { display: flex; gap: 20px; font-size: 0.78rem; color: var(--text-secondary); flex-wrap: wrap; }
.wlc-details strong { color: var(--text); }
.burnout-tag { font-weight: 600; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; }
.burnout-tag.none, .burnout-tag.low { background: var(--green-bg); color: var(--green); }
.burnout-tag.medium { background: var(--amber-bg); color: var(--amber); }
.burnout-tag.high { background: var(--red-bg); color: var(--red); }

.wl-empty { text-align: center; padding: 60px 20px; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.wl-empty h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-secondary); }

@media (max-width: 768px) { .wl-kpis { grid-template-columns: repeat(2, 1fr); } .wlc-metrics { grid-template-columns: 1fr; } }

.wl-header-actions { display:flex; justify-content:flex-end; margin-bottom:12px; }
.btn-add-member { background:var(--purple);color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:0.88rem;font-weight:600;cursor:pointer;transition:all 0.2s; }
.btn-add-member:hover { background:#6d28d9;transform:translateY(-1px); }
.member-actions { display:flex;gap:6px;position:absolute;top:12px;right:12px;opacity:0;transition:opacity 0.18s; }
.member-card:hover .member-actions { opacity:1; }
.member-card { position:relative; }
.btn-member-edit, .btn-member-delete { background:rgba(255,255,255,0.9);border:1px solid var(--border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:0.8rem;transition:all 0.15s; }
.btn-member-edit:hover { background:#ede9fe; }
.btn-member-delete:hover { background:#fef2f2; }
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000; }
.modal-card { background:var(--bg-card,#fff);border-radius:16px;padding:32px;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.15); }
.modal-title { font-size:1.1rem;font-weight:700;margin-bottom:20px; }
.modal-form { display:flex;flex-direction:column;gap:14px; }
.fg-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.fg { display:flex;flex-direction:column;gap:4px; }
.fg label { font-size:0.78rem;font-weight:600;color:var(--text-muted,#6b7280); }
.modal-input { padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:0.9rem;outline:none;background:var(--bg,#f8f9fb);color:var(--text,#1a1a2e); }
.modal-input:focus { border-color:var(--purple,#7c3aed); }
.modal-range { width:100%;accent-color:var(--purple,#7c3aed); }
.modal-actions { display:flex;gap:10px;justify-content:flex-end;margin-top:20px; }
.btn-cancel { background:none;border:1px solid var(--border,#e5e7eb);color:var(--text-muted,#6b7280);padding:9px 18px;border-radius:8px;cursor:pointer;font-size:0.88rem; }
.btn-save { background:var(--purple,#7c3aed);color:#fff;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:0.88rem;font-weight:600; }

</style>
