<template>
  <section class="mgr-section">
    <h2>📊 {{ t('mgr_performance') }}</h2>
    <div class="perf-table">
      <div class="perf-header">
        <span>CSM</span>
        <span>{{ t('mgr_clients_managed') }}</span>
        <span>{{ t('mgr_arr_managed') }}</span>
        <span>{{ t('kpi_health') }}</span>
      </div>
      <div v-for="m in members" :key="m.id" class="perf-row">
        <div class="perf-name">
          <div class="perf-avatar" :class="m.status">{{ m.name[0] }}</div>
          <div>
            <strong>{{ m.name }}</strong>
            <span class="perf-role">{{ m.role }}</span>
          </div>
        </div>
        <span class="perf-val">{{ m.clientCount }}</span>
        <span class="perf-val">€{{ (m.arrManaged / 1000).toFixed(0) }}K</span>
        <span class="perf-val">
          <span class="health-pill" :class="avgHealthClass(m.id)">
            {{ avgHealthForCsm(m.id) }}
          </span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'

const { t } = useI18n({ useScope: 'global' })
const clients = useClientStore()

defineProps({
  members: { type: Array, required: true }
})

function avgHealthForCsm(csmId) {
  const csmClients = clients.clients.filter(c => c.csmId === csmId)
  if (!csmClients.length) return '—'
  return (csmClients.reduce((s, c) => s + c.health, 0) / csmClients.length).toFixed(1)
}

function avgHealthClass(csmId) {
  const v = parseFloat(avgHealthForCsm(csmId))
  if (isNaN(v)) return ''
  return v >= 7 ? 'green' : v >= 5 ? 'amber' : 'red'
}
</script>
