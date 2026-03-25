<template>
  <div class="fade-in" style="max-width: 700px; margin: 0 auto">
    <AppCard>
      <div style="text-align: center; margin-bottom: 20px">
        <div style="margin-bottom: 8px"><ScalyoIcon name="robot" :size="36" /></div>
        <h3 style="font-weight: 800">{{ t('coachTitle') }}</h3>
        <p style="font-size: 13px; color: var(--muted)">{{ t('coachStatus') }}</p>
        <div v-if="dailyCount >= dailyLimit" style="font-size: 12px; color: var(--amber); margin-top: 6px">
          {{ lang === 'en' ? 'Daily limit reached. Try again tomorrow.' : lang === 'kr' ? '일일 한도에 도달했습니다.' : 'Limite quotidienne atteinte.' }}
        </div>
      </div>

      <!-- Messages -->
      <div ref="chatContainer" style="max-height: 500px; overflow-y: auto; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth">
        <div v-for="(msg, i) in messages" :key="i" :style="{ textAlign: msg.role === 'user' ? 'right' : 'left' }">
          <div style="display: inline-block; padding: 10px 14px; border-radius: 14px; max-width: 85%; font-size: 13px; line-height: 1.7; white-space: pre-wrap"
            :style="{
              background: msg.role === 'user' ? 'var(--tealBg)' : 'var(--surface)',
              color: msg.role === 'user' ? 'var(--teal)' : 'var(--text)',
              border: '1px solid ' + (msg.role === 'user' ? 'var(--tealBorder)' : 'var(--border)'),
            }"
          >{{ msg.role === 'user' ? msg.content : displayedText(i) }}</div>
        </div>
        <div v-if="loading" style="color: var(--muted); font-size: 13px; display: flex; gap: 6px; align-items: center">
          <div class="spin" style="width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border); border-top-color: var(--teal)"></div>
          {{ t('thinking') }}
        </div>
      </div>

      <!-- Quick suggestions -->
      <div v-if="messages.length <= 1" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px">
        <button v-for="q in quickSuggestions" :key="q" class="chip" @click="send(q)">{{ q }}</button>
      </div>

      <!-- Input -->
      <div style="display: flex; gap: 8px">
        <textarea
          v-model="input"
          class="chat-input"
          rows="1"
          :placeholder="t('coachPlaceholder')"
          :disabled="dailyCount >= dailyLimit"
          @keydown.enter.prevent="send(input)"
        ></textarea>
        <button class="chat-send-btn" :disabled="!input.trim() || loading || dailyCount >= dailyLimit" @click="send(input)">
          <ScalyoIcon name="send" :size="16" />
        </button>
      </div>

      <!-- Daily counter -->
      <div style="text-align: right; font-size: 11px; color: var(--muted); margin-top: 6px">
        {{ dailyCount }}/{{ dailyLimit }} {{ lang === 'en' ? 'messages today' : lang === 'kr' ? '오늘 메시지' : 'messages aujourd\'hui' }}
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { coachApi } from '../api'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/AppCard.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t, lang } = useI18n()
const authStore = useAuthStore()
const messages = ref([])
const input = ref('')
const loading = ref(false)
const chatContainer = ref(null)
const typingIndex = ref(-1)
const typingProgress = ref({})

const dailyLimit = 50
const STORAGE_KEY = 'scalyo_coach_messages'
const COUNT_KEY = 'scalyo_coach_count'

