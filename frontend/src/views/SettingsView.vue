<template>
  <!-- Forced password change modal -->
  <div v-if="authStore.user?.must_change_password" class="modal-overlay">
    <div class="modal-content" style="max-width: 440px;">
      <h4 style="font-weight: 800; margin-bottom: 8px;">{{ t('forceChangeTitle') }}</h4>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">{{ t('forceChangeDesc') }}</p>
      <div v-if="pwError" style="background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.2); border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: var(--red);">{{ pwError }}</div>
      <AppField :label="t('newPassword')" v-model="pwForm.new_password" type="password" :placeholder="t('teamPasswordHint')" />
      <AppField :label="t('confirmPassword')" v-model="pwForm.confirm_password" type="password" />
      <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 8px;" @click="doForceChangePassword" :disabled="changingPw">
        {{ changingPw ? t('saving') : t('changePasswordBtn') }}
      </button>
    </div>
  </div>

  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('settingsTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('settingsDesc') }}</p>
    </div>

    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: tab === 'profile' }" @click="tab = 'profile'">{{ t('tabProfile') }}</button>
      <button v-if="isManager" class="tab-item" :class="{ active: tab === 'team' }" @click="tab = 'team'">{{ t('tabTeam') }}</button>
      <button v-if="isManager" class="tab-item" :class="{ active: tab === 'billing' }" @click="tab = 'billing'">{{ t('tabBilling') }}</button>
      <button class="tab-item" :class="{ active: tab === 'notifications' }" @click="tab = 'notifications'">{{ t('tabNotifs') }}</button>
      <button class="tab-item" :class="{ active: tab === 'appearance' }" @click="tab = 'appearance'">{{ t('tabAppearance') }}</button>
      <button class="tab-item" :class="{ active: tab === 'danger' }" @click="tab = 'danger'" style="color: var(--red)">⚠️ {{ t('deleteAccount') }}</button>
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
        <button class="btn btn-primary" style="margin-top: 12px;" @click="saveCompany" :disabled="saving">{{ saving ? t('saving') : t('save') }}</button>
      </AppCard>
      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('changePasswordTitle') }}</h4>
        <div v-if="pwError" style="background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.2); border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: var(--red);">{{ pwError }}</div>
        <div v-if="pwSuccess" style="background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.2); border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: var(--green);">{{ pwSuccess }}</div>
        <AppField :label="t('currentPassword')" v-model="pwForm.current_password" type="password" />
        <AppField :label="t('newPassword')" v-model="pwForm.new_password" type="password" :placeholder="t('teamPasswordHint')" />
        <AppField :label="t('confirmPassword')" v-model="pwForm.confirm_password" type="password" />
        <button class="btn btn-primary" @click="doChangePassword" :disabled="changingPw">{{ changingPw ? t('saving') : t('changePasswordBtn') }}</button>
      </AppCard>
    </template>

    <!-- Team (manager only) -->
    <template v-if="tab === 'team' && isManager">
      <!-- Plan usage -->
      <AppCard class="mb-md" v-if="teamLimits">
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 120px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted); margin-bottom: 4px;">{{ t('roleManager') }}s</div>
            <div style="font-size: 20px; font-weight: 800;">{{ teamUsage.managers }}<span style="color: var(--muted); font-size: 13px;">/{{ teamLimits.managers === -1 ? '∞' : teamLimits.managers }}</span></div>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted); margin-bottom: 4px;">{{ t('roleCSM') }}s</div>
            <div style="font-size: 20px; font-weight: 800;">{{ teamUsage.csms }}<span style="color: var(--muted); font-size: 13px;">/{{ teamLimits.csms === -1 ? '∞' : teamLimits.csms }}</span></div>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted); margin-bottom: 4px;">{{ t('demo_active_acc') }}</div>
            <div style="font-size: 20px; font-weight: 800;">{{ teamUsage.accounts }}<span style="color: var(--muted); font-size: 13px;">/{{ teamLimits.accounts === -1 ? '∞' : teamLimits.accounts }}</span></div>
          </div>
        </div>
      </AppCard>

      <!-- Team members list -->
      <AppCard class="mb-md">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="font-weight: 800;">{{ t('teamSectionTitle') }}</h4>
          <button class="btn btn-primary" @click="showInviteModal = true" style="font-size: 13px; padding: 8px 16px;">{{ t('inviteCSM') }}</button>
        </div>

        <div v-if="teamLoading" style="padding: 20px; text-align: center; color: var(--muted);">{{ t('teamLoading') }}</div>
        <div v-else-if="teamMembers.length === 0" style="padding: 20px; text-align: center; color: var(--muted);">{{ t('noTeamMembers') }}</div>
        <div v-else>
          <div v-for="m in teamMembers" :key="m.id" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff;"
                :style="{ background: { manager: 'var(--teal)', csm: 'var(--purple, #a78bfa)', commercial: '#f59e0b', kam: '#3b82f6' }[m.role] || 'var(--purple, #a78bfa)' }">
                {{ (m.display_name || m.email).charAt(0).toUpperCase() }}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 13px;">{{ m.display_name || m.email }}</div>
                <div style="font-size: 11px; color: var(--muted);">{{ m.email }}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="tag" :class="m.role === 'manager' ? 'risk-low' : 'risk-medium'" style="font-size: 11px; padding: 3px 10px;">{{ { manager: t('roleManager'), csm: t('roleCSM'), commercial: t('roleCommercial'), kam: t('roleKAM') }[m.role] || m.role }}</span>
              <button v-if="['csm', 'commercial', 'kam'].includes(m.role)" class="btn btn-secondary" style="font-size: 12px; padding: 7px 14px;" @click="openAccountsModal(m)">{{ t('manageAccounts') }}</button>
              <button v-if="m.id !== authStore.user?.id" class="btn btn-secondary" style="font-size: 12px; padding: 7px 14px; color: var(--red);" @click="removeMember(m)">{{ t('teamRemoveBtn') }}</button>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Invite modal -->
      <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
        <div class="modal-content" style="max-width: 440px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="font-weight: 800;">{{ t('inviteCSM') }}</h4>
            <button @click="showInviteModal = false" style="background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer;">&times;</button>
          </div>
          <div v-if="inviteError" style="background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.2); border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: var(--red);">{{ inviteError }}</div>
          <AppField label="Email" v-model="inviteForm.email" placeholder="csm@example.com" />
          <AppField :label="t('displayName')" v-model="inviteForm.display_name" :placeholder="t('teamNamePlaceholder')" />
          <div style="margin-bottom: 12px;">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px;">{{ t('teamRoleLabel') }}</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="chip" :class="{ active: inviteForm.role === 'csm' }" @click="inviteForm.role = 'csm'">{{ t('roleCSM') }}</button>
              <button class="chip" :class="{ active: inviteForm.role === 'manager' }" @click="inviteForm.role = 'manager'">{{ t('roleManager') }}</button>
              <button class="chip" :class="{ active: inviteForm.role === 'commercial' }" @click="inviteForm.role = 'commercial'">{{ t('roleCommercial') }}</button>
              <button class="chip" :class="{ active: inviteForm.role === 'kam' }" @click="inviteForm.role = 'kam'">{{ t('roleKAM') }}</button>
            </div>
          </div>
          <AppField :label="t('password')" v-model="inviteForm.password" :placeholder="t('teamPasswordHint')" type="password" />
          <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 8px;" @click="inviteMember" :disabled="inviting">
            {{ inviting ? t('teamCreating') : t('teamCreateBtn') }}
          </button>
        </div>
      </div>

      <!-- Account assignment modal -->
      <div v-if="showAccountsModal" class="modal-overlay" @click.self="showAccountsModal = false">
        <div class="modal-content" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="font-weight: 800;">{{ t('assignAccounts') }} — {{ selectedCsm?.display_name || selectedCsm?.email }}</h4>
            <button @click="showAccountsModal = false" style="background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer;">&times;</button>
          </div>
          <p style="font-size: 12px; color: var(--muted); margin-bottom: 14px;">{{ t('assignAccountsDesc') }}</p>
          <div v-if="allAccounts.length === 0" style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px;">
            {{ t('noAccounts') }}
          </div>
          <div v-else style="max-height: 340px; overflow-y: auto; margin-bottom: 14px;">
            <label v-for="acc in allAccounts" :key="acc.id" style="display: flex; align-items: center; gap: 10px; padding: 10px 8px; border-bottom: 1px solid var(--border); cursor: pointer; font-size: 13px;"
              @click="toggleAccount(acc.id)">
              <input type="checkbox" :checked="assignedAccountIds.includes(acc.id)" style="accent-color: var(--teal); width: 16px; height: 16px;" @click.stop="toggleAccount(acc.id)" />
              <div style="flex: 1;">
                <div style="font-weight: 700;">{{ acc.name }}</div>
                <div v-if="acc.csm" style="font-size: 11px; color: var(--muted);">CSM: {{ acc.csm }}</div>
              </div>
              <span v-if="acc.arr" style="font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace;">{{ acc.arr.toLocaleString() }}</span>
            </label>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--muted);">{{ assignedAccountIds.length }} {{ t('selected') }}</span>
            <button class="btn btn-primary" @click="saveAccountAssignments" :disabled="savingAccounts" style="font-size: 13px; padding: 8px 20px;">
              {{ savingAccounts ? t('saving') : t('save') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Billing (manager only) -->
    <template v-if="tab === 'billing' && isManager">
      <!-- Trial banner -->
      <div v-if="trialDaysLeft > 0" class="card" style="padding: 18px; margin-bottom: 16px; border-color: var(--tealBorder); background: var(--tealBg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-weight: 800; font-size: 14px; color: var(--teal);">
            <ScalyoIcon name="clock" :size="16" style="margin-right: 4px;" /> {{ t('trialBanner') }}
          </div>
          <span style="font-size: 13px; font-weight: 700; color: var(--teal);">{{ trialDaysLeft }} {{ t('trialDaysLeft') }}</span>
        </div>
        <div style="background: var(--surface); border-radius: 6px; height: 6px; overflow: hidden;">
          <div style="height: 100%; border-radius: 6px; background: var(--teal); transition: width .3s;" :style="{ width: ((14 - trialDaysLeft) / 14 * 100) + '%' }"></div>
        </div>
      </div>
      <div v-if="billingError" style="background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.2); border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: var(--red);">{{ billingError }}</div>
      <AppCard class="mb-md">
        <h4 style="font-weight: 800; margin-bottom: 14px">{{ t('currentSubscription') }}</h4>
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 16px">
          <span class="tag risk-low" style="font-size: 14px; padding: 6px 14px">{{ authStore.company?.plan || 'Starter' }}</span>
          <button class="btn btn-secondary" style="font-size: 12px; padding: 4px 12px;" @click="openBillingPortal" :disabled="openingPortal">
            {{ openingPortal ? '...' : t('manageSubscription') }}
          </button>
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
          <button v-if="plan.name !== authStore.company?.plan"
            class="btn btn-primary" style="width: 100%; justify-content: center"
            :disabled="changingPlan === plan.name"
            @click="changePlan(plan.name)">
            {{ changingPlan === plan.name ? '...' : t('upgradePlan') }}
          </button>
          <button v-else class="btn btn-secondary" style="width: 100%; justify-content: center" disabled>
            {{ t('currentPlan') }}
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

      <!-- AI features indicator -->
      <AppCard class="mb-md">
        <div style="display: flex; align-items: center; gap: 14px">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--green); flex-shrink: 0; box-shadow: 0 0 8px rgba(74,222,128,.5)"></div>
          <div>
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px">{{ aiFeaturesLabel }}</div>
            <div style="font-size: 12px; color: var(--muted)">{{ aiCoachDesc }}</div>
          </div>
        </div>
      </AppCard>
    </template>

    <!-- Danger zone -->
    <template v-if="tab === 'danger'">
      <AppCard :danger="true">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px">
          <span style="font-size: 24px">⚠️</span>
          <h4 style="font-weight: 900; font-size: 17px; color: var(--red)">{{ t('deleteAccount') }}</h4>
        </div>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.7; max-width: 500px">{{ t('deleteAccountDesc') }}</p>
        <div style="margin-bottom: 18px">
          <label style="font-size: 11px; font-weight: 700; color: var(--red); text-transform: uppercase; display: block; margin-bottom: 8px; letter-spacing: .08em">
            {{ t('deleteAccountType') }}
          </label>
          <input v-model="deleteConfirmText" class="field-input" style="margin-bottom: 8px; border-color: var(--red)"
            :placeholder="deleteWord" />
        </div>
        <div style="display: flex; gap: 12px; align-items: center">
          <button class="btn btn-secondary" @click="tab = 'profile'; deleteConfirmText = ''">{{ t('cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleteConfirmText !== deleteWord" @click="confirmDeleteAccount">
            {{ t('deleteAccount') }}
          </button>
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
import { authApi, teamApi, portfolioApi, billingApi } from '../api'
import { useToast } from '../composables/useToast'
import AppCard from '../components/AppCard.vue'
import AppField from '../components/AppField.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const tab = ref('profile')
const saving = ref(false)
const isManager = computed(() => authStore.user?.role === 'manager')

// Password change
const pwForm = reactive({ current_password: '', new_password: '', confirm_password: '' })
const pwError = ref('')
const pwSuccess = ref('')
const changingPw = ref(false)

async function doChangePassword() {
  pwError.value = ''
  pwSuccess.value = ''
  if (!pwForm.new_password || pwForm.new_password.length < 8) {
    pwError.value = t('errPassLength')
    return
  }
  if (pwForm.new_password !== pwForm.confirm_password) {
    pwError.value = t('passwordMismatch')
    return
  }
  changingPw.value = true
  try {
    await authStore.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password })
    pwSuccess.value = t('passwordChanged')
    Object.assign(pwForm, { current_password: '', new_password: '', confirm_password: '' })
  } catch (e) {
    pwError.value = e.response?.data?.error || t('teamInviteError')
  }
  changingPw.value = false
}

async function doForceChangePassword() {
  pwError.value = ''
  if (!pwForm.new_password || pwForm.new_password.length < 8) {
    pwError.value = t('errPassLength')
    return
  }
  if (pwForm.new_password !== pwForm.confirm_password) {
    pwError.value = t('passwordMismatch')
    return
  }
  changingPw.value = true
  try {
    await authStore.changePassword({ new_password: pwForm.new_password })
    Object.assign(pwForm, { current_password: '', new_password: '', confirm_password: '' })
  } catch (e) {
    pwError.value = e.response?.data?.error || t('teamInviteError')
  }
  changingPw.value = false
}

const profile = reactive({ display_name: authStore.user?.display_name || '' })
const companyName = ref(authStore.company?.name || '')
const selectedPlan = ref(authStore.company?.plan || 'Starter')
const planOptions = [
  { key: 'Starter', name: 'Starter', price: '97€/mois' },
  { key: 'Growth', name: 'Growth', price: '297€/mois' },
  { key: 'Elite', name: 'Elite', price: '697€/mois' },
]
const selectedCurrency = ref(prefsStore.currency)

const notifPrefs = reactive({ churn_alerts: true, weekly_report: true, wellbeing_alerts: true, renewal_alerts: true })
const changingPlan = ref('')
const billingError = ref('')
const openingPortal = ref(false)

// Team management
const teamMembers = ref([])
const teamLimits = ref(null)
const teamUsage = ref({ managers: 0, csms: 0, accounts: 0 })
const teamLoading = ref(false)
const showInviteModal = ref(false)
const inviteForm = reactive({ email: '', display_name: '', role: 'csm', password: '' })
const inviteError = ref('')
const inviting = ref(false)

// Account assignment
const showAccountsModal = ref(false)
const selectedCsm = ref(null)
const allAccounts = ref([])
const assignedAccountIds = ref([])
const savingAccounts = ref(false)

const trialDaysLeft = computed(() => {
  const c = authStore.company
  if (!c) return 14
  if (c.subscription_status === 'active' || c.subscription_status === 'paid') return -1
  if (c.trial_days_left !== undefined) return c.trial_days_left
  const created = c.created_at
  if (!created) return 14
  const diff = 14 - Math.floor((Date.now() - new Date(created).getTime()) / 86400000)
  return Math.max(0, diff)
})

const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
  { code: 'XOF', symbol: 'CFA', name: 'Franc CFA' },
  { code: 'AED', symbol: 'AED', name: 'Dirham UAE' },
  { code: 'SAR', symbol: 'SAR', name: 'Riyal saoudien' },
  { code: 'KRW', symbol: '₩', name: 'Won coréen' },
]

const plans = computed(() => [
  { name: 'Starter', price: '97€', features: [t('starter10Accounts'), t('starterDashKpi'), t('starterTaskBoard'), t('starterCoachLimited'), t('starterWellbeing'), t('starterEmailStudio')] },
  { name: 'Growth', price: '297€', features: [t('growthUnlimitedAccounts'), t('growthUnlimitedCsms'), t('growthCoachUnlimited'), t('growthWellbeingAdvanced'), t('growthPlanning'), t('growthEmailFull'), t('growthImportCsv')] },
  { name: 'Elite', price: '697€', features: [t('eliteAll'), t('eliteCrmIntegrations'), t('eliteOnboarding'), t('elitePrioritySupport'), t('eliteCoachingSession')] },
])

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
  if (isManager.value) loadTeam()
})

