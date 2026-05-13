<template>
  <div class="integrations-page">
    <header class="integrations-header">
      <h1>{{ t('integ_title') }}</h1>
      <p class="integrations-subtitle">{{ t('integ_subtitle') }}</p>
    </header>
    <div v-if="loading" class="integ-loading"><span class="spinner"></span></div>
    <template v-else>
      <div v-for="cat in catalog" :key="cat.id" class="integ-category">
        <h2 class="integ-category-title"><i :class="'ti ' + cat.icon"></i> {{ cat.displayLabel }}</h2>
        <div class="integ-grid">
          <div v-for="integ in cat.integrations" :key="integ.id" class="integ-card" :class="{ connected: integStore.isConnected(integ.id) }">
            <div class="integ-card-header">
              <div class="integ-icon" :style="{ background: integ.color + '18' }"><i :class="'ti ' + integ.icon" :style="{ color: integ.color }"></i></div>
              <div>
                <h3>{{ integ.name }}</h3>
                <span v-if="integStore.isConnected(integ.id)" class="integ-badge badge-ok">{{ t('integ_connected') }}</span>
                <span v-else class="integ-badge badge-plan">{{ planLabel(integ.plan) }}</span>
              </div>
            </div>
            <p class="integ-desc">{{ integ.label[locale] || integ.label.fr }}</p>
            <div class="integ-caps"><span v-for="cap in integ.capabilities" :key="cap" class="integ-cap"><i :class="'ti ' + getCapIcon(cap)"></i> {{ getCapLabel(cap) }}</span></div>
            <div class="integ-actions">
              <template v-if="integStore.isConnected(integ.id)">
                <button class="btn-config" @click="openSetup(integ)">{{ t('integ_configure') }}</button>
                <button class="btn-disconnect" @click="handleDisconnect(integ)">{{ t('integ_disconnect') }}</button>
              </template>
              <button v-else-if="!planAllows(integ.plan)" class="btn-upgrade" @click="$router.push({ name: 'paywall' })">{{ t('integ_upgrade') }}</button>
              <button v-else class="btn-connect" @click="openSetup(integ)">{{ t('integ_connect') }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="setupModal" class="integ-overlay" @click.self="closeModal">
      <div class="integ-modal">
        <div class="integ-modal-head">
          <div class="integ-modal-title">
            <div class="integ-icon-sm" :style="{ background: setupModal.color + '18' }"><i :class="'ti ' + setupModal.icon" :style="{ color: setupModal.color }"></i></div>
            <h3>{{ setupModal.name }}</h3>
          </div>
          <button @click="closeModal"><i class="ti ti-x"></i></button>
        </div>
        <div class="integ-modal-body">
          <div v-if="setupModal.setupSteps" class="integ-setup-steps">
            <p class="integ-steps-label">{{ t('integ_setup_steps') }}</p>
            <pre class="integ-steps-text">{{ setupModal.setupSteps[locale] || setupModal.setupSteps.fr }}</pre>
            <a v-if="setupModal.helpUrl" :href="setupModal.helpUrl" target="_blank" rel="noopener" class="integ-help-link">{{ t('integ_help_link') }} <i class="ti ti-external-link"></i></a>
          </div>
          <div v-for="field in setupModal.fields" :key="field.key" class="integ-field">
            <label>{{ field.label[locale] || field.label.fr }}</label>
            <input v-model="fieldValues[field.key]" :type="field.type || 'text'" :placeholder="field.placeholder || ''" class="integ-input" />
          </div>
          <p v-if="saveError" class="integ-error">{{ t('integ_save_error') }}</p>
          <p v-if="saveSuccess" class="integ-success">{{ t('integ_save_success') }}</p>
          <div class="integ-modal-actions">
            <button class="btn-connect" :disabled="saving || !allFieldsFilled" @click="handleSave">
              {{ saving ? t('integ_saving') : (integStore.isConnected(setupModal.id) ? t('integ_update') : t('integ_connect')) }}
            </button>
            <button class="btn-ghost" @click="closeModal">{{ t('integ_cancel') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useIntegrationStore } from '@/stores/integrations'
import { getCapabilityInfo } from '@/config/integrations'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const integStore = useIntegrationStore()

const loading = ref(true)
const setupModal = ref(null)
const fieldValues = ref({})
const saving = ref(false)
const saveError = ref(false)
const saveSuccess = ref(false)

const catalog = computed(() => integStore.getCatalog(locale.value))
const planOrder = { starter: 0, growth: 1, elite: 2, enterprise: 3 }

function planAllows(p) { return (planOrder[auth.currentPlan] ?? -1) >= (planOrder[p] ?? 0) }
function planLabel(p) { return { starter: 'Starter+', growth: 'Growth+', elite: 'Elite+' }[p] || p }
function getCapLabel(c) { return getCapabilityInfo(c, locale.value).label }
function getCapIcon(c) { return getCapabilityInfo(c, locale.value).icon }

const allFieldsFilled = computed(() => {
  if (!setupModal.value?.fields) return false
  return setupModal.value.fields.every(f => fieldValues.value[f.key]?.trim())
})

function openSetup(integ) {
  setupModal.value = integ
  saveError.value = false
  saveSuccess.value = false
  const existing = integStore.getConnection(integ.id)
  const vals = {}
  for (const f of integ.fields) { vals[f.key] = existing?.config?.[f.key] || '' }
  fieldValues.value = vals
}

function closeModal() {
  setupModal.value = null
  fieldValues.value = {}
  saveError.value = false
  saveSuccess.value = false
}

async function handleSave() {
  saving.value = true
  saveError.value = false
  saveSuccess.value = false
  try {
    const config = { ...fieldValues.value }
    if (integStore.isConnected(setupModal.value.id)) {
      await integStore.saveConfig(setupModal.value.id, config)
    } else {
      await integStore.connectWebhook(setupModal.value.id, config)
    }
    saveSuccess.value = true
    setTimeout(() => { closeModal() }, 800)
  } catch (e) {
    saveError.value = true
  } finally {
    saving.value = false
  }
}

async function handleDisconnect(integ) {
  if (!confirm(t('integ_disconnect_confirm'))) return
  try { await integStore.disconnect(integ.id) } catch (e) { /* silent */ }
}

onMounted(async () => {
  try { await integStore.loadConnections() } catch (e) { /* silent */ }
  loading.value = false
})
</script>
