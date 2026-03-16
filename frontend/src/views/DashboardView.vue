<template>
  <div class="fade-in" style="max-width: 1100px; padding: 6px 6px;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.6px; margin-bottom: 5px;">
          {{ greeting }}
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
        :sub="accounts.length + ' ' + (lang === 'en' ? 'active accounts' : lang === 'kr' ? '활성 계정' : 'comptes actifs')" />
      <KpiCard :label="t('avgHealth')" :value="avgHealth + '/100'" icon="💚" :color="healthColor"
        :sub="healthSub" />
      <KpiCard :label="t('criticalAccounts')" :value="String(criticalCount)" icon="🚨"
        :color="criticalCount === 0 ? 'var(--green)' : 'var(--red)'"
        :sub="criticalSub" />
      <KpiCard :label="'Roadmap ' + (lang === 'en' ? '90D' : lang === 'kr' ? '90일' : '90J')" value="0%"
        icon="🗺" color="var(--teal)" sub="0/0 steps" />
    </div>

    <!-- Critical accounts alert -->
    <div v-if="criticalAccounts.length > 0" class="card card-danger" style="margin-bottom: 18px; padding: 18px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🚨</span>
          <span style="font-weight: 800; font-size: 15px; color: var(--red);">
            {{ criticalAccounts.length }} {{ criticalAlertText }}
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
                {{ Array.isArray(acc.issues) && acc.issues[0] ? acc.issues[0] : defaultIssue }}
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 700; color: var(--red);">{{ fmtAccountARR(acc) }}</div>
            <div style="font-size: 11px; color: var(--muted);">
              {{ lang === 'en' ? 'Renewal ' : lang === 'kr' ? '갱신 ' : 'Renouvellement ' }}{{ acc.renewal || 'N/A' }}
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
              {{ lang === 'en' ? '🗺️ 90-Day Roadmap' : lang === 'kr' ? '🗺️ 90일 로드맵' : '🗺 Roadmap 90J' }}
            </div>
            <div style="font-size: 12px; color: var(--muted);">Phase 1</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">0%</div>
            </div>
            <router-link :to="{ name: 'tasks' }" class="btn-base"
              style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal); text-decoration: none;">
              {{ lang === 'en' ? 'Manage →' : lang === 'kr' ? '관리 →' : 'Gérer →' }}
            </router-link>
          </div>
        </div>
        <HealthBar :val="0" />
        <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 6px;">
          <p style="font-size: 13px; color: var(--muted); text-align: center; padding: 8px;">
            {{ lang === 'en' ? 'No roadmap items yet' : lang === 'kr' ? '아직 로드맵 항목이 없습니다' : 'Aucune étape pour le moment' }}
          </p>
        </div>
      </div>

      <!-- Wellbeing card -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="font-weight: 800; font-size: 15px;">
            {{ lang === 'en' ? '💚 Team Wellbeing' : lang === 'kr' ? '💚 팀 웰빙' : '💚 Bien-être équipe' }}
          </div>
          <router-link :to="{ name: 'wellbeing' }" class="btn-base"
            style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); text-decoration: none;">
            {{ lang === 'kr' ? '상세 →' : lang === 'en' ? 'Detail →' : 'Détail →' }}
          </router-link>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          <div style="text-align: center; background: var(--surface); border-radius: 11px; padding: 13px;">
            <div :style="{ fontSize: '28px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: wellbeingScoreColor }">
              {{ wellbeing?.score || 70 }}
            </div>
            <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">
              {{ lang === 'kr' ? '점수 /100' : 'Score /100' }}
            </div>
          </div>
          <div style="text-align: center; background: var(--surface); border-radius: 11px; padding: 13px;">
            <div :style="{ fontSize: '16px', fontWeight: 800, color: burnoutColor }">
              {{ burnoutLabel }}
            </div>
            <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">
              {{ lang === 'en' ? 'Burnout Risk' : lang === 'kr' ? '번아웃 위험' : 'Risque burnout' }}
            </div>
          </div>
        </div>
        <p v-if="!wellbeing?.team?.length" style="font-size: 12px; color: var(--muted); text-align: center; padding: 8px 0;">
          {{ lang === 'en' ? 'No team members' : lang === 'kr' ? '팀 구성원 없음' : "Aucun membre d'équipe" }}
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
import { wellbeingApi } from '../api'
import KpiCard from '../components/KpiCard.vue'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const prefsStore = usePreferencesStore()
const { t } = useI18n()
const wellbeing = ref(null)