async function loadTeam() {
  teamLoading.value = true
  try {
    const [teamRes, limitsRes] = await Promise.all([teamApi.list(), teamApi.limits()])
    teamMembers.value = teamRes.data.members || []
    teamLimits.value = limitsRes.data.limits || null
    teamUsage.value = limitsRes.data.usage || { managers: 0, csms: 0, accounts: 0 }
  } catch (e) {
    console.error('loadTeam error:', e)
  }
  teamLoading.value = false
}

async function inviteMember() {
  inviteError.value = ''
  if (!inviteForm.email || !inviteForm.password) {
    inviteError.value = t('teamEmailPwdRequired')
    return
  }
  inviting.value = true
  try {
    await teamApi.invite({ ...inviteForm })
    showInviteModal.value = false
    Object.assign(inviteForm, { email: '', display_name: '', role: 'csm', password: '' })
    await loadTeam()
  } catch (e) {
    inviteError.value = e.response?.data?.error || t('teamInviteError')
  }
  inviting.value = false
}

async function removeMember(member) {
  if (!confirm(t('teamRemoveConfirm'))) return
  try {
    await teamApi.remove(member.id)
    await loadTeam()
  } catch (e) {
    console.error('removeMember error:', e)
  }
}

async function openAccountsModal(member) {
  selectedCsm.value = member
  savingAccounts.value = false
  try {
    const [allRes, assignedRes] = await Promise.all([
      portfolioApi.getAccounts(),
      teamApi.getCsmAccounts(member.id)
    ])
    allAccounts.value = allRes.data || []
    assignedAccountIds.value = (assignedRes.data.accounts || []).map(a => a.id)
  } catch (e) {
    console.error('openAccountsModal error:', e)
    allAccounts.value = []
    assignedAccountIds.value = []
  }
  showAccountsModal.value = true
}

