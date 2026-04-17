<template>
  <div class="integ-view">
    <div class="iv-header">
      <h1>🔌 {{ t('integ_title') }}</h1>
      <p class="iv-sub">{{ t('integ_subtitle') }}</p>
    </div>

    <!-- ─── Tabs ──────────────────────────────────────────────── -->
    <div class="iv-tabs">
      <button class="iv-tab" :class="{ active: tab === 'api' }" @click="tab = 'api'">🔑 API REST</button>
      <button class="iv-tab" :class="{ active: tab === 'webhook' }" @click="tab = 'webhook'">⚡ Webhooks (Zapier/Make)</button>
      <button class="iv-tab" :class="{ active: tab === 'import' }" @click="tab = 'import'">📥 Import CSV</button>
    </div>

    <!-- ─── API REST (Option C) ──────────────────────────────── -->
    <div v-if="tab === 'api'" class="iv-section">
      <div class="iv-card">
        <div class="iv-card-header">
          <div>
            <h2>🔑 {{ t('integ_api_title') }}</h2>
            <p class="iv-card-sub">{{ t('integ_api_desc') }}</p>
          </div>
          <button class="btn-create-key" @click="showCreateKey = true">+ {{ t('integ_create_key') }}</button>
        </div>

        <!-- Base URL -->
        <div class="iv-info-box">
          <span class="iv-info-label">Base URL</span>
          <code class="iv-code">{{ apiBaseUrl }}</code>
          <button class="btn-copy-sm" @click="copy(apiBaseUrl)">📋</button>
        </div>

        <!-- Keys list -->
        <div v-if="apiKeys.length === 0" class="iv-empty">
          <p>{{ t('integ_no_keys') }}</p>
        </div>
        <div v-else class="iv-keys-list">
          <div v-for="key in apiKeys" :key="key.id" class="iv-key-row">
            <div class="iv-key-info">
              <span class="iv-key-name">{{ key.name }}</span>
              <code class="iv-key-prefix">{{ key.key_prefix }}••••••••</code>
              <span class="iv-key-scopes">{{ key.scopes?.join(', ') }}</span>
            </div>
            <div class="iv-key-meta">
              <span class="iv-key-date">Créée {{ formatDate(key.created_at) }}</span>
              <span v-if="key.last_used_at" class="iv-key-used">Utilisée {{ formatDate(key.last_used_at) }}</span>
              <span v-else class="iv-key-unused">Jamais utilisée</span>
            </div>
            <button class="btn-revoke" @click="revokeKey(key.id)" :title="t('integ_revoke_key')">🗑️</button>
          </div>
        </div>

        <!-- New key reveal -->
        <div v-if="newKeyValue" class="iv-new-key-reveal">
          <p>⚠️ {{ t('integ_key_shown_once') }}</p>
          <code class="iv-new-key-code">{{ newKeyValue }}</code>
          <button class="btn-copy" @click="copy(newKeyValue); newKeyCopied = true">
            {{ newKeyCopied ? '✓ Copié !' : '📋 Copier la clé' }}
          </button>
        </div>

        <!-- Documentation -->
        <div class="iv-doc-section">
          <h3>📖 Endpoints disponibles</h3>
          <div class="iv-endpoints">
            <div v-for="ep in endpoints" :key="ep.method + ep.path" class="iv-endpoint">
              <span class="iv-method" :class="ep.method.toLowerCase()">{{ ep.method }}</span>
              <code class="iv-path">{{ ep.path }}</code>
              <span class="iv-ep-desc">{{ ep.desc }}</span>
            </div>
          </div>
          <div class="iv-example">
            <h4>Exemple curl</h4>
            <code class="iv-code-block">curl -H "x-api-key: sk_..." {{ apiBaseUrl }}/clients</code>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Webhooks (Option B) ──────────────────────────────── -->
    <div v-if="tab === 'webhook'" class="iv-section">
      <div class="iv-card">
        <div class="iv-card-header">
          <div>
            <h2>⚡ {{ t('integ_webhook_title') }}</h2>
            <p class="iv-card-sub">{{ t('integ_webhook_desc') }}</p>
          </div>
          <button class="btn-create-key" @click="createWebhook">+ {{ t('integ_create_webhook') }}</button>
        </div>

        <div v-if="webhooks.length === 0" class="iv-empty">
          <p>{{ t('integ_no_webhooks') }}</p>
        </div>

        <div v-for="wh in webhooks" :key="wh.id" class="iv-webhook-row">
          <div class="iv-wh-info">
            <span class="iv-key-name">{{ wh.name }}</span>
            <div class="iv-wh-url-row">
              <span class="iv-info-label">URL</span>
              <code class="iv-code-sm">{{ getWebhookUrl(wh) }}</code>
              <button class="btn-copy-sm" @click="copy(getWebhookUrl(wh))">📋</button>
            </div>
            <div class="iv-wh-url-row">
              <span class="iv-info-label">Secret</span>
              <code class="iv-code-sm">{{ wh.secret }}</code>
              <button class="btn-copy-sm" @click="copy(wh.secret)">📋</button>
            </div>
          </div>
          <div class="iv-key-meta">
            <span>{{ wh.trigger_count || 0 }} appels</span>
            <span v-if="wh.last_triggered_at">Dernier: {{ formatDate(wh.last_triggered_at) }}</span>
          </div>
          <button class="btn-revoke" @click="deleteWebhook(wh.id)">🗑️</button>
        </div>

        <!-- Instructions Zapier/Make -->
        <div class="iv-doc-section">
          <h3>🔧 Comment connecter Zapier ou Make</h3>
          <div class="iv-steps">
            <div class="iv-step">
              <span class="iv-step-num">1</span>
              <div>Dans Zapier → Créer un Zap → Choisir "Webhooks by Zapier" comme trigger ou action</div>
            </div>
            <div class="iv-step">
              <span class="iv-step-num">2</span>
              <div>Coller l'URL webhook Scalyo + ajouter le header <code>x-webhook-secret: [votre secret]</code></div>
            </div>
            <div class="iv-step">
              <span class="iv-step-num">3</span>
              <div>Paramètre URL <code>event</code> : <code>client.created</code> | <code>client.updated</code> | <code>task.created</code></div>
            </div>
            <div class="iv-step">
              <span class="iv-step-num">4</span>
              <div>Les données sont automatiquement importées dans votre Scalyo</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Import CSV ───────────────────────────────────────── -->
    <div v-if="tab === 'import'" class="iv-section">
      <div class="iv-card">
        <h2>📥 {{ t('integ_import_title') }}</h2>
        <p class="iv-card-sub">{{ t('integ_import_desc') }}</p>
        <router-link to="/app/import" class="btn-goto-import">
          🤖 {{ t('integ_goto_import') }} →
        </router-link>
      </div>
    </div>

    <!-- ─── Modal créer clé ──────────────────────────────────── -->
    <div v-if="showCreateKey" class="modal-overlay" @click.self="showCreateKey = false">
      <div class="modal-card">
        <h3>🔑 {{ t('integ_create_key') }}</h3>
        <div class="modal-form">
          <div class="fg">
            <label>{{ t('integ_key_name') }}</label>
            <input v-model="newKeyName" type="text" class="modal-input" placeholder="Ex: HubSpot, Zapier..." />
          </div>
          <div class="fg">
            <label>{{ t('integ_key_scopes') }}</label>
            <div class="scope-toggles">
              <label class="scope-toggle">
                <input type="checkbox" v-model="newKeyScopes" value="read" /> Lecture (GET)
              </label>
              <label class="scope-toggle">
                <input type="checkbox" v-model="newKeyScopes" value="write" /> Écriture (POST/PUT/DELETE)
              </label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showCreateKey = false">Annuler</button>
          <button class="btn-save" @click="createApiKey" :disabled="!newKeyName || newKeyScopes.length === 0">
            Générer la clé
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'

