<template>
  <div class="coach fade-in">
    <!-- Hero header -->
    <div class="coach-hero">
      <div class="coach-avatar">🪄</div>
      <div class="coach-hero-info">
        <h1 class="coach-title">{{ t('coachTitle') }}</h1>
        <p class="coach-status">
          <span class="coach-pulse"></span>
          {{ t('coachStatus') }}
        </p>
      </div>
      <div v-if="dailyCount >= dailyLimit" class="coach-limit">
        {{ t('dailyLimitReached') }}
        <button v-if="isStarter" class="coach-upgrade" @click="$router.push({ name: 'settings' })">🔓 {{ t('upgradeToGrowth') }}</button>
      </div>
      <div v-else class="coach-counter">{{ dailyCount }}/{{ dailyLimit }}</div>
    </div>

    <!-- Chat area -->
    <div class="coach-chat">
      <div class="coach-messages" ref="chatContainer">
        <div v-for="(msg, i) in messages" :key="i" class="coach-msg" :class="{ 'coach-msg--user': msg.role === 'user' }">
          <div v-if="msg.role === 'assistant'" class="coach-msg-avatar">🪄</div>
          <div class="coach-msg-bubble" :class="{ 'coach-msg-bubble--user': msg.role === 'user' }">
            {{ msg.role === 'user' ? msg.content : displayedText(i) }}
          </div>
        </div>
        <div v-if="loading" class="coach-msg">
          <div class="coach-msg-avatar">🪄</div>
          <div class="coach-msg-bubble coach-typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Quick suggestions -->
      <div v-if="messages.length <= 1" class="coach-suggestions">
        <button v-for="q in quickSuggestions" :key="q" class="coach-chip" @click="send(q)">{{ q }}</button>
      </div>

      <!-- Input -->
      <div class="coach-input-area">
        <textarea v-model="input" class="coach-input" rows="1" :placeholder="t('coachPlaceholder')"
          :disabled="dailyCount >= dailyLimit" @keydown.enter.prevent="send(input)"></textarea>
        <button class="coach-send" :disabled="!input.trim() || loading || dailyCount >= dailyLimit" @click="send(input)">
          <span style="font-size: 18px;">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { coachApi } from '../api'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'

const { t, lang } = useI18n()
const authStore = useAuthStore()
const messages = ref([])
const input = ref('')
const loading = ref(false)
const chatContainer = ref(null)
const typingIndex = ref(-1)
const typingProgress = ref({})

const isStarter = computed(() => (authStore.company?.plan || 'Starter') === 'Starter')
const dailyLimit = computed(() => isStarter.value ? 5 : 50)
const dailyCount = ref(0)

const quickSuggestions = computed(() => {
  const l = lang.value
  if (l === 'en') return ['How to reduce churn?', 'QBR best practices', 'NPS improvement plan', 'Handle a difficult client', 'Expansion strategy']
  if (l === 'kr') return ['이탈률을 줄이려면?', 'QBR 모범 사례', 'NPS 개선 계획', '어려운 고객 대응법', '확장 전략']
  return ['Comment réduire le churn ?', 'Préparer un QBR efficace', 'Plan d\'amélioration NPS', 'Gérer un client difficile', 'Stratégie d\'expansion']
})

const welcomeMessage = computed(() => {
  const l = lang.value
  if (l === 'en') return `**Hi! I'm your CS Coach.** 🪄\n\nI can help you with:\n\n• **Anti-churn**: Protocols, scripts, rescue plans\n• **Onboarding**: D0→D60 structure, activation KPIs\n• **NPS**: Score improvement, closing the loop\n• **QBR**: Structure, agenda, key questions\n• **Expansion**: Opportunity identification\n\nAsk me anything!`
  if (l === 'kr') return `**안녕하세요! CS 코치입니다.** 🪄\n\n도움을 드릴 수 있는 분야:\n\n• **이탈 방지**: 프로토콜, 스크립트, 구출 계획\n• **온보딩**: D0→D60 구조\n• **NPS**: 점수 개선\n• **QBR**: 구조, 의제, 핵심 질문\n• **확장**: 기회 식별\n\n무엇이든 물어보세요!`
  return `**Bonjour ! Je suis votre Coach CS.** 🪄\n\nJe peux vous aider sur :\n\n• **Anti-churn** : Protocoles, scripts, plans de sauvetage\n• **Onboarding** : Structure D0→D60, KPIs d'activation\n• **NPS** : Amélioration du score, closing the loop\n• **QBR** : Structure, agenda, questions clés\n• **Expansion** : Identification des opportunités\n\nPosez-moi votre question !`
})

function displayedText(index) {
  const msg = messages.value[index]
  if (!msg || msg.role === 'user') return msg?.content || ''
  if (typingProgress.value[index] !== undefined) {
    return msg.content.slice(0, typingProgress.value[index])
  }
  return msg.content
}

