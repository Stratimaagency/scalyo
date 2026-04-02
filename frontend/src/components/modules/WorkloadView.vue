<template>
  <div class="workload-view">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">⚖️ Charge equipe — Repartition et equilibre</h1>
      <p class="hero-sub">Analysez la charge de travail de chaque CSM</p>
    </div>

    <!-- Summary cards -->
    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">CHARGE MOYENNE</span>
        <span class="summary-number" :style="{ color: avgLoad > 85 ? '#EA4335' : avgLoad > 70 ? '#FBBC05' : '#34A853' }">
          {{ avgLoad }}%
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">CSM SURCHARGES</span>
        <span class="summary-number" :style="{ color: overloadedCount > 0 ? '#EA4335' : '#34A853' }">
          {{ overloadedCount }}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">TOTAL CLIENTS</span>
        <span class="summary-number">{{ totalClients }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="csmStore.loading" class="loading">
      <div class="spinner" />
      <span>Chargement...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="csmsWithClients.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <p class="empty-title">Aucun CSM</p>
      <p class="empty-sub">L'equipe apparaitra ici une fois configuree.</p>
    </div>

    <!-- CSM cards -->
    <div v-else class="csm-grid">
      <div
        v-for="csm in csmsWithClients"
        :key="csm.id"
        class="csm-card"
        :class="{ overloaded: csm.workloadPct >= 85 }"
      >
        <div class="csm-top">
          <div class="csm-avatar" :style="{ background: csm.workloadPct >= 85 ? '#EA4335' : '#4285F4' }">
            {{ initials(csm.name) }}
          </div>
          <div class="csm-info">
            <h3 class="csm-name">{{ csm.name || 'CSM' }}</h3>
            <span class="csm-role">{{ csm.role || 'Customer Success Manager' }}</span>
          </div>
        </div>

        <!-- Workload bar -->
        <div class="workload-section">
          <div class="workload-header">
            <span class="meta-label">CHARGE</span>
            <span class="workload-pct" :style="{ color: csm.workloadPct >= 85 ? '#EA4335' : csm.workloadPct >= 70 ? '#FBBC05' : '#34A853' }">
              {{ csm.workloadPct || 0 }}%
            </span>
          </div>
          <div class="workload-track">
            <div
              class="workload-fill"
              :style="{
                width: Math.min(csm.workloadPct || 0, 100) + '%',
                background: csm.workloadPct >= 85 ? '#EA4335' : 'linear-gradient(90deg, #EA4335, #FBBC05, #34A853, #4285F4)'
              }"
            />
          </div>
        </div>

        <!-- Stats -->
        <div class="csm-stats">
          <div class="stat-item">
            <span class="meta-label">CLIENTS</span>
            <span class="stat-val">{{ (csm.clients || []).length }}</span>
          </div>
          <div class="stat-item">
            <span class="meta-label">A RISQUE</span>
            <span class="stat-val" :style="{ color: atRiskCount(csm) > 0 ? '#EA4335' : '#34A853' }">
              {{ atRiskCount(csm) }}
            </span>
          </div>
        </div>

        <!-- Client list -->
        <div v-if="(csm.clients || []).length > 0" class="client-list">
          <div v-for="client in (csm.clients || []).slice(0, 5)" :key="client.id" class="client-mini">
            <span class="client-mini-name">{{ client.name }}</span>
            <span
              class="health-badge"
              :style="{ background: healthBadgeBg(client.healthScore), color: healthBadgeColor(client.healthScore) }"
            >
              {{ client.healthScore || 0 }}
            </span>
          </div>
          <div v-if="(csm.clients || []).length > 5" class="client-more">
            +{{ (csm.clients || []).length - 5 }} autres
          </div>
        </div>
        <div v-else class="no-clients">Aucun client assigne</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCsmStore } from '../../stores/csm'
import { useClientsStore } from '../../stores/clients'

const csmStore = useCsmStore()
const clientsStore = useClientsStore()

const csmsWithClients = computed(() => csmStore.workloadByCSM)
const avgLoad = computed(() => csmStore.teamAvgLoad)
const overloadedCount = computed(() => csmStore.overloadedCSMs.length)
const totalClients = computed(() => clientsStore.clients.length)

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function atRiskCount(csm) {
  return (csm.clients || []).filter(c => c.healthScore < 60).length
}

function healthBadgeBg(score) {
  if (score >= 75) return 'rgba(52,168,83,0.1)'
  if (score >= 60) return 'rgba(251,188,5,0.1)'
  return 'rgba(234,67,53,0.1)'
}

function healthBadgeColor(score) {
  if (score >= 75) return '#34A853'
  if (score >= 60) return '#FBBC05'
  return '#EA4335'
}
</script>

<style scoped>
.workload-view {
  max-width: 1200px;
  padding: 24px 28px;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  background: #F8F9FA;
}

.hero {
  background: linear-gradient(135deg, #EA4335, #FBBC05, #34A853, #4285F4);
  color: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
}
.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px;
}
.hero-sub {
  font-size: 14px;
  opacity: 0.85;
  margin: 0;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.summary-card {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 22px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-label {
  font-size: 13px;
  color: #5F6368;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.summary-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px;
  font-weight: 800;
  color: #202124;
  line-height: 1;
}

.loading {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  padding: 60px 0;
  color: #5F6368;
  font-size: 14px;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #E8EAED;
  border-top-color: #4285F4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 6px;
}
.empty-sub { font-size: 13px; color: #5F6368; margin: 0; }

.csm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.csm-card {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 22px;
  transition: box-shadow 0.2s;
}
.csm-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}
.csm-card.overloaded {
  box-shadow: 0 2px 16px rgba(234,67,53,0.15);
}

.csm-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.csm-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}
.csm-info {
  flex: 1;
  min-width: 0;
}
.csm-name {
  font-size: 15px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 2px;
}
.csm-role {
  font-size: 12px;
  color: #5F6368;
}

.workload-section {
  margin-bottom: 16px;
}
.workload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.meta-label {
  font-size: 13px;
  color: #5F6368;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.workload-pct {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 800;
}
.workload-track {
  height: 8px;
  background: #E8EAED;
  border-radius: 4px;
  overflow: hidden;
}
.workload-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.csm-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #E8EAED;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 800;
  color: #202124;
  line-height: 1;
}

.client-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.client-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(0,0,0,0.015);
  border-radius: 8px;
}
.client-mini-name {
  font-size: 12px;
  font-weight: 600;
  color: #5F6368;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.health-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.client-more {
  font-size: 11px;
  color: #5F6368;
  text-align: center;
  padding: 4px 0;
}
.no-clients {
  font-size: 12px;
  color: #5F6368;
  text-align: center;
  padding: 8px 0;
}
</style>