const { t } = useI18n({ useScope: 'global' })

const tab = ref('api')
const apiKeys = ref([])
const webhooks = ref([])
const showCreateKey = ref(false)
const newKeyName = ref('')
const newKeyScopes = ref(['read', 'write'])
const newKeyValue = ref('')
const newKeyCopied = ref(false)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const apiBaseUrl = computed(() => SUPABASE_URL + '/functions/v1/scalyo-api')
const webhookBaseUrl = computed(() => SUPABASE_URL + '/functions/v1/scalyo-webhook')

const endpoints = [
  { method: 'GET', path: '/clients', desc: 'Lister tous vos clients' },
  { method: 'POST', path: '/clients', desc: 'Créer un client' },
  { method: 'PUT', path: '/clients/:id', desc: 'Modifier un client' },
  { method: 'DELETE', path: '/clients/:id', desc: 'Supprimer un client' },
  { method: 'GET', path: '/team', desc: "Lister les membres de l'équipe" },
  { method: 'POST', path: '/team', desc: 'Ajouter un membre' },
  { method: 'GET', path: '/tasks', desc: 'Lister les tâches' },
  { method: 'POST', path: '/tasks', desc: 'Créer une tâche' },
  { method: 'GET', path: '/me', desc: 'Informations du compte' },
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getWebhookUrl(wh) {
  return webhookBaseUrl.value + '?user=' + wh.user_id + '&event=client.created'
}

async function loadApiKeys() {
  const { data } = await supabase.from('api_keys').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (data) apiKeys.value = data
}

async function loadWebhooks() {
  const { data } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false })
  if (data) webhooks.value = data
}