onMounted(() => {
  messages.value = [{ role: 'assistant', content: welcomeMessage.value }]
  const today = new Date().toDateString()
  const stored = localStorage.getItem('scalyo_coach_daily')
  if (stored) {
    try { const d = JSON.parse(stored); if (d.date === today) dailyCount.value = d.count } catch {}
  }
})

async function send(text) {
  const msg = typeof text === 'string' ? text.trim() : input.value.trim()
  if (!msg || loading.value || dailyCount.value >= dailyLimit.value) return
  input.value = ''
  messages.value.push({ role: 'user', content: msg })
  loading.value = true
  dailyCount.value++
  localStorage.setItem('scalyo_coach_daily', JSON.stringify({ date: new Date().toDateString(), count: dailyCount.value }))
  await nextTick()
  scrollToBottom()

  try {
    const chatMessages = messages.value.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    const { data } = await coachApi.chat(chatMessages)
    const content = data.content || data.message || 'Sorry, I could not generate a response.'
    messages.value.push({ role: 'assistant', content })
    typewriterEffect(messages.value.length - 1, content)
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '❌ ' + (e.response?.data?.error || 'Connection error. Please try again.') })
  }
  loading.value = false
}

function typewriterEffect(index, text) {
  typingProgress.value[index] = 0
  let pos = 0
  const interval = setInterval(() => {
    pos += 2
    if (pos >= text.length) { pos = text.length; clearInterval(interval); delete typingProgress.value[index] }
    typingProgress.value[index] = pos
    scrollToBottom()
  }, 10)
}

function scrollToBottom() { nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight }) }

watch(() => messages.value.length, scrollToBottom)
</script>

<style scoped>
.coach { max-width: 100%; margin: 0; padding: 20px 28px; height: 100%; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; }

/* Hero */
.coach-hero { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: linear-gradient(135deg, rgba(59,130,246,.08), rgba(139,92,246,.08)); border: 1px solid rgba(59,130,246,.15); border-radius: 16px; margin-bottom: 16px; }
.coach-avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(59,130,246,.25); }
.coach-hero-info { flex: 1; }
.coach-title { font-size: 18px; font-weight: 900; color: var(--text); margin: 0; }
.coach-status { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.coach-pulse { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; animation: coach-pulse 2s infinite; }
@keyframes coach-pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(139,92,246,.4); } 50% { opacity: .7; box-shadow: 0 0 0 6px rgba(139,92,246,0); } }
.coach-counter { font-size: 12px; font-weight: 700; color: var(--muted); background: var(--surface); padding: 4px 10px; border-radius: 8px; }
.coach-limit { font-size: 12px; color: var(--amber); text-align: right; }
.coach-upgrade { margin-top: 4px; font-size: 11px; padding: 4px 10px; border-radius: 8px; background: var(--teal); color: #fff; border: none; cursor: pointer; font-weight: 700; }

/* Chat */
.coach-chat { flex: 1; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; min-height: 500px; }
.coach-messages { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.coach-msg { display: flex; gap: 8px; align-items: flex-end; }
.coach-msg--user { justify-content: flex-end; }
.coach-msg-avatar { width: 30px; height: 30px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.coach-msg-bubble { max-width: 85%; background: var(--bg); border: 1px solid var(--border); border-radius: 16px 16px 16px 4px; padding: 12px 16px; font-size: 13px; line-height: 1.7; white-space: pre-wrap; color: var(--text); }
.coach-msg-bubble--user { background: linear-gradient(135deg, rgba(59,130,246,.1), rgba(139,92,246,.1)); border: 1px solid rgba(59,130,246,.2); border-radius: 16px 16px 4px 16px; color: var(--text); }
.coach-typing { display: flex; gap: 4px; padding: 14px 18px; }
.coach-typing span { width: 6px; height: 6px; background: #8b5cf6; border-radius: 50%; animation: coach-bounce .5s infinite alternate; }
.coach-typing span:nth-child(2) { animation-delay: .15s; }
.coach-typing span:nth-child(3) { animation-delay: .3s; }
@keyframes coach-bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }

/* Suggestions */
.coach-suggestions { padding: 10px 18px; display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid var(--border); }
.coach-chip { font-size: 11px; padding: 6px 14px; border-radius: 20px; background: var(--bg); border: 1px solid var(--border); color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .12s; font-weight: 500; }
.coach-chip:hover { border-color: #8b5cf6; color: #8b5cf6; background: rgba(139,92,246,.06); }

/* Input */
.coach-input-area { padding: 12px 18px; border-top: 1px solid var(--border); display: flex; gap: 8px; background: var(--bg); }
.coach-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; font-size: 13px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; resize: none; }
.coach-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.1); }
.coach-send { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .1s; box-shadow: 0 2px 8px rgba(59,130,246,.25); }
.coach-send:hover:not(:disabled) { transform: scale(1.05); }
.coach-send:disabled { opacity: .4; }
</style>
