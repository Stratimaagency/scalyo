<template>
  <div class="sv-panel">
    <!-- Account Info -->
    <div class="sv-section">
      <h3>{{ t('stg_account_info') }}</h3>
      <div class="sv-form">
        <div class="fg">
          <label>{{ t('stg_display_name') }}</label>
          <input v-model="localProfile.displayName" class="fi" />
        </div>
        <div class="fg">
          <label>{{ t('stg_email') }}</label>
          <input v-model="localProfile.email" type="email" class="fi" disabled />
        </div>
        <button class="btn-primary" @click="$emit('save')">{{ t('save') }}</button>
      </div>
    </div>

    <!-- Company -->
    <div class="sv-section">
      <h3>{{ t('stg_company_name') }}</h3>
      <div class="sv-form">
        <div class="fg">
          <label>{{ t('stg_company_name') }}</label>
          <input v-model="localProfile.company" class="fi" />
        </div>
        <button class="btn-primary" @click="$emit('save')">{{ t('save') }}</button>
      </div>
    </div>

    <!-- Password -->
    <div class="sv-section">
      <h3>{{ t('stg_change_pwd') }}</h3>
      <div class="sv-form">
        <div class="fg">
          <label>{{ t('stg_current_pwd') }}</label>
          <input v-model="localPwd.current" type="password" class="fi" />
        </div>
        <div class="fg">
          <label>{{ t('stg_new_pwd') }}</label>
          <input v-model="localPwd.newPwd" type="password" class="fi" />
          <span class="fi-hint">{{ t('stg_pwd_hint') }}</span>
        </div>
        <div class="fg">
          <label>{{ t('stg_confirm_pwd') }}</label>
          <input v-model="localPwd.confirm" type="password" class="fi" />
        </div>
        <button
          class="btn-primary"
          :disabled="!localPwd.current || !localPwd.newPwd || localPwd.newPwd !== localPwd.confirm"
        >
          {{ t('stg_change_btn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  localProfile: { type: Object, required: true },
  localPwd: { type: Object, required: true }
})

defineEmits(['save'])
</script>