async function createApiKey() {
  const rawKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2,'0')).join('')
  const prefix = rawKey.slice(0, 12)
  
  // Hash the key
  const encoder = new TextEncoder()
  const keyBytes = encoder.encode(rawKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes)
  const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('')
  
  const { error } = await supabase.from('api_keys').insert([{
    name: newKeyName.value,
    key_hash: keyHash,
    key_prefix: prefix,
    scopes: newKeyScopes.value,
  }])
  
  if (!error) {
    newKeyValue.value = rawKey
    newKeyCopied.value = false
    showCreateKey.value = false
    newKeyName.value = ''
    await loadApiKeys()
  }
}

async function revokeKey(id) {
  if (!confirm('Révoquer cette clé API ? Elle ne fonctionnera plus immédiatement.')) return
  await supabase.from('api_keys').update({ is_active: false }).eq('id', id)
  await loadApiKeys()
}

async function createWebhook() {
  const secret = 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join('')
  const { error } = await supabase.from('webhooks').insert([{
    name: 'Webhook Zapier/Make',
    secret,
    events: ['client.created', 'client.updated', 'task.created'],
  }])
  if (!error) await loadWebhooks()
}

async function deleteWebhook(id) {
  if (!confirm('Supprimer ce webhook ?')) return
  await supabase.from('webhooks').delete().eq('id', id)
  await loadWebhooks()
}

