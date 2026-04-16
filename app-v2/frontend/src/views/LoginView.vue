<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo"><ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span></div>
      <h1>{{ t('login_title') }}</h1>
      <p class="auth-sub">{{ t('login_subtitle') }}</p>
      <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="fg"><label>{{ t('login_email') }}</label><input v-model="email" type="email" required class="fi" :placeholder="t('login_email_ph')" autocomplete="email" /></div>
        <div class="fg"><label>{{ t('login_password') }}</label><input v-model="password" type="password" required class="fi" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="current-password" /></div>
        <button type="submit" class="btn-primary full" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span v-else>{{ t('login_submit') }}</span>
        </button>
      </form>
      <p class="auth-footer">{{ t('login_no_account') }} <router-link to="/register" class="link">{{ t('login_signup') }}</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  const result = await authStore.login(email.value, password.value)
  loading.value = false
  if (result.success) { router.push('/app/dashboard') }
  else { errorMsg.value = result.error }
}
</script>

<style scoped>
.auth-page { min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f8f9fb,#ede9fe);padding:20px; }
.auth-card { background:#fff;border-radius:20px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.08); }
.auth-logo { display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:32px; }
.auth-brand { font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,#7c3aed,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
.auth-card h1 { font-size:1.5rem;font-weight:800;text-align:center;margin-bottom:6px; }
.auth-sub { font-size:0.88rem;color:#6b7280;text-align:center;margin-bottom:28px; }
.auth-form { display:flex;flex-direction:column;gap:16px; }
.fg { display:flex;flex-direction:column;gap:4px; }
.fg label { font-size:0.78rem;font-weight:600;color:#6b7280; }
.fi { padding:11px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:0.9rem;outline:none;transition:border-color 0.15s; }
.fi:focus { border-color:#7c3aed; }
.btn-primary { background:#7c3aed;color:#fff;border:none;padding:12px;border-radius:10px;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;min-height:44px; }
.btn-primary:hover:not(:disabled) { background:#6d28d9;transform:translateY(-1px); }
.btn-primary:disabled { opacity:0.65;cursor:not-allowed; }
.btn-primary.full { width:100%; }
.auth-footer { text-align:center;margin-top:20px;font-size:0.85rem;color:#6b7280; }
.link { color:#7c3aed;font-weight:600; }
.auth-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:10px 14px;font-size:0.85rem;margin-bottom:16px; }
.spinner { width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>