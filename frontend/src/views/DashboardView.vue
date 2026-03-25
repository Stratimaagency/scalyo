<template>
  <div class="fade-in" style="max-width: 1100px; padding: 26px 30px;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.6px; margin-bottom: 5px;">
          {{ t('overview') }} <ScalyoIcon name="wave" :size="24" style="margin-left: 4px" />
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

    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
      <KpiCard :label="t('portfolioARR')" :value="fmtARR" icon="money" color="var(--teal)"
        :sub="accounts.length + ' ' + t('activeAccounts')" />
      <KpiCard :label="t('avgHealth')" :value="avgHealth + '/100'" icon="heart" :color="healthColor"
        :sub="healthSub" />
      <KpiCard :label="t('criticalAccounts')" :value="String(criticalCount)" icon="siren"
        :color="criticalCount === 0 ? 'var(--green)' : 'var(--red)'"
        :sub="criticalSub" />
      <KpiCard :label="t('roadmap90')" :value="roadmapProgress + '%'"
        icon="map" color="var(--teal)" :sub="roadmapDone + '/' + roadmapTotal + ' ' + t('steps')" />
    </div>

    <!-- Critical accounts alert -->
    <div v-if="criticalAccounts.length > 0" class="card card-danger" style="margin-bottom: 18px; padding: 18px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <ScalyoIcon name="siren" :size="20" />
          <span style="font-weight: 800; font-size: 15px; color: var(--red);">
            {{ criticalAccounts.length }} {{ criticalAccounts.length > 1 ? t('accountsCriticalAlert') : t('accountCriticalAlert') }}
          </span>
        </div>
        <router-link :to="{ name: 'portfolio' }" class="btn-base"
          style="font-size: 12px; padding: 6px 16px; border-radius: 20px; background: var(--redBg); border: 1px solid var(--redBorder); color: var(--red); text-decoration: none;">
          {{ t('viewPortfolio') }}
        </router-link>
      </div>
      <div style="display: flex; flex-direction: column; gap: 7px;">
        <div v-for="acc in criticalAccounts.slice(0, 3)" :key="acc.id"
          style="display: flex; align-items: center; justify-content: space-between; background: rgba(235,87,87,0.06); border-radius: 12px; padding: 10px 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--red); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;">
              {{ (acc.name || '?')[0] }}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px;">{{ acc.name }}</div>
              <div style="font-size: 11px; color: var(--muted);">
                {{ Array.isArray(acc.issues) && acc.issues[0] ? acc.issues[0] : t('criticalSituation') }}
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 700; color: var(--red);">{{ fmtAccountARR(acc) }}</div>
            <div style="font-size: 11px; color: var(--muted);">
              {{ t('renewal') }} {{ acc.renewal || 'N/A' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom grid: Roadmap + Wellbeing -->
    <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px;">
      <!-- Roadmap card -->
      <div class="card card-lift" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 2px;">
              <ScalyoIcon name="map" :size="18" style="margin-right: 4px" /> {{ t('roadmap90Title') }}
            </div>
            <div style="font-size: 12px; color: var(--muted);">{{ roadmapPhase }}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ roadmapProgress }}%</div>
            </div>
            <router-link :to="{ name: 'roadmap' }" class="btn-base"
              style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal); text-decoration: none;">
              {{ t('manageBtn') }} →
            </router-link>
          </div>
        </div>
        <HealthBar :val="roadmapProgress" />
        <!-- Roadmap items preview (up to 4) -->
        <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 6px;">
          <div v-for="(item, i) in roadmapItems.slice(0, 4)" :key="item.id || i"
            style="display: flex; align-items: center; gap: 10px; padding: 8px 11px; border-radius: 9px; background: var(--surface);">
            <ScalyoIcon :name="item.done ? 'check-circle' : 'square'" :size="16" style="flex-shrink: 0" />
            <span style="font-size: 13px; flex: 1;"
              :style="{ color: item.done ? 'var(--muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }">
              {{ item.text || item.label }}
            </span>
          </div>
          <p v-if="!roadmapTotal" style="font-size: 13px; color: var(--muted); text-align: center; padding: 8px;">
            {{ t('noRoadmapItems') }}
          </p>
        </div>
      </div>

      <!-- Wellbeing card -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="font-weight: 800; font-size: 15px;">
            <ScalyoIcon name="heart" :size="18" style="margin-right: 4px" /> {{ t('teamWellbeing') }}
          </div>
          <router-link :to="{ name: 'wellbeing' }" class="btn-base"
            style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); text-decoration: none;">
            {{ t('detailBtn') }} →
          </router-link>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          <div style="text-align: center; background: var(--surface); border-radius: 11px; padding: 13px;">
            <div :style="{ fontSize: '28px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: wellbeingScoreColor }">
              {{ wellbeingScore }}
            </div>
            <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">
              {{ t('scoreLabel') }}
            </div>
          </div>
          <div style="text-align: center; background: var(--surface); border-radius: 11px; padding: 13px;">
            <div :style="{ fontSize: '16px', fontWeight: 800, color: burnoutColor }">
              {{ burnoutLabel }}
            </div>
            <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">
              {{ t('burnoutRisk') }}
            </div>
          </div>
        </div>
        <!-- Team members preview (up to 3) -->
        <div v-for="(m, i) in teamMembers.slice(0, 3)" :key="i"
          style="display: flex; align-items: center; gap: 9px; margin-bottom: 9px;">
          <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;"
            :style="{ background: (m.charge || 70) > 85 ? 'var(--red)' : (m.charge || 70) > 70 ? 'var(--amber)' : 'var(--teal)', color: '#fff' }">
            {{ (m.name || '?')[0] }}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">{{ m.name }}</span>
              <span style="font-size: 11px; font-weight: 700; flex-shrink: 0;"
                :style="{ color: (m.charge || 70) > 85 ? 'var(--red)' : (m.charge || 70) > 70 ? 'var(--amber)' : 'var(--green)' }">
                {{ m.charge || 70 }}%
              </span>
            </div>
            <HealthBar :val="100 - (m.charge || 70)" size="sm" />
          </div>
        </div>
        <p v-if="!teamMembers.length" style="font-size: 12px; color: var(--muted); text-align: center; padding: 8px 0;">
          {{ t('noTeamMembers') }}
        </p>
      </div>
    </div>

    <!-- CSM Team View (manager only) -->
    <div v-if="authStore.user?.role === 'manager' && csmStats.length >= 2" style="margin-top: 20px;">
      <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.3px; display: flex; align-items: center; gap: 6px;">
        <ScalyoIcon name="people" :size="18" /> {{ t('csmTeamView') }}
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;">
        <div v-for="s in csmStats" :key="s.csm"
          style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 8px;">{{ s.csm }}</div>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted); display: flex; align-items: center; gap: 4px;"><ScalyoIcon name="briefcase" :size="13" /> {{ t('accounts') }}</span>
              <span style="font-weight: 700;">{{ s.count }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted); display: flex; align-items: center; gap: 4px;"><ScalyoIcon name="money" :size="13" /> ARR</span>
              <span style="font-weight: 700; color: var(--teal);">{{ fmtCurrency(s.arr) }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted); display: flex; align-items: center; gap: 4px;"><ScalyoIcon name="heart" :size="13" /> Health</span>
              <span style="font-weight: 700;"
                :style="{ color: s.health >= 70 ? 'var(--green)' : s.health >= 40 ? 'var(--amber)' : 'var(--red)' }">
                {{ s.health }}/100
              </span>
            </div>
            <div v-if="s.crit > 0" style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted); display: flex; align-items: center; gap: 4px;"><ScalyoIcon name="siren" :size="13" /> {{ t('filterCritical') }}</span>
              <span style="font-weight: 700; color: var(--red);">{{ s.crit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No risk message -->
    <div v-if="!criticalAccounts.length && accounts.length" class="card" style="margin-top: 14px; border-color: var(--greenBorder);">
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
import { useI18n } from '../i18n'
import { wellbeingApi, roadmapApi } from '../api'
import KpiCard from '../components/KpiCard.vue'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const prefsStore = usePreferencesStore()
const { t } = useI18n()
const wellbeing = ref(null)
const roadmap = ref({ phase: '', progress: 0, items: [] })

const lang = computed(() => prefsStore.lang)
const company = computed(() => authStore.company)
const accounts = computed(() => portfolioStore.accounts)

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
  try {
    const { data } = await wellbeingApi.get()
    wellbeing.value = data
  } catch (e) {
    console.warn('Dashboard: wellbeing load failed', e.message)
  }
  try {
    const { data } = await roadmapApi.get()
    if (data) {
      roadmap.value = {
        phase: data.phase || t('roadmapPhaseDefault'),
        progress: data.progress || 0,
        items: Array.isArray(data.items) ? data.items : [],
      }
    }
  } catch (e) {
    console.warn('Dashboard: roadmap load failed', e.message)
  }
})

