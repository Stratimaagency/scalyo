<template>
  <div class="portfolio">
    <!-- HEADER -->
    <div class="port-header">
      <h1>💼 {{ t('port_title') }}</h1>
      <div class="port-actions">
        <button class="btn-outline" @click="$router.push('/app/import')">{{ t('port_import') }}</button>
        <button class="btn-outline" @click="exportCsv">{{ t('port_export') }}</button>
        <div v-if="resetStep === 0">
          <button class="btn-danger-outline" @click="resetStep = 1">{{ t('port_reset_all') }}</button>
        </div>
        <div v-else-if="resetStep === 1" class="reset-confirm">
          <span class="reset-msg">{{ t('port_reset_step1') }}</span>
          <button class="btn-danger-outline" @click="resetStep = 2">{{ t('port_reset_confirm') }}</button>
          <button class="btn-outline" @click="resetStep = 0">{{ t('sm_reset_cancel') }}</button>
        </div>
        <div v-else-if="resetStep === 2" class="reset-confirm">
          <span class="reset-msg warn">{{ t('port_reset_step2') }}</span>
          <button class="btn-danger" @click="doResetAll">{{ t('port_reset_confirm') }}</button>
          <button class="btn-outline" @click="resetStep = 0">{{ t('sm_reset_cancel') }}</button>
        </div>
        <button class="btn-primary" @click="openCreate">{{ t('port_add') }}</button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="port-kpis">
      <div class="pkpi"><span class="pkpi-icon">📊</span><div><span class="pkpi-value">{{ clients.clients.length }}</span><span class="pkpi-label">{{ t('port_accounts') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">💰</span><div><span class="pkpi-value">€{{ fmtNum(clients.totalArr) }}</span><span class="pkpi-label">{{ t('port_arr_total') }}</span></div></div>
      <div class="pkpi"><span class="pkpi-icon">💚</span><div><span class="pkpi-value">{{ clients.avgHealth }}/10</span><span class="pkpi-label">{{ t('port_health_avg') }}</span></div></div>
      <div class="pkpi warn"><span class="pkpi-icon">🔴</span><div><span class="pkpi-value">{{ clients.criticalCount }}</span><span class="pkpi-label">{{ t('port_critical') }}</span></div></div>
    </div>

    <!-- SEARCH & FILTERS -->
    <div class="port-toolbar">
      <div class="search-box">
        <span class="si">🔍</span>
        <input v-model="search" :placeholder="t('port_search')" />
      </div>
      <div class="filter-tabs">
        <button v-for="f in filters" :key="f.key" class="ftab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">
          {{ t(f.label) }} <span class="fc">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <div v-if="filtered.length" class="table-wrap">
      <div class="th">
        <span class="c-name">{{ t('port_field_name') }}</span>
        <span class="c-ind hide-sm">{{ t('port_field_industry') }}</span>
        <span class="c-arr">ARR</span>
        <span class="c-h">Health</span>
        <span class="c-st hide-sm">{{ t('port_field_status') }}</span>
        <span class="c-csm hide-md">Agent</span>
        <span class="c-ren hide-md">{{ t('port_renewal') }}</span>
        <span class="c-act hide-sm"></span>
      </div>
      <div v-for="c in filtered" :key="c.id" class="tr" @click="openEdit(c)">
        <div class="c-name">
          <div class="av" :class="c.status">{{ c.name[0] }}</div>
          <div><strong>{{ c.name }}</strong><span class="sub" v-if="c.contacts?.[0]">{{ c.contacts[0].name }}</span></div>
        </div>
        <span class="c-ind hide-sm">{{ c.industry }}</span>
        <span class="c-arr fw">€{{ fmtNum(c.arr) }}</span>
        <span class="c-h"><span class="pill" :class="sClass(c.status)">{{ c.health }}</span></span>
        <span class="c-st hide-sm"><span class="sbadge" :class="c.status">{{ t('status_' + c.status) }}</span></span>
        <span class="c-csm hide-md">{{ c.csm }}</span>
        <span class="c-ren hide-md" :class="{ soon: renewSoon(c) }">{{ fmtDate(c.renewalDate) }}</span>
        <span class="c-act hide-sm">
          <button class="rb" @click.stop="openEdit(c)" :title="t('edit')">✏️</button>
          <template v-if="deleteConfirmId === c.id">
            <button class="rb del active" @click.stop="doDelete(c)" :title="t('port_delete_step2')">✓</button>
            <button class="rb" @click.stop="deleteConfirmId = null" :title="t('sm_reset_cancel')">✕</button>
          </template>
          <button v-else class="rb del" @click.stop="deleteConfirmId = c.id" :title="t('port_delete_step1')">🗑️</button>
        </span>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else class="empty">
      <div class="empty-i">💼</div>
      <h3>{{ t('port_empty_title') }}</h3>
      <p>{{ t('port_empty_desc') }}</p>
      <button class="btn-primary" @click="openCreate">{{ t('port_new_account') }}</button>
    </div>

    <!-- SLIDE-OVER -->
    <SlideOver :open="slideOpen" :title="editId ? t('port_edit_title') : t('port_create_title')" @close="slideOpen = false">
      <form @submit.prevent="save" class="sf">
        <div class="fg"><label>{{ t('port_field_name') }} *</label><input v-model="form.name" required class="fi" /></div>
        <div class="fr">
          <div class="fg"><label>{{ t('port_field_industry') }}</label>
            <select v-model="form.industry" class="fi"><option v-for="i in industries" :key="i" :value="i">{{ i }}</option></select>
          </div>
          <div class="fg"><label>{{ t('port_field_status') }}</label>
            <select v-model="form.status" class="fi">
              <option value="healthy">{{ t('status_healthy') }}</option>
              <option value="watch">{{ t('status_watch') }}</option>
              <option value="critical">{{ t('status_critical') }}</option>
            </select>
          </div>
        </div>
        <div class="fr">
          <div class="fg"><label>{{ t('port_field_arr') }}</label><input v-model.number="form.arr" type="number" min="0" class="fi" /></div>
          <div class="fg"><label>{{ t('port_field_mrr') }}</label><input v-model.number="form.mrr" type="number" min="0" class="fi" /></div>
        </div>
        <div class="fr">
          <div class="fg"><label>{{ t('port_field_health') }}</label><input v-model.number="form.health" type="number" min="0" max="10" step="0.1" class="fi" /></div>
          <div class="fg"><label>{{ t('port_field_nps') }}</label><input v-model.number="form.nps" type="number" min="-100" max="100" class="fi" /></div>
        </div>
        <div class="fr">
          <div class="fg"><label>{{ t('port_field_agent') }}</label>
            <select v-model="form.csmId" class="fi"><option v-for="m in team.members" :key="m.id" :value="m.id">{{ m.name }}</option></select>
          </div>
          <div class="fg"><label>{{ t('port_field_renewal') }}</label><input v-model="form.renewalDate" type="date" class="fi" /></div>
        </div>
        <div class="fdiv">{{ t('port_contact') }}</div>
        <div class="fg"><label>{{ t('port_field_contact_name') }}</label><input v-model="form.cName" class="fi" /></div>
        <div class="fr">
          <div class="fg"><label>{{ t('port_field_contact_email') }}</label><input v-model="form.cEmail" type="email" class="fi" /></div>
          <div class="fg"><label>{{ t('port_field_contact_role') }}</label><input v-model="form.cRole" class="fi" /></div>
        </div>
        <div class="fa">
          <button type="button" class="btn-outline" @click="slideOpen = false">{{ t('cancel') }}</button>
          <button type="submit" class="btn-primary">{{ editId ? t('save') : t('create') }}</button>
        </div>
      </form>
    </SlideOver>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import SlideOver from '@/components/SlideOver.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const clients = useClientStore()
const team = useTeamStore()

const search = ref('')
const activeFilter = ref('all')
const slideOpen = ref(false)
const editId = ref(null)
const resetStep = ref(0)
const deleteConfirmId = ref(null)

function doResetAll() {
  clients.resetAll()
  resetStep.value = 0
}

const initForm = () => ({ name: '', industry: 'SaaS', arr: 0, mrr: 0, health: 7, nps: 50, status: 'healthy', csmId: team.members[0]?.id || '', renewalDate: '', cName: '', cEmail: '', cRole: '', churnRisk: 0.05 })
const form = reactive(initForm())

const industries = computed(() => t('port_industries').split(','))

const filters = computed(() => [
  { key: 'all', label: 'port_filter_all', count: clients.clients.length },
  { key: 'critical', label: 'port_filter_critical', count: clients.criticalCount },
  { key: 'watch', label: 'port_filter_watch', count: clients.watchCount },
  { key: 'healthy', label: 'port_filter_healthy', count: clients.healthyCount },
])

const filtered = computed(() => {
  let list = clients.clients
  if (activeFilter.value !== 'all') list = list.filter(c => c.status === activeFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.csm.toLowerCase().includes(q))
  }
  return list
})

function fmtNum(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : String(n) }
function fmtDate(d) {
  if (!d) return '—'
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(d).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' })
}
function sClass(s) { return s === 'healthy' ? 'green' : s === 'watch' ? 'amber' : 'red' }
function renewSoon(c) { const d = new Date(c.renewalDate); return d.getTime() - Date.now() < 45 * 864e5 && d >= new Date() }

function openCreate() { editId.value = null; Object.assign(form, initForm()); slideOpen.value = true }
function openEdit(c) {
  editId.value = c.id
  Object.assign(form, { name: c.name, industry: c.industry, arr: c.arr, mrr: c.mrr, health: c.health, nps: c.nps, status: c.status, csmId: c.csmId, renewalDate: c.renewalDate, churnRisk: c.churnRisk, cName: c.contacts?.[0]?.name || '', cEmail: c.contacts?.[0]?.email || '', cRole: c.contacts?.[0]?.role || '' })
  slideOpen.value = true
}

function save() {
  const csm = team.members.find(m => m.id === form.csmId)
  const data = { name: form.name, industry: form.industry, arr: form.arr, mrr: form.mrr || Math.round(form.arr / 12), health: form.health, nps: form.nps, status: form.status, csmId: form.csmId, csm: csm?.name || '', renewalDate: form.renewalDate, churnRisk: form.churnRisk, logo: form.status === 'healthy' ? '🟢' : form.status === 'watch' ? '🟡' : '🔴', contacts: form.cName ? [{ name: form.cName, email: form.cEmail, role: form.cRole }] : [] }
  if (editId.value) clients.updateClient(editId.value, data)
  else clients.addClient(data)
  slideOpen.value = false
}

function doDelete(c) { clients.deleteClient(c.id) }

function exportCsv() {
  const h = ['Name','Industry','ARR','Health','NPS','Status','Agent','Renewal']
  const rows = clients.clients.map(c => [c.name, c.industry, c.arr, c.health, c.nps, c.status, c.csm, c.renewalDate])
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'scalyo-portfolio.csv'; a.click()
}
</script>

<style scoped>
.portfolio { max-width: 1200px; }

.port-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.port-header h1 { font-size: 1.5rem; font-weight: 800; }
.port-actions { display: flex; gap: 8px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.btn-primary:hover { background: var(--purple-dark); transform: translateY(-1px); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

.port-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.pkpi { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
.pkpi:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.pkpi.warn { border-left: 3px solid var(--red); }
.pkpi-icon { font-size: 1.4rem; }
.pkpi-value { font-size: 1.35rem; font-weight: 800; display: block; }
.pkpi-label { font-size: 0.72rem; color: var(--text-secondary); }

.port-toolbar { display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.search-box { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0 12px; flex: 1; min-width: 200px; max-width: 320px; }
.si { font-size: 0.9rem; }
.search-box input { border: none; outline: none; padding: 9px 0; font-size: 0.85rem; width: 100%; background: transparent; }
.filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.ftab { background: var(--bg); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); transition: all 0.15s; }
.ftab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.ftab:hover:not(.active) { background: var(--bg-hover); color: var(--text); }
.fc { font-size: 0.68rem; margin-left: 4px; background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px; }
.ftab.active .fc { background: rgba(124,58,237,0.12); }

.table-wrap { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow-x: auto; }
.th { display: grid; grid-template-columns: 2.5fr 1fr 1fr 0.7fr 0.8fr 1fr 1fr 0.6fr; padding: 10px 16px; font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border-light); background: var(--bg); }
.tr { display: grid; grid-template-columns: 2.5fr 1fr 1fr 0.7fr 0.8fr 1fr 1fr 0.6fr; padding: 12px 16px; align-items: center; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s; font-size: 0.85rem; }
.tr:hover { background: var(--bg-hover); }
.tr:last-child { border-bottom: none; }

.c-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
.av { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
.av.healthy { background: var(--green); }
.av.watch { background: var(--amber); }
.av.critical { background: var(--red); }
.c-name strong { display: block; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub { font-size: 0.7rem; color: var(--text-muted); display: block; }
.c-ind { font-size: 0.8rem; color: var(--text-secondary); }
.fw { font-weight: 600; }
.pill { font-size: 0.78rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; }
.pill.green { background: var(--green-bg); color: var(--green); }
.pill.amber { background: var(--amber-bg); color: var(--amber); }
.pill.red { background: var(--red-bg); color: var(--red); }
.sbadge { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.sbadge.healthy { background: var(--green-bg); color: var(--green); }
.sbadge.watch { background: var(--amber-bg); color: var(--amber); }
.sbadge.critical { background: var(--red-bg); color: var(--red); }
.c-csm { font-size: 0.8rem; color: var(--text-secondary); }
.c-ren { font-size: 0.8rem; color: var(--text-secondary); }
.c-ren.soon { color: var(--amber); font-weight: 600; }
.c-act { display: flex; gap: 4px; }
.rb { background: none; border: none; font-size: 0.9rem; padding: 4px; border-radius: 4px; opacity: 0.4; transition: all 0.15s; }
.rb:hover { opacity: 1; background: var(--bg-hover); }
.rb.del:hover { background: var(--red-bg); }

.empty { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); }
.empty-i { font-size: 3rem; margin-bottom: 16px; }
.empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.empty p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; }

/* Slide form */
.sf { display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; transition: border-color 0.15s; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.fr { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fdiv { font-size: 0.78rem; font-weight: 700; color: var(--text); padding: 8px 0 0; border-top: 1px solid var(--border-light); margin-top: 4px; }
.fa { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); }

.reset-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.reset-msg { font-size: 0.82rem; color: var(--text-secondary); }
.reset-msg.warn { color: #ef4444; font-weight: 600; }
.btn-danger { background: #ef4444; color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-danger:hover { background: #dc2626; }
.btn-danger-outline { background: none; color: #ef4444; border: 1px solid #ef4444; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-danger-outline:hover { background: #fef2f2; }
.rb.del.active { opacity: 1; background: #fef2f2; color: #ef4444; }

@media (max-width: 1024px) { .hide-md { display: none !important; } .th, .tr { grid-template-columns: 2fr 1fr 1fr 0.7fr 0.8fr 0.6fr; } }
@media (max-width: 768px) { .hide-sm { display: none !important; } .port-kpis { grid-template-columns: repeat(2, 1fr); } .th, .tr { grid-template-columns: 2fr 1fr 0.8fr; } .fr { grid-template-columns: 1fr; } .port-actions { width: 100%; justify-content: flex-end; } }
</style>