// Knowledge base (CS Coach responses)
const CS_COACH_RESPONSES = {
  churn: {
    trigger: ['churn', 'churner', 'partir', 'résilier', 'perte', 'perdre', 'quitter', 'cancel', 'cancellation', 'losing client', 'leave', 'at risk', 'prevent churn'],
    fr: `**Stratégie anti-churn — Framework d'intervention**\n\n1. **Détection précoce (J−60)** : Alertes sur 3 signaux clés :\n   • Baisse usage > 30% sur 2 semaines\n   • Silence email > 10 jours\n   • NPS < 6 à la dernière mesure\n\n2. **Triage du risque** :\n   • Risque faible → email de vérification + rapport d'usage\n   • Risque moyen → appel CSM dans les 5 jours\n   • Risque élevé → escalade manager + plan de remédiation\n\n3. **Appel d'urgence** : Préparez 3 questions ouvertes sur la valeur perçue, pas sur le produit.\n\n4. **Plan de sauvetage** : Objectif SMART sur 30 jours, sponsor identifié, point hebdo.`,
    en: `**Anti-Churn Strategy — Intervention Framework**\n\n1. **Early detection (D−60)**: Alerts on 3 key signals:\n   • Usage drop > 30% over 2 weeks\n   • Email silence > 10 days\n   • NPS < 6 at last measurement\n\n2. **Risk triage**:\n   • Low risk → usage report + check-in email\n   • Medium risk → CSM call within 5 days\n   • High risk → manager escalation + rescue plan\n\n3. **Emergency call**: Prepare 3 open-ended questions about perceived value.\n\n4. **Rescue plan**: SMART goal over 30 days, sponsor identified, weekly touchpoint.`,
    kr: `**이탈 방지 전략 — 개입 프레임워크**\n\n1. **조기 감지 (D-60)**: 3가지 핵심 신호 알림:\n   • 2주간 사용량 30% 이상 감소\n   • 이메일 침묵 10일 이상\n   • 마지막 측정 NPS < 6\n\n2. **위험 분류**:\n   • 낮은 위험 → 사용 보고서 + 확인 이메일\n   • 중간 위험 → 5일 내 CSM 통화\n   • 높은 위험 → 매니저 에스컬레이션 + 구조 계획\n\n3. **긴급 통화**: 인지된 가치에 대한 3가지 개방형 질문 준비.\n\n4. **구조 계획**: 30일 SMART 목표, 스폰서 확인, 주간 터치포인트.`
  },
  onboarding: {
    trigger: ['onboarding', 'accueil', 'démarrage', 'activation', 'nouveau client', 'new client', 'getting started', 'kickoff', 'onboard'],
    fr: `**Framework Onboarding B2B — J0 à J60**\n\n**J0 → J7 (Activation)** :\n• Email de bienvenue < 2h après signature\n• Appel kick-off dans les 48h\n• Configuration de base + 1er quick win identifié\n\n**J8 → J30 (Adoption)** :\n• Formation utilisateurs clés (2h max, enregistrée)\n• Définir 3 KPIs de succès avec le client\n• Check-in hebdomadaire (30 min)\n\n**J31 → J60 (Expansion)** :\n• Premier rapport d'usage partagé\n• NPS check informel\n• Identification des utilisateurs champions\n• Présentation roadmap produit`,
    en: `**B2B Onboarding Framework — Day 0 to Day 60**\n\n**D0 → D7 (Activation)**:\n• Welcome email < 2h after signing\n• Kickoff call within 48h\n• Basic setup + first quick win identified\n\n**D8 → D30 (Adoption)**:\n• Train key users (2h max, recorded)\n• Define 3 success KPIs with the client\n• Weekly check-in (30 min)\n\n**D31 → D60 (Expansion)**:\n• First usage report shared\n• Informal NPS check\n• Champion users identified\n• Product roadmap presented`,
    kr: `**B2B 온보딩 프레임워크 — 0일에서 60일까지**\n\n**D0 → D7 (활성화)**:\n• 서명 후 2시간 이내 환영 이메일\n• 48시간 내 킥오프 콜\n• 기본 설정 + 첫 번째 퀵 윈 확인\n\n**D8 → D30 (채택)**:\n• 핵심 사용자 교육 (최대 2시간, 녹화)\n• 고객과 3가지 성공 KPI 정의\n• 주간 체크인 (30분)\n\n**D31 → D60 (확장)**:\n• 첫 사용 보고서 공유\n• 비공식 NPS 체크\n• 챔피언 사용자 확인`
  },
  nps: {
    trigger: ['nps', 'satisfaction', 'score', 'promoteur', 'détracteur', 'promoter', 'detractor', 'survey', 'net promoter'],
    fr: `**Améliorer son NPS — Plan d'action 60 jours**\n\n**Les 3 causes fréquentes** :\n1. Écart entre valeur promise et valeur perçue\n2. Points de friction non résolus (onboarding, support)\n3. Manque de contact proactif\n\n**Plan 60 jours** :\n\n*Semaines 1-2* : Fermer la boucle avec les détracteurs (0-6)\n→ Appel personnalisé, plan d'action documenté\n\n*Semaines 3-4* : Activer les passifs (7-8)\n→ Ressources ciblées, invitation événement\n\n*Semaines 5-6* : Transformer les promoteurs en ambassadeurs\n→ Programme de référencement, témoignage`,
    en: `**Improving NPS — 60-day Action Plan**\n\n**3 common causes**:\n1. Gap between promised and perceived value\n2. Unresolved friction points (onboarding, support)\n3. Lack of proactive contact\n\n**60-day plan**:\n\n*Weeks 1-2*: Close the loop with detractors (0-6)\n→ Personalized call, documented action plan\n\n*Weeks 3-4*: Activate passives (7-8)\n→ Targeted resources, event invitation\n\n*Weeks 5-6*: Turn promoters into advocates\n→ Referral program, testimonial`,
    kr: `**NPS 개선 — 60일 실행 계획**\n\n**3가지 일반적 원인**:\n1. 약속된 가치와 인지된 가치 간 격차\n2. 해결되지 않은 마찰점\n3. 사전 연락 부족\n\n**60일 계획**:\n\n*1-2주차*: 비추천자와 루프 닫기 (0-6)\n→ 개인화된 통화, 문서화된 실행 계획\n\n*3-4주차*: 수동적 사용자 활성화 (7-8)\n→ 타겟 리소스, 이벤트 초대\n\n*5-6주차*: 추천자를 옹호자로 전환\n→ 추천 프로그램, 사례 연구`
  },
  qbr: {
    trigger: ['qbr', 'bilan', 'trimestriel', 'revue', 'quarterly', 'business review', 'meeting', 'exec review'],
    fr: `**Structure QBR B2B — Revue Trimestrielle**\n\n**Durée recommandée** : 45 minutes\n\n1. **Résultats du trimestre** (10 min)\n   • KPIs vs objectifs définis ensemble\n   • ROI calculé et chiffré\n\n2. **Points d'attention** (10 min)\n   • Ce qui a bien fonctionné\n   • Obstacles rencontrés et résolus\n\n3. **Objectifs trimestre suivant** (15 min)\n   • 2-3 objectifs SMART co-définis\n   • Jalons de suivi\n\n4. **Roadmap & innovations** (5 min)\n\n5. **Questions ouvertes** (5 min)\n   → "Qu'attendez-vous encore de nous ?"`,
    en: `**B2B QBR Structure — Quarterly Business Review**\n\n**Recommended duration**: 45 minutes\n\n1. **Quarter results** (10 min)\n   • KPIs vs. jointly defined goals\n   • Calculated and quantified ROI\n\n2. **Key points** (10 min)\n   • What worked well\n   • Obstacles and how they were resolved\n\n3. **Next quarter goals** (15 min)\n   • 2-3 SMART goals co-defined\n   • Milestones\n\n4. **Roadmap & innovations** (5 min)\n\n5. **Open questions** (5 min)\n   → "What are you still waiting for from us?"`,
    kr: `**B2B QBR 구조 — 분기별 비즈니스 리뷰**\n\n**권장 시간**: 45분\n\n1. **분기 결과** (10분)\n   • 공동 정의 목표 대비 KPI\n   • 계산된 ROI\n\n2. **핵심 포인트** (10분)\n   • 잘된 것\n   • 장애물과 해결 방법\n\n3. **다음 분기 목표** (15분)\n   • 공동 정의 SMART 목표 2-3개\n   • 마일스톤\n\n4. **로드맵** (5분)\n\n5. **개방형 질문** (5분)`
  },
  expansion: {
    trigger: ['expansion', 'upsell', 'upgrade', 'cross-sell', 'développer', 'croissance', 'grow account', 'expand'],
    fr: `**Stratégie d'expansion client — PACT Framework**\n\n**P — Patience** : N'abordez l'expansion qu'une fois l'adoption prouvée (score > 70, NPS ≥ 7)\n\n**A — Ancrage valeur** : Montrez le ROI AVANT de parler d'upgrade\n→ "Vous avez économisé X h/mois = Y€ de valeur créée"\n\n**C — Contexte business** : L'expansion doit répondre à un besoin émergent identifié\n\n**T — Timing** : Les 3 meilleurs moments :\n1. Après un succès notable\n2. Avant un renouvellement (J−90)\n3. Lors d'un changement organisationnel`,
    en: `**Client Expansion Strategy — PACT Framework**\n\n**P — Patience**: Only approach expansion once adoption is proven (score > 70, NPS ≥ 7)\n\n**A — Anchor value**: Show concrete ROI BEFORE talking about upgrade\n→ "You've saved X hours/month = €Y in value"\n\n**C — Business context**: Expansion must address an emerging need\n\n**T — Timing**: The 3 best moments:\n1. After a notable success\n2. Before renewal (D−90)\n3. During organizational change`,
    kr: `**고객 확장 전략 — PACT 프레임워크**\n\n**P — 인내**: 채택이 입증된 후에만 확장 접근 (점수 > 70, NPS ≥ 7)\n\n**A — 가치 고정**: 업그레이드 전에 구체적 ROI 제시\n→ "월 X시간 절약 = Y€ 가치 창출"\n\n**C — 비즈니스 맥락**: 확장은 발견된 신규 니즈에 대응해야 함\n\n**T — 타이밍**: 최적의 3가지 시점:\n1. 주목할 만한 성공 후\n2. 갱신 전 (D-90)\n3. 조직 변화 시`
  },
  burnout: {
    trigger: ['burnout', 'épuisement', 'stress', 'surcharge', 'charge', 'fatigue', 'wellbeing', 'team stress', 'overload', 'exhaustion'],
    fr: `**Prévention du burnout CSM — Signaux & actions**\n\n**Signaux d'alerte** :\n• Satisfaction < 6/10\n• Augmentation des erreurs ou délais\n• Diminution communication proactive\n• Comptes critiques > 30% du portefeuille\n\n**Pour le manager** :\n→ Check-in mensuel focalisé sur le ressenti\n→ Redistribution proactive des comptes\n→ Célébrer les victoires\n\n**Pour le CSM** :\n→ Bloquer 2h/semaine sans meetings\n→ Batching des urgences : 2 créneaux/jour\n→ Documenter les comptes complexes\n\n**Indicateur clé** : Taux de charge > 80% sur > 4 semaines = signal critique.`,
    en: `**CSM Burnout Prevention — Signals & Actions**\n\n**Warning signals**:\n• Satisfaction < 6/10 during check-ins\n• Increase in errors or delays\n• Decrease in proactive communication\n• Critical accounts > 30% of portfolio\n\n**For the manager**:\n→ Monthly 1:1 focused on feelings, not KPIs\n→ Proactive account redistribution\n→ Celebrate wins, even small ones\n\n**For the CSM**:\n→ Block 2h/week for deep work\n→ Batch urgent tasks: 2 × 30-min slots/day\n→ Document complex accounts\n\n**Key indicator**: Workload > 80% for > 4 weeks = critical signal.`,
    kr: `**CSM 번아웃 예방 — 신호 및 조치**\n\n**경고 신호**:\n• 만족도 < 6/10\n• 오류 또는 지연 증가\n• 사전 소통 감소\n• 위험 계정 > 포트폴리오의 30%\n\n**매니저용**:\n→ 감정 중심 월간 1:1\n→ 사전적 계정 재분배\n→ 작은 승리도 축하\n\n**CSM용**:\n→ 주 2시간 딥워크 블록\n→ 긴급 업무 배치: 하루 2 × 30분\n→ 복잡한 계정 문서화\n\n**핵심 지표**: 4주 이상 업무량 > 80% = 위험 신호.`
  }
}

