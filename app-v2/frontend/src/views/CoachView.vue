<template>
  <div class="coach-view">
    <div class="coach-header">
      <div><h1>🤖 {{ t('coach_title') }}</h1></div>
      <span class="coach-counter">{{ messages.length }}/50 {{ t('coach_counter') }}</span>
    </div>

    <div class="coach-chat">
      <div class="chat-messages" ref="chatRef">
        <div v-if="!messages.length" class="chat-welcome">
          <div class="cw-avatar">🤖</div>
          <div class="cw-body">
            <p>{{ t('coach_welcome') }}</p>
            <ul class="cw-caps">
              <li v-for="i in 6" :key="i"><span class="cw-bullet">✦</span> {{ t('coach_cap' + i) }}</li>
            </ul>
          </div>
        </div>

        <div v-for="msg in messages" :key="msg.id" class="chat-msg" :class="msg.role">
          <div class="msg-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
          <div class="msg-body">
            <div class="msg-text" v-html="formatMsg(msg.content)" />
            <span class="msg-time">{{ msg.time }}</span>
          </div>
        </div>

        <div v-if="thinking" class="chat-msg assistant">
          <div class="msg-avatar">🤖</div>
          <div class="msg-body">
            <div class="msg-thinking"><span /><span /><span /></div>
          </div>
        </div>
      </div>

      <div v-if="!messages.length" class="chat-suggestions">
        <button v-for="s in suggestions" :key="s" class="sug-btn" @click="sendMessage(t(s))">{{ t(s) }}</button>
      </div>

      <div class="chat-input-area">
        <input v-model="input" :placeholder="t('coach_placeholder')" @keydown.enter="sendMessage(input)" :disabled="thinking" />
        <button class="send-btn" @click="sendMessage(input)" :disabled="!input.trim() || thinking">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'

const { t } = useI18n({ useScope: 'global' })
const clientStore = useClientStore()
const teamStore = useTeamStore()

function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

const input = ref('')
const messages = ref(load('scalyo_coach_messages', []))
const thinking = ref(false)
const chatRef = ref(null)

watch(messages, val => save('scalyo_coach_messages', val), { deep: true })

const suggestions = ['coach_sug1', 'coach_sug2', 'coach_sug3', 'coach_sug4', 'coach_sug5']
const mockResponseKeys = ['coach_mock1', 'coach_mock2', 'coach_mock3']

function formatMsg(text) {
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function buildContext() {
  const c = clientStore
  return `Portfolio: ${c.clients.length} clients, ARR total: ${c.totalArr}€, Health moyen: ${c.avgHealth}/10, Critiques: ${c.criticalCount}, NPS moyen: ${c.avgNps}. Equipe: ${teamStore.members.length} CSMs, Score sante: ${teamStore.teamHealthScore}/100.`
}

async function sendMessage(text) {
  if (!text?.trim() || thinking.value) return
  const userMsg = { id: Date.now(), role: 'user', content: text.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  messages.value.push(userMsg)
  input.value = ''
  thinking.value = true
  await nextTick()
  scrollBottom()

  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'REMPLACER_PAR_CLE_ANTHROPIC') {
      await new Promise(r => setTimeout(r, 1200))
      const responseKey = mockResponseKeys[messages.value.length % mockResponseKeys.length]
      messages.value.push({ id: Date.now() + 1, role: 'assistant', content: t(responseKey), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    } else {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context: buildContext(),
          history: messages.value.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      messages.value.push({ id: Date.now() + 1, role: 'assistant', content: data.response || data.error || t('coach_error'), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    }
  } catch {
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: t('coach_error'), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
  }

  thinking.value = false
  await nextTick()
  scrollBottom()
}

function scrollBottom() {
  if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
}
</script>

<style scoped>
.coach-view { max-width: 800px; height: calc(100vh - var(--topbar-height) - 48px); display: flex; flex-direction: column; }
.coach-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
.coach-header h1 { font-size: 1.5rem; font-weight: 800; }
.coach-counter { font-size: 0.82rem; color: var(--text-muted); background: var(--bg); padding: 6px 14px; border-radius: 8px; }
.coach-chat { flex: 1; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.chat-welcome { display: flex; gap: 14px; padding: 20px; background: var(--purple-bg); border-radius: var(--radius-md); }
.cw-avatar { font-size: 2rem; flex-shrink: 0; }
.cw-body p { font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; }
.cw-caps { display: flex; flex-direction: column; gap: 6px; }
.cw-caps li { font-size: 0.82rem; display: flex; align-items: center; gap: 8px; }
.cw-bullet { color: var(--purple); font-size: 0.7rem; }
.chat-msg { display: flex; gap: 10px; max-width: 85%; }
.chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
.msg-avatar { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
.msg-text { padding: 12px 16px; border-radius: 16px; font-size: 0.88rem; line-height: 1.6; }
.chat-msg.user .msg-text { background: var(--purple); color: #fff; border-bottom-right-radius: 4px; }
.chat-msg.assistant .msg-text { background: var(--bg); color: var(--text); border-bottom-left-radius: 4px; }
.msg-time { font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; display: block; }
.chat-msg.user .msg-time { text-align: right; }
.msg-thinking { display: flex; gap: 4px; padding: 12px 16px; background: var(--bg); border-radius: 16px; border-bottom-left-radius: 4px; }
.msg-thinking span { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; animation: think-bounce 1.4s infinite; }
.msg-thinking span:nth-child(2) { animation-delay: 0.2s; }
.msg-thinking span:nth-child(3) { animation-delay: 0.4s; }
@keyframes think-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
.chat-suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border-light); }
.sug-btn { background: var(--purple-bg); border: 1px solid var(--purple-border); color: var(--purple); padding: 8px 16px; border-radius: 999px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.sug-btn:hover { background: var(--purple); color: #fff; }
.chat-input-area { display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--border-light); }
.chat-input-area input { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.88rem; outline: none; }
.chat-input-area input:focus { border-color: var(--purple); }
.send-btn { background: var(--purple); color: #fff; border: none; border-radius: var(--radius-sm); padding: 10px 18px; font-size: 1.1rem; cursor: pointer; transition: all 0.15s; }
.send-btn:hover:not(:disabled) { background: var(--purple-dark); }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
