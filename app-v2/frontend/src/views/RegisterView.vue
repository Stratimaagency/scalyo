<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo"><ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span></div>
      <h1>{{ t('reg_title') }}</h1>
      <p class="auth-sub">{{ t('reg_subtitle') }}</p>
      <form @submit.prevent="register" class="auth-form">
        <div class="fr">
          <div class="fg"><label>{{ t('reg_firstname') }}</label><input v-model="form.firstName" required class="fi" /></div>
          <div class="fg"><label>{{ t('reg_lastname') }}</label><input v-model="form.lastName" required class="fi" /></div>
        </div>
        <div class="fg"><label>{{ t('reg_email') }}</label><input v-model="form.email" type="email" required class="fi" :placeholder="t('login_email_ph')" /></div>
        <div class="fg"><label>{{ t('reg_company') }}</label><input v-model="form.company" required class="fi" /></div>
        <div class="fg"><label>{{ t('login_password') }}</label><input v-model="form.password" type="password" required class="fi" :placeholder="t('reg_pwd_hint')" minlength="8" /></div>
        <div class="fg"><label>{{ t('reg_plan') }}</label>
          <div class="plan-selector">
            <button type="button" v-for="p in plans" :key="p.key" class="plan-opt" :class="{ active: form.plan === p.key }" @click="form.plan = p.key">
              <strong>{{ p.name }}</strong><span>{{ p.price }}</span>
            </button>
          </div>
        </div>
        <button type="submit" class="btn-primary full">{{ t('reg_submit') }}</button>
      </form>
      <p class="auth-footer">{{ t('reg_has_account') }} <router-link to="/login" class="link">{{ t('login_submit') }}</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t } = useI18n({ useScope: 'global' })

const router = useRouter()
const form = reactive({ firstName: '', lastName: '', email: '', company: '', password: '', plan: 'growth' })
const plans = [
  { key: 'starter', name: 'Starter', price: '97€/mois' },
  { key: 'growth', name: 'Growth', price: '297€/mois' },
  { key: 'elite', name: 'Elite', price: '697€/mois' },
]

function register() { router.push('/app/dashboard') }
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fb, #ede9fe); padding: 20px; }
.auth-card { background: #fff; border-radius: 20px; padding: 40px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
.auth-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 24px; }
.auth-brand { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.auth-card h1 { font-size: 1.4rem; font-weight: 800; text-align: center; margin-bottom: 4px; }
.auth-sub { font-size: 0.85rem; color: #6b7280; text-align: center; margin-bottom: 24px; }
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
.fi { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; outline: none; width: 100%; }
.fi:focus { border-color: #7c3aed; }
.fr { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.btn-primary { background: #7c3aed; color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: #6d28d9; }
.btn-primary.full { width: 100%; }
.auth-footer { text-align: center; margin-top: 18px; font-size: 0.85rem; color: #6b7280; }
.link { color: #7c3aed; font-weight: 600; }
.plan-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.plan-opt { background: #f8f9fb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 12px 8px; text-align: center; cursor: pointer; transition: all 0.2s; }
.plan-opt:hover { border-color: #a78bfa; }
.plan-opt.active { border-color: #7c3aed; background: rgba(124,58,237,0.06); }
.plan-opt strong { display: block; font-size: 0.85rem; margin-bottom: 2px; }
.plan-opt span { font-size: 0.72rem; color: #6b7280; }
.plan-opt.active span { color: #7c3aed; }
</style>
