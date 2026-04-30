<template>
  <div class="integ-view">
    <div class="iv-header">
      <h1>🔌 {{ t('integ_title') }}</h1>
      <p class="iv-sub">{{ t('integ_subtitle') }}</p>
    </div>

    <!-- Tabs -->
    <div class="iv-tabs">
      <button class="iv-tab" :class="{ active: tab === 'api' }" @click="tab = 'api'">
        🔑 API REST
      </button>
      <button class="iv-tab" :class="{ active: tab === 'webhook' }" @click="tab = 'webhook'">
        ⚡ Webhooks
      </button>
      <button class="iv-tab" :class="{ active: tab === 'import' }" @click="tab = 'import'">
        📥 Import CSV
      </button>
    </div>

    <!-- API REST -->
    <IntegApiTab
      v-if="tab === 'api'"
      :api-keys="apiKeys"
      :api-base-url="apiBaseUrl"
      :new-key-value="newKeyValue"
      :key-copied="newKeyCopied"
      @open-create="showCreateKey = true"
      @revoke="revokeKey"
      @key-copied="newKeyCopied = true"
    />

    <!-- Webhooks -->
    <IntegWebhookTab
      v-else-if="tab === 'webhook'"
      :webhooks="webhooks"
      :webhook-base-url="webhookBaseUrl"
      @create="createWebhook"
      @delete="deleteWebhook"
    />

    <!-- Import CSV -->
    <div v-else-if="tab === 'import'" class="iv-section">
      <div class="iv-card">
        <h2>📥 {{ t('integ_import_title') }}</h2>
        <p class="iv-card-sub">{{ t('integ_import_desc') }}</p>
        <router-link to="/app/import" class="btn-goto-import">
          🤖 {{ t('integ_goto_import') }} →
        </router-link>
      </div>
    </div>

    <!-- Create Key Modal -->
    <IntegCreateKeyModal
      :open="showCreateKey"
      @close="showCreateKey = false"
      @create="createApiKey"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import IntegApiTab from '@/components/integrations/IntegApiTab.vue'
import IntegWebhookTab from '@/components/integrations/IntegWebhookTab.vue'
import IntegCreateKeyModal from '@/components/integrations/IntegCreateKeyModal.vue'
import '@/assets/integrations.css'

const { t } = useI18n({ useScope: 'global' })

const tab = ref('api')
const apiKeys = ref([])
const webhooks = ref([])
const showCreateKey = ref(false)
const newKeyValue = ref('')
const newKeyCopied = ref(false)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const apiBaseUrl = computed(() => SUPABASE_URL + '/functions/v1/scalyo-api')
const webhookBaseUrl = computed(() => SUPABASE_URL + '/functions/v1/scalyo-webhook')

async function loadApiKeys() {
  const { data } = await supabase
    .from('api_keys').select('*').eq('is_active', true)
    .order('created_at', { ascending: false })
  if (data) apiKeys.value = data
}

async function loadWebhooks() {
  const { data } = await supabase
    .from('webhooks').select('*')
    .order('created_at', { ascending: false })
  if (data) webhooks.value = data
}

async function createApiKey({ name, scopes }) {
  const rawKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  const prefix = rawKey.slice(0, 12)
  const keyBytes = new TextEncoder().encode(rawKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes)
  const keyHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase.from('api_keys').insert([{
    name, key_hash: keyHash, key_prefix: prefix, scopes
  }])
  if (!error) {
    newKeyValue.value = rawKey
    newKeyCopied.value = false
    showCreateKey.value = false
    await loadApiKeys()
  }
}

async function revokeKey(id) {
  if (!confirm(t('integ_revoke_confirm'))) return
  await supabase.from('api_keys').update({ is_active: false }).eq('id', id)
  await loadApiKeys()
}

async function createWebhook() {
  const secret = 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  const { error } = await supabase.from('webhooks').insert([{
    name: 'Webhook Zapier/Make', secret,
    events: ['client.created', 'client.updated', 'task.created']
  }])
  if (!error) await loadWebhooks()
}

async function deleteWebhook(id) {
  if (!confirm(t('integ_delete_webhook_confirm'))) return
  await supabase.from('webhooks').delete().eq('id', id)
  await loadWebhooks()
}

onMounted(() => { loadApiKeys(); loadWebhooks() })
</script>
