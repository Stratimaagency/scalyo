<template>
  <div class="wb fade-in">
    <!-- Hero -->
    <div class="wb-hero">
      <div class="wb-hero-left">
        <div class="wb-hero-icon">{{ roleIcon }}</div>
        <div>
          <h1 class="wb-title">{{ t('wellbeing') }}</h1>
          <p class="wb-subtitle">🔒 {{ t('wbConf') }}</p>
        </div>
      </div>
      <div class="wb-hero-score">
        <svg viewBox="0 0 80 80" class="wb-ring">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="7"/>
          <circle cx="40" cy="40" r="34" fill="none" :stroke="scoreColor" stroke-width="7"
            stroke-linecap="round" :stroke-dasharray="214" :stroke-dashoffset="214 - (wbData.score / 100 * 214)"
            class="wb-ring-fill" transform="rotate(-90 40 40)"/>
        </svg>
        <span class="wb-ring-val" :style="{ color: scoreColor }">{{ wbData.score }}</span>
      </div>
    </div>

    <!-- Mood check-in -->
    <div class="wb-mood-card">
      <span class="wb-mood-label">{{ t('wbHowAreYou') }}</span>
      <div class="wb-mood-emojis">
        <button v-for="mood in moods" :key="mood.value" class="wb-mood-btn" :class="{ 'wb-mood-btn--on': currentMood === mood.value }" @click="setMood(mood.value)" :title="mood.label">
          <span class="wb-mood-emoji">{{ mood.emoji }}</span>
          <span class="wb-mood-text">{{ mood.label }}</span>
        </button>
      </div>
    </div>

    <!-- Score slider + metrics -->
    <div class="wb-metrics">
      <div class="wb-metric-card">
        <div class="wb-metric-header">
          <span>💚 {{ t('wellbeingScore') }}</span>
          <span class="wb-metric-val" :style="{ color: scoreColor }">{{ wbData.score }}/100</span>
        </div>
        <input type="range" min="0" max="100" :value="wbData.score" @input="saveWellbeing({ score: parseInt($event.target.value) })" class="wb-slider" />
      </div>
      <div class="wb-metric-card">
        <div class="wb-metric-header">
          <span>🧠 {{ t('burnoutRisk') }}</span>
          <span class="wb-metric-val" :style="{ color: burnoutColor }">{{ burnoutLabel }}</span>
        </div>
      </div>
      <div class="wb-metric-card">
        <div class="wb-metric-header">
          <span>⚡ {{ t('htWorkload') }}</span>
          <span class="wb-metric-val" :style="{ color: wbData.charge > 85 ? 'var(--red)' : wbData.charge > 70 ? 'var(--amber)' : 'var(--green)' }">{{ wbData.charge }}%</span>
        </div>
        <div class="wb-charge-bar"><div class="wb-charge-fill" :style="{ width: wbData.charge + '%', background: wbData.charge > 85 ? 'var(--red)' : wbData.charge > 70 ? 'var(--amber)' : 'var(--green)' }"></div></div>
      </div>
    </div>

    <!-- Team members -->
    <div v-if="team.length" class="wb-section">
      <h3 class="wb-section-title">👥 {{ t('wbDetail') }}</h3>
      <div class="wb-team-grid">
        <div v-for="(member, i) in team" :key="i" class="wb-member-card" :class="{ 'wb-member-card--alert': (member.charge || 70) > 85 }">
          <div class="wb-member-header">
            <div class="wb-member-avatar" :style="{ background: (member.charge || 70) > 85 ? 'var(--red)' : (member.charge || 70) > 70 ? 'var(--amber)' : 'var(--green)' }">{{ (member.name || '?')[0] }}</div>
            <div class="wb-member-info">
              <div class="wb-member-name">{{ member.name }}</div>
              <div class="wb-member-meta">{{ member.accounts || 0 }} {{ userRole === 'commercial' ? 'prospects' : userRole === 'kam' ? 'comptes cl\u00e9s' : t('crmAccounts') }} · {{ t('satisfaction') }}: {{ member.sat || 7 }}/10</div>
            </div>
            <span class="wb-member-badge" :style="{ background: (member.charge || 70) > 85 ? 'var(--redBg)' : (member.charge || 70) > 70 ? 'var(--amberBg)' : 'var(--greenBg)', color: (member.charge || 70) > 85 ? 'var(--red)' : (member.charge || 70) > 70 ? 'var(--amber)' : 'var(--green)' }">
              {{ (member.charge || 70) > 85 ? '⚠ ' + t('overload') : (member.charge || 70) > 70 ? t('caution') : t('healthy') }}
            </span>
          </div>
          <div class="wb-member-bar"><div class="wb-member-fill" :style="{ width: (100 - (member.charge || 70)) + '%', background: (member.charge || 70) > 85 ? 'var(--red)' : 'var(--green)' }"></div></div>
        </div>
      </div>
    </div>

    <!-- Daily Wellbeing Tip -->
    <div class="wb-tip-card" :style="{ background: tipBg, borderColor: tipBorder }">
      <div class="wb-tip-header">
        <span class="wb-tip-icon">{{ tipIcon }}</span>
        <span class="wb-tip-label">{{ t('wbDailyTip') }}</span>
        <button class="wb-tip-refresh" @click="nextTip">↻</button>
      </div>
      <p class="wb-tip-text">{{ currentTip }}</p>
    </div>

    <!-- Mood history (visual) -->
    <div v-if="moodHistory.length" class="wb-section">
      <h3 class="wb-section-title">📊 {{ t('wbMoodHistory') }}</h3>
      <div class="wb-mood-history">
        <div v-for="(day, i) in moodHistory" :key="i" class="wb-mood-day">
          <span class="wb-mood-day-emoji">{{ moods.find(m => m.value === day.mood)?.emoji || '😐' }}</span>
          <span class="wb-mood-day-label">{{ day.label }}</span>
        </div>
      </div>
    </div>

    <!-- Quick encouragements -->
    <div class="wb-encouragements">
      <button v-for="enc in encouragements" :key="enc.emoji" class="wb-enc-btn" @click="showEncouragement(enc)">
        <span class="wb-enc-emoji">{{ enc.emoji }}</span>
        <span class="wb-enc-text">{{ enc.text }}</span>
      </button>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="wb-toast" :class="{ 'wb-toast--show': toastMsg }">{{ toastMsg }}</div>

    <!-- Nova AI Chat -->
    <div class="wb-section">
      <h3 class="wb-section-title">💬 Nova — {{ t('novaAi') }}</h3>
      <div class="wb-chat">
        <div class="wb-chat-messages" ref="chatContainer">
          <div v-for="(msg, i) in messages" :key="i" class="wb-msg" :class="{ 'wb-msg--user': msg.role === 'user' }">
            <div v-if="msg.role === 'assistant'" class="wb-msg-avatar">💚</div>
            <div class="wb-msg-bubble" :class="{ 'wb-msg-bubble--user': msg.role === 'user' }">{{ msg.content }}</div>
          </div>
          <div v-if="sending" class="wb-msg"><div class="wb-msg-avatar">💚</div><div class="wb-msg-bubble wb-typing"><span></span><span></span><span></span></div></div>
          <div ref="bottomRef"></div>
        </div>
        <div class="wb-chat-chips">
          <button v-for="(q, i) in quickChips" :key="i" @click="sendNova(q)" class="wb-chip">{{ q }}</button>
        </div>
        <div class="wb-chat-input">
          <input v-model="novaInput" @keydown.enter="sendNova(novaInput)" :placeholder="t('wellbeingPlaceholder')" class="wb-input" />
          <button @click="sendNova(novaInput)" :disabled="!novaInput.trim() || sending" class="wb-send">→</button>
        </div>
      </div>
    </div>

    <!-- Resources & Support -->
    <div class="wb-section">
      <h3 class="wb-section-title">🆘 {{ t('wbTalkSomeone') }}</h3>
      <div class="wb-helplines">
        <div class="wb-helpline">🇫🇷 France — <strong>3114</strong> (24/7)</div>
        <div class="wb-helpline">🇧🇪 Belgique — <strong>0800 32 123</strong></div>
        <div class="wb-helpline">🇨🇭 Suisse — <strong>143</strong></div>
        <div class="wb-helpline">🇨🇦 Canada — <strong>1-866-APPELLE</strong></div>
        <div class="wb-helpline">🇺🇸 USA — <strong>988</strong></div>
        <div class="wb-helpline">🇰🇷 한국 — <strong>1393</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { wellbeingApi, coachApi } from '../api'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import { useAuthStore } from '../stores/auth'
