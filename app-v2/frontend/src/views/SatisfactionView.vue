<template>
  <div class="satisfaction">
    <SatHeader
      :globalScore="globalScore"
      @customize="customizerOpen = true"
      @reset="resetFilters"
    />

    <SatFilters
      :statusFilters="statusFilters"
      v-model:activeFilter="activeFilter"
      v-model:csmFilter="csmFilter"
      v-model:sortBy="sortBy"
      v-model:search="search"
      :teamMembers="team.members"
    />

    <div class="sat-grid">
      <div class="sat-left">
        <SatGaugeCard
          :globalScore="globalScore"
          :gaugeColor="gaugeColor"
          :gaugeArc="gaugeArc"
          :healthyCount="clients.healthyCount"
          :watchCount="clients.watchCount"
          :criticalCount="clients.criticalCount"
          :totalClients="clients.clients.length"
        />
        <SatArrCards
          :totalArr="clients.totalArr"
          :arrAtRisk="clients.arrAtRisk"
        />
      </div>

      <div class="sat-right">
        <SatHealthList :sortedClients="sortedClients" />
        <SatIndicators
          :renewalsNext30="clients.renewalsNext30"
          :decliningCount="decliningCount"
          :bestCsm="bestCsm"
          :arrAtRisk="clients.arrAtRisk"
        />
      </div>
    </div>

    <KpiCustomizer
      :open="customizerOpen"
      page-id="satisfaction"
      :defaults="defaultKpis"
      v-model="selectedKpis"
      @close="customizerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import KpiCustomizer from '@/components/KpiCustomizer.vue'
import SatHeader from '@/components/satisfaction/SatHeader.vue'
import SatFilters from '@/components/satisfaction/SatFilters.vue'
import SatGaugeCard from '@/components/satisfaction/SatGaugeCard.vue'
import SatArrCards from '@/components/satisfaction/SatArrCards.vue'
import SatHealthList from '@/components/satisfaction/SatHealthList.vue'
import SatIndicators from '@/components/satisfaction/SatIndicators.vue'

import '@/assets/satisfaction.css'

const clients = useClientStore()
const team = useTeamStore()

const customizerOpen = ref(false)
const defaultKpis = ['health_score', 'nps', 'churn_rate', 'renewal_rate', 'csat', 'promoters_pct']
const selectedKpis = ref([...defaultKpis])

const activeFilter = ref('all')
const csmFilter = ref('all')
const sortBy = ref('health')
const search = ref('')

const statusFilters = [
  { key: 'all', label: 'sat_filter_all' },
  { key: 'healthy', label: 'sat_filter_healthy' },
  { key: 'watch', label: 'sat_filter_watch' },
  { key: 'risk', label: 'sat_filter_risk' },
]

function resetFilters() {
  activeFilter.value = 'all'
  csmFilter.value = 'all'
  sortBy.value = 'health'
  search.value = ''
}

const filteredClients = computed(() => {
  let list = clients.clients
  if (activeFilter.value === 'healthy') list = list.filter(c => c.status === 'healthy')
  else if (activeFilter.value === 'watch') list = list.filter(c => c.status === 'watch')
  else if (activeFilter.value === 'risk') list = list.filter(c => c.status === 'critical' || c.status === 'watch')
  if (csmFilter.value !== 'all') list = list.filter(c => c.csmId === csmFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q))
  }
  return list
})

const sortedClients = computed(() => {
  const list = [...filteredClients.value]
  if (sortBy.value === 'health') list.sort((a, b) => a.health - b.health)
  else if (sortBy.value === 'health_desc') list.sort((a, b) => b.health - a.health)
  else if (sortBy.value === 'arr') list.sort((a, b) => b.arr - a.arr)
  return list
})

const globalScore = computed(() => {
  if (!filteredClients.value.length) return 0
  return Math.round(filteredClients.value.reduce((s, c) => s + c.health * 10, 0) / filteredClients.value.length)
})

const gaugeColor = computed(() => {
  if (globalScore.value >= 70) return '#10b981'
  if (globalScore.value >= 50) return '#f59e0b'
  return '#ef4444'
})

const gaugeArc = computed(() => ((globalScore.value / 100) * 534.07).toFixed(1))

const decliningCount = computed(() => clients.clients.filter(c => c.health < 5).length)

const bestCsm = computed(() => {
  const csmScores = {}
  clients.clients.forEach(c => {
    if (!csmScores[c.csmId]) csmScores[c.csmId] = { total: 0, count: 0, name: c.csm }
    csmScores[c.csmId].total += c.health
    csmScores[c.csmId].count++
  })
  let best = null
  let bestAvg = 0
  for (const id in csmScores) {
    const avg = csmScores[id].total / csmScores[id].count
    if (avg > bestAvg) { bestAvg = avg; best = csmScores[id].name }
  }
  return best || '\u2014'
})
</script>
