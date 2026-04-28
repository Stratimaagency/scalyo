<template>
  <div class="manager">
    <!-- HEADER -->
    <div class="mgr-header">
      <div>
        <div class="manager-header-row">
          <h1>👥 {{ t('mgr_title') }}</h1>
          <button class="btn-reset-data" @click="resetAllData" :title="t('mgr_reset_title')">
            🔄 {{ t('mgr_reset') }}
          </button>
        </div>
        <p class="mgr-date">{{ formattedDate }}</p>
      </div>
      <div class="mgr-header-actions">
        <button class="btn-customize" @click="customizerOpen = true">
          ⚙ {{ t('kpi_cust_title') }}
        </button>
      </div>
      <div class="mgr-kpis-top">
        <div class="mkpi">
          <span class="mkpi-value" :class="healthClass">{{ team.teamHealthScore }}</span>
          <span class="mkpi-label">{{ t('mgr_global_health') }}</span>
        </div>
        <div class="mkpi">
          <span class="mkpi-value">€{{ (team.totalArrManaged / 1000).toFixed(0) }}K</span>
          <span class="mkpi-label">{{ t('mgr_total_arr') }}</span>
        </div>
        <div class="mkpi">
          <span class="mkpi-value">{{ clients.clients.length }}</span>
          <span class="mkpi-label">{{ t('mgr_total_clients') }}</span>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="mgr-filters">
      <select v-model="filterCsm" class="filter-select">
        <option value="all">{{ t('mgr_filter_all_csm') }}</option>
        <option v-for="m in team.enrichedMembers" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <select v-model="filterLevel" class="filter-select">
        <option value="all">{{ t('mgr_filter_all_levels') }}</option>
        <option v-for="role in uniqueRoles" :key="role" :value="role">{{ role }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="all">{{ t('mgr_filter_all_statuses') }}</option>
        <option value="healthy">{{ t('status_healthy') }}</option>
        <option value="overloaded">{{ t('kpi_overloaded') }}</option>
      </select>
    </div>

    <!-- WELLBEING -->
    <ManagerWellbeing :members="filteredMembers" />

    <!-- TWO COLUMNS -->
    <div class="mgr-columns">
      <ManagerPerformance :members="filteredMembers" />
      <ManagerPortfolio />
    </div>

    <KpiCustomizer
      :open="customizerOpen"
      page-id="manager"
      :defaults="defaultKpis"
      v-model="selectedKpis"
      @close="customizerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeamStore } from '@/stores/team'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import KpiCustomizer from '@/components/KpiCustomizer.vue'
import ManagerWellbeing from '@/components/manager/ManagerWellbeing.vue'
import ManagerPerformance from '@/components/manager/ManagerPerformance.vue'
import ManagerPortfolio from '@/components/manager/ManagerPortfolio.vue'
import '@/assets/manager.css'

const { t, locale } = useI18n({ useScope: 'global' })
const team = useTeamStore()
const clients = useClientStore()
const tasks = useTaskStore()

const customizerOpen = ref(false)
const defaultKpis = ['team_wellbeing', 'arr', 'churn_rate', 'accounts_per_csm', 'nrr', 'health_score']
const selectedKpis = ref([...defaultKpis])

const filterCsm = ref('all')
const filterLevel = ref('all')
const filterStatus = ref('all')

const formattedDate = computed(() => {
  const loc = locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date().toLocaleDateString(loc, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

const healthClass = computed(() => {
  const s = team.teamHealthScore
  return s >= 70 ? 'green' : s >= 50 ? 'amber' : 'red'
})

const filteredMembers = computed(() =>
  team.enrichedMembers.filter(m => {
    if (filterCsm.value !== 'all' && m.id !== filterCsm.value) return false
    if (filterLevel.value !== 'all' && m.role !== filterLevel.value) return false
    if (filterStatus.value !== 'all' && m.status !== filterStatus.value) return false
    return true
  })
)

const uniqueRoles = computed(() =>
  [...new Set(team.enrichedMembers.map(m => m.role))]
)

function resetAllData() {
  if (!confirm(t('mgr_reset_confirm'))) return
  if (clients.clients) clients.clients.length = 0
  if (team.members) team.members.length = 0
  if (tasks.tasks) tasks.tasks.length = 0
  if (tasks.projects) tasks.projects.length = 0
  ;['scalyo_clients', 'scalyo_tasks', 'scalyo_team', 'scalyo_projects',
    'scalyo_kpis', 'scalyo_playbooks', 'scalyo_snapshots', 'scalyo_okr',
    'scalyo_roadmap', 'scalyo_quotes', 'scalyo_dashboard_kpis',
    'scalyo_coach_messages'
  ].forEach(k => localStorage.removeItem(k))
}
</script>
