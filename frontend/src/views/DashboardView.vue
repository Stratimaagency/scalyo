<template>
  <div class="fade-in" style="max-width: 1100px; padding: 26px 30px;">
    <!-- Welcome Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.6px; margin-bottom: 5px;">
          {{ greeting }}, {{ userName }} <ScalyoIcon name="wave" :size="24" style="margin-left: 4px" />
        </h1>
        <p style="color: var(--muted); font-size: 13px;">{{ company?.name }} · {{ todayFormatted }}</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <span class="tag" :style="{ background: planBg, color: planColorVal, border: '1px solid ' + planBorder }">
          {{ company?.plan || 'Starter' }}
        </span>
        <span class="tag" :style="{ background: roleBg, color: roleColorVal, border: '1px solid ' + roleBorder }">
          {{ authStore.user?.role === 'manager' ? t('csManager') : 'CSM' }}
        </span>
      </div>
    </div>

    <!-- Today's Focus -->
    <div v-if="focusItems.length" class="card" style="margin-bottom: 18px; padding: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
        <ScalyoIcon name="target" :size="18" />
        <span style="font-weight: 800; font-size: 15px;">{{ t('dashTodayFocus') }}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div v-for="(item, i) in focusItems" :key="i"
          style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: var(--surface); cursor: pointer; transition: opacity .15s;"
          @click="item.route && $router.push(item.route)">
          <ScalyoIcon :name="item.icon" :size="16" style="flex-shrink: 0;" />
          <span style="font-size: 13px; font-weight: 600; flex: 1;">{{ item.label }}</span>
          <span style="font-size: 12px; color: var(--muted);">→</span>
        </div>
      </div>
    </div>
    <div v-else-if="accounts.length" class="card" style="margin-bottom: 18px; padding: 18px; text-align: center;">
      <ScalyoIcon name="check-circle" :size="18" style="margin-right: 4px" />
      <span style="font-weight: 700; color: var(--green);">{{ t('dashNoPriority') }}</span>
    </div>

    <!-- KPI Cards -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
      <span style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em;">KPIs</span>
      <div style="position: relative;">
        <button @click="showKpiSettings = !showKpiSettings"
          style="background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center;">
          <ScalyoIcon name="gear" :size="16" />
        </button>
        <div v-if="showKpiSettings"
          style="position: absolute; right: 0; top: 28px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; z-index: 10; min-width: 180px; box-shadow: 0 4px 16px rgba(0,0,0,.08);">
          <label v-for="kpi in allKpis" :key="kpi.key"
            style="display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 12px; cursor: pointer;">
            <input type="checkbox" :checked="visibleKpis.includes(kpi.key)" @change="toggleKpi(kpi.key)" />
            {{ kpi.label }}
          </label>
        </div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px;">
      <KpiCard v-for="kpi in displayedKpis" :key="kpi.key"
        :label="kpi.label" :value="kpi.value" :icon="kpi.icon" :color="kpi.color" :sub="kpi.sub" />
    </div>

    <!-- Client Health Overview + My Tasks -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
      <!-- Client Health Overview -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 6px;">
            <ScalyoIcon name="heart" :size="18" />
            {{ t('dashClientHealth') }}
          </div>
          <router-link :to="{ name: 'health-tracker' }" class="btn-base"
            style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); text-decoration: none;">
            {{ t('dashGoToHealthTracker') }} →
          </router-link>
        </div>
        <!-- Distribution bar -->
        <div v-if="accounts.length" style="margin-bottom: 14px;">
          <div style="display: flex; height: 10px; border-radius: 5px; overflow: hidden; gap: 2px;">
            <div :style="{ flex: healthyCount, background: 'var(--green)' }"></div>
            <div :style="{ flex: neutralCount, background: 'var(--amber)' }"></div>
            <div :style="{ flex: criticalCount || 0.01, background: 'var(--red)' }"></div>
          </div>
          <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 12px;">
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--green);"></span>
              {{ t('dashHealthy') }} {{ healthyCount }}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--amber);"></span>
              {{ t('dashNeutral') }} {{ neutralCount }}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--red);"></span>
              {{ t('dashAtRisk') }} {{ criticalCount }}
            </span>
          </div>
        </div>
        <!-- Top 3 at-risk -->
        <div v-if="criticalAccounts.length" style="margin-top: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--red); margin-bottom: 8px;">{{ t('dashTopAtRisk') }}</div>
          <div v-for="acc in criticalAccounts.slice(0, 3)" :key="acc.id"
            style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 9px; background: var(--surface); margin-bottom: 5px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--red); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">
                {{ (acc.name || '?')[0] }}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 12px;">{{ acc.name }}</div>
                <div style="font-size: 11px; color: var(--muted);">{{ acc.csm || '—' }}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: 700; color: var(--red);">{{ acc.health || 0 }}/100</div>
              <div style="font-size: 10px; color: var(--muted);">{{ t('renewal') }} {{ acc.renewal || 'N/A' }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="accounts.length" style="text-align: center; padding: 12px; color: var(--green); font-weight: 700; font-size: 13px;">
          <ScalyoIcon name="check-circle" :size="16" style="margin-right: 4px" /> {{ t('noRisk') }}
        </div>
      </div>

      <!-- My Tasks -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 6px;">
            <ScalyoIcon name="clipboard" :size="18" />
            {{ t('dashMyTasks') }}
          </div>
          <router-link :to="{ name: 'tasks' }" class="btn-base"
            style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); text-decoration: none;">
            {{ t('dashSeeAll') }} →
          </router-link>
        </div>
        <div v-if="myTasks.length" style="display: flex; flex-direction: column; gap: 5px;">
          <div v-for="task in myTasks.slice(0, 8)" :key="task.id || task.name"
            style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 9px; background: var(--surface); cursor: pointer;"
            @click="$router.push({ name: 'tasks' })">
            <span style="width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;"
              :style="{ background: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--green)' }"></span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ task.name || task.title }}</div>
              <div style="font-size: 11px; color: var(--muted);">{{ task.projectName || '' }}</div>
            </div>
            <div v-if="task.due || task.dueDate" style="font-size: 11px; color: var(--muted); flex-shrink: 0;">
              {{ task.due || task.dueDate }}
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 20px; color: var(--muted); font-size: 13px;">
          {{ t('dashNoTasks') }}
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px;">
        {{ t('dashQuickActions') }}
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="dash-action-btn" @click="$router.push({ name: 'tasks' })">
          <ScalyoIcon name="clipboard" :size="15" /> {{ t('dashNewTask') }}
        </button>
        <button class="dash-action-btn" @click="$router.push({ name: 'portfolio' })">
          <ScalyoIcon name="briefcase" :size="15" /> {{ t('dashAddClient') }}
        </button>
        <button class="dash-action-btn" @click="$router.push({ name: 'portfolio' })">
          <ScalyoIcon name="upload" :size="15" /> {{ t('dashImportData') }}
        </button>
        <button class="dash-action-btn" @click="$router.push({ name: 'portfolio' })">
          <ScalyoIcon name="briefcase" :size="15" /> {{ t('dashViewPortfolio') }}
        </button>
      </div>
    </div>

    <!-- No risk message -->
    <div v-if="!criticalAccounts.length && accounts.length" class="card" style="border-color: var(--greenBorder);">
      <div style="text-align: center; padding: 20px; font-weight: 700; color: var(--green);">
        <ScalyoIcon name="check-circle" :size="18" style="margin-right: 4px" /> {{ t('noRisk') }}
      </div>
    </div>

    <!-- Health score methodology -->
    <div v-if="accounts.length" class="card" style="margin-top: 14px; padding: 18px;">
      <details>
        <summary style="cursor: pointer; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px; user-select: none;">
          <ScalyoIcon name="lightbulb" :size="16" />
          {{ t('healthMethodTitle') }}
        </summary>
        <p style="font-size: 12px; color: var(--muted); line-height: 1.7; margin-top: 10px;">
          {{ t('healthMethodDesc') }}
        </p>
      </details>
    </div>

    <EmptyState v-if="!accounts.length" icon="rocket" :title="t('portfolioEmpty')" :action="t('viewPortfolio')" @action="$router.push({ name: 'portfolio' })" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePortfolioStore } from '../stores/portfolio'