function toggleAccount(id) {
  const idx = assignedAccountIds.value.indexOf(id)
  if (idx >= 0) assignedAccountIds.value.splice(idx, 1)
  else assignedAccountIds.value.push(id)
}

async function saveAccountAssignments() {
  if (!selectedCsm.value) return
  savingAccounts.value = true
  try {
    await teamApi.setCsmAccounts(selectedCsm.value.id, assignedAccountIds.value)
    showAccountsModal.value = false
  } catch (e) {
    console.error('saveAccountAssignments error:', e)
  }
  savingAccounts.value = false
}

async function saveProfile() {
  saving.value = true
  try {
    await authStore.updateProfile({ display_name: profile.display_name })
  } catch (e) {
    console.error('saveProfile error:', e)
  }
  saving.value = false
}

async function saveCompany() {
  saving.value = true
  try {
    await authStore.updateCompany({ name: companyName.value })
  } catch (e) {
    console.error('saveCompany error:', e)
  }
  saving.value = false
}

async function openBillingPortal() {
  openingPortal.value = true
  try {
    const { data } = await billingApi.openPortal()
    if (data.portal_url) window.location.href = data.portal_url
  } catch (e) {
    billingError.value = e.response?.data?.error || e.message
  }
  openingPortal.value = false
}

async function changePlan(planName) {
  if (changingPlan.value) return
  changingPlan.value = planName
  billingError.value = ''
  try {
    // Try to change plan on existing subscription
    const { data } = await billingApi.changePlan(planName)
    if (data.ok) {
      if (authStore.company) authStore.company.plan = planName
      toast.success(t('save') + ': ' + planName)
      changingPlan.value = ''
      return
    }
  } catch (e) {
    // If no subscription exists, fallback to checkout
    if (e.response?.data?.error === 'no_subscription') {
      try {
        const { data } = await billingApi.createCheckout(planName)
        if (data.checkout_url) {
          window.location.href = data.checkout_url
          return
        }
      } catch (e2) {
        const msg = e2.response?.data?.error || e2.message
        billingError.value = msg
        toast.error(msg)
      }
    } else {
      const msg = e.response?.data?.error || e.message
      billingError.value = msg
      toast.error(msg)
    }
  }
  changingPlan.value = ''
}

