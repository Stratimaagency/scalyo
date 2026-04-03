<template>
  <div class="fade-in" style="max-width: 1100px; padding: 26px 30px;">

    <!-- Team Health Header -->
    <div class="card" style="padding: 24px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h1 style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
          <ScalyoIcon name="people" :size="22" />
          {{ t('mgrTeamHealth') }}
        </h1>
        <p style="color: var(--muted); font-size: 13px;">{{ todayStr }}</p>
      </div>
      <div style="display: flex; gap: 24px; align-items: center;">
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: 900; font-family: 'DM Sans', sans-serif;"
            :style="{ color: scoreColor(d.avgHealthScore) }">{{ d.avgHealthScore }}</div>
          <div style="font-size: 11px; color: var(--muted); font-weight: 600;">{{ t('mgrGlobalHealth') }}</div>
        </div>
        <div style="width: 1px; height: 40px; background: var(--border);"></div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 900; color: var(--teal); font-family: 'DM Sans', sans-serif;">{{ fmtCurrency(d.totalARR) }}</div>
          <div style="font-size: 11px; color: var(--muted); font-weight: 600;">ARR</div>
        </div>
        <div style="width: 1px; height: 40px; background: var(--border);"></div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 900; font-family: 'DM Sans', sans-serif;">{{ d.totalClients }}</div>
          <div style="font-size: 11px; color: var(--muted); font-weight: 600;">{{ t('mgrTotalClients') }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;">
      <select v-model="filterCSM" style="border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 600; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none;">
        <option value="">{{ t('mgrAllCSMs') }}</option>
        <option v-for="csm in csmStore.workloadByCSM" :key="csm.id" :value="csm.name">{{ csm.name }}</option>
      </select>
      <select v-model="filterStress" style="border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 600; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none;">
        <option value="">{{ t('mgrAllStress') }}</option>
        <option value="high">🔴 {{ t('mgrStressBurnout') }}</option>
        <option value="medium">🟡 {{ t('mgrStressAttention') }}</option>
        <option value="low">🟢 {{ t('mgrStressGood') }}</option>
      </select>
      <select v-model="filterRisk" style="border: 1px solid var(--border); background: var(--surface); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 600; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none;">
        <option value="">{{ t('mgrAllRisk') }}</option>
        <option value="at-risk">⚠️ {{ t('mgrAtRisk') }}</option>
        <option value="healthy">✅ {{ t('mgrHealthyClients') }}</option>
      </select>
      <button v-if="filterCSM || filterStress || filterRisk" @click="filterCSM = ''; filterStress = ''; filterRisk = ''"
        style="border: none; background: none; color: var(--muted); font-size: 11px; cursor: pointer; font-weight: 600;">✕ {{ t('mgrClearFilters') }}</button>
    </div>

    <!-- Team Wellbeing Section -->
    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <ScalyoIcon name="heart" :size="18" />
        <h2 style="font-size: 16px; font-weight: 800; letter-spacing: -0.3px;">{{ t('mgrTeamWellbeing') }}</h2>
      </div>
      <div v-if="filteredWellbeing.length" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
        <div v-for="member in filteredWellbeing" :key="member.id || member.name"
          class="card card-lift" style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;"
              :style="{ background: stressColor(member.stressLevel) }">
              {{ (member.name || '?')[0] }}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px;">{{ member.name }}</div>
              <div style="font-size: 11px; color: var(--muted);">{{ member.role || 'CSM' }}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted);">{{ t('mgrWellbeingScore') }}</span>
              <span style="font-weight: 700;" :style="{ color: wellbeingColor(member.wellbeingScore) }">{{ member.wellbeingScore || '—' }}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted);">{{ t('mgrStressLevel') }}</span>
              <span style="font-weight: 700;" :style="{ color: stressColor(member.stressLevel) }">{{ stressLabel(member.stressLevel) }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted);">{{ t('mgrWorkload') }}</span>
              <span style="font-weight: 700;" :style="{ color: loadColor(member.workloadPct) }">{{ member.workloadPct || 0 }}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--muted);">{{ t('mgrAtRiskClients') }}</span>
              <span style="font-weight: 700;" :style="{ color: member.atRiskCount > 0 ? 'var(--red)' : 'var(--green)' }">{{ member.atRiskCount || 0 }}</span>
            </div>
            <!-- Workload bar -->
            <div style="height: 4px; border-radius: 2px; background: var(--surface); overflow: hidden;">
              <div :style="{ width: (member.workloadPct || 0) + '%', height: '100%', borderRadius: '2px', background: loadGrad(member.workloadPct || 0), transition: 'width .3s' }"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="card" style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px;">
        {{ t('mgrNoTeamData') }}
      </div>
    </div>

    <!-- CSM Performance Table -->
    <div class="card" style="padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <h3 style="font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
          <ScalyoIcon name="people" :size="18" /> {{ t('mgrCsmPerformance') }}
        </h3>
        <router-link :to="{ name: 'workload' }" class="btn-base"
          style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); text-decoration: none;">
          {{ t('mgrSeeDetail') }} →
        </router-link>
      </div>
      <div v-if="csmPerf.length" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border);">
              <th style="text-align: left; padding: 8px 12px; font-weight: 700; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; cursor: pointer;" @click="sortBy('name')">{{ t('mgrColCsm') }}</th>
              <th style="text-align: center; padding: 8px 12px; font-weight: 700; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; cursor: pointer;" @click="sortBy('clientCount')">{{ t('mgrColClients') }}</th>
              <th style="text-align: center; padding: 8px 12px; font-weight: 700; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; cursor: pointer;" @click="sortBy('avgHealth')">{{ t('mgrColAvgHealth') }}</th>
              <th style="text-align: center; padding: 8px 12px; font-weight: 700; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; cursor: pointer;" @click="sortBy('atRiskCount')">{{ t('mgrColAtRisk') }}</th>
              <th style="text-align: right; padding: 8px 12px; font-weight: 700; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; cursor: pointer;" @click="sortBy('arr')">{{ t('mgrColArr') }}</th>
              <th style="text-align: center; padding: 8px 12px; font-weight: 700; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; cursor: pointer;" @click="sortBy('workloadPct')">{{ t('mgrColWorkload') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="csm in sortedCsmPerf" :key="csm.id || csm.name"
              style="border-bottom: 1px solid var(--border); transition: background .1s; cursor: pointer;"
              @mouseenter="$event.currentTarget.style.background = 'var(--surface)'"
              @mouseleave="$event.currentTarget.style.background = 'transparent'">
              <td style="padding: 10px 12px; font-weight: 700;">{{ csm.name }}</td>
              <td style="padding: 10px 12px; text-align: center;">{{ csm.clientCount }}</td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 700;" :style="{ color: scoreColor(csm.avgHealth) }">{{ csm.avgHealth }}</td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 700;" :style="{ color: csm.atRiskCount > 0 ? 'var(--red)' : 'var(--text)' }">{{ csm.atRiskCount }}</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: var(--teal);">{{ fmtCurrency(csm.arr) }}</td>
              <td style="padding: 10px 12px; text-align: center;">
                <div style="display: flex; align-items: center; gap: 6px; justify-content: center;">
                  <div style="width: 50px; height: 5px; border-radius: 3px; background: var(--surface); overflow: hidden;">
                    <div :style="{ width: csm.workloadPct + '%', height: '100%', borderRadius: '3px', background: loadGrad(csm.workloadPct) }"></div>
                  </div>
                  <span style="font-size: 11px; font-weight: 700;" :style="{ color: loadColor(csm.workloadPct) }">{{ csm.workloadPct }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align: center; padding: 20px; color: var(--muted); font-size: 13px;">{{ t('mgrNoCSMData') }}</div>
    </div>

    <!-- Portfolio Overview + Alerts -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <!-- Portfolio Overview -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            <ScalyoIcon name="heart" :size="18" /> {{ t('mgrPortfolioOverview') }}
          </h3>
          <router-link :to="{ name: 'health-tracker' }" class="btn-base"
            style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); text-decoration: none;">
            {{ t('mgrSeeAll') }} →
          </router-link>
        </div>
        <!-- Donut-like distribution -->
        <div v-if="clientsStore.clients.length" style="margin-bottom: 16px;">
          <div style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; gap: 2px;">
            <div :style="{ flex: clientsStore.healthyClients.length || 0.01, background: 'var(--green)' }"></div>
            <div :style="{ flex: clientsStore.neutralClients.length || 0.01, background: 'var(--amber)' }"></div>
            <div :style="{ flex: clientsStore.atRiskClients.length || 0.01, background: 'var(--red)' }"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px;">
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--green);"></span>
              {{ t('dashHealthy') }} {{ clientsStore.healthyClients.length }}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--amber);"></span>
              {{ t('dashNeutral') }} {{ clientsStore.neutralClients.length }}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--red);"></span>
              {{ t('dashAtRisk') }} {{ clientsStore.atRiskClients.length }}
            </span>
          </div>
        </div>
        <!-- KPI summary -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          <div style="text-align: center; background: var(--surface); border-radius: 10px; padding: 12px;">
            <div style="font-size: 20px; font-weight: 900; color: var(--teal);">{{ fmtCurrency(d.totalARR) }}</div>
            <div style="font-size: 10px; color: var(--muted);">ARR</div>
          </div>
          <div style="text-align: center; background: var(--surface); border-radius: 10px; padding: 12px;">
            <div style="font-size: 20px; font-weight: 900;">{{ d.avgHealthScore }}</div>
            <div style="font-size: 10px; color: var(--muted);">{{ t('mgrHealthScore') }}</div>
          </div>
          <div style="text-align: center; background: var(--surface); border-radius: 10px; padding: 12px;">
            <div style="font-size: 20px; font-weight: 900; color: var(--red);">{{ d.atRiskCount }}</div>
            <div style="font-size: 10px; color: var(--muted);">{{ t('mgrAtRisk') }}</div>
          </div>
        </div>
        <!-- Top 5 at-risk accounts -->
        <div v-if="clientsStore.atRiskClients.length">
          <div style="font-size: 12px; font-weight: 700; color: var(--red); margin-bottom: 8px;">{{ t('mgrTopAtRiskAccounts') }}</div>
          <div v-for="c in clientsStore.atRiskClients.slice(0, 5)" :key="c.id"
            style="display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--red); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700;">
                {{ (c.name || '?')[0] }}
              </div>
              <span style="font-weight: 700;">{{ c.name }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 11px; color: var(--muted);">{{ c.csmName || '—' }}</span>
              <span style="font-weight: 700;" :style="{ color: scoreColor(c.healthScore) }">{{ c.healthScore }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Panel -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
          <ScalyoIcon name="siren" :size="18" />
          <h3 style="font-size: 15px; font-weight: 800;">{{ t('mgrAlertsPanel') }}</h3>
          <span v-if="d.alerts.length" style="background: var(--red); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">
            {{ d.alerts.length }}
          </span>
        </div>
        <div v-if="d.alerts.length" style="display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto;">
          <div v-for="(alert, i) in d.alerts" :key="i"
            style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--surface); cursor: pointer; transition: opacity .15s;"
            @click="alert.route && $router.push(alert.route)">
            <ScalyoIcon :name="alert.type === 'overload' ? 'fire' : alert.type === 'at-risk' ? 'siren' : 'calendar'" :size="16" style="flex-shrink: 0; margin-top: 1px;" />
            <span style="font-size: 12px; line-height: 1.4;">{{ alert.message }}</span>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 30px; color: var(--green); font-weight: 700; font-size: 13px;">
          <ScalyoIcon name="check-circle" :size="18" style="margin-right: 4px" />
          {{ t('mgrNoAlerts') }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useManagerStore } from '../stores/manager'
import { useClientsStore } from '../stores/clients'
import { useCSMStore } from '../stores/csm'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const managerStore = useManagerStore()
const clientsStore = useClientsStore()
const csmStore = useCSMStore()
const prefsStore = usePreferencesStore()

const d = computed(() => managerStore.dashboard)
const sortField = ref('name')
const sortAsc = ref(true)
const filterCSM = ref('')
const filterStress = ref('')
const filterRisk = ref('')

const lang = computed(() => prefsStore.lang)
const todayStr = computed(() => {
  const locale = lang.value === 'en' ? 'en-US' : lang.value === 'kr' ? 'ko-KR' : 'fr-FR'
  return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const currencySymbol = computed(() => {
  const c = prefsStore.currency
  if (c === 'USD') return '$'
  if (c === 'GBP') return '£'
  if (c === 'CHF') return 'CHF'
  if (c === 'CAD') return 'CA$'
  return '€'
})

function fmtCurrency(v) {
  if (!v) return '0' + (currencySymbol.value === '€' ? '€' : '')
  const s = currencySymbol.value
  const before = ['$', '£', 'CA$'].includes(s)
  const fmt = (n) => before ? `${s}${n}` : `${n}${s}`
  if (v >= 1e6) return fmt((v / 1e6).toFixed(1) + 'M')
  if (v >= 1e3) return fmt(Math.round(v / 1e3) + 'K')
  return fmt(v)
}

function scoreColor(s) { return s >= 75 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--red)' }
function loadColor(p) { return p >= 85 ? 'var(--red)' : p >= 60 ? 'var(--amber)' : 'var(--green)' }
function loadGrad(p) { return p >= 85 ? 'linear-gradient(90deg, var(--red), var(--red))' : p >= 60 ? 'linear-gradient(90deg, var(--amber), var(--amber))' : 'linear-gradient(90deg, var(--green), var(--green))' }

function wellbeingColor(score) {
  if (!score) return 'var(--muted)'
  return score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
}

function stressColor(level) {
  if (level === 'red' || level === 'high') return 'var(--red)'
  if (level === 'yellow' || level === 'medium') return 'var(--amber)'
  return 'var(--green)'
}

function stressLabel(level) {
  if (level === 'red' || level === 'high') return t('mgrStressBurnout')
  if (level === 'yellow' || level === 'medium') return t('mgrStressAttention')
  return t('mgrStressGood')
}

// Team wellbeing: build from CSM store data
const teamWellbeing = computed(() => {
  return csmStore.workloadByCSM.map(csm => ({
    id: csm.id,
    name: csm.name,
    role: csm.role || 'CSM',
    wellbeingScore: csm.wellbeingScore || (csm.workloadPct >= 85 ? 40 : csm.workloadPct >= 60 ? 60 : 80),
    stressLevel: csm.workloadPct >= 85 ? 'high' : csm.workloadPct >= 60 ? 'medium' : 'low',
    workloadPct: csm.workloadPct || 0,
    atRiskCount: csm.atRiskCount || 0,
  }))
})

// Filtered wellbeing
const filteredWellbeing = computed(() => {
  let list = teamWellbeing.value
  if (filterCSM.value) list = list.filter(m => m.name === filterCSM.value)
  if (filterStress.value) list = list.filter(m => m.stressLevel === filterStress.value)
  if (filterRisk.value === 'at-risk') list = list.filter(m => m.atRiskCount > 0)
  if (filterRisk.value === 'healthy') list = list.filter(m => m.atRiskCount === 0)
  return list
})

// CSM Performance data
const csmPerf = computed(() => {
  return csmStore.workloadByCSM.map(csm => ({
    id: csm.id,
    name: csm.name,
    clientCount: csm.clientCount || csm.clients?.length || 0,
    avgHealth: csm.avgHealth || 0,
    atRiskCount: csm.atRiskCount || 0,
    arr: csm.clients?.reduce((s, c) => s + (c.arrValue || 0), 0) || 0,
    workloadPct: csm.workloadPct || 0,
  }))
})

function sortBy(field) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = true }
}

const sortedCsmPerf = computed(() => {
  let list = [...csmPerf.value]
  if (filterCSM.value) list = list.filter(c => c.name === filterCSM.value)
  const dir = sortAsc.value ? 1 : -1
  return list.sort((a, b) => {
    const va = a[sortField.value]
    const vb = b[sortField.value]
    if (typeof va === 'string') return va.localeCompare(vb) * dir
    return ((va || 0) - (vb || 0)) * dir
  })
})

onMounted(() => managerStore.fetchAll())
</script>