import { useChat } from '../composables/useChat'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role || 'csm')
const roleIcon = computed(() => ({ csm: '\uD83D\uDC9A', commercial: '\uD83D\uDCB0', kam: '\uD83E\uDD1D', manager: '\uD83D\uDC9A' }[userRole.value] || '\uD83D\uDC9A'))
const chatContainer = ref(null)
const bottomRef = ref(null)
const novaInput = ref('')
const currentMood = ref(3)

const moods = [
  { value: 1, emoji: '😫', label: t('wbExhausted') || 'Épuisé' },
  { value: 2, emoji: '😟', label: t('wbStressed') || 'Stressé' },
  { value: 3, emoji: '😐', label: t('caution') || 'Neutre' },
  { value: 4, emoji: '😊', label: t('healthy') || 'Bien' },
  { value: 5, emoji: '🤩', label: t('htMoodPositive') || 'Au top !' },
]

const toastMsg = ref('')
function showToast(msg) { toastMsg.value = msg; setTimeout(() => toastMsg.value = '', 3000) }

// Tips
const tipIndex = ref(0)
const tips = computed(() => [
  t('wbTip1') || 'Prenez 5 minutes pour respirer profondément entre deux calls.',
  t('wbTip2') || 'Un client difficile ? Notez 3 choses positives sur cette relation.',
  t('wbTip3') || 'Bloquez 30 min dans votre agenda pour ne rien faire — votre cerveau vous remerciera.',
  t('wbTip4') || 'Parlez à un collègue de ce qui vous pèse — vous n\'êtes pas seul(e).',
  t('wbTip5') || 'Célébrez vos petites victoires, pas seulement les grosses.',
  t('wbTip6') || 'Buvez un grand verre d\'eau maintenant. Votre corps en a besoin.',
  t('wbTip7') || 'Marchez 5 minutes — même autour du bureau ça change tout.',
])
const roleTips = computed(() => {
  if (userRole.value === 'commercial') return [
    'Apr\u00e8s un refus, notez ce que vous avez appris. Chaque "non" vous rapproche d\'un "oui".',
    'Bloquez 1h sans email ni Slack pour vos appels de prospection.',
    'C\u00e9l\u00e9brez chaque deal sign\u00e9, m\u00eame petit. La motivation se nourrit de victoires.',
    'Pr\u00e9parez votre pipeline le vendredi pour d\u00e9marrer lundi avec clart\u00e9.',
    'Un prospect difficile ? Changez d\'angle, pas d\'\u00e9nergie.',
    'Prenez 5 min pour visualiser votre objectif du mois. \u00c7a marche.',
    'Partagez une victoire avec l\'\u00e9quipe \u2014 le succ\u00e8s est contagieux.',
  ]
  if (userRole.value === 'kam') return [
    'Planifiez un point strat\u00e9gique mensuel avec chaque compte cl\u00e9.',
    'Notez les signaux faibles : un sponsor qui change, un budget gel\u00e9...',
    'Investissez dans la relation avant de pousser l\'upsell.',
    'Pr\u00e9parez chaque QBR comme une pr\u00e9sentation \u00e0 votre board.',
    'Un compte silencieux est un compte en danger. Relancez cette semaine.',
    'Cartographiez les d\u00e9cideurs \u2014 votre interlocuteur n\'est pas toujours le payeur.',
    'Bloquez du temps pour la veille sectorielle de vos comptes.',
  ]
  return tips.value // CSM tips (default)
})
const currentTip = computed(() => roleTips.value[tipIndex.value % roleTips.value.length])
const tipIcon = computed(() => ['🌱', '💡', '🧘', '💬', '🎉', '💧', '🚶'][tipIndex.value % 7])
const tipBg = computed(() => 'rgba(52,168,83,.06)')
const tipBorder = computed(() => 'rgba(52,168,83,.2)')
function nextTip() { tipIndex.value = (tipIndex.value + 1) % tips.value.length }