async function saveNotifPrefs() {
  try {
    await authApi.updateNotificationPrefs({ ...notifPrefs })
    toast.success(t('notifSaved'))
  } catch (e) {
    toast.error(e.response?.data?.error || e.message)
    console.error('saveNotifPrefs error:', e)
  }
}

const aiFeaturesLabel = computed(() =>
  prefsStore.lang === 'en' ? 'AI features active' : prefsStore.lang === 'kr' ? 'AI 기능 활성화' : 'Fonctions IA actives'
)
const aiCoachDesc = computed(() =>
  prefsStore.lang === 'en'
    ? 'CS Coach and Nova Wellbeing are powered by DeepSeek — no configuration needed.'
    : prefsStore.lang === 'kr'
    ? 'CS 코치와 Nova 웰빙은 DeepSeek으로 구동됩니다 — 별도 설정이 필요 없습니다.'
    : 'Le Coach CS et Nova Bien-être sont propulsés par DeepSeek — aucune configuration requise.'
)

const deleteConfirmText = ref('')
const deleteWord = computed(() => prefsStore.lang === 'fr' ? 'SUPPRIMER' : prefsStore.lang === 'kr' ? '삭제' : 'DELETE')

async function confirmDeleteAccount() {
  if (deleteConfirmText.value !== deleteWord.value) return
  try {
    await authApi.deleteAccount()
    authStore.logout()
    router.push({ name: 'login' })
  } catch (e) {
    console.error('deleteAccount error:', e)
  }
}
</script>
