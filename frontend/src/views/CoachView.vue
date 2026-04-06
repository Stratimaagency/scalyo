<template>
  <div class="coach fade-in">
    <!-- Hero header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon">🪄</div>
        <div class="page-header__text">
          <h1 class="page-header__title">{{ t('coachTitle') }}</h1>
          <p class="page-header__subtitle">
            <span class="coach-pulse"></span>
            {{ t('coachStatus') }}
          </p>
        </div>
      </div>
      <div class="page-header__actions">
        <div v-if="dailyCount >= dailyLimit" class="coach-limit">
          {{ t('dailyLimitReached') }}
          <button v-if="isStarter" class="coach-upgrade" @click="$router.push({ name: 'settings' })">🔓 {{ t('upgradeToGrowth') }}</button>
        </div>
        <div v-else class="coach-counter">{{ dailyCount }}/{{ dailyLimit }}</div>
      </div>
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

      <!-- Clear + Input -->
      <div v-if="messages.length > 1" class="coach-clear-bar">
        <button @click="clearHistory" class="coach-clear-btn">🗑️ Effacer l'historique</button>
      </div>
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

const PLAN_LIMITS = { Starter: 5, Growth: 50, Elite: 50 }
const dailyLimit = computed(() => PLAN_LIMITS[authStore.company?.plan || 'Starter'] || 5)
const isStarter = computed(() => (authStore.company?.plan || 'Starter') === 'Starter')
const STORAGE_KEY = 'scalyo_coach_messages'
const COUNT_KEY = 'scalyo_coach_count'

