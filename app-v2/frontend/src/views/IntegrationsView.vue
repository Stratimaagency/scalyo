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
          <div v-for="integ in cat.integrations" :key="integ.id" class="integ-card" :class="{ connected: integStore.isConnected(integ.id), coming: integ.status === 'coming_soon' }">
            <div class="integ-card-header">
              <div class="integ-icon" :style="{ background: integ.color + '18' }"><i :class="'ti ' + integ.icon" :style="{ color: integ.color }"></i></div>
              <div>
                <h3>{{ integ.name }}</h3>
                <span v-if="integStore.isConnected(integ.id)" class="integ-badge badge-ok">{{ t('integ_connected') }}</span>
                <span v-else-if="integ.status === 'coming_soon'" class="integ-badge badge-soon">{{ t('integ_coming') }}</span>
                <span v-else class="integ-badge badge-plan">{{ planLabel(integ.plan) }}</span>
              </div>
            </div>
            <p class="integ-desc">{{ integ.label[locale] || integ.label.fr }}</p>
            <div class="integ-caps"><span v-for="cap in integ.capabilities" :key="cap" class="integ-cap"><i :class="'ti ' + getCapIcon(cap)"></i> {{ getCapLabel(cap) }}</span></div>
            <div class="integ-actions">
              <template v-if="integStore.isConnected(integ.id)">
                <button class="btn-config" @click="openConfig(integ)">{{ t('integ_configure') }}</button>
                <button class="btn-disconnect" @click="handleDisconnect(integ)">{{ t('integ_disconnect') }}</button>
              </template>
              <button v-else-if="integ.status === 'coming_soon'" class="btn-soon" disabled>{{ t('integ_coming') }}</button>
              <button v-else-if="!planAllows(integ.plan)" class="btn-upgrade" @click="$router.push({ name: 'paywall' })">{{ t('integ_upgrade') }}</button>
              <button v-else class="btn-connect" @click="handleConnect(integ)">{{ t('integ_connect') }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-if="configModal" class="integ-overlay" @click.self="configModal = null">
      <div class="integ-modal">
        <div class="integ-modal-head"><h3>{{ configModal.name }}</h3><button @click="configModal = null"><i class="ti ti-x"></i></button></div>
        <div class="integ-modal-body">
          <div v-for="field in configModal.configFields" :key="field.key" class="integ-field">
            <label>{{ field.label[locale] || field.label.fr }}</label>
            <input v-if="field.type === 'text'" v-model="configValues[field.key]" :placeholder="field.placeholder || ''" />
            <label v-else-if="field.type === 'toggle'" class="integ-toggle"><input type="checkbox" v-model="configValues[field.key]" /><span class="toggle-track"></span></label>
            <select v-else-if="field.type === 'select'" v-model="configValues[field.key]"><option v-for="o in field.options" :key="o.value" :value="o.value">{{ o.label[locale] || o.label.fr }}</option></select>
          </div>
        </div>
        <div class="integ-modal-foot"><button class="btn-connect" @click="saveCurrentConfig" :disabled="saving">{{ saving ? '...' : t('integ_save') }}</button></div>
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
const configModal = ref(null)
const configValues = ref({})
const saving = ref(false)
const catalog = computed(() => integStore.getCatalog(locale.value))
const planOrder = { starter: 0, growth: 1, elite: 2, enterprise: 3 }
function planAllows(p) { return (planOrder[auth.currentPlan] ?? -1) >= (planOrder[p] ?? 0) }
function planLabel(p) { return { starter: 'Starter+', growth: 'Growth+', elite: 'Elite+' }[p] || p }
function getCapLabel(c) { return getCapabilityInfo(c, locale.value).label }
function getCapIcon(c) { return getCapabilityInfo(c, locale.value).icon }
async function handleConnect(integ) {
  if (integ.webhookBased) { openConfig(integ); return }
  window.location.href = '/api/integrations/connect?provider=' + integ.id
}
async function handleDisconnect(integ) {
  if (!confirm(t('integ_disconnect_confirm'))) return
  try { await integStore.disconnect(integ.id) } catch { /* store.lastError */ }
}
function openConfig(integ) {
  const conn = integStore.getConnection(integ.id)
  const d = {}
  for (const f of integ.configFields || []) d[f.key] = conn?.config?.[f.key] ?? f.default ?? ''
  configValues.value = d
  configModal.value = integ
}
async function saveCurrentConfig() {
  if (!configModal.value) return
  saving.value = true
  try {
    if (integStore.isConnected(configModal.value.id)) await integStore.saveConfig(configModal.value.id, configValues.value)
    else if (configModal.value.webhookBased) await integStore.connectWebhook(configModal.value.id, configValues.value)
    configModal.value = null
  } catch { /* store error */ } finally { saving.value = false }
}
onMounted(async () => { await integStore.loadConnections(); loading.value = false })
</script>
<style scoped>
.integrations-page{max-width:960px;margin:0 auto;padding:2rem 1.5rem}
.integrations-header{margin-bottom:2rem}
.integrations-header h1{font-size:1.5rem;font-weight:700;margin:0 0 .25rem}
.integrations-subtitle{color:var(--text-secondary,#6b7280);margin:0}
.integ-category{margin-bottom:2.5rem}
.integ-category-title{font-size:1.1rem;font-weight:600;margin:0 0 1rem;display:flex;align-items:center;gap:.5rem}
.integ-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem}
.integ-card{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:1.25rem;transition:box-shadow .2s}
.integ-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.06)}
.integ-card.connected{border-color:#059669}
.integ-card.coming{opacity:.6}
.integ-card-header{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.integ-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.25rem}
.integ-card-header h3{font-size:.95rem;font-weight:600;margin:0}
.integ-badge{font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:99px}
.badge-ok{background:#d1fae5;color:#065f46}
.badge-soon{background:#fef3c7;color:#92400e}
.badge-plan{background:#ede9fe;color:#5b21b6}
.integ-desc{font-size:.85rem;color:var(--text-secondary,#6b7280);margin:0 0 .75rem;line-height:1.4}
.integ-caps{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
.integ-cap{font-size:.72rem;background:var(--bg-secondary,#f9fafb);padding:3px 8px;border-radius:6px;display:flex;align-items:center;gap:4px}
.integ-actions{display:flex;gap:.5rem}
.integ-actions button{padding:.45rem .9rem;border-radius:8px;font-size:.82rem;font-weight:600;border:none;cursor:pointer;transition:background .2s}
.btn-connect{background:#7c3aed;color:#fff}
.btn-connect:hover{background:#6d28d9}
.btn-config{background:#f3f4f6;color:#374151}
.btn-disconnect{background:transparent;color:#dc2626;border:1px solid #fecaca!important}
.btn-soon{background:#f3f4f6;color:#9ca3af;cursor:default}
.btn-upgrade{background:#fef3c7;color:#92400e}
.integ-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:50}
.integ-modal{background:var(--bg-primary,#fff);border-radius:16px;width:440px;max-width:90vw;padding:1.5rem}
.integ-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem}
.integ-modal-head h3{margin:0;font-size:1.1rem}
.integ-modal-head button{background:none;border:none;font-size:1.2rem;cursor:pointer}
.integ-field{margin-bottom:1rem}
.integ-field label{display:block;font-size:.82rem;font-weight:600;margin-bottom:.35rem}
.integ-field input[type=text],.integ-field select{width:100%;padding:.55rem .75rem;border:1px solid var(--border,#d1d5db);border-radius:8px;font-size:.85rem}
.integ-toggle{display:flex;align-items:center;gap:.5rem;cursor:pointer}
.integ-toggle input{display:none}
.toggle-track{width:36px;height:20px;background:#d1d5db;border-radius:10px;position:relative;transition:background .2s}
.toggle-track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s}
.integ-toggle input:checked+.toggle-track{background:#7c3aed}
.integ-toggle input:checked+.toggle-track::after{transform:translateX(16px)}
.integ-modal-foot{margin-top:1.25rem;text-align:right}
.integ-loading{text-align:center;padding:3rem}
@media(max-width:640px){.integ-grid{grid-template-columns:1fr}.integ-modal{width:95vw}}
</style>