const todayFormatted = computed(() => {
  const locale = lang.value === 'en' ? 'en-US' : lang.value === 'kr' ? 'ko-KR' : 'fr-FR'
  return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// Roadmap
const roadmapProgress = computed(() => roadmap.value.progress)
const roadmapPhase = computed(() => roadmap.value.phase || t('roadmapPhaseDefault'))
const roadmapTotal = computed(() => roadmap.value.items.length)
const roadmapDone = computed(() => roadmap.value.items.filter(i => i.done).length)
const roadmapItems = computed(() => roadmap.value.items)

// Portfolio
const fmtARR = computed(() => {
  const total = accounts.value.reduce((s, a) => s + (parseFloat(a.mrr || a.arr) || 0), 0)
  return fmtCurrency(total * 12)
})

function fmtAccountARR(acc) {
  const mrr = parseFloat(acc.mrr || acc.arr) || 0
  return fmtCurrency(mrr * 12)
}

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

const criticalCount = computed(() => accounts.value.filter(a => a.risk === 'critical').length)
const criticalAccounts = computed(() => accounts.value.filter(a => a.risk === 'critical'))

const criticalSub = computed(() => {
  if (criticalCount.value > 0) {
    const arrRisk = criticalAccounts.value.reduce((s, a) => s + (parseFloat(a.mrr || a.arr) || 0), 0) * 12
    const fmtRisk = fmtCurrency(arrRisk)
    return `${fmtRisk} ARR ${t('atRisk')}`
  }
  return t('noRisk')
})

// Wellbeing - default to 70 as in reference
const wellbeingScore = computed(() => wellbeing.value?.score || 70)
const teamMembers = computed(() => {
  const team = wellbeing.value?.team
  return Array.isArray(team) ? team : []
})

const wellbeingScoreColor = computed(() => {
  const s = wellbeingScore.value
  if (s >= 70) return 'var(--green)'
  if (s >= 50) return 'var(--amber)'
  return 'var(--red)'
})

const burnoutLevel = computed(() => wellbeing.value?.burnout || 'none')
const burnoutColor = computed(() => {
  const b = burnoutLevel.value
  if (b === 'low') return 'var(--green)'
  if (b === 'high') return 'var(--red)'
  return 'var(--amber)'
})
const burnoutLabel = computed(() => {
  const b = burnoutLevel.value
  const key = b === 'low' ? 'burnoutLow' : b === 'high' ? 'burnoutHigh' : b === 'moderate' ? 'burnoutModerate' : 'burnoutNone'
  return t(key)
})

// CSM team view (manager only)
const csmStats = computed(() => {
  const csms = [...new Set(accounts.value.map(a => a.csm).filter(Boolean))]
  return csms.map(csm => {
    const acc = accounts.value.filter(a => a.csm === csm)
    const arr = acc.reduce((s, a) => s + (parseFloat(a.mrr || a.arr) || 0) * 12, 0)
    const health = acc.length ? Math.round(acc.reduce((s, a) => s + (a.health || 70), 0) / acc.length) : 0
    const crit = acc.filter(a => a.risk === 'critical').length
    return { csm, count: acc.length, arr, health, crit }
  })
})

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