// Mood history (simulated from current score)
const moodHistory = computed(() => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
  const score = wbData.value.score
  return days.map((label, i) => ({
    label,
    mood: Math.max(1, Math.min(5, Math.round((score + (i - 2) * 5) / 20)))
  }))
})

// Encouragements
const encouragements = computed(() => {
  if (userRole.value === 'commercial') return [
    { emoji: '🎯', text: 'Chaque appel vous rapproche du deal' },
    { emoji: '💪', text: 'Les meilleurs vendeurs ont aussi des jours sans' },
    { emoji: '🚀', text: 'Votre pipeline se construit un contact à la fois' },
    { emoji: '⭐', text: 'Vous avez déjà prouvé que vous pouvez closer' },
  ]
  if (userRole.value === 'kam') return [
    { emoji: '🤝', text: 'Vos comptes vous font confiance' },
    { emoji: '📈', text: 'Chaque renouvellement est une victoire stratégique' },
    { emoji: '🧠', text: 'Votre expertise sectorielle fait la différence' },
    { emoji: '💎', text: 'La rétention est le meilleur investissement' },
  ]
  return [
    { emoji: '💪', text: t('wbEncStrength') || 'Vous êtes plus fort(e) que vous ne pensez' },
    { emoji: '🌟', text: t('wbEncStar') || 'Votre travail fait la différence' },
    { emoji: '☕', text: t('wbEncPause') || 'Accordez-vous une pause méritée' },
    { emoji: '🤝', text: t('wbEncTeam') || 'N\'hésitez pas à demander de l\'aide' },
  ]
})
function showEncouragement(enc) { showToast(enc.emoji + ' ' + enc.text) }

