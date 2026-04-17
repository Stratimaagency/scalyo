<template>
  <div class="auth-page">
    <div class="auth-card" :class="{ 'auth-card--wide': success }">

      <div class="auth-logo">
        <ScalyoLogo :size="48" /><span class="auth-brand">Scalyo</span>
      </div>

      <!-- Étape succès : choisir un forfait -->
      <template v-if="success">
        <div class="success-header">
          <div class="success-check">✅</div>
          <h1>{{ t('register_success_title') }}</h1>
          <p class="auth-sub">{{ t('register_success_subtitle') }}</p>
          <div class="email-notice">
            📧 {{ t('register_check_email') }}
          </div>
        </div>

        <h2 class="plans-title">{{ t('register_choose_plan') }}</h2>

        <div class="plans-grid">
          <!-- Starter -->
          <div class="plan-card">
            <div class="plan-badge">⭐</div>
            <div class="plan-name">Starter</div>
            <div class="plan-price">97€<span class="plan-period">/{{ t('profile_month') }}</span></div>
            <ul class="plan-features">
              <li>✓ {{ t('plan_feat_10clients') }}</li>
              <li>✓ {{ t('plan_feat_import') }}</li>
              <li>✓ {{ t('plan_feat_basic') }}</li>
            </ul>
            <a :href="starterUrl" target="_blank" class="btn-plan btn-plan--starter">
              {{ t('register_select_plan') }} →
            </a>
          </div>

          <!-- Growth -->
          <div class="plan-card plan-card--featured">
            <div class="plan-popular">{{ t('register_most_popular') }}</div>
            <div class="plan-badge">🚀</div>
            <div class="plan-name">Growth</div>
            <div class="plan-price">297€<span class="plan-period">/{{ t('profile_month') }}</span></div>
            <ul class="plan-features">
              <li>✓ {{ t('plan_feat_50clients') }}</li>
              <li>✓ {{ t('plan_feat_ai') }}</li>
              <li>✓ {{ t('plan_feat_copil') }}</li>
            </ul>
            <a :href="growthUrl" target="_blank" class="btn-plan btn-plan--growth">
              {{ t('register_select_plan') }} →
            </a>
          </div>

          <!-- Elite -->
          <div class="plan-card">
            <div class="plan-badge">🏆</div>
            <div class="plan-name">Elite</div>
            <div class="plan-price">697€<span class="plan-period">/{{ t('profile_month') }}</span></div>
            <ul class="plan-features">
              <li>✓ {{ t('plan_feat_unlimited') }}</li>
              <li>✓ {{ t('plan_feat_ai') }}</li>
              <li>✓ {{ t('plan_feat_support') }}</li>
            </ul>
            <a :href="eliteUrl" target="_blank" class="btn-plan btn-plan--elite">
              {{ t('register_select_plan') }} →
            </a>
          </div>
        </div>

        <p class="plans-footer">
          {{ t('register_confirm_email_first') }}
          <router-link to="/login" class="link">{{ t('register_go_login') }}</router-link>
        </p>
      </template>

      <!-- Étape formulaire -->
      <template v-else>
        <h1>{{ t('register_title') }}</h1>
        <p class="auth-sub">{{ t('register_subtitle') }}</p>
        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="fg-row">
            <div class="fg"><label>{{ t('register_firstname') }}</label><input v-model="firstName" type="text" required class="fi" /></div>
            <div class="fg"><label>{{ t('register_lastname') }}</label><input v-model="lastName" type="text" required class="fi" /></div>
          </div>
          <div class="fg"><label>{{ t('login_email') }}</label><input v-model="email" type="email" required class="fi" autocomplete="email" /></div>
          <div class="fg"><label>{{ t('login_password') }}</label><input v-model="password" type="password" required class="fi" minlength="8" placeholder="8 caractères minimum" /></div>
          <button type="submit" class="btn-primary full" :disabled="loading">
            <span v-if="loading" class="spinner" />
            <span v-else>{{ t('register_submit') }}</span>
          </button>
        </form>
        <p class="auth-footer">{{ t('register_has_account') }} <router-link to="/login" class="link">{{ t('login_submit') }}</router-link></p>
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

