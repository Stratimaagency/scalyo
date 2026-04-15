<template>
  <div class="integ-view">
    <div class="iv-header">
      <h1>🔌 {{ t('integ_title') }}</h1>
      <p class="iv-sub">{{ t('integ_subtitle') }}</p>
    </div>

    <h2 class="iv-section-title">● {{ t('integ_available') }}</h2>

    <div class="iv-grid">
      <div v-for="ig in integrations" :key="ig.key" class="iv-card" :class="{ connected: state[ig.key]?.connected }">
        <!-- Connected badge -->
        <div v-if="state[ig.key]?.connected" class="iv-connected-badge">{{ t('integ_connected') }}</div>

        <span class="iv-icon">{{ ig.icon }}</span>
        <div class="iv-info">
          <strong>{{ ig.name }}</strong>
          <p>{{ t(ig.descKey) }}</p>
        </div>

        <!-- Not connected -->
        <div v-if="!state[ig.key]?.connected" class="iv-actions">
          <button class="btn-connect" @click="openConnect(ig)">{{ t('integ_connect') }}</button>
        </div>

        <!-- Connected -->
        <div v-else class="iv-actions-connected">
          <span class="iv-last-sync">{{ t('integ_last_sync', { time: '2 min' }) }}</span>
          <div class="iv-btns">
            <button class="btn-sm-outline" @click="doSync(ig.key)">{{ t('integ_sync_now') }}</button>
            <button class="btn-sm-outline" @click="openConnect(ig)">{{ t('integ_configure') }}</button>
            <button class="btn-sm-outline danger" @click="doDisconnect(ig)">{{ t('integ_disconnect') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Missing integration -->
    <div class="iv-missing">
      <div class="ivm-icon">⚡</div>
      <div class="ivm-text">
        <strong>{{ t('integ_missing') }}</strong>
        <p>{{ t('integ_missing_desc') }}</p>
      </div>
      <button class="btn-outline">{{ t('integ_suggest') }}</button>
    </div>

    <!-- SLIDE-OVER: Connect / Configure -->
    <SlideOver :open="slideOpen" :title="currentInteg ? t('integ_connect_title', { name: currentInteg.name }) : ''" @close="closeSlide" :width="500">
      <div v-if="currentInteg" class="connect-flow">

        <!-- Stepper -->
        <div class="stepper">
          <div v-for="(s, i) in steps" :key="s.key" class="step" :class="{ active: currentStep === i, done: currentStep > i }">
            <div class="step-dot">{{ currentStep > i ? '✓' : i + 1 }}</div>
            <span class="step-label">{{ t(s.label) }}</span>
          </div>
        </div>

        <!-- Step 1: Authorization -->
        <div v-if="currentStep === 0" class="step-content">
          <div v-if="currentInteg.authType === 'oauth'" class="auth-oauth">
            <p class="auth-desc">{{ t('integ_oauth') }}</p>
            <button class="btn-oauth" @click="mockOAuth">
              <span class="oauth-icon">{{ currentInteg.icon }}</span>
              {{ t('integ_oauth') }} — {{ currentInteg.name }}
            </button>
          </div>
          <div v-else class="auth-api">
            <div class="fg">
              <label>{{ t('integ_api_key') }}</label>
              <input v-model="connectForm.apiKey" class="fi" :placeholder="t('integ_api_key_ph')" />
            </div>
            <div class="fg">
              <label>{{ t('integ_api_secret') }}</label>
              <input v-model="connectForm.apiSecret" type="password" class="fi" />
            </div>
            <a href="#" class="help-link">{{ t('integ_where_key') }}</a>
          </div>
          <div class="step-nav">
            <div />
            <button class="btn-primary" @click="nextStep" :disabled="!canProceedStep0">{{ t('integ_next') }}</button>
          </div>
        </div>

        <!-- Step 2: Configuration -->
        <div v-if="currentStep === 1" class="step-content">
          <h3>{{ t('integ_what_import') }}</h3>
          <div class="config-checks">
            <label class="config-check"><input type="checkbox" v-model="connectForm.importContacts" /> {{ t('integ_import_contacts') }}</label>
            <label class="config-check"><input type="checkbox" v-model="connectForm.importDeals" /> {{ t('integ_import_deals') }}</label>
            <label class="config-check"><input type="checkbox" v-model="connectForm.importTasks" /> {{ t('integ_import_tasks') }}</label>
            <label class="config-check"><input type="checkbox" v-model="connectForm.importConvos" /> {{ t('integ_import_convos') }}</label>
          </div>

          <div class="fg mt">
            <label>{{ t('integ_sync_freq') }}</label>
            <select v-model="connectForm.syncFreq" class="fi">
              <option value="realtime">{{ t('integ_sync_realtime') }}</option>
              <option value="hourly">{{ t('integ_sync_hourly') }}</option>
              <option value="daily">{{ t('integ_sync_daily') }}</option>
            </select>
          </div>

          <div class="fg mt">
            <label>{{ t('integ_sync_dir') }}</label>
            <div class="dir-options">
              <label class="dir-opt" :class="{ active: connectForm.syncDir === 'bidi' }">
                <input type="radio" v-model="connectForm.syncDir" value="bidi" /> {{ t('integ_sync_bidi') }}
              </label>
              <label class="dir-opt" :class="{ active: connectForm.syncDir === 'import' }">
                <input type="radio" v-model="connectForm.syncDir" value="import" /> {{ t('integ_sync_import_only') }}
              </label>
              <label class="dir-opt" :class="{ active: connectForm.syncDir === 'export' }">
                <input type="radio" v-model="connectForm.syncDir" value="export" /> {{ t('integ_sync_export_only') }}
              </label>
            </div>
          </div>

          <div class="step-nav">
            <button class="btn-outline" @click="currentStep = 0">{{ t('integ_prev') }}</button>
            <button class="btn-primary" @click="nextStep">{{ t('integ_next') }}</button>
          </div>
        </div>

        <!-- Step 3: Test -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="test-section">
            <button v-if="!testResult" class="btn-test" :disabled="testing" @click="runTest">
              <span v-if="testing" class="test-spinner" />
              {{ testing ? t('integ_testing') : t('integ_test_btn') }}
            </button>

            <div v-if="testResult === 'ok'" class="test-result ok">
              <span class="test-icon">✅</span>
              <p>{{ t('integ_test_ok', { n: testCount }) }}</p>
            </div>

            <div v-if="testResult === 'fail'" class="test-result fail">
              <span class="test-icon">❌</span>
              <p>{{ t('integ_test_fail') }}</p>
            </div>
          </div>

          <div class="step-nav">
            <button class="btn-outline" @click="currentStep = 1">{{ t('integ_prev') }}</button>
            <button class="btn-primary" @click="nextStep" :disabled="testResult !== 'ok'">{{ t('integ_next') }}</button>
          </div>
        </div>

        <!-- Step 4: Active -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="active-summary">
            <div class="as-icon">🎉</div>
            <h3>{{ t('integ_summary') }}</h3>
            <div class="as-details">
              <div class="as-row"><span>{{ currentInteg.name }}</span><span class="as-badge ok">{{ t('integ_connected') }}</span></div>
              <div class="as-row"><span>{{ t('integ_items_found', { n: testCount }) }}</span></div>
              <div class="as-row"><span>{{ t('integ_sync_freq') }}</span><span>{{ t('integ_sync_' + connectForm.syncFreq) }}</span></div>
              <div class="as-row"><span>{{ t('integ_sync_dir') }}</span><span>{{ connectForm.syncDir === 'bidi' ? t('integ_sync_bidi') : connectForm.syncDir === 'import' ? t('integ_sync_import_only') : t('integ_sync_export_only') }}</span></div>
            </div>
          </div>

          <button class="btn-primary full" @click="finishConnect">{{ t('integ_launch_sync') }}</button>
        </div>
      </div>
    </SlideOver>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SlideOver from '@/components/SlideOver.vue'

const { t } = useI18n({ useScope: 'global' })

const integrations = [
  { key: 'hubspot',   name: 'HubSpot',                   icon: '🟠', descKey: 'integ_desc_hubspot',   authType: 'oauth' },
  { key: 'pipedrive', name: 'Pipedrive',                  icon: '🟢', descKey: 'integ_desc_pipedrive', authType: 'oauth' },
  { key: 'intercom',  name: 'Intercom',                   icon: '🔵', descKey: 'integ_desc_intercom',  authType: 'oauth' },
  { key: 'zendesk',   name: 'Zendesk',                    icon: '🟣', descKey: 'integ_desc_zendesk',   authType: 'api' },
  { key: 'jira',      name: 'Jira',                       icon: '🔷', descKey: 'integ_desc_jira',      authType: 'api' },
  { key: 'notion',    name: 'Notion',                     icon: '⬛', descKey: 'integ_desc_notion',    authType: 'oauth' },
  { key: 'asana',     name: 'Asana',                      icon: '🌈', descKey: 'integ_desc_asana',     authType: 'oauth' },
  { key: 'calendly',  name: 'Calendly',                   icon: '📅', descKey: 'integ_desc_calendly',  authType: 'oauth' },
  { key: 'gmail',     name: 'Gmail / Google Workspace',   icon: '📧', descKey: 'integ_desc_gmail',     authType: 'oauth' },
  { key: 'outlook',   name: 'Outlook / Microsoft 365',    icon: '📬', descKey: 'integ_desc_outlook',   authType: 'oauth' },
  { key: 'smtp',      name: 'SMTP personnalisé',           icon: '⚙️', descKey: 'integ_desc_smtp',     authType: 'api' },
  { key: 'slack',     name: 'Slack',                      icon: '💬', descKey: 'integ_desc_slack',     authType: 'oauth' },
  { key: 'teams',     name: 'Microsoft Teams',             icon: '💜', descKey: 'integ_desc_teams',    authType: 'oauth' },
]

const steps = [
  { key: 'auth', label: 'integ_step_auth' },
  { key: 'config', label: 'integ_step_config' },
  { key: 'test', label: 'integ_step_test' },
  { key: 'active', label: 'integ_step_active' },
]

const state = reactive({})
const slideOpen = ref(false)
const currentInteg = ref(null)
const currentStep = ref(0)
const testing = ref(false)
const testResult = ref(null)
const testCount = ref(0)

const connectForm = reactive({
  apiKey: '', apiSecret: '', oauthDone: false,
  importContacts: true, importDeals: true, importTasks: false, importConvos: false,
  syncFreq: 'hourly', syncDir: 'bidi',
})

const canProceedStep0 = computed(() => {
  if (!currentInteg.value) return false
  if (currentInteg.value.authType === 'oauth') return connectForm.oauthDone
  return connectForm.apiKey.length > 3
})

function openConnect(ig) {
  currentInteg.value = ig
  currentStep.value = 0
  testResult.value = null
  testing.value = false
  Object.assign(connectForm, { apiKey: '', apiSecret: '', oauthDone: false, importContacts: true, importDeals: true, importTasks: false, importConvos: false, syncFreq: 'hourly', syncDir: 'bidi' })
  // If already connected, go to config step
  if (state[ig.key]?.connected) currentStep.value = 1
  slideOpen.value = true
}

function closeSlide() {
  slideOpen.value = false
  currentInteg.value = null
}

function mockOAuth() {
  connectForm.oauthDone = true
}

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
}

async function runTest() {
  testing.value = true
  testResult.value = null
  await new Promise(r => setTimeout(r, 1500))
  testing.value = false
  testResult.value = 'ok'
  testCount.value = Math.floor(Math.random() * 80) + 12
}

function finishConnect() {
  if (!currentInteg.value) return
  state[currentInteg.value.key] = {
    connected: true,
    lastSync: new Date().toISOString(),
    config: { ...connectForm },
    stats: { imported: testCount.value, errors: 0 },
  }
  slideOpen.value = false
}

function doSync(key) {
  if (state[key]) state[key].lastSync = new Date().toISOString()
}

function doDisconnect(ig) {
  delete state[ig.key]
}
</script>

<style scoped>
.integ-view { max-width: 1100px; }
.iv-header { margin-bottom: 28px; }
.iv-header h1 { font-size: 1.5rem; font-weight: 800; }
.iv-sub { font-size: 0.88rem; color: var(--text-secondary); margin-top: 4px; }
.iv-section-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--green); }