const wbData = ref({ score: 70, burnout: 'none', charge: 70, trend: '+0', alerts: [], team: [] })

onMounted(async () => {
  try { const { data } = await wellbeingApi.get(); Object.assign(wbData.value, data) } catch {}
})

let saveTimer = null
async function saveWellbeing(updates) {
  Object.assign(wbData.value, updates)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => { try { await wellbeingApi.update(wbData.value) } catch {} }, 400)
}
onUnmounted(() => clearTimeout(saveTimer))

function setMood(val) {
  currentMood.value = val
  const moodToScore = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 95 }
  saveWellbeing({ score: moodToScore[val] || 60 })
}

const team = computed(() => {
  const raw = wbData.value.team
  if (!raw) return []
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return [] } }
  return Array.isArray(raw) ? raw : []
})

const scoreColor = computed(() => wbData.value.score >= 70 ? 'var(--green)' : wbData.value.score >= 50 ? 'var(--amber)' : 'var(--red)')
const burnoutColor = computed(() => { const b = wbData.value.burnout; return b === 'high' ? 'var(--red)' : b === 'moderate' ? 'var(--amber)' : 'var(--green)' })
const burnoutLabel = computed(() => { const b = wbData.value.burnout; return b === 'high' ? t('burnoutHigh') + ' 🔴' : b === 'moderate' ? t('burnoutModerate') + ' 🟡' : b === 'low' ? t('burnoutLow') + ' 🟢' : t('burnoutNone') })

const { messages, sending, send: chatSend } = useChat(async (msgs) => {
  const { data } = await coachApi.chat(msgs.map(m => ({ role: m.role, content: m.content })), 'nova')
  return data.content
})

const quickChips = computed(() => {
  if (userRole.value === 'commercial') return [
    'Je n\'atteins pas mes objectifs',
    'Trop de pression sur les chiffres',
    'Comment gérer les refus ?',
    'Mon pipeline est vide',
    'Besoin de motivation'
  ]
  if (userRole.value === 'kam') return [
    'Un compte clé menace de partir',
    'Comment préparer un QBR efficace ?',
    'Trop de comptes à gérer',
    'Négociation de renouvellement difficile',
    'Comment identifier l\'upsell ?'
  ]
  return [t('wbStressed'), t('wbExhausted'), t('wbTooManyAccounts'), t('wbManagerConflict'), t('wbDoubt')]
})

async function sendNova(text) {
  const msg = typeof text === 'string' ? text.trim() : novaInput.value.trim()
  if (!msg || sending.value) return
  novaInput.value = ''
  await chatSend(msg)
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(() => messages.value.length, async () => { await nextTick(); bottomRef.value?.scrollIntoView({ behavior: 'smooth' }) })
</script>

<style scoped>
.wb { padding: 24px 28px; max-width: 800px; margin: 0 auto; overflow-y: auto; height: 100%; font-family: 'DM Sans', sans-serif; }

/* Hero */
.wb-hero { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.wb-hero-left { display: flex; align-items: center; gap: 12px; }
.wb-hero-icon { width: 48px; height: 48px; background: var(--green); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.wb-title { font-size: 22px; font-weight: 900; letter-spacing: -.5px; }
.wb-subtitle { font-size: 11px; color: var(--muted); }
.wb-hero-score { position: relative; width: 70px; height: 70px; }
.wb-ring { width: 100%; height: 100%; }
.wb-ring-fill { transition: stroke-dashoffset .6s ease; }
.wb-ring-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; }

/* Mood check-in */
.wb-mood-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px 20px; margin-bottom: 16px; text-align: center; }
.wb-mood-label { font-size: 14px; font-weight: 700; color: var(--text); display: block; margin-bottom: 12px; }
.wb-mood-emojis { display: flex; justify-content: center; gap: 8px; }
.wb-mood-btn { border: 1px solid var(--border); background: var(--surface); border-radius: 12px; padding: 10px 14px; cursor: pointer; transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 70px; }
.wb-mood-btn:hover { border-color: var(--green); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.wb-mood-btn--on { border-color: var(--green); background: var(--greenBg); transform: scale(1.05); box-shadow: 0 4px 12px rgba(52,168,83,.2); }
.wb-mood-emoji { font-size: 28px; }
.wb-mood-text { font-size: 10px; font-weight: 600; color: var(--muted); }

/* Metrics */
.wb-metrics { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.wb-metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; }
.wb-metric-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--muted); }
.wb-metric-val { font-size: 15px; font-weight: 900; }
.wb-slider { width: 100%; margin-top: 8px; accent-color: var(--green); cursor: pointer; }
.wb-charge-bar { height: 6px; background: rgba(0,0,0,.04); border-radius: 3px; overflow: hidden; margin-top: 8px; }
.wb-charge-fill { height: 100%; border-radius: 3px; transition: width .4s; }

