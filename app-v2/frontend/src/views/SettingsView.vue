<template>
  <div class="settings-view">
    <div class="sv-header">
      <h1>⚙️ {{ t('stg_title') }}</h1>
      <p class="sv-sub">{{ t('stg_subtitle') }}</p>
    </div>

    <!-- Tabs -->
    <div class="sv-tabs">
      <button v-for="tab in tabs" :key="tab.key" class="sv-tab" :class="{ active: activeTab === tab.key, danger: tab.danger }" @click="activeTab = tab.key">
        {{ t(tab.label) }}
      </button>
    </div>

    <!-- Profile -->
    <div v-if="activeTab === 'profile'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_account_info') }}</h3>
        <div class="sv-form">
          <div class="fg"><label>{{ t('stg_display_name') }}</label><input v-model="profile.displayName" class="fi" /></div>
          <div class="fg"><label>{{ t('stg_email') }}</label><input v-model="profile.email" type="email" class="fi" disabled /></div>
          <button class="btn-primary" @click="saveProfile">{{ t('save') }}</button>
        </div>
      </div>

      <div class="sv-section">
        <h3>{{ t('stg_company_name') }}</h3>
        <div class="sv-form">
          <div class="fg"><label>{{ t('stg_company_name') }}</label><input v-model="profile.company" class="fi" /></div>
          <button class="btn-primary" @click="saveProfile">{{ t('save') }}</button>
        </div>
      </div>

      <div class="sv-section">
        <h3>{{ t('stg_change_pwd') }}</h3>
        <div class="sv-form">
          <div class="fg"><label>{{ t('stg_current_pwd') }}</label><input v-model="pwd.current" type="password" class="fi" /></div>
          <div class="fg">
            <label>{{ t('stg_new_pwd') }}</label>
            <input v-model="pwd.newPwd" type="password" class="fi" />
            <span class="fi-hint">{{ t('stg_pwd_hint') }}</span>
          </div>
          <div class="fg"><label>{{ t('stg_confirm_pwd') }}</label><input v-model="pwd.confirm" type="password" class="fi" /></div>
          <button class="btn-primary" :disabled="!pwd.current || !pwd.newPwd || pwd.newPwd !== pwd.confirm">{{ t('stg_change_btn') }}</button>
        </div>
      </div>
    </div>

    <!-- Team -->
    <div v-else-if="activeTab === 'team'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_team') }}</h3>
        <div class="team-list">
          <div v-for="m in team.members" :key="m.id" class="team-row">
            <div class="tr-avatar" :class="m.status">{{ m.name[0] }}</div>
            <div class="tr-info"><strong>{{ m.name }}</strong><span>{{ m.email }} · {{ m.role }}</span></div>
            <span class="tr-status" :class="m.status">{{ m.status === 'healthy' ? t('status_healthy') : t('kpi_overloaded') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing -->
    <div v-else-if="activeTab === 'billing'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_billing') }}</h3>
        <div class="billing-plan">
          <div class="bp-current">
            <span class="bp-badge">{{ auth.company?.planLabel }}</span>
            <span class="bp-price">{{ auth.company?.plan === 'elite' ? '697' : auth.company?.plan === 'growth' ? '297' : '97' }}€/{{ t('stg_per_month') }}</span>
          </div>
          <p class="bp-note">{{ t('stg_stripe_soon') }}</p>
        </div>
      </div>
      <div class="sv-section">
        <h3>{{ t('stg_change_plan') }}</h3>
        <div class="plans-grid">
          <div class="plan-card" :class="{ active: auth.company?.plan === 'starter' }">
            <div class="plan-header">
              <span class="plan-name">Starter</span>
              <span class="plan-price">97€<span class="plan-period">/{{ t('stg_per_month') }}</span></span>
            </div>
            <ul class="plan-features">
              <li>{{ t('stg_plan_starter_f1') }}</li>
              <li>{{ t('stg_plan_starter_f2') }}</li>
              <li>{{ t('stg_plan_starter_f3') }}</li>
            </ul>
            <button class="btn-plan" :class="{ current: auth.company?.plan === 'starter' }" :disabled="auth.company?.plan === 'starter'">
              {{ auth.company?.plan === 'starter' ? t('stg_plan_current') : t('stg_plan_downgrade') }}
            </button>
          </div>
          <div class="plan-card featured" :class="{ active: auth.company?.plan === 'growth' }">
            <div class="plan-badge-popular">{{ t('stg_plan_popular') }}</div>
            <div class="plan-header">
              <span class="plan-name">Growth</span>
              <span class="plan-price">297€<span class="plan-period">/{{ t('stg_per_month') }}</span></span>
            </div>
            <ul class="plan-features">
              <li>{{ t('stg_plan_growth_f1') }}</li>
              <li>{{ t('stg_plan_growth_f2') }}</li>
              <li>{{ t('stg_plan_growth_f3') }}</li>
            </ul>
            <button class="btn-plan" :class="{ current: auth.company?.plan === 'growth' }" :disabled="auth.company?.plan === 'growth'">
              {{ auth.company?.plan === 'growth' ? t('stg_plan_current') : auth.company?.plan === 'elite' ? t('stg_plan_downgrade') : t('stg_plan_upgrade') }}
            </button>
          </div>
          <div class="plan-card" :class="{ active: auth.company?.plan === 'elite' }">
            <div class="plan-header">
              <span class="plan-name">Elite</span>
              <span class="plan-price">697€<span class="plan-period">/{{ t('stg_per_month') }}</span></span>
            </div>
            <ul class="plan-features">
              <li>{{ t('stg_plan_elite_f1') }}</li>
              <li>{{ t('stg_plan_elite_f2') }}</li>
              <li>{{ t('stg_plan_elite_f3') }}</li>
            </ul>
            <button class="btn-plan" :class="{ current: auth.company?.plan === 'elite' }" :disabled="auth.company?.plan === 'elite'">
              {{ auth.company?.plan === 'elite' ? t('stg_plan_current') : t('stg_plan_upgrade') }}
            </button>
          </div>
        </div>
        <p class="bp-note">{{ t('stg_stripe_soon') }}</p>
      </div>
    </div>

    <!-- Notifications -->
    <div v-else-if="activeTab === 'notifications'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_notif') }}</h3>
        <div class="notif-settings">
          <label class="ns-row"><input type="checkbox" v-model="notif.churn" /> {{ t('stg_notif_churn') }}</label>
          <label class="ns-row"><input type="checkbox" v-model="notif.renewal" /> {{ t('stg_notif_renewal') }}</label>
          <label class="ns-row"><input type="checkbox" v-model="notif.burnout" /> {{ t('stg_notif_burnout') }}</label>
          <label class="ns-row"><input type="checkbox" v-model="notif.late_tasks" /> {{ t('stg_notif_late_tasks') }}</label>
          <label class="ns-row"><input type="checkbox" v-model="notif.nps" /> {{ t('stg_notif_nps') }}</label>
        </div>
      </div>
    </div>

    <!-- Appearance -->
    <div v-else-if="activeTab === 'appearance'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_appearance') }}</h3>
        <p class="sv-note">{{ t('stg_appearance_note') }}</p>
      </div>
    </div>

    <!-- Delete -->
    <div v-else-if="activeTab === 'delete'" class="sv-panel">
      <div class="sv-section danger-section">
        <h3>{{ t('stg_tab_delete') }}</h3>
        <p>{{ t('stg_delete_warning') }}</p>
        <button class="btn-danger">{{ t('stg_delete_btn') }}</button>
      </div>
    </div>
  
      <!-- ─── Section Langue ─────────────────────────────────────────────── -->
      <div class="stg-section" id="stg-langue">
        <h2 class="stg-section-title">🌐 {{ t('stg_lang_title') }}</h2>
        <p class="stg-section-desc">{{ t('stg_lang_desc') }}</p>
        <div class="lang-cards">
          <button
            v-for="lang in langOptions"
            :key="lang.code"
            class="lang-card"
            :class="{ active: selectedLang === lang.code }"
            @click="changeLang(lang.code)"
          >
            <span class="lang-flag">{{ lang.flag }}</span>
            <span class="lang-name">{{ lang.name }}</span>
            <span v-if="selectedLang === lang.code" class="lang-check">✓</span>
          </button>
        </div>
        <p v-if="langSaved" class="stg-saved">✓ {{ t('stg_lang_saved') }}</p>
      </div>

      <!-- ─── Section Forfait ────────────────────────────────────────────────── -->
      <div class="stg-section" id="stg-forfait">
        <h2 class="stg-section-title">💳 {{ t('stg_plan_title') }}</h2>
        <p class="stg-section-desc">{{ t('stg_plan_desc') }}</p>
        <div class="plan-current">
          <span class="plan-badge">{{ currentPlanLabel }}</span>
          <span class="plan-status" :class="{ active: auth.hasActiveSubscription, trial: auth.isOnTrial }">
            {{ auth.hasActiveSubscription ? t('stg_plan_active') : auth.isOnTrial ? t('stg_trial_days', { days: auth.trialDaysLeft }) : t('stg_plan_none') }}
          </span>
        </div>
        <div class="plan-actions">
          <a :href="starterUrl" target="_blank" class="btn-plan-change starter">Starter — 97€/mois</a>
          <a :href="growthUrl" target="_blank" class="btn-plan-change growth">Growth — 297€/mois</a>
          <a :href="eliteUrl" target="_blank" class="btn-plan-change elite">Elite — 697€/mois</a>
        </div>
      </div>

      <!-- ─── Section Apparence ──────────────────────────────────────────────── -->
      <div class="stg-section" id="stg-apparence">
        <h2 class="stg-section-title">🌙 {{ t('stg_dark_title') }}</h2>
        <p class="stg-section-desc">{{ t('stg_dark_desc') }}</p>
        <div class="theme-cards">
          <button class="theme-card" :class="{ active: theme === 'light' }" @click="setTheme('light')">
            ☀️ {{ t('stg_theme_light') }}
          </button>
          <button class="theme-card" :class="{ active: theme === 'dark' }" @click="setTheme('dark')">
            🌙 {{ t('stg_theme_dark') }}
          </button>
          <button class="theme-card" :class="{ active: theme === 'auto' }" @click="setTheme('auto')">
            🖥️ {{ t('stg_theme_auto') }}
          </button>
        </div>
      </div>
</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const team = useTeamStore()

const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: 'stg_tab_profile' },
  { key: 'team', label: 'stg_tab_team' },
  { key: 'billing', label: 'stg_tab_billing' },
  { key: 'notifications', label: 'stg_tab_notif' },
  { key: 'appearance', label: 'stg_tab_appearance' },
  { key: 'delete', label: 'stg_tab_delete', danger: true },
]