import { usePreferencesStore } from '../stores/preferences'
import { useSmartMatriceStore } from '../stores/smartMatrice'
import { useI18n } from '../i18n'
import { wellbeingApi } from '../api'
import KpiCard from '../components/KpiCard.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const prefsStore = usePreferencesStore()
const smStore = useSmartMatriceStore()
const { t } = useI18n()

const showKpiSettings = ref(false)
const visibleKpis = ref(['arr', 'health', 'critical', 'nps', 'churn', 'active'])

const lang = computed(() => prefsStore.lang)
const company = computed(() => authStore.company)
const accounts = computed(() => portfolioStore.accounts)
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || '')

// Greeting based on time of day
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return t('dashGreetingMorning')
  if (h < 18) return t('dashGreetingAfternoon')
  return t('dashGreetingEvening')
})

const currencySymbol = computed(() => {
  const c = prefsStore.currency
  if (c === 'USD') return '$'
  if (c === 'GBP') return '£'
  if (c === 'CHF') return 'CHF'
  if (c === 'CAD') return 'CA$'
  return '€'
})

function fmtCurrency(value) {
  const s = currencySymbol.value
  const before = ['$', '£', 'CA$'].includes(s)
  const fmt = (n) => before ? `${s}${n}` : `${n}${s}`
  if (value >= 1000000) return fmt(`${(value / 1000000).toFixed(1)}M`)
  if (value >= 1000) return fmt(`${(value / 1000).toFixed(0)}K`)
  return fmt(value)
}

