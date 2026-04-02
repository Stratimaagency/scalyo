<template>
  <div class="health-tracker">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">❤️ Health Tracker — Suivi sante de vos clients</h1>
      <p class="hero-sub">Visualisez la sante de votre portefeuille en un coup d'oeil</p>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un client..."
        class="search-input"
      />
    </div>

    <!-- Tab pills -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-pill"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="clientsStore.loading" class="loading">
      <div class="spinner" />
      <span>Chargement...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredClients.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p class="empty-title">Aucun client trouve</p>
      <p class="empty-sub">Ajustez vos filtres ou importez vos clients.</p>
    </div>

    <!-- Client cards grid -->
    <div v-else class="clients-grid">
      <div
        v-for="client in filteredClients"
        :key="client.id"
        class="client-card"
        @click="selectedClient = client"
      >
        <div class="card-top">
          <div class="health-circle">
            <svg viewBox="0 0 80 80" class="circle-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#E8EAED" stroke-width="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                :stroke="healthColor(client.healthScore)"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - (circumference * (client.healthScore || 0)) / 100"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <span class="health-number" :style="{ color: healthColor(client.healthScore) }">
              {{ client.healthScore || 0 }}
            </span>
          </div>
          <div class="card-info">
            <h3 class="client-name">{{ client.name || 'Client' }}</h3>
            <span class="client-industry">{{ client.industry || 'N/A' }}</span>
          </div>
        </div>
        <div class="card-bottom">
          <div class="card-meta">
            <span class="meta-label">ARR</span>
            <span class="meta-value arr-value">{{ formatARR(client.arrValue) }}</span>
          </div>
          <div class="card-meta">
            <span class="meta-label">CSM</span>
            <span class="meta-value">{{ client.csmName || 'N/A' }}</span>
          </div>
          <div class="card-meta">
            <span class="meta-label">DERNIER CONTACT</span>
            <span class="meta-value">{{ formatDate(client.lastContact) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail panel -->
    <Teleport to="body">
      <div v-if="selectedClient" class="detail-overlay" @click.self="selectedClient = null">
        <div class="detail-panel">
          <button class="close-btn" @click="selectedClient = null">&times;</button>
          <div class="detail-header">
            <div class="health-circle health-circle-lg">
              <svg viewBox="0 0 100 100" class="circle-svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E8EAED" stroke-width="7" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  :stroke="healthColor(selectedClient.healthScore)"
                  stroke-width="7"
                  stroke-linecap="round"
                  :stroke-dasharray="circumferenceLg"
                  :stroke-dashoffset="circumferenceLg - (circumferenceLg * (selectedClient.healthScore || 0)) / 100"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span class="health-number health-number-lg" :style="{ color: healthColor(selectedClient.healthScore) }">
                {{ selectedClient.healthScore || 0 }}
              </span>
            </div>
            <div>
              <h2 class="detail-name">{{ selectedClient.name }}</h2>
              <p class="detail-industry">{{ selectedClient.industry || 'N/A' }}</p>
            </div>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="meta-label">ARR</span>
              <span class="detail-val">{{ formatARR(selectedClient.arrValue) }}</span>
            </div>
            <div class="detail-item">
              <span class="meta-label">CSM ASSIGNE</span>
              <span class="detail-val">{{ selectedClient.csmName || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="meta-label">DERNIER CONTACT</span>
              <span class="detail-val">{{ formatDate(selectedClient.lastContact) }}</span>
            </div>
            <div class="detail-item">
              <span class="meta-label">STATUT</span>
              <span class="detail-val" :style="{ color: healthColor(selectedClient.healthScore) }">
                {{ selectedClient.healthScore >= 75 ? 'Sain' : selectedClient.healthScore >= 60 ? 'A surveiller' : 'Critique' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClientsStore } from '../../stores/clients'

const clientsStore = useClientsStore()

const search = ref('')
const activeTab = ref('all')
const selectedClient = ref(null)

const circumference = 2 * Math.PI * 34
const circumferenceLg = 2 * Math.PI * 42

onMounted(() => {
  clientsStore.fetchClients()
})

const tabs = computed(() => [
  { key: 'all', label: 'Tous', count: clientsStore.clients.length },
  { key: 'healthy', label: 'Sains ✅', count: clientsStore.healthyClients.length },
  { key: 'watch', label: 'A surveiller ⚠️', count: clientsStore.neutralClients.length },
  { key: 'critical', label: 'Critiques 🔴', count: clientsStore.atRiskClients.length },
])

const filteredClients = computed(() => {
  let list = clientsStore.clients
  if (activeTab.value === 'healthy') list = clientsStore.healthyClients
  else if (activeTab.value === 'watch') list = clientsStore.neutralClients
  else if (activeTab.value === 'critical') list = clientsStore.atRiskClients

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.csmName || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q)
    )
  }
  return list
})

function healthColor(score) {
  if (score >= 75) return '#34A853'
  if (score >= 60) return '#FBBC05'
  return '#EA4335'
}

function formatARR(val) {
  if (!val) return '0 €'
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M €`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K €`
  return `${val} €`
}

function formatDate(d) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.health-tracker {
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

.search-bar {
  margin-bottom: 16px;
}
.search-input {
  width: 100%;
  padding: 12px 18px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  background: #fff;
  box-sizing: border-box;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  outline: none;
  transition: box-shadow 0.2s;
}
.search-input:focus {
  box-shadow: 0 2px 16px rgba(66,133,244,0.18);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tab-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 100px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  color: #5F6368;
}
.tab-pill:hover {
  background: rgba(66,133,244,0.08);
}
.tab-pill.active {
  background: #4285F4;
  color: #fff;
}
.tab-count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(0,0,0,0.08);
  padding: 2px 7px;
  border-radius: 999px;
}
.tab-pill.active .tab-count {
  background: rgba(255,255,255,0.2);
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
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 6px;
}
.empty-sub {
  font-size: 13px;
  color: #5F6368;
  margin: 0;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.client-card {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.15s;
}
.client-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.health-circle {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.health-circle-lg {
  width: 88px;
  height: 88px;
}
.circle-svg {
  width: 100%;
  height: 100%;
}
.health-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 800;
}
.health-number-lg {
  font-size: 30px;
}

.card-info {
  flex: 1;
  min-width: 0;
}
.client-name {
  font-size: 15px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.client-industry {
  font-size: 12px;
  color: #5F6368;
  font-weight: 500;
}

.card-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  border-top: 1px solid #E8EAED;
  padding-top: 14px;
}
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.meta-label {
  font-size: 13px;
  color: #5F6368;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #202124;
}
.arr-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  font-weight: 800;
}

/* Detail panel */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.detail-panel {
  width: 440px;
  max-width: 90vw;
  height: 100vh;
  background: #FFFFFF;
  padding: 32px;
  overflow-y: auto;
  box-shadow: -8px 0 30px rgba(0,0,0,0.08);
  position: relative;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #5F6368;
  line-height: 1;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  margin-top: 8px;
}
.detail-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #202124;
}
.detail-industry {
  font-size: 13px;
  color: #5F6368;
  margin: 0;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-val {
  font-size: 16px;
  font-weight: 700;
  color: #202124;
}
</style>