const lang = computed(() => prefsStore.lang)
const company = computed(() => authStore.company)
const accounts = computed(() => portfolioStore.accounts)

onMounted(async () => {
  await portfolioStore.fetchAccounts()
  try {
    const { data } = await wellbeingApi.get()
    wellbeing.value = data
  } catch {}
})

const greeting = computed(() => {
  if (lang.value === 'en') return 'Overview 👋'
  if (lang.value === 'kr') return '개요 👋'
  return "Vue d'ensemble 👋"
})

const todayFormatted = computed(() => {
  const locale = lang.value === 'en' ? 'en-US' : lang.value === 'kr' ? 'ko-KR' : 'fr-FR'
  return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const fmtARR = computed(() => {
  const total = accounts.value.reduce((s, a) => s + (parseFloat(a.mrr || a.arr) || 0), 0)
  const annual = total * 12
  if (annual >= 1000000) return `${(annual / 1000000).toFixed(1)}M€`
  if (annual >= 1000) return `${(annual / 1000).toFixed(0)}K€`
  return `${annual}€`
})

function fmtAccountARR(acc) {
  const mrr = parseFloat(acc.mrr || acc.arr) || 0
  const annual = mrr * 12
  if (annual >= 1000000) return `${(annual / 1000000).toFixed(1)}M€`
  if (annual >= 1000) return `${(annual / 1000).toFixed(0)}K€`
  return `${annual}€`
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
    const fmtRisk = arrRisk >= 1000 ? `${(arrRisk / 1000).toFixed(0)}K€` : `${arrRisk}€`
    return `${fmtRisk} ARR ${t('atRisk')}`
  }
  return t('noRisk')
})

const criticalAlertText = computed(() => {
  const n = criticalAccounts.value.length
  if (lang.value === 'kr') return '계정 위험 상태 — 즉시 조치 필요'
  if (lang.value === 'en') return `account${n > 1 ? 's' : ''} at critical risk — immediate action required`
  return n > 1 ? 'comptes en risque critique — action immédiate requise' : 'compte en risque critique — action immédiate requise'
})

const defaultIssue = computed(() => {
  if (lang.value === 'en') return 'Account in critical situation'
  if (lang.value === 'kr') return '위기 상황 계정'
  return 'Compte en situation critique'
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
  if (plan === 'Elite') return 'rgba(184,168,212,0.2)'
  return 'var(--border)'
})

const roleColorVal = computed(() => authStore.user?.role === 'manager' ? 'var(--purple)' : 'var(--blue)')
const roleBg = computed(() => authStore.user?.role === 'manager' ? 'var(--purpleBg)' : 'var(--blueBg)')
const roleBorder = computed(() => authStore.user?.role === 'manager' ? 'rgba(184,168,212,0.2)' : 'rgba(139,168,196,0.2)')

// Wellbeing
const wellbeingScoreColor = computed(() => {
  const s = wellbeing.value?.score || 70
  if (s >= 70) return 'var(--green)'
  if (s >= 50) return 'var(--amber)'
  return 'var(--red)'
})

const burnoutLevel = computed(() => wellbeing.value?.burnout || 'moderate')
const burnoutColor = computed(() => {
  const b = burnoutLevel.value
  if (b === 'low') return 'var(--green)'
  if (b === 'high') return 'var(--red)'
  return 'var(--amber)'
})
const burnoutLabel = computed(() => {
  const b = burnoutLevel.value
  if (lang.value === 'en') return b === 'low' ? 'Low 🟢' : b === 'high' ? 'High 🔴' : 'Moderate 🟡'
  if (lang.value === 'kr') return b === 'low' ? '낮음 🟢' : b === 'high' ? '높음 🔴' : '보통 🟡'
  return b === 'low' ? 'Faible 🟢' : b === 'high' ? 'Élevé 🔴' : 'Modéré 🟡'
})
</script>
