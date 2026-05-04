<template>
  <div class="wellbeing-view">
    <div class="wb-header">
      <div><h1>💚 {{ t('wb_title') }}</h1><p class="wb-conf">🔒 {{ t('wb_confidential') }}</p></div>
      <div class="wb-gauge">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" stroke-width="10" /><circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="10" :stroke-dasharray="gaugeArc + ' 314.16'" stroke-linecap="round" transform="rotate(-90 60 60)" /><text x="60" y="65" text-anchor="middle" font-size="28" font-weight="800" fill="#10b981">{{ score }}</text></svg>
      </div>
    </div>

    <div class="wb-section">
      <h2>{{ t('wb_how_feel') }}</h2>
      <div class="mood-grid">
        <button v-for="m in moods" :key="m.key" class="mood-btn" :class="{ active: selectedMood === m.key }" @click="selectMood(m.key)">
          <span class="mood-emoji">{{ m.emoji }}</span>
          <span class="mood-label">{{ t(m.labelKey) }}</span>
        </button>
      </div>
    </div>

    <div class="wb-grid">
      <div class="wb-left">
        <div class="wb-card">
          <div class="wb-metric"><span class="wbm-label">{{ t('wb_score') }}</span><div class="wbm-bar"><div class="wbm-fill green" :style="{ width: score + '%' }" /></div><span class="wbm-val green">{{ score }}/100</span></div>
          <div class="wb-metric"><span class="wbm-label">{{ t('wb_burnout') }}</span><span class="burnout-pill none">{{ t('wb_burnout_none') }}</span></div>
          <div class="wb-metric"><span class="wbm-label">{{ t('wb_charge') }}</span><div class="wbm-bar"><div class="wbm-fill green" :style="{ width: charge + '%' }" /></div><span class="wbm-val">{{ charge }}%</span></div>
        </div>

        <div class="wb-card tip-card">
          <div class="tip-header"><h3>💡 {{ t('wb_tip_title') }}</h3><button class="tip-refresh" @click="refreshTip">🔄 {{ t('wb_tip_refresh') }}</button></div>
          <p class="tip-text">{{ t(tipKeys[tipIndex]) }}</p>
        </div>

        <div class="wb-card">
          <h3>{{ t('wb_your_week') }}</h3>
          <div class="week-row">
            <div v-for="(d, i) in weekDays" :key="i" class="week-day">
              <span class="wd-emoji">{{ weekMoods[i] || '—' }}</span>
              <span class="wd-label">{{ t(d) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wb-right">
        <div class="motiv-grid">
          <div v-for="(c, i) in motivCards" :key="i" class="motiv-card" :class="'mc-' + i">
            <span class="mc-icon">{{ c.icon }}</span>
            <p>{{ t(c.key) }}</p>
          </div>
        </div>

        <div class="wb-card nova-card">
          <h3>🤖 {{ t('wb_nova') }}</h3>
          <div v-if="novaMessages.length" class="nova-msgs">
            <div v-for="msg in novaMessages" :key="msg.id" class="nova-msg" :class="msg.role">
              <div class="nova-msg-av">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
              <div class="nova-msg-body" v-html="formatMsg(msg.content)" />
            </div>
            <div v-if="novaThinking" class="nova-msg assistant">
              <div class="nova-msg-av">🤖</div>
              <div class="nova-msg-body"><div class="nova-thinking"><span /><span /><span /></div></div>
            </div>
          </div>
          <div v-if="!novaMessages.length" class="nova-suggestions">
            <button v-for="s in novaSuggestions" :key="s" class="nova-sug" @click="sendNova(t(s))">{{ t(s) }}</button>
          </div>
          <div class="nova-input">
            <input v-model="novaInput" :placeholder="t('wb_nova_placeholder')" @keydown.enter="sendNova(novaInput)" :disabled="novaThinking" />
            <button class="nova-send" @click="sendNova(novaInput)" :disabled="!novaInput.trim() || novaThinking">→</button>
          </div>
        </div>
      </div>
    </div>

    <div class="wb-emergency">
      <h3>🚨 {{ t('wb_emergency') }} — {{ t('wb_emergency_desc') }}</h3>
      <div class="emergency-grid">
        <div v-for="e in emergencyLines" :key="e.key" class="em-item">
          {{ e.flag }} {{ t(e.key) }} — <strong>{{ e.number }}</strong>
          <span v-if="e.note"> ({{ e.note }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { askScalyoAI } from '@/utils/askScalyoAI'
import { sanitizeHtml } from '@/utils/sanitize'

const { t, locale } = useI18n({ useScope: 'global' })
const authStore = useAuthStore()

// --- Supabase persistence (RGPD-compliant, per-user) ---
let _saveTimer = null
const loaded = ref(false)

async function loadWellbeing() {
  const userId = authStore.user?.id
  if (!userId) return
  try {
    const { data } = await supabase
      .from('user_wellbeing')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (data) {
      score.value = data.score ?? 70
      charge.value = data.charge ?? 70
      selectedMood.value = data.mood ?? 'normal'
      tipIndex.value = data.tip_index ?? 0
      if (Array.isArray(data.week_moods)) weekMoods.value = data.week_moods
    }
  } catch (e) { console.error('loadWellbeing', e) }
  loaded.value = true
}

async function saveWellbeing() {
  const userId = authStore.user?.id
  if (!userId || !loaded.value) return
  try {
    await supabase.from('user_wellbeing').upsert({
      user_id: userId,
      score: score.value,
      charge: charge.value,
      mood: selectedMood.value,
      tip_index: tipIndex.value,
      week_moods: weekMoods.value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
  } catch (e) { console.error('saveWellbeing', e) }
}

function debouncedSave() {
  clearTimeout(_saveTimer)
  _saveTimer = setTimeout(saveWellbeing, 500)
}

const score = ref(70)
const charge = ref(70)
const selectedMood = ref('normal')
const tipIndex = ref(0)
const weekMoods = ref(['😊', '😊', '😄', '🙂', '—'])
const novaInput = ref('')
const novaMessages = ref([])
const novaThinking = ref(false)

watch(score, debouncedSave)
watch(charge, debouncedSave)
watch(selectedMood, debouncedSave)
watch(tipIndex, debouncedSave)
watch(weekMoods, debouncedSave, { deep: true })

const gaugeArc = computed(() => ((score.value / 100) * 314.16).toFixed(1))

const moods = [
  { key: 'exhausted', emoji: '😩', labelKey: 'wb_mood_exhausted' },
  { key: 'stressed', emoji: '😟', labelKey: 'wb_mood_stressed' },
  { key: 'attention', emoji: '🙂', labelKey: 'wb_mood_attention' },
  { key: 'normal', emoji: '😊', labelKey: 'wb_mood_normal' },
  { key: 'great', emoji: '😄', labelKey: 'wb_mood_great' },
]

const weekDays = ['wb_mon', 'wb_tue', 'wb_wed', 'wb_thu', 'wb_fri']
const motivCards = [
  { key: 'wb_card1', icon: '💪' },
  { key: 'wb_card2', icon: '⭐' },
  { key: 'wb_card3', icon: '☕' },
  { key: 'wb_card4', icon: '🤝' },
]
const novaSuggestions = ['wb_nova_sug1', 'wb_nova_sug2', 'wb_nova_sug3', 'wb_nova_sug4', 'wb_nova_sug5']
const tipKeys = ['wb_tip1', 'wb_tip2', 'wb_tip3', 'wb_tip4', 'wb_tip5']

const emergencyLines = [
  { key: 'wb_em_fr', flag: '🇫🇷', number: '3114', note: '24/7' },
  { key: 'wb_em_be', flag: '🇧🇪', number: '0800 32 123', note: '' },
  { key: 'wb_em_ch', flag: '🇨🇭', number: '143', note: '' },
  { key: 'wb_em_ca', flag: '🇨🇦', number: '1-866-APPELLE', note: '' },
  { key: 'wb_em_us', flag: '🇺🇸', number: '988', note: '' },
  { key: 'wb_em_kr', flag: '🇰🇷', number: '1393', note: '' },
]

function selectMood(key) { selectedMood.value = key }
function refreshTip() { tipIndex.value = (tipIndex.value + 1) % tipKeys.length }

function formatMsg(text) {
  const html = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  return sanitizeHtml(html)
}

async function sendNova(text) {
  if (!text?.trim() || novaThinking.value) return
  const userText = text.trim()
  novaMessages.value.push({ id: Date.now(), role: 'user', content: userText })
  novaInput.value = ''
  novaThinking.value = true
  try {
    const result = await askScalyoAI({
      module: 'wellbeing',
      message: userText,
      context: { mood: selectedMood.value, score: score.value, charge: charge.value },
      history: novaMessages.value.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      lang: locale.value || 'fr',
    })
    novaMessages.value.push({ id: Date.now() + 1, role: 'assistant', content: result.response || result.reply || result.content || t('wb_nova_error') })
  } catch {
    novaMessages.value.push({ id: Date.now() + 1, role: 'assistant', content: t('wb_nova_error') })
  }
  novaThinking.value = false
}

onMounted(loadWellbeing)
</script>

<style scoped>
.wellbeing-view { max-width: 1000px; }
.wb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.wb-header h1 { font-size: 1.5rem; font-weight: 800; }
.wb-conf { font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; }
.wb-gauge { width: 100px; height: 100px; }
.wb-gauge svg { width: 100%; height: 100%; }
.wb-section { margin-bottom: 24px; }
.wb-section h2 { font-size: 1rem; font-weight: 700; margin-bottom: 14px; }
.mood-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.mood-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 18px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; flex: 1; min-width: 100px; }
.mood-btn:hover { border-color: var(--purple); transform: translateY(-2px); }
.mood-btn.active { border-color: var(--purple); background: var(--purple-bg); box-shadow: 0 0 0 2px rgba(124,58,237,0.15); }
.mood-emoji { font-size: 2rem; }
.mood-label { font-size: 0.72rem; color: var(--text-secondary); text-align: center; }
.wb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.wb-left, .wb-right { display: flex; flex-direction: column; gap: 14px; }
.wb-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; }
.wb-card h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; }
.wb-metric { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.wb-metric:last-child { margin-bottom: 0; }
.wbm-label { font-size: 0.78rem; color: var(--text-secondary); min-width: 100px; }
.wbm-bar { flex: 1; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden; }
.wbm-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.wbm-fill.green { background: var(--green); }
.wbm-val { font-size: 0.82rem; font-weight: 600; min-width: 50px; text-align: right; }
.wbm-val.green { color: var(--green); }
.burnout-pill { font-size: 0.78rem; font-weight: 600; padding: 3px 12px; border-radius: 6px; }
.burnout-pill.none { background: var(--green-bg); color: var(--green); }
.tip-card { background: linear-gradient(135deg, #fefce8, #fef9c3); border-color: #fde68a; }
.tip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tip-header h3 { margin-bottom: 0; }
.tip-refresh { background: none; border: none; font-size: 0.75rem; color: var(--text-muted); cursor: pointer; }
.tip-refresh:hover { color: var(--text); }
.tip-text { font-size: 0.88rem; line-height: 1.6; color: #92400e; font-style: italic; }
.week-row { display: flex; gap: 8px; }
.week-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: var(--bg); border-radius: var(--radius-sm); }
.wd-emoji { font-size: 1.4rem; }
.wd-label { font-size: 0.68rem; color: var(--text-muted); font-weight: 600; }
.motiv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.motiv-card { padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 10px; color: #fff; }
.mc-icon { font-size: 1.5rem; }
.motiv-card p { font-size: 0.82rem; font-weight: 500; line-height: 1.4; }
.mc-0 { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.mc-1 { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.mc-2 { background: linear-gradient(135deg, #10b981, #34d399); }
.mc-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #1a1a2e; }
.nova-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.nova-sug { background: var(--purple-bg); border: 1px solid var(--purple-border); color: var(--purple); padding: 6px 12px; border-radius: 999px; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
.nova-sug:hover { background: var(--purple); color: #fff; }
.nova-input { display: flex; gap: 8px; }
.nova-input input { flex: 1; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; }
.nova-input input:focus { border-color: var(--purple); }
.nova-send { background: var(--purple); color: #fff; border: none; border-radius: var(--radius-sm); padding: 9px 16px; font-size: 1rem; cursor: pointer; }
.wb-emergency { background: #fff; border: 1px solid var(--red-border); border-radius: var(--radius-md); padding: 20px; }
.wb-emergency h3 { font-size: 0.9rem; font-weight: 700; color: var(--red); margin-bottom: 14px; }
.emergency-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.em-item { font-size: 0.82rem; padding: 10px; background: var(--red-bg); border-radius: var(--radius-sm); }
.em-item strong { color: var(--red); }
@media (max-width: 768px) {
  .wb-grid { grid-template-columns: 1fr; }
  .mood-grid { flex-direction: row; overflow-x: auto; flex-wrap: nowrap; }
  .mood-btn { min-width: 80px; flex: none; }
  .motiv-grid { grid-template-columns: 1fr; }
  .emergency-grid { grid-template-columns: 1fr; }
}

.nova-msgs { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; padding: 8px 0; }
.nova-msg { display: flex; gap: 8px; }
.nova-msg.user { flex-direction: row-reverse; }
.nova-msg-av { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
.nova-msg-body { padding: 10px 14px; border-radius: 14px; font-size: 0.85rem; line-height: 1.55; max-width: 80%; word-break: break-word; }
.nova-msg.user .nova-msg-body { background: var(--purple); color: #fff; border-bottom-right-radius: 4px; }
.nova-msg.assistant .nova-msg-body { background: var(--bg); color: var(--text); border-bottom-left-radius: 4px; }
.nova-msg-body :deep(strong) { font-weight: 700; }
.nova-thinking { display: flex; gap: 4px; padding: 4px 0; }
.nova-thinking span { width: 6px; height: 6px; background: var(--purple); border-radius: 50%; animation: nova-bounce 1.4s infinite; }
.nova-thinking span:nth-child(2) { animation-delay: 0.2s; }
.nova-thinking span:nth-child(3) { animation-delay: 0.4s; }
@keyframes nova-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
.nova-send:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