.iv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 32px; }
.iv-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s; position: relative; overflow: hidden; }
.iv-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.iv-card.connected { border-color: var(--green-border); }
.iv-card.connected:hover { border-color: var(--green); }
.iv-connected-badge { position: absolute; top: 12px; right: 12px; font-size: 0.68rem; font-weight: 600; color: var(--green); }
.iv-icon { font-size: 2rem; }
.iv-info strong { font-size: 0.92rem; display: block; margin-bottom: 4px; }
.iv-info p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; }
.iv-actions { margin-top: auto; }
.btn-connect { background: var(--green); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-connect:hover { background: var(--green-dark); }
.iv-actions-connected { margin-top: auto; }
.iv-last-sync { font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 8px; }
.iv-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-sm-outline { background: #fff; border: 1px solid var(--border); padding: 5px 12px; border-radius: 6px; font-size: 0.72rem; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: all 0.15s; }
.btn-sm-outline:hover { border-color: var(--purple); color: var(--purple); }
.btn-sm-outline.danger:hover { border-color: var(--red); color: var(--red); }

.iv-missing { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; flex-wrap: wrap; }
.ivm-icon { font-size: 2rem; }
.ivm-text { flex: 1; min-width: 200px; }
.ivm-text strong { font-size: 0.95rem; display: block; margin-bottom: 4px; }
.ivm-text p { font-size: 0.82rem; color: var(--text-secondary); }
.btn-outline { background: #fff; color: var(--text-secondary); border: 1px solid var(--border); padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }

/* Stepper */
.stepper { display: flex; gap: 0; margin-bottom: 28px; }
.step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; }
.step::after { content: ''; position: absolute; top: 14px; left: 55%; right: -45%; height: 2px; background: var(--border-light); z-index: 0; }
.step:last-child::after { display: none; }
.step.done::after { background: var(--green); }
.step.active::after { background: linear-gradient(90deg, var(--purple), var(--border-light)); }
.step-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); z-index: 1; transition: all 0.2s; }
.step.active .step-dot { border-color: var(--purple); color: var(--purple); background: var(--purple-bg); }
.step.done .step-dot { border-color: var(--green); color: #fff; background: var(--green); }
.step-label { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; }
.step.active .step-label { color: var(--purple); font-weight: 600; }
.step.done .step-label { color: var(--green); }

/* Step content */
.step-content { min-height: 200px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }
.mt { margin-top: 16px; }
.help-link { font-size: 0.75rem; color: var(--purple); margin-top: 6px; }

/* OAuth */
.auth-desc { font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px; }
.btn-oauth { display: flex; align-items: center; gap: 10px; width: 100%; padding: 14px 20px; background: var(--bg); border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-oauth:hover { border-color: var(--purple); background: var(--purple-bg); }
.oauth-icon { font-size: 1.5rem; }

/* Config */
.step-content h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; }
.config-checks { display: flex; flex-direction: column; gap: 10px; }
.config-check { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; padding: 10px 12px; background: var(--bg); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s; }
.config-check:hover { background: var(--bg-hover); }
.config-check input { accent-color: var(--purple); width: 16px; height: 16px; }

.dir-options { display: flex; flex-direction: column; gap: 6px; }
.dir-opt { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg); border: 2px solid transparent; border-radius: var(--radius-sm); font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
.dir-opt.active { border-color: var(--purple); background: var(--purple-bg); }
.dir-opt input { accent-color: var(--purple); }

/* Test */
.test-section { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 160px; gap: 16px; }
.btn-test { background: var(--purple); color: #fff; border: none; padding: 14px 32px; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
.btn-test:hover:not(:disabled) { background: var(--purple-dark); transform: translateY(-1px); }
.btn-test:disabled { opacity: 0.7; cursor: wait; }
.test-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.test-result { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 500; animation: fadeIn 0.3s ease; }
.test-result.ok { background: var(--green-bg); color: var(--green); }
.test-result.fail { background: var(--red-bg); color: var(--red); }
.test-icon { font-size: 1.5rem; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Active summary */
.active-summary { text-align: center; padding: 20px 0; }
.as-icon { font-size: 3rem; margin-bottom: 12px; }
.active-summary h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
.as-details { display: flex; flex-direction: column; gap: 8px; text-align: left; margin-bottom: 20px; }
.as-row { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg); border-radius: 6px; font-size: 0.82rem; }
.as-badge { font-size: 0.72rem; font-weight: 600; padding: 2px 10px; border-radius: 4px; }
.as-badge.ok { background: var(--green-bg); color: var(--green); }

/* Navigation */
.step-nav { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-light); }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 9px 20px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-primary:hover { background: var(--purple-dark); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary.full { width: 100%; text-align: center; padding: 12px; font-size: 0.9rem; }

@media (max-width: 600px) { .iv-grid { grid-template-columns: 1fr; } .stepper { gap: 0; } .step-label { font-size: 0.6rem; } }
</style>