/* Section */
.wb-section { margin-bottom: 24px; }
.wb-section-title { font-size: 16px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

/* Team grid */
.wb-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.wb-member-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; transition: all .12s; }
.wb-member-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.wb-member-card--alert { border-left: 3px solid var(--red); }
.wb-member-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.wb-member-avatar { width: 32px; height: 32px; border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
.wb-member-info { flex: 1; }
.wb-member-name { font-size: 13px; font-weight: 800; }
.wb-member-meta { font-size: 10px; color: var(--muted); }
.wb-member-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; }
.wb-member-bar { height: 4px; background: rgba(0,0,0,.04); border-radius: 2px; overflow: hidden; }
.wb-member-fill { height: 100%; border-radius: 2px; transition: width .3s; }

/* Chat */
.wb-chat { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
.wb-chat-messages { max-height: 300px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.wb-msg { display: flex; gap: 8px; align-items: flex-end; }
.wb-msg--user { justify-content: flex-end; }
.wb-msg-avatar { width: 28px; height: 28px; border-radius: 10px; background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.wb-msg-bubble { max-width: 75%; background: var(--bg); border: 1px solid var(--border); border-radius: 14px 14px 14px 4px; padding: 10px 14px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
.wb-msg-bubble--user { background: var(--tealBg); border-color: var(--tealBorder); border-radius: 14px 14px 4px 14px; }
.wb-typing { display: flex; gap: 4px; padding: 12px 16px; }
.wb-typing span { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: wb-bounce .6s infinite alternate; }
.wb-typing span:nth-child(2) { animation-delay: .2s; }
.wb-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes wb-bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }
.wb-chat-chips { padding: 8px 16px; display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid var(--border); }
.wb-chip { font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--bg); border: 1px solid var(--border); color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.wb-chip:hover { border-color: var(--green); color: var(--green); }
.wb-chat-input { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
.wb-input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; font-size: 13px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; }
.wb-input:focus { border-color: var(--green); }
.wb-send { padding: 10px 18px; border-radius: 12px; background: var(--green); color: #fff; font-size: 16px; border: none; cursor: pointer; transition: opacity .12s; }
.wb-send:disabled { opacity: .4; }

/* Helplines */
.wb-helplines { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.wb-helpline { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: var(--text); }

/* Tip card */
.wb-tip-card { border: 1px solid; border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; }
.wb-tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.wb-tip-icon { font-size: 20px; }
.wb-tip-label { font-size: 12px; font-weight: 700; color: var(--green); flex: 1; }
.wb-tip-refresh { border: none; background: none; font-size: 16px; cursor: pointer; color: var(--green); transition: transform .2s; }
.wb-tip-refresh:hover { transform: rotate(180deg); }
.wb-tip-text { font-size: 14px; color: var(--text); line-height: 1.6; font-weight: 500; }

/* Mood history */
.wb-mood-history { display: flex; gap: 8px; justify-content: center; }
.wb-mood-day { display: flex; flex-direction: column; align-items: center; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 16px; min-width: 60px; }
.wb-mood-day-emoji { font-size: 24px; }
.wb-mood-day-label { font-size: 10px; font-weight: 600; color: var(--muted); }

/* Encouragements */
.wb-encouragements { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.wb-enc-btn { display: flex; align-items: center; gap: 6px; border: 1px solid var(--border); background: var(--surface); border-radius: 12px; padding: 10px 16px; cursor: pointer; transition: all .15s; flex: 1; min-width: 150px; font-family: 'DM Sans', sans-serif; }
.wb-enc-btn:hover { border-color: var(--green); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(52,168,83,.12); }
.wb-enc-emoji { font-size: 20px; }
.wb-enc-text { font-size: 12px; font-weight: 600; color: var(--text); }

/* Toast */
.wb-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600; opacity: 0; transition: all .3s; pointer-events: none; z-index: 999; box-shadow: 0 8px 24px rgba(0,0,0,.2); }
.wb-toast--show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
