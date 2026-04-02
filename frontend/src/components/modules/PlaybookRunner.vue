<template>
  <div class="mod-page fade-in">
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">🔄 Playbooks</h1>
        <p class="mod-subtitle">Processus guidés pour chaque situation client</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" style="color: #4285F4">{{ tasksStore.playbooks.length }}</div>
        <div class="mod-big-label">Playbooks</div>
      </div>
    </div>

    <!-- Active churn playbooks alert -->
    <div v-if="tasksStore.activeChurnPlaybooks.length" class="mod-alert mod-alert--warn">
      <span>⚡ {{ tasksStore.activeChurnPlaybooks.length }} playbook(s) actif(s) sur des clients à risque</span>
    </div>

    <div class="mod-card" v-if="!tasksStore.playbooks.length">
      <div class="mod-empty">
        <p style="font-size: 40px; margin-bottom: 12px;">🔄</p>
        <p style="font-weight: 700; margin-bottom: 8px;">Aucun playbook disponible</p>
        <p style="color: #5F6368">Les playbooks apparaîtront ici quand l'API sera connectée.</p>
      </div>
    </div>

    <div v-else class="playbook-grid">
      <div v-for="pb in tasksStore.playbooks" :key="pb.id" class="mod-card playbook-card">
        <div class="pb-header">
          <span class="pb-emoji">{{ pb.emoji || '📋' }}</span>
          <div>
            <h4 class="pb-title">{{ pb.name }}</h4>
            <p class="pb-desc">{{ pb.description || '' }}</p>
          </div>
          <div class="pb-progress-badge" :style="{ background: progressColor(pbProgress(pb.id)) }">
            {{ pbProgress(pb.id) }}%
          </div>
        </div>

        <!-- Clients associés -->
        <div v-if="pb.clients?.length" class="pb-clients">
          <span v-for="client in pb.clients" :key="client" class="pb-client-chip"
            :class="{ 'pb-client-chip--risk': isAtRisk(client) }">
            {{ client }}
          </span>
        </div>

        <!-- Steps -->
        <div class="pb-steps">
          <div v-for="(step, i) in pb.steps" :key="i" class="pb-step"
            :class="{ 'pb-step--done': isStepDone(pb.id, i) }"
            @click="toggleStep(pb.id, i)">
            <div class="pb-step-check">{{ isStepDone(pb.id, i) ? '✅' : '⬜' }}</div>
            <div class="pb-step-content">
              <div class="pb-step-title">{{ step.title }}</div>
              <div v-if="step.auto" class="pb-step-auto">⚡ Auto</div>
            </div>
          </div>
        </div>

        <div class="mod-progress-bar" style="margin-top: 14px">
          <div class="mod-progress-fill" :style="{ width: pbProgress(pb.id) + '%', background: 'linear-gradient(90deg, #4285F4, #34A853)' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useClientsStore } from '../../stores/clients'
import { useCSMStore } from '../../stores/csm'

const tasksStore = useTasksStore()
const clientsStore = useClientsStore()
const csmStore = useCSMStore()

function isStepDone(pbId, idx) { return (tasksStore.playbookProgress[pbId] || []).includes(idx) }
function pbProgress(pbId) {
  const pb = tasksStore.playbooks.find(p => p.id === pbId)
  if (!pb?.steps?.length) return 0
  const done = (tasksStore.playbookProgress[pbId] || []).length
  return Math.round((done / pb.steps.length) * 100)
}
function progressColor(pct) { return pct >= 80 ? '#34A853' : pct >= 40 ? '#FBBC05' : '#E8EAED' }
function isAtRisk(clientName) { return clientsStore.atRiskClients.some(c => c.name === clientName) }

async function toggleStep(pbId, idx) {
  await tasksStore.togglePlaybookStep(pbId, idx)
  await csmStore.fetchCSMs()
}

onMounted(() => {
  if (!tasksStore.playbooks.length) tasksStore.fetchAll()
  if (!clientsStore.clients.length) clientsStore.fetchClients()
})
</script>

<style scoped>
.playbook-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.playbook-card { padding: 24px; }
.pb-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.pb-emoji { font-size: 28px; }
.pb-title { font-size: 16px; font-weight: 800; color: #202124; }
.pb-desc { font-size: 12px; color: #5F6368; margin-top: 2px; }
.pb-progress-badge { color: #fff; font-weight: 800; font-size: 13px; padding: 4px 12px; border-radius: 20px; margin-left: auto; }
.pb-clients { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.pb-client-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #E8F0FE; color: #4285F4; }
.pb-client-chip--risk { background: #FCE8E6; color: #EA4335; }
.pb-steps { display: flex; flex-direction: column; gap: 6px; }
.pb-step { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
.pb-step:hover { background: #F8F9FA; }
.pb-step--done { opacity: 0.6; }
.pb-step-check { font-size: 16px; flex-shrink: 0; }
.pb-step-title { font-size: 13px; font-weight: 600; }
.pb-step-auto { font-size: 10px; font-weight: 700; color: #4285F4; background: #E8F0FE; padding: 1px 8px; border-radius: 10px; display: inline-block; margin-top: 2px; }
</style>
