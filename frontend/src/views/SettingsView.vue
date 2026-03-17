<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('settingsTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('settingsDesc') }}</p>
    </div>

    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: tab === 'profile' }" @click="tab = 'profile'">{{ t('tabProfile') }}</button>
      <button class="tab-item" :class="{ active: tab === 'team' }" @click="tab = 'team'">{{ t('tabTeam') }}</button>
      <button class="tab-item" :class="{ active: tab === 'billing' }" @click="tab = 'billing'">{{ t('tabBilling') }}</button>
      <button class="tab-item" :class="{ active: tab === 'notifications' }" @click="tab = 'notifications'">{{ t('tabNotifs') }}</button>
      <button class="tab-item" :class="{ active: tab === 'appearance' }" @click="tab = 'appearance'">{{ t('tabAppearance') }}</button>
    </div>

    <!-- Profile -->
    <template v-if="tab === 'profile'">
      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('accountInfo') }}</h4>
        <AppField :label="t('displayName')" v-model="profile.display_name" :placeholder="t('namePlaceholder')" />
        <AppField label="Email" :modelValue="authStore.user?.email" disabled />
        <button class="btn btn-primary" @click="saveProfile" :disabled="saving">{{ saving ? t('saving') : t('save') }}</button>
      </AppCard>
      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('companyNameLabel') }}</h4>
        <AppField :label="t('companyNameLabel')" v-model="companyName" :placeholder="t('companyPlaceholder')" />
        <button class="btn btn-primary" @click="saveCompany" :disabled="saving">{{ saving ? t('saving') : t('save') }}</button>
      </AppCard>
      <!-- Delete account -->
      <AppCard :danger="true">
        <h4 style="font-weight: 800; margin-bottom: 8px; color: var(--red)">{{ t('deleteAccount') }}</h4>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px">{{ t('deleteAccountDesc') }}</p>
        <button class="btn btn-danger" @click="handleDeleteAccount">{{ t('deleteAccount') }}</button>
      </AppCard>
    </template>

    <!-- Team -->
    <template v-if="tab === 'team'">
      <AppCard>
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('teamSectionTitle') }}</h4>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px">{{ t('teamMgmtDesc') }}</p>
        <button class="btn btn-primary">{{ t('inviteCSM') }}</button>
      </AppCard>
    </template>

    <!-- Billing -->
    <template v-if="tab === 'billing'">
      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('currentSubscription') }}</h4>
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 16px">
          <span class="tag risk-low" style="font-size: 14px; padding: 6px 14px">{{ authStore.company?.plan || 'Starter' }}</span>
        </div>
      </AppCard>
      <div class="grid-3" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
        <AppCard v-for="plan in plans" :key="plan.name" :glow="plan.name === authStore.company?.plan" class="card-lift">
          <div style="font-weight: 800; font-size: 16px; margin-bottom: 4px">{{ plan.name }}</div>
          <div style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px">
            {{ plan.price }}{{ t('perMonth') }}
          </div>
          <ul style="list-style: none; font-size: 12px; color: var(--muted); margin-bottom: 14px">
            <li v-for="f in plan.features" :key="f" style="padding: 3px 0; display: flex; align-items: center; gap: 6px;"><ScalyoIcon name="check" :size="12" /> {{ f }}</li>
          </ul>
          <button class="btn" :class="plan.name === authStore.company?.plan ? 'btn-secondary' : 'btn-primary'" style="width: 100%; justify-content: center">
            {{ plan.name === authStore.company?.plan ? t('currentPlan') : t('upgradePlan') }}
          </button>
        </AppCard>
      </div>
    </template>

    <!-- Notifications -->
    <template v-if="tab === 'notifications'">
      <AppCard>
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('notifTitle') }}</h4>
        <div v-for="notif in notifItems" :key="notif.key" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border)">
          <div>
            <div style="font-weight: 700; font-size: 13px">{{ notif.label }}</div>
            <div style="font-size: 12px; color: var(--muted)">{{ notif.desc }}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="notifPrefs[notif.key]" @change="saveNotifPrefs" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </AppCard>
    </template>

    <!-- Appearance -->
    <template v-if="tab === 'appearance'">
      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('appearanceTitle') }}</h4>

        <!-- Theme -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border)">
          <div>
            <div style="font-weight: 700; font-size: 13px">{{ prefsStore.theme === 'dark' ? t('darkMode') : t('lightMode') }}</div>
            <div style="font-size: 12px; color: var(--muted)">{{ t('themeDesc') }}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="prefsStore.theme === 'light'" @change="prefsStore.setTheme(prefsStore.theme === 'dark' ? 'light' : 'dark')" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- Language -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border)">
          <div style="font-weight: 700; font-size: 13px">{{ t('langLabel') }}</div>
          <div style="display: flex; gap: 6px">
            <button v-for="l in ['fr', 'en', 'kr']" :key="l" class="chip" :class="{ active: prefsStore.lang === l }" @click="prefsStore.setLang(l)">
              {{ l === 'fr' ? '🇫🇷 FR' : l === 'en' ? '🇬🇧 EN' : '🇰🇷 KR' }}
            </button>
          </div>
        </div>

        <!-- Currency -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0">
          <div style="font-weight: 700; font-size: 13px">{{ t('currencyLabel') }}</div>
          <select v-model="selectedCurrency" @change="prefsStore.setCurrency(selectedCurrency)" class="field-input" style="width: auto; padding: 6px 12px">
            <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.symbol }} {{ c.name }}</option>
          </select>
        </div>
      </AppCard>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import { authApi } from '../api'
