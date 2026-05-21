<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span>
      </div>

      <div v-if="loading" class="join-loading"><span class="spinner" /> {{ t('join_verifying') }}</div>

      <div v-else-if="error" class="auth-error">{{ error }}</div>

      <template v-else-if="invitation">
        <div v-if="accepted" class="success-header">
          <div class="success-icon">\u2705</div>
          <h1>{{ t('join_success_title') }}</h1>
          <p class="auth-sub">{{ t('join_success_subtitle') }}</p>
          <router-link to="/login" class="btn-primary full" style="margin-top:20px;text-decoration:none">{{ t('login_submit') }}</router-link>
        </div>

        <template v-else>
          <h1>{{ t('join_title') }}</h1>
          <div class="join-info">
            <p class="join-org">{{ invitation.organization }}</p>
            <p class="join-role">{{ t('join_role_' + invitation.role) }}</p>
          </div>
          <p class="auth-sub">{{ t('join_subtitle') }}</p>

          <div v-if="registerError" class="auth-error">{{ registerError }}</div>

          <form @submit.prevent="handleJoin" class="auth-form">
            <div class="fg-row">
              <div class="fg"><label>{{ t('register_firstname') }}</label><input v-model="firstName" type="text" required class="fi" /></div>
              <div class="fg"><label>{{ t('register_lastname') }}</label><input v-model="lastName" type="text" required class="fi" /></div>
            </div>
            <div class="fg"><label>{{ t('login_email') }}</label><input :value="invitation.email" type="email" disabled class="fi" style="opacity:0.6" /></div>
            <div class="fg"><label>{{ t('login_password') }}</label><input v-model="password" type="password" required class="fi" minlength="8" :placeholder="t('register_password_ph')" /></div>
            <label class="cgu-check"><input v-model="cguAccepted" type="checkbox" class="cgu-input" /><span class="cgu-text">{{ t('register_cgu_accept') }} <router-link to="/cgu" target="_blank" class="link">{{ t('register_cgu_link') }}</router-link> {{ t('register_cgu_and') }} <router-link to="/privacy" target="_blank" class="link">{{ t('register_privacy_link') }}</router-link></span></label>
            <button type="submit" class="btn-primary full" :disabled="joining || !cguAccepted"><span v-if="joining" class="spinner" /><span v-else>{{ t('join_submit') }}</span></button>
          </form>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const invitation = ref(null)
const firstName = ref('')
const lastName = ref('')
const password = ref('')
const cguAccepted = ref(false)
const joining = ref(false)
const accepted = ref(false)
const registerError = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) { error.value = t('join_no_token'); loading.value = false; return }
  try {
    const resp = await fetch('/api/invite/verify?token=' + token)
    const data = await resp.json()
    if (resp.ok && data.valid) { invitation.value = { ...data, token } }
    else { error.value = data.error || t('join_invalid') }
  } catch { error.value = t('join_error') }
  finally { loading.value = false }
})

async function handleJoin() {
  if (joining.value || !cguAccepted.value) return
  registerError.value = ''
  joining.value = true
  try {
    const result = await authStore.register(invitation.value.email, password.value, firstName.value, lastName.value, locale.value)
    if (!result.success) { registerError.value = result.error; joining.value = false; return }
    // Accept invitation
    const session = authStore.session
    if (session?.access_token) {
      await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body: JSON.stringify({ token: invitation.value.token })
      })
    }
    accepted.value = true
  } catch (e) { registerError.value = e.message }
  finally { joining.value = false }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fb, #ede9fe); padding: 20px; }
.auth-card { background: var(--bg-card); border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
.auth-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 32px; }
.auth-brand { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.auth-card h1 { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 6px; }
.auth-sub { font-size: 0.88rem; color: var(--text-secondary); text-align: center; margin-bottom: 28px; }
.join-loading { text-align: center; padding: 40px 0; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 10px; }
.join-info { text-align: center; margin-bottom: 20px; }
.join-org { font-size: 1.1rem; font-weight: 700; color: #111827; }
.join-role { font-size: 0.82rem; color: #7c3aed; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
.success-header { text-align: center; }
.success-icon { font-size: 2.5rem; margin-bottom: 12px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.9rem; outline: none; transition: border-color 0.15s; }
.fi:focus { border-color: #7c3aed; }
.cgu-check { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; margin-top: 4px; }
.cgu-input { margin-top: 3px; accent-color: #7c3aed; width: 16px; height: 16px; flex-shrink: 0; }
.cgu-text { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; min-height: 44px; }
.btn-primary:hover:not(:disabled) { background: #6d28d9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary.full { width: 100%; }
.link { color: #7c3aed; font-weight: 600; text-decoration: none; }
.auth-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; margin-bottom: 16px; text-align: center; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .auth-card { padding: 32px 20px; } .fg-row { grid-template-columns: 1fr; } }
</style>