const profile = reactive({
  displayName: auth.user?.displayName || '',
  email: auth.user?.email || '',
  company: auth.company?.name || '',
})

const pwd = reactive({ current: '', newPwd: '', confirm: '' })
const notif = reactive({ churn: true, renewal: true, burnout: true, late_tasks: true, nps: false })

function saveProfile() {
  // Mock save
}

// ─── Language settings ────────────────────────────────────────────────────
const { locale } = useI18n({ useScope: 'global' })

const langOptions = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
]

const selectedLang = ref(auth.userLocale || locale.value || 'fr')
const langSaved = ref(false)

async function changeLang(code) {
  selectedLang.value = code
  locale.value = code
  await auth.saveLocale(code)
  langSaved.value = true
  setTimeout(() => { langSaved.value = false }, 2000)
}

// ─── Plan & Theme ─────────────────────────────────────────────────────────
const currentPlanLabel = computed(() => {
  if (auth.hasActiveSubscription) return auth.profile?.plan || 'Abonnement actif'
  if (auth.isOnTrial) return 'Essai gratuit'
  return 'Aucun forfait'
})

const email = computed(() => auth.user?.email || '')
const starterUrl = computed(() => 'https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01' + (email.value ? '?prefilled_email=' + encodeURIComponent(email.value) : ''))
const growthUrl = computed(() => 'https://buy.stripe.com/eVqbJ10LN6ln5et90gdfG00' + (email.value ? '?prefilled_email=' + encodeURIComponent(email.value) : ''))
const eliteUrl = computed(() => 'https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05' + (email.value ? '?prefilled_email=' + encodeURIComponent(email.value) : ''))

