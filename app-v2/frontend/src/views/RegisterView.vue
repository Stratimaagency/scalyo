<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span>
      </div>

      <!-- SUCCESS: check your email -->
      <template v-if="success">
        <div class="success-header">
          <div class="success-icon">📧</div>
          <h1>{{ t('register_success_title') }}</h1>
          <p class="auth-sub">{{ t('register_success_subtitle') }}</p>
        </div>
        <div class="email-notice">
          {{ t('register_check_email') }}
        </div>
        <p class="auth-footer">
          {{ t('register_confirm_email_first') }}
          <router-link to="/login" class="link">{{ t('register_go_login') }}</router-link>
        </p>
      </template>

      <!-- FORM -->
      <template v-else>
        <h1>{{ t('register_title') }}</h1>
        <p class="auth-sub">{{ t('register_subtitle') }}</p>

        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="fg-row">
            <div class="fg">
              <label>{{ t('register_firstname') }}</label>
              <input v-model="firstName" type="text" required class="fi" />
            </div>
            <div class="fg">
              <label>{{ t('register_lastname') }}</label>
              <input v-model="lastName" type="text" required class="fi" />
            </div>
          </div>

          <div class="fg">
            <label>{{ t('login_email') }}</label>
            <input v-model="email" type="email" required class="fi" autocomplete="email" :placeholder="t('login_email_ph')" />
          </div>

          <div class="fg">
            <label>{{ t('login_password') }}</label>
            <input v-model="password" type="password" required class="fi" minlength="8" :placeholder="t('register_password_ph')" />
            <div v-if="password.length > 0" class="pw-strength">
              <div class="pw-bar">
                <div class="pw-fill" :class="pwStrengthClass" :style="{ width: pwStrengthPct + '%' }"></div>
              </div>
              <span class="pw-label" :class="pwStrengthClass">{{ t(pwStrengthKey) }}</span>
            </div>
          </div>

          <!-- CGU checkbox — RGPD compliant -->
          <label class="cgu-check">
            <input v-model="cguAccepted" type="checkbox" class="cgu-input" />
            <span class="cgu-text">
              {{ t('register_cgu_accept') }}
              <router-link to="/cgu" target="_blank" class="link">{{ t('register_cgu_link') }}</router-link>
              {{ t('register_cgu_and') }}
              <router-link to="/privacy" target="_blank" class="link">{{ t('register_privacy_link') }}</router-link>
            </span>
          </label>

          <button type="submit" class="btn-primary full" :disabled="loading || !cguAccepted">
            <span v-if="loading" class="spinner" />
            <span v-else>{{ t('register_submit') }}</span>
          </button>
        </form>

        <p class="auth-footer">
          {{ t('register_has_account') }}
          <router-link to="/login" class="link">{{ t('login_submit') }}</router-link>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t, locale: currentLocale } = useI18n({ useScope: 'global' })
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)
const success = ref(false)
const cguAccepted = ref(false)

// Password strength
const pwScore = computed(() => {
  const p = password.value
  if (p.length < 8) return 0
  let s = 1
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.min(s, 4)
})
const pwStrengthClass = computed(() => ['', 'pw-weak', 'pw-fair', 'pw-good', 'pw-strong'][pwScore.value] || '')
const pwStrengthPct = computed(() => pwScore.value * 25)
const pwStrengthKey = computed(() => ['', 'register_pw_weak', 'register_pw_fair', 'register_pw_good', 'register_pw_strong'][pwScore.value] || '')

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true

  const result = await authStore.register(
    email.value, password.value,
    firstName.value, lastName.value,
    currentLocale.value
  )

  loading.value = false

  if (result.success) {
    success.value = true
  } else {
    errorMsg.value = result.error
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fb, #ede9fe); padding: 20px; }
.auth-card { background: #fff; border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
.auth-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 32px; }
.auth-brand { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.auth-card h1 { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 6px; }
.auth-sub { font-size: 0.88rem; color: #6b7280; text-align: center; margin-bottom: 28px; }

/* Success */
.success-header { text-align: center; margin-bottom: 20px; }
.success-icon { font-size: 2.5rem; margin-bottom: 12px; }
.email-notice { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 10px; padding: 16px 20px; font-size: 0.88rem; text-align: center; line-height: 1.6; }

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
.fi { padding: 11px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: border-color 0.15s; }
.fi:focus { border-color: #7c3aed; }

/* Password strength */
.pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.pw-bar { flex: 1; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden; }
.pw-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
.pw-fill.pw-weak { background: #ef4444; }
.pw-fill.pw-fair { background: #f59e0b; }
.pw-fill.pw-good { background: #10b981; }
.pw-fill.pw-strong { background: #059669; }
.pw-label { font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.pw-label.pw-weak { color: #ef4444; }
.pw-label.pw-fair { color: #f59e0b; }
.pw-label.pw-good { color: #10b981; }
.pw-label.pw-strong { color: #059669; }

/* CGU checkbox */
.cgu-check { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; margin-top: 4px; }
.cgu-input { margin-top: 3px; accent-color: #7c3aed; width: 16px; height: 16px; flex-shrink: 0; }
.cgu-text { font-size: 0.78rem; color: #6b7280; line-height: 1.5; }

/* Button */
.btn-primary { background: #7c3aed; color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; min-height: 44px; }
.btn-primary:hover:not(:disabled) { background: #6d28d9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary.full { width: 100%; }

.auth-footer { text-align: center; margin-top: 20px; font-size: 0.85rem; color: #6b7280; }
.link { color: #7c3aed; font-weight: 600; text-decoration: none; }
.link:hover { text-decoration: underline; }
.auth-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; margin-bottom: 16px; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .auth-card { padding: 32px 20px; }
  .fg-row { grid-template-columns: 1fr; }
}
</style>
