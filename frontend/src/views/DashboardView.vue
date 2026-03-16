<template>
  <div class="fade-in" style="max-width: 1100px; padding: 6px 6px;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.6px; margin-bottom: 5px;">
          {{ t('overview') }} 👋
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
      <KpiCard :label="t('portfolioARR')" :value="fmtARR" icon="💰" color="var(--teal)"
        :sub="accounts.length + ' ' + t('activeAccounts')" />
      <KpiCard :label="t('avgHealth')" :value="avgHealth + '/100'" icon="💚" :color="healthColor"
        :sub="healthSub" />
      <KpiCard :label="t('criticalAccounts')" :value="String(criticalCount)" icon="🚨"
        :color="criticalCount === 0 ? 'var(--green)' : 'var(--red)'"
        :sub="criticalSub" />
      <KpiCard :label="t('roadmap90')" :value="roadmapProgress + '%'"
        icon="🗺" color="var(--teal)" :sub="roadmapDone + '/' + roadmapTotal + ' ' + t('steps')" />
    </div>

    <!-- Critical accounts alert -->
    <div v-if="criticalAccounts.length > 0" class="card card-danger" style="margin-bottom: 18px; padding: 18px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🚨</span>
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
            <div class="avatar" :style="{ width: '32px', height: '32px', background: 'var(--red)', color: '#fff', fontSize: '13px' }">
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
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 2px;">
              🗺️ {{ t('roadmap90Title') }}
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
        <div v-if="!roadmapTotal" style="margin-top: 14px; display: flex; flex-direction: column; gap: 6px;">
          <p style="font-size: 13px; color: var(--muted); text-align: center; padding: 8px;">
            {{ t('noRoadmapItems') }}
          </p>
        </div>
      </div>

      <!-- Wellbeing card -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="font-weight: 800; font-size: 15px;">
            💚 {{ t('teamWellbeing') }}
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
        <p v-if="!wellbeing?.team?.length" style="font-size: 12px; color: var(--muted); text-align: center; padding: 8px 0;">
          {{ t('noTeamMembers') }}
        </p>
      </div>
    </div>

    <!-- No risk message -->
    <div v-if="!criticalAccounts.length && accounts.length" class="card" style="margin-top: 14px; border-color: var(--greenBorder);">
      <div style="text-align: center; padding: 20px; font-weight: 700; color: var(--green);">
        ✅ {{ t('noRisk') }}
      </div>
    </div>

    <EmptyState v-if="!accounts.length" icon="🚀" :title="t('portfolioEmpty')" :action="t('viewPortfolio')" />
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
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${s}`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K${s}`
  return `${value}${s}`
}

onMounted(async () => {
  await portfolioStore.fetchAccounts()
  try {
    const { data } = await wellbeingApi.get()
    wellbeing.value = data
  } catch {}
  try {
    const { data } = await roadmapApi.get()
    if (data) {
      roadmap.value = {
        phase: data.phase || t('roadmapPhaseDefault'),
        progress: data.progress || 0,
        items: Array.isArray(data.items) ? data.items : [],
      }
    }
  } catch {}
})

const todayFormatted = computed(() => {
  const locale = lang.value === 'en' ? 'en-US' : lang.value === 'kr' ? 'ko-KR' : 'fr-FR'
  return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// Roadmap computeds - bound to real data
const roadmapProgress = computed(() => roadmap.value.progress)
const roadmapPhase = computed(() => roadmap.value.phase || t('roadmapPhaseDefault'))
const roadmapTotal = computed(() => roadmap.value.items.length)
const roadmapDone = computed(() => roadmap.value.items.filter(i => i.done).length)

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
  return Math.round(accounts.value.reduce((s, a) => s + (a.health || 0), 0) / accounts.value.length)
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

// Wellbeing
const wellbeingScore = computed(() => wellbeing.value?.score ?? 0)

const wellbeingScoreColor = computed(() => {
  const s = wellbeingScore.value
  if (s >= 70) return 'var(--green)'
  if (s >= 50) return 'var(--amber)'
  return 'var(--red)'
})

const burnoutLevel = computed(() => wellbeing.value?.burnout || 'none')
const burnoutColor = computed(() => {
  const b = burnoutLevel.value
  if (b === 'low' || b === 'none') return 'var(--green)'
  if (b === 'high') return 'var(--red)'
  return 'var(--amber)'
})
const burnoutLabel = computed(() => {
  const b = burnoutLevel.value
  const key = b === 'low' ? 'burnoutLow' : b === 'high' ? 'burnoutHigh' : b === 'moderate' ? 'burnoutModerate' : 'burnoutNone'
  const emoji = b === 'low' || b === 'none' ? ' 🟢' : b === 'high' ? ' 🔴' : ' 🟡'
  return t(key) + emoji
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
