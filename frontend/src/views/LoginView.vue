<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-logo">
        <ScalyoLogo :markSize="48" :fontSize="28" :gap="12" />
      </div>

      <h2 style="font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 6px">
        {{ mode === 'login' ? t('loginTitle') : mode === 'register' ? t('registerTitle') : mode === 'forgot' ? t('forgotTitle') : t('resetTitle') }}
      </h2>
      <p style="text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 24px">
        {{ mode === 'forgot' ? t('forgotDesc') : mode === 'reset' ? t('resetDesc') : t('noCB') }}
      </p>

      <div v-if="error" style="padding: 10px 14px; background: var(--redBg); border: 1px solid var(--redBorder); border-radius: 10px; color: var(--red); font-size: 13px; margin-bottom: 14px">
        {{ error }}
      </div>

      <div v-if="successMsg" style="padding: 10px 14px; background: var(--greenBg); border: 1px solid var(--greenBorder); border-radius: 10px; color: var(--green); font-size: 13px; margin-bottom: 14px">
        {{ successMsg }}
      </div>

      <!-- REGISTER fields -->
      <template v-if="mode === 'register'">
        <AppField :label="t('displayName')" v-model="form.display_name" :placeholder="t('namePlaceholder')" />
        <AppField :label="t('companyNameLabel')" v-model="form.company_name" :placeholder="t('companyPlaceholder')" />
        <div class="field-group">
          <label class="field-label">{{ t('csManager') }}</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap">
            <button
              v-for="r in roles" :key="r.key"
              class="chip" :class="{ active: form.role === r.key }"
              @click="form.role = r.key"
              :title="r.desc"
            >{{ r.label }}</button>
          </div>
        </div>

        <!-- Plan selection -->
        <div class="field-group">
          <label class="field-label">{{ t('planLabel') }}</label>
          <div class="plan-selector">
            <button
              v-for="p in plans" :key="p.key"
              class="plan-option"
              :class="{ active: form.plan === p.key }"
              @click="form.plan = p.key"
            >
              <div class="plan-option-name">{{ p.name }}</div>
              <div class="plan-option-price">{{ p.price }}</div>
              <div class="plan-option-desc">{{ p.desc }}</div>
            </button>
          </div>
        </div>
      </template>

      <!-- EMAIL (login, register, forgot) -->
      <AppField v-if="mode !== 'reset'" :label="t('emailPro')" v-model="form.email" type="email" placeholder="you@company.com" />

      <!-- PASSWORD (login, register, reset) -->
      <div v-if="mode !== 'forgot'" class="field-group">
        <label class="field-label">{{ mode === 'reset' ? t('newPasswordLabel') : t('passwordLabel') }}</label>
        <div style="position: relative;">
          <input
            class="field-input"
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            placeholder="••••••••"
            @keyup.enter="submit"
            style="padding-right: 40px;"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px; opacity: 0.6;"
            :title="showPassword ? t('hidePassword') : t('showPassword')"
          >{{ showPassword ? '🙈' : '👁️' }}</button>
        </div>
      </div>

      <!-- Forgot password link (login only) -->
      <p v-if="mode === 'login'" style="text-align: right; margin: -4px 0 8px; font-size: 12px;">
        <span style="cursor: pointer; color: var(--teal);" @click="switchMode('forgot')">{{ t('forgotLink') }}</span>
      </p>

      <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 8px" :disabled="submitting" @click="submit">
        {{ submitting ? t('saving') : mode === 'login' ? t('loginBtn') : mode === 'register' ? t('registerBtn') : mode === 'forgot' ? t('sendResetLink') : t('resetBtn') }}
      </button>

      <p style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--muted)">
        <span v-if="mode === 'login'" style="cursor: pointer; color: var(--teal); font-weight: 600" @click="switchMode('register')">
          {{ t('switchToRegister') }}
        </span>
        <span v-else style="cursor: pointer; color: var(--teal); font-weight: 600" @click="switchMode('login')">
          {{ t('switchToLogin') }}
        </span>
      </p>

      <p v-if="mode === 'register'" style="text-align: center; font-size: 11px; color: var(--muted); margin-top: 12px">
        {{ t('termsAccept') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'
import { authApi } from '../api'
import AppField from '../components/AppField.vue'
import ScalyoLogo from '../components/ScalyoLogo.vue'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const mode = ref('login') // login | register | forgot | reset
const resetToken = ref('')
const submitting = ref(false)
const error = ref('')
const successMsg = ref('')
const showPassword = ref(false)

function switchMode(m) {
  mode.value = m
  error.value = ''
  successMsg.value = ''
}

// Handle URL params (verify email, reset password)
onMounted(async () => {
  const params = new URLSearchParams(window.location.search)

  const verifyTokenParam = params.get('verify')
  if (verifyTokenParam) {
    try {
      await authApi.verifyEmail(verifyTokenParam)
      // If already logged in, update store and redirect to dashboard
      if (authStore.isAuthenticated) {
        await authStore.init()
        router.push({ name: 'dashboard' })
        return
      }
      successMsg.value = t('emailVerified')
    } catch {
      error.value = t('emailVerifyError')
    }
    window.history.replaceState({}, '', window.location.pathname)
  }

  const resetParam = params.get('reset')
  if (resetParam) {
    mode.value = 'reset'
    resetToken.value = resetParam
    window.history.replaceState({}, '', window.location.pathname)
  }
})

const plans = computed(() => [
  { key: 'Starter', name: 'Starter', price: '97€/mois', desc: t('planStarterDesc') },
  { key: 'Growth', name: 'Growth', price: '297€/mois', desc: t('planGrowthDesc') },
  { key: 'Elite', name: 'Elite', price: '697€/mois', desc: t('planEliteDesc') },
])

const roles = computed(() => [
  { key: 'manager', label: t('roleManager'), desc: t('roleManagerDesc') },
  { key: 'csm', label: t('roleCSM'), desc: t('roleCsmDesc') },
  { key: 'commercial', label: t('roleCommercial'), desc: t('roleCommercialDesc') },
  { key: 'kam', label: t('roleKAM'), desc: t('roleKamDesc') },
])

const form = reactive({
  email: '',
  password: '',
  display_name: '',
  company_name: '',
  role: 'manager',
  plan: 'Starter',
})

async function submit() {
  error.value = ''
  successMsg.value = ''
  submitting.value = true

  try {
    if (mode.value === 'forgot') {
      if (!form.email) { error.value = t('enterEmail'); submitting.value = false; return }
      await authApi.forgotPassword(form.email)
      successMsg.value = t('resetEmailSent')
      submitting.value = false
      return
    }

    if (mode.value === 'reset') {
      if (!form.password || form.password.length < 8) { error.value = t('passMinLength'); submitting.value = false; return }
      await authApi.resetPassword(resetToken.value, form.password)
      successMsg.value = t('passChanged')
      mode.value = 'login'
      form.password = ''
      submitting.value = false
      return
    }

    if (!form.email || !form.password) {
      error.value = t('errEmailPass')
      submitting.value = false
      return
    }
    if (mode.value === 'register' && form.password.length < 8) {
      error.value = t('errPassLength')
      submitting.value = false
      return
    }

    if (mode.value === 'login') {
      await authStore.login(form.email, form.password)
    } else {
      if (!form.display_name || !form.company_name) {
        error.value = t('errAllFields')
        submitting.value = false
        return
      }
      await authStore.register(form)
    }
    router.push({ name: 'dashboard' })
  } catch (e) {
    if (e.response?.status === 401) {
      error.value = t('errInvalidCreds')
    } else if (e.response?.status === 400) {
      const data = e.response?.data
      if (data?.error) {
        error.value = data.error
      } else if (data?.email) {
        error.value = Array.isArray(data.email) ? data.email[0] : data.email
      } else {
        error.value = t('errCreation')
      }
    } else {
      error.value = e.response?.data?.error || t('errNetwork')
    }
  }
  submitting.value = false
}
</script>

<style scoped>
.login-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  background-image: radial-gradient(ellipse 90% 60% at 50% -5%, rgba(77,182,160,0.06), transparent);
  padding: 20px;
}
.login-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 40px 36px;
}
.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}
.plan-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.plan-option {
  padding: 12px 8px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.plan-option:hover {
  border-color: var(--teal);
}
.plan-option.active {
  border-color: var(--teal);
  background: rgba(77, 182, 160, 0.08);
}
.plan-option-name {
  font-weight: 800;
  font-size: 14px;
  margin-bottom: 2px;
}
.plan-option-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--teal);
  margin-bottom: 4px;
}
.plan-option-desc {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.3;
}
</style>