const defaultResponses = {
  fr: `**Bonjour ! Je suis votre Coach CS.**\n\nJe peux vous aider sur :\n\n• **Anti-churn** : Protocoles, scripts, plans de remédiation\n• **Onboarding** : Structure J0→J60, KPIs d'activation\n• **NPS** : Amélioration du score, fermeture de boucle\n• **QBR** : Structure, agenda, questions clés\n• **Expansion** : Identification des opportunités, timing\n• **Bien-être équipe** : Prévention burnout, charge de travail\n\nPosez-moi une question spécifique !`,
  en: `**Hello! I'm your CS Coach.**\n\nI can help you with:\n\n• **Anti-churn**: Protocols, scripts, rescue plans\n• **Onboarding**: D0→D60 structure, activation KPIs\n• **NPS**: Score improvement, closing the loop\n• **QBR**: Structure, agenda, key questions\n• **Expansion**: Opportunity identification, timing\n• **Team wellbeing**: Burnout prevention, workload\n\nAsk me a specific question!`,
  kr: `**안녕하세요! CS 코치입니다.**\n\n도움 드릴 수 있는 분야:\n\n• **이탈 방지**: 프로토콜, 스크립트, 구조 계획\n• **온보딩**: D0→D60 구조, 활성화 KPI\n• **NPS**: 점수 개선, 루프 닫기\n• **QBR**: 구조, 안건, 핵심 질문\n• **확장**: 기회 식별, 타이밍\n• **팀 웰빙**: 번아웃 예방, 업무량\n\n구체적인 질문을 해주세요!`
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
      if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
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

// Send message
async function send(text) {
  if (!text?.trim() || dailyCount.value >= dailyLimit) return
  const userText = text.trim()
  messages.value.push({ role: 'user', content: userText })
  input.value = ''
  loading.value = true
  incrementDailyCount()
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight

  // Try KB first
  const kbAnswer = findKBAnswer(userText)
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
    const { data } = await coachApi.chat(
      messages.value.map(m => ({ role: m.role, content: m.content })),
      'coach'
    )
    const reply = data.content || defaultResponses[lang.value] || defaultResponses.fr
    messages.value.push({ role: 'assistant', content: reply })
    const idx = messages.value.length - 1
    typewriterEffect(idx, reply)
  } catch {
    messages.value.push({ role: 'assistant', content: t('errorAI') })
  }
  loading.value = false
  saveMessages()
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}

// Reset messages when language changes
watch(lang, () => {
  messages.value = [{ role: 'assistant', content: defaultResponses[lang.value] || defaultResponses.fr }]
  saveMessages()
})

onMounted(() => {
  messages.value = loadMessages()
  loadDailyCount()
})
</script>
