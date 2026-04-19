<template>
  <div class="email-studio">
    <div class="es-header">
      <h1>📧 {{ t('es_title') }}</h1>
      <p class="es-sub">{{ t('es_subtitle') }}</p>
    </div>

    <!-- ─── Bandeau transparence email ─────────────────────────── -->
    <div :class="['es-email-banner', hasResendKey ? 'connected' : 'setup-needed']">
      <span class="es-banner-icon">{{ hasResendKey ? '✅' : '✉️' }}</span>
      <div class="es-banner-text">
        <strong>{{ hasResendKey ? t('es_resend_connected') : t('es_resend_setup_title') }}</strong>
        <span>{{ hasResendKey ? t('es_resend_connected_desc') : t('es_resend_setup_desc') }}</span>
      </div>
      <router-link v-if="!hasResendKey" to="/app/settings?tab=integrations" class="es-banner-link">{{ t('es_resend_setup_link') }}</router-link>
    </div>

    <div v-if="activeTab !== 'history'" class="es-layout">
      <div class="es-left">
        <div class="es-tabs">
          <button v-for="tab in tabs" :key="tab.key" class="es-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ t(tab.label) }}</button>
        </div>
        <div class="es-search"><span>🔍</span><input v-model="search" :placeholder="t('es_search')" /></div>

        <div class="es-cats">
          <button v-for="cat in categoryKeys" :key="cat" class="es-cat" :class="{ active: activeCat === cat, [catClass(cat)]: true }" @click="activeCat = activeCat === cat ? 'all' : cat">{{ cat === 'all' ? t('es_cat_all') : t('es_cat_' + cat) }}</button>
        </div>

        <div class="es-list">
          <div v-for="tpl in filteredTemplates" :key="tpl.id" class="es-item" :class="{ active: selectedId === tpl.id }" @click="selectedId = tpl.id">
            <span class="esi-cat" :class="catClass(tpl.categoryKey)">{{ t('es_cat_' + tpl.categoryKey) }}</span>
            <strong>{{ t(tpl.nameKey) }}</strong>
          </div>
        </div>
      </div>

      <div class="es-right">
        <div v-if="selected" class="es-preview">
          <div class="esp-header">
            <h2>{{ t(selected.nameKey) }}</h2>
            <div class="esp-actions">
              <span class="esp-cat" :class="catClass(selected.categoryKey)">{{ t('es_cat_' + selected.categoryKey) }}</span>
              <button class="btn-primary" @click="copyEmail">{{ copied ? t('es_copied') : t('es_copy') }}</button>
              <template v-if="isElite">
                <button class="btn-send" @click="showSendModal = true" :disabled="!selected || !hasResendKey">
                  {{ !hasResendKey ? t('es_resend_required') : t('es_send') }}
                </button>
              </template>
              <template v-else>
                <div class="es-elite-gate" :title="t('es_elite_tooltip')">
                  <span>{{ t('es_elite_badge') }}</span>
                  <span class="es-elite-lock">🔒 {{ t('es_elite_required') }}</span>
                </div>
              </template>
            </div>
          </div>
          <div class="esp-field"><strong>{{ t('es_subject') }}</strong><p>{{ t(selected.subjectKey) }}</p></div>
          <div class="esp-body">
            <strong>{{ t('es_body') }}</strong>
            <div class="esp-content" v-html="t(selected.bodyKey)" />
          </div>
        </div>
        <div v-else class="esp-empty">
          <span class="esp-empty-icon">📧</span>
          <p>{{ t('es_preview') }}</p>
        </div>
      </div>
    </div>
  </div>


  <!-- ─── History Tab Panel ──────────────────────────────────────── -->
  <div v-if="activeTab === 'history'" class="es-history">
    <div v-if="!isElite" class="es-history-gate">
      <span class="es-elite-gate">
        <span>Elite</span>
        <span class="es-elite-lock">🔒 {{ t('es_history_elite') }}</span>
      </span>
    </div>
    <template v-else>
      <!-- KPI bar -->
      <div class="es-history-kpis">
        <div class="es-kpi">
          <span class="es-kpi-value">{{ sentEmails.length }}</span>
          <span class="es-kpi-label">{{ t('es_history_sent') }}</span>
        </div>
        <div class="es-kpi">
          <span class="es-kpi-value">{{ sentEmails.filter(e => e.opened_at).length }}</span>
          <span class="es-kpi-label">{{ t('es_history_opened') }}</span>
        </div>
        <div class="es-kpi">
          <span class="es-kpi-value">{{ openRate }}</span>
          <span class="es-kpi-label">{{ t('es_history_rate') }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="historyLoading" class="es-history-loading">⏳ {{ t('es_history_loading') }}</div>
      <div v-else-if="historyError" class="es-history-error">{{ historyError }}</div>
      <div v-else-if="!sentEmails.length" class="es-history-empty">{{ t('es_history_empty') }}</div>

      <!-- Table -->
      <div v-else class="es-history-table">
        <div class="es-history-head">
          <span>{{ t('es_history_col_to') }}</span>
          <span>{{ t('es_history_col_subject') }}</span>
          <span>{{ t('es_history_col_sent') }}</span>
          <span>{{ t('es_history_col_status') }}</span>
          <span>{{ t('es_history_col_opens') }}</span>
        </div>
        <div v-for="email in sentEmails" :key="email.id" class="es-history-row">
          <span class="es-history-to" :title="email.to_email">{{ email.to_email }}</span>
          <span class="es-history-subject" :title="t(email.subject)">{{ email.subject }}</span>
          <span class="es-history-date">{{ formatDate(email.sent_at) }}</span>
          <span :class="['es-history-status', email.opened_at ? 'opened' : 'pending']">
            {{ email.opened_at ? '✓ ' + t('es_history_read') : t('es_history_unread') }}
          </span>
          <span class="es-history-opens">{{ email.open_count || 0 }}x</span>
        </div>
      </div>
    </template>
  </div>

  <!-- ─── Send Email Modal ──────────────────────────────────────── -->
  <div v-if="showSendModal" class="send-modal-overlay" @click.self="showSendModal = false">
    <div class="send-modal">
      <div class="sm-header">
        <h3>{{ t('es_send_title') }}</h3>
        <button class="sm-close" @click="showSendModal = false">✕</button>
      </div>
      <div class="sm-body">
        <div v-if="sendResult?.success" class="sm-success">
          ✓ {{ t('es_send_success') }}
        </div>
        <div v-else-if="sendResult?.error" class="sm-error">
          ✕ {{ sendResult.error }}
        </div>
        <template v-else>
          <div class="sm-field">
            <label>{{ t('es_send_to') }}</label>
            <input v-model="sendTo" type="email" :placeholder="t('es_send_to_placeholder')" class="sm-input" />
          </div>
          <div class="sm-field">
            <label>{{ t('es_send_from_name') }}</label>
            <input v-model="sendFromName" type="text" :placeholder="auth.fullName || t('es_send_from_placeholder')" class="sm-input" />
          </div>
          <div class="sm-preview">
            <strong>{{ t('es_subject') }} :</strong> {{ selected ? t(selected.subjectKey) : '' }}
          </div>
          <button class="btn-primary sm-send-btn" @click="sendEmail" :disabled="!sendTo || sending">
            {{ sending ? t('es_sending') : t('es_send_btn') }}
          </button>
        </template>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n({ useScope: 'global' })

const activeTab = ref('all')
const activeCat = ref('all')
const search = ref('')
const selectedId = ref(null)
const copied = ref(false)

// Send email modal
const showSendModal = ref(false)
const sendTo = ref('')
const sendFromName = ref('')
const sending = ref(false)
const sendResult = ref(null) // { success, error }
const auth = useAuthStore()
const isElite = computed(() => auth.currentPlan === 'elite')
const hasResendKey = computed(() => !!(auth.profile?.resend_api_key && auth.profile.resend_api_key.startsWith('re_')))
const EMAIL_FREE_QUOTA = 3000
const EMAIL_OVERAGE_RATE = 1.5 // €/1000 au-delà

// ─── Email History ────────────────────────────────────────────────
const sentEmails = ref([])
const historyLoading = ref(false)
const historyError = ref(null)

async function loadSentEmails() {
  if (!isElite.value) return
  historyLoading.value = true
  historyError.value = null
  try {
    const { data, error } = await supabase
      .from('sent_emails')
      .select('id, to_email, subject, template_id, sent_at, opened_at, open_count, from_name')
      .order('sent_at', { ascending: false })
      .limit(50)
    if (error) throw error
    sentEmails.value = data || []
  } catch (e) {
    historyError.value = e.message
  } finally {
    historyLoading.value = false
  }
}

// Load history when tab is switched to 'history'
watch(activeTab, (val) => {
  if (val === 'history') loadSentEmails()
})

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const openRate = computed(() => {
  if (!sentEmails.value.length) return '0%'
  const opened = sentEmails.value.filter(e => e.opened_at).length
  return Math.round((opened / sentEmails.value.length) * 100) + '%'
})

const tabs = [
  { key: 'all', label: 'es_tab_all' },
  { key: 'csm', label: 'es_tab_csm' },
  { key: 'commercial', label: 'es_tab_commercial' },
  { key: 'kam', label: 'es_tab_kam' },
  { key: 'history', label: 'es_tab_history' },
]

const templates = [
  { id: 1,  nameKey: 'es_tpl1_name',  categoryKey: 'onboarding',     type: 'csm',        subjectKey: 'es_tpl1_subject',  bodyKey: 'es_tpl1_body' },
  { id: 2,  nameKey: 'es_tpl2_name',  categoryKey: 'qbr',            type: 'csm',        subjectKey: 'es_tpl2_subject',  bodyKey: 'es_tpl2_body' },
  { id: 3,  nameKey: 'es_tpl3_name',  categoryKey: 'suivi',          type: 'csm',        subjectKey: 'es_tpl3_subject',  bodyKey: 'es_tpl3_body' },
  { id: 4,  nameKey: 'es_tpl4_name',  categoryKey: 'risque',         type: 'csm',        subjectKey: 'es_tpl4_subject',  bodyKey: 'es_tpl4_body' },
  { id: 5,  nameKey: 'es_tpl5_name',  categoryKey: 'renouvellement', type: 'csm',        subjectKey: 'es_tpl5_subject',  bodyKey: 'es_tpl5_body' },
  { id: 6,  nameKey: 'es_tpl6_name',  categoryKey: 'expansion',      type: 'csm',        subjectKey: 'es_tpl6_subject',  bodyKey: 'es_tpl6_body' },
  { id: 7,  nameKey: 'es_tpl7_name',  categoryKey: 'nps',            type: 'csm',        subjectKey: 'es_tpl7_subject',  bodyKey: 'es_tpl7_body' },
  { id: 8,  nameKey: 'es_tpl8_name',  categoryKey: 'prospection',    type: 'commercial', subjectKey: 'es_tpl8_subject',  bodyKey: 'es_tpl8_body' },
  { id: 9,  nameKey: 'es_tpl9_name',  categoryKey: 'negociation',    type: 'commercial', subjectKey: 'es_tpl9_subject',  bodyKey: 'es_tpl9_body' },
  { id: 10, nameKey: 'es_tpl10_name', categoryKey: 'relance',        type: 'commercial', subjectKey: 'es_tpl10_subject', bodyKey: 'es_tpl10_body' },
  { id: 11, nameKey: 'es_tpl11_name', categoryKey: 'retention',      type: 'kam',        subjectKey: 'es_tpl11_subject', bodyKey: 'es_tpl11_body' },
  { id: 12, nameKey: 'es_tpl12_name', categoryKey: 'closing',        type: 'commercial', subjectKey: 'es_tpl12_subject', bodyKey: 'es_tpl12_body' },
]

const categoryKeys = computed(() => {
  const keys = [...new Set(templates.map(tpl => tpl.categoryKey))]
  return ['all', ...keys]
})

const filteredTemplates = computed(() => {
  let list = templates
  if (activeTab.value !== 'all') list = list.filter(tpl => tpl.type === activeTab.value)
  if (activeCat.value !== 'all') list = list.filter(tpl => tpl.categoryKey === activeCat.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(tpl => t(tpl.nameKey).toLowerCase().includes(q) || t('es_cat_' + tpl.categoryKey).toLowerCase().includes(q))
  }
  return list
})

const selected = computed(() => templates.find(tpl => tpl.id === selectedId.value) || filteredTemplates.value[0] || null)

function catClass(key) {
  const map = { onboarding: 'cat-blue', qbr: 'cat-purple', suivi: 'cat-teal', risque: 'cat-red', renouvellement: 'cat-amber', expansion: 'cat-green', nps: 'cat-pink', prospection: 'cat-indigo', negociation: 'cat-orange', relance: 'cat-slate', closing: 'cat-dark', retention: 'cat-red', all: 'cat-gray' }
  return map[key] || 'cat-gray'
}

async function sendEmail() {
  if (!selected.value || !sendTo.value) return
  sending.value = true
  sendResult.value = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          to: sendTo.value,
          subject: t(selected.value.subjectKey),
          html: `<div style="font-family:sans-serif;line-height:1.6;max-width:600px;margin:0 auto">${t(selected.value.bodyKey).replace(/\n/g, '<br>')}</div>`,
          from_name: sendFromName.value || auth.fullName || 'Scalyo',
          reply_to: auth.user?.email,
          resend_api_key: auth.profile?.resend_api_key || null,
          template_id: selected.value.id,
        })
      }
    )
    const data = await resp.json()
    if (resp.ok && data.success) {
      sendResult.value = { success: true }
      sendTo.value = ''
      setTimeout(() => { showSendModal.value = false; sendResult.value = null }, 2000)
    } else {
      sendResult.value = { error: data.error || 'Erreur envoi' }
    }
  } catch (e) {
    sendResult.value = { error: e.message }
  } finally {
    sending.value = false
  }
}