function copy(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

onMounted(() => {
  loadApiKeys()
  loadWebhooks()
})
</script>

<style scoped>
.integ-view { padding:32px;max-width:900px;margin:0 auto; }
.iv-header { margin-bottom:24px; }
.iv-header h1 { font-size:1.5rem;font-weight:800; }
.iv-sub { color:var(--text-muted,#6b7280);font-size:0.9rem;margin-top:4px; }
.iv-tabs { display:flex;gap:8px;margin-bottom:24px;border-bottom:2px solid var(--border,#e5e7eb);padding-bottom:0; }
.iv-tab { padding:10px 18px;border:none;background:none;font-size:0.88rem;font-weight:500;color:var(--text-muted,#6b7280);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.15s; }
.iv-tab.active { color:var(--purple,#7c3aed);border-bottom-color:var(--purple,#7c3aed);font-weight:700; }
.iv-section { }
.iv-card { background:var(--bg-card,#fff);border-radius:16px;padding:28px;border:1px solid var(--border,#e5e7eb); }
.iv-card-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px; }
.iv-card-header h2 { font-size:1.05rem;font-weight:700;margin-bottom:4px; }
.iv-card-sub { font-size:0.85rem;color:var(--text-muted,#6b7280); }
.btn-create-key { background:var(--purple,#7c3aed);color:#fff;border:none;padding:10px 16px;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;white-space:nowrap; }
.iv-info-box { display:flex;align-items:center;gap:8px;background:var(--bg,#f8f9fb);border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:10px 14px;margin-bottom:20px; }
.iv-info-label { font-size:0.75rem;font-weight:600;color:var(--text-muted,#6b7280);min-width:60px; }
.iv-code { font-family:monospace;font-size:0.82rem;color:var(--purple,#7c3aed);flex:1;word-break:break-all; }
.iv-code-sm { font-family:monospace;font-size:0.78rem;color:var(--purple,#7c3aed);flex:1;word-break:break-all; }
.btn-copy-sm { background:none;border:1px solid var(--border,#e5e7eb);border-radius:5px;padding:3px 8px;cursor:pointer;font-size:0.75rem; }
.iv-empty { text-align:center;padding:32px;color:var(--text-muted,#6b7280);font-size:0.9rem; }
.iv-keys-list { display:flex;flex-direction:column;gap:10px;margin-bottom:20px; }
.iv-key-row { display:flex;align-items:center;gap:16px;padding:12px 16px;background:var(--bg,#f8f9fb);border-radius:10px;border:1px solid var(--border,#e5e7eb); }
.iv-key-info { display:flex;flex-direction:column;gap:3px;flex:1; }
.iv-key-name { font-weight:600;font-size:0.88rem; }
.iv-key-prefix { font-family:monospace;font-size:0.8rem;color:var(--purple,#7c3aed); }
.iv-key-scopes { font-size:0.75rem;color:var(--text-muted,#6b7280); }
.iv-key-meta { display:flex;flex-direction:column;gap:2px;font-size:0.75rem;color:var(--text-muted,#6b7280);min-width:140px; }
.iv-key-unused { color:#f59e0b; }
.btn-revoke { background:none;border:none;cursor:pointer;opacity:0.5;font-size:1rem; }
.btn-revoke:hover { opacity:1; }
.iv-new-key-reveal { background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:20px; }
.iv-new-key-reveal p { font-size:0.82rem;color:#166534;margin-bottom:8px;font-weight:600; }
.iv-new-key-code { display:block;font-family:monospace;font-size:0.85rem;background:#fff;padding:10px;border-radius:6px;margin-bottom:10px;word-break:break-all; }
.btn-copy { background:var(--purple,#7c3aed);color:#fff;border:none;padding:8px 14px;border-radius:7px;font-size:0.82rem;cursor:pointer;font-weight:600; }
.iv-doc-section { margin-top:24px;padding-top:20px;border-top:1px solid var(--border,#e5e7eb); }
.iv-doc-section h3 { font-size:0.95rem;font-weight:700;margin-bottom:14px; }
.iv-endpoints { display:flex;flex-direction:column;gap:8px;margin-bottom:16px; }
.iv-endpoint { display:flex;align-items:center;gap:10px;font-size:0.82rem;padding:6px 0; }
.iv-method { font-family:monospace;font-weight:700;padding:2px 8px;border-radius:4px;font-size:0.75rem;min-width:58px;text-align:center; }
.iv-method.get { background:#dbeafe;color:#1d4ed8; }
.iv-method.post { background:#dcfce7;color:#166534; }
.iv-method.put { background:#fef9c3;color:#854d0e; }
.iv-method.delete { background:#fee2e2;color:#b91c1c; }
.iv-path { font-family:monospace;font-size:0.8rem;color:var(--purple,#7c3aed);min-width:180px; }
.iv-ep-desc { color:var(--text-muted,#6b7280); }
.iv-example { background:var(--bg,#f8f9fb);border-radius:8px;padding:14px; }
.iv-example h4 { font-size:0.82rem;font-weight:600;margin-bottom:8px; }
.iv-code-block { display:block;font-family:monospace;font-size:0.78rem;word-break:break-all; }
.iv-webhook-row { display:flex;align-items:flex-start;gap:16px;padding:14px;background:var(--bg,#f8f9fb);border-radius:10px;border:1px solid var(--border,#e5e7eb);margin-bottom:10px; }
.iv-wh-info { flex:1;display:flex;flex-direction:column;gap:6px; }
.iv-wh-url-row { display:flex;align-items:center;gap:8px; }
.iv-steps { display:flex;flex-direction:column;gap:10px; }
.iv-step { display:flex;gap:12px;align-items:flex-start;font-size:0.85rem; }
.iv-step-num { background:var(--purple,#7c3aed);color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;margin-top:1px; }
.iv-step code { background:var(--bg,#f8f9fb);padding:1px 6px;border-radius:4px;font-size:0.78rem; }
.btn-goto-import { display:inline-flex;align-items:center;gap:8px;background:var(--purple,#7c3aed);color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:0.9rem;margin-top:16px; }
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000; }
.modal-card { background:var(--bg-card,#fff);border-radius:16px;padding:32px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.15); }
.modal-card h3 { font-size:1.05rem;font-weight:700;margin-bottom:20px; }
.modal-form { display:flex;flex-direction:column;gap:14px; }
.fg { display:flex;flex-direction:column;gap:4px; }
.fg label { font-size:0.78rem;font-weight:600;color:var(--text-muted,#6b7280); }
.modal-input { padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:0.9rem;background:var(--bg,#f8f9fb);color:var(--text,#1a1a2e); }
.modal-input:focus { border-color:var(--purple,#7c3aed);outline:none; }
.scope-toggles { display:flex;gap:16px; }
.scope-toggle { display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer; }
.modal-actions { display:flex;gap:10px;justify-content:flex-end;margin-top:20px; }
.btn-cancel { background:none;border:1px solid var(--border,#e5e7eb);color:var(--text-muted,#6b7280);padding:9px 18px;border-radius:8px;cursor:pointer;font-size:0.88rem; }
.btn-save { background:var(--purple,#7c3aed);color:#fff;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:0.88rem;font-weight:600; }
.btn-save:disabled { opacity:0.5;cursor:not-allowed; }
</style>