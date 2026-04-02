<template>
  <div v-if="show" class="tp">
    <div class="tp-header">
      <span>🧪 Panel de test — Scalyo</span>
      <button class="tp-close" @click="show = false">✕</button>
    </div>

    <div class="tp-section-label">CLIENT BREVO SCALE (score: {{ brevoScore }})</div>
    <button class="tp-btn tp-btn--red" @click="degradeBrevo">📉 Dégradation → 48</button>
    <button class="tp-btn tp-btn--green" @click="recoverBrevo">📈 Récupération → 71</button>

    <div class="tp-section-label">PLAYBOOK CHURN PREVENTION</div>
    <button class="tp-btn tp-btn--blue" @click="tickPlaybookStep">✅ Valider étape suivante ({{ pbDone }}/6)</button>

    <div class="tp-section-label">WORKLOAD</div>
    <button class="tp-btn tp-btn--yellow" @click="reassignPayfit">🔄 Transférer Payfit → Amira</button>

    <div class="tp-divider"></div>
    <div class="tp-section-label">ÉTAT STORES</div>
    <div class="tp-stat">At-risk: <strong>{{ clientsStore.atRiskClients.length }}</strong> | Score moy: <strong>{{ clientsStore.avgHealthScore }}</strong></div>
    <div class="tp-stat">Charge moy: <strong>{{ csmStore.teamAvgLoad }}%</strong> | OKR: <strong>{{ tasksStore.globalOKRScore }}%</strong></div>
    <div class="tp-stat">Alertes: <strong>{{ managerStore.dashboard.alerts.length }}</strong></div>
  </div>

  <button v-else class="tp-toggle" @click="show = true">🧪</button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClientsStore } from '../../stores/clients'
import { useCSMStore } from '../../stores/csm'
import { useTasksStore } from '../../stores/tasks'
import { useManagerStore } from '../../stores/manager'
import { scalyoEvents } from '../../utils/eventBus'

const clientsStore = useClientsStore()
const csmStore = useCSMStore()
const tasksStore = useTasksStore()
const managerStore = useManagerStore()

const show = ref(true)
const brevoScore = computed(() => clientsStore.clients.find(c => c.id === 'client-001')?.healthScore ?? '—')
const pbDone = computed(() => (tasksStore.playbookProgress['pb-001'] || []).length)

function degradeBrevo() {
  clientsStore.updateClientHealth('client-001', 48)
  scalyoEvents.emit({ type: 'CLIENT_AT_RISK', payload: { name: 'Brevo Scale', score: 48 } })
  console.log('[EventBus] CLIENT_AT_RISK', { name: 'Brevo Scale', score: 48 })
}

function recoverBrevo() {
  clientsStore.updateClientHealth('client-001', 71)
  scalyoEvents.emit({ type: 'CLIENT_RECOVERED', payload: { name: 'Brevo Scale', score: 71 } })
  console.log('[EventBus] CLIENT_RECOVERED', { name: 'Brevo Scale', score: 71 })
}

function tickPlaybookStep() {
  const curr = tasksStore.playbookProgress['pb-001'] || []
  const nextStep = curr.length
  if (nextStep < 6) {
    tasksStore.togglePlaybookStep('pb-001', nextStep)
    scalyoEvents.emit({ type: 'PLAYBOOK_TRIGGERED', payload: { playbookId: 'pb-001', step: nextStep + 1 } })
    console.log('[EventBus] PLAYBOOK_TRIGGERED', { playbookId: 'pb-001', step: nextStep + 1 })
  }
}

function reassignPayfit() {
  const client = clientsStore.clients.find(c => c.id === 'client-003')
  if (client) {
    client.csmId = 'csm-003'
    client.csmName = 'Amira B.'
    // Recalculate Lucas workload
    const lucas = csmStore.csms.find(c => c.id === 'csm-002')
    if (lucas) lucas.workloadPct = 72
    const amira = csmStore.csms.find(c => c.id === 'csm-003')
    if (amira) amira.workloadPct = 68
    scalyoEvents.emit({ type: 'CSM_REBALANCED', payload: { clientId: 'client-003', from: 'csm-002', to: 'csm-003' } })
    console.log('[EventBus] CSM_REBALANCED', { clientId: 'client-003', from: 'Lucas D.', to: 'Amira B.' })
  }
}
</script>

<style scoped>
.tp { position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,.15); border: 2px solid #4285F4; width: 280px; font-family: 'DM Sans', sans-serif; }
.tp-header { display: flex; justify-content: space-between; align-items: center; font-weight: 800; color: #202124; margin-bottom: 12px; font-size: 14px; }
.tp-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #5F6368; }
.tp-section-label { font-size: 11px; color: #5F6368; margin: 10px 0 6px; font-weight: 700; }
.tp-btn { display: block; width: 100%; margin-bottom: 6px; padding: 8px 12px; border-radius: 8px; border: none; font-weight: 700; font-size: 12px; cursor: pointer; text-align: left; font-family: 'DM Sans', sans-serif; }
.tp-btn--red { background: rgba(234,67,53,.1); color: #EA4335; }
.tp-btn--green { background: rgba(52,168,83,.1); color: #34A853; }
.tp-btn--blue { background: rgba(66,133,244,.1); color: #4285F4; }
.tp-btn--yellow { background: rgba(251,188,5,.15); color: #795500; }
.tp-btn:hover { filter: brightness(.95); }
.tp-divider { margin: 12px 0; border-top: 1px solid #F1F3F4; }
.tp-stat { font-size: 11px; color: #202124; margin-bottom: 4px; }
.tp-toggle { position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #4285F4; background: #fff; font-size: 20px; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.12); }
</style>