// Knowledge base (CS Coach responses)
const CS_COACH_RESPONSES = {
  churn: {
    trigger: ['churn', 'churner', 'partir', 'résilier', 'perte', 'perdre', 'quitter', 'cancel', 'cancellation', 'losing client', 'leave', 'at risk', 'prevent churn'],
    fr: `**Stratégie anti-churn — Framework d'intervention**\n\n1. **Détection précoce (J−60)** : Alertes sur 3 signaux clés :\n   • Baisse usage > 30% sur 2 semaines\n   • Silence email > 10 jours\n   • NPS < 6 à la dernière mesure\n\n2. **Triage du risque** :\n   • Risque faible → email de vérification + rapport d'usage\n   • Risque moyen → appel CSM dans les 5 jours\n   • Risque élevé → escalade manager + plan de remédiation\n\n3. **Appel d'urgence** : Préparez 3 questions ouvertes sur la valeur perçue, pas sur le produit.\n\n4. **Plan de sauvetage** : Objectif SMART sur 30 jours, sponsor identifié, point hebdo.`,
    en: `**Anti-Churn Strategy — Intervention Framework**\n\n1. **Early detection (D−60)**: Alerts on 3 key signals:\n   • Usage drop > 30% over 2 weeks\n   • Email silence > 10 days\n   • NPS < 6 at last measurement\n\n2. **Risk triage**:\n   • Low risk → usage report + check-in email\n   • Medium risk → CSM call within 5 days\n   • High risk → manager escalation + rescue plan\n\n3. **Emergency call**: Prepare 3 open-ended questions about perceived value.\n\n4. **Rescue plan**: SMART goal over 30 days, sponsor identified, weekly touchpoint.`,
    kr: `**이탈 방지 전략 — 개입 프레임워크**\n\n1. **조기 감지 (D-60)**: 3가지 핵심 신호 알림:\n   • 2주간 사용량 30% 이상 감소\n   • 이메일 침묵 10일 이상\n   • 마지막 측정 NPS < 6\n\n2. **위험 분류**:\n   • 낮은 위험 → 사용 보고서 + 확인 이메일\n   • 중간 위험 → 5일 내 CSM 통화\n   • 높은 위험 → 매니저 에스컬레이션 + 구조 계획`
  },
  onboarding: {
    trigger: ['onboarding', 'accueil', 'démarrage', 'activation', 'nouveau client', 'new client', 'getting started', 'kickoff', 'onboard'],
    fr: `**Framework Onboarding B2B — J0 à J60**\n\n**J0 → J7 (Activation)** :\n• Email de bienvenue < 2h après signature\n• Appel kick-off dans les 48h\n• Configuration de base + 1er quick win identifié\n\n**J8 → J30 (Adoption)** :\n• Formation utilisateurs clés (2h max, enregistrée)\n• Définir 3 KPIs de succès avec le client\n• Check-in hebdomadaire (30 min)\n\n**J31 → J60 (Expansion)** :\n• Premier rapport d'usage partagé\n• NPS check informel\n• Identification des utilisateurs champions`,
    en: `**B2B Onboarding Framework — Day 0 to Day 60**\n\n**D0 → D7 (Activation)**:\n• Welcome email < 2h after signing\n• Kickoff call within 48h\n• Basic setup + first quick win identified\n\n**D8 → D30 (Adoption)**:\n• Train key users (2h max, recorded)\n• Define 3 success KPIs with the client\n• Weekly check-in (30 min)\n\n**D31 → D60 (Expansion)**:\n• First usage report shared\n• Informal NPS check\n• Champion users identified`,
    kr: `**B2B 온보딩 프레임워크 — 0일에서 60일까지**\n\n**D0 → D7 (활성화)**:\n• 서명 후 2시간 이내 환영 이메일\n• 48시간 내 킥오프 콜\n• 기본 설정 + 첫 번째 퀵 윈 확인`
  },
  nps: {
    trigger: ['nps', 'satisfaction', 'score', 'promoteur', 'détracteur', 'promoter', 'detractor', 'survey', 'net promoter'],
    fr: `**Améliorer son NPS — Plan d'action 60 jours**\n\n**Les 3 causes fréquentes** :\n1. Écart entre valeur promise et valeur perçue\n2. Points de friction non résolus\n3. Manque de contact proactif\n\n**Plan 60 jours** :\n\n*Semaines 1-2* : Fermer la boucle avec les détracteurs (0-6)\n→ Appel personnalisé, plan d'action documenté\n\n*Semaines 3-4* : Activer les passifs (7-8)\n→ Ressources ciblées, invitation événement\n\n*Semaines 5-6* : Transformer les promoteurs en ambassadeurs\n→ Programme de référencement, témoignage`,
    en: `**Improving NPS — 60-day Action Plan**\n\n*Weeks 1-2*: Close the loop with detractors (0-6)\n*Weeks 3-4*: Activate passives (7-8)\n*Weeks 5-6*: Turn promoters into advocates`,
    kr: `**NPS 개선 — 60일 실행 계획**\n\n*1-2주차*: 비추천자와 루프 닫기\n*3-4주차*: 수동적 사용자 활성화\n*5-6주차*: 추천자를 옹호자로 전환`
  },
  qbr: {
    trigger: ['qbr', 'bilan', 'trimestriel', 'revue', 'quarterly', 'business review', 'meeting', 'exec review'],
    fr: `**Structure QBR B2B — Revue Trimestrielle**\n\n**Durée recommandée** : 45 minutes\n\n1. **Résultats du trimestre** (10 min)\n2. **Points d'attention** (10 min)\n3. **Objectifs trimestre suivant** (15 min)\n4. **Roadmap & innovations** (5 min)\n5. **Questions ouvertes** (5 min)`,
    en: `**B2B QBR Structure**\n\n1. Quarter results (10 min)\n2. Key points (10 min)\n3. Next quarter goals (15 min)\n4. Roadmap (5 min)\n5. Open questions (5 min)`,
    kr: `**B2B QBR 구조**\n\n1. 분기 결과 (10분)\n2. 핵심 포인트 (10분)\n3. 다음 분기 목표 (15분)\n4. 로드맵 (5분)\n5. 개방형 질문 (5분)`
  },
  expansion: {
    trigger: ['expansion', 'upsell', 'upgrade', 'cross-sell', 'développer', 'croissance', 'grow account', 'expand'],
    fr: `**Stratégie d'expansion — PACT Framework**\n\n**P — Patience** : Adoption prouvée (score > 70, NPS ≥ 7)\n**A — Ancrage valeur** : ROI AVANT upgrade\n**C — Contexte business** : Besoin émergent identifié\n**T — Timing** : Après succès, avant renouvellement, changement orga`,
    en: `**Expansion Strategy — PACT Framework**\n\n**P — Patience**: Proven adoption first\n**A — Anchor value**: ROI before upgrade\n**C — Context**: Address emerging need\n**T — Timing**: After success, before renewal, during change`,
    kr: `**확장 전략 — PACT 프레임워크**\n\n**P — 인내**: 채택 입증 후\n**A — 가치 고정**: 업그레이드 전 ROI\n**C — 맥락**: 신규 니즈 대응\n**T — 타이밍**: 성공 후, 갱신 전, 변화 시`
  },
  burnout: {
    trigger: ['burnout', 'épuisement', 'stress', 'surcharge', 'charge', 'fatigue', 'wellbeing', 'team stress', 'overload', 'exhaustion'],
    fr: `**Prévention du burnout CSM**\n\n**Signaux d'alerte** :\n• Satisfaction < 6/10\n• Augmentation des erreurs\n• Comptes critiques > 30%\n\n**Actions manager** :\n→ Check-in mensuel ressenti\n→ Redistribution proactive\n→ Célébrer les victoires\n\n**Actions CSM** :\n→ 2h/semaine sans meetings\n→ Batching urgences\n→ Documenter comptes complexes\n\n**Indicateur** : Charge > 80% sur 4+ semaines = critique.`,
    en: `**CSM Burnout Prevention**\n\n**Signals**: Satisfaction < 6/10, errors, critical accounts > 30%\n**Manager**: Monthly 1:1 on feelings, redistribute, celebrate\n**CSM**: Block 2h/week, batch urgents, document complex accounts\n**Key**: Workload > 80% for 4+ weeks = critical.`,
    kr: `**CSM 번아웃 예방**\n\n**신호**: 만족도 < 6/10, 오류 증가, 위험 계정 > 30%\n**매니저**: 감정 중심 1:1, 재분배, 축하\n**CSM**: 주 2시간 딥워크, 배치 처리, 문서화`
  }
}