import AppCard from '../components/AppCard.vue'
import AppField from '../components/AppField.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const router = useRouter()
const { t } = useI18n()
const tab = ref('profile')
const saving = ref(false)

const profile = reactive({ display_name: authStore.user?.display_name || '' })
const companyName = ref(authStore.company?.name || '')
const selectedCurrency = ref(prefsStore.currency)

const notifPrefs = reactive({ churn_alerts: true, weekly_report: true, wellbeing_alerts: true, renewal_alerts: true })

const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
]

const plans = [
  { name: 'Starter', price: '0€', features: ['5 client accounts', 'Dashboard & KPIs', 'Task Board', 'Email Studio'] },
  { name: 'Growth', price: '49€', features: ['Unlimited accounts', 'Unlimited CSMs', 'AI Coach', 'Team wellbeing', 'Planning'] },
  { name: 'Elite', price: '149€', features: ['Everything in Growth', 'Dedicated onboarding', 'Priority support', 'Monthly coaching session'] },
]

const notifItems = computed(() => [
  { key: 'churn_alerts', label: t('churnAlertLabel'), desc: t('churnAlertDesc') },
  { key: 'weekly_report', label: t('weeklyReportLabel'), desc: t('weeklyReportDesc') },
  { key: 'wellbeing_alerts', label: t('wellbeingAlertLabel'), desc: t('wellbeingAlertDesc') },
  { key: 'renewal_alerts', label: t('renewalAlertLabel'), desc: t('renewalAlertDesc') },
])

onMounted(async () => {
  try {
    const { data } = await authApi.getNotificationPrefs()
    Object.assign(notifPrefs, data)
  } catch {}
})

async function saveProfile() {
  saving.value = true
  await authStore.updateProfile({ display_name: profile.display_name })
  saving.value = false
}

async function saveCompany() {
  saving.value = true
  await authStore.updateCompany({ name: companyName.value })
  saving.value = false
}

async function saveNotifPrefs() {
  await authApi.updateNotificationPrefs({ ...notifPrefs })
}

async function handleDeleteAccount() {
  if (!confirm(t('deleteAccountDesc'))) return
  await authApi.deleteAccount()
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
