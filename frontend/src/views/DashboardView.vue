<template>
  <div class="fade-in">
    <!-- KPI Cards -->
    <div class="grid-4 mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
      <KpiCard :label="t('portfolioARR')" :value="fmtARR" icon="💰" color="var(--teal)" />
      <KpiCard :label="t('avgHealth')" :value="avgHealth + '%'" icon="💚" :color="healthColor" />
      <KpiCard label="NPS" :value="company?.nps || 0" icon="📊" color="var(--blue)" />
      <KpiCard label="Churn" :value="(company?.churn || 0) + '%'" icon="📉" :color="churnColor" />
    </div>

    <!-- Risk summary -->
    <div class="grid-3 mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))">
      <AppCard class="card-lift">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 8px">{{ t('healthyPortfolio') }}</div>
        <div class="kpi-value" style="color: var(--green)">{{ healthyCount }}</div>
      </AppCard>
      <AppCard class="card-lift">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 8px">{{ t('monitorClosely') }}</div>
        <div class="kpi-value" style="color: var(--amber)">{{ mediumCount }}</div>
      </AppCard>
      <AppCard class="card-lift">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 8px">{{ t('actionRequired') }}</div>
        <div class="kpi-value" style="color: var(--red)">{{ criticalCount }}</div>
      </AppCard>
    </div>

    <!-- Critical accounts -->
    <AppCard v-if="criticalAccounts.length" class="mb-lg" :danger="true">
      <div class="flex-between mb-sm">
        <span style="font-weight: 800">{{ t('criticalAccounts') }}</span>
        <span class="tag risk-critical">{{ criticalAccounts.length }} {{ t('atRisk') }}</span>
      </div>
      <div v-for="acc in criticalAccounts" :key="acc.id" style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border)">
        <div style="width: 32px; height: 32px; border-radius: 9px; background: var(--redBg); border: 1px solid var(--redBorder); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: var(--red); font-family: 'JetBrains Mono', monospace">
          {{ (acc.name || '?')[0] }}
        </div>
        <div style="flex: 1">
          <div style="font-weight: 700; font-size: 13px">{{ acc.name }}</div>
          <div style="font-size: 11px; color: var(--muted)">{{ acc.csm || t('unassigned') }}</div>
        </div>
        <HealthBar :val="acc.health" style="width: 80px" />
      </div>
    </AppCard>

    <!-- Wellbeing summary (manager only) -->
    <AppCard v-if="authStore.user?.role === 'manager'" class="mb-lg">
      <div class="flex-between mb-sm">
        <span style="font-weight: 800">💚 {{ t('wellbeing') }}</span>
        <span class="tag" :class="wellbeingClass">{{ wellbeing?.score || 70 }}%</span>
      </div>
      <HealthBar :val="wellbeing?.score || 70" />
    </AppCard>

    <!-- No risk -->
    <AppCard v-if="!criticalAccounts.length && accounts.length" :success="true">
      <div style="text-align: center; padding: 20px; font-weight: 700; color: var(--green)">
        ✅ {{ t('noRisk') }}
      </div>
    </AppCard>

    <EmptyState v-if="!accounts.length" icon="🚀" :title="t('portfolioEmpty')" :action="t('viewPortfolio')" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePortfolioStore } from '../stores/portfolio'
import { useI18n } from '../i18n'
import { wellbeingApi } from '../api'
import { ref } from 'vue'
import KpiCard from '../components/KpiCard.vue'
import AppCard from '../components/AppCard.vue'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const { t } = useI18n()
const wellbeing = ref(null)

const company = computed(() => authStore.company)
const accounts = computed(() => portfolioStore.accounts)

onMounted(async () => {
  await portfolioStore.fetchAccounts()
  try {
    const { data } = await wellbeingApi.get()
    wellbeing.value = data
  } catch {}
})

const fmtARR = computed(() => {
  const total = accounts.value.reduce((s, a) => s + (parseFloat(a.arr) || 0), 0)
  const annual = total * 12
  if (annual >= 1000000) return `${(annual / 1000000).toFixed(1)}M€`
  if (annual >= 1000) return `${(annual / 1000).toFixed(0)}K€`
  return `${annual}€`
})

const avgHealth = computed(() => {
  if (!accounts.value.length) return 0
  return Math.round(accounts.value.reduce((s, a) => s + (a.health || 0), 0) / accounts.value.length)
})

const healthColor = computed(() => avgHealth.value >= 70 ? 'var(--green)' : avgHealth.value >= 40 ? 'var(--amber)' : 'var(--red)')
const churnColor = computed(() => (company.value?.churn || 0) > 5 ? 'var(--red)' : 'var(--green)')

const healthyCount = computed(() => accounts.value.filter(a => a.risk === 'low').length)
const mediumCount = computed(() => accounts.value.filter(a => a.risk === 'medium').length)
const criticalCount = computed(() => accounts.value.filter(a => a.risk === 'critical').length)
const criticalAccounts = computed(() => accounts.value.filter(a => a.risk === 'critical'))

const wellbeingClass = computed(() => {
  const s = wellbeing.value?.score || 70
  if (s >= 70) return 'risk-low'
  if (s >= 40) return 'risk-medium'
  return 'risk-critical'
})
</script>
