<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo"><ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span></div>
      <h1>{{ t('login_title') }}</h1>
      <p class="auth-sub">{{ t('login_subtitle') }}</p>
      <form @submit.prevent="login" class="auth-form">
        <div class="fg"><label>{{ t('login_email') }}</label><input v-model="email" type="email" required class="fi" :placeholder="t('login_email_ph')" /></div>
        <div class="fg"><label>{{ t('login_password') }}</label><input v-model="password" type="password" required class="fi" placeholder="••••••••" /></div>
        <button type="submit" class="btn-primary full">{{ t('login_submit') }}</button>
      </form>
      <p class="auth-footer">{{ t('login_no_account') }} <router-link to="/register" class="link">{{ t('login_signup') }}</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t } = useI18n({ useScope: 'global' })

const router = useRouter()
const email = ref('')
const password = ref('')

function login() {
  // Mock login — go straight to dashboard
  router.push('/app/dashboard')
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fb, #ede9fe); padding: 20px; }
.auth-card { background: #fff; border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
.auth-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 32px; }
.auth-brand { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.auth-card h1 { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 6px; }
.auth-sub { font-size: 0.88rem; color: #6b7280; text-align: center; margin-bottom: 28px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
.fi { padding: 11px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: border-color 0.15s; }
.fi:focus { border-color: #7c3aed; }
.btn-primary { background: #7c3aed; color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: #6d28d9; transform: translateY(-1px); }
.btn-primary.full { width: 100%; }
.auth-footer { text-align: center; margin-top: 20px; font-size: 0.85rem; color: #6b7280; }
.link { color: #7c3aed; font-weight: 600; }
</style>