const theme = ref(localStorage.getItem('scalyo_theme') || 'auto')

function setTheme(t) {
  theme.value = t
  localStorage.setItem('scalyo_theme', t)
  applyTheme(t)
}

function applyTheme(t) {
  const root = document.documentElement
  if (t === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else if (t === 'light') {
    root.setAttribute('data-theme', 'light')
  } else {
    root.removeAttribute('data-theme')
  }
}

// Apply on mount
applyTheme(theme.value)

</script>

<style scoped>
.settings-view { max-width: 700px; }
.sv-header { margin-bottom: 24px; }
.sv-header h1 { font-size: 1.5rem; font-weight: 800; }
.sv-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }

.sv-tabs { display: flex; gap: 4px; margin-bottom: 24px; flex-wrap: wrap; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; }
.sv-tab { background: none; border: none; padding: 8px 16px; font-size: 0.82rem; font-weight: 500; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.sv-tab.active { color: var(--purple); border-bottom-color: var(--purple); font-weight: 600; }
.sv-tab.danger { color: var(--red); }
.sv-tab.danger.active { border-bottom-color: var(--red); }

.sv-panel { }
.sv-section { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; margin-bottom: 16px; }
.sv-section h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; }

.sv-form { display: flex; flex-direction: column; gap: 14px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.fi:disabled { background: var(--bg); color: var(--text-muted); }
.fi-hint { font-size: 0.7rem; color: var(--text-muted); }

.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; align-self: flex-start; transition: all 0.15s; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { background: var(--red); color: #fff; border: none; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; }

/* Team */
.team-list { display: flex; flex-direction: column; gap: 8px; }
.team-row { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
.tr-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
.tr-avatar.healthy { background: var(--green); }
.tr-avatar.overloaded { background: var(--red); }
.tr-info { flex: 1; }
.tr-info strong { font-size: 0.88rem; display: block; }
.tr-info span { font-size: 0.75rem; color: var(--text-muted); }
.tr-status { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.tr-status.healthy { background: var(--green-bg); color: var(--green); }
.tr-status.overloaded { background: var(--red-bg); color: var(--red); }

/* Billing */
.billing-plan { }
.bp-current { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.bp-badge { background: var(--purple-bg); color: var(--purple); font-size: 0.85rem; font-weight: 700; padding: 6px 16px; border-radius: 8px; }
.bp-price { font-size: 1.3rem; font-weight: 800; }
.bp-note { font-size: 0.82rem; color: var(--text-muted); }
.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
.plan-card { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 14px; position: relative; transition: all 0.2s; }
.plan-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.plan-card.active { border-color: var(--purple); background: var(--purple-bg); }
.plan-card.featured { border-color: var(--purple); }
.plan-badge-popular { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: var(--purple); color: #fff; font-size: 0.65rem; font-weight: 700; padding: 2px 12px; border-radius: 10px; white-space: nowrap; }
.plan-header { display: flex; justify-content: space-between; align-items: baseline; }
.plan-name { font-size: 0.95rem; font-weight: 700; }
.plan-price { font-size: 1.2rem; font-weight: 800; color: var(--purple); }
.plan-period { font-size: 0.72rem; font-weight: 400; color: var(--text-muted); }
.plan-features { list-style: none; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.plan-features li { font-size: 0.78rem; color: var(--text-secondary); padding-left: 16px; position: relative; }
.plan-features li::before { content: '✓'; position: absolute; left: 0; color: var(--green); font-weight: 700; }
.btn-plan { width: 100%; padding: 8px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; border: 1px solid var(--purple); color: var(--purple); background: #fff; transition: all 0.15s; }
.btn-plan:hover:not(:disabled) { background: var(--purple); color: #fff; }
.btn-plan.current { background: var(--purple); color: #fff; cursor: default; }
.btn-plan:disabled { opacity: 0.6; cursor: not-allowed; }
@media (max-width: 600px) { .plans-grid { grid-template-columns: 1fr; } }

/* Notifications */
.notif-settings { display: flex; flex-direction: column; gap: 10px; }
.ns-row { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.15s; }
.ns-row:hover { background: var(--bg-hover); }
.ns-row input { width: 16px; height: 16px; accent-color: var(--purple); }

.sv-note { font-size: 0.88rem; color: var(--text-secondary); }

.danger-section { border-color: var(--red-border); }
.danger-section h3 { color: var(--red); }
.danger-section p { font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px; }

@media (max-width: 600px) { .sv-tabs { overflow-x: auto; flex-wrap: nowrap; } }

.lang-cards { display:flex;gap:12px;flex-wrap:wrap;margin-top:12px; }
.lang-card { display:flex;align-items:center;gap:8px;padding:12px 18px;border:2px solid var(--border);border-radius:var(--radius-sm);background:#fff;cursor:pointer;font-size:0.9rem;transition:all 0.18s; }
.lang-card:hover { border-color:var(--purple);color:var(--purple); }
.lang-card.active { border-color:var(--purple);background:#f5f3ff;color:var(--purple);font-weight:600; }
.lang-flag { font-size:1.2rem; }
.lang-check { color:var(--green);font-weight:700; }
.stg-saved { margin-top:8px;font-size:0.82rem;color:var(--green);font-weight:500; }


.plan-current { display:flex;align-items:center;gap:12px;margin-bottom:16px; }
.plan-badge { background:var(--purple-light,#ede9fe);color:var(--purple,#7c3aed);padding:4px 12px;border-radius:20px;font-size:0.82rem;font-weight:600; }
.plan-status { font-size:0.85rem;font-weight:500; }
.plan-status.active { color:var(--green,#16a34a); }
.plan-status.trial { color:#f59e0b; }
.plan-actions { display:flex;gap:10px;flex-wrap:wrap; }
.btn-plan-change { padding:10px 18px;border-radius:10px;font-size:0.85rem;font-weight:600;text-decoration:none;transition:all 0.2s; }
.btn-plan-change.starter { background:#ede9fe;color:#5b21b6; }
.btn-plan-change.starter:hover { background:#7c3aed;color:#fff; }
.btn-plan-change.growth { background:#7c3aed;color:#fff; }
.btn-plan-change.growth:hover { background:#6d28d9;transform:translateY(-1px); }
.btn-plan-change.elite { background:#1f2937;color:#fff; }
.btn-plan-change.elite:hover { background:#111827; }
.theme-cards { display:flex;gap:12px;flex-wrap:wrap;margin-top:12px; }
.theme-card { display:flex;align-items:center;gap:8px;padding:12px 18px;border:2px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg-card,#fff);cursor:pointer;font-size:0.9rem;transition:all 0.18s;color:var(--text,#1a1a2e); }
.theme-card:hover { border-color:var(--purple,#7c3aed); }
.theme-card.active { border-color:var(--purple,#7c3aed);background:var(--purple-light,#ede9fe);color:var(--purple,#7c3aed);font-weight:600; }

</style>
