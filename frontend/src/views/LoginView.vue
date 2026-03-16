<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon" style="width: 48px; height: 48px; font-size: 24px">⚡</div>
        <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; background: linear-gradient(135deg, var(--teal), var(--blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent">
          Scalyo
        </div>
      </div>

      <h2 style="font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 6px">
        {{ isLogin ? t('loginTitle') : t('registerTitle') }}
      </h2>
      <p style="text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 24px">
        {{ t('noCB') }}
      </p>

      <div v-if="error" style="padding: 10px 14px; background: var(--redBg); border: 1px solid var(--redBorder); border-radius: 10px; color: var(--red); font-size: 13px; margin-bottom: 14px">
        {{ error }}
      </div>

      <template v-if="!isLogin">
        <AppField :label="t('displayName')" v-model="form.display_name" :placeholder="t('namePlaceholder')" />
        <AppField :label="t('companyNameLabel')" v-model="form.company_name" :placeholder="t('companyPlaceholder')" />
        <div class="field-group">
          <label class="field-label">{{ t('csManager') }}</label>
          <div style="display: flex; gap: 8px">
            <button
              v-for="r in ['manager', 'csm']" :key="r"
              class="chip" :class="{ active: form.role === r }"
              @click="form.role = r"
            >{{ r === 'manager' ? 'Manager' : 'CSM' }}</button>
          </div>
        </div>
      </template>

      <AppField :label="t('emailPro')" v-model="form.email" type="email" placeholder="you@company.com" />
      <AppField label="Password" v-model="form.password" type="password" placeholder="••••••••" @enter="submit" />

      <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 8px" :disabled="submitting" @click="submit">
        {{ submitting ? t('saving') : (isLogin ? t('loginBtn') : t('registerBtn')) }}
      </button>

      <p style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--muted)">
        <span style="cursor: pointer; color: var(--teal); font-weight: 600" @click="isLogin = !isLogin">
          {{ isLogin ? t('switchToRegister') : t('switchToLogin') }}
        </span>
      </p>

      <p v-if="!isLogin" style="text-align: center; font-size: 11px; color: var(--muted); margin-top: 12px">
        {{ t('termsAccept') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'
import AppField from '../components/AppField.vue'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const isLogin = ref(true)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  display_name: '',
  company_name: '',
  role: 'manager',
})

async function submit() {
  error.value = ''
  if (!form.email || !form.password) {
    error.value = t('errEmailPass')
    return
  }
  if (!isLogin.value && form.password.length < 8) {
    error.value = t('errPassLength')
    return
  }
  submitting.value = true
  try {
    if (isLogin.value) {
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
  padding: 20px;
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 36px 32px;
}
.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}
</style>