onMounted(async () => {
  await portfolioStore.fetchAccounts()
  try { await smStore.fetchProjects() } catch (e) { console.warn('Dashboard: SM projects load failed', e.message) }
})

const todayFormatted = computed(() => {
  const locale = lang.value === 'en' ? 'en-US' : lang.value === 'kr' ? 'ko-KR' : 'fr-FR'
  return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// Portfolio metrics
const totalARR = computed(() => {
  return accounts.value.reduce((s, a) => s + (parseFloat(a.mrr || a.arr) || 0), 0) * 12
})
const fmtARR = computed(() => fmtCurrency(totalARR.value))

const avgHealth = computed(() => {
  if (!accounts.value.length) return 0
  return Math.round(accounts.value.reduce((s, a) => s + (a.health || 70), 0) / accounts.value.length)
})

const healthColor = computed(() => avgHealth.value >= 70 ? 'var(--green)' : avgHealth.value >= 40 ? 'var(--amber)' : 'var(--red)')

const healthSub = computed(() => {
  if (avgHealth.value >= 70) return t('healthyPortfolio')
  if (avgHealth.value >= 40) return t('monitorClosely')
  return t('actionRequired')
})

const criticalCount = computed(() => accounts.value.filter(a => a.risk === 'critical' || (a.health || 70) < 60).length)
const criticalAccounts = computed(() => accounts.value.filter(a => a.risk === 'critical' || (a.health || 70) < 60))
const healthyCount = computed(() => accounts.value.filter(a => (a.health || 70) >= 75).length)
const neutralCount = computed(() => accounts.value.filter(a => {
  const h = a.health || 70
  return h >= 60 && h < 75
}).length)

const criticalSub = computed(() => {
  if (criticalCount.value > 0) {
    const arrRisk = criticalAccounts.value.reduce((s, a) => s + (parseFloat(a.mrr || a.arr) || 0), 0) * 12
    return `${fmtCurrency(arrRisk)} ARR ${t('atRisk')}`
  }
  return t('noRisk')
})

// Tasks from SM store
const myTasks = computed(() => {
  const allTasks = []
  for (const pid in smStore.tasks) {
    const project = smStore.projects.find(p => p.id === pid || p.id === Number(pid))
    const projectName = project?.name || ''
    for (const task of (smStore.tasks[pid] || [])) {
      if (task.status === 'done') continue
      allTasks.push({ ...task, projectName })
    }
  }
  // Sort: in_progress first, then by priority
  return allTasks.sort((a, b) => {
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
    if (b.status === 'in_progress' && a.status !== 'in_progress') return 1
    const prio = { high: 0, medium: 1, low: 2 }
    return (prio[a.priority] || 2) - (prio[b.priority] || 2)
  })
})

// Upcoming renewals (next 30 days)
const upcomingRenewals = computed(() => {
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 86400000)
  return accounts.value.filter(a => {
    if (!a.renewal) return false
    const d = new Date(a.renewal)
    return d >= now && d <= in30
  })
})

// Today's focus items
const focusItems = computed(() => {
  const items = []
  const todayStr = new Date().toISOString().slice(0, 10)

  // Tasks due today
  const dueTodayCount = myTasks.value.filter(t => t.due === todayStr || t.dueDate === todayStr).length
  if (dueTodayCount) {
    items.push({ icon: 'clipboard', label: `${dueTodayCount} ${t('dashTasksDueToday')}`, route: { name: 'tasks' } })
  }

  // Overdue tasks
  const overdueCount = myTasks.value.filter(t => {
    const d = t.due || t.dueDate
    return d && d < todayStr
  }).length
  if (overdueCount) {
    items.push({ icon: 'warning', label: `${overdueCount} ${t('dashOverdueTasks')}`, route: { name: 'tasks' } })
  }

  // Upcoming renewals
  if (upcomingRenewals.value.length) {
    items.push({ icon: 'calendar', label: `${upcomingRenewals.value.length} ${t('dashUpcomingRenewals')}`, route: { name: 'portfolio' } })
  }

  // Critical clients
  if (criticalCount.value) {
    items.push({ icon: 'siren', label: `${criticalCount.value} ${t('dashCriticalClients')}`, route: { name: 'health-tracker' } })
  }

  return items
})

// KPI definitions
const allKpis = computed(() => [
  { key: 'arr', label: t('portfolioARR'), value: fmtARR.value, icon: 'money', color: 'var(--teal)', sub: accounts.value.length + ' ' + t('activeAccounts') },
  { key: 'health', label: t('avgHealth'), value: avgHealth.value + '/100', icon: 'heart', color: healthColor.value, sub: healthSub.value },
  { key: 'critical', label: t('criticalAccounts'), value: String(criticalCount.value), icon: 'siren', color: criticalCount.value === 0 ? 'var(--green)' : 'var(--red)', sub: criticalSub.value },
  { key: 'nps', label: t('dashNps'), value: '—', icon: 'star', color: 'var(--teal)', sub: '' },
  { key: 'churn', label: t('dashChurnRate'), value: '—', icon: 'chart-up', color: 'var(--green)', sub: '' },
  { key: 'active', label: t('dashActiveAccounts'), value: String(accounts.value.length), icon: 'briefcase', color: 'var(--teal)', sub: fmtARR.value + ' ARR' },
])

const displayedKpis = computed(() => allKpis.value.filter(k => visibleKpis.value.includes(k.key)))

function toggleKpi(key) {
  const idx = visibleKpis.value.indexOf(key)
  if (idx >= 0) visibleKpis.value.splice(idx, 1)
  else visibleKpis.value.push(key)
}

// Plan tag styling
const planColorVal = computed(() => {
  const plan = company.value?.plan || 'Starter'
  if (plan === 'Growth') return 'var(--teal)'
  if (plan === 'Elite') return 'var(--purple)'
  return 'var(--muted)'
})
const planBg = computed(() => {
  const plan = company.value?.plan || 'Starter'
  if (plan === 'Growth') return 'var(--tealBg)'
  if (plan === 'Elite') return 'var(--purpleBg)'
  return 'var(--surface)'
})
const planBorder = computed(() => {
  const plan = company.value?.plan || 'Starter'
  if (plan === 'Growth') return 'var(--tealBorder)'
  if (plan === 'Elite') return 'var(--purpleBorder, rgba(184,168,212,0.2))'
  return 'var(--border)'
})

const roleColorVal = computed(() => authStore.user?.role === 'manager' ? 'var(--purple)' : 'var(--blue)')
const roleBg = computed(() => authStore.user?.role === 'manager' ? 'var(--purpleBg)' : 'var(--blueBg)')
const roleBorder = computed(() => authStore.user?.role === 'manager' ? 'var(--purpleBorder, rgba(184,168,212,0.2))' : 'var(--blueBorder, rgba(139,168,196,0.2))')
</script>

<style scoped>
.dash-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}
.dash-action-btn:hover {
  background: var(--tealBg);
  border-color: var(--tealBorder);
  color: var(--teal);
}
</style>