const defaultResponses = {
  fr: `**Bonjour ! Je suis votre Coach CS.** 🪄\n\nJe peux vous aider sur :\n\n• **Anti-churn** : Protocoles, scripts, plans de sauvetage\n• **Onboarding** : Structure D0→D60, KPIs d'activation\n• **NPS** : Amélioration du score, closing the loop\n• **QBR** : Structure, agenda, questions clés\n• **Expansion** : Identification des opportunités\n• **Bien-être** : Prévention burnout\n\nPosez-moi votre question !`,
  en: `**Hello! I'm your CS Coach.** 🪄\n\nI can help you with:\n\n• **Anti-churn**: Protocols, scripts, rescue plans\n• **Onboarding**: D0→D60 structure, activation KPIs\n• **NPS**: Score improvement, closing the loop\n• **QBR**: Structure, agenda, key questions\n• **Expansion**: Opportunity identification\n• **Wellbeing**: Burnout prevention\n\nAsk me anything!`,
  kr: `**안녕하세요! CS 코치입니다.** 🪄\n\n도움을 드릴 수 있는 분야:\n\n• **이탈 방지**: 프로토콜, 스크립트, 구출 계획\n• **온보딩**: D0→D60 구조\n• **NPS**: 점수 개선\n• **QBR**: 구조, 의제, 핵심 질문\n• **확장**: 기회 식별\n\n무엇이든 물어보세요!`
}

const quickSuggestions = computed(() => {
  if (lang.value === 'kr') return ['이탈률 줄이는 방법?', 'QBR 구성하기', 'NPS 점수 개선', '번아웃 예방', '확장 전략']
  if (lang.value === 'en') return ['How to reduce churn?', 'Structure a QBR', 'Improve NPS score', 'Prevent burnout', 'Expansion strategy']
  return ['Comment réduire le churn ?', 'Structurer un QBR', 'Améliorer le NPS', 'Prévenir le burnout', "Stratégie d'expansion"]
})

// Daily count
const dailyCount = ref(0)
function loadDailyCount() {
  try {
    const saved = JSON.parse(localStorage.getItem(COUNT_KEY) || '{}')
    const today = new Date().toISOString().slice(0, 10)
    dailyCount.value = saved.date === today ? (saved.count || 0) : 0
  } catch { dailyCount.value = 0 }
}
function incrementDailyCount() {
  const today = new Date().toISOString().slice(0, 10)
  dailyCount.value++
  localStorage.setItem(COUNT_KEY, JSON.stringify({ date: today, count: dailyCount.value }))
}