function copyEmail() {
  if (!selected.value) return
  const text = t(selected.value.subjectKey) + '\n\n' + t(selected.value.bodyKey).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
.email-studio { max-width: 1200px; }
.es-header { margin-bottom: 20px; }
.es-header h1 { font-size: 1.5rem; font-weight: 800; }
.es-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.es-layout { display: grid; grid-template-columns: 340px 1fr; gap: 20px; min-height: 600px; }
.es-left { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; }
.es-tabs { display: flex; border-bottom: 1px solid var(--border-light); }
.es-tab { flex: 1; padding: 10px; background: none; border: none; font-size: 0.78rem; font-weight: 500; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.es-tab.active { color: var(--purple); border-bottom-color: var(--purple); font-weight: 600; }
.es-search { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--border-light); }
.es-search input { border: none; outline: none; font-size: 0.82rem; width: 100%; background: transparent; }
.es-cats { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 10px; border-bottom: 1px solid var(--border-light); }
.es-cat { font-size: 0.65rem; font-weight: 600; padding: 3px 8px; border-radius: 4px; border: none; cursor: pointer; opacity: 0.6; transition: all 0.15s; }
.es-cat.active { opacity: 1; }
.es-cat:hover { opacity: 0.9; }
.cat-blue { background: #dbeafe; color: #1d4ed8; }
.cat-purple { background: #ede9fe; color: #7c3aed; }
.cat-teal { background: #ccfbf1; color: #0d9488; }
.cat-red { background: #fee2e2; color: #dc2626; }
.cat-amber { background: #fef3c7; color: #d97706; }
.cat-green { background: #d1fae5; color: #059669; }
.cat-pink { background: #fce7f3; color: #db2777; }
.cat-indigo { background: #e0e7ff; color: #4338ca; }
.cat-orange { background: #ffedd5; color: #ea580c; }
.cat-slate { background: #f1f5f9; color: #475569; }
.cat-dark { background: #1e293b; color: #f1f5f9; }
.cat-gray { background: #f3f4f6; color: #6b7280; }
.es-list { flex: 1; overflow-y: auto; }
.es-item { padding: 12px 14px; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s; }
.es-item:hover { background: var(--bg-hover); }
.es-item.active { background: var(--purple-bg); border-left: 3px solid var(--purple); }
.esi-cat { font-size: 0.6rem; font-weight: 600; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-bottom: 4px; }
.es-item strong { font-size: 0.82rem; display: block; }
.es-right { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.es-preview { padding: 24px; }
.esp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; }
.esp-header h2 { font-size: 1.1rem; font-weight: 700; }
.esp-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.esp-cat { font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-primary:hover { background: var(--purple-dark); }
.esp-field { margin-bottom: 16px; }
.esp-field strong { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px; }
.esp-field p { font-size: 0.9rem; padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm); }
.esp-body strong { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 8px; }
.esp-content { font-size: 0.88rem; line-height: 1.7; padding: 16px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border-light); }
.esp-content :deep(p) { margin-bottom: 10px; }
.esp-content :deep(ul) { margin: 8px 0 8px 20px; list-style: disc; }
.esp-content :deep(li) { margin-bottom: 4px; }
.esp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: var(--text-muted); }
.esp-empty-icon { font-size: 3rem; margin-bottom: 12px; }
.esp-empty p { font-size: 0.9rem; }
@media (max-width: 900px) { .es-layout { grid-template-columns: 1fr; } .es-right { min-height: 300px; } }

.btn-send {
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-send:hover { background: #059669; }
.btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

.send-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.send-modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.sm-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.sm-header h3 { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.sm-close {
  background: none; border: none; cursor: pointer;
  font-size: 1.1rem; color: #6b7280;
}
.sm-field { margin-bottom: 16px; }
.sm-field label { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
.sm-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 0.9rem; outline: none; box-sizing: border-box;
}
.sm-input:focus { border-color: #7c3aed; }
.sm-preview {
  background: #f9fafb; border-radius: 8px;
  padding: 10px 14px; font-size: 0.82rem; color: #6b7280;
  margin-bottom: 16px;
}
.sm-send-btn { width: 100%; padding: 12px; font-size: 0.95rem; }
.sm-success { color: #10b981; font-weight: 600; text-align: center; padding: 20px 0; font-size: 1rem; }
.sm-error { color: #ef4444; font-weight: 600; text-align: center; padding: 12px 0; font-size: 0.9rem; }


/* ─── Email Banner ───────────────────────────────────────────────── */
.es-email-banner {
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 18px;
  margin-bottom: 20px;
  font-size: 0.82rem;
}
.es-banner-icon { font-size: 1.3rem; flex-shrink: 0; }
.es-banner-text { display: flex; flex-direction: column; flex: 1; gap: 2px; }
.es-banner-text strong { color: #15803d; font-size: 0.85rem; }
.es-banner-text span { color: #4b7c60; }
.es-banner-link {
  color: #7c3aed; font-weight: 600; text-decoration: none;
  white-space: nowrap; font-size: 0.8rem;
}
.es-banner-link:hover { text-decoration: underline; }

/* ─── Elite Gate ─────────────────────────────────────────────────── */
.es-elite-gate {
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
}
.es-elite-gate span:first-child {
  font-size: 0.7rem; font-weight: 700; color: #7c3aed;
  background: #f3e8ff; padding: 2px 8px; border-radius: 20px;
}
.es-elite-lock {
  font-size: 0.75rem; color: #9ca3af; font-weight: 500;
}


/* ─── History Tab ────────────────────────────────────────────────── */
.es-history { padding: 0 0 24px; }
.es-history-gate { text-align: center; padding: 40px 0; }
.es-history-kpis {
  display: flex; gap: 16px; margin-bottom: 20px;
}
.es-kpi {
  flex: 1; background: #f9fafb; border-radius: 12px;
  padding: 16px; text-align: center;
}
.es-kpi-value { display: block; font-size: 1.6rem; font-weight: 800; color: #7c3aed; }
.es-kpi-label { font-size: 0.75rem; color: #6b7280; margin-top: 4px; display: block; }
.es-history-loading, .es-history-empty, .es-history-error {
  text-align: center; padding: 32px; color: #9ca3af; font-size: 0.85rem;
}
.es-history-error { color: #ef4444; }
.es-history-table { border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden; }
.es-history-head {
  display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1fr 0.5fr;
  background: #f9fafb; padding: 10px 16px;
  font-size: 0.72rem; font-weight: 700; color: #6b7280; text-transform: uppercase;
  gap: 12px;
}
.es-history-row {
  display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1fr 0.5fr;
  padding: 12px 16px; gap: 12px;
  border-top: 1px solid #f3f4f6; font-size: 0.8rem; align-items: center;
}
.es-history-row:hover { background: #fafafa; }
.es-history-to, .es-history-subject {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #374151;
}
.es-history-date { color: #6b7280; font-size: 0.75rem; }
.es-history-status { font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.es-history-status.opened { color: #10b981; }
.es-history-status.pending { color: #9ca3af; }
.es-history-opens { color: #7c3aed; font-weight: 600; text-align: center; }

</style>