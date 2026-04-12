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
            <span class="bp-price">{{ auth.company?.plan === 'elite' ? '697' : auth.company?.plan === 'growth' ? '297' : '97' }}€/mois</span>
          </div>
          <p class="bp-note">Stripe sera activé prochainement.</p>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-else-if="activeTab === 'notifications'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_notif') }}</h3>
        <div class="notif-settings">
          <label class="ns-row"><input type="checkbox" checked /> Alertes churn</label>
          <label class="ns-row"><input type="checkbox" checked /> Renouvellements</label>
          <label class="ns-row"><input type="checkbox" checked /> Alertes burnout</label>
          <label class="ns-row"><input type="checkbox" checked /> Tâches en retard</label>
          <label class="ns-row"><input type="checkbox" /> NPS en baisse</label>
        </div>
      </div>
    </div>

    <!-- Appearance -->
    <div v-else-if="activeTab === 'appearance'" class="sv-panel">
      <div class="sv-section">
        <h3>{{ t('stg_tab_appearance') }}</h3>
        <p class="sv-note">Mode clair uniquement pour le moment. Le mode sombre arrive bientôt.</p>
      </div>
    </div>

    <!-- Delete -->
    <div v-else-if="activeTab === 'delete'" class="sv-panel">
      <div class="sv-section danger-section">
        <h3>{{ t('stg_tab_delete') }}</h3>
        <p>Cette action est irréversible. Toutes vos données seront supprimées définitivement.</p>
        <button class="btn-danger">Supprimer mon compte</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
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

function saveProfile() {
  // Mock save
}
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
</style>