// Persistence
function loadMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [{ role: 'assistant', content: defaultResponses[lang.value] || defaultResponses.fr }]
}

function saveMessages() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value)) } catch {}
}

// Typewriter effect
function displayedText(index) {
  const msg = messages.value[index]
  if (!msg || msg.role === 'user') return msg?.content || ''
  if (typingProgress.value[index] !== undefined && typingProgress.value[index] < msg.content.length) {
    return msg.content.slice(0, typingProgress.value[index])
  }
  return msg.content
}

let typewriterTimer = null

function typewriterEffect(index, text) {
  if (typewriterTimer) clearTimeout(typewriterTimer)
  typingProgress.value[index] = 0
  const step = () => {
    if (typingProgress.value[index] < text.length) {
      typingProgress.value[index] += Math.min(3, text.length - typingProgress.value[index])
      scrollToBottom()
      typewriterTimer = setTimeout(step, 8)
    } else {
      typewriterTimer = null
    }
  }
  step()
}

onUnmounted(() => {
  if (typewriterTimer) clearTimeout(typewriterTimer)
})

function scrollToBottom() {
  nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight })
}

// Find KB answer
function findKBAnswer(text) {
  const lower = text.toLowerCase()
  for (const [, val] of Object.entries(CS_COACH_RESPONSES)) {
    if (val.trigger && val.trigger.some(t => lower.includes(t))) {
      return val[lang.value] || val.fr
    }
  }
  return null
}

function clearHistory() {
  if (!confirm('Effacer tout l\'historique de conversation ? Cette action est irréversible.')) return
  messages.value = [{ role: 'assistant', content: defaultResponses[lang.value] || defaultResponses.fr }]
  localStorage.removeItem(STORAGE_KEY)
  saveMessages()
}

// Send message
async function send(text) {
  const msg = typeof text === 'string' ? text.trim() : input.value.trim()
  if (!msg || loading.value || dailyCount.value >= dailyLimit.value) return
  input.value = ''
  messages.value.push({ role: 'user', content: msg })
  loading.value = true
  incrementDailyCount()
  await nextTick()
  scrollToBottom()

  // Try KB first
  const kbAnswer = findKBAnswer(msg)
  if (kbAnswer) {
    messages.value.push({ role: 'assistant', content: kbAnswer })
    const idx = messages.value.length - 1
    loading.value = false
    typewriterEffect(idx, kbAnswer)
    saveMessages()
    return
  }

  // Fallback to API
  try {
    const chatMessages = messages.value.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    const { data } = await coachApi.chat(chatMessages, 'coach')
    const content = data.content || data.message || defaultResponses[lang.value] || defaultResponses.fr
    messages.value.push({ role: 'assistant', content })
    typewriterEffect(messages.value.length - 1, content)
  } catch (e) {
    const errMsg = e.response?.data?.error || e.message || 'Connection error'
    messages.value.push({ role: 'assistant', content: `❌ ${errMsg}` })
  }
  loading.value = false
  saveMessages()
}

// Reset messages when language changes
watch(lang, () => {
  messages.value = [{ role: 'assistant', content: defaultResponses[lang.value] || defaultResponses.fr }]
  saveMessages()
})

watch(() => messages.value.length, scrollToBottom)

onMounted(() => {
  messages.value = loadMessages()
  loadDailyCount()
})
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

/* Clear bar */
.coach-clear-bar { padding: 4px 18px 0; display: flex; justify-content: flex-end; }
.coach-clear-btn { font-size: 11px; color: var(--muted); background: none; border: none; cursor: pointer; padding: 2px 8px; border-radius: 6px; opacity: .6; transition: all .15s; }
.coach-clear-btn:hover { opacity: 1; color: #ef4444; background: rgba(239,68,68,.06); }

/* Input */
.coach-input-area { padding: 12px 18px; border-top: 1px solid var(--border); display: flex; gap: 8px; background: var(--bg); }
.coach-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; font-size: 13px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; resize: none; }
.coach-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.1); }
.coach-send { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .1s; box-shadow: 0 2px 8px rgba(59,130,246,.25); }
.coach-send:hover:not(:disabled) { transform: scale(1.05); }
.coach-send:disabled { opacity: .4; }
</style>
