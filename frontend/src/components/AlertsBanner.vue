<template>
  <div v-if="!dismissed && alerts.length > 0" class="alerts-banner" :class="hasCritical ? 'critical' : 'warning'">
    <span class="alerts-icon">{{ hasCritical ? '🔴' : '⚠️' }}</span>
    <span class="alerts-count">{{ alerts.length }} alertes actives</span>
    <span class="alerts-titles">
      <span v-for="alert in visibleAlerts" :key="alert.id" class="alert-title" @click="goToAlert(alert)">
        {{ alert.title }}
      </span>
      <span v-if="alerts.length > 2" class="alerts-more">+{{ alerts.length - 2 }} autres</span>
    </span>
    <a class="alerts-link" href="#" @click.prevent="$router.push('/alerts')">Voir tout</a>
    <button class="alerts-dismiss" @click="dismissBanner">&times;</button>
  </div>
  <div v-else></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { alertsApi } from '../api'

const alerts = ref([])
const dismissed = ref(false)

const criticalAlerts = computed(() => alerts.value.filter(a => a.severity === 'critical'))
const warningAlerts = computed(() => alerts.value.filter(a => a.severity === 'warning'))
const hasCritical = computed(() => criticalAlerts.value.length > 0)
const visibleAlerts = computed(() => alerts.value.slice(0, 2))

function dismissBanner() {
  dismissed.value = true
}

function goToAlert(alert) {
  // Could navigate to account detail later
}

onMounted(async () => {
  try {
    const { data } = await alertsApi.listSilent({ status: 'open', limit: 5 })
    alerts.value = data.results || data || []
  } catch {
    // Silently fail — banner just won't show
  }
})
</script>

<style scoped>
.alerts-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  max-height: 80px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
  margin-bottom: 12px;
}
.alerts-banner.critical {
  background: var(--redBg);
  color: var(--red);
}
.alerts-banner.warning {
  background: #FEF3C7;
  color: #92400E;
}
.alerts-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.alerts-count {
  white-space: nowrap;
  flex-shrink: 0;
}
.alerts-titles {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}
.alert-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  opacity: 0.85;
  font-weight: 500;
  max-width: 200px;
}
.alert-title:hover {
  opacity: 1;
  text-decoration: underline;
}
.alerts-more {
  font-size: 11px;
  opacity: 0.7;
  white-space: nowrap;
}
.alerts-link {
  margin-left: auto;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  color: inherit;
  text-decoration: underline;
  flex-shrink: 0;
}
.alerts-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;
}
</style>