// Stripe payment links with email prefill
const starterUrl = computed(() => {
  const base = 'https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01'
  return email.value ? base + '?prefilled_email=' + encodeURIComponent(email.value) : base
})
const growthUrl = computed(() => {
  const base = 'https://buy.stripe.com/eVqbJ10LN6ln5et90gdfG00'
  return email.value ? base + '?prefilled_email=' + encodeURIComponent(email.value) : base
})
const eliteUrl = computed(() => {
  const base = 'https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05'
  return email.value ? base + '?prefilled_email=' + encodeURIComponent(email.value) : base
})

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true
  const result = await authStore.register(email.value, password.value, firstName.value, lastName.value, currentLocale.value)
  loading.value = false
  if (result.success) {
    success.value = true
  } else {
    errorMsg.value = result.error
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fb, #ede9fe);
  padding: 20px;
}
.auth-card {
  background: #fff;
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
.auth-card--wide { max-width: 900px; }
.auth-logo { display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:32px; }
.auth-brand { font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,#7c3aed,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
.auth-card h1 { font-size:1.5rem;font-weight:800;text-align:center;margin-bottom:6px; }
.auth-sub { font-size:0.88rem;color:#6b7280;text-align:center;margin-bottom:28px; }
/* Succès */
.success-header { text-align: center; margin-bottom: 28px; }
.success-check { font-size: 2.5rem; margin-bottom: 12px; }
.success-header h1 { margin-bottom: 8px; }
.email-notice {
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;
  border-radius: 8px; padding: 10px 16px; font-size: 0.84rem; margin-top: 12px;
}
.plans-title { font-size: 1.1rem; font-weight: 700; text-align: center; margin-bottom: 20px; color: #111827; }
.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.plan-card {
  border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px 18px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  position: relative; transition: all 0.2s;
}
.plan-card--featured { border-color: #7c3aed; box-shadow: 0 4px 20px rgba(124,58,237,0.15); }
.plan-popular {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: #7c3aed; color: #fff; font-size: 0.72rem; font-weight: 700;
  padding: 3px 12px; border-radius: 20px; white-space: nowrap;
}
.plan-badge { font-size: 1.6rem; }
.plan-name { font-size: 1rem; font-weight: 800; }
.plan-price { font-size: 1.5rem; font-weight: 800; color: #7c3aed; }
.plan-period { font-size: 0.78rem; font-weight: 400; color: #6b7280; }
.plan-features { list-style: none; padding: 0; margin: 0; width: 100%; display: flex; flex-direction: column; gap: 4px; }
.plan-features li { font-size: 0.78rem; color: #374151; }
.btn-plan {
  display: block; width: 100%; text-align: center; text-decoration: none;
  padding: 10px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 700;
  margin-top: 8px; transition: all 0.2s;
}
.btn-plan--starter { background: #ede9fe; color: #5b21b6; }
.btn-plan--starter:hover { background: #7c3aed; color: #fff; }
.btn-plan--growth { background: #7c3aed; color: #fff; }
.btn-plan--growth:hover { background: #6d28d9; transform: translateY(-1px); }
.btn-plan--elite { background: #1f2937; color: #fff; }
.btn-plan--elite:hover { background: #111827; transform: translateY(-1px); }
.plans-footer { text-align: center; font-size: 0.82rem; color: #6b7280; margin-top: 8px; }
/* Formulaire */
.auth-form { display:flex;flex-direction:column;gap:16px; }
.fg-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
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
@media (max-width: 640px) { .plans-grid { grid-template-columns: 1fr; } .auth-card--wide { padding: 32px 20px; } }
</style>